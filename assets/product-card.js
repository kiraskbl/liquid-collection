const selectVariant = (variantId) => {
  const button = event.target;
  const productCard = button.closest('.product-card');

  // Get variants data from JSON
  const variantsJson = productCard.querySelector('.product-variants-json');
  if (!variantsJson) return;

  const variants = JSON.parse(variantsJson.textContent);
  // Added type definition for clarity
  /**
   * @typedef {Object} Variant
   * @property {number} id
   * @property {number} price
   * @property {number|null} compare_at_price
   * @property {string|null} featured_image
   * @property {string|null} compare_image
   * @property {string} url
   */
  const variant = variants.find(variant => variant.id === variantId);

  if (!variant) return;

  // Update styling to show selected swatch
  const swatchButtons = button.closest('.variant-swatches').querySelectorAll('.swatch');
  swatchButtons.forEach(btn => btn.classList.remove('border', 'border-active'));
  const targetParent = button.closest('.swatch');
  targetParent.classList.add('border', 'border-active');
  // Finish active swatch update

  // Update card image based on selected variant passed as button data attributes
  updateMedia(productCard, '.product-media', variant.featured_image);
  updateMedia(productCard, '.product-secondary-media', variant.compare_image);
  // Finish media update

  //Update URL to PDP with variant id
  const link = productCard.querySelector('.pdp-redirect');
  if (link) {
    link.href = variant.url;
  }
  // Finish URL update

  // Update Prices
  const priceElement = productCard.querySelector('.original-price');
  if (priceElement) {
    priceElement.textContent = formatMoney(variant.price);
  }

  const comparePriceElement = productCard.querySelector('.compare-price');
  if (comparePriceElement) {
    if (variant.compare_at_price) {
      comparePriceElement.textContent = formatMoney(variant.compare_at_price);
      comparePriceElement.classList.remove('hidden');
      priceElement.classList.add('text-accent');
    } else {
      comparePriceElement.textContent = '';
      comparePriceElement.classList.add('hidden');
      priceElement.classList.remove('text-accent');
    }
  }
  // Finish price update
}

const updateMedia = (parent, selector, src) => {
  const imageElement = parent.querySelector(selector);

  if (imageElement && src) {
    imageElement.src = src;
  }
}

const formatMoney = (cents, format = window.shopCurrencyFormat || "${{amount}}") => {
  const amount = (cents / 100).toFixed(2);
  return format.replace("{{amount}}", amount).replace("{{amount_no_decimals}}", Math.round(cents / 100));
}
