/* =========================================
   JRW Property Rentals — Main JavaScript
   ========================================= */

document.addEventListener('DOMContentLoaded', () => {

  /* ---- Mobile Nav ---- */
  const toggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');

  if (toggle && navLinks) {
    toggle.addEventListener('click', () => {
      navLinks.classList.toggle('open');
      toggle.setAttribute('aria-expanded', navLinks.classList.contains('open'));
    });

    // Close nav when a link is clicked
    navLinks.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => navLinks.classList.remove('open'));
    });
  }

  /* ---- Highlight active nav link ---- */
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(a => {
    const href = a.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      a.classList.add('active');
    }
  });

  /* ---- Quick Book Form (homepage) ---- */
  const quickBookForm = document.getElementById('quick-book-form');
  if (quickBookForm) {
    // Set min dates
    const today = new Date().toISOString().split('T')[0];
    const checkInInput  = document.getElementById('qb-checkin');
    const checkOutInput = document.getElementById('qb-checkout');

    if (checkInInput)  checkInInput.min  = today;
    if (checkOutInput) checkOutInput.min = today;

    if (checkInInput && checkOutInput) {
      checkInInput.addEventListener('change', () => {
        const nextDay = new Date(checkInInput.value);
        nextDay.setDate(nextDay.getDate() + 1);
        checkOutInput.min = nextDay.toISOString().split('T')[0];
        if (checkOutInput.value && checkOutInput.value <= checkInInput.value) {
          checkOutInput.value = nextDay.toISOString().split('T')[0];
        }
      });
    }

    quickBookForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const params = new URLSearchParams({
        checkin:  checkInInput  ? checkInInput.value  : '',
        checkout: checkOutInput ? checkOutInput.value : '',
        guests:   document.getElementById('qb-guests')?.value || '1',
      });
      window.location.href = 'booking.html?' + params.toString();
    });
  }

  /* ---- Smooth scroll for anchor links ---- */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  /* ---- Header scroll shadow ---- */
  const header = document.querySelector('.site-header');
  if (header) {
    window.addEventListener('scroll', () => {
      header.style.boxShadow = window.scrollY > 20
        ? '0 2px 20px rgba(0,0,0,.10)'
        : 'none';
    });
  }

  /* ---- Image lightbox (property gallery) ---- */
  const galleryImgs = document.querySelectorAll('.property-gallery img, .showcase-gallery img');
  if (galleryImgs.length) {
    // Create lightbox elements
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      display:none; position:fixed; inset:0; background:rgba(0,0,0,.9);
      z-index:9999; align-items:center; justify-content:center; cursor:zoom-out;
    `;
    const img = document.createElement('img');
    img.style.cssText = 'max-width:92vw; max-height:90vh; border-radius:8px; box-shadow:0 8px 48px rgba(0,0,0,.6);';
    const close = document.createElement('button');
    close.innerHTML = '✕';
    close.style.cssText = `
      position:absolute; top:20px; right:24px; background:none; border:none;
      color:#fff; font-size:1.6rem; cursor:pointer; line-height:1;
    `;
    overlay.appendChild(img);
    overlay.appendChild(close);
    document.body.appendChild(overlay);

    galleryImgs.forEach(gi => {
      gi.addEventListener('click', () => {
        img.src = gi.src;
        img.alt = gi.alt;
        overlay.style.display = 'flex';
        document.body.style.overflow = 'hidden';
      });
    });

    [overlay, close].forEach(el => {
      el.addEventListener('click', (e) => {
        if (e.target === overlay || e.target === close) {
          overlay.style.display = 'none';
          document.body.style.overflow = '';
        }
      });
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && overlay.style.display === 'flex') {
        overlay.style.display = 'none';
        document.body.style.overflow = '';
      }
    });
  }

  /* ---- Price calculator (property detail sidebar) ---- */
  const sidebarCheckin  = document.getElementById('sb-checkin');
  const sidebarCheckout = document.getElementById('sb-checkout');
  const sidebarGuests   = document.getElementById('sb-guests');

  function updateSidebarPrices() {
    const nightlyRate = parseFloat(document.getElementById('nightly-rate')?.dataset.rate || 0);
    if (!sidebarCheckin || !sidebarCheckout || !nightlyRate) return;

    const ci = new Date(sidebarCheckin.value);
    const co = new Date(sidebarCheckout.value);
    const nights = Math.ceil((co - ci) / (1000 * 60 * 60 * 24));

    if (nights > 0) {
      const base      = nightlyRate * nights;
      const cleaning  = 85;
      const serviceFee = Math.round(base * 0.12);
      const total     = base + cleaning + serviceFee;

      const el = id => document.getElementById(id);
      if (el('calc-nights'))      el('calc-nights').textContent      = nights + (nights === 1 ? ' night' : ' nights');
      if (el('calc-base'))        el('calc-base').textContent        = '$' + base.toLocaleString();
      if (el('calc-cleaning'))    el('calc-cleaning').textContent    = '$' + cleaning;
      if (el('calc-service'))     el('calc-service').textContent     = '$' + serviceFee;
      if (el('calc-total'))       el('calc-total').textContent       = '$' + total.toLocaleString();
      if (el('price-breakdown'))  el('price-breakdown').style.display = 'block';
    }
  }

  if (sidebarCheckin && sidebarCheckout) {
    const today2 = new Date().toISOString().split('T')[0];
    sidebarCheckin.min = today2;
    sidebarCheckout.min = today2;

    sidebarCheckin.addEventListener('change', () => {
      const nd = new Date(sidebarCheckin.value);
      nd.setDate(nd.getDate() + 1);
      sidebarCheckout.min = nd.toISOString().split('T')[0];
      updateSidebarPrices();
    });
    sidebarCheckout.addEventListener('change', updateSidebarPrices);
  }

  /* ---- Sidebar "Book Now" button → booking page ---- */
  const sidebarBookBtn = document.getElementById('sidebar-book-btn');
  if (sidebarBookBtn) {
    sidebarBookBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const ci = sidebarCheckin?.value || '';
      const co = sidebarCheckout?.value || '';
      const g  = sidebarGuests?.value || '1';

      if (!ci || !co) {
        showAlert('sidebar-alert', 'Please select check-in and check-out dates.', 'info');
        return;
      }
      const params = new URLSearchParams({ checkin: ci, checkout: co, guests: g });
      window.location.href = 'booking.html?' + params.toString();
    });
  }

  /* ---- Pre-fill booking page from URL params ---- */
  if (window.location.pathname.includes('booking.html') || document.getElementById('booking-form')) {
    const sp = new URLSearchParams(window.location.search);
    ['checkin', 'checkout', 'guests'].forEach(key => {
      const val = sp.get(key);
      const el  = document.getElementById('book-' + key);
      if (val && el) el.value = val;
    });
    // Trigger price update on booking page
    document.getElementById('book-checkin')?.dispatchEvent(new Event('change'));
  }

  /* ---- Booking page price calculator ---- */
  const bookCheckin  = document.getElementById('book-checkin');
  const bookCheckout = document.getElementById('book-checkout');

  function updateBookingPrices() {
    if (!bookCheckin || !bookCheckout) return;
    const ci = new Date(bookCheckin.value);
    const co = new Date(bookCheckout.value);
    const nights = Math.ceil((co - ci) / (1000 * 60 * 60 * 24));
    const rate = 250; // matches the property rate

    if (nights > 0) {
      const base       = rate * nights;
      const cleaning   = 85;
      const serviceFee = Math.round(base * 0.12);
      const total      = base + cleaning + serviceFee;

      setTextContent('bk-nights',   nights + (nights === 1 ? ' night' : ' nights'));
      setTextContent('bk-base',     '$' + base.toLocaleString());
      setTextContent('bk-cleaning', '$' + cleaning);
      setTextContent('bk-service',  '$' + serviceFee);
      setTextContent('bk-total',    '$' + total.toLocaleString());

      const breakdown = document.getElementById('bk-breakdown');
      if (breakdown) breakdown.style.display = 'block';

      // Update summary
      const fmtDate = d => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      setTextContent('sum-checkin',  isNaN(ci) ? '—' : fmtDate(ci));
      setTextContent('sum-checkout', isNaN(co) ? '—' : fmtDate(co));
      setTextContent('sum-nights',   isNaN(nights) || nights < 0 ? '—' : nights + (nights === 1 ? ' night' : ' nights'));
      setTextContent('sum-total',    '$' + total.toLocaleString());
    }
  }

  if (bookCheckin && bookCheckout) {
    const today3 = new Date().toISOString().split('T')[0];
    bookCheckin.min  = today3;
    bookCheckout.min = today3;

    bookCheckin.addEventListener('change', () => {
      const nd = new Date(bookCheckin.value);
      nd.setDate(nd.getDate() + 1);
      bookCheckout.min = nd.toISOString().split('T')[0];
      updateBookingPrices();
    });
    bookCheckout.addEventListener('change', updateBookingPrices);
    updateBookingPrices(); // run on load if dates pre-filled
  }

  /* ---- Helper: set text content ---- */
  function setTextContent(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  }

  /* ---- Helper: show/hide alert ---- */
  window.showAlert = function(id, message, type = 'info') {
    const alert = document.getElementById(id);
    if (!alert) return;
    alert.className = 'alert show alert-' + type;
    alert.querySelector('.alert-msg').textContent = message;
    setTimeout(() => alert.classList.remove('show'), 6000);
  };

  /* ---- Property Page: Showcase + Details ---- */
  const featuredGrid = document.getElementById('featured-properties-grid');
  const mapFrame = document.getElementById('property-map-frame');

  if (featuredGrid && mapFrame) {
    const listings = [
      {
        id: 'lakeview-retreat',
        name: 'Lakeview Retreat',
        address: '123 Lakeview Drive, Sunset Hills, CA 90210',
        beds: 3, baths: 2, guests: 6, sqft: '1,800', rating: '4.9',
        price: '$250 / night', nightlyRate: 250,
        tags: ['Entire Home', 'Family Friendly', 'Pet Friendly', 'Self Check-In'],
        heroMeta: '📍 123 Lakeview Drive, Sunset Hills · 3 BD · 2 BA · Up to 6 guests',
        gallery: [
          'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=1000&q=80',
          'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&q=80',
          'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80'
        ],
        description: [
          'Welcome to Lakeview Retreat — a beautifully renovated 3-bedroom home nestled in the peaceful Sunset Hills neighborhood, ideal for families and weekend getaways.',
          'Enjoy bright open-plan living, a full kitchen, and a large private backyard perfect for BBQ evenings and slow mornings.',
          'The home offers premium bedding, fast WiFi, and a calm atmosphere that makes short and extended stays equally comfortable.'
        ],
        nearby: ['🍽️ Downtown dining district — 0.8 miles', '🛒 Supermarket — 0.5 miles', '🏖️ Lake/beach area — 1.2 miles', '✈️ Regional Airport — 18 miles', '🚌 Bus stop — 3 min walk'],
        lat: 34.0736, lng: -118.4004,
      },
      {
        id: 'sunset-villa',
        name: 'Sunset Villa',
        address: '88 Vista Ridge Road, Sunset Hills, CA 90210',
        beds: 4, baths: 3, guests: 8, sqft: '2,200', rating: '4.8',
        price: '$340 / night', nightlyRate: 340,
        tags: ['Entire Villa', 'Pool', 'Mountain View', 'Smart Check-In'],
        heroMeta: '📍 88 Vista Ridge Road, Sunset Hills · 4 BD · 3 BA · Up to 8 guests',
        gallery: [
          'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1000&q=80',
          'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=600&q=80',
          'https://images.unsplash.com/photo-1494526585095-c41746248156?w=600&q=80'
        ],
        description: [
          'Sunset Villa combines luxury interiors with panoramic hill views and generous indoor-outdoor entertaining space.',
          'A private pool, expansive kitchen, and multiple lounge zones make this a top choice for groups and longer holidays.',
          'Designed for comfort and style, it offers privacy while staying close to shops and dining.'
        ],
        nearby: ['🍽️ Skyline Bistro district — 1.1 miles', '🛒 Organic market — 0.7 miles', '🌅 Scenic lookout — 0.4 miles', '✈️ Regional Airport — 20 miles', '🚌 Bus stop — 5 min walk'],
        lat: 34.0662, lng: -118.3891,
      },
      {
        id: 'garden-loft',
        name: 'Garden Loft',
        address: '245 Oak Garden Lane, Sunset Hills, CA 90210',
        beds: 2, baths: 1, guests: 4, sqft: '1,050', rating: '4.7',
        price: '$195 / night', nightlyRate: 195,
        tags: ['Loft', 'Couples Retreat', 'Work Friendly', 'Self Check-In'],
        heroMeta: '📍 245 Oak Garden Lane, Sunset Hills · 2 BD · 1 BA · Up to 4 guests',
        gallery: [
          'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1000&q=80',
          'https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=600&q=80',
          'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=600&q=80'
        ],
        description: [
          'Garden Loft is a cozy and modern escape with soft natural light and a peaceful private patio.',
          'Great for couples or remote workers, this space includes dedicated work areas and thoughtful design touches.',
          'It is located in a quiet residential lane while still being minutes from local attractions.'
        ],
        nearby: ['☕ Artisan coffee strip — 0.5 miles', '🛒 Fresh market — 0.6 miles', '🌳 Community park — 0.2 miles', '✈️ Regional Airport — 17 miles', '🚉 Transit station — 9 min walk'],
        lat: 34.0817, lng: -118.4128,
      },
      {
        id: 'hillside-haven',
        name: 'Hillside Haven',
        address: '19 Canyon Crest Blvd, Sunset Hills, CA 90210',
        beds: 5, baths: 3, guests: 10, sqft: '2,900', rating: '5.0',
        price: '$420 / night', nightlyRate: 420,
        tags: ['Luxury Home', 'Large Groups', 'Outdoor Dining', 'Premium Views'],
        heroMeta: '📍 19 Canyon Crest Blvd, Sunset Hills · 5 BD · 3 BA · Up to 10 guests',
        gallery: [
          'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=1000&q=80',
          'https://images.unsplash.com/photo-1616046229478-9901c5536a45?w=600&q=80',
          'https://images.unsplash.com/photo-1564540583246-934409427776?w=600&q=80'
        ],
        description: [
          'Hillside Haven is a spacious designer home built for memorable group trips and family celebrations.',
          'Multiple bedrooms, open gathering spaces, and scenic terraces create a premium hosting experience.',
          'Its elevated location offers privacy and quick access to hiking trails and local entertainment.'
        ],
        nearby: ['🥾 Trailhead access — 0.6 miles', '🍷 Wine bar district — 1.4 miles', '🛒 Grocery superstore — 1.0 miles', '✈️ Regional Airport — 22 miles', '🚌 Bus stop — 6 min walk'],
        lat: 34.0912, lng: -118.3765,
      },
      {
        id: 'coastal-nest',
        name: 'Coastal Nest',
        address: '312 Harbor Breeze St, Sunset Hills, CA 90210',
        beds: 2, baths: 2, guests: 5, sqft: '1,250', rating: '4.8',
        price: '$230 / night', nightlyRate: 230,
        tags: ['Near Waterfront', 'Balcony', 'Pet Friendly', 'Self Check-In'],
        heroMeta: '📍 312 Harbor Breeze St, Sunset Hills · 2 BD · 2 BA · Up to 5 guests',
        gallery: [
          'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1000&q=80',
          'https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=600&q=80',
          'https://images.unsplash.com/photo-1600573472550-8090b5e0745e?w=600&q=80'
        ],
        description: [
          'Coastal Nest offers modern comfort with breezy interiors and quick access to the waterfront promenade.',
          'Guests love the private balcony, relaxing color palette, and easy walk to cafes and local shops.',
          'Ideal for leisure trips that blend calm mornings and vibrant evenings by the water.'
        ],
        nearby: ['🌊 Waterfront walk — 0.7 miles', '🍽️ Harbor restaurants — 0.9 miles', '🛒 Mini market — 0.4 miles', '✈️ Regional Airport — 16 miles', '🚌 Bus stop — 4 min walk'],
        lat: 34.0601, lng: -118.4204,
      },
      {
        id: 'urban-oasis',
        name: 'Urban Oasis',
        address: '54 Maple Heights Ave, Sunset Hills, CA 90210',
        beds: 3, baths: 2, guests: 7, sqft: '1,600', rating: '4.7',
        price: '$265 / night', nightlyRate: 265,
        tags: ['City Access', 'Workspace', 'Family Friendly', 'Smart TV'],
        heroMeta: '📍 54 Maple Heights Ave, Sunset Hills · 3 BD · 2 BA · Up to 7 guests',
        gallery: [
          'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1000&q=80',
          'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=600&q=80',
          'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&q=80'
        ],
        description: [
          'Urban Oasis balances peaceful residential living with quick access to downtown hotspots and business zones.',
          'A practical layout, modern finishes, and dedicated work setup make it great for mixed business-leisure stays.',
          'This home is a reliable choice for families and small groups seeking convenience and comfort.'
        ],
        nearby: ['🛍️ Shopping district — 0.9 miles', '☕ Café row — 0.5 miles', '🛒 Supermarket — 0.6 miles', '✈️ Regional Airport — 19 miles', '🚉 Transit station — 8 min walk'],
        lat: 34.0755, lng: -118.3669,
      },
      {
        id: 'palm-court',
        name: 'Palm Court Residence',
        address: '171 Palm Court Circle, Sunset Hills, CA 90210',
        beds: 4, baths: 2, guests: 8, sqft: '2,050', rating: '4.9',
        price: '$315 / night', nightlyRate: 315,
        tags: ['Courtyard', 'BBQ Area', 'Group Stay', 'Private Parking'],
        heroMeta: '📍 171 Palm Court Circle, Sunset Hills · 4 BD · 2 BA · Up to 8 guests',
        gallery: [
          'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=1000&q=80',
          'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=600&q=80',
          'https://images.unsplash.com/photo-1600210492493-0946911123ea?w=600&q=80'
        ],
        description: [
          'Palm Court Residence features broad living areas and a landscaped courtyard built for social evenings.',
          'Comfortable bedrooms, private parking, and thoughtful amenities support easy group travel planning.',
          'It is positioned in a calm neighborhood with fast access to dining and recreation.'
        ],
        nearby: ['🍔 Food street — 0.8 miles', '🌳 Public garden — 0.3 miles', '🛒 Grocery market — 0.7 miles', '✈️ Regional Airport — 18 miles', '🚌 Bus stop — 4 min walk'],
        lat: 34.0873, lng: -118.3988,
      },
      {
        id: 'ridgeview-estate',
        name: 'Ridgeview Estate',
        address: '9 Ridgeview Terrace, Sunset Hills, CA 90210',
        beds: 5, baths: 4, guests: 12, sqft: '3,400', rating: '5.0',
        price: '$520 / night', nightlyRate: 520,
        tags: ['Estate', 'Premium', 'Event Friendly', 'Panoramic Views'],
        heroMeta: '📍 9 Ridgeview Terrace, Sunset Hills · 5 BD · 4 BA · Up to 12 guests',
        gallery: [
          'https://images.unsplash.com/photo-1613977257363-707ba9348227?w=1000&q=80',
          'https://images.unsplash.com/photo-1600607688969-a5bfcd646154?w=600&q=80',
          'https://images.unsplash.com/photo-1600607687644-c7531d0d7ab9?w=600&q=80'
        ],
        description: [
          'Ridgeview Estate is our flagship luxury stay with expansive interiors and exceptional sunset-facing terraces.',
          'Built for large groups, it offers multiple lounge zones, chef-ready kitchen space, and premium amenities.',
          'If you want a statement property with high-end comfort, this is the ideal choice.'
        ],
        nearby: ['🌄 Viewpoint trail — 0.4 miles', '🍽️ Fine dining district — 1.6 miles', '🛒 Gourmet market — 1.1 miles', '✈️ Regional Airport — 24 miles', '🚕 Rideshare pickup zone — 2 min walk'],
        lat: 34.0964, lng: -118.3847,
      }
    ];

    const mapStatus = document.getElementById('map-status');
    const directionsLink = document.getElementById('map-directions-link');

    function setText(id, value) {
      const el = document.getElementById(id);
      if (el) el.textContent = value;
    }

    function updatePropertyDetails(listing) {
      setText('hero-property-name', listing.name);
      setText('hero-property-meta', listing.heroMeta);
      setText('detail-title', `${listing.name} — Entire Home`);
      setText('detail-location', `📍 ${listing.address}`);
      setText('stat-bedrooms', String(listing.beds));
      setText('stat-bathrooms', String(listing.baths));
      setText('stat-guests', String(listing.guests));
      setText('stat-sqft', listing.sqft);
      setText('stat-rating', listing.rating);
      setText('sidebar-rating', listing.rating);
      setText('detail-price', `$${listing.nightlyRate}`);

      const rateEl = document.getElementById('nightly-rate');
      if (rateEl) rateEl.dataset.rate = String(listing.nightlyRate);

      updateSidebarPrices();

      const [main, second, third] = listing.gallery;
      const galleryMain = document.getElementById('gallery-main');
      const gallerySecond = document.getElementById('gallery-second');
      const galleryThird = document.getElementById('gallery-third');

      if (galleryMain) { galleryMain.src = main; galleryMain.alt = `${listing.name} exterior`; }
      if (gallerySecond) { gallerySecond.src = second; gallerySecond.alt = `${listing.name} interior`; }
      if (galleryThird) { galleryThird.src = third; galleryThird.alt = `${listing.name} living area`; }

      const tagsWrap = document.getElementById('property-tags');
      if (tagsWrap) {
        tagsWrap.innerHTML = '';
        listing.tags.forEach(tag => {
          const span = document.createElement('span');
          span.className = 'property-tag';
          span.textContent = tag;
          tagsWrap.appendChild(span);
        });
      }

      const descWrap = document.getElementById('property-description');
      if (descWrap) {
        const heading = descWrap.querySelector('h3');
        descWrap.innerHTML = '';
        if (heading) descWrap.appendChild(heading);
        listing.description.forEach(text => {
          const p = document.createElement('p');
          p.textContent = text;
          descWrap.appendChild(p);
        });
      }

      const nearbyList = document.getElementById('nearby-list');
      if (nearbyList) {
        nearbyList.innerHTML = '';
        listing.nearby.forEach(item => {
          const li = document.createElement('li');
          li.textContent = item;
          nearbyList.appendChild(li);
        });
      }

      document.title = `${listing.name} — JRW Rentals`;
    }

    function updateMapForListing(listing) {
      const query = encodeURIComponent(`${listing.lat},${listing.lng}`);
      mapFrame.src = `https://www.google.com/maps?q=${query}&z=14&output=embed`;

      if (mapStatus) {
        mapStatus.innerHTML = `Showing: <strong>${listing.name}</strong> · ${listing.address}`;
      }

      if (directionsLink) {
        directionsLink.href = `https://www.google.com/maps/dir/?api=1&destination=${query}`;
      }
    }

    function setActiveCard(activeId) {
      featuredGrid.querySelectorAll('.featured-property-card').forEach(card => {
        card.classList.toggle('active', card.dataset.id === activeId);
      });
    }

    function createListingCard(listing) {
      const card = document.createElement('a');
      card.className = 'featured-property-card';
      card.href = `property.html?property=${encodeURIComponent(listing.id)}#property-details`;
      card.dataset.id = listing.id;
      card.innerHTML = `
        <img class="featured-property-image" src="${listing.gallery[0]}" alt="${listing.name}" loading="lazy" />
        <div class="featured-property-content">
          <div class="featured-property-title">${listing.name}</div>
          <div class="featured-property-address">${listing.address}</div>
          <div class="featured-property-meta">
            <span>${listing.beds} BD · ${listing.baths} BA · ${listing.guests} guests</span>
            <strong>${listing.price}</strong>
          </div>
        </div>
      `;
      return card;
    }

    listings.forEach(listing => featuredGrid.appendChild(createListingCard(listing)));

    const selectedId = new URLSearchParams(window.location.search).get('property');
    const selectedListing = listings.find(item => item.id === selectedId) || listings[0];

    setActiveCard(selectedListing.id);
    updatePropertyDetails(selectedListing);
    updateMapForListing(selectedListing);
  }

});
