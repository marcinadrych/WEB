// src/hooks/useProducts.js
import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/supabaseClient';

export function useProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const getProducts = async () => {
    setLoading(true);
    const { data } = await supabase.from('produkty').select('*').order('kategoria').order('podkategoria').order('wymiar').order('nazwa');
    setProducts(data || []);
    setLoading(false);
  };

  useEffect(() => {
    getProducts();
  }, []);

  const filterAndGroup = (searchTerm) => {
    const term = searchTerm.trim();

    const filtered = products.filter(p => {
      if (!term) return true; // Zwróć wszystko, jeśli nie ma wyszukiwania
      const isNumeric = /^\d+$/.test(term);
      if (isNumeric) return String(p.id) === term;
      const keywords = term.toLowerCase().split(' ').filter(Boolean);
      const text = [p.nazwa, p.kategoria, p.podkategoria || '', p.wymiar || ''].join(' ').toLowerCase();
      return keywords.every(k => text.includes(k));
    });

    const grouped = filtered.reduce((acc, p) => {
      const cat = p.kategoria;
      const sub = p.podkategoria || 'Bez podkategorii';
      const dim = p.wymiar || 'Bez wymiaru';
      if (!acc[cat]) acc[cat] = {};
      if (!acc[cat][sub]) acc[cat][sub] = {};
      if (!acc[cat][sub][dim]) acc[cat][sub][dim] = [];
      acc[cat][sub][dim].push(p);
      return acc;
    }, {});
    
    return { filtered, grouped };
  };

  return { loading, getProducts, filterAndGroup };
}