import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, Teacher } from '../lib/supabase';

interface AuthContextType {
  teacher: Teacher | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isAdmin: boolean;
  navigate: (path: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const storedTeacher = localStorage.getItem('teacher');
    const storedAdmin = localStorage.getItem('isAdmin');

    if (storedTeacher) {
      setTeacher(JSON.parse(storedTeacher));
    }

    if (storedAdmin === 'true') {
      setIsAdmin(true);
    }

    setLoading(false);
  }, []);

  const login = async (identifier: string, password: string) => {
    try {
      // 1️⃣ Chercher l'utilisateur correspondant (par email ou numéro)
      const { data: teachers, error } = await supabase
        .from('teachers')
        .select('*')
        .or(`email.eq.${identifier},phone.eq.${identifier}`);

      if (error || !teachers || teachers.length === 0) {
        return { success: false, error: 'Identifiants incorrects' };
      }

      const teacher = teachers[0];

      // 2️⃣ Hacher le mot de passe entré
      const encoder = new TextEncoder();
      const data = encoder.encode(password);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

      // 3️⃣ Comparer avec celui stocké
      if (teacher.password_hash !== hashHex) {
        return { success: false, error: 'Identifiants incorrects' };
      }

      // 4️⃣ Si ok, enregistrer la session
      setTeacher(teacher);
      localStorage.setItem('teacher', JSON.stringify(teacher));
      return { success: true };

    } catch (error) {
      return { success: false, error: 'Erreur de connexion' };
    }
  };



  const logout = () => {
    setTeacher(null);
    setIsAdmin(false);
    localStorage.removeItem('teacher');
    localStorage.removeItem('isAdmin');
  };

  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    window.dispatchEvent(new CustomEvent('route-change', { detail: { path } }));
  };

  return (
    <AuthContext.Provider value={{ teacher, loading, login, logout, navigate, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
