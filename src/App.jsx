// src/App.jsx

import { useEffect, useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import { supabase } from './supabaseClient'
import { Toaster } from '@/components/ui/toaster'
import MainLayout from './layouts/MainLayout'
import Auth from './pages/Auth'
import UpdatePassword from './pages/UpdatePassword'

export default function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setLoading(false);
    };
    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return <div className="dark min-h-screen flex items-center justify-center"><p>Ładowanie...</p></div>
  }

  return (
    <div className="dark min-h-screen bg-background text-foreground">
      <Routes>
        {/* Tu nic się nie zmienia - logika jest poprawna */}
        <Route path="/login" element={<Auth />} />
        <Route path="/update-password" element={<UpdatePassword />} />
        
        {/* Tu nic się nie zmienia - logika jest poprawna */}
        <Route path="/*" element={session ? <MainLayout /> : <Auth />} />
      </Routes>
      {/* KLUCZOWA POPRAWKA: Toaster jest na zewnątrz, więc działa zawsze */}
      <Toaster />
    </div>
  )
}