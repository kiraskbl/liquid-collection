/**
 * @typedef {Object} Variant
 * @property {number} id
 * @property {number} price
 * @property {number|null} compare_at_price
 * @property {string|null} featured_image
 * @property {string|null} compare_image
 * @property {string} url
 * @property {boolean} available
 * @property {boolean} on_sale
 */

/** DOM Selectors */
const SELECTORS = {
  PRODUCT_CARD: '.product-card',
  VARIANTS_JSON: '.product-variants-json',
  SWATCHES: '.variant-swatches',
  SWATCH: '.swatch',
  MEDIA: '.product-media',
  SECONDARY_MEDIA: '.product-secondary-media',
  PDP_REDIRECT: '.pdp-redirect',
  ORIGINAL_PRICE: '.original-price',
  COMPARE_PRICE: '.compare-price',
  STATUS_BADGE: '.product-store-status',
  QUICK_ADD_FORM: '.quick-add-form',
  VARIANT_ID_INPUT: '.variant-id-input',
  ADD_TO_CART_BUTTON: 'button[type="submit"]',
  ADD_TO_CART_ICON: 'svg'
};

/**
 * Format currency amount
 * @param {number} cents - Amount in cents
 * @param {string} [format=${{amount}}] - Format string
 * @returns {string} Formatted currency string
 */
const formatMoney = (cents, format = window.shopCurrencyFormat || "${{amount}}") => {
  if (typeof cents !== 'number') {
    throw new Error('cents must be a number');
  }
  const amount = (cents / 100).toFixed(2);
  return format
    .replace("{{amount}}", amount)
    .replace("{{amount_no_decimals}}", Math.round(cents / 100));
};

/**
 * Update image source
 * @param {HTMLElement} parent - Parent element
 * @param {string} selector - Image selector
 * @param {string} src - Image source URL
 */
const updateMedia = (parent, selector, src) => {
  const imageElement = parent.querySelector(selector);
  if (imageElement && src) {
    imageElement.src = src;
  }
};

/**
 * Update price elements
 * @param {HTMLElement} productCard - Product card element
 * @param {Variant} variant - Selected variant
 */
const updatePrices = (productCard, variant) => {
  const priceElement = productCard.querySelector(SELECTORS.ORIGINAL_PRICE);
  if (priceElement) {
    priceElement.textContent = formatMoney(variant.price);
  }

  const comparePriceElement = productCard.querySelector(SELECTORS.COMPARE_PRICE);
  if (comparePriceElement) {
    if (variant.compare_at_price) {
      comparePriceElement.textContent = formatMoney(variant.compare_at_price);
      comparePriceElement.classList.remove('hidden');
      priceElement?.classList.add('text-accent');
    } else {
      comparePriceElement.textContent = '';
      comparePriceElement.classList.add('hidden');
      priceElement?.classList.remove('text-accent');
    }
  }
};

/**
 * Update status badge
 * @param {HTMLElement} productCard - Product card element
 * @param {Variant} variant - Selected variant
 */
const updateStatusBadge = (productCard, variant) => {
  const statusBadge = productCard.querySelector(SELECTORS.STATUS_BADGE);
  if (!statusBadge) return;

  if (variant.available) {
    if (variant.on_sale) {
      statusBadge.textContent = 'On Sale!';
      statusBadge.classList.add('text-accent');
      statusBadge.classList.remove('hidden', 'text-grey-10');
    } else {
      statusBadge.textContent = '';
      statusBadge.classList.add('hidden');
      statusBadge.classList.remove('text-accent', 'text-grey-10');
    }
  } else {
    statusBadge.textContent = 'Sold Out';
    statusBadge.classList.add('text-grey-10');
    statusBadge.classList.remove('hidden', 'text-accent');
  }
};

/**
 * Update add to cart button state
 * @param {HTMLElement} productCard - Product card element
 * @param {Variant} variant - Selected variant
 */
const updateAddToCartButton = (productCard, variant) => {
  const quickAddForm = productCard.querySelector(SELECTORS.QUICK_ADD_FORM);
  if (!quickAddForm) return;

  const hiddenInput = quickAddForm.querySelector(SELECTORS.VARIANT_ID_INPUT);
  if (hiddenInput) {
    hiddenInput.value = variant.id;
  }

  const button = quickAddForm.querySelector(SELECTORS.ADD_TO_CART_BUTTON);
  if (!button) return;

  const svg = button.querySelector(SELECTORS.ADD_TO_CART_ICON);
  if (svg) {
    svg.setAttribute('title', variant.available ? 'Add to Cart' : 'Sold Out');
  }

  if (variant.available) {
    button.removeAttribute('disabled');
  } else {
    button.setAttribute('disabled', '');
  }
};

/**
 * Handle variant selection
 * @param {number} variantId - Selected variant ID
 */
const selectVariant = (variantId) => {
  const button = event.target;
  const productCard = button.closest(SELECTORS.PRODUCT_CARD);

  if (!productCard) return;

  try {
    const variantsJson = productCard.querySelector(SELECTORS.VARIANTS_JSON);
    if (!variantsJson) return;

    const variants = JSON.parse(variantsJson.textContent);
    const variant = variants.find(v => v.id === variantId);
    if (!variant) return;

    // Update selected swatch styling
    const swatchButtons = button.closest(SELECTORS.SWATCHES)?.querySelectorAll(SELECTORS.SWATCH);
    if (swatchButtons) {
      swatchButtons.forEach(btn => btn.classList.remove('border', 'border-active'));
      const targetParent = button.closest(SELECTORS.SWATCH);
      if (targetParent) {
        targetParent.classList.add('border', 'border-active');
      }
    }

    // Update media
    updateMedia(productCard, SELECTORS.MEDIA, variant.featured_image);
    updateMedia(productCard, SELECTORS.SECONDARY_MEDIA, variant.compare_image);

    // Update PDP link
    const link = productCard.querySelector(SELECTORS.PDP_REDIRECT);
    if (link) {
      link.href = variant.url;
    }

    // Update prices, atc and status
    updatePrices(productCard, variant);
    updateStatusBadge(productCard, variant);
    updateAddToCartButton(productCard, variant);

  } catch (error) {
    console.error('Error updating variant:', error);
  }
};
