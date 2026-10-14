/**
 * FarmEquip Homepage Controller
 * Featured listings renderer, FAQ accordion, Mobile menu & Search handler
 */

// High quality curated demonstration data matching Indian farming context
const SAMPLE_EQUIPMENT = [
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
  }
];

document.addEventListener('DOMContentLoaded', () => {
  initLanguageMenu();
  initFAQAccordion();
  initMobileMenu();
  loadFeaturedEquipment();
});

function initLanguageMenu() {
  const toggleBtn = document.getElementById('langToggleBtn');
  const menu = document.getElementById('langMenu');
  if (toggleBtn && menu) {
    toggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      menu.classList.toggle('show');
    });
    document.addEventListener('click', () => {
      menu.classList.remove('show');
    });
  }
}

function initFAQAccordion() {
  const items = document.querySelectorAll('.faq-item');
  items.forEach(item => {
    const btn = item.querySelector('.faq-question');
    if (btn) {
      btn.addEventListener('click', () => {
        const isActive = item.classList.contains('active');
        items.forEach(i => i.classList.remove('active'));
        if (!isActive) item.classList.add('active');
      });
    }
  });
}

function initMobileMenu() {
  const mobileBtn = document.getElementById('mobileMenuBtn');
  const mainNav = document.querySelector('.main-nav');
  if (mobileBtn && mainNav) {
    mobileBtn.addEventListener('click', () => {
      if (mainNav.style.display === 'flex') {
        mainNav.style.display = 'none';
      } else {
        mainNav.style.display = 'flex';
        mainNav.style.flexDirection = 'column';
        mainNav.style.position = 'absolute';
        mainNav.style.top = 'var(--header-height)';
        mainNav.style.left = '0';
        mainNav.style.width = '100%';
        mainNav.style.backgroundColor = 'var(--color-white)';
        mainNav.style.padding = '1.5rem';
        mainNav.style.boxShadow = 'var(--shadow-lg)';
        mainNav.style.borderBottom = '1px solid var(--color-grey-light)';
      }
    });
  }
}

async function loadFeaturedEquipment() {
  const container = document.getElementById('featuredEquipmentContainer');
  if (!container) return;

  let equipmentList = [];
  try {
    if (window.api) {
      const data = await window.api.get('/equipment/featured', { silent: true });
      if (Array.isArray(data) && data.length > 0) {
        equipmentList = data;
      }
    }
  } catch (err) {
    // API not yet reachable, use high quality sample data
  }

  if (equipmentList.length === 0) {
    equipmentList = SAMPLE_EQUIPMENT;
  }

  renderEquipmentCards(container, equipmentList);
}

function renderEquipmentCards(container, items) {
  container.innerHTML = items.map(item => {
    const unitText = item.billing_unit === 'acre' ? '/ acre' : (item.billing_unit === 'hour' ? '/ hour' : '/ day');
    const price = item.billing_unit === 'acre' ? (item.acre_rate || 800) : (item.billing_unit === 'hour' ? (item.hourly_rate || 400) : item.daily_rate);
    const badgeVerified = item.is_verified 
      ? `<span class="badge badge-verified"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg> Verified</span>` 
      : '';
    const badgeSample = item.is_sample 
      ? `<span class="badge badge-demo">Sample</span>` 
      : '';
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
            <span>${item.location} (${item.distance_km || 5} km away)</span>
          </div>

          <div class="equip-footer-bar">
            <div class="equip-price">
              <span class="equip-price-val">₹${price.toLocaleString('en-IN')}</span>
              <span class="equip-price-unit">${unitText} • ₹${item.security_deposit || 1000} deposit</span>
            </div>

            <div class="equip-card-actions">
              <a href="/pages/equipment-detail.html?id=${item.id}" class="btn btn-secondary btn-sm" data-i18n="btn_view_details">Details</a>
              <a href="/pages/equipment-detail.html?id=${item.id}&action=book" class="btn btn-primary btn-sm" data-i18n="btn_book_now">Book Now</a>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');

  if (window.i18n) window.i18n.applyTranslations();
}
