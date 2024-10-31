import { defineConfig } from "cypress"
import dotenv from "dotenv"

dotenv.config()

export default defineConfig({
  viewportWidth: 1200,
  viewportHeight: 800,
  video: false,
  retries: {
    runMode: 1,
    openMode: 0,
  },
  chromeWebSecurity: true,
  env: {
    infura_api_key: process.env.CYPRESS_INFURA_PROJECT_ID,
    wallet_private_key: process.env.CYPRESS_WALLET_PRIVATE_KEY,
  },
  e2e: {
    specPattern: "cypress/tests/**/*.cy.{ts,tsx}",
    baseUrl: "http://localhost:3000",
    defaultCommandTimeout: 10000,
    setupNodeEvents(on, config) {
  },
  },
})
