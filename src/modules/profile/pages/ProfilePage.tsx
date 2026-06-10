import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Camera,
  KeyRound,
  User,
  Mail,
  Shield,
  Building2,
  CheckCircle,
  AlertCircle,
  Loader2,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useProfileQuery, useUpdateAvatarMutation, useUpdatePasswordMutation } from '../hooks/useProfileQuery';
import { useAuthStore } from '../../../app/store/useAuthStore';
import { Button } from '../../../shared/components/ui/Button';
import { Input } from '../../../shared/components/ui/Input';
import { Badge } from '../../../shared/components/ui/Badge';
import { cn } from '../../../shared/utils/cn';
import { getAvatarUrl } from '../../../shared/utils/formatter';

// ──────────────────────────────────────────────────────────────────────────────
// ZOD SCHEMA — Validasi form ubah kata sandi (frontend layer)
// Validasi ini melengkapi validasi backend, fokus pada UX real-time.
// confirmNewPassword adalah field UI-only yang tidak dikirim ke backend.
// ──────────────────────────────────────────────────────────────────────────────
const changePasswordSchema = z
  .object({
    oldPassword: z.string().min(6, 'Kata sandi lama minimal 6 karakter'),
    newPassword: z.string().min(6, 'Kata sandi baru minimal 6 karakter'),
    confirmNewPassword: z.string().min(1, 'Konfirmasi kata sandi wajib diisi'),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: 'Konfirmasi kata sandi tidak cocok',
    path: ['confirmNewPassword'],
  })
  .refine((data) => data.oldPassword !== data.newPassword, {
    message: 'Kata sandi baru tidak boleh sama dengan yang lama',
    path: ['newPassword'],
  });

type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;

// ──────────────────────────────────────────────────────────────────────────────
// HELPER — Format label Role untuk tampilan UI
// ──────────────────────────────────────────────────────────────────────────────
const formatRole = (role: string): string =>
  role.replace(/_/g, ' ');

// ──────────────────────────────────────────────────────────────────────────────
// HELPER — Tentukan variant Badge berdasarkan role
// ──────────────────────────────────────────────────────────────────────────────
const getRoleBadgeVariant = (role: string): 'default' | 'success' | 'warning' | 'info' | 'danger' | 'neutral' => {
  switch (role) {
    case 'SUPER_ADMIN':   return 'danger';
    case 'PASTOR':        return 'info';
    case 'BENDAHARA':     return 'success';
    case 'DEWAN_KEUANGAN':return 'warning';
    default:              return 'neutral';
  }
};

/**
 * ProfilePage — Halaman Pengaturan Profil Mandiri.
 *
 * GRASP: Controller (UI)
 * ProfilePage mengorkestrasikan:
 * 1. Query data profil real dari server via useProfileQuery.
 * 2. State lokal untuk preview avatar sebelum upload.
 * 3. Mutation upload avatar via useUpdateAvatarMutation.
 * 4. Form ubah kata sandi via react-hook-form + Zod.
 * 5. Mutation update password via useUpdatePasswordMutation.
 *
 * KEBIJAKAN DATA INTEGRITY (READ-ONLY ENFORCEMENT DI UI):
 * Field yang TIDAK memiliki input form: Nama, Email, Role, Paroki.
 * Ditampilkan sebagai teks statis yang menyatu seamlessly dengan layout.
 *
 * DESIGN SYSTEM GUARD (MUTLAK):
 * - rounded-none: SEMUA elemen UI tanpa pengecualian.
 * - NO BOX INSIDE A BOX: Tidak ada card bertumpuk di dalam card.
 *   Pemisah seksi menggunakan border-b border-slate-100 (satu sisi saja).
 * - TYPOGRAPHY: Roboto, hierarki Apple-style, proporsional.
 * - LIGHTWEIGHT: Zero glassmorphism, zero shadow berwarna.
 */
const ProfilePage = () => {
  // ── Server State ──
  const { data: profile, isLoading: isProfileLoading } = useProfileQuery();
  const updateAvatarMutation = useUpdateAvatarMutation();
  const updatePasswordMutation = useUpdatePasswordMutation();

  // ── Local State ──
  const { user: mockUser } = useAuthStore(); // Fallback untuk mock mode
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordSuccessMsg, setPasswordSuccessMsg] = useState<string | null>(null);

  // ── Form State ──
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      oldPassword: '',
      newPassword: '',
      confirmNewPassword: '',
    },
  });

  // ── Computed: gunakan data profil real jika ada, fallback ke mock store ──
  const displayName    = profile?.name    ?? mockUser?.name    ?? 'Pengguna';
  const displayEmail   = profile?.email   ?? mockUser?.email   ?? '-';
  const displayRole    = profile?.role    ?? mockUser?.role    ?? '-';
  const displayParoki  = profile?.paroki?.nama ?? 'Paroki St. Stefanus – Sempan';
  const displayAvatar  = avatarPreview ?? profile?.avatarUrl ?? null;

  // ──────────────────────────────────────────────────────────────────────────
  // Handler: Pilih file avatar
  // ──────────────────────────────────────────────────────────────────────────
  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validasi client-side: hanya gambar, maksimal 5MB
    if (!file.type.startsWith('image/')) {
      alert('Hanya file gambar (JPG, PNG) yang diizinkan');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('Ukuran file maksimal adalah 5 MB');
      return;
    }

    // Preview lokal sebelum upload ke server
    const objectUrl = URL.createObjectURL(file);
    setAvatarPreview(objectUrl);

    // Upload ke server
    await updateAvatarMutation.mutateAsync(file);

    // Bersihkan object URL untuk mencegah memory leak
    URL.revokeObjectURL(objectUrl);

    // Reset file input agar file yang sama bisa dipilih ulang
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // ──────────────────────────────────────────────────────────────────────────
  // Handler: Submit form ubah kata sandi
  // ──────────────────────────────────────────────────────────────────────────
  const onPasswordSubmit = async (values: ChangePasswordFormValues) => {
    setPasswordSuccessMsg(null);
    try {
      await updatePasswordMutation.mutateAsync({
        oldPassword: values.oldPassword,
        newPassword: values.newPassword,
      });
      reset();
      setPasswordSuccessMsg('Kata sandi berhasil diperbarui.');
      // Auto-clear success message setelah 5 detik
      setTimeout(() => setPasswordSuccessMsg(null), 5000);
    } catch (err: any) {
      // Error dari backend akan ditampilkan via mutation.error di bawah
    }
  };

  // ──────────────────────────────────────────────────────────────────────────
  // Loading skeleton saat data profil sedang di-fetch
  // ──────────────────────────────────────────────────────────────────────────
  if (isProfileLoading) {
    return (
      <div className="max-w-4xl mx-auto pb-10 animate-pulse">
        <div className="h-8 bg-slate-100 w-64 mb-2" />
        <div className="h-4 bg-slate-100 w-48 mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border border-slate-200 bg-white">
          <div className="p-8 border-b md:border-b-0 md:border-r border-slate-100">
            <div className="w-32 h-32 bg-slate-100 mx-auto mb-4" />
            <div className="h-4 bg-slate-100 w-3/4 mx-auto mb-2" />
            <div className="h-3 bg-slate-100 w-1/2 mx-auto" />
          </div>
          <div className="md:col-span-2 p-8">
            <div className="space-y-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-10 bg-slate-100" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ──────────────────────────────────────────────────────────────────────────
  // RENDER UTAMA
  // ──────────────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-4xl mx-auto pb-10 space-y-0">

      {/* ── PAGE HEADER ── */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">
          Pengaturan Profil
        </h2>
        <p className="text-sm text-slate-400 font-medium mt-1">
          Kelola informasi akun dan kata sandi Anda.
        </p>
      </div>

      {/* ── PANEL UTAMA: Dua kolom (Avatar | Info) ──────────────────────────
          DESIGN SYSTEM GUARD:
          - rounded-none: container panel
          - NO BOX INSIDE A BOX: border-r satu sisi sebagai pemisah kolom,
            bukan dua card terpisah yang berdiri sendiri.
      ─────────────────────────────────────────────────────────────────────── */}
      <div className="border border-slate-200 bg-white rounded-none overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-3">

          {/* ── KOLOM KIRI: Avatar + Identitas Read-Only ── */}
          <div className="p-6 md:p-8 flex flex-col items-center border-b md:border-b-0 md:border-r border-slate-100">

            {/* AVATAR CONTAINER
                DESIGN SYSTEM GUARD: rounded-none — kotak tegas, bukan bulat */}
            <div className="relative group mb-5">
              <div
                className={cn(
                  'w-32 h-32 bg-slate-100 overflow-hidden rounded-none',
                  'border-2 border-slate-200',
                  'flex items-center justify-center',
                )}
              >
                {displayAvatar ? (
                  <img
                    src={getAvatarUrl(displayAvatar) || undefined}
                    alt={`Avatar ${displayName}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  // Placeholder inisial nama jika belum ada avatar
                  <span className="text-4xl font-black text-slate-400 select-none">
                    {displayName.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>

              {/* Overlay kamera saat hover — micro-interaction */}
              <button
                onClick={handleAvatarClick}
                disabled={updateAvatarMutation.isPending}
                className={cn(
                  'absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100',
                  'flex items-center justify-center gap-1.5',
                  'transition-opacity duration-200 cursor-pointer',
                  'rounded-none',
                  updateAvatarMutation.isPending && 'opacity-100',
                )}
                aria-label="Ubah foto profil"
              >
                {updateAvatarMutation.isPending ? (
                  <Loader2 size={20} className="text-white animate-spin" />
                ) : (
                  <>
                    <Camera size={16} className="text-white" />
                    <span className="text-white text-[10px] font-bold uppercase tracking-wider">
                      Ubah
                    </span>
                  </>
                )}
              </button>
            </div>

            {/* Input file tersembunyi — dipicu via ref */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png"
              className="hidden"
              onChange={handleFileChange}
              aria-label="Upload foto profil"
            />

            {/* Tombol upload — alternatif jika overlay kurang jelas di mobile */}
            <Button
              variant="secondary"
              size="sm"
              onClick={handleAvatarClick}
              isLoading={updateAvatarMutation.isPending}
              leftIcon={<Camera size={12} />}
              className="mb-5 w-full"
            >
              Unggah Foto
            </Button>

            {/* Error upload avatar */}
            {updateAvatarMutation.isError && (
              <div className="flex items-center gap-1.5 mb-4 w-full">
                <AlertCircle size={12} className="text-rose-500 shrink-0" />
                <p className="text-[10px] text-rose-500 font-medium">
                  {(updateAvatarMutation.error as any)?.response?.data?.message
                    ?? 'Gagal mengunggah foto. Coba lagi.'}
                </p>
              </div>
            )}

            {/* ── INFORMASI IDENTITAS: READ-ONLY ──
                DESIGN SYSTEM GUARD:
                - NO BOX INSIDE A BOX: tidak ada card di dalam kolom ini.
                - border-b satu sisi untuk pemisah item.
                - Data ditampilkan sebagai teks statis yang menyatu dengan layout. */}
            <div className="w-full space-y-0 border-t border-slate-100 pt-5">

              {/* Nama */}
              <div className="py-3 border-b border-slate-100">
                <div className="flex items-center gap-2 mb-1">
                  <User size={11} className="text-slate-400" />
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                    Nama Lengkap
                  </span>
                </div>
                <p className="text-sm font-semibold text-slate-800 pl-[19px]">
                  {displayName}
                </p>
              </div>

              {/* Email */}
              <div className="py-3 border-b border-slate-100">
                <div className="flex items-center gap-2 mb-1">
                  <Mail size={11} className="text-slate-400" />
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                    Surat Elektronik
                  </span>
                </div>
                <p className="text-sm font-medium text-slate-600 pl-[19px] break-all">
                  {displayEmail}
                </p>
              </div>

              {/* Role dengan Badge */}
              <div className="py-3 border-b border-slate-100">
                <div className="flex items-center gap-2 mb-2">
                  <Shield size={11} className="text-slate-400" />
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                    Peran
                  </span>
                </div>
                <div className="pl-[19px]">
                  <Badge variant={getRoleBadgeVariant(displayRole)}>
                    {formatRole(displayRole)}
                  </Badge>
                </div>
              </div>

              {/* Paroki */}
              <div className="py-3">
                <div className="flex items-center gap-2 mb-1">
                  <Building2 size={11} className="text-slate-400" />
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                    Paroki
                  </span>
                </div>
                <p className="text-sm font-medium text-slate-600 pl-[19px]">
                  {displayParoki}
                </p>
              </div>
            </div>

            {/* Catatan kebijakan read-only */}
            <p className="text-[9px] text-slate-300 text-center leading-relaxed mt-4 italic">
              Nama, email, peran, dan paroki adalah data identitas sistem yang tidak dapat diubah secara mandiri.
            </p>
          </div>

          {/* ── KOLOM KANAN: Form Ubah Kata Sandi ── */}
          <div className="md:col-span-2 p-6 md:p-8">

            {/* Section header */}
            <div className="flex items-center gap-2.5 mb-6 pb-4 border-b border-slate-100">
              <div className="w-7 h-7 bg-slate-800 flex items-center justify-center rounded-none">
                <KeyRound size={14} className="text-white" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800 tracking-tight">
                  Ubah Kata Sandi
                </h3>
                <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                  Verifikasi kata sandi lama sebelum menggantinya.
                </p>
              </div>
            </div>

            {/* ── FORM UBAH KATA SANDI ── */}
            <form
              onSubmit={handleSubmit(onPasswordSubmit)}
              noValidate
              className="space-y-4"
            >

              {/* Field: Kata Sandi Lama */}
              <Input
                id="oldPassword"
                label="Kata Sandi Lama"
                type={showOldPassword ? 'text' : 'password'}
                placeholder="Masukkan kata sandi saat ini"
                error={errors.oldPassword?.message}
                required
                rightElement={
                  <button
                    type="button"
                    onClick={() => setShowOldPassword((p) => !p)}
                    className="text-slate-400 hover:text-slate-600 transition-colors"
                    tabIndex={-1}
                    aria-label={showOldPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                  >
                    {showOldPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                }
                {...register('oldPassword')}
              />

              {/* Separator visual */}
              <div className="border-t border-slate-100 my-2" />

              {/* Field: Kata Sandi Baru */}
              <Input
                id="newPassword"
                label="Kata Sandi Baru"
                type={showNewPassword ? 'text' : 'password'}
                placeholder="Minimal 6 karakter"
                error={errors.newPassword?.message}
                required
                rightElement={
                  <button
                    type="button"
                    onClick={() => setShowNewPassword((p) => !p)}
                    className="text-slate-400 hover:text-slate-600 transition-colors"
                    tabIndex={-1}
                    aria-label={showNewPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                  >
                    {showNewPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                }
                {...register('newPassword')}
              />

              {/* Field: Konfirmasi Kata Sandi Baru */}
              <Input
                id="confirmNewPassword"
                label="Konfirmasi Kata Sandi Baru"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Ulangi kata sandi baru"
                error={errors.confirmNewPassword?.message}
                required
                rightElement={
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((p) => !p)}
                    className="text-slate-400 hover:text-slate-600 transition-colors"
                    tabIndex={-1}
                    aria-label={showConfirmPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                  >
                    {showConfirmPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                }
                {...register('confirmNewPassword')}
              />

              {/* Pesan sukses ubah kata sandi */}
              {passwordSuccessMsg && (
                <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-3 py-2.5 rounded-none">
                  <CheckCircle size={14} className="text-emerald-600 shrink-0" />
                  <p className="text-xs font-medium text-emerald-700">
                    {passwordSuccessMsg}
                  </p>
                </div>
              )}

              {/* Pesan error dari server */}
              {updatePasswordMutation.isError && (
                <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 px-3 py-2.5 rounded-none">
                  <AlertCircle size={14} className="text-rose-600 shrink-0" />
                  <p className="text-xs font-medium text-rose-700">
                    {(updatePasswordMutation.error as any)?.response?.data?.message
                      ?? 'Gagal memperbarui kata sandi. Periksa kata sandi lama Anda.'}
                  </p>
                </div>
              )}

              {/* Tombol Simpan */}
              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  isLoading={isSubmitting || updatePasswordMutation.isPending}
                  leftIcon={<KeyRound size={14} />}
                  className="w-full sm:w-auto"
                >
                  Perbarui Kata Sandi
                </Button>
              </div>
            </form>

            {/* ── INFORMASI KEBIJAKAN KEAMANAN ──
                Penjelasan singkat tentang kebijakan keamanan sandi.
                DESIGN SYSTEM GUARD: border-t satu sisi — no box-inside-box. */}
            <div className="mt-8 pt-6 border-t border-slate-100">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">
                Kebijakan Keamanan Sandi
              </p>
              <ul className="space-y-1 text-[10px] text-slate-400 font-medium">
                <li className="flex items-start gap-1.5">
                  <span className="text-slate-300 mt-0.5">—</span>
                  Kata sandi minimal 6 karakter.
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-slate-300 mt-0.5">—</span>
                  Kata sandi lama harus benar sebelum dapat diganti.
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-slate-300 mt-0.5">—</span>
                  Kata sandi baru tidak boleh sama dengan kata sandi lama.
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-slate-300 mt-0.5">—</span>
                  Setiap perubahan kata sandi dicatat dalam Audit Trail sistem.
                </li>
              </ul>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
