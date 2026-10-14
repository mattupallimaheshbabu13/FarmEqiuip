/**
 * FarmEquip Notification & Toast System
 * Real-time feedback, in-app notifications drawer, alert banners
 */

class NotificationService {
  constructor() {
    this.container = null;
    this.drawer = null;
    this.backdrop = null;
    this.unreadBadge = null;
    this.notifications = [];
    this.init();
  }

  init() {
    // Ensure toast container exists
    let container = document.getElementById('toastContainer');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toastContainer';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }
    this.container = container;

    // Hook notification drawer toggle
    const bellBtn = document.getElementById('notifBellBtn');
    this.drawer = document.getElementById('notifDrawer');
    this.backdrop = document.getElementById('notifBackdrop');
    this.unreadBadge = document.getElementById('notifUnreadBadge');

    if (bellBtn && this.drawer && this.backdrop) {
      bellBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.openDrawer();
      });
      this.backdrop.addEventListener('click', () => this.closeDrawer());
      const closeBtn = document.getElementById('closeNotifDrawer');
      if (closeBtn) closeBtn.addEventListener('click', () => this.closeDrawer());
    }
  }

  showToast(message, type = 'info', duration = 4000) {
    if (!this.container) this.init();

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    // Icon based on type
    let iconSvg = '';
    if (type === 'success') {
      iconSvg = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>`;
    } else if (type === 'error') {
      iconSvg = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`;
    } else {
      iconSvg = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`;
    }

    toast.innerHTML = `
      <div class="toast-icon">${iconSvg}</div>
      <div class="toast-msg" style="flex:1;">${message}</div>
      <button style="background:none;border:none;color:white;cursor:pointer;opacity:0.7;" onclick="this.parentElement.remove()">✕</button>
    `;

    this.container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }

  openDrawer() {
    if (this.drawer && this.backdrop) {
      this.drawer.classList.add('active');
      this.backdrop.classList.add('active');
      this.loadNotifications();
    }
  }

  closeDrawer() {
    if (this.drawer && this.backdrop) {
      this.drawer.classList.remove('active');
      this.backdrop.classList.remove('active');
    }
  }

  async loadNotifications() {
    const listEl = document.getElementById('notifList');
    if (!listEl) return;

    if (window.api && window.auth && window.auth.isAuthenticated()) {
      try {
        const notifs = await window.api.get('/notifications');
        this.notifications = notifs || [];
        this.renderNotifications();
      } catch (e) {
        this.renderMockNotifications();
      }
    } else {
      this.renderMockNotifications();
    }
  }

  renderNotifications() {
    const listEl = document.getElementById('notifList');
    if (!listEl) return;

    if (this.notifications.length === 0) {
      listEl.innerHTML = `
        <div style="padding: 2rem; text-align: center; color: var(--color-grey);">
          <p>No notifications yet.</p>
        </div>
      `;
      if (this.unreadBadge) this.unreadBadge.style.display = 'none';
      return;
    }

    const unreadCount = this.notifications.filter(n => !n.is_read).length;
    if (this.unreadBadge) {
      if (unreadCount > 0) {
        this.unreadBadge.textContent = unreadCount;
        this.unreadBadge.style.display = 'inline-block';
      } else {
        this.unreadBadge.style.display = 'none';
      }
    }

    listEl.innerHTML = this.notifications.map(n => `
      <div class="notif-item ${n.is_read ? '' : 'unread'}" onclick="window.notify.markRead(${n.id})">
        <div style="display:flex; justify-content:space-between; margin-bottom: 4px;">
          <strong style="font-size: 0.85rem; color: var(--color-forest);">${n.title}</strong>
          <span style="font-size: 0.75rem; color: var(--color-grey);">${new Date(n.created_at || Date.now()).toLocaleDateString()}</span>
        </div>
        <p style="font-size: 0.8rem; color: var(--color-charcoal); margin:0;">${n.message}</p>
      </div>
    `).join('');
  }

  renderMockNotifications() {
    this.notifications = [
      { id: 1, title: 'Welcome to FarmEquip!', message: 'Explore farm equipment near your village and compare rental rates.', is_read: false, created_at: new Date() },
      { id: 2, title: 'Safety Verification Active', message: 'All bookings include escrow refundable deposit protection.', is_read: true, created_at: new Date(Date.now() - 86400000) }
    ];
    this.renderNotifications();
  }

  async markRead(id) {
    const notif = this.notifications.find(n => n.id === id);
    if (notif) notif.is_read = true;
    this.renderNotifications();
    if (window.api && window.auth && window.auth.isAuthenticated()) {
      try {
        await window.api.post(`/notifications/${id}/read`);
      } catch (err) {}
    }
  }
}

window.notify = new NotificationService();
