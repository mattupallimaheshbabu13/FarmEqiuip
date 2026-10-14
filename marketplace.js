/**
 * FarmEquip Marketplace Controller
 * Dynamic filtering, keyword search, price range, operator toggling & sorting
 */

let allEquipment = [];
let filteredEquipment = [];

const FULL_CATALOGUE = [
  {
    id: 1,
    title: "DJI Agras T40 Agricultural Drone",
    brand: "DJI",
    model: "Agras T40 (50kg payload)",
    category: "drones",
    hourly_rate: 650,
    daily_rate: 4500,
    acre_rate: 350,
    billing_unit: "acre",
    location: "Warangal, Telangana",
    pin_code: "506001",
    distance_km: 4.2,
    rating: 4.9,
    reviews_count: 28,
    is_verified: true,
    operator_included: true,
    is_available: true,
    security_deposit: 2000,
    suitable_crops: "Paddy, Cotton, Chili, Maize",
    image_url: "https://images.unsplash.com/photo-1527977966376-1c8408f9f108?auto=format&fit=crop&w=800&q=80",
    is_sample: true
  },
  {
    id: 2,
    title: "Mahindra 575 DI 4WD Tractor + Rotavator",
    brand: "Mahindra",
    model: "575 DI XP Plus (47 HP)",
    category: "tractors",
    hourly_rate: 400,
    daily_rate: 2800,
    acre_rate: 900,
    billing_unit: "day",
    location: "Guntur, Andhra Pradesh",
    pin_code: "522002",
    distance_km: 7.8,
    rating: 4.8,
    reviews_count: 42,
    is_verified: true,
    operator_included: false,
    is_available: true,
    security_deposit: 3000,
    suitable_crops: "All Crops / Field Preparation",
    image_url: "https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=800&q=80",
    is_sample: true
  },
  {
    id: 3,
    title: "Preet 987 Self-Propelled Combine Harvester",
    brand: "Preet",
    model: "987 Track Harvester",
    category: "harvesters",
    hourly_rate: 1800,
    daily_rate: 14000,
    acre_rate: 2200,
    billing_unit: "acre",
    location: "Karimnagar, Telangana",
    pin_code: "505001",
    distance_km: 12.0,
    rating: 4.95,
    reviews_count: 35,
    is_verified: true,
    operator_included: true,
    is_available: true,
    security_deposit: 5000,
    suitable_crops: "Paddy, Wheat, Soybean",
    image_url: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80",
    is_sample: true
  },
  {
    id: 4,
    title: "Kubota PEM140DI Power Tiller",
    brand: "Kubota",
    model: "PEM 140 DI (14 HP)",
    category: "tillers",
    hourly_rate: 250,
    daily_rate: 1500,
    acre_rate: 600,
    billing_unit: "day",
    location: "Khammam, Telangana",
    pin_code: "507001",
    distance_km: 9.1,
    rating: 4.7,
    reviews_count: 19,
    is_verified: true,
    operator_included: false,
    is_available: true,
    security_deposit: 2000,
    suitable_crops: "Wetland Paddy, Vegetables, Mango Orchards",
    image_url: "https://images.unsplash.com/photo-1594771804886-a933bb2d609b?auto=format&fit=crop&w=800&q=80",
    is_sample: true
  },
  {
    id: 5,
    title: "National Laser Guided Land Leveler",
    brand: "National Agro",
    model: "ProLaser LL-7",
    category: "tractors",
    hourly_rate: 600,
    daily_rate: 4200,
    acre_rate: 850,
    billing_unit: "acre",
    location: "Nizamabad, Telangana",
    pin_code: "503001",
    distance_km: 14.5,
    rating: 4.88,
    reviews_count: 24,
    is_verified: true,
    operator_included: true,
    is_available: true,
    security_deposit: 3500,
    suitable_crops: "Water saving field leveling",
    image_url: "https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&w=800&q=80",
    is_sample: true
  },
  {
    id: 6,
    title: "Aspee HTP Tractor-Mounted Boom Sprayer (500L)",
    brand: "Aspee",
    model: "HTP 500L Boom 24-nozzle",
    category: "sprayers",
    hourly_rate: 300,
    daily_rate: 1800,
    acre_rate: 400,
    billing_unit: "day",
    location: "Krishna District, Andhra Pradesh",
    pin_code: "521001",
    distance_km: 6.4,
    rating: 4.75,
    reviews_count: 31,
    is_verified: true,
    operator_included: false,
    is_available: true,
    security_deposit: 2500,
    suitable_crops: "Cotton, Chili, Sugarcane",
    image_url: "https://images.unsplash.com/photo-1628352081506-83c43123ed6d?auto=format&fit=crop&w=800&q=80",
    is_sample: true
  },
  {
    id: 7,
    title: "Kirloskar 10HP Mobile Diesel Irrigation Pump",
    brand: "Kirloskar",
    model: "Mega-T 10HP High Head",
    category: "pumps",
    hourly_rate: 180,
    daily_rate: 1200,
    acre_rate: 300,
    billing_unit: "day",
    location: "Anantapur, Andhra Pradesh",
    pin_code: "515001",
    distance_km: 11.2,
    rating: 4.65,
    reviews_count: 14,
    is_verified: true,
    operator_included: false,
    is_available: true,
    security_deposit: 1500,
    suitable_crops: "Groundnut, Horticulture, Field Flooding",
    image_url: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80",
    is_sample: true
  },
  {
    id: 8,
    title: "John Deere 5050D Multi-Crop Tractor",
    brand: "John Deere",
    model: "5050 D GearPro (50 HP)",
    category: "tractors",
    hourly_rate: 450,
    daily_rate: 3200,
    acre_rate: 950,
    billing_unit: "day",
    location: "Nellore, Andhra Pradesh",
    pin_code: "524001",
    distance_km: 8.5,
    rating: 4.92,
    reviews_count: 38,
    is_verified: true,
    operator_included: true,
    is_available: true,
    security_deposit: 3500,
    suitable_crops: "Heavy soil plowing, Paddy puddling",
    image_url: "https://images.unsplash.com/photo-1530267981375-f0de937f5f13?auto=format&fit=crop&w=800&q=80",
    is_sample: true
  },
  {
    id: 9,
    title: "Sonalika Multi-Crop High Output Thresher",
    brand: "Sonalika",
    model: "AgroKing Super 100",
    category: "threshers",
    hourly_rate: 550,
    daily_rate: 3800,
    acre_rate: 1200,
    billing_unit: "day",
    location: "Kurnool, Andhra Pradesh",
    pin_code: "518001",
    distance_km: 15.0,
    rating: 4.7,
    reviews_count: 18,
    is_verified: true,
    operator_included: true,
    is_available: true,
    security_deposit: 3000,
    suitable_crops: "Paddy, Bengal Gram, Maize threshing",
    image_url: "https://images.unsplash.com/photo-1605000797499-95a51c5269ae?auto=format&fit=crop&w=800&q=80",
    is_sample: true
  }
];

document.addEventListener('DOMContentLoaded', () => {
  parseUrlParams();
  setupFilterListeners();
  loadEquipmentCatalogue();
});

function parseUrlParams() {
  const urlParams = new URLSearchParams(window.location.search);
  const cat = urlParams.get('category');
  const loc = urlParams.get('location');

  if (cat) {
    const cb = document.querySelector(`input[name="cat"][value="${cat}"]`);
    if (cb) cb.checked = true;
  }
  if (loc) {
    const locInput = document.getElementById('filterLocation');
    if (locInput) locInput.value = loc;
  }
}

function setupFilterListeners() {
  const keywordInput = document.getElementById('filterKeyword');
  const locInput = document.getElementById('filterLocation');
  const catCheckboxes = document.querySelectorAll('input[name="cat"]');
  const operatorRadios = document.querySelectorAll('input[name="operatorReq"]');
  const priceRange = document.getElementById('priceRange');
  const priceDisplay = document.getElementById('priceDisplay');
  const sortSelect = document.getElementById('sortOrder');
  const resetBtn = document.getElementById('resetFiltersBtn');

  if (keywordInput) keywordInput.addEventListener('input', applyFilters);
  if (locInput) locInput.addEventListener('input', applyFilters);
  catCheckboxes.forEach(cb => cb.addEventListener('change', applyFilters));
  operatorRadios.forEach(rb => rb.addEventListener('change', applyFilters));
  
  if (priceRange) {
    priceRange.addEventListener('input', (e) => {
      if (priceDisplay) priceDisplay.textContent = `₹${parseInt(e.target.value).toLocaleString('en-IN')}`;
      applyFilters();
    });
  }

  if (sortSelect) sortSelect.addEventListener('change', applyFilters);
  if (resetBtn) resetBtn.addEventListener('click', resetAllFilters);
}

async function loadEquipmentCatalogue() {
  try {
    if (window.api) {
      const data = await window.api.get('/equipment/', { silent: true });
      if (Array.isArray(data) && data.length > 0) {
        allEquipment = data;
      }
    }
  } catch (e) {
    // API not ready, keep sample
  }

  if (allEquipment.length === 0) {
    allEquipment = FULL_CATALOGUE;
  }

  applyFilters();
}

function applyFilters() {
  const keyword = (document.getElementById('filterKeyword')?.value || '').toLowerCase();
  const location = (document.getElementById('filterLocation')?.value || '').toLowerCase();
  const maxPrice = parseInt(document.getElementById('priceRange')?.value || 25000);
  const sortOrder = document.getElementById('sortOrder')?.value || 'featured';

  const selectedCategories = Array.from(document.querySelectorAll('input[name="cat"]:checked'))
    .map(cb => cb.value);

  const operatorReq = document.querySelector('input[name="operatorReq"]:checked')?.value || 'all';

  filteredEquipment = allEquipment.filter(item => {
    // Keyword match
    if (keyword) {
      const matchText = `${item.title} ${item.brand} ${item.model} ${item.category} ${item.suitable_crops}`.toLowerCase();
      if (!matchText.includes(keyword)) return false;
    }

    // Location / PIN match
    if (location) {
      const matchLoc = `${item.location} ${item.pin_code || ''}`.toLowerCase();
      if (!matchLoc.includes(location)) return false;
    }

    // Category match
    if (selectedCategories.length > 0 && !selectedCategories.includes(item.category)) {
      return false;
    }

    // Operator requirement
    if (operatorReq === 'included' && !item.operator_included) {
      return false;
    }
    if (operatorReq === 'self' && item.operator_included) {
      return false;
    }

    // Price limit
    const basePrice = item.daily_rate || item.hourly_rate * 8 || 1000;
    if (basePrice > maxPrice) {
      return false;
    }

    return true;
  });

  // Sorting
  if (sortOrder === 'price_asc') {
    filteredEquipment.sort((a, b) => (a.daily_rate || 0) - (b.daily_rate || 0));
  } else if (sortOrder === 'price_desc') {
    filteredEquipment.sort((a, b) => (b.daily_rate || 0) - (a.daily_rate || 0));
  } else if (sortOrder === 'rating') {
    filteredEquipment.sort((a, b) => (b.rating || 0) - (a.rating || 0));
  }

  renderResults();
}

function renderResults() {
  const grid = document.getElementById('marketplaceGrid');
  const countEl = document.getElementById('resultsCount');
  const emptyState = document.getElementById('noResultsState');
  if (!grid) return;

  if (countEl) {
    countEl.textContent = `${filteredEquipment.length} Equipment Available`;
  }

  if (filteredEquipment.length === 0) {
    grid.innerHTML = '';
    if (emptyState) emptyState.style.display = 'block';
    return;
  }

  if (emptyState) emptyState.style.display = 'none';

  grid.innerHTML = filteredEquipment.map(item => {
    const unitText = item.billing_unit === 'acre' ? '/ acre' : (item.billing_unit === 'hour' ? '/ hour' : '/ day');
    const price = item.billing_unit === 'acre' ? (item.acre_rate || 800) : (item.billing_unit === 'hour' ? (item.hourly_rate || 400) : item.daily_rate);
    const badgeVerified = item.is_verified 
      ? `<span class="badge badge-verified"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg> Verified</span>` 
      : '';
    const badgeSample = item.is_sample ? `<span class="badge badge-demo">Sample</span>` : '';
    const operatorBadge = item.operator_included 
      ? `<span class="equip-spec-pill" style="background:#eaf4e8; color:#174b35; font-weight:600;">👨‍🌾 Operator Included</span>` 
      : `<span class="equip-spec-pill">Optional Operator</span>`;

    return `
      <div class="equipment-card">
        <div class="equip-image-wrap">
          <img src="${item.image_url}" alt="${item.title}" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=800&q=80'">
          <div class="equip-floating-badges">
            <div style="display:flex; gap:0.25rem;">
              ${badgeVerified}
              ${badgeSample}
            </div>
            <span class="badge ${item.is_available ? 'badge-success' : 'badge-warning'}">
              ${item.is_available ? 'Available' : 'Rented'}
            </span>
          </div>
        </div>

        <div class="equip-body">
          <div class="equip-category-tag">${item.category}</div>
          <h3 class="equip-title">${item.title}</h3>

          <div class="equip-specs-list">
            <span class="equip-spec-pill">${item.brand}</span>
            <span class="equip-spec-pill">${item.model}</span>
            ${operatorBadge}
          </div>

          <div class="equip-location">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            <span>${item.location} • ⭐ ${item.rating || 4.8} (${item.reviews_count || 12})</span>
          </div>

          <div class="equip-footer-bar">
            <div class="equip-price">
              <span class="equip-price-val">₹${price.toLocaleString('en-IN')}</span>
              <span class="equip-price-unit">${unitText} • ₹${item.security_deposit || 1000} deposit</span>
            </div>

            <div class="equip-card-actions">
              <a href="/pages/equipment-detail.html?id=${item.id}" class="btn btn-secondary btn-sm">Details</a>
              <a href="/pages/equipment-detail.html?id=${item.id}&action=book" class="btn btn-primary btn-sm">Book</a>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function resetAllFilters() {
  const kw = document.getElementById('filterKeyword');
  const loc = document.getElementById('filterLocation');
  const pr = document.getElementById('priceRange');
  const pd = document.getElementById('priceDisplay');
  const cbs = document.querySelectorAll('input[name="cat"]');
  const anyOp = document.querySelector('input[name="operatorReq"][value="all"]');

  if (kw) kw.value = '';
  if (loc) loc.value = '';
  if (pr) pr.value = 15000;
  if (pd) pd.textContent = '₹15,000';
  cbs.forEach(cb => cb.checked = false);
  if (anyOp) anyOp.checked = true;

  applyFilters();
}
