import { useState } from 'react'
import { supabase } from '../supabaseClient'

export default function Auth() {
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')

  const handleLogin = async (event) => {
    event.preventDefault()
    setLoading(true)
    const { error } = await supabase.auth.signInWithOtp({
      email: email,
    })

    if (error) {
      alert(error.error_description || error.message)
    } else {
      alert('Sprawdź swoją skrzynkę e-mail, aby zobaczyć link do logowania!')
    }
    setLoading(false)
  }

  return (
    <div className="row flex-center flex">
      <div className="col-6 form-widget" aria-live="polite">
        <h1 className="header">Magazyn Hydraulika</h1>
        <p className="description">Zaloguj się podając swój adres e-mail poniżej</p>
        <form className="form-widget" onSubmit={handleLogin}>
          <div>
            <input
              className="inputField"
              type="email"
              placeholder="Twój e-mail"
              value={email}
              required={true}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <button className={'button block'} disabled={loading}>
              {loading ? <span>Ładowanie...</span> : <span>Wyślij magiczny link</span>}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}