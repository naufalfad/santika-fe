import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../../app/store/useAuthStore';
import { Mail, Lock, Eye, EyeOff, AlertCircle, Church, Loader2 } from 'lucide-react';
import { Button } from '../../../shared/components/ui/Button';

const LoginSchema = z.object({
  email: z.string().min(1, 'Email wajib diisi').email('Format email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
});

type LoginInput = z.infer<typeof LoginSchema>;

const LoginPage = () => {
  const { user, login, isLoading } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const from = (location.state as any)?.from?.pathname || '/';

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate(from, { replace: true });
    }
  }, [user, navigate, from]);

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
      // useAuthStore user state change triggers useEffect redirect
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Email atau password salah. Silakan coba lagi.';
      setErrorMsg(msg);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden select-none">
      {/* Background Image with Dark Overlay Gradient */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 scale-105"
        style={{ backgroundImage: `url('public/church-bg.png')` }}
      />
      <div className="absolute inset-0 bg-gradient-to-tr from-slate-950 via-slate-900/90 to-slate-800/70" />

      {/* Login Card Wrapper */}
      <div className="relative w-full max-w-[420px] bg-slate-900/75 border border-slate-700/50 backdrop-blur-md p-8 shadow-2xl rounded-none flex flex-col gap-6 z-10">

        {/* Brand Header */}
        <div className="flex flex-col items-center text-center gap-2">
          <div className="w-12 h-12 bg-blue-600/90 text-white flex items-center justify-center border border-blue-500/30 shadow-lg shadow-blue-500/10">
            <Church size={24} />
          </div>
          <div className="mt-2">
            <h1 className="text-2xl font-semibold text-white leading-tight">
              SANTIKA
            </h1>
            <p className="text-[10px] font-medium text-slate-400 mt-1">
              Sistem Akuntansi Keuangan Paroki
            </p>
          </div>
        </div>

        {/* Title */}
        <div className="border-b border-slate-800 pb-3">
          <h2 className="text-sm font-semibold text-slate-300">
            Masuk ke Akun
          </h2>
        </div>

        {/* Alert Error Banner */}
        {errorMsg && (
          <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 text-rose-300 flex items-start gap-2.5">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <p className="text-[11px] font-semibold leading-relaxed">{errorMsg}</p>
          </div>
        )}

        {/* Form Fields */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Email Input */}
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

          {/* Password Input */}
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

          {/* Submit Button */}
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

        {/* Footer Credit */}
        <div className="text-center pt-2">
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
