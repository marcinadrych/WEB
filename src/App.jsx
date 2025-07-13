// POPRAWIONY App.jsx

import { useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { supabase } from './supabaseClient';
import { Toaster } from '@/components/ui/toaster';

import MainLayout from './layouts/MainLayout';
import Auth from './pages/Auth';
import UpdatePassword from './pages/UpdatePassword';

export default function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });
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
          // Jeśli jest sesja, MainLayout przejmuje cały routing
          <Route path="/*" element={<MainLayout />} />
        ) : (
          // Jeśli nie ma sesji, mamy tylko strony publiczne
          <>
            <Route path="/update-password" element={<UpdatePassword />} />
            <Route path="*" element={<Auth />} />
          </>
        )}
      </Routes>
      {/* Toaster jest na zewnątrz, więc działa zawsze */}
      <Toaster />
    </div>
  );
}