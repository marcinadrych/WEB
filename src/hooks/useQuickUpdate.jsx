// src/hooks/useQuickUpdate.jsx
import { useState } from 'react';
import { supabase } from '@/supabaseClient';
import { useToast } from "@/components/ui/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

export function useQuickUpdate(onSuccess) {
  const [operation, setOperation] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [isQuantityDialogOpen, setIsQuantityDialogOpen] = useState(false);
  const [confirmation, setConfirmation] = useState(null);
  const { toast } = useToast();

  const promptForQuantity = (product, type) => {
    setOperation({ product, type });
    setQuantity(1);
    setIsQuantityDialogOpen(true);
  };

  const handleQuantitySubmit = () => {
    if (!operation || isNaN(quantity) || quantity <= 0) {
      toast({ title: "Błąd", description: "Wpisz poprawną ilość.", variant: "destructive" });
      return;
    }
    const amount = operation.type === 'add' ? quantity : -quantity;
    setConfirmation({ product: operation.product, amount: amount });
    setIsQuantityDialogOpen(false);
  };

  const executeUpdate = async () => {
    if (!confirmation) return;
    const { product, amount } = confirmation;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: currentProduct } = await supabase.from('produkty').select('ilosc').eq('id', product.id).single();
      const newQuantity = parseFloat((currentProduct.ilosc + amount).toFixed(2));
      if (newQuantity < 0) throw new Error("Stan nie może być ujemny.");
      await supabase.from('operacje').insert({ id_produktu: product.id, typ_operacji: amount > 0 ? 'przyjecie' : 'zuzycie', ilosc_zmieniona: Math.abs(amount), pracownik_email: user.email, uwagi: 'Szybka zmiana' });
      await supabase.from('produkty').update({ ilosc: newQuantity, ostatnia_zmiana_przez: user.email, data_ostatniej_zmiany: new Date().toISOString() }).eq('id', product.id);
      toast({ title: "Sukces", description: "Stan został zaktualizowany." });
      onSuccess();
    } catch (error) {
      toast({ title: "Błąd", description: "Nie udało się zapisać zmiany.", variant: "destructive" });
      onSuccess(); // Odśwież, żeby cofnąć optymistyczną aktualizację
    } finally {
      setConfirmation(null);
    }
  };

  const QuantityDialog = (
    <Dialog open={isQuantityDialogOpen} onOpenChange={setIsQuantityDialogOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader><DialogTitle>{operation?.type === 'add' ? 'Dodaj' : 'Odejmij'}</DialogTitle><DialogDescription>Wpisz ilość dla: {operation?.product.nazwa}</DialogDescription></DialogHeader>
        <div className="grid gap-4 py-4"><Label htmlFor="quantity" className="text-right">Ilość</Label><Input id="quantity" type="number" value={quantity} onChange={(e) => setQuantity(parseFloat(e.target.value))} className="col-span-3" min="0.01" step="any" /></div>
        <Button onClick={handleQuantitySubmit} className="w-full">Dalej</Button>
      </DialogContent>
    </Dialog>
  );

  const ConfirmationDialog = (
    <AlertDialog open={!!confirmation} onOpenChange={() => setConfirmation(null)}>
      <AlertDialogContent>
        <AlertDialogHeader><AlertDialogTitle>Potwierdzenie</AlertDialogTitle><AlertDialogDescription>Na pewno? {confirmation?.amount > 0 ? 'Dodajesz' : 'Odejmujesz'} {Math.abs(confirmation?.amount || 0)} {confirmation?.product.jednostka} "{confirmation?.product.nazwa}"</AlertDialogDescription></AlertDialogHeader>
        <AlertDialogFooter><AlertDialogCancel>Anuluj</AlertDialogCancel><AlertDialogAction onClick={executeUpdate}>Zatwierdź</AlertDialogAction></AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );

  return { promptForQuantity, QuantityDialog, ConfirmationDialog };
}