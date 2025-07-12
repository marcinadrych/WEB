// src/App.jsx

import { Routes, Route } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { useAuth } from './context/AuthContext' // Używamy naszego hooka
import MainLayout from './layouts/MainLayout'
import AuthPage from './pages/Auth' // Pamiętaj o zmianie nazwy pliku
import UpdatePassword from './pages/UpdatePassword'

export default function App() {
  const { session } = useAuth(); // Pobieramy sesję z kontekstu

  return (
    <div className="dark min-h-screen bg-background text-foreground">
      <Routes>
        {session ? (
          <Route path="/*" element={<MainLayout />} />
        ) : (
          <>
            <Route path="/update-password" element={<UpdatePassword />} />
            <Route path="*" element={<AuthPage />} />
          </>
        )}
      </Routes>
      <Toaster />
    </div>
  )
}