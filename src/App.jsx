// src/App.jsx
import { Routes, Route } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { useAuth } from './context/AuthContext'
import MainLayout from './layouts/MainLayout'
import AuthPage from './pages/AuthPage'
import UpdatePassword from './pages/UpdatePassword'

export default function App() {
  const { session } = useAuth();

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