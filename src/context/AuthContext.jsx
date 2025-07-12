// src/context/AuthContext.jsx

import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/supabaseClient"; // Upewnij się, że ta ścieżka jest poprawna

// Tworzymy kontekst
const AuthContext = createContext({});

// Tworzymy własny hook, żeby łatwo używać kontekstu w innych komponentach
export const useAuth = () => useContext(AuthContext);

// Główny "dostawca" kontekstu, który owinie naszą aplikację
const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    // Sprawdź sesję przy pierwszym załadowaniu
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
      setUser(data.session?.user ?? null);
      setLoading(false);
    };
    getSession();

    // Ustaw nasłuchiwanie na zmiany stanu autentykacji
    const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Zakończ nasłuchiwanie, gdy komponent zostanie odmontowany
    return () => {
      data.subscription.unsubscribe();
    };
  }, []);

  // Wartości, które udostępniamy całej aplikacji
  const value = {
    session,
    user,
    signOut: () => supabase.auth.signOut(),
  };

  // Zwracamy komponent "dostawcy", który owija resztę aplikacji
  // Nie renderujemy niczego, dopóki nie sprawdzimy stanu sesji
  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;