import { useMemo } from 'react';
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
import { cn } from '../../../shared/utils/cn';
import { formatIDR } from '../../../shared/utils/formatter';

const DashboardPage = () => {
  const { user } = useAuthStore();
  const kasMasuk = useKasStore((state) => state.kasMasuk);
  const kasKeluar = useKasStore((state) => state.kasKeluar);
  const navigate = useNavigate();

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
      { label: 'DANA OPERASIONAL', val: currentSaldo, sub: 'Dana Operasional', color: 'blue', icon: 'wallet', visible: ['PASTOR', 'BENDAHARA', 'DEWAN_KEUANGAN', 'SUPER_ADMIN'] },
      { label: 'DANA PEMBANGUNAN', val: 785000000, sub: 'Dana Pembangunan', color: 'emerald', icon: 'building', visible: ['PASTOR', 'BENDAHARA', 'TIM_PEMBANGUNAN', 'SUPER_ADMIN'] },
      { label: 'DANA SOSIAL (PSE)', val: 58000000, sub: 'Dana Sosial', color: 'purple', icon: 'heart', visible: ['PASTOR', 'BENDAHARA', 'KETUA_KOMISI', 'SUPER_ADMIN'] },
      { label: 'PENDAPATAN BULAN INI', val: totalIn, sub: 'Mei 2025', color: 'orange', icon: 'trending-up', visible: ['PASTOR', 'BENDAHARA', 'DEWAN_KEUANGAN', 'SEKRETARIAT', 'SUPER_ADMIN'] },
      { label: 'PENGELUARAN BULAN INI', val: totalOut, sub: 'Mei 2025', color: 'cyan', icon: 'trending-down', visible: ['PASTOR', 'BENDAHARA', 'DEWAN_KEUANGAN', 'KETUA_KOMISI', 'SUPER_ADMIN'] },
    ];
    return dynamicStats.filter(s => s.visible.includes(user?.role || ''));
  }, [currentSaldo, totalIn, totalOut, user?.role]);

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'wallet': return <Wallet size={18} />;
      case 'building': return <Building2 size={18} />;
      case 'heart': return <Heart size={18} />;
      case 'trending-up': return <TrendingUp size={18} />;
      case 'trending-down': return <TrendingDown size={18} />;
      default: return <Wallet size={18} />;
    }
  };

  return (
    <div className="space-y-6 pb-10 max-w-[1600px] mx-auto animate-fade-slide">
      {/* 1. HERO SECTION - High Contrast & High Density */}
      <div className="relative overflow-hidden bg-white p-5 rounded-none border border-slate-200 shadow-sm">
        <div className="absolute right-0 top-0 h-full w-[28%] hidden lg:block">
          <img
            src="src/assets/church-bg.png"
            alt="Church BG"
            className="w-full h-full object-cover opacity-90"
          />
        </div>

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 items-center gap-4">
          <div>
            <h1 className="text-xl font-black text-slate-800 tracking-tight uppercase">
              Dashboard {user?.role.toLowerCase().replace('_', ' ')}
            </h1>
            <p className="text-rose-600 font-bold text-base leading-tight mt-0.5">
              {DASHBOARD_HERO.paroki}
            </p>
            <div className="mt-3">
              <p className="text-xs font-semibold text-slate-700">
                Selamat datang, {user?.name}
              </p>
              <p className="text-[11px] text-slate-400 font-medium">
                Berikut adalah ringkasan konsolidasi kondisi keuangan paroki saat ini.
              </p>
            </div>
          </div>

          <div className="flex justify-center lg:justify-center">
            <div className="flex items-center gap-3 bg-slate-50 border border-slate-100 px-4 py-2.5 rounded-none">
              <div className="p-2 bg-white text-blue-600 rounded-none shadow-none border border-slate-100">
                <Calendar size={18} />
              </div>
              <div>
                <p className="text-[10px] font-black text-blue-600 uppercase tracking-tighter">Selasa</p>
                <p className="text-xs font-black text-slate-800">20 Mei 2025</p>
                <p className="text-[9px] text-slate-400 font-bold tracking-widest uppercase">10:30 WIB</p>
              </div>
            </div>
          </div>
          <div />
        </div>
      </div>

      {/* 2. STAT CARDS SECTION - Standardized Spacing & Hover States */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {stats.map((item, idx) => (
          <Card key={idx} className="p-0 border-slate-200 hover:shadow-none hover:border-slate-300 transition-all duration-300 flex flex-col rounded-none shadow-sm">
            <div className={cn("h-1",
              item.color === 'blue' ? 'bg-blue-600' :
                item.color === 'emerald' ? 'bg-emerald-600' :
                  item.color === 'purple' ? 'bg-purple-600' :
                    item.color === 'orange' ? 'bg-orange-600' : 'bg-cyan-600'
            )} />

            <div className="p-4 flex-1 flex flex-col justify-between">
              <div className="flex items-center gap-2 mb-3">
                <div className={cn("p-1.5 rounded-none border",
                  item.color === 'blue' ? 'bg-blue-50 text-blue-600 border-blue-100/50' :
                    item.color === 'emerald' ? 'bg-emerald-50 text-emerald-600 border-emerald-100/50' :
                      item.color === 'purple' ? 'bg-purple-50 text-purple-600 border-purple-100/50' :
                        item.color === 'orange' ? 'bg-orange-50 text-orange-600 border-orange-100/50' : 'bg-cyan-50 text-cyan-600 border-cyan-100/50'
                )}>
                  {getIcon(item.icon)}
                </div>
                <div className="min-w-0">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter truncate">{item.label}</p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-black text-slate-800 tracking-tight leading-none">{formatIDR(item.val)}</h3>
                <p className="text-[9px] text-slate-400 font-bold mt-1 uppercase tracking-wide">{item.sub}</p>
              </div>
            </div>

            <button
              onClick={() => {
                if (item.label === 'SALDO OPERASIONAL') navigate('/kas-keluar');
                else if (item.label === 'PENDAPATAN BULAN INI') navigate('/kas-masuk');
                else if (item.label === 'PENGELUARAN BULAN INI') navigate('/kas-keluar');
                else if (item.label === 'DANA PEMBANGUNAN') navigate('/dana-khusus');
                else if (item.label === 'DANA SOSIAL (PSE)') navigate('/dana-khusus');
              }}
              className="px-4 py-2 text-[10px] font-bold text-blue-600 border-t border-slate-100 flex items-center justify-between hover:bg-slate-50 hover:text-blue-700 transition-colors cursor-pointer rounded-none text-left"
            >
              Lihat Detail <ChevronRight size={10} />
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
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Budget Summary (Left wide) */}
        <Card className="lg:col-span-6 p-5 border-slate-200 rounded-none shadow-sm">
          <BudgetSummary />
        </Card>

        {/* Balance Position (Middle) */}
        <Card className="lg:col-span-3 p-5 border-slate-200 rounded-none shadow-sm">
          <BalancePosition />
        </Card>

        {/* Recent Activity (Right) */}
        <Card className="lg:col-span-3 p-5 border-slate-200 rounded-none shadow-sm">
          <RecentActivity />
        </Card>
      </div>

      <footer className="mt-12 text-center text-[10px] text-slate-400 font-medium tracking-wide">
        <p>SANTIKA - Sistem Akuntansi dan Tata Kelola Keuangan Gereja</p>
        <p>© 2025 Paroki St. Stefanus - Sempan. Semua hak dilindungi.</p>
      </footer>
    </div>
  );
};

export default DashboardPage;