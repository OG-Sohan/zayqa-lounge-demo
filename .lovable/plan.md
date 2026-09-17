# Zayqa Lounge — Production Website Plan

## Goal
Build a complete premium restaurant website and connected guest experience that feels like entering Zayqa: warm, editorial, calm, and highly usable on mobile first. The supplied logo remains the identity reference; the navbar uses the `ZAYQA` wordmark.

## Visual direction
- Use the exact brand system: cream `#F3E8D0`, deep olive `#3F4A32`, burgundy `#641F2B`, espresso `#211B17`, and brass `#B08A4A` only for restrained details.
- Load Cormorant Garamond for display/editorial type and Manrope for interface and body text.
- Create one cohesive hospitality photography set: evening interior, table settings, food, kitchen, people, and architectural details, all with warm natural light and matching art direction.
- Build a cinematic full-image homepage opening with restrained staged reveals and subtle scroll depth; respect reduced-motion preferences.
- Recompose layouts specifically for phone widths, with large type, touch-friendly controls, swipeable dish collections, full-screen navigation, and no permanent bottom action bar.

## Guest-facing structure
Create working, individually shareable pages with unique metadata:
- `/` — complete editorial homepage journey: opening, introduction, signature dishes, menu preview, room, experience, gallery, guest quotes, private dining, location, reservation, and footer.
- `/menu` plus `/menu/starters`, `/menu/signatures`, `/menu/mains`, `/menu/grills`, `/menu/desserts`, `/menu/drinks` — crawlable structured menu content, category browsing, featured dishes, and touch carousels.
- `/menu/item/$slug` — dish image, description, ingredients, allergens, dietary details, add-ons, quantity, and add-to-order flow.
- `/cart`, `/checkout`, `/order-confirmation` — editable order, pickup/delivery choice, validated details/payment demo, and status confirmation.
- `/reserve`, `/reservation-confirmation` — date/time/guest selection, available slots, guest details, and confirmation actions.
- `/about`, `/experience`, `/gallery`, `/private-dining`, `/location`, `/contact` — complete supporting experiences and validated enquiry/contact forms.
- `/account` — customer sign-in/register presentation plus order and reservation history.
- `/admin` — protected restaurant-management foundation for menu, orders, reservations, and restaurant settings; never linked as part of the public hospitality experience.

## Shared experience and interactions
- Refined desktop header; compact sticky treatment after the opening; mobile wordmark/cart/menu header and animated full-screen menu.
- Contextual mobile reservation action only after leaving the opening and hidden around the reservation area.
- Functional cart state, quantities, add-ons, totals in USD, and consistent `$` formatting.
- Functional category navigation, swipe controls, dish detail interactions, fullscreen gallery, slowly moving testimonials, reservation slots, form validation, and meaningful CTA destinations.
- Use one restaurant-data source for hours, currency, contact details, menu, dietary/allergen fields, gallery, and demo testimonials so content stays consistent.

## Data and backend foundation
- Enable Lovable Cloud for persistent menu content, orders, reservations, enquiries, customer accounts, and protected owner tools.
- Create scalable restaurant, hours, menu category/item/add-on, cart, order, reservation, gallery, review, enquiry, profile, and separate user-role records with secure access rules.
- Seed believable demo content and mark internal demo guest quotes in the data.
- Implement app-facing server functions for guest actions and protected owner actions; validate every payload and enforce roles server-side.
- Keep payments as an explicit non-charging demo state unless a payment provider is connected later.

## SEO, accessibility, and performance
- Give every content page unique title, description, Open Graph text, `og:type`, and Twitter card metadata.
- Add Restaurant and menu/dish structured data, semantic headings, descriptive image text, keyboard support, focus states, large touch targets, and sufficient contrast.
- Use responsive image dimensions, lazy-load below-the-fold media, minimize initial scripts, code-split secondary pages, and avoid WebGL.

## Validation
- Verify all navigation and CTA destinations, menu/category/dish flows, cart edits and totals, checkout, reservations, confirmations, gallery, forms, account presentation, and protected admin entry.
- Test phone widths 360, 375, 390, and 430, then 768, 1024, 1280, 1440, and 1920 for overflow, clipping, readable type, stable controls, and image framing.
- Check browser errors, keyboard behavior, reduced motion, mobile menu, carousels, and final visual polish before completion.

## Assumptions
- Restaurant address, phone, chef identity, and menu copy will be clearly believable demo content because real operating details were not supplied.
- Ordering supports pickup and delivery in the demo; checkout does not charge a real card until a payment provider is connected.
