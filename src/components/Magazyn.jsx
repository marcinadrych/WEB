import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'

export default function Magazyn({ session }) {
  const [loading, setLoading] = useState(true)
  const [products, setProducts] = useState([])

  // Stany dla formularza operacji
  const [selectedProductId, setSelectedProductId] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [operationType, setOperationType] = useState('zuzycie')
  const [notes, setNotes] = useState('')

  // Stany dla formularza tworzenia nowego produktu
  const [newProductName, setNewProductName] = useState('')
  const [newProductCategory, setNewProductCategory] = useState('')
  const [newProductInitialQuantity, setNewProductInitialQuantity] = useState(0)

  useEffect(() => {
    getProducts()
  }, [])

  async function getProducts() {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('produkty')
        .select('*')
        .order('nazwa', { ascending: true })

      if (error) throw error
      if (data) setProducts(data)
    } catch (error) {
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleOperationSubmit(event) {
    event.preventDefault()
    if (!selectedProductId || !quantity) {
      alert('Wybierz produkt i podaj ilość!')
      return
    }

    setLoading(true)
    try {
      const { error: operationError } = await supabase.from('operacje').insert({
        id_produktu: selectedProductId,
        typ_operacji: operationType,
        ilosc_zmieniona: quantity,
        pracownik_email: session.user.email,
        uwagi: notes,
      })
      if (operationError) throw operationError

      const { data: productData, error: productError } = await supabase
        .from('produkty')
        .select('ilosc')
        .eq('id', selectedProductId)
        .single()
      if (productError) throw productError

      const currentQuantity = productData.ilosc
      const newQuantity =
        operationType === 'przyjecie'
          ? currentQuantity + quantity
          : currentQuantity - quantity

      if (newQuantity < 0) {
        alert('Nie można zużyć więcej produktu niż jest w magazynie!')
        throw new Error('Stan magazynowy nie może być ujemny.')
      }

      const { error: updateError } = await supabase
        .from('produkty')
        .update({ ilosc: newQuantity })
        .eq('id', selectedProductId)
      if (updateError) throw updateError

      alert('Operacja została pomyślnie dodana!')
      setSelectedProductId('')
      setQuantity(1)
      setNotes('')
      getProducts()
    } catch (error) {
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleProductSubmit(event) {
    event.preventDefault()
    if (!newProductName || !newProductCategory) {
      alert('Podaj nazwę i kategorię nowego produktu!')
      return
    }

    setLoading(true)
    try {
      const { error } = await supabase.from('produkty').insert({
        nazwa: newProductName,
        kategoria: newProductCategory,
        ilosc: newProductInitialQuantity,
      })

      if (error) throw error

      alert(`Produkt "${newProductName}" został pomyślnie dodany!`)
      setNewProductName('')
      setNewProductCategory('')
      setNewProductInitialQuantity(0)
      getProducts()
    } catch (error) {
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  return (
    <div className="form-widget">
      <div>
        <p>Zalogowany jako: <strong>{session.user.email}</strong></p>
        <button className="button block" onClick={handleLogout} disabled={loading}>
          Wyloguj
        </button>
      </div>
      <hr />
      <form onSubmit={handleOperationSubmit}>
        <h2>Dodaj nową operację</h2>
        <div>
          <label htmlFor="product">Wybierz produkt</label>
          <select id="product" className="inputField" value={selectedProductId} onChange={(e) => setSelectedProductId(e.target.value)} required>
            <option value="" disabled> -- Wybierz produkt -- </option>
            {products.map((product) => (
              <option key={product.id} value={product.id}>
                {product.nazwa} (Stan: {product.ilosc})
            </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="operationType">Typ operacji</label>
          <select id="operationType" className="inputField" value={operationType} onChange={(e) => setOperationType(e.target.value)}>
            <option value="zuzycie">Zużycie</option>
            <option value="przyjecie">Przyjęcie</option>
          </select>
        </div>
        <div>
          <label htmlFor="quantity">Ilość</label>
          <input id="quantity" className="inputField" type="number" min="1" value={quantity} onChange={(e) => setQuantity(parseInt(e.target.value, 10))} required />
        </div>
        <div>
          <label htmlFor="notes">Uwagi (opcjonalnie)</label>
          <input id="notes" className="inputField" type="text" value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>
        <div>
          <button className="button block" type="submit" disabled={loading}>
            {loading ? 'Zapisywanie...' : 'Zapisz operację'}
          </button>
        </div>
      </form>
      <hr />
      <form onSubmit={handleProductSubmit}>
        <h2>Dodaj nowy produkt do bazy</h2>
        <div>
          <label htmlFor="newProductName">Nazwa nowego produktu</label>
          <input id="newProductName" className="inputField" type="text" value={newProductName} onChange={(e) => setNewProductName(e.target.value)} required />
        </div>
        <div>
          <label htmlFor="newProductCategory">Kategoria</label>
          <input id="newProductCategory" className="inputField" type="text" value={newProductCategory} onChange={(e) => setNewProductCategory(e.target.value)} required />
        </div>
        <div>
          <label htmlFor="newProductInitialQuantity">Ilość początkowa</label>
          <input id="newProductInitialQuantity" className="inputField" type="number" min="0" value={newProductInitialQuantity} onChange={(e) => setNewProductInitialQuantity(parseInt(e.target.value, 10))} required />
        </div>
        <div>
          <button className="button block" type="submit" disabled={loading}>
            {loading ? 'Dodawanie...' : 'Dodaj produkt'}
          </button>
        </div>
      </form>
      <hr />
      <div>
        <h2>Aktualny stan magazynu</h2>
        {loading ? (<p>Ładowanie...</p>) : (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {products.map((product) => (
              <li key={product.id} style={{ borderBottom: '1px solid #555', padding: '10px 0' }}>
                <strong>{product.nazwa}</strong> - Stan: {product.ilosc}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}