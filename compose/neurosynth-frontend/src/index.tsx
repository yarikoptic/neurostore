import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { Auth0Provider } from '@auth0/auth0-react';
import { grey } from '@mui/material/colors';
import { SystemStyleObject } from '@mui/system';
import { BaseEditor, NumericEditor, registerEditor, TextEditor } from 'handsontable/editors';
import {
    baseRenderer,
    htmlRenderer,
    numericRenderer,
    registerRenderer,
    textRenderer,
} from 'handsontable/renderers';
import { numericValidator, registerValidator } from 'handsontable/validators';
import {
    HandsontableCellType,
    NumericCellType,
    registerCellType,
    TextCellType,
} from 'handsontable/cellTypes';
import {
    BasePlugin,
    CopyPaste,
    DragToScroll,
    MergeCells,
    MultipleSelectionHandles,
    UndoRedo,
    registerPlugin,
} from 'handsontable/plugins';
import { QueryClient, QueryClientProvider } from 'react-query';

export type Style = Record<string, SystemStyleObject>;

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
            main: '#ffe66d',
            dark: '#b2a14c',
            contrastText: '#000000',
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

const domain = process.env.REACT_APP_AUTH0_DOMAIN as string;
const clientId = process.env.REACT_APP_AUTH0_CLIENT_ID as string;
const audience = process.env.REACT_APP_AUTH0_AUDIENCE as string;

registerEditor(BaseEditor);
registerEditor(NumericEditor);
registerEditor(TextEditor);

registerRenderer(baseRenderer);
registerRenderer(htmlRenderer);
registerRenderer(numericRenderer);
registerRenderer(textRenderer);

registerValidator(numericValidator);

registerCellType(HandsontableCellType);
registerCellType(NumericCellType);
registerCellType(TextCellType);

registerPlugin(CopyPaste);
registerPlugin(MergeCells);
registerPlugin(DragToScroll);
registerPlugin(MultipleSelectionHandles);
registerPlugin(UndoRedo);
registerPlugin(BasePlugin);

const queryClient = new QueryClient();

ReactDOM.render(
    <React.StrictMode>
        <Auth0Provider
            domain={domain}
            clientId={clientId}
            redirectUri={window.location.origin}
            audience={audience}
        >
            <ThemeProvider theme={theme}>
                <QueryClientProvider client={queryClient}>
                    <App />
                </QueryClientProvider>
            </ThemeProvider>
        </Auth0Provider>
    </React.StrictMode>,
    document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();