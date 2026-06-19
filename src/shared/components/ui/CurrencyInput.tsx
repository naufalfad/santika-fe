import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { Input } from './Input'; // Menggunakan primitif Input yang sudah ada untuk konsistensi desain

export interface CurrencyInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange' | 'type'> {
    /** Nilai murni berupa angka absolut (raw number) */
    value?: number | null;
    /** Callback yang memancarkan angka murni (bukan string bertitik) ke parent */
    onChange?: (value: number | undefined) => void;
    label?: string;
    error?: string;
    hint?: string;
    icon?: React.ReactNode;
    rightElement?: React.ReactNode;
}

/**
 * GRASP: Pure Fabrication + Information Expert
 * CurrencyInput bertanggung jawab HANYA pada satu tugas (High Cohesion):
 * Memanipulasi visualisasi angka menjadi format IDR (dengan titik) di layar,
 * sekaligus mengembalikan tipe data `number` murni ke state parent/backend.
 * 
 * CORE FEATURE: Caret Preservation Algorithm
 * Mencegah kursor melompat ke ujung kanan saat mengedit angka di tengah string.
 */
export const CurrencyInput = forwardRef<HTMLInputElement, CurrencyInputProps>(
    ({ value, onChange, placeholder = '0', ...props }, ref) => {
        // Local ref untuk memanipulasi posisi kursor secara langsung ke DOM
        const localInputRef = useRef<HTMLInputElement>(null);

        // Gabungkan forwardRef dari parent (React Hook Form) dengan localRef
        useImperativeHandle(ref, () => localInputRef.current as HTMLInputElement);

        // State untuk representasi visual di layar (contoh: "1.500.000")
        const [displayValue, setDisplayValue] = useState<string>('');

        // Sinkronisasi data dari parent (backend/RHF) ke visual layar
        useEffect(() => {
            if (value !== undefined && value !== null && !isNaN(value)) {
                // Format angka murni ke format titik ribuan tanpa "Rp"
                const formatted = new Intl.NumberFormat('id-ID').format(value);
                setDisplayValue(formatted);
            } else {
                setDisplayValue('');
            }
        }, [value]);

        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const inputElement = e.target;
            const originalSelection = inputElement.selectionStart || 0;
            const rawKeystroke = inputElement.value;

            // 1. STRICT STRIPPING: Buang semua karakter selain angka 0-9 (Anti minus, abjad, dll)
            const numericString = rawKeystroke.replace(/\D/g, '');

            // Jika input dikosongkan secara total
            if (!numericString) {
                setDisplayValue('');
                if (onChange) onChange(undefined);
                return;
            }

            // 2. PARSING & FORMATTING
            const numericValue = parseInt(numericString, 10);
            const newFormattedString = new Intl.NumberFormat('id-ID').format(numericValue);

            // 3. CARET PRESERVATION ALGORITHM (Mencegah kursor lompat ke ujung)
            // Hitung berapa banyak DIGIT (bukan titik) di sebelah kiri kursor SEBELUM diformat
            const stringBeforeCaret = rawKeystroke.substring(0, originalSelection);
            const digitCountBeforeCaret = stringBeforeCaret.replace(/\D/g, '').length;

            // Cari posisi di string BARU (yang sudah diformat) yang memiliki jumlah digit yang sama
            let newCaretPosition = 0;
            let digitsFound = 0;

            for (let i = 0; i < newFormattedString.length; i++) {
                if (/\d/.test(newFormattedString[i])) {
                    digitsFound++;
                }
                if (digitsFound === digitCountBeforeCaret) {
                    newCaretPosition = i + 1; // Posisi kursor tepat setelah digit terakhir yang ditemukan
                    break;
                }
            }

            // Fallback jika menghapus karakter di posisi paling depan
            if (digitCountBeforeCaret === 0) {
                newCaretPosition = 0;
            }

            // 4. UPDATE STATES
            setDisplayValue(newFormattedString);

            // Pancarkan data angka absolut ke parent (misal: 1500000)
            if (onChange) onChange(numericValue);

            // 5. RESTORE CARET POSITION (Menunggu siklus render React selesai)
            window.requestAnimationFrame(() => {
                if (localInputRef.current) {
                    localInputRef.current.setSelectionRange(newCaretPosition, newCaretPosition);
                }
            });
        };

        return (
            <Input
                ref={localInputRef}
                type="text" // Wajib text agar bisa dimanipulasi dengan titik dan mencegah scroll-wheel
                inputMode="numeric" // Memaksa keyboard numerik muncul di PWA/Mobile
                value={displayValue}
                onChange={handleChange}
                placeholder={placeholder}
                {...props}
                // Tambahan visual indicator IDR di kiri
                icon={<span className="text-sm font-medium text-slate-400 select-none">Rp</span>}
            />
        );
    }
);

CurrencyInput.displayName = 'CurrencyInput';