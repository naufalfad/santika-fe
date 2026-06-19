import { createBrowserRouter } from 'react-router-dom';
import MainLayout from '../../layouts/MainLayout';
import DashboardPage from '../../modules/dashboard/pages/DashboardPage';
import KasMasukPage from '../../modules/kas-masuk/pages/KasMasukPage';
import KasKeluarPage from '../../modules/kas-keluar/pages/KasKeluarPage';
import SPJPage from '../../modules/spj/pages/SPJPage';
import ApprovalPage from '../../modules/approval/pages/ApprovalPage';
import PengajuanPage from '../../modules/approval/pages/PengajuanPage';
import AnggaranPage from '../../modules/anggaran/pages/AnggaranPage';
import SaldoPosDanaPage from '../../modules/saldo-pos-dana/pages/SaldoPosDanaPage';
import LaporanPage from '../../modules/laporan/pages/LaporanPage';
import DanaKhususPage from '../../modules/dana-khusus/pages/DanaKhususPage';
import UserManagementPage from '../../modules/users/pages/UserManagementPage';
import AuditTrailPage from '../../modules/audit-trail/pages/AuditTrailPage';
import ProfilePage from '../../modules/profile/pages/ProfilePage';
import LoginPage from '../../modules/auth/pages/LoginPage';
import { RouteGuard } from '../../shared/components/RouteGuard';

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />
  },
  {
    path: "/",
    element: (
      <RouteGuard allowableRoles={['SUPER_ADMIN', 'PASTOR', 'BENDAHARA', 'DEWAN_KEUANGAN', 'KETUA_KOMISI', 'TIM_PEMBANGUNAN', 'SEKRETARIAT']}>
        <MainLayout />
      </RouteGuard>
    ),
    children: [
      { path: "/", element: <DashboardPage /> },
      {
        path: "/kas-masuk",
        element: (
          <RouteGuard allowableRoles={['SUPER_ADMIN', 'BENDAHARA', 'SEKRETARIAT', 'PASTOR']}>
            <KasMasukPage />
          </RouteGuard>
        )
      },
      {
        path: "/kas-keluar",
        element: (
          <RouteGuard allowableRoles={['SUPER_ADMIN', 'BENDAHARA', 'KETUA_KOMISI', 'PASTOR']}>
            <KasKeluarPage />
          </RouteGuard>
        )
      },
      {
        path: "/spj",
        element: (
          <RouteGuard allowableRoles={['SUPER_ADMIN', 'BENDAHARA', 'KETUA_KOMISI', 'TIM_PEMBANGUNAN']}>
            <SPJPage />
          </RouteGuard>
        )
      },
      {
        path: "/anggaran",
        element: (
          <RouteGuard allowableRoles={['SUPER_ADMIN', 'PASTOR', 'BENDAHARA', 'DEWAN_KEUANGAN']}>
            <AnggaranPage />
          </RouteGuard>
        )
      },
      {
        path: "/saldo-pos-dana",
        element: (
          <RouteGuard allowableRoles={['SUPER_ADMIN', 'PASTOR', 'BENDAHARA', 'DEWAN_KEUANGAN']}>
            <SaldoPosDanaPage />
          </RouteGuard>
        )
      },
      {
        path: "/dana-khusus",
        element: (
          <RouteGuard allowableRoles={['SUPER_ADMIN', 'TIM_PEMBANGUNAN', 'BENDAHARA']}>
            <DanaKhususPage />
          </RouteGuard>
        )
      },
      {
        path: "/approval",
        element: (
          <RouteGuard allowableRoles={['SUPER_ADMIN', 'PASTOR', 'BENDAHARA']}>
            <ApprovalPage />
          </RouteGuard>
        )
      },
      {
        path: "/pengajuan",
        element: (
          <RouteGuard allowableRoles={['SUPER_ADMIN', 'KETUA_KOMISI']}>
            <PengajuanPage />
          </RouteGuard>
        )
      },
      {
        path: "/laporan",
        element: (
          <RouteGuard allowableRoles={['SUPER_ADMIN', 'PASTOR', 'BENDAHARA', 'DEWAN_KEUANGAN']}>
            <LaporanPage />
          </RouteGuard>
        )
      },
      {
        path: "/users",
        element: (
          <RouteGuard allowableRoles={['SUPER_ADMIN']}>
            <UserManagementPage />
          </RouteGuard>
        )
      },
      {
        path: "/audit-trail",
        element: (
          <RouteGuard allowableRoles={['SUPER_ADMIN', 'PASTOR', 'BENDAHARA']}>
            <AuditTrailPage />
          </RouteGuard>
        )
      },
      {
        // Semua role berhak mengakses halaman profil diri sendiri.
        // Tidak ada pembatasan RBAC pada rute ini — RouteGuard tetap dipakai
        // untuk memastikan user sudah login (user !== null).
        path: "/profile",
        element: (
          <RouteGuard allowableRoles={['SUPER_ADMIN', 'PASTOR', 'BENDAHARA', 'DEWAN_KEUANGAN', 'KETUA_KOMISI', 'TIM_PEMBANGUNAN', 'SEKRETARIAT']}>
            <ProfilePage />
          </RouteGuard>
        ),
      },
    ],
  },
]);