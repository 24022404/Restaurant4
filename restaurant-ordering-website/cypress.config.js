const { defineConfig } = require('cypress');

const baseUrl = process.env.CYPRESS_BASE_URL || 'http://localhost:8000';

module.exports = defineConfig({
  e2e: {
    baseUrl,
    specPattern: 'cypress/e2e/**/*.cy.js',
    supportFile: 'cypress/support/e2e.js',
    video: false,
    screenshotOnRunFailure: true,
    setupNodeEvents(on, config) {
      return config;
    }
  }
});
