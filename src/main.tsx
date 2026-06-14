import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import { ThemeProvider } from './context/ThemeContext.tsx';
import './index.css';

// `!` (non-null assertion): document.getElementById بيرجع
// `HTMLElement | null` لأن TypeScript مش عارف إن عنصر بـ id="root"
// موجود فعلاً في index.html. هنا متأكدين إنه موجود (الملف الأساسي
// للتطبيق)، فبنستخدم `!` بدل ما نضيف if check مش هيحصل أبدًا.
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ThemeProvider>
  </React.StrictMode>
);
