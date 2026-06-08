import React from 'react';
import { UserPlus, Shield, Mail, MoreHorizontal, CheckCircle, XCircle } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { MOCK_USERS } from '../../mock/userData';

const UserManagementPage = () => {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Manajemen Pengguna</h2>
                    <p className="text-gray-500">Kelola hak akses dan peranan anggota organisasi.</p>
                </div>
                <Button className="flex items-center gap-2">
                    <UserPlus size={18} /> Tambah User Baru
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="p-4 bg-blue-600 text-white">
                    <p className="text-xs opacity-80 uppercase font-bold">Total User</p>
                    <h3 className="text-2xl font-bold">24</h3>
                </Card>
                <Card className="p-4 bg-emerald-600 text-white">
                    <p className="text-xs opacity-80 uppercase font-bold">User Aktif</p>
                    <h3 className="text-2xl font-bold">22</h3>
                </Card>
                <Card className="p-4 bg-amber-500 text-white">
                    <p className="text-xs opacity-80 uppercase font-bold">Menunggu Verifikasi</p>
                    <h3 className="text-2xl font-bold">2</h3>
                </Card>
                <Card className="p-4 bg-slate-800 text-white">
                    <p className="text-xs opacity-80 uppercase font-bold">Role Terdaftar</p>
                    <h3 className="text-2xl font-bold">7</h3>
                </Card>
            </div>

            <Card className="overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 text-[11px] uppercase text-gray-500 font-bold border-b">
                            <th className="p-4">Pengguna</th>
                            <th className="p-4">Role / Hak Akses</th>
                            <th className="p-4">Email</th>
                            <th className="p-4">Status</th>
                            <th className="p-4 text-center">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {MOCK_USERS.map((u) => (
                            <tr key={u.id} className="hover:bg-gray-50">
                                <td className="p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center font-bold text-slate-600">
                                            {u.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-800">{u.name}</p>
                                            <p className="text-[10px] text-gray-400 font-mono">{u.id}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-4">
                                    <div className="flex items-center gap-2">
                                        <Shield size={14} className="text-blue-500" />
                                        <span className="text-xs font-semibold text-slate-600">{u.role.replace('_', ' ')}</span>
                                    </div>
                                </td>
                                <td className="p-4">
                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                        <Mail size={14} />
                                        {u.email}
                                    </div>
                                </td>
                                <td className="p-4">
                                    <Badge variant={u.status === 'Aktif' ? 'success' : 'default'}>
                                        <div className="flex items-center gap-1">
                                            {u.status === 'Aktif' ? <CheckCircle size={12} /> : <XCircle size={12} />}
                                            {u.status}
                                        </div>
                                    </Badge>
                                </td>
                                <td className="p-4 text-center">
                                    <button className="p-2 hover:bg-white border border-transparent hover:border-gray-200 rounded text-gray-400">
                                        <MoreHorizontal size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </Card>
        </div>
    );
};

export default UserManagementPage;