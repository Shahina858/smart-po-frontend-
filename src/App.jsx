import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import POManagement from './pages/POManagement'
import POReview from './pages/POReview'
import Products from './pages/Products'
import Customers from './pages/Customers'
import Pricing from './pages/Pricing'
import Stock from './pages/Stock'
import Alerts from './pages/Alerts'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="po" element={<POManagement />} />
          <Route path="po/review/:id" element={<POReview />} />
          <Route path="products" element={<Products />} />
          <Route path="customers" element={<Customers />} />
          <Route path="pricing" element={<Pricing />} />
          <Route path="stock" element={<Stock />} />
          <Route path="alerts" element={<Alerts />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}