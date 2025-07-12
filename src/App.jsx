import { Routes, Route } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { useAuth } from './context/AuthContext'

// Strony i Layouty
import AuthPage from './pages/Auth'
import MainLayout from './layouts/MainLayout'
import Dashboard from './pages/Dashboard'
import AddProduct from './pages/AddProduct'
import ZmienStan from './pages/ZmienStan'
import EditProduct from './pages/EditProduct'
import UpdatePassword from './pages/UpdatePassword'

function App() {
  const { session } = useAuth(); // Pobieramy sesję z kontekstu

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Routes>
        {/* Jeśli jest sesja, renderuj główny layout. Jeśli nie, stronę logowania */}
        <Route 
          path="/*"
          element={
            session ? (
              <MainLayout>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/dodaj-produkt" element={<AddProduct />} />
                  <Route path="/zmien-stan" element={<ZmienStan />} />
                  <Route path="/edytuj-produkt/:id" element={<EditProduct />} />
                  <Route path="*" element={<Dashboard />} /> 
                </Routes>
              </MainLayout>
            ) : (
              <Routes>
                <Route path="/update-password" element={<UpdatePassword />} />
                <Route path="*" element={<AuthPage />} />
              </Routes>
            )
          }
        />
      </Routes>
      <Toaster />
    </div>
  );
}

export default App;