import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/Button';
import { Card } from './ui/Card';

export const AccessDenied = () => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center min-h-[60vh] px-4">
      <Card className="max-w-md w-full p-8 text-center border-slate-200 shadow-xl space-y-6">
        <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mx-auto border border-rose-100 shadow-sm">
          <ShieldAlert size={36} />
        </div>
        
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-slate-800">Akses Ditolak</h3>
          <p className="text-sm text-slate-500 max-w-xs mx-auto leading-relaxed">
            Maaf, peranan (role) Anda saat ini tidak memiliki wewenang untuk melihat isi halaman ini.
          </p>
        </div>

        <div className="pt-4 border-t border-slate-100">
          <Button 
            onClick={() => navigate('/')}
            className="w-full py-3 font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-100 flex items-center justify-center gap-2"
          >
            <ArrowLeft size={16} /> Kembali ke Dashboard
          </Button>
        </div>
      </Card>
    </div>
  );
};
