import { useState, useMemo, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { KasMasukSchema } from '../types/kas-masuk';
import type { KasMasukInput } from '../types/kas-masuk';
import { Button } from '../../../shared/components/ui/Button';
import { Wallet, Calendar, Tag, FileText, CheckCircle2 } from 'lucide-react';
import { useFundCategoriesQuery, useIncomeTypesQuery, useAddIncomeTypeMutation } from '../hooks/useKasMasukQuery';
import { useKasKeluarQuery } from '../../kas-keluar/hooks/useKasKeluarQuery';
import { useSpecialFundsQuery } from '../../dana-khusus/hooks/useSpecialFundQuery';
import { useAuthStore } from '../../../app/store/useAuthStore';
import { formatIDR } from '../../../shared/utils/formatter';

interface Props {
    onSubmit: (data: KasMasukInput) => void;
    onCancel: () => void;
}

export const KasMasukForm = ({ onSubmit, onCancel }: Props) => {
    const { data: fundCategories = [], isLoading: isLoadingFunds } = useFundCategoriesQuery();
    const { data: incomeTypes = [], isLoading: isLoadingTypes } = useIncomeTypesQuery();
    const { data: kasKeluar = [] } = useKasKeluarQuery();
    const { data: specialFunds = [] } = useSpecialFundsQuery('AKTIF');
    const addIncomeTypeMutation = useAddIncomeTypeMutation();
    const { user } = useAuthStore();
    const isBendahara = user?.role === 'BENDAHARA';

    const [classification, setClassification] = useState<'NORMAL' | 'SPECIAL_FUND' | 'REFUND'>('NORMAL');

    // State for inline adding income type
    const [isAddingType, setIsAddingType] = useState(false);
    const [newTypeCode, setNewTypeCode] = useState('');
    const [newTypeName, setNewTypeName] = useState('');
    const [newTypeDesc, setNewTypeDesc] = useState('');
    const [addTypeError, setAddTypeError] = useState<string | null>(null);

    const pendingUangMuka = useMemo(() => {
        return kasKeluar.filter((item) => item.isUangMuka && item.status === 'MENUNGGU_SPJ');
    }, [kasKeluar]);

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors, isSubmitting },
    } = useForm<KasMasukInput>({
        resolver: zodResolver(KasMasukSchema),
        defaultValues: {
            transaction_date: new Date().toISOString().split('T')[0],
            fund_category_id: '',
            income_type_id: '',
            amount: undefined,
            description: '',
            parent_transaction_id: null,
            special_fund_id: '',
        }
    });

    const selectedParentId = watch('parent_transaction_id');

    const selectedParent = useMemo(() => {
        if (!selectedParentId) return null;
        return pendingUangMuka.find((item) => item.id === selectedParentId) || null;
    }, [selectedParentId, pendingUangMuka]);

    const selectedSpecialFundId = watch('special_fund_id');

    useEffect(() => {
        if (classification === 'SPECIAL_FUND') {
            if (selectedSpecialFundId) {
                const foundFund = specialFunds.find((f) => f.id === selectedSpecialFundId);
                if (foundFund && foundFund.fundCategoryId) {
                    setValue('fund_category_id', foundFund.fundCategoryId);
                }
            } else {
                setValue('fund_category_id', '');
            }
        }
    }, [selectedSpecialFundId, classification, specialFunds, setValue]);

    const handleSaveIncomeType = async () => {
        setAddTypeError(null);

        const cleanCode = newTypeCode.trim().toUpperCase();
        const cleanName = newTypeName.trim();
        const cleanDesc = newTypeDesc.trim();

        if (cleanCode.length < 2) {
            setAddTypeError('Kode minimal harus 2 karakter.');
            return;
        }
        if (cleanName.length < 2) {
            setAddTypeError('Nama Jenis minimal harus 2 karakter.');
            return;
        }

        try {
            const result = await addIncomeTypeMutation.mutateAsync({
                code: cleanCode,
                name: cleanName,
                description: cleanDesc || undefined,
            });

            if (result && result.id) {
                // Auto select the newly created income type
                setValue('income_type_id', result.id);

                // Reset states and close inline form
                setNewTypeCode('');
                setNewTypeName('');
                setNewTypeDesc('');
                setIsAddingType(false);
            }
        } catch (err: any) {
            console.error('Failed to create income type:', err);
            const errMsg = err?.response?.data?.message || err?.message || 'Gagal menyimpan Jenis Penerimaan.';
            setAddTypeError(errMsg);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Classification Tab Selection */}
            <div className="bg-slate-100 p-1.5 rounded-none border border-slate-200 flex gap-2">
                <button
                    type="button"
                    onClick={() => {
                        setClassification('NORMAL');
                        setValue('parent_transaction_id', null);
                        setValue('special_fund_id', null);
                        setValue('fund_category_id', '');
                        setValue('description', '');
                    }}
                    className={`flex-1 py-2 rounded-none text-[10px] font-semibold transition-all   ${classification === 'NORMAL'
                            ? 'bg-blue-600 text-white shadow-md shadow-blue-100'
                            : 'text-slate-500 hover:text-slate-700'
                        }`}
                >
                    Pemasukan Normal
                </button>
                <button
                    type="button"
                    onClick={() => {
                        setClassification('SPECIAL_FUND');
                        setValue('parent_transaction_id', null);
                        setValue('special_fund_id', '');
                        setValue('fund_category_id', '');
                        setValue('description', '');
                    }}
                    className={`flex-1 py-2 rounded-none text-[10px] font-semibold transition-all   ${classification === 'SPECIAL_FUND'
                            ? 'bg-blue-600 text-white shadow-md shadow-blue-100'
                            : 'text-slate-500 hover:text-slate-700'
                        }`}
                >
                    Dana Khusus
                </button>
                <button
                    type="button"
                    onClick={() => {
                        setClassification('REFUND');
                        setValue('parent_transaction_id', '');
                        setValue('special_fund_id', null);
                        setValue('fund_category_id', '');
                        setValue('description', '');
                    }}
                    className={`flex-1 py-2 rounded-none text-[10px] font-semibold transition-all   ${classification === 'REFUND'
                            ? 'bg-blue-600 text-white shadow-md shadow-blue-100'
                            : 'text-slate-500 hover:text-slate-700'
                        }`}
                >
                    Refund Uang Muka (SPJ)
                </button>
            </div>

            {/* Refund Dropdown Selector */}
            {classification === 'REFUND' && (
                <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-slate-500 flex items-center gap-2">
                        <Tag size={14} className="text-blue-500" /> Transaksi Uang Muka Asal
                    </label>
                    <select
                        {...register('parent_transaction_id')}
                        onChange={(e) => {
                            const val = e.target.value;
                            setValue('parent_transaction_id', val);
                            const found = pendingUangMuka.find((tx) => tx.id === val);
                            if (found) {
                                setValue('fund_category_id', found.fundCategoryId);
                                setValue('description', `Refund Sisa Uang Muka - ${found.transactionNo} - ${found.description}`);

                                // Auto-select PENDAPATAN_LAINNYA code if available
                                const defType = incomeTypes.find((t) => t.code === 'PENDAPATAN_LAINNYA')?.id || '';
                                if (defType) {
                                    setValue('income_type_id', defType);
                                }
                            } else {
                                setValue('fund_category_id', '');
                                setValue('description', '');
                            }
                        }}
                        className="w-full px-4 py-2.5 bg-slate-50 rounded-none text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                    >
                        <option value="">Pilih Transaksi Uang Muka</option>
                        {pendingUangMuka.map((tx) => (
                            <option key={tx.id} value={tx.id}>
                                {tx.transactionNo} - {tx.description} ({formatIDR(Number(tx.amount))})
                            </option>
                        ))}
                    </select>
                    {errors.parent_transaction_id && <p className="text-[10px] text-rose-500 font-medium">{errors.parent_transaction_id.message}</p>}

                    {/* Refund Estimation / Hint */}
                    {selectedParent && (
                        <div className="p-3.5 bg-blue-50/50 rounded-none text-xs font-semibold text-blue-800 space-y-1">
                            <p>💰 <strong className="font-medium">Nominal Uang Muka:</strong> {formatIDR(Number(selectedParent.amount))}</p>
                            {selectedParent.spj ? (
                                <>
                                    <p>📝 <strong className="font-medium">Total Belanja SPJ:</strong> {formatIDR(Number(selectedParent.spj.amount))}</p>
                                    <p>⚖️ <strong className="font-medium">Sisa Refund Estimasi:</strong> {formatIDR(Number(selectedParent.amount) - Number(selectedParent.spj.amount))}</p>
                                </>
                            ) : (
                                <p className="text-amber-700 font-medium">⚠️ Belum ada dokumen SPJ yang diverifikasi untuk transaksi ini.</p>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Dana Khusus Dropdown Selector */}
            {classification === 'SPECIAL_FUND' && (
                <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-slate-500 flex items-center gap-2">
                        <Wallet size={14} className="text-blue-500" /> Program Dana Khusus
                    </label>
                    <select
                        {...register('special_fund_id')}
                        onChange={(e) => {
                            const val = e.target.value;
                            setValue('special_fund_id', val);
                            const found = specialFunds.find((f) => f.id === val);
                            if (found && found.fundCategoryId) {
                                setValue('fund_category_id', found.fundCategoryId);
                                setValue('description', `Penerimaan Dana Khusus - ${found.name}`);
                            } else {
                                setValue('fund_category_id', '');
                                setValue('description', '');
                            }
                        }}
                        className="w-full px-4 py-2.5 bg-slate-50 rounded-none text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                    >
                        <option value="">Pilih Program Dana Khusus</option>
                        {specialFunds.map((fund) => (
                            <option key={fund.id} value={fund.id}>
                                {fund.name} ({fund.code})
                            </option>
                        ))}
                    </select>
                    {errors.special_fund_id && <p className="text-[10px] text-rose-500 font-medium">{errors.special_fund_id.message}</p>}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Tanggal */}
                <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-slate-500 flex items-center gap-2">
                        <Calendar size={14} className="text-blue-500" /> Tanggal Transaksi
                    </label>
                    <input
                        type="date"
                        {...register('transaction_date')}
                        className="w-full px-4 py-2.5 bg-slate-50 rounded-none text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                    />
                    {errors.transaction_date && <p className="text-[10px] text-rose-500 font-medium">{errors.transaction_date.message}</p>}
                </div>

                {/* Pos Dana */}
                <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-slate-500 flex items-center gap-2">
                        <Tag size={14} className="text-emerald-500" /> Pos Dana
                    </label>
                    {classification === 'REFUND' && selectedParent ? (
                        <>
                            <input type="hidden" {...register('fund_category_id')} />
                            <div className="w-full px-4 py-2.5 bg-slate-100 rounded-none text-sm font-medium text-slate-600 flex items-center h-10 border-l-4 border-l-emerald-500">
                                {selectedParent.fundCategory?.name}
                            </div>
                        </>
                    ) : classification === 'SPECIAL_FUND' && selectedSpecialFundId ? (
                        <>
                            <input type="hidden" {...register('fund_category_id')} />
                            <div className="w-full px-4 py-2.5 bg-slate-100 rounded-none text-sm font-medium text-slate-600 flex items-center h-10 border-l-4 border-l-emerald-500">
                                {specialFunds.find((f) => f.id === selectedSpecialFundId)?.name
                                    ? `Dana Khusus: ${specialFunds.find((f) => f.id === selectedSpecialFundId)?.name}`
                                    : 'Dana Khusus'}
                            </div>
                        </>
                    ) : (
                        <select
                            {...register('fund_category_id')}
                            disabled={isLoadingFunds}
                            className="w-full px-4 py-2.5 bg-slate-50 rounded-none text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all appearance-none"
                        >
                            <option value="">{isLoadingFunds ? 'Memuat Pos Dana...' : 'Pilih Pos Dana'}</option>
                            {fundCategories.map((fund) => (
                                <option key={fund.id} value={fund.id}>
                                    {fund.name}
                                </option>
                            ))}
                        </select>
                    )}
                    {errors.fund_category_id && <p className="text-[10px] text-rose-500 font-medium">{errors.fund_category_id.message}</p>}
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {/* Jenis Penerimaan */}
                <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                        <label className="text-[11px] font-semibold text-slate-500 flex items-center gap-2">
                            <Tag size={14} className="text-blue-500" /> Jenis Penerimaan
                        </label>
                        {isBendahara && classification === 'NORMAL' && (
                            <button
                                type="button"
                                onClick={() => {
                                    setIsAddingType(!isAddingType);
                                    setAddTypeError(null);
                                }}
                                className="text-[11px] font-medium text-blue-600 hover:text-blue-700 transition-colors"
                            >
                                {isAddingType ? 'Batal Tambah' : '+ Tambah Jenis Baru'}
                            </button>
                        )}
                    </div>
                    <select
                        {...register('income_type_id')}
                        disabled={isLoadingTypes || isAddingType}
                        className="w-full px-4 py-2.5 bg-slate-50 rounded-none text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all appearance-none"
                    >
                        <option value="">{isLoadingTypes ? 'Memuat Jenis Penerimaan...' : 'Pilih Jenis Penerimaan'}</option>
                        {incomeTypes.map((type) => (
                            <option key={type.id} value={type.id}>
                                {type.name} ({type.code})
                            </option>
                        ))}
                    </select>
                    {errors.income_type_id && <p className="text-[10px] text-rose-500 font-medium">{errors.income_type_id.message}</p>}

                    {/* Inline Creator Subform */}
                    {isAddingType && classification === 'NORMAL' && (
                        <div className="p-4 bg-slate-50 rounded-none space-y-3 mt-2">
                            <h4 className="text-[11px] font-semibold text-slate-600">Tambah Jenis Penerimaan Baru</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-semibold text-slate-400">Kode Jenis</label>
                                    <input
                                        type="text"
                                        value={newTypeCode}
                                        onChange={(e) => setNewTypeCode(e.target.value)}
                                        placeholder="Misal: KKM"
                                        className="w-full px-3 py-2 bg-white rounded-none text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-semibold text-slate-400">Nama Jenis</label>
                                    <input
                                        type="text"
                                        value={newTypeName}
                                        onChange={(e) => setNewTypeName(e.target.value)}
                                        placeholder="Misal: Kolekte Misa"
                                        className="w-full px-3 py-2 bg-white rounded-none text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                    />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-semibold text-slate-400">Deskripsi / Keterangan (Opsional)</label>
                                <input
                                    type="text"
                                    value={newTypeDesc}
                                    onChange={(e) => setNewTypeDesc(e.target.value)}
                                    placeholder="Keterangan singkat..."
                                    className="w-full px-3 py-2 bg-white rounded-none text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                />
                            </div>
                            {addTypeError && (
                                <p className="text-[10px] text-rose-500 font-medium">{addTypeError}</p>
                            )}
                            <div className="flex gap-2 justify-end pt-1">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        setIsAddingType(false);
                                        setAddTypeError(null);
                                        setNewTypeCode('');
                                        setNewTypeName('');
                                        setNewTypeDesc('');
                                    }}
                                    className="px-3 py-1.5 text-xs font-medium rounded-none"
                                >
                                    Batal
                                </Button>
                                <Button
                                    type="button"
                                    size="sm"
                                    disabled={addIncomeTypeMutation.isPending}
                                    onClick={handleSaveIncomeType}
                                    className="px-4 py-1.5 text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-none"
                                >
                                    {addIncomeTypeMutation.isPending ? 'Menyimpan...' : 'Simpan Jenis'}
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            
            {/* Dana Khusus Selector */}


            {/* Deskripsi / Sumber */}
            <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-500 flex items-center gap-2">
                    <FileText size={14} className="text-purple-500" /> Keterangan / Sumber
                </label>
                <input
                    type="text"
                    placeholder="Misal: Kolekte Misa Minggu Pagi"
                    {...register('description')}
                    className="w-full px-4 py-2.5 bg-slate-50 rounded-none text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                />
                {errors.description && <p className="text-[10px] text-rose-500 font-medium">{errors.description.message}</p>}
            </div>

            {/* Nominal */}
            <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-500 flex items-center gap-2">
                    <Wallet size={14} className="text-amber-500" /> Nominal (IDR)
                </label>
                <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 font-medium text-slate-400 text-sm">Rp</div>
                    <input
                        type="number"
                        placeholder="0"
                        {...register('amount', { valueAsNumber: true })}
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 rounded-none text-lg font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                    />
                </div>
                {errors.amount && <p className="text-[10px] text-rose-500 font-medium">{errors.amount.message}</p>}
            </div>

            {/* Footer Buttons */}
            <div className="flex gap-3 pt-4 border-t">
                <Button
                    type="button"
                    variant="outline"
                    onClick={onCancel}
                    className="flex-1 py-3 rounded-none font-medium text-slate-500"
                >
                    Batal
                </Button>
                <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-none font-medium shadow-none flex justify-center items-center gap-2"
                >
                    {isSubmitting ? 'Menyimpan...' : <><CheckCircle2 size={18} /> Simpan Data</>}
                </Button>
            </div>
        </form>
    );
};