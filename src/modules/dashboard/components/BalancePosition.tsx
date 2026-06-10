import { Wallet, Landmark } from 'lucide-react';
import { BANK_BALANCES } from '../../../shared/mock/dashboardData';

export const BalancePosition = () => {
    const formatIDR = (val: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);

    return (
        <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-tight">Posisi Saldo Per Rekening</h3>
            <div className="space-y-3">
                {BANK_BALANCES.map((bank, i) => (
                    <div key={i} className="flex justify-between items-center text-[11px] border-b border-slate-50 pb-2 last:border-0">
                        <div className="flex items-center gap-2">
                            <div className="text-slate-400">
                                {bank.type === 'cash' ? <Wallet size={14} /> : <Landmark size={14} />}
                            </div>
                            <span className="font-medium text-slate-600">{bank.name}</span>
                        </div>
                        <span className="font-bold text-slate-800">{formatIDR(bank.amount).replace('Rp', 'Rp ')}</span>
                    </div>
                ))}
            </div>
            <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
                <p className="text-[11px] font-black text-blue-600 uppercase">Total Saldo</p>
                <p className="text-sm font-black text-blue-600 tracking-tight">Rp 985.500.000</p>
            </div>
        </div>
    );
};