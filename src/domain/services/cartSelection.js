// Default selection policy: the first option returned by the API.
export function getDefaultCode(options) {
  return Array.isArray(options) && options.length > 0 ? options[0].code : null;
}

export function isValidSelection({ colorCode, storageCode } = {}) {
  return Number.isInteger(colorCode) && Number.isInteger(storageCode);
}
