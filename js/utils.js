/* ==========================================================================
   🪷 SADHANA MONITOR — SECURITY UTILITIES (js/utils.js)
   ========================================================================== */

/**
 * Escapes unsafe HTML characters to protect against XSS (Cross-Site Scripting) attacks.
 * @param {string} str - Raw user input string
 * @returns {string} - Escaped safe HTML string
 */
export function escapeHTML(str) {
  if (typeof str !== 'string') return str || '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
