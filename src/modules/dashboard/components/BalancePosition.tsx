import { useMemo } from 'react';
import { Wallet, Building2 } from 'lucide-react';
import { useFundBalancesQuery } from '../../kas-masuk/hooks/useKasMasukQuery';
import { formatIDR } from '../../../shared/utils/formatter';

export const BalancePosition = () => {
    const { data: fundBalances = [], isLoading } = useFundBalancesQuery();

    const totalSaldo = useMemo(() => {
        return fundBalances.reduce((sum, item) => sum + Number(item.balance || 0), 0);
    }, [fundBalances]);

    return (
        <div className="flex flex-col h-full">
            <h3 className="text-xs font-semibold text-slate-400 shrink-0">
                Posisi Saldo Per Pos Dana
            </h3>

            {/* Scrollable Area Tengah */}
            <div className="flex-1 overflow-y-auto no-scrollbar mt-4 pr-1 space-y-2">
                {isLoading ? (
                    <p className="text-[11px] text-center text-slate-400 font-medium py-8">
                        Memuat data saldo...
                    </p>
                ) : fundBalances.length === 0 ? (
                    <p className="text-[11px] text-center text-slate-400 font-medium py-8">
                        Tidak ada data saldo pos dana.
                    </p>
                ) : (
                    fundBalances.map((item) => {
                        const isSpecial = item.fund.startsWith('Dana Khusus:');
                        const displayName = isSpecial ? item.fund.replace('Dana Khusus: ', '') : item.fund;
                        return (
                            <div
                                key={item.id}
                                className="flex justify-between items-center text-[11px] border-b border-slate-100 pb-2 last:border-0 last:pb-0"
                            >
                                <div className="flex items-center gap-2 min-w-0 flex-1">
                                    <div className={isSpecial ? "text-emerald-500 shrink-0" : "text-blue-500 shrink-0"}>
                                        {isSpecial ? <Building2 size={12} /> : <Wallet size={12} />}
                                    </div>
                                    <span className="font-semibold text-slate-600 truncate">{displayName}</span>
                                </div>
                                <span className="font-semibold text-slate-800 tracking-tight shrink-0 ml-2">
                                    {formatIDR(Number(item.balance))}
                                </span>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Sticky Footer Total memeluk lantai card */}
            <div className="mt-auto pt-3 border-t border-slate-200 flex justify-between items-center shrink-0">
                <p className="text-[10px] font-semibold text-blue-600">
                    Total Saldo
                </p>
                <p className="text-sm font-semibold text-blue-600 tracking-tight">
                    {isLoading ? '...' : formatIDR(totalSaldo)}
                </p>
            </div>
        </div>
    );
};