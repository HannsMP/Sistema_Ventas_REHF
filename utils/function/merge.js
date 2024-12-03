/** @typedef {{[key:string]:obj|string|number}} obj */
/**
 * @template T
 * @param {T} defaults
 * @param {Partial<T>} overrides
 * @returns {T}
 */
function mergeObjects(defaults, overrides = {}) {
  if (defaults?.constructor?.name != 'Object' || overrides?.constructor?.name != 'Object') return defaults;

  const result = {};

  for (const key in defaults) {
    if (!defaults.hasOwnProperty(key)) continue;

    result[key] = defaults[key]?.constructor?.name == 'Object'
      ? mergeObjects(defaults[key], overrides[key] || {})
      : result[key] = overrides.hasOwnProperty(key)
        ? overrides[key]
        : defaults[key];
  }

  return result;
}

module.exports = mergeObjects;