// src/pages/PrintLabelsPage.jsx

import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/supabaseClient';
import QrCodeDisplay from '@/components/QrCodeDisplay';
import { Button } from '@/components/ui/button';

export default function PrintLabelsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  
  const params = new URLSearchParams(location.search);
  const category = params.get('category');
  const subcategory = params.get('subcategory');
  const dimension = params.get('dimension');

  useEffect(() => {
    async function getProductsToPrint() {
      setLoading(true);
      let query = supabase.from('produkty').select('id, nazwa');
      if (category) query = query.eq('kategoria', category);
      if (subcategory) {
        if (subcategory === 'Bez podkategorii') query = query.is('podkategoria', null);
        else query = query.eq('podkategoria', subcategory);
      }
      if (dimension) {
        if (dimension === 'Bez wymiaru') query = query.is('wymiar', null);
        else query = query.eq('wymiar', dimension);
      }
      const { data } = await query.order('nazwa');
      setProducts(data || []);
      setLoading(false);
    }
    getProductsToPrint();
  }, [category, subcategory, dimension]);

  const pageTitle = `${category || ''}${subcategory ? ` / ${subcategory}` : ''}${dimension ? ` / ${dimension}` : ''}`;

  return (
    // Używamy białego tła, żeby było gotowe do druku
    <div className="print-labels-container bg-white text-black p-4 md:p-8">
      <div className="print-header mb-8 text-center space-y-4">
        <h1 className="text-2xl font-bold">Etykiety do druku: {pageTitle}</h1>
        <Button onClick={() => window.print()}>
          Drukuj Etykiety
        </Button>
      </div>

      {loading ? (
        <p>Ładowanie...</p>
      ) : (
        // Siatka z etykietami
        <div className="label-grid">
          {products.map(product => (
            <div key={product.id} className="label-item">
              <div className="qr-container">
                {/* Używamy mniejszego rozmiaru dla kodu QR */}
                <QrCodeDisplay value={String(product.id)} size={64} />
              </div>
              <p className="product-name">{product.nazwa}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}