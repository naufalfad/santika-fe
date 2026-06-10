import { UserPlus, Shield, Mail, MoreHorizontal, CheckCircle, XCircle } from 'lucide-react';
import { Card } from '../../../shared/components/ui/Card';
import { Button } from '../../../shared/components/ui/Button';
import { Badge } from '../../../shared/components/ui/Badge';
import { MOCK_USERS } from '../../../shared/mock/userData';
import { AdaptiveList } from '../../../shared/components/ui/AdaptiveList';

/**
 * Standardized high-contrast, high-density User Management page.
 * Implements AdaptiveList for responsive layouts on desktop and mobile.
 * Features sharp edges, zero nested boxes, and slide-fade animation.
 */
const UserManagementPage = () => {
    return (
        <div className="space-y-6 max-w-[1600px] mx-auto pb-10 animate-fade-slide">
            {/* Header section */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Manajemen Pengguna</h2>
                    <p className="text-sm text-gray-500 mt-0.5 font-medium">Kelola hak akses dan peranan anggota organisasi.</p>
                </div>
                <Button className="flex items-center gap-1.5 text-xs bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 shadow-sm rounded-none w-full sm:w-auto justify-center">
                    <UserPlus size={16} /> Tambah User Baru
                </Button>
            </div>

            {/* Quick stats grid - Flat design, Slate Accent, No Neon Colors */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="p-4 border-l-4 border-l-blue-600 border-y-slate-200 border-r-slate-200 rounded-none shadow-sm">
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider">Total User</p>
                    <h3 className="text-xl font-black mt-1 text-slate-800 tracking-tight">24</h3>
                </Card>
                <Card className="p-4 border-l-4 border-l-emerald-600 border-y-slate-200 border-r-slate-200 rounded-none shadow-sm">
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider">User Aktif</p>
                    <h3 className="text-xl font-black mt-1 text-slate-800 tracking-tight">22</h3>
                </Card>
                <Card className="p-4 border-l-4 border-l-amber-500 border-y-slate-200 border-r-slate-200 rounded-none shadow-sm">
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider">Menunggu Verifikasi</p>
                    <h3 className="text-xl font-black mt-1 text-slate-800 tracking-tight">2</h3>
                </Card>
                <Card className="p-4 border-l-4 border-l-slate-800 border-y-slate-200 border-r-slate-200 rounded-none shadow-sm">
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider">Role Terdaftar</p>
                    <h3 className="text-xl font-black mt-1 text-slate-800 tracking-tight">7</h3>
                </Card>
            </div>

            {/* User List using AdaptiveList - Flat Borders */}
            <div className="space-y-4">
                <AdaptiveList
                    data={MOCK_USERS}
                    desktopHeaders={[
                        'Pengguna',
                        'Role / Hak Akses',
                        'Email',
                        'Status',
                        'Aksi'
                    ]}
                    renderDesktopRow={(u) => (
                        <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-5 py-3 border-r border-slate-100">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-slate-100 border border-slate-200 rounded-none flex items-center justify-center font-bold text-xs text-slate-600">
                                        {u.name.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-800 tracking-tight">{u.name}</p>
                                        <p className="text-[10px] text-slate-400 font-mono tracking-tighter mt-0.5">{u.id}</p>
                                    </div>
                                </div>
                            </td>
                            <td className="px-5 py-3 border-r border-slate-100">
                                <div className="flex items-center gap-2">
                                    <Shield size={14} className="text-slate-400" />
                                    <span className="text-xs font-bold text-slate-600 tracking-tight">{u.role.replace(/_/g, ' ')}</span>
                                </div>
                            </td>
                            <td className="px-5 py-3 border-r border-slate-100">
                                <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                                    <Mail size={14} className="text-slate-400" />
                                    {u.email}
                                </div>
                            </td>
                            <td className="px-5 py-3 border-r border-slate-100">
                                <Badge variant={u.status === 'Aktif' ? 'success' : 'default'} className="rounded-none">
                                    <div className="flex items-center gap-1.5">
                                        {u.status === 'Aktif' ? <CheckCircle size={10} /> : <XCircle size={10} />}
                                        {u.status}
                                    </div>
                                </Badge>
                            </td>
                            <td className="px-5 py-3 text-center">
                                <button className="p-1 hover:bg-slate-50 border border-transparent hover:border-slate-200 rounded-none text-slate-400 hover:text-blue-600 transition-all cursor-pointer">
                                    <MoreHorizontal size={14} />
                                </button>
                            </td>
                        </tr>
                    )}
                    renderMobileCard={(u) => (
                        <div className="flex flex-col gap-3">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 bg-slate-100 border border-slate-200 rounded-none flex items-center justify-center font-bold text-xs text-slate-600">
                                        {u.name.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-800 tracking-tight">{u.name}</p>
                                        <p className="text-[9px] text-slate-400 font-mono tracking-tighter mt-0.5">{u.id}</p>
                                    </div>
                                </div>
                                <Badge variant={u.status === 'Aktif' ? 'success' : 'default'} className="rounded-none">
                                    <div className="flex items-center gap-1">
                                        {u.status === 'Aktif' ? <CheckCircle size={10} /> : <XCircle size={10} />}
                                        {u.status}
                                    </div>
                                </Badge>
                            </div>
                            <div className="flex justify-between items-center text-[10px] text-slate-500 font-bold pt-2 border-t border-slate-100">
                                <div className="flex items-center gap-1.5">
                                    <Shield size={12} className="text-slate-400" />
                                    <span>{u.role.replace(/_/g, ' ')}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <Mail size={12} className="text-slate-400" />
                                    <span>{u.email}</span>
                                </div>
                            </div>
                        </div>
                    )}
                />
            </div>
        </div>
    );
};

export default UserManagementPage;