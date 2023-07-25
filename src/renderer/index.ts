import React from "react";
import { createRoot } from 'react-dom/client';
import App from "./App";
import './index.css';
import 'react-loading-skeleton/dist/skeleton.css';
import 'react-activity/dist/library.css';

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error(`Can't find element with id #root`);

const root = createRoot(rootElement);

root.render(React.createElement(App));