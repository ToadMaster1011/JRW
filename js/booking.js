/* =========================================
   JRW Property Rentals — EmailJS Booking & Contact
   =========================================
   SETUP INSTRUCTIONS:
   1. Create a free account at https://www.emailjs.com
   2. Add an Email Service (Gmail, Outlook, etc.)
   3. Create two Email Templates:
      - One for booking requests   (template variables listed below)
      - One for contact messages   (template variables listed below)
   4. Replace the placeholder values below with your real credentials.
   ========================================= */

/* ---------- YOUR EMAILJS CREDENTIALS ----------
   Replace these with values from your EmailJS dashboard:
   https://dashboard.emailjs.com/admin
----------------------------------------------- */
const EMAILJS_PUBLIC_KEY  = 'YOUR_PUBLIC_KEY';      // Account → API Keys
const EMAILJS_SERVICE_ID  = 'YOUR_SERVICE_ID';      // Email Services tab
const BOOKING_TEMPLATE_ID = 'YOUR_BOOKING_TEMPLATE_ID'; // Email Templates tab
const CONTACT_TEMPLATE_ID = 'YOUR_CONTACT_TEMPLATE_ID'; // Email Templates tab

/* ---------- BOOKING TEMPLATE variables ----------
   Your EmailJS booking template should use these variables:
     {{from_name}}         – guest full name
     {{from_email}}        – guest email
     {{guest_phone}}       – guest phone
     {{checkin_date}}      – check-in date
     {{checkout_date}}     – check-out date
     {{num_guests}}        – number of guests
     {{special_requests}}  – special requests (optional)
     {{total_cost}}        – calculated total
     {{num_nights}}        – number of nights
-------------------------------------------------- */

/* ---------- CONTACT TEMPLATE variables ----------
   Your EmailJS contact template should use these variables:
     {{from_name}}     – sender name
     {{from_email}}    – sender email
     {{subject}}       – message subject
     {{message}}       – message body
-------------------------------------------------- */

document.addEventListener('DOMContentLoaded', () => {

  /* ---- Initialize EmailJS ---- */
  if (typeof emailjs !== 'undefined') {
    emailjs.init(EMAILJS_PUBLIC_KEY);
  } else {
    console.warn('EmailJS SDK not loaded. Check your internet connection and the script tag in your HTML.');
  }

  /* ================================================
     BOOKING FORM
     ================================================ */
  const bookingForm = document.getElementById('booking-form');
  if (bookingForm) {
    bookingForm.addEventListener('submit', handleBookingSubmit);
  }

  function handleBookingSubmit(e) {
    e.preventDefault();

    const btn = document.getElementById('booking-submit-btn');
    const alertEl = document.getElementById('booking-alert');

    // Validate dates
    const checkin  = document.getElementById('book-checkin')?.value;
    const checkout = document.getElementById('book-checkout')?.value;
    if (!checkin || !checkout) {
      showFormAlert(alertEl, 'Please select both check-in and check-out dates.', 'error');
      return;
    }
    const ci = new Date(checkin);
    const co = new Date(checkout);
    if (co <= ci) {
      showFormAlert(alertEl, 'Check-out date must be after check-in date.', 'error');
      return;
    }

    const nights     = Math.ceil((co - ci) / (1000 * 60 * 60 * 24));
    const rate       = 250;
    const base       = rate * nights;
    const cleaning   = 85;
    const serviceFee = Math.round(base * 0.12);
    const total      = base + cleaning + serviceFee;

    const fmtDate = d => d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    const templateParams = {
      from_name:        getValue('book-name'),
      from_email:       getValue('book-email'),
      guest_phone:      getValue('book-phone'),
      checkin_date:     fmtDate(ci),
      checkout_date:    fmtDate(co),
      num_guests:       getValue('book-guests'),
      special_requests: getValue('book-requests') || 'None',
      total_cost:       '$' + total.toLocaleString(),
      num_nights:       nights + (nights === 1 ? ' night' : ' nights'),
    };

    // Show loading state
    setButtonLoading(btn, true);
    hideAlert(alertEl);

    if (typeof emailjs === 'undefined') {
      // Demo mode — show a success message without actually sending
      simulateSuccess(btn, alertEl, bookingForm, 'booking');
      return;
    }

    emailjs.send(EMAILJS_SERVICE_ID, BOOKING_TEMPLATE_ID, templateParams)
      .then(() => {
        setButtonLoading(btn, false);
        showFormAlert(alertEl,
          '🎉 Booking request sent! We\'ll confirm your reservation within 24 hours. Check your email for details.',
          'success'
        );
        bookingForm.reset();
        document.getElementById('bk-breakdown').style.display = 'none';
      })
      .catch((error) => {
        setButtonLoading(btn, false);
        console.error('EmailJS error:', error);
        showFormAlert(alertEl,
          'Something went wrong. Please try again or contact us directly.',
          'error'
        );
      });
  }

  /* ================================================
     CONTACT FORM
     ================================================ */
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', handleContactSubmit);
  }

  function handleContactSubmit(e) {
    e.preventDefault();

    const btn     = document.getElementById('contact-submit-btn');
    const alertEl = document.getElementById('contact-alert');

    const templateParams = {
      from_name:  getValue('contact-name'),
      from_email: getValue('contact-email'),
      subject:    getValue('contact-subject'),
      message:    getValue('contact-message'),
    };

    setButtonLoading(btn, true);
    hideAlert(alertEl);

    if (typeof emailjs === 'undefined') {
      simulateSuccess(btn, alertEl, contactForm, 'contact');
      return;
    }

    emailjs.send(EMAILJS_SERVICE_ID, CONTACT_TEMPLATE_ID, templateParams)
      .then(() => {
        setButtonLoading(btn, false);
        showFormAlert(alertEl,
          '✅ Message sent! We\'ll get back to you within 24 hours.',
          'success'
        );
        contactForm.reset();
      })
      .catch((error) => {
        setButtonLoading(btn, false);
        console.error('EmailJS error:', error);
        showFormAlert(alertEl,
          'Something went wrong sending your message. Please email us directly.',
          'error'
        );
      });
  }

  /* ================================================
     HELPERS
     ================================================ */

  function getValue(id) {
    return document.getElementById(id)?.value?.trim() || '';
  }

  function showFormAlert(el, message, type) {
    if (!el) return;
    el.className = 'alert show alert-' + type;
    const msgEl = el.querySelector('.alert-msg');
    if (msgEl) msgEl.textContent = message;
    el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function hideAlert(el) {
    if (el) el.classList.remove('show');
  }

  function setButtonLoading(btn, loading) {
    if (!btn) return;
    const spinner = btn.querySelector('.spinner');
    const label   = btn.querySelector('.btn-label');
    if (loading) {
      btn.disabled = true;
      if (spinner) spinner.style.display = 'inline-block';
      if (label)   label.textContent = 'Sending…';
    } else {
      btn.disabled = false;
      if (spinner) spinner.style.display = 'none';
      if (label)   label.textContent = btn.dataset.label || 'Send';
    }
  }

  /** Demo fallback when EmailJS SDK is not configured */
  function simulateSuccess(btn, alertEl, form, type) {
    setTimeout(() => {
      setButtonLoading(btn, false);
      const msg = type === 'booking'
        ? '🎉 Demo mode: Booking request received! Configure EmailJS to send real emails. (See js/booking.js)'
        : '✅ Demo mode: Message received! Configure EmailJS to send real emails. (See js/booking.js)';
      showFormAlert(alertEl, msg, 'info');
      form.reset();
      const bkBreakdown = document.getElementById('bk-breakdown');
      if (bkBreakdown) bkBreakdown.style.display = 'none';
    }, 1200);
  }

});
