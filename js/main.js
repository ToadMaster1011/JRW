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
  const nightlyRate     = parseFloat(document.getElementById('nightly-rate')?.dataset.rate || 0);

  function updateSidebarPrices() {
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

  /* ---- Property Page: Google Maps + Listings ---- */
  const listingsGrid = document.getElementById('listings-grid');
  const mapFrame = document.getElementById('property-map-frame');

  if (listingsGrid && mapFrame) {
    const listings = [
      {
        id: 'lakeview-retreat',
        name: 'Lakeview Retreat',
        address: '123 Lakeview Drive, Sunset Hills, CA 90210',
        beds: 3,
        baths: 2,
        guests: 6,
        price: '$250 / night',
        lat: 34.0736,
        lng: -118.4004,
      },
      {
        id: 'sunset-villa',
        name: 'Sunset Villa',
        address: '88 Vista Ridge Road, Sunset Hills, CA 90210',
        beds: 4,
        baths: 3,
        guests: 8,
        price: '$340 / night',
        lat: 34.0662,
        lng: -118.3891,
      },
      {
        id: 'garden-loft',
        name: 'Garden Loft',
        address: '245 Oak Garden Lane, Sunset Hills, CA 90210',
        beds: 2,
        baths: 1,
        guests: 4,
        price: '$195 / night',
        lat: 34.0817,
        lng: -118.4128,
      },
      {
        id: 'hillside-haven',
        name: 'Hillside Haven',
        address: '19 Canyon Crest Blvd, Sunset Hills, CA 90210',
        beds: 5,
        baths: 3,
        guests: 10,
        price: '$420 / night',
        lat: 34.0912,
        lng: -118.3765,
      }
    ];

    const mapStatus = document.getElementById('map-status');
    const directionsLink = document.getElementById('map-directions-link');

    function updateMapForListing(listing) {
      const query = encodeURIComponent(`${listing.lat},${listing.lng}`);
      mapFrame.src = `https://www.google.com/maps?q=${query}&z=14&output=embed`;

      if (mapStatus) {
        mapStatus.innerHTML = `Showing: <strong>${listing.name}</strong> · ${listing.address}`;
      }

      if (directionsLink) {
        const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${query}`;
        directionsLink.href = directionsUrl;
      }
    }

    function setActiveCard(activeId) {
      listingsGrid.querySelectorAll('.listing-card').forEach(card => {
        card.classList.toggle('active', card.dataset.id === activeId);
      });
    }

    function createListingCard(listing) {
      const card = document.createElement('article');
      card.className = 'listing-card';
      card.dataset.id = listing.id;
      card.innerHTML = `
        <h4>${listing.name}</h4>
        <p>${listing.address}</p>
        <div class="listing-meta">
          <span>${listing.beds} BD · ${listing.baths} BA · ${listing.guests} guests</span>
          <strong>${listing.price}</strong>
        </div>
      `;

      card.addEventListener('click', () => {
        setActiveCard(listing.id);
        updateMapForListing(listing);
      });

      return card;
    }

    listings.forEach(listing => listingsGrid.appendChild(createListingCard(listing)));

    const defaultListing = listings[0];
    setActiveCard(defaultListing.id);
    updateMapForListing(defaultListing);
  }

});
