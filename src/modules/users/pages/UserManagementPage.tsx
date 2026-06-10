import { UserPlus, Shield, Mail, MoreHorizontal, CheckCircle, XCircle } from 'lucide-react';
import { Card } from '../../../shared/components/ui/Card';
import { Button } from '../../../shared/components/ui/Button';
import { Badge } from '../../../shared/components/ui/Badge';
import { MOCK_USERS } from '../../../shared/mock/userData';
import { AdaptiveList } from '../../../shared/components/ui/AdaptiveList';

/**
 * Standardized high-contrast, high-density User Management page.
 * Implements AdaptiveList for responsive layouts on desktop and mobile.
 */
const UserManagementPage = () => {
    return (
        <div className="space-y-6 max-w-[1600px] mx-auto pb-10">
            {/* Header section */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Manajemen Pengguna</h2>
                    <p className="text-gray-500 text-sm">Kelola hak akses dan peranan anggota organisasi.</p>
                </div>
                <Button className="flex items-center gap-2 text-xs">
                    <UserPlus size={16} /> Tambah User Baru
                </Button>
            </div>

            {/* Quick stats grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="p-4 bg-blue-600 text-white">
                    <p className="text-[10px] opacity-80 uppercase font-black tracking-wider">Total User</p>
                    <h3 className="text-xl font-black mt-1">24</h3>
                </Card>
                <Card className="p-4 bg-emerald-600 text-white">
                    <p className="text-[10px] opacity-80 uppercase font-black tracking-wider">User Aktif</p>
                    <h3 className="text-xl font-black mt-1">22</h3>
                </Card>
                <Card className="p-4 bg-amber-500 text-white">
                    <p className="text-[10px] opacity-80 uppercase font-black tracking-wider">Menunggu Verifikasi</p>
                    <h3 className="text-xl font-black mt-1">2</h3>
                </Card>
                <Card className="p-4 bg-slate-800 text-white">
                    <p className="text-[10px] opacity-80 uppercase font-black tracking-wider">Role Terdaftar</p>
                    <h3 className="text-xl font-black mt-1">7</h3>
                </Card>
            </div>

            {/* User List using AdaptiveList */}
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
                                <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center font-bold text-xs text-slate-600">
                                    {u.name.charAt(0)}
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-800">{u.name}</p>
                                    <p className="text-[10px] text-slate-400 font-mono">{u.id}</p>
                                </div>
                            </div>
                        </td>
                        <td className="px-5 py-3 border-r border-slate-100">
                            <div className="flex items-center gap-2">
                                <Shield size={14} className="text-blue-500" />
                                <span className="text-xs font-semibold text-slate-600">{u.role.replace('_', ' ')}</span>
                            </div>
                        </td>
                        <td className="px-5 py-3 border-r border-slate-100">
                            <div className="flex items-center gap-2 text-xs text-slate-500">
                                <Mail size={14} />
                                {u.email}
                            </div>
                        </td>
                        <td className="px-5 py-3 border-r border-slate-100">
                            <Badge variant={u.status === 'Aktif' ? 'success' : 'default'}>
                                <div className="flex items-center gap-1">
                                    {u.status === 'Aktif' ? <CheckCircle size={12} /> : <XCircle size={12} />}
                                    {u.status}
                                </div>
                            </Badge>
                        </td>
                        <td className="px-5 py-3 text-center">
                            <button className="p-1 hover:bg-slate-50 border border-transparent hover:border-slate-200 rounded text-gray-400">
                                <MoreHorizontal size={16} />
                            </button>
                        </td>
                    </tr>
                )}
                renderMobileCard={(u) => (
                    <div className="flex flex-col gap-2.5">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center font-bold text-xs text-slate-600">
                                    {u.name.charAt(0)}
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-800">{u.name}</p>
                                    <p className="text-[9px] text-slate-400 font-mono">{u.id}</p>
                                </div>
                            </div>
                            <Badge variant={u.status === 'Aktif' ? 'success' : 'default'}>
                                <div className="flex items-center gap-1">
                                    {u.status === 'Aktif' ? <CheckCircle size={10} /> : <XCircle size={10} />}
                                    {u.status}
                                </div>
                            </Badge>
                        </div>
                        <div className="flex justify-between items-center text-[10px] text-slate-500 font-medium">
                            <div className="flex items-center gap-1">
                                <Shield size={12} className="text-blue-500" />
                                <span>{u.role.replace('_', ' ')}</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <Mail size={12} />
                                <span>{u.email}</span>
                            </div>
                        </div>
                    </div>
                )}
            />
        </div>
    );
};

export default UserManagementPage;