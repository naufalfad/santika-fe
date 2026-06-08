import { createBrowserRouter } from 'react-router-dom';
import MainLayout from '../components/layouts/MainLayout';
import DashboardPage from '../pages/dashboard/DashboardPage';
import KasMasukPage from '../pages/kas-masuk/KasMasukPage';
import KasKeluarPage from '../pages/kas-keluar/KasKeluarPage';
import SPJPage from '../pages/spj/SPJPage';
import ApprovalPage from '../pages/approval/ApprovalPage';
import AnggaranPage from '../pages/anggaran/AnggaranPage';
import LaporanPage from '../pages/laporan/LaporanPage';
import DanaKhususPage from '../pages/dana-khusus/DanaKhususPage';
import UserManagementPage from '../pages/users/UserManagementPage';

export const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      { path: "/", element: <DashboardPage /> },
      { path: "/kas-masuk", element: <KasMasukPage /> },
      { path: "/kas-keluar", element: <KasKeluarPage /> },
      { path: "/spj", element: <SPJPage /> },
      { path: "/anggaran", element: <AnggaranPage /> },
      { path: "/dana-khusus", element: <DanaKhususPage /> },
      { path: "/approval", element: <ApprovalPage /> },
      { path: "/laporan", element: <LaporanPage /> },
      { path: "/users", element: <UserManagementPage /> },
    ],
  },
]);