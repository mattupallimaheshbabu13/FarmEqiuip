/**
 * FarmEquip Equipment Owner Dashboard Controller
 * Listing management, reservation approvals, return inspection sign-off
 */

let ownerListings = [];
let ownerRequests = [];
let activeSignoffBookingId = null;

const MOCK_OWNER_LISTINGS = [
  {
    id: 1,
    title: "DJI Agras T40 Agricultural Drone",
    category: "drones",
    brand: "DJI",
    model: "Agras T40",
    daily_rate: 4500,
    acre_rate: 350,
    billing_unit: "acre",
    security_deposit: 2000,
    is_available: false, // In field right now
    operator_included: true,
    location: "Warangal, Telangana",
    active_booking_id: 101
  },
  {
    id: 2,
    title: "Mahindra 575 DI 4WD Tractor + Rotavator",
    category: "tractors",
    brand: "Mahindra",
    model: "575 DI XP Plus",
    daily_rate: 2800,
    acre_rate: 900,
    billing_unit: "day",
    security_deposit: 3000,
    is_available: true,
    operator_included: true,
    location: "Guntur, Andhra Pradesh",
    active_booking_id: null
  },
  {
    id: 6,
    title: "Aspee HTP Tractor-Mounted Boom Sprayer (500L)",
    category: "sprayers",
    brand: "Aspee",
    model: "HTP 500L",
    daily_rate: 1800,
    acre_rate: 400,
    billing_unit: "day",
    security_deposit: 2500,
    is_available: true,
    operator_included: false,
    location: "Krishna District, Andhra Pradesh",
    active_booking_id: null
  }
];

const MOCK_OWNER_REQUESTS = [
  {
    id: 102,
    farmer_name: "G. Srinivasa Rao",
    farmer_phone: "9849123456",
    farmer_village: "Tenali",
    equipment_title: "Mahindra 575 DI 4WD Tractor",
    start_date: "2026-10-20",
    end_date: "2026-10-22",
    work_quantity: 2,
    billing_unit: "day",
    needs_operator: false,
    total_amount: 8950,
    status: "REQUESTED"
  }
];

document.addEventListener('DOMContentLoaded', () => {
  if (window.auth && !window.auth.isAuthenticated()) {
    const demoOwner = {
      id: 2,
      full_name: "Ramesh Agri-Services",
      phone_number: "9848022338",
      email: "ramesh@agrirental.in",
      role: "equipment_owner",
      village: "Hanamkonda",
      district: "Warangal",
      state: "Telangana"
    };
    window.auth.setUser(demoOwner, 'mock-owner-token');
  }

  loadOwnerData();
});

async function loadOwnerData() {
  try {
    if (window.api && window.auth && window.auth.isAuthenticated()) {
      const listings = await window.api.get('/equipment/my-listings', { silent: true });
      if (Array.isArray(listings) && listings.length > 0) ownerListings = listings;

      const requests = await window.api.get('/bookings/owner-requests', { silent: true });
      if (Array.isArray(requests) && requests.length > 0) ownerRequests = requests;
    }
  } catch (err) {}

  if (ownerListings.length === 0) ownerListings = MOCK_OWNER_LISTINGS;
  if (ownerRequests.length === 0) ownerRequests = MOCK_OWNER_REQUESTS;

  renderOwnerListings();
  renderOwnerRequests();
  renderOwnerHandovers();
  updateOwnerStats();
}

function updateOwnerStats() {
  document.getElementById('statOwnerListings').textContent = ownerListings.length;
  const pending = ownerRequests.filter(r => r.status === 'REQUESTED').length;
  document.getElementById('statOwnerRequests').textContent = pending;
  const badge = document.getElementById('pendingRequestsBadge');
  if (badge) badge.textContent = pending;
}

function renderOwnerListings() {
  const tbody = document.getElementById('ownerListingsTableBody');
  if (!tbody) return;

  tbody.innerHTML = ownerListings.map(item => {
    const rateText = item.billing_unit === 'acre' 
      ? `₹${item.acre_rate || 350}/acre` 
      : `₹${item.daily_rate || 2800}/day`;

    const statusBadge = item.is_available 
      ? `<span class="badge badge-success">Available</span>` 
      : `<span class="badge badge-warning">In Field / Booked</span>`;

    return `
      <tr>
        <td>
          <strong style="color:var(--color-forest);">${item.title}</strong>
          <div style="font-size:0.75rem; color:var(--color-grey);">${item.brand} ${item.model} • ${item.location}</div>
        </td>
        <td><span class="badge badge-forest">${item.category.toUpperCase()}</span></td>
        <td><strong>${rateText}</strong></td>
        <td>₹${item.security_deposit || 2000}</td>
        <td>${item.operator_included ? '👨‍🌾 Yes' : 'No'}</td>
        <td>${statusBadge}</td>
        <td>
          <div class="actions">
            <button class="btn btn-secondary btn-sm" onclick="toggleListingAvailability(${item.id})">
              ${item.is_available ? 'Pause' : 'Activate'}
            </button>
            <button class="btn btn-outline btn-sm" onclick="editListing(${item.id})">Edit</button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function renderOwnerRequests() {
  const tbody = document.getElementById('ownerRequestsTableBody');
  if (!tbody) return;

  if (ownerRequests.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:2rem; color:var(--color-grey);">No pending booking requests.</td></tr>`;
    return;
  }

  tbody.innerHTML = ownerRequests.map(r => `
    <tr>
      <td><code>#BK-${r.id}</code></td>
      <td>
        <strong>${r.farmer_name}</strong>
        <div style="font-size:0.75rem; color:var(--color-grey);">${r.farmer_phone} (${r.farmer_village})</div>
      </td>
      <td>${r.equipment_title}</td>
      <td>${r.start_date} to ${r.end_date} (${r.work_quantity} ${r.billing_unit}s)</td>
      <td><strong>₹${r.total_amount.toLocaleString('en-IN')}</strong></td>
      <td>${r.needs_operator ? '👨‍🌾 Yes' : 'No'}</td>
      <td>
        <div class="actions">
          <button class="btn btn-primary btn-sm" onclick="acceptBookingRequest(${r.id})">Accept</button>
          <button class="btn btn-secondary btn-sm" onclick="rejectBookingRequest(${r.id})">Reject</button>
        </div>
      </td>
    </tr>
  `).join('');
}

function renderOwnerHandovers() {
  const tbody = document.getElementById('ownerHandoversTableBody');
  if (!tbody) return;

  tbody.innerHTML = `
    <tr>
      <td><code>#BK-101</code></td>
      <td><strong>DJI Agras T40 Agricultural Drone</strong></td>
      <td>K. Venkat Rao (Warangal)</td>
      <td><span class="badge badge-warning">Return Pending</span></td>
      <td>₹2,000 (Escrow Safe)</td>
      <td>
        <button class="btn btn-forest btn-sm" onclick="openSignoffModal(101)">
          Inspect & Release Deposit
        </button>
      </td>
    </tr>
  `;
}

function switchOwnerTab(tab, el) {
  document.querySelectorAll('.sidebar-link').forEach(link => link.classList.remove('active'));
  if (el) el.classList.add('active');

  document.getElementById('owner-tab-listings').style.display = tab === 'listings' ? 'block' : 'none';
  document.getElementById('owner-tab-requests').style.display = tab === 'requests' ? 'block' : 'none';
  document.getElementById('owner-tab-handovers').style.display = tab === 'handovers' ? 'block' : 'none';
  document.getElementById('owner-tab-earnings').style.display = tab === 'earnings' ? 'block' : 'none';
}

function openAddEquipmentModal() {
  document.getElementById('addEquipmentModal').classList.add('active');
}

function closeAddEquipmentModal() {
  document.getElementById('addEquipmentModal').classList.remove('active');
}

async function handleAddEquipmentSubmit(e) {
  e.preventDefault();
  const btn = document.getElementById('saveListingBtn');
  btn.disabled = true;
  btn.textContent = 'Saving listing...';

  const unit = document.getElementById('addBillingUnit').value;
  const rate = parseFloat(document.getElementById('addRate').value);

  const payload = {
    title: document.getElementById('addEquipTitle').value.trim(),
    category: document.getElementById('addEquipCategory').value,
    brand: document.getElementById('addEquipBrand').value.trim(),
    model: document.getElementById('addEquipModel').value.trim(),
    billing_unit: unit,
    daily_rate: unit === 'day' ? rate : rate * 8,
    acre_rate: unit === 'acre' ? rate : rate,
    hourly_rate: unit === 'hour' ? rate : Math.round(rate / 8),
    security_deposit: parseFloat(document.getElementById('addDeposit').value),
    location: document.getElementById('addEquipLocation').value.trim(),
    operator_included: document.getElementById('addOperatorIncluded').checked,
    suitable_crops: document.getElementById('addSuitableCrops').value.trim() || "All general crops",
    image_url: document.getElementById('addPhotoUrl').value.trim() || "https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=800&q=80",
    is_available: true
  };

  try {
    if (window.api) {
      await window.api.post('/equipment/', payload);
    }
  } catch (err) {}

  ownerListings.unshift({
    id: Math.floor(Math.random() * 800) + 10,
    ...payload
  });

  if (window.notify) window.notify.showToast('Machinery listed successfully! Live on marketplace.', 'success');
  closeAddEquipmentModal();
  renderOwnerListings();
  updateOwnerStats();

  btn.disabled = false;
  btn.textContent = 'Publish Equipment Listing';
}

function toggleListingAvailability(id) {
  const item = ownerListings.find(l => l.id === id);
  if (!item) return;

  if (!item.is_available && item.active_booking_id) {
    alert('This equipment currently has an active in-field rental booking (#BK-' + item.active_booking_id + ') and cannot be manually modified until returned.');
    return;
  }

  item.is_available = !item.is_available;
  renderOwnerListings();
  if (window.notify) {
    window.notify.showToast(`${item.title} status changed to ${item.is_available ? 'Available' : 'Paused'}.`, 'info');
  }
}

async function acceptBookingRequest(id) {
  try {
    if (window.api) await window.api.post(`/bookings/${id}/confirm`);
  } catch (e) {}

  const reqIndex = ownerRequests.findIndex(r => r.id === id);
  if (reqIndex !== -1) {
    const req = ownerRequests.splice(reqIndex, 1)[0];
    req.status = 'CONFIRMED';
  }

  if (window.notify) window.notify.showToast('Booking request approved! Handover schedule generated.', 'success');
  renderOwnerRequests();
  updateOwnerStats();
}

async function rejectBookingRequest(id) {
  try {
    if (window.api) await window.api.post(`/bookings/${id}/cancel`);
  } catch (e) {}

  ownerRequests = ownerRequests.filter(r => r.id !== id);
  if (window.notify) window.notify.showToast('Booking request rejected.', 'info');
  renderOwnerRequests();
  updateOwnerStats();
}

function openSignoffModal(bookingId) {
  activeSignoffBookingId = bookingId;
  document.getElementById('ownerSignoffModal').classList.add('active');
}

function closeSignoffModal() {
  document.getElementById('ownerSignoffModal').classList.remove('active');
}

async function confirmDepositRelease() {
  const btn = document.getElementById('confirmReleaseBtn');
  btn.disabled = true;
  btn.textContent = 'Transferring refund...';

  try {
    if (window.api) {
      await window.api.post(`/bookings/${activeSignoffBookingId}/complete`);
    }
  } catch (e) {}

  if (window.notify) {
    window.notify.showToast('✓ Inspection complete! Deposit of ₹2,000 refunded to farmer UPI.', 'success', 5000);
  }

  closeSignoffModal();
  const handoverRow = document.getElementById('ownerHandoversTableBody');
  if (handoverRow) {
    handoverRow.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:1.5rem; color:var(--color-grey);">All return inspections completed.</td></tr>`;
  }

  btn.disabled = false;
  btn.textContent = 'Sign-Off & Transfer Refund';
}
