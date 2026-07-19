// Pure mappers that normalize the wire format into the shapes the app
// consumes. The API has quirks the rest of the code must never see:
// misspelled fields (`dimentions`, `secondaryCmera`), values that arrive
// either as a string or an array, and empty strings for unknown data.
// Unknown/empty values are always normalized to `null` so the UI can
// render a fallback without ever printing `undefined` or `NaN`.

function toText(value) {
  if (Array.isArray(value)) value = value.filter(Boolean).join(', ');
  if (typeof value === 'number') value = String(value);
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed || null;
}

function toPrice(value) {
  const text = toText(value);
  return text ? `${text} €` : null;
}

function toWeight(value) {
  const text = toText(value);
  if (!text) return null;
  // The API sends bare grams ("260"); values that already carry units pass through.
  return /^\d+(\.\d+)?$/.test(text) ? `${text} g` : text;
}

function mapOptions(list) {
  if (!Array.isArray(list)) return [];
  return list
    .filter((option) => option && option.code !== undefined && option.code !== null)
    .map((option) => ({ code: option.code, name: toText(option.name) ?? String(option.code) }));
}

export function mapProductListItem(raw = {}) {
  return {
    id: raw.id ?? '',
    brand: toText(raw.brand) ?? '',
    model: toText(raw.model) ?? '',
    price: toPrice(raw.price),
    imgUrl: toText(raw.imgUrl),
  };
}

export function mapProductDetail(raw = {}) {
  return {
    ...mapProductListItem(raw),
    specs: {
      cpu: toText(raw.cpu),
      ram: toText(raw.ram),
      os: toText(raw.os),
      displayResolution: toText(raw.displayResolution),
      battery: toText(raw.battery),
      primaryCamera: toText(raw.primaryCamera),
      secondaryCamera: toText(raw.secondaryCmera),
      dimensions: toText(raw.dimentions),
      weight: toWeight(raw.weight),
    },
    colors: mapOptions(raw.options?.colors),
    storages: mapOptions(raw.options?.storages),
  };
}
