import { useMemo, useState, useEffect } from 'react';
import {
  Wallet, Building2, Heart, TrendingUp, TrendingDown,
  Calendar, ChevronRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../../app/store/useAuthStore';
import { useKasStore } from '../../../app/store/useKasStore';
import { Card } from '../../../shared/components/ui/Card';
import { FinancialChart } from '../components/FinancialChart';
import { PendingApprovals } from '../components/PendingApprovals';
import { BudgetSummary } from '../components/BudgetSummary';
import { BalancePosition } from '../components/BalancePosition';
import { RecentActivity } from '../components/RecentActivity';
import { DASHBOARD_HERO } from '../../../shared/mock/dashboardData';
import { formatIDR } from '../../../shared/utils/formatter';

const DashboardPage = () => {
  const { user } = useAuthStore();
  const kasMasuk = useKasStore((state) => state.kasMasuk);
  const kasKeluar = useKasStore((state) => state.kasKeluar);
  const navigate = useNavigate();

  // Live Clock State
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000); // Update tiap 1 menit
    return () => clearInterval(timer);
  }, []);

  // Memoized aggregation to prevent unnecessary computational renders
  const totalIn = useMemo(() => {
    return kasMasuk.reduce((sum, item) => sum + item.jumlah, 0);
  }, [kasMasuk]);

  const totalOut = useMemo(() => {
    return kasKeluar.reduce((sum, item) => sum + item.jumlah, 0);
  }, [kasKeluar]);

  const currentSaldo = useMemo(() => {
    return 245000000 + totalIn - totalOut - 19400000;
  }, [totalIn, totalOut]);

  // Memoized statistics tailored based on the authenticated user role
  const stats = useMemo(() => {
    const dynamicStats = [
      { label: 'DANA OPERASIONAL', val: currentSaldo, sub: 'Dana Operasional', color: 'text-blue-600', icon: 'wallet', visible: ['PASTOR', 'BENDAHARA', 'DEWAN_KEUANGAN', 'SUPER_ADMIN'] },
      { label: 'DANA PEMBANGUNAN', val: 785000000, sub: 'Dana Pembangunan', color: 'text-emerald-600', icon: 'building', visible: ['PASTOR', 'BENDAHARA', 'TIM_PEMBANGUNAN', 'SUPER_ADMIN'] },
      { label: 'DANA SOSIAL (PSE)', val: 58000000, sub: 'Dana Sosial', color: 'text-purple-600', icon: 'heart', visible: ['PASTOR', 'BENDAHARA', 'KETUA_KOMISI', 'SUPER_ADMIN'] },
      { label: 'PENDAPATAN BULAN INI', val: totalIn, sub: 'Bulan Berjalan', color: 'text-orange-600', icon: 'trending-up', visible: ['PASTOR', 'BENDAHARA', 'DEWAN_KEUANGAN', 'SEKRETARIAT', 'SUPER_ADMIN'] },
      { label: 'PENGELUARAN BULAN INI', val: totalOut, sub: 'Bulan Berjalan', color: 'text-cyan-600', icon: 'trending-down', visible: ['PASTOR', 'BENDAHARA', 'DEWAN_KEUANGAN', 'KETUA_KOMISI', 'SUPER_ADMIN'] },
    ];
    return dynamicStats.filter(s => s.visible.includes(user?.role || ''));
  }, [currentSaldo, totalIn, totalOut, user?.role]);

  const getIcon = (iconName: string, colorClass: string) => {
    const props = { size: 18, className: colorClass, strokeWidth: 2 };
    switch (iconName) {
      case 'wallet': return <Wallet {...props} />;
      case 'building': return <Building2 {...props} />;
      case 'heart': return <Heart {...props} />;
      case 'trending-up': return <TrendingUp {...props} />;
      case 'trending-down': return <TrendingDown {...props} />;
      default: return <Wallet {...props} />;
    }
  };

  return (
    <div className="space-y-6 pb-10 max-w-[1600px] mx-auto animate-fade-slide">

      {/* 1. HERO SECTION - Left Aligned Tight Flexbox */}
      <div className="relative bg-white px-6 py-5 rounded-none border border-slate-200 shadow-sm flex overflow-hidden">

        {/* Background Image (Absolute Right) */}
        <div className="absolute right-0 top-0 h-full w-[35%] hidden md:block opacity-60 pointer-events-none">
          <img
            src="src/assets/church-bg.png"
            alt="Church BG"
            className="w-full h-full object-cover"
            style={{
              maskImage: 'linear-gradient(to right, transparent, black 15%)',
              WebkitMaskImage: 'linear-gradient(to right, transparent, black 15%)'
            }}
          />
        </div>

        {/* Content Wrapper - Di-group agar menempel di sisi kiri */}
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-10">

          {/* Greeting Context (Tanpa flex-1, hanya mengambil ruang yang dibutuhkan) */}
          <div>
            <h1 className="text-xl font-semibold text-slate-800 tracking-tight">
              Dashboard {user?.role.toLowerCase().replace(/_/g, ' ')}
            </h1>
            <p className="text-rose-600 font-medium text-base leading-tight mt-0.5">
              {DASHBOARD_HERO.paroki}
            </p>
            <div className="mt-4">
              <p className="text-xs font-semibold text-slate-700">
                Selamat datang, {user?.name}
              </p>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                Berikut adalah ringkasan konsolidasi kondisi keuangan paroki saat ini.
              </p>
            </div>
          </div>

          {/* Vertical Separator */}
          <div className="hidden md:block w-px h-16 bg-slate-200" />

          {/* Date & Time Info (Menempel di sebelah separator) */}
          <div className="flex items-center gap-3">
            <Calendar size={24} className="text-blue-600" strokeWidth={1.5} />
            <div>
              <p className="text-[10px] font-semibold text-blue-600 tracking-tighter uppercase">Hari Ini</p>
              <p className="text-sm font-semibold text-slate-800 tracking-tight leading-tight">
                {currentTime.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
              <p className="text-[10px] font-medium text-slate-400 mt-0.5">
                Pukul {currentTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* 2. STAT CARDS SECTION */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {stats.map((item, idx) => (
          <Card key={idx} className="p-0 border-slate-200 hover:shadow-none hover:border-slate-300 transition-all duration-300 flex flex-col rounded-none shadow-sm group">

            <div className="p-4 flex-1 flex flex-col justify-between">
              <div className="flex items-center gap-2.5 mb-3">
                {getIcon(item.icon, item.color)}
                <div className="min-w-0">
                  <p className="text-[9px] font-semibold text-slate-400 tracking-tight truncate">{item.label}</p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-slate-800 tracking-tight leading-none group-hover:text-blue-600 transition-colors">
                  {formatIDR(item.val)}
                </h3>
                <p className="text-[9px] text-slate-400 font-medium mt-1.5">{item.sub}</p>
              </div>
            </div>

            <button
              onClick={() => {
                if (item.label === 'DANA OPERASIONAL') navigate('/kas-keluar');
                else if (item.label === 'PENDAPATAN BULAN INI') navigate('/kas-masuk');
                else if (item.label === 'PENGELUARAN BULAN INI') navigate('/kas-keluar');
                else if (item.label === 'DANA PEMBANGUNAN') navigate('/dana-khusus');
                else if (item.label === 'DANA SOSIAL (PSE)') navigate('/dana-khusus');
              }}
              className="px-4 py-2 text-[10px] font-medium text-slate-500 border-t border-slate-100 flex items-center justify-between hover:bg-slate-50 hover:text-blue-600 transition-colors cursor-pointer rounded-none text-left"
            >
              Lihat Detail <ChevronRight size={12} />
            </button>
          </Card>
        ))}
      </div>

      {/* 3. MIDDLE SECTION: Charts & Pending Requests */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <Card className="lg:col-span-8 p-5 border-slate-200 rounded-none shadow-sm">
          <FinancialChart />
        </Card>

        <Card className="lg:col-span-4 p-5 border-slate-200 rounded-none shadow-sm">
          <PendingApprovals />
        </Card>
      </div>

      {/* 4. BOTTOM SECTION: Budget, Balances, & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Budget Summary (Left wide) */}
        <Card className="lg:col-span-6 p-5 border-slate-200 rounded-none shadow-sm h-[420px]">
          <BudgetSummary />
        </Card>

        {/* Balance Position (Middle) */}
        <Card className="lg:col-span-3 p-5 border-slate-200 rounded-none shadow-sm h-[420px]">
          <BalancePosition />
        </Card>

        {/* Recent Activity (Right) */}
        <Card className="lg:col-span-3 p-5 border-slate-200 rounded-none shadow-sm h-[420px]">
          <RecentActivity />
        </Card>
      </div>

      <footer className="mt-12 text-center text-[10px] text-slate-400 font-medium">
        <p>SANTIKA - Sistem Akuntansi dan Tata Kelola Keuangan Gereja</p>
        <p>© {new Date().getFullYear()} Paroki St. Stefanus - Sempan. Semua hak dilindungi.</p>
      </footer>
    </div>
  );
};

export default DashboardPage;