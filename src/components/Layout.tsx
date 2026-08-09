import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

const NAV_LINKS = [
  { to: '/savings', label: 'Savings' },
  { to: '/expenses', label: 'Expenses' },
  { to: '/income', label: 'Income' },
  { to: '/tips', label: 'Tips' },
]

const linkClasses = ({ isActive }: { isActive: boolean }) =>
  `rounded-full px-4 py-2 text-sm font-medium transition-colors ${
    isActive ? 'bg-espresso text-white' : 'text-caramel hover:bg-latte hover:text-espresso'
  }`

function Layout() {
  const [menuOpen, setMenuOpen] = useState(false)
  const { user, signOut } = useAuth()

  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-10 border-b border-latte bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <NavLink to="/" className="text-xl font-bold text-espresso" onClick={() => setMenuOpen(false)}>
            Budgy
          </NavLink>

          <nav className="hidden items-center gap-2 md:flex">
            {NAV_LINKS.map((link) => (
              <NavLink key={link.to} to={link.to} className={linkClasses}>
                {link.label}
              </NavLink>
            ))}
            <button
              type="button"
              onClick={() => void signOut()}
              className="ml-2 rounded-full border border-latte px-4 py-2 text-sm font-medium text-espresso transition-colors hover:bg-latte"
            >
              Sign out
            </button>
          </nav>

          <button
            type="button"
            className="rounded-md p-2 text-espresso md:hidden"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {menuOpen && (
          <nav className="flex flex-col gap-1 border-t border-latte px-6 py-3 md:hidden">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={linkClasses}
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </NavLink>
            ))}
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false)
                void signOut()
              }}
              className="rounded-full border border-latte px-4 py-2 text-left text-sm font-medium text-espresso transition-colors hover:bg-latte"
            >
              Sign out{user?.email ? ` (${user.email})` : ''}
            </button>
          </nav>
        )}
      </header>

      <main className="mx-auto max-w-5xl px-6 py-8">
        <Outlet />
      </main>
    </div>
  )
}

export default Layout
