import { lazy, Suspense } from 'react';
import { Outlet, Route, Routes } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { GuestRoute, ProtectedRoute } from './components/ProtectedRoute';
import { Spinner } from './components/ui/Spinner';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { CustomersPage } from './pages/customers/CustomersPage';
import { NotFoundPage } from './pages/NotFoundPage';

// Heavier pages (charts, drag and drop) load on demand to keep the first bundle small.
const DashboardPage = lazy(() => import('./pages/dashboard/DashboardPage').then((m) => ({ default: m.DashboardPage })));
const CustomerDetailPage = lazy(() =>
  import('./pages/customers/CustomerDetailPage').then((m) => ({ default: m.CustomerDetailPage })),
);
const DealsPage = lazy(() => import('./pages/deals/DealsPage').then((m) => ({ default: m.DealsPage })));
const TasksPage = lazy(() => import('./pages/tasks/TasksPage').then((m) => ({ default: m.TasksPage })));

function PageFallback() {
  return (
    <div className="flex min-h-[60dvh] items-center justify-center text-primary" role="status" aria-label="Loading page">
      <Spinner className="size-7" />
    </div>
  );
}

function SuspenseOutlet() {
  return (
    <Suspense fallback={<PageFallback />}>
      <Outlet />
    </Suspense>
  );
}

export function App() {
  return (
    <Routes>
      <Route element={<GuestRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route element={<SuspenseOutlet />}>
            <Route index element={<DashboardPage />} />
            <Route path="customers" element={<CustomersPage />} />
            <Route path="customers/:id" element={<CustomerDetailPage />} />
            <Route path="deals" element={<DealsPage />} />
            <Route path="tasks" element={<TasksPage />} />
          </Route>
        </Route>
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
