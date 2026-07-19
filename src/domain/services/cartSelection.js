// Default selection policy: when a product offers several options the
// first one returned by the API is preselected (documented in the README).
export function getDefaultCode(options) {
  return Array.isArray(options) && options.length > 0 ? options[0].code : null;
}

// The API expects numeric codes; anything else means the UI state is broken
// and the POST must not be attempted.
export function isValidSelection({ colorCode, storageCode } = {}) {
  return Number.isInteger(colorCode) && Number.isInteger(storageCode);
}
