import { defineConfig } from 'cypress';

export default defineConfig({
    // component: {
    //     setupNodeEvents(on, config) {},
    //     supportFile: 'cypress/support/index.js',
    //     specPattern: 'src/**/*.spec.{js,ts,jsx,tsx}',
    // },
    e2e: {
        setupNodeEvents(on, config) {
            // implement node event listeners here
        },
        baseUrl: 'http://localhost:3000',
    },
    env: {
        auth0Username: 'test-user@gmail.com',
        auth0Password: 'password',
        auth0ClientId: process.env.REACT_APP_AUTH0_CLIENT_ID,
        auth0ClientSecret: process.env.REACT_APP_AUTH0_CLIENT_SECRET,
        auth0Domain: 'dev-mui7zm42.us.auth0.com',
        auth0Audience: process.env.REACT_APP_AUTH0_AUDIENCE,
    },
});
