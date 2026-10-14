/**
 * FarmEquip Authentication & Session Service
 * Role-Based Access Control: Farmer, Equipment Owner, Administrator
 */

class AuthService {
  constructor() {
    this.currentUser = null;
    this.init();
  }

  init() {
    try {
      const stored = localStorage.getItem('farmequip_user');
      if (stored) {
        this.currentUser = JSON.parse(stored);
      }
    } catch (e) {
      this.currentUser = null;
    }
    this.updateNavUI();
  }

  getUser() {
    return this.currentUser;
  }

  setUser(user, token) {
    this.currentUser = user;
    if (user) {
      localStorage.setItem('farmequip_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('farmequip_user');
    }
    if (token) {
      window.api.setToken(token);
    }
    this.updateNavUI();
  }

  isAuthenticated() {
    return !!window.api.getToken() && !!this.currentUser;
  }

  hasRole(role) {
    if (!this.currentUser) return false;
    return this.currentUser.role === role;
  }

  async login(username, password) {
    try {
      const payload = { username, password };
      const res = await window.api.post('/auth/login', payload);
      this.setUser(res.user, res.access_token);
      if (window.notify) window.notify.showToast(`Welcome back, ${res.user.full_name}!`, 'success');
      return res;
    } catch (err) {
      throw err;
    }
  }

  async register(registrationData) {
    try {
      const res = await window.api.post('/auth/register', registrationData);
      this.setUser(res.user, res.access_token);
      if (window.notify) window.notify.showToast('Account created successfully!', 'success');
      return res;
    } catch (err) {
      throw err;
    }
  }

  logout() {
    this.setUser(null);
    window.api.setToken(null);
    if (window.notify) window.notify.showToast('You have been logged out.', 'info');
    setTimeout(() => {
      window.location.href = '/index.html';
    }, 600);
  }

  getDashboardUrl() {
    if (!this.currentUser) return '/pages/login.html';
    if (this.currentUser.role === 'admin') return '/pages/admin-dashboard.html';
    if (this.currentUser.role === 'equipment_owner') return '/pages/owner-dashboard.html';
    return '/pages/farmer-dashboard.html';
  }

  updateNavUI() {
    const authActions = document.getElementById('navAuthActions');
    if (!authActions) return;

    if (this.isAuthenticated()) {
      const user = this.currentUser;
      const initial = (user.full_name || 'U').charAt(0).toUpperCase();
      const roleLabel = user.role === 'admin' ? 'Admin' : (user.role === 'equipment_owner' ? 'Owner' : 'Farmer');
      const dashUrl = this.getDashboardUrl();

      authActions.innerHTML = `
        <div style="display:flex; align-items:center; gap: 0.75rem;">
          <a href="${dashUrl}" class="btn btn-secondary btn-sm" style="display:inline-flex; align-items:center; gap:0.35rem;">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
            <span data-i18n="nav_dashboard">Dashboard</span>
          </a>
          <div class="user-menu">
            <button class="user-avatar-btn" id="userMenuToggle" title="${user.full_name} (${roleLabel})">
              <span class="user-avatar-circle">${initial}</span>
              <span style="max-width: 110px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${user.full_name}</span>
            </button>
            <div class="lang-menu" id="userDropdownMenu" style="right:0; width:180px;">
              <div style="padding:0.5rem 0.75rem; border-bottom:1px solid var(--color-grey-lighter); font-size:0.75rem; color:var(--color-grey);">
                Signed in as<br><strong style="color:var(--color-forest);">${roleLabel}</strong>
              </div>
              <a href="${dashUrl}" class="lang-option" style="text-decoration:none;">My Dashboard</a>
              <button class="lang-option" onclick="window.auth.logout()" style="color:var(--color-danger);">
                Sign Out
              </button>
            </div>
          </div>
        </div>
      `;

      const userBtn = document.getElementById('userMenuToggle');
      const userDrop = document.getElementById('userDropdownMenu');
      if (userBtn && userDrop) {
        userBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          userDrop.classList.toggle('show');
        });
        document.addEventListener('click', () => userDrop.classList.remove('show'));
      }
    } else {
      authActions.innerHTML = `
        <a href="/pages/login.html" class="btn btn-outline btn-sm" data-i18n="nav_login">Login</a>
        <a href="/pages/register.html" class="btn btn-forest btn-sm" data-i18n="nav_register">Register</a>
        <a href="/pages/marketplace.html" class="btn btn-primary btn-sm" data-i18n="nav_rent_cta">Rent Equipment</a>
      `;
    }

    if (window.i18n) window.i18n.applyTranslations();
  }

  protectRoute(requiredRole = null) {
    if (!this.isAuthenticated()) {
      window.location.href = `/pages/login.html?redirect=${encodeURIComponent(window.location.pathname)}`;
      return false;
    }
    if (requiredRole && !this.hasRole(requiredRole) && !this.hasRole('admin')) {
      if (window.notify) window.notify.showToast('You do not have permission to access this portal.', 'error');
      window.location.href = this.getDashboardUrl();
      return false;
    }
    return true;
  }
}

window.auth = new AuthService();
