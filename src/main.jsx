import React from 'react';
import ReactDOM from 'react-dom/client';
import App from '@/App';
import '@/index.css';
import { HelmetProvider } from 'react-helmet-async';
import ReactQuill from 'react-quill';

// Register Quill to allow 'style' and 'class' attributes globally
const Quill = ReactQuill.Quill;
const Parchment = Quill.import('parchment');
const StyleAttributor = new Parchment.Attributor.Attribute('style', 'style', {
  scope: Parchment.Scope.INLINE,
  whitelist: null
});
Quill.register(StyleAttributor, true);

const ClassAttributor = new Parchment.Attributor.Attribute('class', 'class', {
  scope: Parchment.Scope.INLINE,
  whitelist: ['exam-icon-v', 'exam-icon-na', 'exam-icon-m']
});
Quill.register(ClassAttributor, true);



ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HelmetProvider>
        <App />  
    </HelmetProvider>
  </React.StrictMode>
);
