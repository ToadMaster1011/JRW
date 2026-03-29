# JRW Rentals — Property Rental Website

A full static website for a private property rental (Airbnb-style), with EmailJS-powered booking and contact forms.

## Pages

| File | Description |
|------|-------------|
| `index.html` | Homepage — hero, quick-book bar, features, property showcase, amenities, testimonials |
| `property.html` | Property showcase + dynamic detail view (click cards to load selected property details) |
| `booking.html` | Booking form — guest details, date picker, price calculator, EmailJS submission |
| `contact.html` | Contact page — inquiry form via EmailJS |

## Setup

### 1. Configure EmailJS

1. Create a free account at [emailjs.com](https://www.emailjs.com)
2. Add an **Email Service** (Gmail, Outlook, etc.) — note the **Service ID**
3. Create two **Email Templates**:
   - **Booking template** — uses variables: `{{from_name}}`, `{{from_email}}`, `{{guest_phone}}`, `{{checkin_date}}`, `{{checkout_date}}`, `{{num_guests}}`, `{{special_requests}}`, `{{total_cost}}`, `{{num_nights}}`
   - **Contact template** — uses variables: `{{from_name}}`, `{{from_email}}`, `{{subject}}`, `{{message}}`
4. Copy your **Public Key** from Account → API Keys
5. Open `js/booking.js` and replace the placeholder credentials at the top of the file:

```js
const EMAILJS_PUBLIC_KEY  = 'YOUR_PUBLIC_KEY';
const EMAILJS_SERVICE_ID  = 'YOUR_SERVICE_ID';
const BOOKING_TEMPLATE_ID = 'YOUR_BOOKING_TEMPLATE_ID';
const CONTACT_TEMPLATE_ID = 'YOUR_CONTACT_TEMPLATE_ID';
```

### 2. Customise the Content

- **Properties catalogue** — edit the listing objects in `js/main.js` (cards, detail content, map, pricing)
- **Contact email & phone** — search for `hello@jrwrentals.com` / `+1 (555) 000-1234`
- **Images** — swap the Unsplash URLs with your own property photos
- **Google Maps + listings data** — update the listing objects in `js/main.js` (name, address, lat/lng, price) to control cards, map display, and directions links

### 3. Deploy

This is a pure static site — no build step required. Deploy anywhere:

- **GitHub Pages** — push to `gh-pages` branch
- **Netlify** — drag-and-drop the folder
- **Vercel** — `vercel --prod`
- Any static web host

## Project Structure

```
JRW/
├── index.html       # Homepage
├── property.html    # Property details
├── booking.html     # Booking form (EmailJS)
├── contact.html     # Contact form (EmailJS)
├── css/
│   └── style.css    # All styles
└── js/
    ├── main.js      # Navigation, UI interactions, price calculator
    └── booking.js   # EmailJS integration for booking & contact forms
```

## Tech Stack

- **HTML5 / CSS3** — responsive, mobile-first
- **Vanilla JavaScript** — no frameworks
- **EmailJS** — send booking requests & contact messages without a backend
- **Google Fonts** (Inter) — loaded from CDN
- **Unsplash** — placeholder property images (replace with real photos)
