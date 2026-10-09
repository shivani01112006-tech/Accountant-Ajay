/**
 * Feature Flags Configuration
 * Modular toggles for core and extension capabilities.
 */

const features = {
  // Core Phase Capabilities
  contactForm: true,        // Contact enquiry submission & storage (Phase 4)
  adminDashboard: true,     // Admin authentication, dashboard & management (Phase 5)
  servicesCatalog: true,    // Dynamic services listing from database (Phase 3)

  // Extension Capabilities
  chatbot: true,            // Interactive client FAQ assistant
  analytics: true,          // Google Analytics integration
  csvExport: true,          // Submissions CSV export
  cookieConsent: true       // Cookie notice banner
};

/**
 * Check if a specific feature is enabled
 * @param {string} featureName
 * @returns {boolean}
 */
function isFeatureEnabled(featureName) {
  return Boolean(features[featureName]);
}

module.exports = {
  features: Object.freeze(features),
  isFeatureEnabled
};
