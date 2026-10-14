/**
 * FarmEquip Farmer Dashboard Controller
 * Bookings tracking, active rental inspection, deposit refund requests
 */

let myBookings = [];
let activeReturnBookingId = null;

const MOCK_FARMER_BOOKINGS = [
  {
    id: 101,
    equipment_title: "DJI Agras T40 Agricultural Drone",
    equipment_id: 1,
    start_date: "2026-10-14",
    end_date: "2026-10-15",
    work_quantity: 3,
    billing_unit: "acre",
    needs_operator: true,
    rental_amount: 1050,
    operator_fee: 500,
    delivery_fee: 350,
    deposit_amount: 2000,
    total_amount: 3900,
    status: "RENTED", // AVAILABLE -> REQUESTED -> CONFIRMED -> HANDED OVER -> RENTED -> RETURN REQUESTED -> INSPECTED -> COMPLETED
    deposit_status: "HELD_ESCROW",
    created_at: "2026-10-13T10:30:00"
  },
  {
    id: 102,
    equipment_title: "Mahindra 575 DI 4WD Tractor + Rotavator",
    equipment_id: 2,
    start_date: "2026-10-20",
    end_date: "2026-10-22",
    work_quantity: 2,
    billing_unit: "day",
    needs_operator: false,
    rental_amount: 5600,
    operator_fee: 0,
    delivery_fee: 350,
    deposit_amount: 3000,
    total_amount: 8950,
    status: "CONFIRMED",
    deposit_status: "HELD_ESCROW",
    created_at: "2026-10-12T14:15:00"
  },
  {
    id: 95,
    equipment_title: "National Laser Guided Land Leveler",
    equipment_id: 5,
    start_date: "2026-09-28",
    end_date: "2026-09-29",
    work_quantity: 4,
    billing_unit: "acre",
    needs_operator: true,
    rental_amount: 3400,
    operator_fee: 500,
    delivery_fee: 0,
    deposit_amount: 3500,
    total_amount: 7400,
    status: "COMPLETED",
    deposit_status: "REFUNDED",
    created_at: "2026-09-25T09:00:00"
  }
];

document.addEventListener('DOMContentLoaded', () => {
  // Check auth
  if (window.auth && !window.auth.isAuthenticated()) {
    // Provide nice demo session if visiting directly
    const demoFarmer = {
      id: 1,
      full_name: "K. Venkat Rao",
      phone_number: "9876543210",
      email: "venkat@farmequip.in",
      role: "farmer",
      village: "Dharmasagar",
      district: "Warangal",
      state: "Telangana"
    };
    window.auth.setUser(demoFarmer, 'mock-farmer-token');
  }

  loadFarmerProfile();
  loadFarmerBookings();
});

function loadFarmerProfile() {
  const user = window.auth ? window.auth.getUser() : null;
  if (!user) return;

  const nameEl = document.getElementById('farmerDisplayName');
  const avatarEl = document.getElementById('farmerAvatar');

  if (nameEl) nameEl.textContent = user.full_name || 'Farmer';
  if (avatarEl) {
    const initials = (user.full_name || 'F').split(' ').map(n => n[0]).join('').toUpperCase();
    avatarEl.textContent = initials.slice(0, 2);
  }
}

async function loadFarmerBookings() {
  try {
    if (window.api && window.auth && window.auth.isAuthenticated()) {
      const data = await window.api.get('/bookings/my-bookings', { silent: true });
      if (Array.isArray(data) && data.length > 0) {
        myBookings = data;
      }
    }
  } catch (e) {
    // Backend offline / loading
  }

  if (myBookings.length === 0) {
    myBookings = MOCK_FARMER_BOOKINGS;
  }

  renderFarmerBookings();
  updateSummaryMetrics();
}

function updateSummaryMetrics() {
  const activeCount = myBookings.filter(b => b.status === 'RENTED' || b.status === 'HANDED_OVER').length;
  const upcomingCount = myBookings.filter(b => b.status === 'REQUESTED' || b.status === 'CONFIRMED').length;
  const completedCount = myBookings.filter(b => b.status === 'COMPLETED').length;
  const totalExpenditure = myBookings.reduce((sum, b) => sum + (b.total_amount || 0), 0);

  document.getElementById('statActiveRentals').textContent = activeCount;
  document.getElementById('statUpcomingBookings').textContent = upcomingCount;
  document.getElementById('statCompletedRentals').textContent = completedCount;
  document.getElementById('statTotalExpenditure').textContent = `₹${totalExpenditure.toLocaleString('en-IN')}`;
}

function renderFarmerBookings() {
  const tbody = document.getElementById('farmerBookingsTableBody');
  if (!tbody) return;

  tbody.innerHTML = myBookings.map(b => {
    let statusBadge = '';
    let actionBtn = '';

    switch (b.status) {
      case 'REQUESTED':
        statusBadge = `<span class="badge badge-warning">Requested</span>`;
        actionBtn = `<button class="btn btn-sm btn-secondary" onclick="cancelBooking(${b.id})">Cancel</button>`;
        break;
      case 'CONFIRMED':
        statusBadge = `<span class="badge badge-info">Confirmed</span>`;
        actionBtn = `<span style="font-size:0.75rem; color:var(--color-grey);">Ready for Handover</span>`;
        break;
      case 'HANDED_OVER':
      case 'RENTED':
        statusBadge = `<span class="badge badge-success">In Field / Rented</span>`;
        actionBtn = `<button class="btn btn-sm btn-primary" onclick="openReturnModal(${b.id})">Request Return</button>`;
        break;
      case 'RETURN_REQUESTED':
        statusBadge = `<span class="badge badge-warning">Return Pending</span>`;
        actionBtn = `<span style="font-size:0.75rem; color:var(--color-primary);">Owner Inspecting</span>`;
        break;
      case 'INSPECTED':
      case 'COMPLETED':
        statusBadge = `<span class="badge badge-forest">Completed</span>`;
        actionBtn = `<span style="font-size:0.75rem; color:var(--color-forest);">✓ Deposit Released</span>`;
        break;
      default:
        statusBadge = `<span class="badge badge-demo">${b.status}</span>`;
        actionBtn = `-`;
    }

    const depositBadge = b.deposit_status === 'REFUNDED' 
      ? `<span class="badge badge-success">Refunded</span>` 
      : `<span class="badge badge-warning">In Escrow (₹${b.deposit_amount})</span>`;

    return `
      <tr>
        <td><code>#BK-${b.id}</code></td>
        <td>
          <strong style="color:var(--color-forest);">${b.equipment_title}</strong>
        </td>
        <td style="font-size:0.8rem;">${b.start_date} to ${b.end_date}</td>
        <td>${b.needs_operator ? '👨‍🌾 Included' : 'Self Operated'}</td>
        <td><strong>₹${b.total_amount.toLocaleString('en-IN')}</strong></td>
        <td>${depositBadge}</td>
        <td>${statusBadge}</td>
        <td>${actionBtn}</td>
      </tr>
    `;
  }).join('');
}

function switchFarmerTab(tab, el) {
  document.querySelectorAll('.sidebar-link').forEach(link => link.classList.remove('active'));
  if (el) el.classList.add('active');

  const tabOverview = document.getElementById('tab-overview');
  const tabBookings = document.getElementById('tab-bookings');
  const tabPayments = document.getElementById('tab-payments');

  if (tab === 'overview') {
    tabOverview.style.display = 'block';
    tabBookings.style.display = 'block';
    tabPayments.style.display = 'none';
  } else if (tab === 'bookings') {
    tabOverview.style.display = 'none';
    tabBookings.style.display = 'block';
    tabPayments.style.display = 'none';
  } else if (tab === 'payments') {
    tabOverview.style.display = 'none';
    tabBookings.style.display = 'none';
    tabPayments.style.display = 'block';
  } else if (tab === 'active') {
    tabOverview.style.display = 'block';
    tabBookings.style.display = 'none';
    tabPayments.style.display = 'none';
  }
}

function openReturnModal(bookingId) {
  activeReturnBookingId = bookingId;
  const modal = document.getElementById('returnInspectionModal');
  if (modal) modal.classList.add('active');
}

function closeReturnModal() {
  const modal = document.getElementById('returnInspectionModal');
  if (modal) modal.classList.remove('active');
}

function simulatePhotoUpload() {
  if (window.notify) window.notify.showToast('Inspection photo captured and attached to return record.', 'info');
  const container = document.getElementById('returnPhotoPreviews');
  if (container) {
    const img = document.createElement('img');
    img.className = 'photo-preview-thumb';
    img.src = 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=200&q=80';
    container.appendChild(img);
  }
}

async function submitReturnInspection() {
  const btn = document.getElementById('submitReturnInspectionBtn');
  btn.disabled = true;
  btn.textContent = 'Submitting inspection...';

  const notes = document.getElementById('returnNotes').value;
  const payload = {
    booking_id: activeReturnBookingId,
    checklist_clean: document.getElementById('checkClean').checked,
    checklist_damage_free: document.getElementById('checkDamage').checked,
    checklist_fuel_matched: document.getElementById('checkFuel').checked,
    checklist_accessories_intact: document.getElementById('checkAccessories').checked,
    notes: notes || "Equipment returned in good condition. All attachments verified.",
    photos: ["return_photo_front.jpg", "return_photo_hourmeter.jpg"]
  };

  try {
    if (window.api) {
      await window.api.post('/inspections/return', payload);
    }
  } catch (e) {
    // Local simulation fallback
  }

  // Update local state
  const booking = myBookings.find(b => b.id === activeReturnBookingId);
  if (booking) {
    booking.status = 'RETURN_REQUESTED';
  }

  if (window.notify) {
    window.notify.showToast('Return inspection submitted! Owner notified to sign-off deposit release.', 'success', 5000);
  }

  closeReturnModal();
  renderFarmerBookings();
  updateSummaryMetrics();

  btn.disabled = false;
  btn.textContent = 'Sign-Off & Request Deposit Release';
}

async function cancelBooking(id) {
  if (!confirm('Are you sure you want to cancel this booking?')) return;
  try {
    if (window.api) {
      await window.api.post(`/bookings/${id}/cancel`);
    }
  } catch (e) {}

  const booking = myBookings.find(b => b.id === id);
  if (booking) booking.status = 'CANCELLED';

  if (window.notify) window.notify.showToast('Booking cancelled.', 'info');
  renderFarmerBookings();
  updateSummaryMetrics();
}
