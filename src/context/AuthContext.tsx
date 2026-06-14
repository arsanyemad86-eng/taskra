import { createContext, useContext, useState, type ReactNode } from 'react';

// User: شكل بيانات المستخدم المحفوظة في localStorage وفي الـ state.
// عرّفناه كـ interface مستقل عشان نقدر نستخدمه في أكتر من مكان
// (هنا، وفي أي component يحتاج يعرف شكل "اليوزر").
interface User {
  name: string;
}

// Credentials: شكل بيانات تسجيل الدخول المحفوظة محليًا (الاسم + الباسورد).
// مختلف عن User لأن الباسورد ميتسجلش في الـ state أو في "taskra_user"،
// فالفرق بين الـ interfaces بيوضح ده في الكود نفسه.
interface Credentials {
  name: string;
  password: string;
}

// AuthContextValue: العقد بين الـ Provider وأي component يستخدم useAuth().
// - user: ممكن يكون null (لسه مفيش تسجيل دخول) أو User.
// - login: بترجع boolean (true = نجح الدخول/التسجيل، false = فشل)،
//   وده بيخلي أي component يستخدمها يتعامل مع النتيجة (مثلاً يعرض رسالة خطأ).
// - logout: مفيش لها قيمة رجوع (void).
interface AuthContextValue {
  user: User | null;
  login: (name: string, password: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  // useState<User | null> بيوضح إن الحالة الأولية ممكن تكون null
  // (مفيش يوزر محفوظ)، وبعد كده دايمًا User أو null - مش أي شكل تاني.
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('taskra_user');
    return saved ? (JSON.parse(saved) as User) : null;
  });

  function login(name: string, password: string): boolean {
    const saved = localStorage.getItem('taskra_credentials');
    const creds = saved ? (JSON.parse(saved) as Credentials) : null;

    if (!creds) {
      // أول مرة — سجل الـ credentials
      const newUser: User = { name };
      localStorage.setItem('taskra_credentials', JSON.stringify({ name, password }));
      localStorage.setItem('taskra_user', JSON.stringify(newUser));
      setUser(newUser);
      return true;
    }

    if (creds.name === name && creds.password === password) {
      localStorage.setItem('taskra_user', JSON.stringify({ name }));
      setUser({ name });
      return true;
    }

    return false;
  }

  function logout() {
    localStorage.removeItem('taskra_user');
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
