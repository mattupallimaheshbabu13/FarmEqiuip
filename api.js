/**
 * FarmEquip Unified API Client
 * Secure REST communication, JWT management, and graceful error handling
 */

class ApiClient {
  constructor() {
    this.baseUrl = window.location.origin.includes(':8000') 
      ? '/api/v1' 
      : 'http://127.0.0.1:8000/api/v1';
  }

  getToken() {
    return localStorage.getItem('farmequip_token');
  }

  setToken(token) {
    if (token) {
      localStorage.setItem('farmequip_token', token);
    } else {
      localStorage.removeItem('farmequip_token');
    }
  }

  getHeaders(isFormData = false) {
    const headers = {};
    if (!isFormData) {
      headers['Content-Type'] = 'application/json';
    }
    const token = this.getToken();
    if (token) {
      headers['Authorization'] = 'Be' + 'arer ' + token;
    }
    return headers;
  }

  async request(endpoint, options = {}) {
    const url = endpoint.startsWith('http') ? endpoint : `${this.baseUrl}${endpoint}`;
    const isFormData = options.body instanceof FormData;
    const headers = { ...this.getHeaders(isFormData), ...(options.headers || {}) };

    try {
      const response = await fetch(url, {
        ...options,
        headers
      });

      if (response.status === 401) {
        this.setToken(null);
        localStorage.removeItem('farmequip_user');
        if (window.notify) window.notify.showToast('Session expired. Please log in again.', 'error');
        // If on dashboard, redirect to login
        if (window.location.pathname.includes('dashboard')) {
          setTimeout(() => { window.location.href = '/pages/login.html'; }, 1000);
        }
        throw new Error('Unauthorized');
      }

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch (e) {
          errorData = { detail: response.statusText };
        }
        const errorMsg = errorData.detail || errorData.message || 'An unexpected error occurred.';
        if (window.notify && !options.silent) {
          window.notify.showToast(errorMsg, 'error');
        }
        const err = new Error(errorMsg);
        err.data = errorData;
        err.status = response.status;
        throw err;
      }

      // Handle 204 No Content
      if (response.status === 204) return null;

      return await response.json();
    } catch (err) {
      console.error(`API Error [${options.method || 'GET'} ${endpoint}]:`, err);
      throw err;
    }
  }

  get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'GET' });
  }

  post(endpoint, data, options = {}) {
    const isFormData = data instanceof FormData;
    return this.request(endpoint, {
      ...options,
      method: 'POST',
      body: isFormData ? data : JSON.stringify(data)
    });
  }

  put(endpoint, data, options = {}) {
    const isFormData = data instanceof FormData;
    return this.request(endpoint, {
      ...options,
      method: 'PUT',
      body: isFormData ? data : JSON.stringify(data)
    });
  }

  patch(endpoint, data, options = {}) {
    const isFormData = data instanceof FormData;
    return this.request(endpoint, {
      ...options,
      method: 'PATCH',
      body: isFormData ? data : JSON.stringify(data)
    });
  }

  delete(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'DELETE' });
  }
}

window.api = new ApiClient();
