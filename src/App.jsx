import { useEffect, useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { supabase } from './supabaseClient';
import { Toaster } from '@/components/ui/toaster';

// Importy
import MainLayout from './layouts/MainLayout';
import Auth from './pages/Auth';
import UpdatePassword from './pages/UpdatePassword';

export default function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Sprawdzamy sesję na starcie
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Nasłuchujemy na zmiany
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return <div className="dark min-h-screen flex items-center justify-center"><p>Ładowanie...</p></div>;
  }

  return (
    <div className="dark min-h-screen bg-background text-foreground">
      <Routes>
        {session ? (
          // Jeśli jest sesja, przekazujemy kontrolę do MainLayout
          <Route path="/*" element={<MainLayout />} />
        ) : (
          // Jeśli nie ma sesji, mamy tylko dwie publiczne strony
          <>
            <Route path="/update-password" element={<UpdatePassword />} />
            <Route path="*" element={<Auth />} />
          </>
        )}
      </Routes>
      <Toaster />
    </div>
  );
}