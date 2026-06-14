import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

// Theme: نوع محدود (union type) بقيمتين فقط.
// الفايدة: لو حد كتب setTheme('blue') أو حصل typo، TypeScript هيرفض الكود
// قبل ما نوصل للـ runtime. وكمان بيوضح للمبرمج كل القيم الممكنة من غير
// ما يحتاج يقرأ كل الكود.
type Theme = 'dark' | 'light';

const STORAGE_KEY = 'taskra_theme';

// ThemeContextValue: شكل البيانات اللي الـ context هيوفرها لأي component
// يستخدم useTheme(). تعريفها كـ interface بيخلي:
// 1) الـ Provider مُلزم يرجّع value بنفس الشكل ده تمامًا.
// 2) أي component مستهلك (consumer) يعرف بالظبط إيه المتاح (theme, toggleTheme)
//    ويلاقي auto-complete + تحقق من الأنواع وقت الاستخدام.
interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
}

// نبدأ الـ context بقيمة null لأنه قبل ما الـ Provider يلف حوالين الشجرة
// مفيش قيمة حقيقية متاحة بعد. بنخلي النوع (ThemeContextValue | null) عشان
// TypeScript يفكّرنا إن useTheme() ممكن يرجع null لو استُخدم برّه الـ Provider.
const ThemeContext = createContext<ThemeContextValue | null>(null);

// ThemeProviderProps: تعريف props الكومبونينت بشكل صريح.
// children من نوع ReactNode عشان نقبل أي شيء قابل للـ render
// (عناصر JSX، نص، أرقام، arrays منها... إلخ) - وده النوع الرسمي
// المستخدم لـ children في React + TypeScript.
interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  // useState<Theme> بيضمن إن theme دايمًا 'dark' أو 'light' بس،
  // مش أي string عشوائي يطلع من localStorage بالغلط.
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved === 'light' ? 'light' : 'dark';
  });

  useEffect(() => {
    document.body.classList.remove('dark', 'light');
    document.body.classList.add(theme);
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  function toggleTheme() {
    setTheme((t) => (t === 'dark' ? 'light' : 'dark'));
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// useContext بيرجع النوع اللي عرّفناه في createContext، يعني
// (ThemeContextValue | null). هنا بنرمي error واضح لو الكومبونينت
// نسي يلف نفسه بـ <ThemeProvider> - أحسن من ترجيع null بصمت وخلي
// الكود اللي بعده يطلع "Cannot read property 'theme' of null" غامض.
export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (context === null) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
