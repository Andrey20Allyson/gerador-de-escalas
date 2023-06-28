import React from "react";
import { createRoot } from 'react-dom/client';
import App from "./App";
import './index.css';

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error(`Can't find element with id #root`);

const root = createRoot(rootElement);

root.render(React.createElement(App));