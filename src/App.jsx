import { Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import ProtectedRoute from '@/components/ProtectedRoute';

// Import stron
import Auth from './pages/Auth';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import AddProduct from './pages/AddProduct';
import ZmienStan from './pages/ZmienStan';
import EditProduct from './pages/EditProduct';
import UpdatePassword from './pages/UpdatePassword';

function App() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Routes>
        {/* ================================= */}
        {/*      ŚCIEŻKI PUBLICZNE          */}
        {/* ================================= */}
        <Route path="/login" element={<Auth />} />
        <Route path="/update-password" element={<UpdatePassword />} />
        
        {/* ================================= */}
        {/*      ŚCIEŻKI CHRONIONE           */}
        {/* ================================= */}
        <Route 
          path="/*" 
          element={
            <ProtectedRoute>
              <MainLayout> 
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/dodaj-produkt" element={<AddProduct />} />
                  <Route path="/zmien-stan" element={<ZmienStan />} />
                  <Route path="/edytuj-produkt/:id" element={<EditProduct />} />
                  <Route path="*" element={<Dashboard />} /> 
                </Routes>
              </MainLayout>
            </ProtectedRoute>
          } 
        />
      </Routes>
      <Toaster />
    </div>
  );
}

export default App;