import { Wallet, Landmark } from 'lucide-react';
import { BANK_BALANCES } from '../../../shared/mock/dashboardData';
import { formatIDR } from '../../../shared/utils/formatter';

export const BalancePosition = () => {
    return (
        <div className="flex flex-col h-full">
            <h3 className="text-xs font-semibold text-slate-400 shrink-0">
                Posisi Saldo Per Rekening
            </h3>

            {/* Scrollable Area Tengah */}
            <div className="flex-1 overflow-y-auto no-scrollbar mt-4 pr-1 space-y-2">
                {BANK_BALANCES.map((bank, i) => (
                    <div
                        key={i}
                        className="flex justify-between items-center text-[11px] border-b border-slate-100 pb-2 last:border-0 last:pb-0"
                    >
                        <div className="flex items-center gap-2">
                            <div className="text-slate-400">
                                {bank.type === 'cash' ? <Wallet size={12} /> : <Landmark size={12} />}
                            </div>
                            <span className="font-semibold text-slate-600">{bank.name}</span>
                        </div>
                        <span className="font-semibold text-slate-800 tracking-tight">
                            {formatIDR(bank.amount)}
                        </span>
                    </div>
                ))}
            </div>

            {/* Sticky Footer Total memeluk lantai card */}
            <div className="mt-auto pt-3 border-t border-slate-200 flex justify-between items-center shrink-0">
                <p className="text-[10px] font-semibold text-blue-600">
                    Total Saldo
                </p>
                <p className="text-sm font-semibold text-blue-600 tracking-tight">
                    {formatIDR(985500000)}
                </p>
            </div>
        </div>
    );
};