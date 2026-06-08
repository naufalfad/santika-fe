import React from 'react';
import { Card } from '../ui/Card';
import { Wallet, ArrowDownRight, ArrowUpRight, Clock } from 'lucide-react';
import { DASHBOARD_STATS } from '../../mock/dashboardData';

export const StatCards = ({ role }: { role: string }) => {
  const formatIDR = (val: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <Card className="p-6">
        <div className="flex justify-between items-start text-blue-600">
          <Wallet size={24} />
          <span className="text-xs font-bold bg-blue-50 px-2 py-1 rounded text-blue-700">Total Saldo</span>
        </div>
        <h3 className="text-2xl font-bold mt-4">{formatIDR(DASHBOARD_STATS.totalSaldo)}</h3>
        <p className="text-xs text-gray-500 mt-1">Gabungan Kas & Bank</p>
      </Card>

      <Card className="p-6">
        <div className="flex justify-between items-start text-emerald-600">
          <ArrowDownRight size={24} />
          <span className="text-xs font-bold bg-emerald-50 px-2 py-1 rounded text-emerald-700">Masuk (Bulan Ini)</span>
        </div>
        <h3 className="text-2xl font-bold mt-4">{formatIDR(DASHBOARD_STATS.kasMasukBulanIni)}</h3>
        <p className="text-xs text-emerald-600 mt-1">↑ 12% dari bulan lalu</p>
      </Card>

      {role === 'PASTOR' || role === 'SUPER_ADMIN' ? (
        <Card className="p-6 border-orange-200 bg-orange-50/30">
          <div className="flex justify-between items-start text-orange-600">
            <Clock size={24} />
            <span className="text-xs font-bold bg-orange-100 px-2 py-1 rounded text-orange-700">Persetujuan</span>
          </div>
          <h3 className="text-2xl font-bold mt-4">{DASHBOARD_STATS.pendingApproval}</h3>
          <p className="text-xs text-gray-500 mt-1">Menunggu verifikasi Anda</p>
        </Card>
      ) : (
        <Card className="p-6">
          <div className="flex justify-between items-start text-rose-600">
            <ArrowUpRight size={24} />
            <span className="text-xs font-bold bg-rose-50 px-2 py-1 rounded text-rose-700">Keluar (Bulan Ini)</span>
          </div>
          <h3 className="text-2xl font-bold mt-4">{formatIDR(DASHBOARD_STATS.kasKeluarBulanIni)}</h3>
          <p className="text-xs text-rose-600 mt-1">↓ 5% dari bulan lalu</p>
        </Card>
      )}

      <Card className="p-6">
        <div className="flex justify-between items-start text-purple-600">
          <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
            <span className="font-bold text-xs">{DASHBOARD_STATS.realisasiAnggaran}%</span>
          </div>
          <span className="text-xs font-bold bg-purple-50 px-2 py-1 rounded text-purple-700">Realisasi Anggaran</span>
        </div>
        <div className="w-full bg-gray-100 h-2 rounded-full mt-6">
          <div className="bg-purple-600 h-2 rounded-full" style={{ width: `${DASHBOARD_STATS.realisasiAnggaran}%` }}></div>
        </div>
        <p className="text-[10px] text-gray-500 mt-2 text-right">Target Tahunan: 2.5M</p>
      </Card>
    </div>
  );
};