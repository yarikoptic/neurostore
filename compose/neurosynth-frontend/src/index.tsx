import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { Auth0Provider } from '@auth0/auth0-react';
import { grey } from '@mui/material/colors';
import { SystemStyleObject } from '@mui/system';
import { BrowserRouter } from 'react-router-dom';
import * as Sentry from '@sentry/react';

export type Style = Record<string, SystemStyleObject>;
export type ColorOptions =
    | 'inherit'
    | 'primary'
    | 'secondary'
    | 'success'
    | 'error'
    | 'info'
    | 'warning';

declare module '@mui/material/styles/createPalette' {
    interface Palette {
        muted: Palette['primary'];
    }
    interface PaletteOptions {
        muted: PaletteOptions['primary'];
    }
}

const theme = createTheme({
    palette: {
        primary: {
            light: '#0096c7',
            main: '#0077b6',
            dark: '#023e8a',
            contrastText: '#ffffff',
        },
        secondary: {
            light: '#f2a354',
            main: '#ef8a24',
            dark: '#e47a11',
            contrastText: '#ffffff',
        },
        error: {
            main: '#ff6b6b',
            contrastText: '#ffffff',
        },
        warning: {
            main: '#dfc23a',
            dark: '#bfa73f',
            contrastText: '#ffffff',
        },
        success: {
            main: '#4caf50',
            contrastText: '#ffffff',
        },
        muted: {
            main: grey[500],
        },
    },
});

theme.typography.h3 = {
    ...theme.typography.h3,
    [theme.breakpoints.down('md')]: {
        fontSize: '2rem',
    },
    [theme.breakpoints.up('md')]: {
        fontSize: '3rem',
    },
};
theme.typography.h4 = {
    ...theme.typography.h4,
    [theme.breakpoints.down('md')]: {
        fontSize: '1.125rem',
    },
    [theme.breakpoints.up('md')]: {
        fontSize: '2.125',
    },
};
theme.typography.h6 = {
    ...theme.typography.h6,
    [theme.breakpoints.down('md')]: {
        fontSize: '1rem',
    },
    [theme.breakpoints.up('md')]: {
        fontSize: '1.25rem',
    },
};

const domain = process.env.REACT_APP_AUTH0_DOMAIN as string;
const clientId = process.env.REACT_APP_AUTH0_CLIENT_ID as string;
const audience = process.env.REACT_APP_AUTH0_AUDIENCE as string;
const env = process.env.REACT_APP_ENV as 'DEV' | 'STAGING' | 'PROD';

if (env === 'PROD') {
    Sentry.init({
        dsn: 'https://348a42291ed44c3baf7e2d94a0dfc08f@o4505036784992256.ingest.sentry.io/4505036786040832',
        integrations: [new Sentry.BrowserTracing(), new Sentry.Replay()],
        replaysSessionSampleRate: 0.5,
        replaysOnErrorSampleRate: 1.0,
    });
}

ReactDOM.render(
    <React.StrictMode>
        <Auth0Provider
            domain={domain}
            clientId={clientId}
            redirectUri={window.location.origin}
            audience={audience}
            cacheLocation={env === 'DEV' ? 'localstorage' : 'memory'} // we need to switch to localstorage for cypress testing or else state will not work properly
        >
            <BrowserRouter>
                <ThemeProvider theme={theme}>
                    <App />
                </ThemeProvider>
            </BrowserRouter>
        </Auth0Provider>
    </React.StrictMode>,
    document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals();
