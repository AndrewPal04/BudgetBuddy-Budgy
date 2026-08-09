import { Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import Savings from './pages/Savings'
import Expenses from './pages/Expenses'
import Income from './pages/Income'
import Tips from './pages/Tips'

function App() {
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
