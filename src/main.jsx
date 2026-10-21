import React from 'react';
import { createRoot } from 'react-dom/client';

import '@coreui/coreui/dist/css/coreui.min.css';
import '@fontsource/archivo-black/400.css';
import '@fontsource/roboto-condensed/700.css';
import './styles/dashboard.css';

import App from './App';

createRoot(document.getElementById('root')).render(<App />);
