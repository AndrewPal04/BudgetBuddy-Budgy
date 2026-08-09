import { Link, Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import Savings from './pages/Savings'
import Expenses from './pages/Expenses'
import Income from './pages/Income'
import Tips from './pages/Tips'

function App() {
  return (
    <div className="min-h-screen bg-white">
      <nav className="flex gap-4 border-b border-latte bg-cream px-6 py-4">
        <Link className="font-bold text-espresso" to="/">
          Budgy
        </Link>
        <Link className="text-caramel" to="/savings">
          Savings
        </Link>
        <Link className="text-caramel" to="/expenses">
          Expenses
        </Link>
        <Link className="text-caramel" to="/income">
          Income
        </Link>
        <Link className="text-caramel" to="/tips">
          Tips
        </Link>
      </nav>
      <main className="p-6">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/savings" element={<Savings />} />
          <Route path="/expenses" element={<Expenses />} />
          <Route path="/income" element={<Income />} />
          <Route path="/tips" element={<Tips />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
