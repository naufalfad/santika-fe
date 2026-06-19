import React, { Fragment } from 'react';
import { Popover, PopoverButton, PopoverPanel, Transition } from '@headlessui/react';
import { HelpCircle } from 'lucide-react';
import { cn } from '../../utils/cn';

interface ChartCardProps {
    /** Judul utama kartu analitis */
    title: string;
    /** Subtitel sekunder untuk memberikan konteks periode atau cakupan data */
    subtitle?: string;
    /** Teks bantuan kontekstual (on-demand) yang akan disembunyikan dalam tombol Popover */
    helpText?: string;
    /** Elemen bagan lingkaran (Pie/Donut Chart) atau bagan utama */
    chartElement: React.ReactNode;
    /** Legenda data berupa komponen MiniLedger atau data detail pelengkap */
    children?: React.ReactNode;
    /** Kelas CSS tambahan untuk styling kustom pembungkus terluar */
    className?: string;
}

/**
 * GRASP: Pure Fabrication + High Cohesion
 * ChartCard yang telah direstorasi ke format Vertical Stack Layout.
 * Menjamin pembacaan data yang lega tanpa risiko pemotongan teks (data clipping)
 * di kontainer sempit (seperti lg:col-span-4).
 *
 * DESIGN SYSTEM GUARD:
 * - Menggunakan `rounded-none` secara absolut.
 * - Format vertikal murni (Grafik di atas, Ledger penuh di bawah).
 */
export const ChartCard = ({
    title,
    subtitle,
    helpText,
    chartElement,
    children,
    className,
}: ChartCardProps) => {
    return (
        <div
            className={cn(
                'bg-white border border-slate-200 shadow-sm rounded-none',
                'p-5 transition-colors duration-200 ease-in-out hover:border-slate-300 hover:bg-slate-50/20 hover:shadow-none',
                className
            )}
        >
            {/* ── HEADER BAR ── */}
            <div className="flex justify-between items-start border-b border-slate-100 pb-3.5 mb-5">
                <div className="space-y-0.5">
                    <h3 className="text-xs font-semibold text-slate-800 tracking-tight uppercase">
                        {title}
                    </h3>
                    {subtitle && (
                        <p className="text-[10px] text-slate-400 font-semibold tracking-tight">
                            {subtitle}
                        </p>
                    )}
                </div>

                {/* ── ON-DEMAND HELP TRIGGER ── */}
                {helpText && (
                    <Popover className="relative">
                        {({ open }) => (
                            <>
                                <PopoverButton
                                    className={cn(
                                        'flex items-center justify-center w-7 h-7 rounded-none transition-colors duration-150 outline-none',
                                        open
                                            ? 'bg-slate-100 text-slate-800'
                                            : 'text-slate-400 hover:text-slate-800 hover:bg-slate-50'
                                    )}
                                    aria-label="Petunjuk operasional"
                                >
                                    <HelpCircle size={14} strokeWidth={2.5} />
                                </PopoverButton>

                                <Transition
                                    as={Fragment}
                                    enter="transition ease-out duration-150"
                                    enterFrom="opacity-0 translate-y-1"
                                    enterTo="opacity-100 translate-y-0"
                                    leave="transition ease-in duration-100"
                                    leaveFrom="opacity-100 translate-y-0"
                                    leaveTo="opacity-0 translate-y-1"
                                >
                                    <PopoverPanel className="absolute right-0 top-8 z-50 w-64 bg-slate-900 text-white p-3.5 rounded-none border border-slate-700 shadow-xl focus:outline-none">
                                        <h4 className="text-[9px] font-semibold text-blue-400 uppercase tracking-widest mb-1.5">
                                            Panduan Operasional
                                        </h4>
                                        <p className="text-[10px] text-slate-300 font-medium leading-relaxed whitespace-pre-line">
                                            {helpText}
                                        </p>
                                    </PopoverPanel>
                                </Transition>
                            </>
                        )}
                    </Popover>
                )}
            </div>

            {/* ── VERTICAL STACK LAYOUT (Grafik di Atas, Ledger 100% Lebar di Bawah) ── */}
            <div className="flex flex-col gap-6 w-full">
                {/* Bagian Atas: Chart Container (Centered, 1:1 Aspect Ratio) */}
                <div className="w-full flex justify-center items-center">
                    <div className="relative w-full max-w-[180px] h-[180px] aspect-square flex items-center justify-center">
                        {chartElement}
                    </div>
                </div>

                {/* Bagian Bawah: Ledger Detail (Mengambil 100% lebar card) */}
                <div className="w-full border-t border-slate-100/80 pt-4">
                    {children}
                </div>
            </div>
        </div>
    );
};