import { Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import Savings from './pages/Savings'
import Expenses from './pages/Expenses'
import Income from './pages/Income'
import Tips from './pages/Tips'
import AuthPage from './pages/AuthPage'
import ResetPasswordPage from './pages/ResetPasswordPage'
import { useAuth } from './hooks/useAuth'

function App() {
  const { user, loading, passwordRecovery } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white text-caramel">
        Loading…
      </div>
    )
  }

  if (passwordRecovery) {
    return <ResetPasswordPage />
  }

  if (!user) {
    return <AuthPage />
  }

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/savings" element={<Savings />} />
        <Route path="/expenses" element={<Expenses />} />
        <Route path="/income" element={<Income />} />
        <Route path="/tips" element={<Tips />} />
      </Route>
    </Routes>
  )
}

export default App
