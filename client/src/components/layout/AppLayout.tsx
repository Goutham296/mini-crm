import { Outlet } from 'react-router-dom';
import { MobileNav, Sidebar } from './Sidebar';

export function AppLayout() {
  return (
    <div className="min-h-dvh bg-white">
      <Sidebar />
      <div className="pb-20 md:pb-0 md:pl-[76px]">
        <Outlet />
      </div>
      <MobileNav />
    </div>
  );
}
