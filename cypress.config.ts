import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:4173/freshcells-trial',
    specPattern: 'cypress/e2e/**/*.cy.ts',
    supportFile: false,
  },
});
