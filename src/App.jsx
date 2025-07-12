// src/App.jsx - WERSJA Z PROTECTED ROUTE

import { Routes, Route } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import ProtectedRoute from '@/components/ProtectedRoute' // Importujemy nasz nowy komponent

// Strony
import Auth from './pages/Auth'
import MainLayout from './layouts/MainLayout' // Importujemy nowy layout
import Dashboard from './pages/Dashboard'
import AddProduct from './pages/AddProduct'
import ZmienStan from './pages/ZmienStan'
import EditProduct from './pages/EditProduct'
import UpdatePassword from './pages/UpdatePassword'

function App() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Routes>
        {/* ŚCIEŻKI PUBLICZNE */}
        <Route path="/login" element={<Auth />} />
        <Route path="/update-password" element={<UpdatePassword />} />
        
        {/* ŚCIEŻKI CHRONIONE */}
        <Route 
          path="/*" 
          element={
            <ProtectedRoute>
              {/* MainLayout zawiera nawigację i renderuje podstrony */}
              <MainLayout> 
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/dodaj-produkt" element={<AddProduct />} />
                  <Route path="/zmien-stan" element={<ZmienStan />} />
                  <Route path="/edytuj-produkt/:id" element={<EditProduct />} />
                  {/* Przekierowanie na Dashboard dla nieznanych chronionych ścieżek */}
                  <Route path="*" element={<Dashboard />} /> 
                </Routes>
              </MainLayout>
            </ProtectedRoute>
          } 
        />
      </Routes>
      <Toaster />
    </div>
  )
}

export default App