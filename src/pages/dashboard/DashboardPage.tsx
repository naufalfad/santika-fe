import React from 'react';
import {
  Wallet, Building2, Heart, TrendingUp, TrendingDown,
  Calendar, ChevronRight, User
} from 'lucide-react';
import { useAuthStore } from '../../stores/useAuthStore';
import { Card } from '../../components/ui/Card';
import { FinancialChart } from '../../components/dashboard/FinancialChart';
import { PendingApprovals } from '../../components/dashboard/PendingApprovals';
import { BudgetSummary } from '../../components/dashboard/BudgetSummary';
import { BalancePosition } from '../../components/dashboard/BalancePosition';
import { RecentActivity } from '../../components/dashboard/RecentActivity';
import { ROLE_BASED_STATS, DASHBOARD_HERO } from '../../mock/dashboardData';
import { cn } from '../../utils/cn';

const DashboardPage = () => {
  const { user } = useAuthStore();
  const formatIDR = (val: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);

  // Filter stats berdasarkan role user
  const stats = ROLE_BASED_STATS(user?.role || '').filter(s => s.visible.includes(user?.role || ''));

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
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden">
        {/* Background Decorative Image (Simulasi Gambar Gereja di Kanan) */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 pointer-events-none hidden lg:block">
          <img src="https://via.placeholder.com/400x200" alt="Church BG" className="w-full h-full object-cover" />
        </div>

        <div className="relative z-10">
          <h1 className="text-2xl font-bold text-slate-800">Dashboard {user?.role.toLowerCase().replace('_', ' ')}</h1>
          <p className="text-rose-700 font-bold text-lg">{DASHBOARD_HERO.paroki}</p>
          <div className="mt-4">
            <p className="text-sm font-bold text-slate-700">Selamat datang, {user?.name}</p>
            <p className="text-xs text-slate-500">Berikut adalah ringkasan kondisi keuangan paroki saat ini.</p>
          </div>
        </div>

        {/* Date Time Card */}
        <div className="relative z-10 flex items-center gap-4 bg-blue-50 border border-blue-100 p-4 rounded-2xl">
          <div className="p-3 bg-white text-blue-600 rounded-xl shadow-sm">
            <Calendar size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-blue-600 uppercase tracking-tighter">Selasa</p>
            <p className="text-sm font-black text-slate-800">20 Mei 2025</p>
            <p className="text-[10px] text-slate-500 font-medium tracking-widest">10:30 WIB</p>
          </div>
        </div>
      </div>

      {/* 2. STAT CARDS SECTION - Scrollable on mobile */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {stats.map((item, idx) => (
          <Card key={idx} className="p-0 border-slate-100 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-all">
            {/* Top Colored Bar */}
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

            {/* Bottom Action */}
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

      {/* Placeholder untuk Tahap B dan C */}
      {/* <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 bg-slate-50 h-64 rounded-2xl border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-400 font-bold">
          Area Grafik & Anggaran (Tahap B & C)
        </div>
        <div className="lg:col-span-4 bg-slate-50 h-64 rounded-2xl border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-400 font-bold">
          Area Pengajuan & Aktivitas (Tahap B & C)
        </div>
      </div> */}
    </div>
  );
};

export default DashboardPage;