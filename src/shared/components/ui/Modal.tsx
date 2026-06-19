import React, { Fragment } from 'react';
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Transition,
  TransitionChild,
} from '@headlessui/react';
import { X } from 'lucide-react';
import { cn } from '../../utils/cn';

type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  /**
   * Footer slot — tempatkan tombol aksi (Simpan, Batal, dll) di sini.
   * Dipisah dari children agar padding footer bisa dikontrol secara independen
   * dan footer selalu tampil di bawah area scroll.
   */
  footer?: React.ReactNode;
  /**
   * Ukuran max-width panel modal.
   * @default 'md'
   */
  size?: ModalSize;
  /**
   * Jika true, klik pada backdrop TIDAK akan menutup modal.
   * Gunakan untuk form yang butuh konfirmasi eksplisit sebelum dibatalkan.
   * @default false
   */
  persistent?: boolean;
}

/**
 * GRASP: Pure Fabrication + High Cohesion
 * Modal adalah wrapper aksesibel berbasis Headless UI Dialog.
 * Ia tidak memegang data bisnis — murni mengatur presentasi dan
 * aksesibilitas dialog overlay.
 *
 * DESIGN SYSTEM GUARD:
 * - rounded-none: MUTLAK pada DialogPanel dan semua elemen internal.
 * - Transisi menggunakan kombinasi opacity + translateY (slide-up effect)
 *   yang lebih terasa "premium" daripada scale-95 yang terkesan toy-ish.
 * - Tidak ada glassmorphism. Backdrop menggunakan warna solid flat.
 * - Header bar menggunakan border-b satu sisi (no box-inside-box rule).
 * - Footer slot dipisah dari body untuk zero data clipping pada form panjang.
 *
 * LIGHTWEIGHT RENDERING:
 * - Transition menggunakan CSS opacity + transform — tidak ada filter blur.
 * - max-h-[70vh] pada body dengan overflow-y-auto mencegah modal melebihi viewport.
 */
export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  persistent = false,
}) => {
  const sizeMap: Record<ModalSize, string> = {
    sm: 'max-w-sm',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-[95vw]',
  };

  const handleClose = () => {
    if (persistent) return;
    onClose();
  };

  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-[100]"
        onClose={handleClose}
        aria-labelledby="modal-title"
      >
        {/* ── BACKDROP: Flat solid, zero glassmorphism ── */}
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-slate-900/50" aria-hidden="true" />
        </TransitionChild>

        {/* ── CENTERING WRAPPER ── */}
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end sm:items-center justify-center p-0 sm:p-4">
            {/* ── PANEL TRANSITION: slide-up di mobile, fade+slide di desktop ── */}
            {/* Lebih premium dari scale-95 — terasa seperti native sheet */}
            <TransitionChild
              as={Fragment}
              enter="ease-out duration-250"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-150"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              {/* ── DIALOG PANEL ── */}
              {/* DESIGN SYSTEM GUARD: rounded-none — zero rounded-none corners */}
              <DialogPanel
                className={cn(
                  'w-full bg-white text-left align-middle shadow-2xl',
                  'border border-slate-200',
                  // DESIGN SYSTEM GUARD: rounded-none — zero rounded-none corners di panel
                  'rounded-none',
                  'flex flex-col',
                  // Mobile: full width dari bawah. Desktop: terbatas max-width
                  'max-h-[90vh] sm:max-h-[85vh]',
                  sizeMap[size]
                )}
              >
                {/* ── HEADER BAR ── */}
                {/* border-b satu sisi — sesuai no-box-inside-box rule */}
                <div className="flex-shrink-0 flex items-center justify-between px-5 py-3.5 border-b">
                  <DialogTitle
                    as="h3"
                    id="modal-title"
                    className="text-xs font-semibold text-slate-800"
                  >
                    {title}
                  </DialogTitle>
                  {/* DESIGN SYSTEM GUARD: rounded-none pada tombol close */}
                  <button
                    type="button"
                    onClick={onClose}
                    className={cn(
                      'flex items-center justify-center w-7 h-7',
                      'text-slate-400 hover:text-slate-700',
                      'hover:bg-slate-100',
                      // DESIGN SYSTEM GUARD: rounded-none
                      'rounded-none',
                      'transition-colors duration-150',
                    )}
                    aria-label="Tutup dialog"
                  >
                    <X size={15} />
                  </button>
                </div>

                {/* ── BODY KONTEN ── */}
                {/* overflow-y-auto pada body saja — header & footer selalu terlihat */}
                <div className="flex-1 overflow-y-auto p-5 min-h-0">
                  {children}
                </div>

                {/* ── FOOTER SLOT (opsional) ── */}
                {/* border-t satu sisi — konsisten dengan no-box-inside-box rule */}
                {footer && (
                  <div className="flex-shrink-0 px-5 py-3.5 border-t bg-slate-50/50">
                    {footer}
                  </div>
                )}
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};