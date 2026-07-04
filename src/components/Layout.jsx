import { Outlet, NavLink } from 'react-router-dom'
import { FileText } from 'lucide-react'

const navItems = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/po',        label: 'PO Management' },
  { to: '/products',  label: 'Products' },
  { to: '/customers', label: 'Customers' },
  { to: '/pricing',   label: 'Pricing' },
  { to: '/stock',     label: 'Stock' },
  { to: '/alerts',    label: 'Logs' },
]

export default function Layout() {
  return (
    <div className="bg-main">
      <header style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(255,255,255,0.9)',
        borderBottom: '1px solid #e2e8f0',
        backdropFilter: 'blur(12px)',
        boxShadow: '0 1px 8px rgba(0,0,0,0.06)',
      }}>
        <div style={{
          maxWidth: '1400px', margin: '0 auto', padding: '0 28px',
          height: '62px', display: 'flex', alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '38px', height: '38px',
              background: 'linear-gradient(135deg, #0d9488, #0891b2)',
              borderRadius: '10px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(13,148,136,0.3)',
            }}>
              <FileText size={18} color="white" />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '15px', color: '#0f172a', letterSpacing: '-0.3px' }}>
                Smart PO
              </div>
              <div style={{ fontSize: '10px', color: '#94a3b8', letterSpacing: '1px', textTransform: 'uppercase' }}>
                Medi Sync
              </div>
            </div>
          </div>

          {/* Nav links — right side */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
            {navItems.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                style={({ isActive }) => ({
                  padding: '7px 16px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: 700,
                  textDecoration: 'none',
                  transition: 'all 0.15s',
                  color: isActive ? '#0d9488' : '#475569',
                  background: isActive ? 'rgba(13,148,136,0.08)' : 'transparent',
                  border: isActive ? '1px solid rgba(13,148,136,0.2)' : '1px solid transparent',
                })}
              >
                {label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '32px 28px' }}>
        <Outlet />
      </main>
    </div>
  )
}