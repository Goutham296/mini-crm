import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/authContext';
import { LogoutIcon } from '../ui/icons';
import { Logo } from './Logo';
import { NAV_ITEMS } from './navItems';

const itemClass = ({ isActive }: { isActive: boolean }) =>
  `group relative flex size-11 items-center justify-center rounded-xl transition-colors ${
    isActive ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'text-navy-500 hover:bg-navy-700 hover:text-white'
  }`;

function Tooltip({ label }: { label: string }) {
  return (
    <span className="pointer-events-none absolute left-full ml-3 whitespace-nowrap rounded-md bg-navy px-2 py-1 text-xs font-medium text-white opacity-0 shadow-lg ring-1 ring-white/10 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
      {label}
    </span>
  );
}

/** Desktop/tablet icon rail. */
export function Sidebar() {
  const { logout } = useAuth();
  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-[76px] flex-col items-center bg-navy py-5 md:flex">
      <NavLink to="/" aria-label="Mini CRM home" className="mb-8">
        <Logo className="size-10" />
      </NavLink>
      <nav aria-label="Main" className="flex flex-1 flex-col items-center gap-3">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} end={to === '/'} className={itemClass} aria-label={label}>
            <Icon className="size-[22px]" />
            <Tooltip label={label} />
          </NavLink>
        ))}
      </nav>
      <button
        type="button"
        onClick={() => void logout()}
        aria-label="Log out"
        className="group relative flex size-11 items-center justify-center rounded-xl text-navy-500 transition-colors hover:bg-navy-700 hover:text-white"
      >
        <LogoutIcon className="size-[22px]" />
        <Tooltip label="Log out" />
      </button>
    </aside>
  );
}

/** Phone bottom navigation (< md). */
export function MobileNav() {
  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-30 flex h-16 items-stretch justify-around border-t border-navy-700 bg-navy pb-[env(safe-area-inset-bottom)] md:hidden"
    >
      {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          className={({ isActive }) =>
            `flex flex-1 flex-col items-center justify-center gap-1 text-[11px] font-medium ${
              isActive ? 'text-white' : 'text-navy-500'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <span className={`flex h-7 w-12 items-center justify-center rounded-full ${isActive ? 'bg-primary' : ''}`}>
                <Icon className="size-5" />
              </span>
              {label}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
