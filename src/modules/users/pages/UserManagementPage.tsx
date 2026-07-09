import { useState, useMemo, useEffect } from 'react';
import { UserPlus, Shield, Mail, CheckCircle, XCircle, Search, ToggleLeft, ToggleRight } from 'lucide-react';
import { Card } from '../../../shared/components/ui/Card';
import { Button } from '../../../shared/components/ui/Button';
import { Badge } from '../../../shared/components/ui/Badge';
import { AdaptiveList } from '../../../shared/components/ui/AdaptiveList';
import { Modal } from '../../../shared/components/ui/Modal';
import { useAuthStore } from '../../../app/store/useAuthStore';
import {
  useUsersQuery,
  useCreateUserMutation,
  useToggleUserStatusMutation,
  type ClientUser
} from '../hooks/useUsersQuery';
import type { UserRole } from '../../../shared/types/auth';

/**
 * Standardized high-contrast, high-density User Management page.
 * Implements AdaptiveList for responsive layouts on desktop and mobile.
 * Integrated with Backend using React Query.
 */
const UserManagementPage = () => {
    const currentUser = useAuthStore((state) => state.user);

    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('ALL');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [sortBy, setSortBy] = useState<'NAME_ASC' | 'NAME_DESC' | 'ID_ASC' | 'ID_DESC'>('NAME_ASC');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    // React Query Hooks
    const { data: users = [], isLoading, error } = useUsersQuery({
        search: searchTerm || undefined,
        role: roleFilter !== 'ALL' ? roleFilter : undefined,
        isActive: statusFilter === 'ALL' ? undefined : (statusFilter === 'Aktif')
    });

    const createUserMutation = useCreateUserMutation();
    const toggleStatusMutation = useToggleUserStatusMutation();

    // Modal state
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    
    // Form fields
    const [newUserName, setNewUserName] = useState('');
    const [newUserEmail, setNewUserEmail] = useState('');
    const [newUserRole, setNewUserRole] = useState<UserRole>('KETUA_KOMISI');
    const [newUserPassword, setNewUserPassword] = useState('');
    const [formError, setFormError] = useState('');

    // Reset page to 1 when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, roleFilter, statusFilter, sortBy]);

    // Client-side sort data
    const sortedData = useMemo(() => {
        const dataCopy = [...users];
        return dataCopy.sort((a, b) => {
            if (sortBy === 'NAME_ASC') {
                return a.name.localeCompare(b.name);
            }
            if (sortBy === 'NAME_DESC') {
                return b.name.localeCompare(a.name);
            }
            if (sortBy === 'ID_ASC') {
                return a.id.localeCompare(b.id);
            }
            if (sortBy === 'ID_DESC') {
                return b.id.localeCompare(a.id);
            }
            return 0;
        });
    }, [users, sortBy]);

    // Client-side paginate data
    const paginatedData = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return sortedData.slice(startIndex, startIndex + itemsPerPage);
    }, [sortedData, currentPage, itemsPerPage]);

    const totalPages = useMemo(() => {
        return Math.ceil(sortedData.length / itemsPerPage);
    }, [sortedData, itemsPerPage]);

    // Quick stats calculations
    const stats = useMemo(() => {
        return {
            total: users.length,
            active: users.filter(u => u.isActive).length,
            inactive: users.filter(u => !u.isActive).length,
            rolesCount: new Set(users.map(u => u.role)).size
        };
    }, [users]);

    const handleCreateUser = (e: React.FormEvent) => {
        e.preventDefault();
        setFormError('');
        
        if (!newUserName || !newUserEmail || !newUserRole) {
            setFormError('Nama, Email, dan Role wajib diisi.');
            return;
        }

        createUserMutation.mutate({
            name: newUserName,
            email: newUserEmail,
            role: newUserRole,
            password: newUserPassword || undefined
        }, {
            onSuccess: () => {
                setIsAddModalOpen(false);
                setNewUserName('');
                setNewUserEmail('');
                setNewUserRole('KETUA_KOMISI');
                setNewUserPassword('');
            },
            onError: (err: any) => {
                const message = err.response?.data?.message || 'Gagal menambahkan user baru.';
                setFormError(message);
            }
        });
    };

    const handleToggleStatus = (u: ClientUser) => {
        if (currentUser?.id === u.id) {
            alert('Anda tidak dapat menonaktifkan status akun Anda sendiri.');
            return;
        }
        
        const confirmMsg = `Apakah Anda yakin ingin ${u.isActive ? 'menonaktifkan' : 'mengaktifkan'} user "${u.name}"?`;
        if (window.confirm(confirmMsg)) {
            toggleStatusMutation.mutate({
                id: u.id,
                isActive: !u.isActive
            }, {
                onError: (err: any) => {
                    const message = err.response?.data?.message || 'Gagal mengubah status user.';
                    alert(message);
                }
            });
        }
    };

    return (
        <div className="space-y-6 max-w-[1600px] mx-auto pb-10 animate-fade-slide">
            {/* Header section */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-medium text-slate-800 tracking-tight">Manajemen Pengguna</h2>
                    <p className="text-sm text-gray-500 mt-0.5 font-medium">Kelola hak akses dan peranan anggota organisasi.</p>
                </div>
                {currentUser?.role === 'SUPER_ADMIN' && (
                    <Button 
                        onClick={() => setIsAddModalOpen(true)}
                        className="flex items-center gap-1.5 text-xs bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 shadow-sm rounded-none w-full sm:w-auto justify-center"
                    >
                        <UserPlus size={16} /> Tambah User Baru
                    </Button>
                )}
            </div>

            {/* Quick stats grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="p-4 border border-slate-200 rounded-none shadow-sm">
                    <p className="text-[10px] text-slate-400 font-semibold">Total User</p>
                    <h3 className="text-xl font-semibold mt-1 text-slate-800 tracking-tight">{isLoading ? '...' : stats.total}</h3>
                </Card>
                <Card className="p-4 border border-slate-200 rounded-none shadow-sm">
                    <p className="text-[10px] text-slate-400 font-semibold">User Aktif</p>
                    <h3 className="text-xl font-semibold mt-1 text-slate-800 tracking-tight">{isLoading ? '...' : stats.active}</h3>
                </Card>
                <Card className="p-4 border border-slate-200 rounded-none shadow-sm">
                    <p className="text-[10px] text-slate-400 font-semibold">User Non-Aktif</p>
                    <h3 className="text-xl font-semibold mt-1 text-slate-800 tracking-tight">{isLoading ? '...' : stats.inactive}</h3>
                </Card>
                <Card className="p-4 border border-slate-200 rounded-none shadow-sm">
                    <p className="text-[10px] text-slate-400 font-semibold">Role Terdaftar</p>
                    <h3 className="text-xl font-semibold mt-1 text-slate-800 tracking-tight">{isLoading ? '...' : stats.rolesCount}</h3>
                </Card>
            </div>

            {/* Toolbar */}
            <div className="p-4 bg-white border border-slate-200 rounded-none shadow-sm flex flex-col lg:flex-row gap-3 justify-between items-stretch lg:items-center">
                <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 border border-slate-200/60 rounded-none w-full lg:w-96">
                    <Search size={14} className="text-slate-400 shrink-0" />
                    <input
                        type="text"
                        placeholder="Cari nama atau email..."
                        className="bg-transparent text-xs outline-none w-full font-semibold text-slate-750"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="flex flex-wrap items-center gap-4">
                    {/* Role Filter */}
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Role:</span>
                        <select
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value)}
                            className="bg-slate-50 border border-slate-200 px-2 py-1 text-xs font-semibold rounded-none outline-none focus:border-slate-400 text-slate-700 cursor-pointer h-8"
                        >
                            <option value="ALL">Semua Role</option>
                            <option value="SUPER_ADMIN">Super Admin</option>
                            <option value="PASTOR">Pastor</option>
                            <option value="BENDAHARA">Bendahara</option>
                            <option value="DEWAN_KEUANGAN">Dewan Keuangan</option>
                            <option value="KETUA_KOMISI">Ketua Komisi</option>
                            <option value="TIM_PEMBANGUNAN">Tim Pembangunan</option>
                            <option value="SEKRETARIAT">Sekretariat</option>
                        </select>
                    </div>

                    {/* Status Filter */}
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status:</span>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="bg-slate-50 border border-slate-200 px-2 py-1 text-xs font-semibold rounded-none outline-none focus:border-slate-400 text-slate-700 cursor-pointer h-8"
                        >
                            <option value="ALL">Semua Status</option>
                            <option value="Aktif">Aktif</option>
                            <option value="Non-Aktif">Non-Aktif</option>
                        </select>
                    </div>

                    {/* Urutan */}
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Urutan:</span>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as any)}
                            className="bg-slate-50 border border-slate-200 px-2 py-1 text-xs font-semibold rounded-none outline-none focus:border-slate-400 text-slate-700 cursor-pointer h-8"
                        >
                            <option value="NAME_ASC">Nama (A-Z)</option>
                            <option value="NAME_DESC">Nama (Z-A)</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* User List */}
            <div className="space-y-4">
                {isLoading ? (
                    <div className="p-8 text-center text-slate-500 bg-white border border-slate-200 rounded-none shadow-sm flex items-center justify-center gap-2.5 font-semibold text-xs">
                        <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-none animate-spin"></div>
                        Memuat data pengguna dari server...
                    </div>
                ) : error ? (
                    <div className="p-8 text-center text-rose-500 bg-white border border-rose-250 rounded-none shadow-sm font-semibold text-xs">
                        Gagal memuat data pengguna dari server. Pastikan koneksi dan database siap.
                    </div>
                ) : paginatedData.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 bg-white border border-slate-200 rounded-none shadow-sm font-semibold text-xs">
                        Tidak ada pengguna ditemukan.
                    </div>
                ) : (
                    <AdaptiveList
                        data={paginatedData}
                        pagination={{
                            currentPage,
                            totalPages,
                            totalItems: sortedData.length,
                            itemsPerPage,
                            onPageChange: setCurrentPage,
                        }}
                        desktopHeaders={[
                            'Pengguna',
                            'Role / Hak Akses',
                            'Email',
                            'Status',
                            'Aksi'
                        ]}
                        renderDesktopRow={(u) => (
                            <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                                <td className="px-5 py-3 border-r">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-slate-100 border border-slate-200 rounded-none flex items-center justify-center font-medium text-xs text-slate-600">
                                            {u.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="text-xs font-medium text-slate-800 tracking-tight">{u.name}</p>
                                            <p className="text-[10px] text-slate-400 font-mono tracking-tighter mt-0.5">{u.id}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-5 py-3 border-r">
                                    <div className="flex items-center gap-2">
                                        <Shield size={14} className="text-slate-400" />
                                        <span className="text-xs font-medium text-slate-600 tracking-tight">{u.role.replace(/_/g, ' ')}</span>
                                    </div>
                                </td>
                                <td className="px-5 py-3 border-r">
                                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                                        <Mail size={14} className="text-slate-400" />
                                        {u.email}
                                    </div>
                                </td>
                                <td className="px-5 py-3 border-r">
                                    <Badge variant={u.isActive ? 'success' : 'default'} className="rounded-none">
                                        <div className="flex items-center gap-1.5">
                                            {u.isActive ? <CheckCircle size={10} /> : <XCircle size={10} />}
                                            {u.status}
                                        </div>
                                    </Badge>
                                </td>
                                <td className="px-5 py-3 text-center">
                                    {currentUser?.role === 'SUPER_ADMIN' && currentUser.id !== u.id ? (
                                        <button 
                                            onClick={() => handleToggleStatus(u)}
                                            className="p-1 hover:bg-slate-50 border border-transparent rounded-none text-slate-400 hover:text-blue-600 transition-all cursor-pointer inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider h-7 px-2 border-slate-200"
                                            title={u.isActive ? 'Non-aktifkan User' : 'Aktifkan User'}
                                        >
                                            {u.isActive ? <ToggleRight size={18} className="text-sky-500" /> : <ToggleLeft size={18} className="text-slate-450" />}
                                            <span className="text-[9px]">{u.isActive ? 'Nonaktifkan' : 'Aktifkan'}</span>

                                        </button>
                                    ) : (
                                        <span className="text-[10px] text-slate-400 font-medium font-mono">No Actions</span>
                                    )}
                                </td>
                            </tr>
                        )}
                        renderMobileCard={(u) => (
                            <div className="flex flex-col gap-3">
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-8 h-8 bg-slate-100 border border-slate-200 rounded-none flex items-center justify-center font-medium text-xs text-slate-600">
                                            {u.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="text-xs font-medium text-slate-800 tracking-tight">{u.name}</p>
                                            <p className="text-[9px] text-slate-400 font-mono tracking-tighter mt-0.5">{u.id}</p>
                                        </div>
                                    </div>
                                    <Badge variant={u.isActive ? 'success' : 'default'} className="rounded-none">
                                        <div className="flex items-center gap-1">
                                            {u.isActive ? <CheckCircle size={10} /> : <XCircle size={10} />}
                                            {u.status}
                                        </div>
                                    </Badge>
                                </div>
                                <div className="flex justify-between items-center text-[10px] text-slate-500 font-medium pt-2 border-t">
                                    <div className="flex items-center gap-1.5">
                                        <Shield size={12} className="text-slate-400" />
                                        <span>{u.role.replace(/_/g, ' ')}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Mail size={12} className="text-slate-400" />
                                        <span>{u.email}</span>
                                    </div>
                                </div>
                                {currentUser?.role === 'SUPER_ADMIN' && currentUser.id !== u.id && (
                                    <div className="pt-2 border-t flex justify-end">
                                        <Button 
                                            variant="outline" 
                                            size="sm"
                                            onClick={() => handleToggleStatus(u)}
                                            className="text-[9px] font-bold py-1 h-7 rounded-none flex items-center gap-1"
                                        >
                                            {u.isActive ? <ToggleRight size={14} className="text-sky-500" /> : <ToggleLeft size={14} className="text-slate-400" />}
                                            {u.isActive ? 'Non-aktifkan' : 'Aktifkan'}

                                        </Button>
                                    </div>
                                )}
                            </div>
                        )}
                    />
                )}
            </div>

            {/* Create User Modal */}
            <Modal
                isOpen={isAddModalOpen}
                onClose={() => {
                    setIsAddModalOpen(false);
                    setFormError('');
                }}
                title="Tambah Pengguna Baru"
            >
                <form onSubmit={handleCreateUser} className="space-y-4">
                    {formError && (
                        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-600 text-xs font-semibold rounded-none">
                            {formError}
                        </div>
                    )}
                    
                    <div className="space-y-1">
                        <label className="block text-[10px] font-semibold text-slate-700 uppercase tracking-wider">
                            Nama Lengkap *
                        </label>
                        <input
                            type="text"
                            required
                            value={newUserName}
                            onChange={(e) => setNewUserName(e.target.value)}
                            placeholder="Contoh: RP. Johannes Surono"
                            className="w-full px-3 py-2 text-xs border border-slate-200 rounded-none outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-slate-50 transition-all font-medium text-slate-700"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="block text-[10px] font-semibold text-slate-700 uppercase tracking-wider">
                            Alamat Email *
                        </label>
                        <input
                            type="email"
                            required
                            value={newUserEmail}
                            onChange={(e) => setNewUserEmail(e.target.value)}
                            placeholder="Contoh: pastor@paroki.com"
                            className="w-full px-3 py-2 text-xs border border-slate-200 rounded-none outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-slate-50 transition-all font-medium text-slate-700"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="block text-[10px] font-semibold text-slate-700 uppercase tracking-wider">
                            Role / Peranan *
                        </label>
                        <select
                            value={newUserRole}
                            onChange={(e) => setNewUserRole(e.target.value as UserRole)}
                            className="w-full px-3 py-2 text-xs border border-slate-200 rounded-none outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-slate-50 transition-all font-medium text-slate-700 cursor-pointer"
                        >
                            <option value="SUPER_ADMIN">Super Admin</option>
                            <option value="PASTOR">Pastor</option>
                            <option value="BENDAHARA">Bendahara</option>
                            <option value="DEWAN_KEUANGAN">Dewan Keuangan</option>
                            <option value="KETUA_KOMISI">Ketua Komisi</option>
                            <option value="TIM_PEMBANGUNAN">Tim Pembangunan</option>
                            <option value="SEKRETARIAT">Sekretariat</option>
                        </select>
                    </div>

                    <div className="space-y-1">
                        <label className="block text-[10px] font-semibold text-slate-700 uppercase tracking-wider">
                            Password (Opsional)
                        </label>
                        <input
                            type="password"
                            value={newUserPassword}
                            onChange={(e) => setNewUserPassword(e.target.value)}
                            placeholder="Biarkan kosong untuk default: password123"
                            className="w-full px-3 py-2 text-xs border border-slate-200 rounded-none outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-slate-50 transition-all font-medium text-slate-700"
                        />
                    </div>

                    <div className="flex gap-3 pt-4 border-t">
                        <Button 
                            type="button" 
                            variant="outline" 
                            onClick={() => {
                                setIsAddModalOpen(false);
                                setFormError('');
                            }} 
                            className="flex-1 py-3 text-xs font-medium rounded-none"
                            disabled={createUserMutation.isPending}
                        >
                            Batal
                        </Button>
                        <Button 
                            type="submit"
                            className="flex-1 py-3 text-xs font-medium rounded-none bg-blue-600 hover:bg-blue-700 text-white"
                            disabled={createUserMutation.isPending}
                        >
                            {createUserMutation.isPending ? 'Menyimpan...' : 'Simpan User'}
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default UserManagementPage;