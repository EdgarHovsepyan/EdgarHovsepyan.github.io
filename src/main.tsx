import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App.tsx';
import './styles/global.css';

const root = document.getElementById('root');
if (!root) throw new Error('Root element #root not found');

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// The scenes invite rapid clicking; a double or triple click must not select
// the copy underneath. Drag selection and form fields are left alone.
document.addEventListener('mousedown', (event) => {
  if (event.detail < 2) return;
  const target = event.target as Element | null;
  if (target?.closest('input, textarea, select, [contenteditable="true"]')) return;
  event.preventDefault();
});
