import { useState, useMemo } from 'react';
import {
  Search, ChevronDown, ChevronUp, BookOpen, FileCheck, RefreshCw,
  Users, Key, HelpCircle, Wallet
} from 'lucide-react';

import { Card } from '../../../shared/components/ui/Card';

interface FaqItem {
  question: string;
  answer: string;
  category: 'workflow' | 'handover' | 'security' | 'funds';
}

const FAQ_ITEMS: FaqItem[] = [
  // ── WORKFLOWS ──
  {
    category: 'workflow',
    question: 'Bagaimana alur pengajuan belanja dan pengeluaran kas paroki?',
    answer: 'Ketua Komisi atau Tim Pembangunan mengajukan rencana belanja melalui menu "Pengajuan". Bendahara Paroki kemudian memeriksa ketersediaan sisa pagu di menu "Anggaran", dan Pastor Paroki meninjau kelayakan pastoral. Jika disetujui bersama di menu "Persetujuan", Bendahara mencairkan kas dan mencatatnya sebagai "Kas Keluar". Setelah dibelanjakan, penanggung jawab wajib mengunggah kuitansi bukti pengeluaran di menu "SPJ Digital" dalam waktu maksimal 7 hari kerja.'
  },
  {
    category: 'workflow',
    question: 'Bagaimana cara mencatat penerimaan kas masuk (kolekte, donasi, pembangunan)?',
    answer: 'Pencatatan kas masuk dilakukan oleh Sekretariat atau Bendahara melalui menu "Kas Masuk". Setiap pencatatan wajib dikaitkan dengan "Pos Dana" yang sesuai (seperti Dana Operasional, Liturgi, atau Dana Khusus Pembangunan Altar). Nilai nominal yang dimasukkan harus cocok sepenuhnya dengan bukti fisik amplop atau mutasi rekening koran bank paroki untuk menjaga kebenaran data audit.'
  },
  {
    category: 'workflow',
    question: 'Apakah dokumen SPJ (Surat Pertanggungjawaban) wajib diunggah untuk setiap pengeluaran?',
    answer: 'Ya, mutlak wajib. Setiap transaksi Kas Keluar yang berasal dari dana umat harus didukung dengan bukti kuitansi belanja fisik yang sah. Ketua Komisi mengunggahnya secara digital lewat menu "SPJ Digital", dan Bendahara atau Pastor wajib memeriksa keabsahan berkas tersebut sebelum memverifikasi status SPJ.'
  },
  // ── HANDOVER ──
  {
    category: 'handover',
    question: 'Bagaimana prosedur jika terjadi pergantian Bendahara Paroki?',
    answer: '1. Super Admin membuatkan akun baru dengan email resmi Bendahara baru di menu "Manajemen User". Akun Bendahara lama diubah statusnya menjadi "Non-Aktif" demi keamanan data.\n2. Akun lama TIDAK boleh diserahkan/digunakan bersama oleh Bendahara baru karena akan merusak pertanggungjawaban personal pada log audit.\n3. Lakukan pencocokan kas fisik aktual dengan total saldo di halaman "Saldo Pos Dana" pada saat serah terima berita acara.'
  },
  {
    category: 'handover',
    question: 'Bagaimana prosedur jika terjadi pergantian Pastor Paroki?',
    answer: '1. Super Admin mendaftarkan akun baru Pastor Paroki di menu "Manajemen User". Akun Pastor lama diubah menjadi "Non-Aktif" untuk mencabut otorisasi persetujuan anggaran dan audit.\n2. Pastor baru dapat masuk menggunakan akun barunya untuk melihat histori keuangan, menyetujui pengajuan belanja yang sedang antre di menu "Persetujuan", dan meninjau transaksi audit sebelumnya di menu "Audit Trail".'
  },
  {
    category: 'handover',
    question: 'Bagaimana cara menonaktifkan akun pengurus paroki terdahulu?',
    answer: 'Pengguna dengan role "SUPER_ADMIN" dapat masuk ke menu "Manajemen User", mencari nama pengurus lama, dan mengklik tombol toggle status aktif (dari hijau menjadi abu-abu). Akun tersebut akan dinonaktifkan secara instan tanpa menghapus data transaksi historis yang pernah dicatat oleh user bersangkutan.'
  },
  // ── SECURITY & AUDIT ──
  {
    category: 'security',
    question: 'Mengapa dilarang keras saling meminjamkan akun atau sharing account?',
    answer: 'Aplikasi ini menggunakan sistem pencatatan aktivitas terintegrasi (Audit Trail). Setiap pencatatan kas, persetujuan belanja, dan pemeriksaan audit merekam ID pengguna yang masuk. Berbagi akun akan merusak keabsahan pembuktian hukum (non-repudiation), sehingga pengurus tidak dapat memastikan siapa yang bertanggung jawab secara individu jika terjadi selisih kas.'
  },
  {
    category: 'security',
    question: 'Siapa saja yang memiliki hak akses untuk mengaudit transaksi?',
    answer: 'Hak akses verifikasi audit dibatasi secara ketat hanya kepada user yang memiliki role "SUPER_ADMIN", "PASTOR", dan "BENDAHARA". Ketiga peran ini dianggap sebagai auditor internal paroki yang berhak memeriksa, meminta klarifikasi, atau menandai transaksi sebagai tidak valid beserta catatan temuan di menu "Audit Trail" atau detail transaksi.'
  },
  {
    category: 'security',
    question: 'Bagaimana cara kerja Audit Trail di aplikasi ini?',
    answer: 'Audit Trail melacak dan mencatat setiap perubahan data secara real-time. Ketika sebuah kas masuk atau kas keluar ditambahkan, sistem akan membuat entri log audit baru. Auditor paroki dapat langsung memeriksa detail data mentah transaksi tersebut, membandingkannya dengan lampiran SPJ, dan menentukan status kelayakan verifikasi audit.'
  },
  // ── FUNDS & BUDGET ──
  {
    category: 'funds',
    question: 'Apa perbedaan antara Dana Permanen dan Dana Khusus?',
    answer: 'Pos Dana Permanen adalah pos kas operasional rutin paroki yang selalu ada dari tahun ke tahun (misalnya Dana Paroki, Dana Liturgi, Dana Komisi). Sedangkan Dana Khusus adalah dana temporer yang dibuat khusus untuk program berjangka (seperti Dana Renovasi Pastoran, Aksi Sosial, Pembangunan Kapel) yang harus ditutup atau dialokasikan sisanya setelah target/durasi program berakhir.'
  },
  {
    category: 'funds',
    question: 'Bagaimana sistem mencegah pengeluaran melebihi anggaran?',
    answer: 'Sistem menerapkan kontrol pencegahan otomatis. Setiap kali Bendahara memproses Kas Keluar, sistem akan memeriksa sisa pagu anggaran dari pos yang bersangkutan di database. Jika nominal transaksi melebihi sisa plafon tahunan, sistem akan menolak transaksi tersebut hingga dilakukan revisi pagu oleh Dewan Keuangan atau Pastor Paroki.'
  },
  {
    category: 'funds',
    question: 'Mengapa saldo pos dana saya berbeda dengan saldo riil di bank?',
    answer: 'Perbedaan ini biasanya terjadi karena adanya transaksi berjalan yang belum dicatat di sistem (misalnya bunga bank paroki, biaya administrasi bulanan, atau donasi masuk transfer bank yang belum diinput oleh Bendahara). Bendahara disarankan melakukan rekonsiliasi kas minimal sekali dalam sebulan untuk mencocokkan saldo digital dengan rekening koran bank.'
  }
];

const FaqPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'workflow' | 'handover' | 'security' | 'funds'>('all');
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const categories = [
    { id: 'all', name: 'Semua Pertanyaan', icon: HelpCircle },
    { id: 'workflow', name: 'Alur Kerja Utama', icon: FileCheck },
    { id: 'handover', name: 'Panduan Handover', icon: RefreshCw },
    { id: 'security', name: 'Keamanan & Audit', icon: Key },
    { id: 'funds', name: 'Dana & Anggaran', icon: Wallet },
  ];

  const handleToggle = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const filteredFaqs = useMemo(() => {
    return FAQ_ITEMS.filter((faq) => {
      const matchesTab = activeTab === 'all' || faq.category === activeTab;
      const matchesSearch =
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesTab && matchesSearch;
    });
  }, [activeTab, searchQuery]);

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-10 animate-fade-slide">
      {/* Header section */}
      <div>
        <h2 className="text-2xl font-medium text-slate-800 tracking-tight">FAQ & Panduan Bantuan</h2>
        <p className="text-sm text-gray-500">Pusat bantuan penggunaan aplikasi dan panduan transisi akses tata kelola paroki.</p>
      </div>

      {/* Handover Guidelines Quick Checklists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-5 border-slate-200 rounded-none bg-slate-905 text-slate-800 flex flex-col justify-between border-l-4 border-l-sky-500">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Users className="text-sky-600" size={18} />
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Panduan Transisi: Pastor Paroki Baru
              </h3>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed font-medium mb-4">
              Panduan penting bagi Pastor Paroki yang baru dilantik saat menerima serah terima aplikasi Santika:
            </p>
            <ul className="space-y-2.5 text-xs text-slate-700 font-medium pl-1">
              <li className="flex gap-2">
                <span className="text-sky-600 shrink-0 font-bold">1.</span>
                <span>Hubungi Admin Sistem (`SUPER_ADMIN`) untuk membuatkan akun Pastor baru dengan email pribadi resmi Anda.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-sky-600 shrink-0 font-bold">2.</span>
                <span>Pastikan akun Pastor Paroki sebelumnya diubah statusnya menjadi **Non-Aktif** oleh Admin untuk memblokir akses persetujuan lama.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-sky-600 shrink-0 font-bold">3.</span>
                <span>Tinjau sisa saldo di halaman **Saldo Pos Dana** untuk mengetahui sediaan aset lancar kas paroki terkini.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-sky-600 shrink-0 font-bold">4.</span>
                <span>Gunakan menu **Audit Trail** untuk mulai memeriksa dan menandai transaksi kas historis paroki secara digital.</span>
              </li>
            </ul>
          </div>
        </Card>

        <Card className="p-5 border-slate-200 rounded-none bg-slate-905 text-slate-800 flex flex-col justify-between border-l-4 border-l-sky-500">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <BookOpen className="text-sky-600" size={18} />
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Panduan Transisi: Bendahara Baru
              </h3>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed font-medium mb-4">
              Panduan penting bagi Bendahara Paroki baru agar pencatatan keuangan paroki tetap akurat dan transparan:
            </p>
            <ul className="space-y-2.5 text-xs text-slate-700 font-medium pl-1">
              <li className="flex gap-2">
                <span className="text-sky-600 shrink-0 font-bold">1.</span>
                <span>Dilarang melanjutkan penggunaan kredensial/akun Bendahara lama. Wajib dibuatkan akun baru demi validitas personal log audit.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-sky-600 shrink-0 font-bold">2.</span>
                <span>Lakukan pencocokan kas fisik aktual (tunai & saldo bank paroki) dengan sistem digital di halaman **Saldo Pos Dana**.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-sky-600 shrink-0 font-bold">3.</span>
                <span>Tinjau proposal belanja komisi yang masih menggantung pada menu **Persetujuan** bersama Pastor Paroki.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-sky-600 shrink-0 font-bold">4.</span>
                <span>Pastikan bukti pengeluaran terdahulu telah diselesaikan pertanggungjawabannya oleh Ketua Komisi di menu **SPJ Digital**.</span>
              </li>
            </ul>
          </div>
        </Card>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Sidebar categories select & search */}
        <div className="lg:col-span-4 space-y-4">
          {/* Search box */}
          <div className="p-4 bg-white border border-slate-200 rounded-none shadow-sm flex items-center gap-2">
            <Search size={16} className="text-slate-400 shrink-0" />
            <input
              type="text"
              placeholder="Cari FAQ / kata kunci bantuan..."
              className="bg-transparent outline-none text-xs w-full text-slate-800 font-semibold"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Categories Tab Selector */}
          <div className="bg-white border border-slate-200 rounded-none shadow-sm overflow-hidden divide-y divide-slate-150">
            <div className="p-3 bg-slate-50 text-[10px] text-slate-450 font-bold uppercase tracking-wider border-b">
              Kategori FAQ
            </div>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  setActiveTab(cat.id as any);
                  setExpandedIndex(null);
                }}
                className={`w-full px-4 py-3 flex items-center gap-3 text-xs font-semibold transition-colors duration-150 rounded-none border-l-2 cursor-pointer ${
                  activeTab === cat.id
                    ? 'border-l-sky-500 bg-sky-50/40 text-sky-600'
                    : 'border-l-transparent text-slate-650 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <cat.icon size={14} className={activeTab === cat.id ? 'text-sky-600' : 'text-slate-400'} />
                <span>{cat.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* FAQ List Panel */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-none shadow-sm divide-y divide-slate-200">
          <div className="p-4 bg-slate-50 flex items-center justify-between">
            <span className="text-[10px] text-slate-455 font-bold uppercase tracking-wider">
              Daftar Pertanyaan ({filteredFaqs.length})
            </span>
            <span className="text-[9px] font-semibold text-slate-400">
              Menampilkan {activeTab === 'all' ? 'Semua Kategori' : categories.find((c) => c.id === activeTab)?.name}
            </span>
          </div>

          {filteredFaqs.length > 0 ? (
            filteredFaqs.map((faq, idx) => {
              const isExpanded = expandedIndex === idx;
              return (
                <div key={idx} className="transition-all duration-200">
                  <button
                    onClick={() => handleToggle(idx)}
                    className="w-full px-5 py-4 text-left flex justify-between items-center gap-4 hover:bg-slate-50/50 transition-colors cursor-pointer group outline-none"
                  >
                    <span className={`text-xs font-bold leading-relaxed transition-colors ${
                      isExpanded ? 'text-sky-600' : 'text-slate-750 group-hover:text-slate-900'
                    }`}>
                      {faq.question}
                    </span>
                    <span className="text-slate-400 shrink-0">
                      {isExpanded ? <ChevronUp size={16} className="text-sky-600" /> : <ChevronDown size={16} />}
                    </span>
                  </button>

                  {isExpanded && (
                    <div className="px-5 pb-5 pt-1 text-xs text-slate-600 leading-relaxed font-medium bg-slate-50/20 whitespace-pre-line border-t border-slate-100/50">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="p-12 text-center text-slate-400 font-semibold text-xs leading-relaxed">
              Tidak ada pertanyaan yang sesuai dengan kata kunci "{searchQuery}".
              <br />
              Coba gunakan kata kunci lainnya atau ubah tab kategori filter.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FaqPage;
