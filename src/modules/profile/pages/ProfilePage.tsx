import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Camera, KeyRound, User, Mail, Shield, Building2,
  CheckCircle, AlertCircle, Loader2, Eye, EyeOff,
} from 'lucide-react';
import { useProfileQuery, useUpdateAvatarMutation, useUpdatePasswordMutation } from '../hooks/useProfileQuery';
import { useAuthStore } from '../../../app/store/useAuthStore';
import { Button } from '../../../shared/components/ui/Button';
import { Input } from '../../../shared/components/ui/Input';
import { Badge } from '../../../shared/components/ui/Badge';
import { cn } from '../../../shared/utils/cn';
import { getAvatarUrl } from '../../../shared/utils/formatter';

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

const formatRole = (role: string): string => role.replace(/_/g, ' ');

const getRoleBadgeVariant = (role: string): 'default' | 'success' | 'warning' | 'info' | 'danger' | 'neutral' => {
  switch (role) {
    case 'SUPER_ADMIN': return 'danger';
    case 'PASTOR': return 'info';
    case 'BENDAHARA': return 'success';
    case 'DEWAN_KEUANGAN': return 'warning';
    default: return 'neutral';
  }
};

/**
 * ProfilePage — Halaman Pengaturan Profil Mandiri.
 *
 * Implements strict data read-only enforcement for audit trail protection.
 * Visualized with high-density, sharp-cornered seamless boundaries.
 */
const ProfilePage = () => {
  const { data: profile, isLoading: isProfileLoading } = useProfileQuery();
  const updateAvatarMutation = useUpdateAvatarMutation();
  const updatePasswordMutation = useUpdatePasswordMutation();

  const { user: mockUser } = useAuthStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordSuccessMsg, setPasswordSuccessMsg] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { oldPassword: '', newPassword: '', confirmNewPassword: '' },
  });

  const displayName = profile?.name ?? mockUser?.name ?? 'Pengguna';
  const displayEmail = profile?.email ?? mockUser?.email ?? '-';
  const displayRole = profile?.role ?? mockUser?.role ?? '-';
  const displayParoki = profile?.paroki?.nama ?? 'Paroki St. Stefanus – Sempan';
  const displayAvatar = avatarPreview ?? profile?.avatarUrl ?? null;

  const handleAvatarClick = () => fileInputRef.current?.click();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Hanya file gambar (JPG, PNG) yang diizinkan');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('Ukuran file maksimal adalah 5 MB');
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setAvatarPreview(objectUrl);
    await updateAvatarMutation.mutateAsync(file);
    URL.revokeObjectURL(objectUrl);

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const onPasswordSubmit = async (values: ChangePasswordFormValues) => {
    setPasswordSuccessMsg(null);
    try {
      await updatePasswordMutation.mutateAsync({
        oldPassword: values.oldPassword,
        newPassword: values.newPassword,
      });
      reset();
      setPasswordSuccessMsg('Kata sandi berhasil diperbarui.');
      setTimeout(() => setPasswordSuccessMsg(null), 5000);
    } catch (err: any) {
      // Backend error is handled by mutation state
    }
  };

  if (isProfileLoading) {
    return (
      <div className="max-w-4xl mx-auto pb-10 animate-fade-slide">
        <div className="animate-pulse">
          <div className="h-8 bg-slate-200/60 w-64 mb-2 rounded-none" />
          <div className="h-4 bg-slate-200/60 w-48 mb-8 rounded-none" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border border-slate-200 bg-white">
          <div className="p-8 border-b md:border-b-0 md:border-r animate-pulse">
            <div className="w-32 h-32 bg-slate-200/60 mx-auto mb-4 rounded-none" />
            <div className="h-4 bg-slate-200/60 w-3/4 mx-auto mb-2 rounded-none" />
            <div className="h-3 bg-slate-200/60 w-1/2 mx-auto rounded-none" />
          </div>
          <div className="md:col-span-2 p-8 animate-pulse">
            <div className="space-y-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-10 bg-slate-200/60 rounded-none" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-10 space-y-0 animate-fade-slide">
      {/* ── PAGE HEADER ── */}
      <div className="mb-6">
        <h2 className="text-2xl font-medium text-slate-800 tracking-tight">
          Pengaturan Profil
        </h2>
        <p className="text-sm text-slate-500 font-medium mt-0.5">
          Kelola informasi akun dan kata sandi Anda.
        </p>
      </div>

      <div className="border border-slate-200 bg-white rounded-none shadow-sm overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-3">

          {/* ── KOLOM KIRI: Avatar + Identitas Read-Only ── */}
          <div className="p-6 md:p-8 flex flex-col items-center border-b md:border-b-0 md:border-r">
            <div className="relative group mb-5">
              <div
                className={cn(
                  'w-32 h-32 bg-slate-50 overflow-hidden rounded-none',
                  'border border-slate-200 shadow-sm',
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
                  <span className="text-4xl font-semibold text-slate-400 select-none">
                    {displayName.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>

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
                    <span className="text-white text-[10px] font-medium">
                      Ubah
                    </span>
                  </>
                )}
              </button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png"
              className="hidden"
              onChange={handleFileChange}
              aria-label="Upload foto profil"
            />

            <Button
              variant="outline"
              size="sm"
              onClick={handleAvatarClick}
              isLoading={updateAvatarMutation.isPending}
              leftIcon={<Camera size={12} />}
              className="mb-5 w-full rounded-none"
            >
              Unggah Foto Baru
            </Button>

            {updateAvatarMutation.isError && (
              <div className="flex items-center gap-1.5 mb-4 w-full bg-rose-50 p-2 rounded-none">
                <AlertCircle size={12} className="text-rose-500 shrink-0" />
                <p className="text-[9px] text-rose-600 font-medium leading-tight">
                  {(updateAvatarMutation.error as any)?.response?.data?.message
                    ?? 'Gagal mengunggah foto.'}
                </p>
              </div>
            )}

            <div className="w-full space-y-0 border-t pt-5">
              <div className="py-3 border-b">
                <div className="flex items-center gap-2 mb-1">
                  <User size={11} className="text-slate-400" />
                  <span className="text-[9px] font-semibold text-slate-400">
                    Nama Lengkap
                  </span>
                </div>
                <p className="text-xs font-medium text-slate-800 pl-[19px] tracking-tight">
                  {displayName}
                </p>
              </div>

              <div className="py-3 border-b">
                <div className="flex items-center gap-2 mb-1">
                  <Mail size={11} className="text-slate-400" />
                  <span className="text-[9px] font-semibold text-slate-400">
                    Surat Elektronik
                  </span>
                </div>
                <p className="text-xs font-semibold text-slate-600 pl-[19px] break-all">
                  {displayEmail}
                </p>
              </div>

              <div className="py-3 border-b">
                <div className="flex items-center gap-2 mb-2">
                  <Shield size={11} className="text-slate-400" />
                  <span className="text-[9px] font-semibold text-slate-400">
                    Peran Otorisasi
                  </span>
                </div>
                <div className="pl-[19px]">
                  <Badge variant={getRoleBadgeVariant(displayRole)} className="rounded-none">
                    {formatRole(displayRole)}
                  </Badge>
                </div>
              </div>

              <div className="py-3">
                <div className="flex items-center gap-2 mb-1">
                  <Building2 size={11} className="text-slate-400" />
                  <span className="text-[9px] font-semibold text-slate-400">
                    Paroki
                  </span>
                </div>
                <p className="text-xs font-semibold text-slate-600 pl-[19px]">
                  {displayParoki}
                </p>
              </div>
            </div>

            <p className="text-[9px] text-slate-400 text-center leading-relaxed mt-4 font-medium bg-slate-50 p-2 rounded-none">
              Data identitas sistem di atas terkunci secara permanen dan tidak dapat diubah secara mandiri untuk menjaga integritas Audit Trail paroki.
            </p>
          </div>

          {/* ── KOLOM KANAN: Form Ubah Kata Sandi ── */}
          <div className="md:col-span-2 p-6 md:p-8 bg-white">
            <div className="flex items-center gap-2.5 mb-6 pb-4 border-b">
              <div className="w-7 h-7 bg-slate-800 flex items-center justify-center rounded-none shadow-sm">
                <KeyRound size={14} className="text-white" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-slate-800 tracking-tight">
                  Ubah Kata Sandi
                </h3>
                <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                  Verifikasi kata sandi lama sebelum menggantinya.
                </p>
              </div>
            </div>

            <form
              onSubmit={handleSubmit(onPasswordSubmit)}
              noValidate
              className="space-y-4"
            >
              <Input
                id="oldPassword"
                label="Kata Sandi Lama"
                type={showOldPassword ? 'text' : 'password'}
                placeholder="Masukkan kata sandi saat ini"
                error={errors.oldPassword?.message}
                required
                className="rounded-none bg-slate-50 border-slate-200 focus:border-slate-800"
                rightElement={
                  <button
                    type="button"
                    onClick={() => setShowOldPassword((p) => !p)}
                    className="text-slate-400 hover:text-slate-800 transition-colors bg-white p-1"
                    tabIndex={-1}
                  >
                    {showOldPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                }
                {...register('oldPassword')}
              />

              <div className="border-t my-2" />

              <Input
                id="newPassword"
                label="Kata Sandi Baru"
                type={showNewPassword ? 'text' : 'password'}
                placeholder="Minimal 6 karakter"
                error={errors.newPassword?.message}
                required
                className="rounded-none bg-slate-50 border-slate-200 focus:border-slate-800"
                rightElement={
                  <button
                    type="button"
                    onClick={() => setShowNewPassword((p) => !p)}
                    className="text-slate-400 hover:text-slate-800 transition-colors bg-white p-1"
                    tabIndex={-1}
                  >
                    {showNewPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                }
                {...register('newPassword')}
              />

              <Input
                id="confirmNewPassword"
                label="Konfirmasi Kata Sandi Baru"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Ulangi kata sandi baru"
                error={errors.confirmNewPassword?.message}
                required
                className="rounded-none bg-slate-50 border-slate-200 focus:border-slate-800"
                rightElement={
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((p) => !p)}
                    className="text-slate-400 hover:text-slate-800 transition-colors bg-white p-1"
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                }
                {...register('confirmNewPassword')}
              />

              {passwordSuccessMsg && (
                <div className="flex items-center gap-2 bg-emerald-50 px-4 py-3 rounded-none">
                  <CheckCircle size={14} className="text-emerald-600 shrink-0" />
                  <p className="text-xs font-medium text-emerald-700 tracking-tight">
                    {passwordSuccessMsg}
                  </p>
                </div>
              )}

              {updatePasswordMutation.isError && (
                <div className="flex items-center gap-2 bg-rose-50 px-4 py-3 rounded-none">
                  <AlertCircle size={14} className="text-rose-600 shrink-0" />
                  <p className="text-xs font-medium text-rose-700 tracking-tight">
                    {(updatePasswordMutation.error as any)?.response?.data?.message
                      ?? 'Gagal memperbarui kata sandi. Periksa kata sandi lama Anda.'}
                  </p>
                </div>
              )}

              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  isLoading={isSubmitting || updatePasswordMutation.isPending}
                  leftIcon={<KeyRound size={14} />}
                  className="w-full sm:w-auto rounded-none shadow-none bg-blue-600 hover:bg-blue-700"
                >
                  Perbarui Kata Sandi
                </Button>
              </div>
            </form>

            <div className="mt-8 pt-5 border-t">
              <p className="text-[9px] font-semibold text-slate-400 mb-2">
                Kebijakan Keamanan
              </p>
              <ul className="space-y-1.5 text-[10px] text-slate-500 font-medium">
                <li className="flex items-start gap-2">
                  <span className="text-slate-300 mt-0.5">—</span>
                  Kata sandi minimal 6 karakter.
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-slate-300 mt-0.5">—</span>
                  Kata sandi lama harus divalidasi sebelum diganti.
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-slate-300 mt-0.5">—</span>
                  Perubahan kata sandi akan direkam secara otomatis dalam Audit Trail sistem.
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