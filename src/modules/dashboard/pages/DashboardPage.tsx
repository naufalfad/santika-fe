import {
  Wallet, Building2, Heart, TrendingUp, TrendingDown,
  Calendar, ChevronRight
} from 'lucide-react';
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

const DashboardPage = () => {
  const { user } = useAuthStore();
  const kasMasuk = useKasStore((state) => state.kasMasuk);
  const kasKeluar = useKasStore((state) => state.kasKeluar);

  const formatIDR = (val: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);

  // Dynamic calculations based on Kas store
  const totalIn = kasMasuk.reduce((sum, item) => sum + item.jumlah, 0);
  const totalOut = kasKeluar.reduce((sum, item) => sum + item.jumlah, 0);
  const currentSaldo = 245000000 + totalIn - totalOut - 19400000; // Base adjusted to match starting state

  const dynamicStats = [
    { label: 'SALDO OPERASIONAL', val: currentSaldo, sub: 'Kas + Bank', color: 'blue', icon: 'wallet', visible: ['PASTOR', 'BENDAHARA', 'DEWAN_KEUANGAN', 'SUPER_ADMIN'] },
    { label: 'DANA PEMBANGUNAN', val: 785000000, sub: 'Saldo Dana Pembangunan', color: 'emerald', icon: 'building', visible: ['PASTOR', 'BENDAHARA', 'TIM_PEMBANGUNAN', 'SUPER_ADMIN'] },
    { label: 'DANA SOSIAL (PSE)', val: 58000000, sub: 'Saldo Dana Sosial', color: 'purple', icon: 'heart', visible: ['PASTOR', 'BENDAHARA', 'KETUA_KOMISI', 'SUPER_ADMIN'] },
    { label: 'PENDAPATAN BULAN INI', val: totalIn, sub: 'Mei 2025', color: 'orange', icon: 'trending-up', visible: ['PASTOR', 'BENDAHARA', 'DEWAN_KEUANGAN', 'SEKRETARIAT', 'SUPER_ADMIN'] },
    { label: 'PENGELUARAN BULAN INI', val: totalOut, sub: 'Mei 2025', color: 'cyan', icon: 'trending-down', visible: ['PASTOR', 'BENDAHARA', 'DEWAN_KEUANGAN', 'KETUA_KOMISI', 'SUPER_ADMIN'] },
  ];

  // Filter stats berdasarkan role user yang aktif
  const stats = dynamicStats.filter(s => s.visible.includes(user?.role || ''));

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'wallet': return <Wallet size={20} />;
      case 'building': return <Building2 size={20} />;
      case 'heart': return <Heart size={20} />;
      case 'trending-up': return <TrendingUp size={20} />;
      case 'trending-down': return <TrendingDown size={20} />;
      default: return <Wallet size={20} />;
    }
  };

  return (
    <div className="space-y-6 pb-10">
      {/* 1. HERO SECTION */}
      <div className="relative overflow-hidden bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        {/* Background Image */}
        <div className="absolute right-0 top-0 h-full w-[32%] hidden lg:block">
          <img
            src="src/assets/church-bg.png"
            alt="Church BG"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Content */}
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 items-center gap-6">

          {/* LEFT */}
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              Dashboard {user?.role.toLowerCase().replace('_', ' ')}
            </h1>

            <p className="text-rose-700 font-bold text-lg">
              {DASHBOARD_HERO.paroki}
            </p>

            <div className="mt-4">
              <p className="text-sm font-bold text-slate-700">
                Selamat datang, {user?.name}
              </p>
              <p className="text-xs text-slate-500">
                Berikut adalah ringkasan kondisi keuangan paroki saat ini.
              </p>
            </div>
          </div>

          {/* CENTER */}
          <div className="flex justify-center lg:justify-center">
            <div className="flex items-center gap-4 bg-blue-50 border border-blue-100 p-4 rounded-2xl shadow-sm backdrop-blur-sm">
              <div className="p-3 bg-white text-blue-600 rounded-xl shadow-sm">
                <Calendar size={24} />
              </div>

              <div>
                <p className="text-xs font-bold text-blue-600 uppercase tracking-tighter">
                  Selasa
                </p>
                <p className="text-sm font-black text-slate-800">
                  20 Mei 2025
                </p>
                <p className="text-[10px] text-slate-500 font-medium tracking-widest">
                  10:30 WIB
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT */}
          <div />
        </div>
      </div>

      {/* 2. STAT CARDS SECTION - Scrollable on mobile */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {stats.map((item, idx) => (
          <Card key={idx} className="p-0 border-slate-100 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-all">
            <div className={cn("h-1.5",
              item.color === 'blue' ? 'bg-blue-500' :
                item.color === 'emerald' ? 'bg-emerald-500' :
                  item.color === 'purple' ? 'bg-purple-500' :
                    item.color === 'orange' ? 'bg-orange-500' : 'bg-cyan-500'
            )} />

            <div className="p-5 flex-1">
              <div className="flex items-center gap-3 mb-4">
                <div className={cn("p-2 rounded-lg",
                  item.color === 'blue' ? 'bg-blue-50 text-blue-600' :
                    item.color === 'emerald' ? 'bg-emerald-50 text-emerald-600' :
                      item.color === 'purple' ? 'bg-purple-50 text-purple-600' :
                        item.color === 'orange' ? 'bg-orange-50 text-orange-600' : 'bg-cyan-50 text-cyan-600'
                )}>
                  {getIcon(item.icon)}
                </div>
                <div className="min-w-0">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter truncate">{item.label}</p>
                </div>
              </div>

              <h3 className="text-xl font-black text-slate-800 tracking-tight">{formatIDR(item.val)}</h3>
              <p className="text-[10px] text-slate-400 font-bold mt-1">{item.sub}</p>
            </div>

            <button className="px-5 py-2 text-[10px] font-bold text-blue-600 border-t border-slate-50 flex items-center justify-between hover:bg-slate-50 transition-colors">
              Lihat Detail <ChevronRight size={12} />
            </button>
          </Card>
        ))}
      </div>

      {/* 3. MIDDLE SECTION: Charts & Pending Requests */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <Card className="lg:col-span-8 p-6 border-slate-100 shadow-sm">
          <FinancialChart />
        </Card>

        <Card className="lg:col-span-4 p-6 border-slate-100 shadow-sm">
          <PendingApprovals />
        </Card>
      </div>

      {/* 4. BOTTOM SECTION: Budget, Balances, & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Budget Summary (Left wide) */}
        <Card className="lg:col-span-6 p-6 border-slate-100 shadow-sm">
          <BudgetSummary />
        </Card>

        {/* Balance Position (Middle) */}
        <Card className="lg:col-span-3 p-6 border-slate-100 shadow-sm">
          <BalancePosition />
        </Card>

        {/* Recent Activity (Right) */}
        <Card className="lg:col-span-3 p-6 border-slate-100 shadow-sm">
          <RecentActivity />
        </Card>
      </div>

      <footer className="mt-12 text-center text-[10px] text-gray-400">
        <p>SANTIKA - Sistem Akuntansi dan Tata Kelola Keuangan Gereja</p>
        <p>© 2025 Paroki St. Stefanus - Sempan. Semua hak dilindungi.</p>
      </footer>
    </div>
  );
};

export default DashboardPage;