/* =========================================================
   La Cocinita Borinqueña — shared storefront behaviour
   Multi-page: index / menu / pasteles / location
   i18n • cart (localStorage) • checkout • VIP
   ========================================================= */
(function () {
  "use strict";

  var TAX_RATE = 0.06625; // Sayreville, NJ
  var STORE = "365 Main St, Sayreville";
  var CART_KEY = "lcb-cart";

  /* ---------------------------------------------------------
     Shared chrome: cart drawer + modals, injected once so the
     cart works identically on every page.
     --------------------------------------------------------- */
  var CHROME = `
    <div class="drawer-overlay" id="drawerOverlay" hidden></div>
    <aside class="drawer" id="cartDrawer" aria-label="Shopping cart" aria-hidden="true">
      <header class="drawer-head">
        <div>
          <h2 data-i18n="cartTitle">Your Order</h2>
          <p id="cartHeadSub" data-i18n="cartHeadSub">Pickup at 365 Main St</p>
        </div>
        <button type="button" class="icon-btn" id="cartClose" aria-label="Close cart">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
        </button>
      </header>
      <div class="drawer-body">
        <div class="cart-empty" id="cartEmpty">
          <span class="empty-emoji">🛍️</span>
          <p data-i18n="cartEmptyTitle">Your bag is empty</p>
          <small data-i18n="cartEmptySub">Add some frituras — you know you want to.</small>
          <a class="btn btn-ghost btn-sm" href="menu.html" data-i18n="browseMenu">Browse the menu</a>
        </div>
        <ul class="cart-list" id="cartList"></ul>
        <div class="pickup" id="pickupBlock">
          <h3 data-i18n="pickupTitle">Pickup time</h3>
          <div class="pickup-opts">
            <label class="pickup-opt">
              <input type="radio" name="pickup" value="asap" checked />
              <span><strong data-i18n="pickupAsap">ASAP</strong><small data-i18n="pickupAsapSub">Ready in 15–20 mins</small></span>
            </label>
            <label class="pickup-opt">
              <input type="radio" name="pickup" value="scheduled" />
              <span><strong data-i18n="pickupSched">Scheduled</strong><small data-i18n="pickupSchedSub">Pick a time</small></span>
            </label>
          </div>
          <select id="pickupTime" class="select" aria-label="Scheduled pickup time" disabled></select>
        </div>
      </div>
      <footer class="drawer-foot">
        <div class="totals">
          <div class="totals-row"><span data-i18n="subtotal">Subtotal</span><span id="subtotal">$0.00</span></div>
          <div class="totals-row"><span data-i18n="tax">NJ Sales Tax (6.625%)</span><span id="tax">$0.00</span></div>
          <div class="totals-row total"><span data-i18n="total">Total</span><span id="total">$0.00</span></div>
        </div>
        <button type="button" class="btn btn-primary btn-block btn-lg" id="checkoutBtn" disabled>
          <svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor"><path d="M16.4 12.9c0-2 1.6-3 1.7-3-1-1.4-2.4-1.6-2.9-1.6-1.2-.1-2.4.7-3 .7s-1.6-.7-2.6-.7c-1.3 0-2.6.8-3.3 2-1.4 2.4-.4 6 1 8 .7 1 1.4 2 2.5 2 1 0 1.4-.6 2.6-.6s1.6.6 2.6.6 1.7-1 2.4-2c.7-1.1 1-2.2 1-2.2s-2-.8-2-3.2zM14.3 6.6c.5-.7.9-1.6.8-2.6-.8 0-1.8.6-2.4 1.3-.5.6-1 1.5-.8 2.5.9 0 1.8-.5 2.4-1.2z" /></svg>
          <span data-i18n="checkout">Checkout with Apple Pay / Card</span>
        </button>
        <p class="drawer-fine" data-i18n="drawerFine">Demo checkout — no real payment is processed.</p>
      </footer>
    </aside>

    <div class="modal" id="checkoutModal" role="dialog" aria-modal="true" aria-labelledby="checkoutTitle" hidden>
      <div class="modal-card modal-checkout">
        <button type="button" class="icon-btn modal-close" data-close-checkout aria-label="Close checkout">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
        </button>
        <div id="checkoutPane">
          <span class="pill pill-blue" data-i18n="checkoutBadge">Secure Demo Checkout</span>
          <h2 id="checkoutTitle" data-i18n="checkoutTitle">Almost eating.</h2>
          <p class="modal-sub" data-i18n="checkoutSub">Review your order, pick your payment method, and we'll get the fryer going.</p>
          <div class="co-summary" id="coSummary"></div>
          <div class="co-pickup" id="coPickup"></div>
          <button type="button" class="applepay" id="applePayBtn">
            <svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor"><path d="M16.4 12.9c0-2 1.6-3 1.7-3-1-1.4-2.4-1.6-2.9-1.6-1.2-.1-2.4.7-3 .7s-1.6-.7-2.6-.7c-1.3 0-2.6.8-3.3 2-1.4 2.4-.4 6 1 8 .7 1 1.4 2 2.5 2 1 0 1.4-.6 2.6-.6s1.6.6 2.6.6 1.7-1 2.4-2c.7-1.1 1-2.2 1-2.2s-2-.8-2-3.2zM14.3 6.6c.5-.7.9-1.6.8-2.6-.8 0-1.8.6-2.4 1.3-.5.6-1 1.5-.8 2.5.9 0 1.8-.5 2.4-1.2z" /></svg>
            <span data-i18n="payApple">Pay</span>
          </button>
          <div class="or"><span data-i18n="orPayCard">or pay with card</span></div>
          <form id="cardForm" novalidate>
            <label class="field">
              <span data-i18n="cardName">Name on card</span>
              <input type="text" name="cardName" autocomplete="cc-name" required data-i18n-placeholder="cardNamePh" placeholder="Maria Rivera" />
            </label>
            <label class="field">
              <span data-i18n="cardNumber">Card number</span>
              <input type="text" name="cardNumber" inputmode="numeric" autocomplete="cc-number" maxlength="19" required placeholder="4242 4242 4242 4242" />
            </label>
            <div class="field-row">
              <label class="field">
                <span data-i18n="cardExp">Expiry</span>
                <input type="text" name="cardExp" inputmode="numeric" autocomplete="cc-exp" maxlength="5" required placeholder="MM/YY" />
              </label>
              <label class="field">
                <span data-i18n="cardCvc">CVC</span>
                <input type="text" name="cardCvc" inputmode="numeric" autocomplete="cc-csc" maxlength="4" required placeholder="123" />
              </label>
            </div>
            <button type="submit" class="btn btn-primary btn-block btn-lg" data-i18n="placeOrder">Place Test Order</button>
          </form>
          <p class="modal-fine" data-i18n="checkoutFine">This is a demo storefront. No card is charged and no data is stored.</p>
        </div>
        <div class="ticket" id="ticketPane" hidden>
          <div class="ticket-check">✓</div>
          <h2 data-i18n-html="ticketTitle">Order #104 Confirmed</h2>
          <p class="ticket-sub" data-i18n="ticketSub">Ready for pickup at 365 Main St!</p>
          <div class="ticket-card">
            <div class="ticket-row"><span data-i18n="ticketPickup">Pickup</span><strong id="ticketPickup">ASAP · 15–20 mins</strong></div>
            <div class="ticket-row"><span data-i18n="ticketAddress">Address</span><strong>365 Main St, Sayreville</strong></div>
            <div class="ticket-row"><span data-i18n="ticketTotal">Total paid</span><strong id="ticketTotal">$0.00</strong></div>
            <ul class="ticket-items" id="ticketItems"></ul>
          </div>
          <p class="ticket-note" data-i18n="ticketNote">Show this screen at the counter. Your order number is your pickup ticket.</p>
          <button type="button" class="btn btn-primary btn-block btn-lg" data-close-checkout data-i18n="ticketDone">Done — I'll be there</button>
        </div>
      </div>
    </div>

    <div class="modal" id="vipModal" role="dialog" aria-modal="true" aria-labelledby="vipModalTitle" hidden>
      <div class="modal-card modal-vip">
        <button type="button" class="icon-btn modal-close" data-close-vip aria-label="Close">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
        </button>
        <div id="vipPane">
          <span class="pill pill-gold" data-i18n="vipModalBadge">Free Bite Included</span>
          <h2 id="vipModalTitle" data-i18n="vipFormTitle">Get on the list</h2>
          <p class="modal-sub" data-i18n="vipModalSub">Be the first to know when our doors open in Sayreville — plus a free bacalaíto or alcapurria on your first pickup.</p>
          <form id="vipModalForm" novalidate>
            <label class="field">
              <span data-i18n="fName">Name</span>
              <input type="text" name="name" autocomplete="name" required data-i18n-placeholder="fNamePh" placeholder="Your name" />
            </label>
            <label class="field">
              <span data-i18n="fPhone">Phone Number</span>
              <input type="tel" name="phone" autocomplete="tel" inputmode="tel" required data-i18n-placeholder="fPhonePh" placeholder="(732) 555-0134" />
            </label>
            <label class="field">
              <span data-i18n="fEmail">Email</span>
              <input type="email" name="email" autocomplete="email" required data-i18n-placeholder="fEmailPh" placeholder="you@email.com" />
            </label>
            <button type="submit" class="btn btn-primary btn-block btn-lg" data-i18n="vipSubmit">Save My Spot + Free Bite</button>
          </form>
          <div class="form-success" id="vipModalSuccess" hidden>
            <div class="success-badge">🎉</div>
            <h4 data-i18n="vipSuccessTitle">You're on the list!</h4>
            <p data-i18n="vipSuccessText">We'll text you on opening day. Show this message at the counter for your free bacalaíto or alcapurria.</p>
          </div>
        </div>
      </div>
    </div>

    <div class="toast" id="toast" role="status" aria-live="polite"></div>
  `;

  (function injectChrome() {
    var host = document.createElement("div");
    host.innerHTML = CHROME;
    while (host.firstChild) document.body.appendChild(host.firstChild);
  })();

  /* ---------------------------------------------------------
     Translations
     --------------------------------------------------------- */
  var I18N = {
    en: {
      announce: "🇵🇷 Grand Opening Coming Soon at 365 Main St, Sayreville, NJ • Holiday Pasteles Pre-Orders Open!",
      navMenu: "Menu",
      navPasteles: "Holiday Pasteles",
      navLocation: "Location & Hours",
      cartLabel: "Cart",
      crumbHome: "Home",

      heroBadge: "Coming Soon • Sayreville, NJ",
      heroTitle: "Authentic Puerto Rican Grab-and-Go<br><em>Made With Love.</em>",
      heroSub: "Bringing the authentic flavors of our island, our culture, and that signature sazón boricua to 365 Main Street, Sayreville. Skip the rush-hour phone wait—order ahead for fast pickup.",
      ctaOrder: "Order Grab-and-Go",
      ctaVip: "Join VIP Grand Opening List",
      heroPoint1: "Fresh-fried to order",
      heroPoint2: "Order ahead, skip the wait",
      heroPoint3: "Family recipes desde la isla",
      floatRatingTitle: "Hecho a mano",
      floatRatingSub: "Same-day fresh batches",
      floatPriceEyebrow: "Frituras desde",

      strip1Title: "Fried Fresh Daily",
      strip1Sub: "Never sitting under a lamp",
      strip2Title: "15–20 Min Pickup",
      strip2Sub: "Order ahead from your phone",
      strip3Title: "100% Sazón Boricua",
      strip3Sub: "Recipes passed down, not bought",

      pastelesRibbon: "Pre-Order Now",
      pastelesBadge: "Holiday Spotlight",
      pastelesTitle: "“Sin Pasteles No Hay Navidad”",
      pastelesLede: "Our pasteles are made the old way — green plantain masa, rich seasoned filling, wrapped by hand in banana leaf and parchment. Order your dozen now and pick up for the holidays.",
      pastelesSize: "Choose your size",
      sizeHalf: "Half-Dozen",
      sizeDozen: "Full Dozen",
      pastelesProtein: "Choose your filling",
      proteinPork: "Pork",
      proteinPorkEs: "Cerdo",
      proteinChicken: "Chicken",
      proteinChickenEs: "Pollo",
      pastelesCta: "Pre-Order for Holiday Pickup",
      pastelesNote: "Holiday pickup windows are limited. Pre-orders confirmed by text.",

      menuBadge: "Grab & Go Menu",
      menuTitle: "Order ahead. Eat well. Keep moving.",
      menuLede: "Every order is made fresh when you place it. Tap any item to build your pickup order — no phone call, no waiting on hold.",
      menuMeta: "Opening Menu Preview",
      filterAll: "All Favorites",
      filterFrituras: "Frituras & Antojitos",
      filterPasteles: "Holiday Pasteles",
      filterStaples: "House Staples",

      tagBestseller: "Bestseller",
      tagFresh: "Fried to Order",
      tagSweet: "Sweet & Savory",
      tagSampler: "Best Value",
      tagHoliday: "Holiday",
      tagPantry: "Pantry",

      item1Name: "Alcapurrias",
      item1Desc: "Crispy, golden homemade green banana & yautía fritters stuffed with seasoned beef.",
      item2Name: "Bacalaítos",
      item2Desc: "Large, crispy golden Puerto Rican salted codfish fritters fried fresh to order.",
      item3Name: "Rellenos de Plátano Maduro",
      item3Desc: "Sweet ripe plantain balls stuffed with savory seasoned picadillo.",
      item4Name: "Antojitos Borinqueños Sampler",
      item4Desc: "Grab-and-go box featuring alcapurrias, bacalaítos, and rellenos de plátano.",
      item5Name: "Holiday Pasteles (Dozen)",
      item5Desc: "Traditional Puerto Rican masa & seasoned meat wrapped in banana leaves.",
      item7Name: "Holiday Pasteles (Half-Dozen)",
      item7Desc: "Half a dozen of our hand-wrapped pasteles — perfect for a small gathering.",
      item6Name: "Fresh House Sofrito (16 oz Jar)",
      item6Desc: "Scratch-made blend of culantro, sweet peppers, garlic, and herbs.",
      add: "Add",
      menuDisclaimer: "*Opening Menu Preview — Final pricing updated at launch.",

      homeMenuKicker: "Menu Preview",
      homeMenuTitle: "Start with the favorites.",
      homeMenuLede: "A first look at what comes out of our fryer. Frituras, pasteles and house staples all live on the full menu — where you can build your pickup order.",
      viewFullMenu: "View Full Menu",
      teaserCta: "Pre-Order Holiday Pasteles",
      teaserNote: "Half-dozen $24 · Dozen $45 · Pork or chicken",
      homeLocTitle: "Come find us on Main Street.",
      viewLocation: "See Location & Hours",

      howTitle: "How holiday pre-orders work",
      how1T: "Pick your size & filling",
      how1D: "Half-dozen or full dozen, pork or chicken — both made from the same family recipe.",
      how2T: "Pre-order online",
      how2D: "Reserve your batch here, choose a pickup window, and check out in under a minute.",
      how3T: "Pick up at 365 Main St",
      how3D: "We text your confirmation. Bring your order number and we'll hand over the bag.",
      includesTitle: "What comes in your order",
      includes1: "Hand-wrapped pasteles, tied in banana leaf and parchment",
      includes2: "Green plantain masa with rich, slow-seasoned filling",
      includes3: "Reheating instructions tucked into every bag",
      includes4: "Holiday pickup at 365 Main Street, Sayreville",
      crosssellTitle: "Ordering for the holidays?",
      crosssellText: "Pasteles are pre-order only and run in limited batches. Reserve yours on the pasteles page.",
      crosssellCta: "Go to Holiday Pasteles",

      vipBadge: "Sayreville Locals Only",
      vipTitle: "Be first through the door — and eat free.",
      vipLede: "Join the VIP Grand Opening List and we'll text you the moment the fryer is on. Your first pickup order comes with a free bacalaíto or alcapurria, on us.",
      vipPerk1: "Opening-day alert before we post publicly",
      vipPerk2: "Free bacalaíto or alcapurria on your first order",
      vipPerk3: "First access to holiday pasteles pre-orders",
      vipFormTitle: "Get on the list",
      vipFormSub: "No spam. Just the opening date and your free bite.",
      fName: "Name",
      fNamePh: "Your name",
      fPhone: "Phone Number",
      fPhonePh: "(732) 555-0134",
      fEmail: "Email",
      fEmailPh: "you@email.com",
      vipSubmit: "Save My Spot + Free Bite",
      vipFine: "By joining you agree to receive opening updates by text or email. Reply STOP anytime.",
      vipSuccessTitle: "You're on the list!",
      vipSuccessText: "We'll text you on opening day. Show this message at the counter for your free bacalaíto or alcapurria.",
      vipModalBadge: "Free Bite Included",
      vipModalSub: "Be the first to know when our doors open in Sayreville — plus a free bacalaíto or alcapurria on your first pickup.",

      locBadge: "Find Us",
      locTitle: "365 Main Street, Sayreville",
      locLede: "Right on Main Street — pull up, grab your bag, keep it moving. Pre-orders are ready when you walk in.",
      locAddressLabel: "La Cocinita Borinqueña",
      getDirections: "Get Directions",
      locHoursTitle: "Hours",
      locHoursNote: "Our full weekly hours will be posted at launch. Follow us on Instagram for the opening-week schedule.",
      dayMonSat: "Monday – Saturday",
      daySun: "Sunday",
      hoursTbd: "Announced at launch",
      locCallTitle: "Call or text us",
      tapToCall: "Tap to call",

      footerBlurb: "Authentic Puerto Rican grab-and-go, made with love and sazón. Coming soon to Sayreville, New Jersey.",
      footerVisit: "Visit",
      footerExplore: "Explore",
      vipNav: "VIP List",
      rights: "All rights reserved.",
      footerMade: "Hecho con ❤️ y sazón boricua.",

      cartTitle: "Your Order",
      cartHeadSub: "Pickup at 365 Main St",
      cartEmptyTitle: "Your bag is empty",
      cartEmptySub: "Add some frituras — you know you want to.",
      browseMenu: "Browse the menu",
      pickupTitle: "Pickup time",
      pickupAsap: "ASAP",
      pickupAsapSub: "Ready in 15–20 mins",
      pickupSched: "Scheduled",
      pickupSchedSub: "Pick a time",
      subtotal: "Subtotal",
      tax: "NJ Sales Tax (6.625%)",
      total: "Total",
      checkout: "Checkout with Apple Pay / Card",
      drawerFine: "Demo checkout — no real payment is processed.",
      added: "Added to your order",
      removed: "Removed",

      checkoutBadge: "Secure Demo Checkout",
      checkoutTitle: "Almost eating.",
      checkoutSub: "Review your order, pick your payment method, and we'll get the fryer going.",
      payApple: "Pay",
      orPayCard: "or pay with card",
      cardName: "Name on card",
      cardNamePh: "Maria Rivera",
      cardNumber: "Card number",
      cardExp: "Expiry",
      cardCvc: "CVC",
      placeOrder: "Place Test Order",
      processing: "Processing…",
      checkoutFine: "This is a demo storefront. No card is charged and no data is stored.",

      ticketTitle: "Order #104 Confirmed",
      ticketSub: "Ready for pickup at 365 Main St!",
      ticketPickup: "Pickup",
      ticketAddress: "Address",
      ticketTotal: "Total paid",
      ticketNote: "Show this screen at the counter. Your order number is your pickup ticket.",
      ticketDone: "Done — I'll be there",
      asapLabel: "ASAP · 15–20 mins",
      scheduledLabel: "Scheduled pickup",
      emptyCartToast: "Your bag is empty — add something first."
    },

    es: {
      announce: "🇵🇷 ¡Gran Apertura Próximamente en 365 Main St, Sayreville, NJ • ¡Pre-Órdenes de Pasteles Navideños Abiertas!",
      navMenu: "Menú",
      navPasteles: "Pasteles Navideños",
      navLocation: "Ubicación y Horario",
      cartLabel: "Carrito",
      crumbHome: "Inicio",

      heroBadge: "Próximamente • Sayreville, NJ",
      heroTitle: "El Sabor de Puerto Rico<br><em>en Cada Bocado.</em>",
      heroSub: "Trayendo los sabores auténticos de nuestra isla, nuestra cultura y ese sazón boricua a 365 Main Street, Sayreville. Olvídate de esperar al teléfono en hora pico: ordena con tiempo y recoge rápido.",
      ctaOrder: "Ordena Para Llevar",
      ctaVip: "Únete a la Lista VIP",
      heroPoint1: "Frito fresco al ordenar",
      heroPoint2: "Ordena antes, evita la espera",
      heroPoint3: "Recetas de familia desde la isla",
      floatRatingTitle: "Hecho a mano",
      floatRatingSub: "Lotes frescos del día",
      floatPriceEyebrow: "Frituras desde",

      strip1Title: "Frito Fresco a Diario",
      strip1Sub: "Nunca bajo una lámpara",
      strip2Title: "Recogida en 15–20 Min",
      strip2Sub: "Ordena desde tu teléfono",
      strip3Title: "100% Sazón Boricua",
      strip3Sub: "Recetas heredadas, no compradas",

      pastelesRibbon: "Pre-Ordena Ya",
      pastelesBadge: "Especial de Navidad",
      pastelesTitle: "“Sin Pasteles No Hay Navidad”",
      pastelesLede: "Nuestros pasteles se hacen a la antigua: masa de plátano verde, relleno sazonado y envueltos a mano en hoja de plátano y papel de pergamino. Ordena tu docena ahora y recoge para las navidades.",
      pastelesSize: "Escoge el tamaño",
      sizeHalf: "Media Docena",
      sizeDozen: "Docena Completa",
      pastelesProtein: "Escoge el relleno",
      proteinPork: "Puerco",
      proteinPorkEs: "Cerdo",
      proteinChicken: "Pollo",
      proteinChickenEs: "Pollo",
      pastelesCta: "Pre-Ordena para Recogida Navideña",
      pastelesNote: "Los turnos de recogida navideña son limitados. Pre-órdenes confirmadas por texto.",

      menuBadge: "Menú Para Llevar",
      menuTitle: "Ordena antes. Come bien. Sigue tu camino.",
      menuLede: "Todo se prepara fresco cuando ordenas. Toca cualquier plato para armar tu orden — sin llamadas y sin esperar en línea.",
      menuMeta: "Vista Previa del Menú",
      filterAll: "Todos los Favoritos",
      filterFrituras: "Frituras y Antojitos",
      filterPasteles: "Pasteles Navideños",
      filterStaples: "De la Casa",

      tagBestseller: "Más Vendido",
      tagFresh: "Frito al Ordenar",
      tagSweet: "Dulce y Salado",
      tagSampler: "Mejor Valor",
      tagHoliday: "Navidad",
      tagPantry: "Despensa",

      item1Name: "Alcapurrias",
      item1Desc: "Frituras crujientes y doradas de guineo verde y yautía, rellenas de carne de res sazonada.",
      item2Name: "Bacalaítos",
      item2Desc: "Bacalaítos grandes y crujientes de bacalao, fritos frescos al momento de ordenar.",
      item3Name: "Rellenos de Plátano Maduro",
      item3Desc: "Bolitas dulces de plátano maduro rellenas de picadillo sazonado.",
      item4Name: "Sampler de Antojitos Borinqueños",
      item4Desc: "Cajita para llevar con alcapurrias, bacalaítos y rellenos de plátano.",
      item5Name: "Pasteles Navideños (Docena)",
      item5Desc: "Masa tradicional puertorriqueña y carne sazonada envuelta en hojas de plátano.",
      item7Name: "Pasteles Navideños (Media Docena)",
      item7Desc: "Media docena de nuestros pasteles envueltos a mano — ideal para una reunión pequeña.",
      item6Name: "Sofrito Casero Fresco (16 oz)",
      item6Desc: "Mezcla hecha desde cero con culantro, ajíes dulces, ajo y hierbas.",
      add: "Añadir",
      menuDisclaimer: "*Vista Previa del Menú — Precios finales actualizados en la apertura.",

      homeMenuKicker: "Vista del Menú",
      homeMenuTitle: "Empieza por los favoritos.",
      homeMenuLede: "Un primer vistazo a lo que sale de nuestra freidora. Frituras, pasteles y productos de la casa están en el menú completo — donde puedes armar tu orden.",
      viewFullMenu: "Ver el Menú Completo",
      teaserCta: "Pre-Ordena Pasteles Navideños",
      teaserNote: "Media docena $24 · Docena $45 · Cerdo o pollo",
      homeLocTitle: "Encuéntranos en Main Street.",
      viewLocation: "Ver Ubicación y Horario",

      howTitle: "Cómo funcionan las pre-órdenes",
      how1T: "Escoge tamaño y relleno",
      how1D: "Media docena o docena completa, cerdo o pollo — todos con la misma receta de familia.",
      how2T: "Pre-ordena en línea",
      how2D: "Reserva tu tanda aquí, escoge un turno de recogida y paga en menos de un minuto.",
      how3T: "Recoge en 365 Main St",
      how3D: "Te enviamos la confirmación por texto. Trae tu número de orden y te entregamos la bolsa.",
      includesTitle: "Qué incluye tu orden",
      includes1: "Pasteles envueltos a mano, atados en hoja de plátano y pergamino",
      includes2: "Masa de plátano verde con relleno sazonado a fuego lento",
      includes3: "Instrucciones de recalentado en cada bolsa",
      includes4: "Recogida navideña en 365 Main Street, Sayreville",
      crosssellTitle: "¿Ordenando para las fiestas?",
      crosssellText: "Los pasteles son solo por pre-orden y en tandas limitadas. Reserva los tuyos en la página de pasteles.",
      crosssellCta: "Ir a Pasteles Navideños",

      vipBadge: "Solo para Sayreville",
      vipTitle: "Sé el primero en entrar — y come gratis.",
      vipLede: "Únete a la Lista VIP de Gran Apertura y te texteamos en cuanto encendamos la freidora. Tu primera orden para llevar incluye un bacalaíto o una alcapurria gratis, por nuestra cuenta.",
      vipPerk1: "Aviso del día de apertura antes de publicarlo",
      vipPerk2: "Bacalaíto o alcapurria gratis en tu primera orden",
      vipPerk3: "Primer acceso a las pre-órdenes de pasteles",
      vipFormTitle: "Apúntate a la lista",
      vipFormSub: "Sin spam. Solo la fecha de apertura y tu bocado gratis.",
      fName: "Nombre",
      fNamePh: "Tu nombre",
      fPhone: "Teléfono",
      fPhonePh: "(732) 555-0134",
      fEmail: "Correo Electrónico",
      fEmailPh: "tu@correo.com",
      vipSubmit: "Guarda Mi Lugar + Bocado Gratis",
      vipFine: "Al unirte aceptas recibir avisos de apertura por texto o correo. Responde STOP cuando quieras.",
      vipSuccessTitle: "¡Ya estás en la lista!",
      vipSuccessText: "Te texteamos el día de la apertura. Muestra este mensaje en el mostrador para tu bacalaíto o alcapurria gratis.",
      vipModalBadge: "Bocado Gratis Incluido",
      vipModalSub: "Sé el primero en saber cuándo abrimos en Sayreville — más un bacalaíto o alcapurria gratis en tu primera recogida.",

      locBadge: "Encuéntranos",
      locTitle: "365 Main Street, Sayreville",
      locLede: "Justo en Main Street: llegas, recoges tu bolsa y sigues. Tus pre-órdenes están listas al entrar.",
      locAddressLabel: "La Cocinita Borinqueña",
      getDirections: "Cómo Llegar",
      locHoursTitle: "Horario",
      locHoursNote: "Nuestro horario semanal completo se publicará en la apertura. Síguenos en Instagram para el horario de la primera semana.",
      dayMonSat: "Lunes – Sábado",
      daySun: "Domingo",
      hoursTbd: "Se anuncia en la apertura",
      locCallTitle: "Llámanos o textea",
      tapToCall: "Toca para llamar",

      footerBlurb: "Auténtico para llevar puertorriqueño, hecho con amor y sazón. Próximamente en Sayreville, New Jersey.",
      footerVisit: "Visítanos",
      footerExplore: "Explora",
      vipNav: "Lista VIP",
      rights: "Todos los derechos reservados.",
      footerMade: "Hecho con ❤️ y sazón boricua.",

      cartTitle: "Tu Orden",
      cartHeadSub: "Recogida en 365 Main St",
      cartEmptyTitle: "Tu bolsa está vacía",
      cartEmptySub: "Añade unas frituras — sabes que quieres.",
      browseMenu: "Ver el menú",
      pickupTitle: "Hora de recogida",
      pickupAsap: "Lo Antes Posible",
      pickupAsapSub: "Listo en 15–20 mins",
      pickupSched: "Programada",
      pickupSchedSub: "Escoge una hora",
      subtotal: "Subtotal",
      tax: "Impuesto de NJ (6.625%)",
      total: "Total",
      checkout: "Pagar con Apple Pay / Tarjeta",
      drawerFine: "Checkout de demostración — no se procesa pago real.",
      added: "Añadido a tu orden",
      removed: "Eliminado",

      checkoutBadge: "Checkout Seguro (Demo)",
      checkoutTitle: "Casi comiendo.",
      checkoutSub: "Revisa tu orden, escoge cómo pagar y encendemos la freidora.",
      payApple: "Pagar",
      orPayCard: "o paga con tarjeta",
      cardName: "Nombre en la tarjeta",
      cardNamePh: "Maria Rivera",
      cardNumber: "Número de tarjeta",
      cardExp: "Vence",
      cardCvc: "CVC",
      placeOrder: "Colocar Orden de Prueba",
      processing: "Procesando…",
      checkoutFine: "Esta es una tienda de demostración. No se cobra ninguna tarjeta y no se guardan datos.",

      ticketTitle: "Orden #104 Confirmada",
      ticketSub: "¡Lista para recoger en 365 Main St!",
      ticketPickup: "Recogida",
      ticketAddress: "Dirección",
      ticketTotal: "Total pagado",
      ticketNote: "Muestra esta pantalla en el mostrador. Tu número de orden es tu ticket de recogida.",
      ticketDone: "Listo — allí estaré",
      asapLabel: "Lo antes posible · 15–20 mins",
      scheduledLabel: "Recogida programada",
      emptyCartToast: "Tu bolsa está vacía — añade algo primero."
    }
  };

  /* ---------------------------------------------------------
     Helpers
     --------------------------------------------------------- */
  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function money(n) { return "$" + n.toFixed(2); }

  var lang = "en";
  try {
    var savedLang = localStorage.getItem("lcb-lang");
    if (savedLang === "es" || savedLang === "en") lang = savedLang;
  } catch (e) { /* private mode */ }

  function t(key) {
    return (I18N[lang] && I18N[lang][key]) || I18N.en[key] || key;
  }

  /* ---------------------------------------------------------
     Cart state (persisted across pages)
     --------------------------------------------------------- */
  var cart = [];
  try {
    var rawCart = JSON.parse(localStorage.getItem(CART_KEY) || "[]");
    if (Array.isArray(rawCart)) cart = rawCart.filter(function (ci) { return ci && ci.id && ci.qty > 0; });
  } catch (e) { cart = []; }

  function saveCart() {
    try { localStorage.setItem(CART_KEY, JSON.stringify(cart)); } catch (e) { /* quota / private mode */ }
  }

  function variantLabel(v) {
    if (!v) return "";
    return v === "pork" ? t("proteinPork") : t("proteinChicken");
  }

  function itemName(ci) { return lang === "es" ? (ci.nameEs || ci.name) : ci.name; }

  function cartTotals() {
    var sub = 0;
    cart.forEach(function (ci) { sub += ci.price * ci.qty; });
    return { sub: sub, tax: sub * TAX_RATE, total: sub + sub * TAX_RATE };
  }

  /* ---------------------------------------------------------
     Language
     --------------------------------------------------------- */
  function applyLanguage(next) {
    lang = next;
    document.documentElement.lang = lang;
    try { localStorage.setItem("lcb-lang", lang); } catch (e) {}

    $$("[data-i18n]").forEach(function (el) {
      var val = t(el.getAttribute("data-i18n"));
      if (val) el.textContent = val;
    });
    $$("[data-i18n-html]").forEach(function (el) {
      var val = t(el.getAttribute("data-i18n-html"));
      if (val) el.innerHTML = val;
    });
    $$("[data-i18n-placeholder]").forEach(function (el) {
      var val = t(el.getAttribute("data-i18n-placeholder"));
      if (val) el.setAttribute("placeholder", val);
    });

    $$(".lang-btn").forEach(function (b) {
      var on = b.getAttribute("data-lang") === lang;
      b.classList.toggle("is-active", on);
      b.setAttribute("aria-pressed", on ? "true" : "false");
    });

    renderCart();
    buildPickupSlots();
  }

  $$(".lang-btn").forEach(function (b) {
    b.addEventListener("click", function () {
      if (b.getAttribute("data-lang") !== lang) applyLanguage(b.getAttribute("data-lang"));
    });
  });

  /* ---------------------------------------------------------
     Nav
     --------------------------------------------------------- */
  var nav = $("#nav");
  if (nav) {
    var onScroll = function () { nav.classList.toggle("is-stuck", window.scrollY > 8); };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  var burger = $("#burger");
  var mobileMenu = $("#mobileMenu");
  function closeMobileMenu() {
    if (!mobileMenu) return;
    mobileMenu.classList.remove("open");
    if (burger) burger.setAttribute("aria-expanded", "false");
  }
  if (burger && mobileMenu) {
    burger.addEventListener("click", function () {
      var open = mobileMenu.classList.toggle("open");
      burger.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  /* ---------------------------------------------------------
     Toast
     --------------------------------------------------------- */
  var toastEl = $("#toast");
  var toastTimer;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove("show"); }, 2200);
  }

  /* ---------------------------------------------------------
     Cart rendering
     --------------------------------------------------------- */
  var drawer = $("#cartDrawer");
  var overlay = $("#drawerOverlay");

  function bumpCount() {
    var el = $("#cartCount");
    el.classList.remove("bump");
    void el.offsetWidth;
    el.classList.add("bump");
  }

  function renderCart() {
    var list = $("#cartList");
    if (!list) return;
    var empty = $("#cartEmpty");
    var pickupBlock = $("#pickupBlock");
    var count = cart.reduce(function (n, ci) { return n + ci.qty; }, 0);

    $("#cartCount").textContent = count;

    list.innerHTML = cart.map(function (ci, idx) {
      var v = variantLabel(ci.variant);
      return '<li class="cart-item">' +
        '<div><h4>' + escapeHtml(itemName(ci)) + '</h4>' +
        (v ? '<span class="ci-meta">' + escapeHtml(v) + '</span>' : '') +
        '</div>' +
        '<div class="ci-price">' + money(ci.price * ci.qty) + '</div>' +
        '<div class="ci-controls">' +
          '<div class="qty">' +
            '<button type="button" data-qty="-1" data-idx="' + idx + '" aria-label="Decrease quantity">−</button>' +
            '<span>' + ci.qty + '</span>' +
            '<button type="button" data-qty="1" data-idx="' + idx + '" aria-label="Increase quantity">+</button>' +
          '</div>' +
          '<button type="button" class="ci-remove" data-remove="' + idx + '">' + (lang === "es" ? "Quitar" : "Remove") + '</button>' +
        '</div>' +
      '</li>';
    }).join("");

    empty.hidden = cart.length > 0;
    list.hidden = cart.length === 0;
    pickupBlock.hidden = cart.length === 0;

    var totals = cartTotals();
    $("#subtotal").textContent = money(totals.sub);
    $("#tax").textContent = money(totals.tax);
    $("#total").textContent = money(totals.total);
    $("#checkoutBtn").disabled = cart.length === 0;
  }

  function addToCart(item) {
    var key = item.id + "|" + (item.variant || "");
    var found = null;
    for (var i = 0; i < cart.length; i++) {
      if (cart[i].key === key) { found = cart[i]; break; }
    }
    if (found) found.qty += 1;
    else cart.push({
      key: key,
      id: item.id,
      name: item.name,
      nameEs: item.nameEs || item.name,
      price: item.price,
      variant: item.variant || "",
      qty: 1
    });
    saveCart();
    renderCart();
    bumpCount();
    toast(t("added"));
  }

  $("#cartList").addEventListener("click", function (e) {
    var qtyBtn = e.target.closest("[data-qty]");
    if (qtyBtn) {
      var i = parseInt(qtyBtn.getAttribute("data-idx"), 10);
      cart[i].qty += parseInt(qtyBtn.getAttribute("data-qty"), 10);
      if (cart[i].qty < 1) cart.splice(i, 1);
      saveCart();
      renderCart();
      return;
    }
    var rm = e.target.closest("[data-remove]");
    if (rm) {
      cart.splice(parseInt(rm.getAttribute("data-remove"), 10), 1);
      saveCart();
      renderCart();
      toast(t("removed"));
    }
  });

  /* ---------------------------------------------------------
     Drawer
     --------------------------------------------------------- */
  function openDrawer() {
    drawer.classList.add("open");
    drawer.setAttribute("aria-hidden", "false");
    overlay.hidden = false;
    requestAnimationFrame(function () { overlay.classList.add("show"); });
    document.body.classList.add("is-locked");
    closeMobileMenu();
    setTimeout(function () { $("#cartClose").focus(); }, 220);
  }
  function closeDrawer() {
    drawer.classList.remove("open");
    drawer.setAttribute("aria-hidden", "true");
    overlay.classList.remove("show");
    document.body.classList.remove("is-locked");
    setTimeout(function () { overlay.hidden = true; }, 320);
  }
  $("#cartOpen").addEventListener("click", openDrawer);
  $("#cartClose").addEventListener("click", closeDrawer);
  overlay.addEventListener("click", closeDrawer);

  /* ---------------------------------------------------------
     Add-to-cart buttons
     --------------------------------------------------------- */
  $$("[data-add]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var variant = "";
      if (btn.hasAttribute("data-variant-source")) {
        var card = btn.closest(".card");
        var activeMini = card ? card.querySelector(".mini-btn.is-active") : null;
        variant = activeMini ? activeMini.getAttribute("data-variant") : "pork";
      }
      addToCart({
        id: btn.getAttribute("data-id"),
        name: btn.getAttribute("data-name"),
        nameEs: btn.getAttribute("data-name-es") || btn.getAttribute("data-name"),
        price: parseFloat(btn.getAttribute("data-price")),
        variant: variant
      });
    });
  });

  $$(".mini-seg").forEach(function (seg) {
    seg.addEventListener("click", function (e) {
      var b = e.target.closest(".mini-btn");
      if (!b) return;
      $$(".mini-btn", seg).forEach(function (x) { x.classList.remove("is-active"); });
      b.classList.add("is-active");
    });
  });

  /* ---------------------------------------------------------
     Pasteles page builder
     --------------------------------------------------------- */
  if ($("#pastelesAdd")) {
    var pastelesState = { size: "half", protein: "pork" };
    var SIZE = {
      half: { price: 24, en: "Holiday Pasteles (Half-Dozen)", es: "Pasteles Navideños (Media Docena)", id: "pasteles-half" },
      dozen: { price: 45, en: "Holiday Pasteles (Dozen)", es: "Pasteles Navideños (Docena)", id: "pasteles-dozen" }
    };

    var syncPasteles = function () {
      $$("[data-pasteles-size]").forEach(function (b) {
        b.classList.toggle("is-active", b.getAttribute("data-pasteles-size") === pastelesState.size);
      });
      $$("[data-pasteles-protein]").forEach(function (b) {
        b.classList.toggle("is-active", b.getAttribute("data-pasteles-protein") === pastelesState.protein);
      });
      $("#pastelesPrice").textContent = money(SIZE[pastelesState.size].price);
    };

    $$("[data-pasteles-size]").forEach(function (b) {
      b.addEventListener("click", function () {
        pastelesState.size = b.getAttribute("data-pasteles-size");
        syncPasteles();
      });
    });
    $$("[data-pasteles-protein]").forEach(function (b) {
      b.addEventListener("click", function () {
        pastelesState.protein = b.getAttribute("data-pasteles-protein");
        syncPasteles();
      });
    });

    $("#pastelesAdd").addEventListener("click", function () {
      var s = SIZE[pastelesState.size];
      addToCart({ id: s.id, name: s.en, nameEs: s.es, price: s.price, variant: pastelesState.protein });
      openDrawer();
    });

    syncPasteles();
  }

  /* ---------------------------------------------------------
     Menu filters
     --------------------------------------------------------- */
  $$(".filter").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var filter = btn.getAttribute("data-filter");
      $$(".filter").forEach(function (b) {
        var on = b === btn;
        b.classList.toggle("is-active", on);
        b.setAttribute("aria-selected", on ? "true" : "false");
      });
      $$("#cards .card").forEach(function (card) {
        var show = filter === "all" || card.getAttribute("data-category") === filter;
        card.classList.toggle("hide", !show);
      });
    });
  });

  /* ---------------------------------------------------------
     Pickup time
     --------------------------------------------------------- */
  var pickupSelect = $("#pickupTime");

  function nextSlots() {
    var out = [];
    var now = new Date();
    now.setMinutes(now.getMinutes() + 45);
    var mins = now.getMinutes();
    now.setMinutes(mins <= 15 ? 15 : mins <= 30 ? 30 : mins <= 45 ? 45 : 60, 0, 0);
    for (var i = 0; i < 8; i++) out.push(new Date(now.getTime() + i * 30 * 60000));
    return out;
  }

  function fmtTime(d) {
    var h = d.getHours(), m = d.getMinutes();
    return (h % 12 || 12) + ":" + (m < 10 ? "0" + m : m) + " " + (h >= 12 ? "PM" : "AM");
  }

  function buildPickupSlots() {
    if (!pickupSelect) return;
    var slots = nextSlots();
    var current = pickupSelect.value;
    pickupSelect.innerHTML = slots.map(function (d) {
      var label = fmtTime(d);
      return '<option value="' + label + '">' + label + '</option>';
    }).join("");
    if (current && slots.some(function (d) { return fmtTime(d) === current; })) pickupSelect.value = current;
  }

  $$("input[name='pickup']").forEach(function (r) {
    r.addEventListener("change", function () {
      pickupSelect.disabled = r.value !== "scheduled" || !r.checked;
    });
  });

  function pickupSummary() {
    var mode = $("input[name='pickup']:checked");
    if (mode && mode.value === "scheduled") return t("scheduledLabel") + " · " + pickupSelect.value;
    return t("asapLabel");
  }

  /* ---------------------------------------------------------
     Checkout
     --------------------------------------------------------- */
  var checkoutModal = $("#checkoutModal");
  var vipModal = $("#vipModal");
  var lastFocus = null;

  function openModal(el) {
    lastFocus = document.activeElement;
    el.hidden = false;
    requestAnimationFrame(function () {
      el.classList.add("show");
      document.body.classList.add("is-locked");
    });
  }
  function closeModal(el) {
    el.classList.remove("show");
    document.body.classList.remove("is-locked");
    setTimeout(function () {
      el.hidden = true;
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    }, 300);
  }

  function renderCheckoutSummary() {
    var totals = cartTotals();
    var rows = cart.map(function (ci) {
      var v = variantLabel(ci.variant);
      return '<div class="co-line"><span>' + ci.qty + ' × ' + escapeHtml(itemName(ci)) +
        (v ? ' <span class="co-opt">(' + escapeHtml(v) + ')</span>' : '') +
        '</span><strong>' + money(ci.price * ci.qty) + '</strong></div>';
    }).join("");

    $("#coSummary").innerHTML = rows +
      '<div class="co-line"><span>' + t("subtotal") + '</span><strong>' + money(totals.sub) + '</strong></div>' +
      '<div class="co-line"><span>' + t("tax") + '</span><strong>' + money(totals.tax) + '</strong></div>' +
      '<div class="co-line co-total"><span>' + t("total") + '</span><strong>' + money(totals.total) + '</strong></div>';

    $("#coPickup").innerHTML =
      '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>' +
      '<span>' + escapeHtml(pickupSummary()) + ' · ' + STORE + '</span>';
  }

  $("#checkoutBtn").addEventListener("click", function () {
    if (!cart.length) { toast(t("emptyCartToast")); return; }
    renderCheckoutSummary();
    $("#checkoutPane").hidden = false;
    $("#ticketPane").hidden = true;
    closeDrawer();
    setTimeout(function () { openModal(checkoutModal); }, 180);
  });

  $$("[data-close-checkout]").forEach(function (b) {
    b.addEventListener("click", function () { closeModal(checkoutModal); });
  });

  var cardNumber = $("input[name='cardNumber']");
  var cardExp = $("input[name='cardExp']");
  var cardCvc = $("input[name='cardCvc']");

  cardNumber.addEventListener("input", function () {
    var digits = cardNumber.value.replace(/\D/g, "").slice(0, 16);
    cardNumber.value = digits.replace(/(.{4})/g, "$1 ").trim();
  });
  cardExp.addEventListener("input", function () {
    var d = cardExp.value.replace(/\D/g, "").slice(0, 4);
    cardExp.value = d.length > 2 ? d.slice(0, 2) + "/" + d.slice(2) : d;
  });
  cardCvc.addEventListener("input", function () {
    cardCvc.value = cardCvc.value.replace(/\D/g, "").slice(0, 4);
  });

  function flashInvalid(input) {
    input.classList.add("invalid");
    input.addEventListener("input", function handler() {
      input.classList.remove("invalid");
      input.removeEventListener("input", handler);
    });
  }

  function validCardForm() {
    var ok = true;
    var name = $("input[name='cardName']");
    var parts = cardExp.value.split("/");
    var expOk = parts.length === 2 && parts[0].length === 2 && parts[1].length === 2 &&
      parseInt(parts[0], 10) >= 1 && parseInt(parts[0], 10) <= 12;

    var checks = [
      [name, name.value.trim().length >= 2],
      [cardNumber, cardNumber.value.replace(/\s/g, "").length >= 15],
      [cardExp, expOk],
      [cardCvc, cardCvc.value.length >= 3]
    ];
    checks.forEach(function (c) { if (!c[1]) { flashInvalid(c[0]); ok = false; } });
    if (!ok) {
      var firstBad = checks.filter(function (c) { return !c[1]; })[0];
      if (firstBad) firstBad[0].focus();
    }
    return ok;
  }

  function completeOrder() {
    var captured = cart.slice();
    var totals = cartTotals();

    $("#ticketPickup").textContent = pickupSummary();
    $("#ticketTotal").textContent = money(totals.total);
    $("#ticketItems").innerHTML = captured.map(function (ci) {
      var v = variantLabel(ci.variant);
      return "<li>" + ci.qty + " × " + escapeHtml(itemName(ci)) +
        (v ? " (" + escapeHtml(v) + ")" : "") + " — " + money(ci.price * ci.qty) + "</li>";
    }).join("");

    cart = [];
    saveCart();
    renderCart();
    $("#checkoutPane").hidden = true;
    $("#ticketPane").hidden = false;
    checkoutModal.querySelector(".modal-checkout").scrollTop = 0;
  }

  function runPayment(btn) {
    if (!cart.length) return;
    var original = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = "<span>" + t("processing") + "</span>";
    setTimeout(function () {
      btn.disabled = false;
      btn.innerHTML = original;
      completeOrder();
    }, 1400);
  }

  $("#applePayBtn").addEventListener("click", function () { runPayment(this); });
  $("#cardForm").addEventListener("submit", function (e) {
    e.preventDefault();
    if (!validCardForm()) return;
    runPayment($("#cardForm button[type='submit']"));
  });

  /* demo card so the client can click straight through */
  $("input[name='cardName']").value = "Maria Rivera";
  cardNumber.value = "4242 4242 4242 4242";
  cardExp.value = "12/29";
  cardCvc.value = "123";

  checkoutModal.addEventListener("click", function (e) {
    if (e.target === checkoutModal) closeModal(checkoutModal);
  });

  /* ---------------------------------------------------------
     VIP forms
     --------------------------------------------------------- */
  function handleVip(form, successEl) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var ok = true;
      $$("input", form).forEach(function (input) {
        var val = input.value.trim();
        var valid = val.length > 0;
        if (input.type === "email") valid = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(val);
        if (input.type === "tel") valid = val.replace(/\D/g, "").length >= 10;
        if (!valid) { flashInvalid(input); ok = false; }
      });
      if (!ok) return;
      form.hidden = true;
      successEl.hidden = false;
      successEl.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  }

  if ($("#vipForm")) handleVip($("#vipForm"), $("#vipSuccess"));
  handleVip($("#vipModalForm"), $("#vipModalSuccess"));

  $$("[data-open-vip]").forEach(function (b) {
    b.addEventListener("click", function () { openModal(vipModal); });
  });
  $$("[data-close-vip]").forEach(function (b) {
    b.addEventListener("click", function () { closeModal(vipModal); });
  });
  vipModal.addEventListener("click", function (e) {
    if (e.target === vipModal) closeModal(vipModal);
  });

  /* ---------------------------------------------------------
     Keyboard
     --------------------------------------------------------- */
  document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape") return;
    if (drawer.classList.contains("open")) closeDrawer();
    if (checkoutModal && !checkoutModal.hidden) closeModal(checkoutModal);
    if (vipModal && !vipModal.hidden) closeModal(vipModal);
    closeMobileMenu();
  });

  /* ---------------------------------------------------------
     Init
     --------------------------------------------------------- */
  var yearEl = $("#year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
  applyLanguage(lang);

  // Image safety net: warm gradient instead of a broken icon.
  $$("img").forEach(function (img) {
    img.addEventListener("error", function () {
      img.style.display = "none";
      if (img.parentElement) img.parentElement.style.background = "linear-gradient(140deg,#F3EBDF,#E6DCCA)";
    });
  });
})();
