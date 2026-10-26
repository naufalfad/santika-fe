import { useState, useEffect } from 'react';
// Imports for manual login form (commented out for demo mode)
// import { useForm } from 'react-hook-form';
// import { zodResolver } from '@hookform/resolvers/zod';
// import * as z from 'zod';
// import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
// import { Button } from '../../../shared/components/ui/Button';

import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../../app/store/useAuthStore';
import { AlertCircle, Loader2, ArrowRight, Sparkles, ShieldCheck } from 'lucide-react';
import churchBg from '../../../assets/church-bg.png';
import stefanusLogo from '../../../assets/stefanus_sempan_logo.png';

// Schema and types for manual login (saved for restoring later)
/*
const LoginSchema = z.object({
  email: z.string().min(1, 'Email wajib diisi').email('Format email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
});
type LoginInput = z.infer<typeof LoginSchema>;
*/

interface DemoSeedUser {
  email: string;
  name: string;
  role: string;
  roleLabel: string;
  scope: string;
  badgeClass: string;
  avatarClass: string;
  initials: string;
}

const DEMO_SEED_USERS: DemoSeedUser[] = [
  {
    email: 'admin@santika.org',
    name: 'Super Admin Santika',
    role: 'SUPER_ADMIN',
    roleLabel: 'Super Admin',
    scope: 'Akses penuh sistem & kelola data master',
    badgeClass: 'bg-purple-500/10 text-purple-300 border-purple-500/30',
    avatarClass: 'bg-purple-500/20 text-purple-300 border-purple-500/40 group-hover:border-purple-400',
    initials: 'SA',
  },
  {
    email: 'pastor@santika.org',
    name: 'Romo Yohanes, Pr',
    role: 'PASTOR',
    roleLabel: 'Pastor Paroki',
    scope: 'Persetujuan akhir anggaran & kebijakan',
    badgeClass: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
    avatarClass: 'bg-amber-500/20 text-amber-300 border-amber-500/40 group-hover:border-amber-400',
    initials: 'RY',
  },
  {
    email: 'bendahara@santika.org',
    name: 'Ibu Maria Susanti',
    role: 'BENDAHARA',
    roleLabel: 'Bendahara',
    scope: 'Verifikasi kas, pencairan dana & SPJ',
    badgeClass: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
    avatarClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 group-hover:border-emerald-400',
    initials: 'MS',
  },
  {
    email: 'dewan@santika.org',
    name: 'Bapak FX. Bambang',
    role: 'DEWAN_KEUANGAN',
    roleLabel: 'Dewan Keuangan',
    scope: 'Review anggaran & monitoring keuangan',
    badgeClass: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30',
    avatarClass: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 group-hover:border-cyan-400',
    initials: 'FB',
  },
  {
    email: 'komisi@santika.org',
    name: 'Bapak Ignatius Sutrisno',
    role: 'KETUA_KOMISI',
    roleLabel: 'Ketua Komisi',
    scope: 'Pengajuan permohonan dana & SPJ komisi',
    badgeClass: 'bg-blue-500/10 text-blue-300 border-blue-500/30',
    avatarClass: 'bg-blue-500/20 text-blue-300 border-blue-500/40 group-hover:border-blue-400',
    initials: 'IS',
  },
  {
    email: 'pembangunan@santika.org',
    name: 'Bapak Thomas Wijaya',
    role: 'TIM_PEMBANGUNAN',
    roleLabel: 'Tim Pembangunan',
    scope: 'Kelola proyek renovasi & dana khusus',
    badgeClass: 'bg-orange-500/10 text-orange-300 border-orange-500/30',
    avatarClass: 'bg-orange-500/20 text-orange-300 border-orange-500/40 group-hover:border-orange-400',
    initials: 'TW',
  },
  {
    email: 'sekretariat@santika.org',
    name: 'Sdri. Anastasia Eka',
    role: 'SEKRETARIAT',
    roleLabel: 'Sekretariat',
    scope: 'Administrasi paroki & pencatatan agenda',
    badgeClass: 'bg-teal-500/10 text-teal-300 border-teal-500/30',
    avatarClass: 'bg-teal-500/20 text-teal-300 border-teal-500/40 group-hover:border-teal-400',
    initials: 'AE',
  },
];

const LoginPage = () => {
  const { user, login, isLoading } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [selectedEmail, setSelectedEmail] = useState<string | null>(null);

  const from = (location.state as any)?.from?.pathname || '/';

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate(from, { replace: true });
    }
  }, [user, navigate, from]);

  // Form manual hook (commented out for client demo mode)
  /*
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginInput) => {
    setErrorMsg(null);
    try {
      await login(data.email, data.password);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Email atau password salah. Silakan coba lagi.';
      setErrorMsg(msg);
    }
  };
  */

  // Quick Access 1-Click Login handler
  const handleQuickLogin = async (email: string) => {
    setErrorMsg(null);
    setSelectedEmail(email);
    try {
      await login(email, 'password123');
      // Redirect handled by useEffect on user state change
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Gagal login dengan akun ini. Pastikan backend server aktif.';
      setErrorMsg(msg);
      setSelectedEmail(null);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-slate-950 text-slate-100 select-none">
      {/* Left Pane: Background Image with Gradient and Overlay (Hidden on Mobile) */}
      <div className="hidden lg:flex flex-1 relative bg-slate-950 items-center justify-center overflow-hidden border-r border-slate-800/80">
        {/* Background Image with subtle zoom scale */}
        <div
          className="absolute inset-0 bg-cover bg-center scale-105 opacity-70"
          style={{ backgroundImage: `url(${churchBg})` }}
        />
        {/* Overlay gradient to blend clean and sleek dark mode, fading to dark at the right separator */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/20 via-slate-950/40 to-slate-950" />
      </div>

      {/* Right Pane: Login & Quick Access Form */}
      <div className="w-full lg:w-[480px] xl:w-[540px] flex flex-col justify-between p-6 sm:p-8 md:p-10 bg-slate-900 border-l border-slate-800/80 z-10 shrink-0 shadow-2xl h-screen overflow-y-auto sidebar-scrollbar">
        {/* Top spacer / logo / brand header */}
        <div className="space-y-5 my-auto">
          {/* Logo & Brand Header */}
          <div className="flex flex-col items-center text-center gap-2 pt-2">
            <img
              src={stefanusLogo}
              alt="Logo Stefanus Sempan"
              className="h-20 w-auto object-contain drop-shadow-md animate-fade-in"
            />
            <div className="space-y-0.5">
              <h1 className="text-xl font-bold tracking-tight text-white uppercase">
                SANTIKA
              </h1>
              <p className="text-[11px] font-semibold text-blue-400 uppercase tracking-wider">
                Paroki St. Stefanus - Sempan
              </p>
              <p className="text-[10px] font-medium text-slate-400">
                Sistem Akuntansi dan Tata Kelola Keuangan Gereja
              </p>
            </div>
          </div>

          {/* Quick Access Demo Header Banner */}
          <div className="border-t border-b border-slate-800/80 py-3">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h2 className="text-xs font-bold text-white tracking-wide uppercase flex items-center gap-1.5">
                  <ShieldCheck size={14} className="text-blue-400" />
                  Akses Cepat (Quick Access)
                </h2>
              </div>
              <span className="text-[9px] text-slate-500 font-mono">7 Akun Siap</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1.5 leading-relaxed">
              Klik salah satu akun seeder di bawah untuk langsung login dan mendemokan perspektif hak akses role tersebut:
            </p>
          </div>

          {/* Alert Error Banner */}
          {errorMsg && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 flex items-start gap-2.5">
              <AlertCircle size={15} className="shrink-0 mt-0.5" />
              <p className="text-[11px] font-semibold leading-relaxed">{errorMsg}</p>
            </div>
          )}

          {/* Quick Access Account List */}
          <div className="space-y-2">
            {DEMO_SEED_USERS.map((u) => {
              const isThisLoading = selectedEmail === u.email && isLoading;
              const isAnyLoading = isLoading && selectedEmail !== null;

              return (
                <button
                  key={u.email}
                  type="button"
                  onClick={() => handleQuickLogin(u.email)}
                  disabled={isAnyLoading}
                  className="w-full text-left p-2.5 sm:p-3 bg-slate-950/60 hover:bg-slate-800/80 active:bg-slate-800 border border-slate-800/90 hover:border-blue-500/50 rounded-none transition-all duration-150 group flex items-center justify-between gap-3 disabled:opacity-50 disabled:pointer-events-none cursor-pointer relative overflow-hidden shadow-sm"
                >
                  {/* Subtle hover accent bar on left */}
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />

                  {/* Avatar + User Info */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-9 h-9 shrink-0 flex items-center justify-center font-bold text-xs uppercase rounded-none border ${u.avatarClass} transition-colors`}
                    >
                      {u.initials}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-white group-hover:text-blue-300 transition-colors truncate">
                          {u.name}
                        </span>
                        <span
                          className={`px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded-none border ${u.badgeClass}`}
                        >
                          {u.roleLabel}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                        <span className="text-slate-500 font-mono text-[9px]">{u.email}</span>
                        <span className="text-slate-600 hidden sm:inline">•</span>
                        <span className="truncate max-w-[200px] text-slate-400 group-hover:text-slate-300 hidden sm:inline">
                          {u.scope}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action Icon or Spinner */}
                  <div className="shrink-0 pl-2">
                    {isThisLoading ? (
                      <div className="flex items-center gap-1.5 text-blue-400 text-[10px] font-medium">
                        <Loader2 size={15} className="animate-spin" />
                        <span className="hidden sm:inline">Masuk...</span>
                      </div>
                    ) : (
                      <div className="w-7 h-7 flex items-center justify-center bg-slate-900 border border-slate-800 text-slate-400 group-hover:text-blue-400 group-hover:border-blue-500/40 group-hover:bg-blue-500/10 transition-all">
                        <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* ========================================================================= */}
          {/* FIELD LOGIN MANUAL (DI-COMMENT SEMENTARA SESUAI PERMINTAAN UNTUK DEMO KLIEN) */}
          {/* ========================================================================= */}
          {/*
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-4 border-t border-slate-800">
            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold text-slate-400 flex items-center gap-2">
                <Mail size={12} className="text-slate-400" /> Alamat Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  placeholder="nama@email.com"
                  {...register('email')}
                  disabled={isSubmitting || isLoading}
                  className="w-full px-4 py-2.5 bg-slate-950/50 border border-slate-800 rounded-none text-xs text-white placeholder:text-slate-600 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-medium"
                />
              </div>
              {errors.email && (
                <p className="text-[10px] text-rose-400 font-medium">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold text-slate-400 flex items-center gap-2">
                <Lock size={12} className="text-slate-400" /> Kata Sandi
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  {...register('password')}
                  disabled={isSubmitting || isLoading}
                  className="w-full pl-4 pr-10 py-2.5 bg-slate-950/50 border border-slate-800 rounded-none text-xs text-white placeholder:text-slate-600 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-[10px] text-rose-400 font-medium">{errors.password.message}</p>
              )}
            </div>

            <Button
              type="submit"
              disabled={isSubmitting || isLoading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-none font-medium text-xs mt-6 flex justify-center items-center gap-2 shadow-lg shadow-blue-500/10 cursor-pointer"
            >
              {isSubmitting || isLoading ? (
                <>
                  <Loader2 size={14} className="animate-spin" /> Menyambungkan...
                </>
              ) : (
                'Masuk Aplikasi'
              )}
            </Button>
          </form>
          */}
        </div>

        {/* Footer Credit */}
        <div className="text-center pt-4 pb-2 border-t border-slate-800">
          <p className="text-[9px] text-slate-500 font-semibold leading-relaxed">
            Paroki St. Stefanus Sempan <br />
            © 2026 Santika Team. All Rights Reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
