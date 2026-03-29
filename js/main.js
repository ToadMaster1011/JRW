/* =========================================
  SWM Lakeside Rentals — Main JavaScript
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
        name: 'Two Pine Cottage',
        address: 'Watervliet, Michigan',
        beds: 3, baths: 1, guests: 9, sqft: '6 beds', rating: '4.83',
        price: '$250 / night', nightlyRate: 250,
        tags: ['Entire Home', 'Hosted by Jonathan', 'Pet Friendly', 'Self Check-In'],
        heroMeta: '📍 Watervliet, Michigan · 3 BR · 6 Beds · 1 Bath · Up to 9 guests',
        gallery: [
          '1-1.jpg',
          '1-2.jpg',
          '1-3.jpg',
          '1-4.jpg'
        ],
        description: [
          'Our cozy Two Pine Cottage is tucked away in Watervliet, Michigan and is only a short drive from South Haven.',
          'The home is set up for relaxed family trips with a full kitchen, backyard space, and practical amenities for longer stays.',
          'Hosted by Jonathan Romero, the cottage offers easy self check-in and a comfortable home base for exploring the lakeshore.'
        ],
        amenities: [
          'Shampoo, body soap, and hot water',
          'Washer and free dryer (in building)',
          'Essentials, hangers, bed linens, and closet storage',
          'TV, air conditioning, ceiling fan, and central heating',
          'Exterior security cameras, smoke alarm, CO alarm',
          'Wifi for streaming and remote work',
          'Full kitchen with refrigerator, microwave, freezer, and dishwasher',
          'Stainless steel gas stove and oven',
          'Coffee maker, blender, dining table, and coffee supplies',
          'Backyard, BBQ grill, and free parking on premises',
          'Pets allowed and self check-in with smart lock',
          '35 total amenities available during your stay'
        ],
        houseRules: [
          'Check-in after 4:00 PM',
          'Checkout before 11:00 AM',
          'Maximum 9 guests'
        ],
        hostInfo: [
          'Name: Jonathan Romero',
          'Hosting status: Superhost · Hosting for 10 months',
          'Born: 2000s',
          'Favorite Song: My Shot (Hamilton)',
          'Bio: Traveling the U.S. with his wife',
          'Response Rate: 50% · Responds within a day'
        ],
        calendarInfo: 'March 2026 and April 2026 calendars are currently displayed for booking selection.',
        reviews: [
          'Rating: 4.83 from 12 reviews.',
          'Exact review text can be inserted here verbatim when provided.'
        ],
        reviewSummary: '12 reviews',
        safety: [
          'Exterior security cameras on property (front door and back deck)',
          'Carbon monoxide alarm installed',
          'Smoke alarm installed'
        ],
        nearby: ['🏖️ South Haven beaches — about 20 min drive', '🍷 Southwest Michigan wineries — short drive', '🛒 Local groceries — nearby', '🍽️ Downtown Watervliet dining — nearby', '🚗 Easy road access for weekend trips'],
        lat: 42.1861, lng: -86.2600,
      },
      {
        id: 'sunset-villa',
        name: 'Lake Side Cottage',
        address: 'Coloma, Michigan',
        beds: 3, baths: 1, guests: 6, sqft: '4', rating: 'New',
        price: '$340 / night', nightlyRate: 340,
        tags: ['Entire Home', 'New Listing', 'Hosted by Jonathan', 'Self Check-In'],
        heroMeta: '📍 Coloma, Michigan · 3 BR · 4 Beds · 1 Bath · Up to 6 guests',
        gallery: [
          '2-1.jpg',
          '2-2.jpg',
          '2-3.jpg',
          '2-4.jpg'
        ],
        description: [
          'Our Lake Side cottage is nestled on the south side of our lovely local Little Paw Paw lake.',
          'It is just a quick 3-minute stroll to the beach, perfect for water sports fans or anyone who loves fishing.',
          'This beach cottage, with its modern charm, is ideal for those seeking a peaceful escape from the hustle and bustle of the city. The Lake Side cottage is only 10 minutes from Lake Michigan, and for our wine enthusiasts, we are smack dab in the middle of all the wineries.'
        ],
        amenities: [
          'Bathtub, shampoo, conditioner, body soap, and hot water',
          'Washer and free dryer (in building)',
          'Bed linens and cotton linens',
          'TV, air conditioning, ceiling fan, and central heating',
          'Exterior security cameras on property',
          'Ring doorbell and two floodlight cameras (garage front and backyard entrance)',
          'Smoke alarm, carbon monoxide alarm, and first aid kit',
          'Wifi',
          'Kitchen with GE refrigerator, microwave, and cooking basics',
          'Dishes and silverware, dishwasher, GE stainless steel gas stove',
          'GE stainless steel single oven, coffee maker, baking sheet, blender',
          'Barbecue utensils (grill, charcoal, bamboo or iron skewers), dining table, coffee',
          'Waterfront, beach access, and lake access',
          'Private backyard and BBQ grill',
          'Free parking on premises',
          'Pets allowed and self check-in with smart lock',
          'Not included: Essentials'
        ],
        houseRules: [
          'Check-in after 4:00 PM',
          'Checkout before 11:00 AM',
          'Maximum 6 guests'
        ],
        hostInfo: [
          'Name: Jonathan Romero',
          'Hosting status: Superhost · Hosting for 10 months',
          'Born: 2000s',
          'Favorite Song: My Shot (Hamilton)',
          'Bio: Traveling the U.S. with his wife',
          'Response Rate: 50% · Responds within a day'
        ],
        calendarInfo: 'March 2026 and April 2026 calendars are currently displayed for booking selection.',
        reviews: [
          'New listing, no reviews yet.',
          'Host has 12 reviews for other places to stay.'
        ],
        reviewSummary: 'No reviews yet',
        safety: [
          'Exterior security cameras on property',
          'Carbon monoxide alarm installed',
          'Smoke alarm installed'
        ],
        nearby: ['🏖️ Little Paw Paw lake beach — 3 min walk', '🌊 Lake Michigan — about 10 min drive', '🍷 Local wineries — nearby', '🎣 Fishing and water sports access', '🚗 Easy road access for weekend trips'],
        lat: 42.1866, lng: -86.3068,
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
      setText('sidebar-review-summary', listing.reviewSummary || 'No reviews yet');
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

      const amenitiesList = document.getElementById('amenities-list');
      if (amenitiesList && Array.isArray(listing.amenities)) {
        amenitiesList.innerHTML = '';
        listing.amenities.forEach(item => {
          const div = document.createElement('div');
          div.className = 'amenity-item';
          div.innerHTML = '<span class="check">✓</span> ' + item;
          amenitiesList.appendChild(div);
        });
      }

      const houseRulesList = document.getElementById('house-rules-list');
      if (houseRulesList && Array.isArray(listing.houseRules)) {
        houseRulesList.innerHTML = '';
        listing.houseRules.forEach(item => {
          const li = document.createElement('li');
          li.textContent = item;
          houseRulesList.appendChild(li);
        });
      }

      const hostInfoList = document.getElementById('host-info-list');
      if (hostInfoList && Array.isArray(listing.hostInfo)) {
        hostInfoList.innerHTML = '';
        listing.hostInfo.forEach(item => {
          const li = document.createElement('li');
          li.textContent = item;
          hostInfoList.appendChild(li);
        });
      }

      setText('calendar-text', listing.calendarInfo || 'Calendar information will be available soon.');

      const reviewsContent = document.getElementById('reviews-content');
      if (reviewsContent && Array.isArray(listing.reviews)) {
        reviewsContent.innerHTML = '';
        listing.reviews.forEach(text => {
          const p = document.createElement('p');
          p.style.color = 'var(--mid)';
          p.style.lineHeight = '1.8';
          p.textContent = text;
          reviewsContent.appendChild(p);
        });
      }

      const safetyList = document.getElementById('safety-list');
      if (safetyList && Array.isArray(listing.safety)) {
        safetyList.innerHTML = '';
        listing.safety.forEach(item => {
          const li = document.createElement('li');
          li.textContent = item;
          safetyList.appendChild(li);
        });
      }

      const guestsSelect = document.getElementById('sb-guests');
      if (guestsSelect) {
        const maxGuests = Number(listing.guests) || 1;
        const previousValue = Number(guestsSelect.value) || 2;
        guestsSelect.innerHTML = '';
        for (let i = 1; i <= maxGuests; i += 1) {
          const option = document.createElement('option');
          option.value = String(i);
          option.textContent = `${i} guest${i > 1 ? 's' : ''}`;
          guestsSelect.appendChild(option);
        }
        guestsSelect.value = String(Math.min(previousValue, maxGuests));
      }

      document.title = `${listing.name} — SWM Lakeside Rentals`;
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
