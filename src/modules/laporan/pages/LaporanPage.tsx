import { useState, useMemo } from 'react';
import { FileSpreadsheet, FileText, Search, Calendar, Loader2, Download } from 'lucide-react';
import { downloadCSV, downloadExcel } from '../../../shared/utils/export';
import { Card } from '../../../shared/components/ui/Card';
import { Button } from '../../../shared/components/ui/Button';
import { Modal } from '../../../shared/components/ui/Modal';
import { useLaporanKeuangan } from '../hooks/useLaporanKeuangan';
import { LaporanBKU } from '../components/LaporanBKU';
import { LaporanArusKas } from '../components/LaporanArusKas';
import { LaporanRealisasi } from '../components/LaporanRealisasi';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatIDR } from '../../../shared/utils/formatter';
import churchLogo from '../../../assets/church.png';

type ReportType = 'BKU' | 'ARUS_KAS' | 'REALISASI';

/**
 * Standardized High-Density Financial Report Page.
 * Implements Controller pattern delegating complex maths to useLaporanKeuangan hook.
 * Uses flat, seamless, sharp-edge visual aesthetics.
 */
const LaporanPage = () => {
    const getBase64ImageFromUrl = async (url: string): Promise<string> => {
        try {
            const response = await fetch(url);
            const blob = await response.blob();
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result as string);
                reader.onerror = reject;
                reader.readAsDataURL(blob);
            });
        } catch (e) {
            console.error(e);
            return '';
        }
    };

    const [activeTab, setActiveTab] = useState<ReportType>('BKU');
    const [isExporting, setIsExporting] = useState(false);
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);
    const [search, setSearch] = useState('');

    // Generate Indonesia-localized period dropdown options
    const periods = useMemo(() => {
        const list = [];
        const now = new Date();
        const currentYear = now.getFullYear();

        for (let y = currentYear; y >= currentYear - 1; y--) {
            const startMonth = y === currentYear ? now.getMonth() + 1 : 12;
            for (let m = startMonth; m >= 1; m--) {
                const monthVal = String(m).padStart(2, '0');
                const value = `${y}-${monthVal}`;
                const date = new Date(y, m - 1, 1);
                const label = date.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
                list.push({ value, label });
            }
        }
        return list;
    }, []);

    const [selectedPeriod, setSelectedPeriod] = useState(periods[0]?.value || new Date().toISOString().slice(0, 7));

    const selectedPeriodLabel = useMemo(() => {
        const [y, m] = selectedPeriod.split('-');
        return new Date(parseInt(y, 10), parseInt(m, 10) - 1, 1).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
    }, [selectedPeriod]);

    const selectedYear = selectedPeriod.split('-')[0];

    // Call the Information Expert hook to retrieve memoized report states from backend
    const {
        bkuData,
        totalMasuk,
        totalKeluar,
        endingSaldo,
        arusKasSummary,
        realisasiSummary,
        isLoading,
    } = useLaporanKeuangan(selectedPeriod, search);

    const handleExportExcelBKU = (logoBase64: string) => {
        const timestamp = new Date().toISOString().slice(0, 10);
        const filename = `laporan_bku_${selectedPeriod}_${timestamp}.xls`;
        const todayFormatted = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

        const rowsHtml = bkuData.map((item: any, idx: number) => `
            <tr>
                <td style="text-align: center;">${item.id === 'STARTING_BALANCE' ? '-' : idx}</td>

                <td style="text-align: center;">${new Date(item.tanggal).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' })}</td>
                <td>${item.keterangan}</td>
                <td style="text-align: center; font-family: monospace;">${item.ref}</td>
                <td class="text-right mso-number text-green">${item.masuk || 0}</td>
                <td class="text-right mso-number text-red">${item.keluar || 0}</td>
                <td class="text-right mso-number">${item.saldo}</td>
            </tr>
        `).join('');

        const tableHtml = `
            <table>
                <tr>
                    <td rowspan="4" style="border: none; text-align: center; vertical-align: middle; width: 60px;">
                        ${logoBase64 ? `<img src="${logoBase64}" width="50" height="50" />` : ''}
                    </td>
                    <td colspan="6" style="font-size: 14pt; font-weight: bold; text-align: left; border: none; padding-left: 10px;">KEUSKUPAN AGUNG MERAUKE</td>
                </tr>
                <tr>
                    <td colspan="6" style="font-size: 12pt; font-weight: bold; text-align: left; border: none; padding-left: 10px;">Paroki St. Stefanus - Sempan</td>
                </tr>
                <tr>
                    <td colspan="6" style="font-size: 11pt; font-weight: bold; text-align: left; border: none; text-decoration: underline; padding-left: 10px;">LAPORAN BUKU KAS UMUM (BKU)</td>
                </tr>
                <tr>
                    <td colspan="6" style="font-size: 9pt; text-align: left; border: none; padding-bottom: 20px; padding-left: 10px;">Periode Laporan: ${selectedPeriodLabel}</td>
                </tr>
                <tr><td colspan="7" style="border: none;">&nbsp;</td></tr>
                <thead>
                    <tr class="bg-header">
                        <th style="width: 40px; background-color: #1e293b; color: #ffffff;">No</th>
                        <th style="width: 90px; background-color: #1e293b; color: #ffffff;">Tanggal</th>
                        <th style="width: 250px; background-color: #1e293b; color: #ffffff;">Keterangan</th>
                        <th style="width: 120px; background-color: #1e293b; color: #ffffff;">Referensi</th>
                        <th style="width: 120px; background-color: #1e293b; color: #ffffff; text-align: right;">Masuk (Dr) (IDR)</th>
                        <th style="width: 120px; background-color: #1e293b; color: #ffffff; text-align: right;">Keluar (Cr) (IDR)</th>
                        <th style="width: 130px; background-color: #1e293b; color: #ffffff; text-align: right;">Saldo (IDR)</th>
                    </tr>
                </thead>
                <tbody>
                    ${rowsHtml}
                    <tr class="bg-total">
                        <td colspan="4" style="text-align: right; font-weight: bold;">TOTAL MUTASI PERIODE INI</td>
                        <td class="text-right font-bold mso-number text-green">${totalMasuk}</td>
                        <td class="text-right font-bold mso-number text-red">${totalKeluar}</td>
                        <td class="text-right font-bold mso-number">${endingSaldo}</td>
                    </tr>
                </tbody>
                <tr><td colspan="7" style="border: none;">&nbsp;</td></tr>
                <tr><td colspan="7" style="border: none;">&nbsp;</td></tr>
                <tr>
                    <td colspan="2" style="text-align: center; border: none; font-weight: bold;">Mengetahui,</td>
                    <td colspan="3" style="border: none;">&nbsp;</td>
                    <td colspan="2" style="text-align: center; border: none; font-weight: bold;">Sempan, ${todayFormatted}</td>
                </tr>
                <tr>
                    <td colspan="2" style="text-align: center; border: none; font-weight: bold;">Pastor Paroki</td>
                    <td colspan="3" style="border: none;">&nbsp;</td>
                    <td colspan="2" style="text-align: center; border: none; font-weight: bold;">Bendahara Paroki</td>
                </tr>
                <tr><td colspan="7" style="height: 50px; border: none;">&nbsp;</td></tr>
                <tr>
                    <td colspan="2" style="text-align: center; border: none; font-weight: bold; text-decoration: underline;">RP. Johannes Surono</td>
                    <td colspan="3" style="border: none;">&nbsp;</td>
                    <td colspan="2" style="text-align: center; border: none; font-weight: bold; text-decoration: underline;">Yuliana Shanti</td>
                </tr>
            </table>
        `.trim();

        downloadExcel(filename, tableHtml);
    };

    const handleExportExcelArusKas = (logoBase64: string) => {
        const timestamp = new Date().toISOString().slice(0, 10);
        const filename = `laporan_arus_kas_${selectedPeriod}_${timestamp}.xls`;
        const todayFormatted = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

        const tableHtml = `
            <table>
                <tr>
                    <td rowspan="4" style="border: none; text-align: center; vertical-align: middle; width: 60px;">
                        ${logoBase64 ? `<img src="${logoBase64}" width="50" height="50" />` : ''}
                    </td>
                    <td colspan="1" style="font-size: 14pt; font-weight: bold; text-align: left; border: none; padding-left: 10px;">KEUSKUPAN AGUNG MERAUKE</td>
                </tr>
                <tr>
                    <td colspan="1" style="font-size: 12pt; font-weight: bold; text-align: left; border: none; padding-left: 10px;">Paroki St. Stefanus - Sempan</td>
                </tr>
                <tr>
                    <td colspan="1" style="font-size: 11pt; font-weight: bold; text-align: left; border: none; text-decoration: underline; padding-left: 10px;">LAPORAN ARUS KAS</td>
                </tr>
                <tr>
                    <td colspan="1" style="font-size: 9pt; text-align: left; border: none; padding-bottom: 20px; padding-left: 10px;">Periode Laporan: ${selectedPeriodLabel}</td>
                </tr>
                <tr><td colspan="2" style="border: none;">&nbsp;</td></tr>
                <thead>
                    <tr class="bg-header">
                        <th style="width: 350px; background-color: #1e293b; color: #ffffff; text-align: left;">Aktivitas Arus Kas</th>
                        <th style="width: 150px; background-color: #1e293b; color: #ffffff; text-align: right;">Jumlah (IDR)</th>
                    </tr>
                </thead>
                <tbody>
                    <tr style="background-color: #f1f5f9; font-weight: bold;">
                        <td style="font-weight: bold;">Arus Kas Masuk (Penerimaan)</td>
                        <td>&nbsp;</td>
                    </tr>
                    <tr>
                        <td style="padding-left: 20px;">Penerimaan Kolekte</td>
                        <td class="text-right mso-number text-green">${arusKasSummary.inboundKolekte}</td>
                    </tr>
                    <tr>
                        <td style="padding-left: 20px;">Penerimaan Donasi / Aksi Sosial</td>
                        <td class="text-right mso-number text-green">${arusKasSummary.inboundDonasi}</td>
                    </tr>
                    <tr>
                        <td style="padding-left: 20px;">Dana Pembangunan Altar / Gedung</td>
                        <td class="text-right mso-number text-green">${arusKasSummary.inboundPembangunan}</td>
                    </tr>
                    <tr>
                        <td style="padding-left: 20px;">Persembahan & Pendapatan Lain-lain</td>
                        <td class="text-right mso-number text-green">${arusKasSummary.inboundLainnya}</td>
                    </tr>
                    <tr class="bg-total">
                        <td style="font-weight: bold; padding-left: 10px;">Total Penerimaan Kas</td>
                        <td class="text-right font-bold mso-number text-green">${arusKasSummary.totalPenerimaanKas}</td>
                    </tr>
                    <tr style="background-color: #f1f5f9; font-weight: bold;">
                        <td style="font-weight: bold;">Arus Kas Keluar (Pengeluaran)</td>
                        <td>&nbsp;</td>
                    </tr>
                    <tr>
                        <td style="padding-left: 20px;">Pengeluaran Administrasi & Operasional Kantor</td>
                        <td class="text-right mso-number text-red">${arusKasSummary.outboundOperasional}</td>
                    </tr>
                    <tr>
                        <td style="padding-left: 20px;">Pengeluaran Liturgi & Perayaan Hari Raya</td>
                        <td class="text-right mso-number text-red">${arusKasSummary.outboundLiturgi}</td>
                    </tr>
                    <tr>
                        <td style="padding-left: 20px;">Belanja Kegiatan Komisi & Pembinaan Iman</td>
                        <td class="text-right mso-number text-red">${arusKasSummary.outboundKegiatan}</td>
                    </tr>
                    <tr class="bg-total">
                        <td style="font-weight: bold; padding-left: 10px;">Total Pengeluaran Kas</td>
                        <td class="text-right font-bold mso-number text-red">${arusKasSummary.totalPengeluaranKas}</td>
                    </tr>
                    <tr style="background-color: #e2e8f0; font-weight: bold;">
                        <td style="font-weight: bold; text-transform: uppercase;">Kenaikan / (Penurunan) Bersih Kas</td>
                        <td class="text-right font-bold mso-number ${arusKasSummary.kenaikanBersihKas >= 0 ? 'text-green' : 'text-red'}">${arusKasSummary.kenaikanBersihKas}</td>
                    </tr>
                </tbody>
                <tr><td colspan="2" style="border: none;">&nbsp;</td></tr>
                <tr><td colspan="2" style="border: none;">&nbsp;</td></tr>
                <tr>
                    <td style="text-align: center; border: none; font-weight: bold;">Mengetahui,</td>
                    <td style="text-align: center; border: none; font-weight: bold;">Sempan, ${todayFormatted}</td>
                </tr>
                <tr>
                    <td style="text-align: center; border: none; font-weight: bold;">Pastor Paroki</td>
                    <td style="text-align: center; border: none; font-weight: bold;">Bendahara Paroki</td>
                </tr>
                <tr><td colspan="2" style="height: 50px; border: none;">&nbsp;</td></tr>
                <tr>
                    <td style="text-align: center; border: none; font-weight: bold; text-decoration: underline;">RP. Johannes Surono</td>
                    <td style="text-align: center; border: none; font-weight: bold; text-decoration: underline;">Yuliana Shanti</td>
                </tr>
            </table>
        `.trim();

        downloadExcel(filename, tableHtml);
    };

    const handleExportExcelRealisasi = (logoBase64: string) => {
        const timestamp = new Date().toISOString().slice(0, 10);
        const filename = `laporan_realisasi_anggaran_${selectedYear}_${timestamp}.xls`;
        const todayFormatted = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

        const rowsHtml = realisasiSummary.map((item: any) => `
            <tr>
                <td>${item.nama}</td>
                <td class="text-right mso-number">${item.anggaran}</td>
                <td class="text-right mso-number text-red">${item.realisasi}</td>
                <td style="text-align: center; font-weight: bold;">${Math.round(item.persen)}%</td>
                <td class="text-right mso-number">${item.sisa}</td>
            </tr>
        `).join('');

        const totalAnggaran = realisasiSummary.reduce((sum: number, item: any) => sum + item.anggaran, 0);
        const totalRealisasi = realisasiSummary.reduce((sum: number, item: any) => sum + item.realisasi, 0);
        const totalSisa = realisasiSummary.reduce((sum: number, item: any) => sum + item.sisa, 0);
        const totalPersen = totalAnggaran > 0 ? (totalRealisasi / totalAnggaran) * 100 : 0;

        const tableHtml = `
            <table>
                <tr>
                    <td rowspan="4" style="border: none; text-align: center; vertical-align: middle; width: 60px;">
                        ${logoBase64 ? `<img src="${logoBase64}" width="50" height="50" />` : ''}
                    </td>
                    <td colspan="4" style="font-size: 14pt; font-weight: bold; text-align: left; border: none; padding-left: 10px;">KEUSKUPAN AGUNG MERAUKE</td>
                </tr>
                <tr>
                    <td colspan="4" style="font-size: 12pt; font-weight: bold; text-align: left; border: none; padding-left: 10px;">Paroki St. Stefanus - Sempan</td>
                </tr>
                <tr>
                    <td colspan="4" style="font-size: 11pt; font-weight: bold; text-align: left; border: none; text-decoration: underline; padding-left: 10px;">LAPORAN REALISASI ANGGARAN PAROKI</td>
                </tr>
                <tr>
                    <td colspan="4" style="font-size: 9pt; text-align: left; border: none; padding-bottom: 20px; padding-left: 10px;">Tahun Anggaran: ${selectedYear}</td>
                </tr>
                <tr><td colspan="5" style="border: none;">&nbsp;</td></tr>
                <thead>
                    <tr class="bg-header">
                        <th style="width: 250px; background-color: #1e293b; color: #ffffff; text-align: left;">Pos Anggaran</th>
                        <th style="width: 150px; background-color: #1e293b; color: #ffffff; text-align: right;">Plafon Anggaran (IDR)</th>
                        <th style="width: 150px; background-color: #1e293b; color: #ffffff; text-align: right;">Realisasi Pengeluaran (IDR)</th>
                        <th style="width: 90px; background-color: #1e293b; color: #ffffff; text-align: center;">Serapan</th>
                        <th style="width: 150px; background-color: #1e293b; color: #ffffff; text-align: right;">Sisa Pagu (IDR)</th>
                    </tr>
                </thead>
                <tbody>
                    ${rowsHtml}
                    <tr class="bg-total">
                        <td style="font-weight: bold;">Total Pagu Anggaran Paroki</td>
                        <td class="text-right font-bold mso-number">${totalAnggaran}</td>
                        <td class="text-right font-bold mso-number text-red">${totalRealisasi}</td>
                        <td style="text-align: center; font-weight: bold;">${Math.round(totalPersen)}%</td>
                        <td class="text-right font-bold mso-number">${totalSisa}</td>
                    </tr>
                </tbody>
                <tr><td colspan="5" style="border: none;">&nbsp;</td></tr>
                <tr><td colspan="5" style="border: none;">&nbsp;</td></tr>
                <tr>
                    <td colspan="2" style="text-align: center; border: none; font-weight: bold;">Mengetahui,</td>
                    <td>&nbsp;</td>
                    <td colspan="2" style="text-align: center; border: none; font-weight: bold;">Sempan, ${todayFormatted}</td>
                </tr>
                <tr>
                    <td colspan="2" style="text-align: center; border: none; font-weight: bold;">Pastor Paroki</td>
                    <td>&nbsp;</td>
                    <td colspan="2" style="text-align: center; border: none; font-weight: bold;">Bendahara Paroki</td>
                </tr>
                <tr><td colspan="5" style="height: 50px; border: none;">&nbsp;</td></tr>
                <tr>
                    <td colspan="2" style="text-align: center; border: none; font-weight: bold; text-decoration: underline;">RP. Johannes Surono</td>
                    <td>&nbsp;</td>
                    <td colspan="2" style="text-align: center; border: none; font-weight: bold; text-decoration: underline;">Yuliana Shanti</td>
                </tr>
            </table>
        `.trim();

        downloadExcel(filename, tableHtml);
    };

    const handleExportCSV = () => {
        setIsExporting(true);
        setTimeout(() => {
            try {
                const timestamp = new Date().toISOString().slice(0, 10);
                if (activeTab === 'BKU') {
                    const filename = `laporan_bku_${selectedPeriod}_${timestamp}.csv`;
                    const headers = ['No', 'Tanggal', 'Keterangan', 'Referensi', 'Masuk (Dr)', 'Keluar (Cr)', 'Saldo (IDR)'];
                    const rows = bkuData.map((item: any, idx: number) => [
                        item.id === 'STARTING_BALANCE' ? '-' : String(idx),

                        new Date(item.tanggal).toLocaleDateString('id-ID', { year: 'numeric', month: '2-digit', day: '2-digit' }),
                        item.keterangan,
                        item.ref,
                        String(item.masuk),
                        String(item.keluar),
                        String(item.saldo)
                    ]);
                    rows.push([
                        'Total',
                        '',
                        'Total Mutasi Periode Ini',
                        '',
                        String(totalMasuk),
                        String(totalKeluar),
                        String(endingSaldo)
                    ]);
                    downloadCSV(filename, headers, rows);
                } else if (activeTab === 'ARUS_KAS') {
                    const filename = `laporan_arus_kas_${selectedPeriod}_${timestamp}.csv`;
                    const headers = ['Aktivitas Arus Kas', 'Jumlah (IDR)'];
                    const rows = [
                        ['Arus Kas Masuk (Penerimaan)', ''],
                        ['Penerimaan Kolekte', String(arusKasSummary.inboundKolekte)],
                        ['Penerimaan Donasi / Aksi Sosial', String(arusKasSummary.inboundDonasi)],
                        ['Dana Pembangunan Altar / Gedung', String(arusKasSummary.inboundPembangunan)],
                        ['Persembahan & Pendapatan Lain-lain', String(arusKasSummary.inboundLainnya)],
                        ['Total Penerimaan Kas', String(arusKasSummary.totalPenerimaanKas)],
                        ['Arus Kas Keluar (Pengeluaran)', ''],
                        ['Pengeluaran Administrasi & Operasional Kantor', String(arusKasSummary.outboundOperasional)],
                        ['Pengeluaran Liturgi & Perayaan Hari Raya', String(arusKasSummary.outboundLiturgi)],
                        ['Belanja Kegiatan Komisi & Pembinaan Iman', String(arusKasSummary.outboundKegiatan)],
                        ['Total Pengeluaran Kas', String(arusKasSummary.totalPengeluaranKas)],
                        ['Kenaikan / (Penurunan) Bersih Kas', String(arusKasSummary.kenaikanBersihKas)]
                    ];
                    downloadCSV(filename, headers, rows);
                } else if (activeTab === 'REALISASI') {
                    const filename = `laporan_realisasi_anggaran_${selectedYear}_${timestamp}.csv`;
                    const headers = ['Pos Anggaran', 'Plafon Anggaran (IDR)', 'Realisasi Pengeluaran (IDR)', 'Serapan (%)', 'Sisa Pagu (IDR)'];
                    const rows = realisasiSummary.map((item: any) => [
                        item.nama,
                        String(item.anggaran),
                        String(item.realisasi),
                        `${Math.round(item.persen)}%`,
                        String(item.sisa)
                    ]);

                    const totalAnggaran = realisasiSummary.reduce((sum: number, item: any) => sum + item.anggaran, 0);
                    const totalRealisasi = realisasiSummary.reduce((sum: number, item: any) => sum + item.realisasi, 0);
                    const totalSisa = realisasiSummary.reduce((sum: number, item: any) => sum + item.sisa, 0);
                    const totalPersen = totalAnggaran > 0 ? (totalRealisasi / totalAnggaran) * 100 : 0;

                    rows.push([
                        'Total Pagu Anggaran Paroki',
                        String(totalAnggaran),
                        String(totalRealisasi),
                        `${Math.round(totalPersen)}%`,
                        String(totalSisa)
                    ]);
                    downloadCSV(filename, headers, rows);
                }
            } catch (err) {
                console.error('Gagal mengekspor laporan:', err);
                alert('Terjadi kesalahan saat mengekspor laporan.');
            } finally {
                setIsExporting(false);
            }
        }, 800);
    };

    const handleExportExcel = async () => {
        setIsExporting(true);
        const logoBase64 = await getBase64ImageFromUrl(churchLogo);
        setTimeout(() => {
            try {
                if (activeTab === 'BKU') {
                    handleExportExcelBKU(logoBase64);
                } else if (activeTab === 'ARUS_KAS') {
                    handleExportExcelArusKas(logoBase64);
                } else if (activeTab === 'REALISASI') {
                    handleExportExcelRealisasi(logoBase64);
                }
            } catch (err) {
                console.error('Gagal mengekspor Excel:', err);
                alert('Terjadi kesalahan saat mengekspor Excel.');
            } finally {
                setIsExporting(false);
            }
        }, 800);
    };

    const handleExportPDFBKU = (logoBase64: string) => {
        const doc = new jsPDF({ orientation: 'landscape', format: 'a4' });
        const timestamp = new Date().toISOString().slice(0, 10);
        const filename = `laporan_bku_${selectedPeriod}_${timestamp}.pdf`;
        const todayFormatted = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

        // Add Header Logo & Styled Header Line
        if (logoBase64) {
            doc.addImage(logoBase64, 'PNG', 15, 10, 20, 20);
        }

        doc.setFont('Helvetica', 'bold');
        doc.setFontSize(14);
        doc.text('KEUSKUPAN AGUNG MERAUKE', 40, 15);

        doc.setFont('Helvetica', 'normal');
        doc.setFontSize(11);
        doc.text('Paroki St. Stefanus - Sempan', 40, 21);

        doc.setFont('Helvetica', 'bold');
        doc.setFontSize(12);
        doc.text('LAPORAN BUKU KAS UMUM (BKU)', 40, 28);

        doc.setFont('Helvetica', 'normal');
        doc.setFontSize(9);
        doc.text(`Periode Laporan: ${selectedPeriodLabel} | Sempan, Papua Selatan`, 40, 34);

        doc.setLineWidth(0.5);
        doc.line(15, 36, 282, 36);

        // Compile rows
        const rows = bkuData.map((item: any, idx: number) => [
            item.id === 'STARTING_BALANCE' ? '-' : String(idx),

            new Date(item.tanggal).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' }),
            item.keterangan,
            item.ref,
            item.masuk ? formatIDR(item.masuk) : '-',
            item.keluar ? formatIDR(item.keluar) : '-',
            formatIDR(item.saldo)
        ]);

        // Append Total Row
        rows.push([
            'Total',
            '',
            'Total Mutasi Periode Ini',
            '',
            formatIDR(totalMasuk),
            formatIDR(totalKeluar),
            formatIDR(endingSaldo)
        ]);

        autoTable(doc, {
            startY: 40,
            head: [['No', 'Tanggal', 'Keterangan', 'Referensi', 'Masuk (Dr)', 'Keluar (Cr)', 'Saldo (IDR)']],
            body: rows,
            theme: 'grid',
            headStyles: { fillColor: [30, 41, 59], halign: 'center', fontSize: 9 },
            bodyStyles: { fontSize: 8.5 },
            columnStyles: {
                0: { halign: 'center', cellWidth: 12 },
                1: { halign: 'center', cellWidth: 25 },
                2: { halign: 'left' },
                3: { halign: 'center', cellWidth: 35 },
                4: { halign: 'right', cellWidth: 35 },
                5: { halign: 'right', cellWidth: 35 },
                6: { halign: 'right', cellWidth: 40 }
            },
            didParseCell: (data) => {
                if (data.row.index === rows.length - 1) {
                    data.cell.styles.fontStyle = 'bold';
                    data.cell.styles.fillColor = [248, 250, 252];
                }
            }
        });

        // Add Signatures
        const finalY = (doc as any).lastAutoTable.finalY + 15;
        let sigY = 30;
        if (finalY + 40 > 210) {
            doc.addPage();
        } else {
            sigY = finalY;
        }

        doc.setFont('Helvetica', 'normal');
        doc.setFontSize(10);
        doc.text('Mengetahui,', 40, sigY);
        doc.text(`Sempan, ${todayFormatted}`, 200, sigY);

        doc.text('Pastor Paroki,', 40, sigY + 6);
        doc.text('Bendahara Paroki,', 200, sigY + 6);

        doc.setFont('Helvetica', 'bold');
        doc.text('RP. Johannes Surono', 40, sigY + 30);
        doc.text('Yuliana Shanti', 200, sigY + 30);

        doc.save(filename);
    };

    const handleExportPDFArusKas = (logoBase64: string) => {
        const doc = new jsPDF({ orientation: 'portrait', format: 'a4' });
        const timestamp = new Date().toISOString().slice(0, 10);
        const filename = `laporan_arus_kas_${selectedPeriod}_${timestamp}.pdf`;
        const todayFormatted = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

        // Add Header Logo & Styled Header Line
        if (logoBase64) {
            doc.addImage(logoBase64, 'PNG', 15, 10, 20, 20);
        }

        doc.setFont('Helvetica', 'bold');
        doc.setFontSize(14);
        doc.text('KEUSKUPAN AGUNG MERAUKE', 40, 15);

        doc.setFont('Helvetica', 'normal');
        doc.setFontSize(11);
        doc.text('Paroki St. Stefanus - Sempan', 40, 21);

        doc.setFont('Helvetica', 'bold');
        doc.setFontSize(12);
        doc.text('LAPORAN ARUS KAS', 40, 28);

        doc.setFont('Helvetica', 'normal');
        doc.setFontSize(9);
        doc.text(`Periode Laporan: ${selectedPeriodLabel}`, 40, 34);

        doc.setLineWidth(0.5);
        doc.line(15, 36, 195, 36);

        // Compile rows
        const rows = [
            ['Arus Kas Masuk (Penerimaan)', ''],
            ['  Penerimaan Kolekte', formatIDR(arusKasSummary.inboundKolekte)],
            ['  Penerimaan Donasi / Aksi Sosial', formatIDR(arusKasSummary.inboundDonasi)],
            ['  Dana Pembangunan Altar / Gedung', formatIDR(arusKasSummary.inboundPembangunan)],
            ['  Persembahan & Pendapatan Lain-lain', formatIDR(arusKasSummary.inboundLainnya)],
            ['Total Penerimaan Kas', formatIDR(arusKasSummary.totalPenerimaanKas)],
            ['Arus Kas Keluar (Pengeluaran)', ''],
            ['  Pengeluaran Administrasi & Operasional Kantor', formatIDR(arusKasSummary.outboundOperasional)],
            ['  Pengeluaran Liturgi & Perayaan Hari Raya', formatIDR(arusKasSummary.outboundLiturgi)],
            ['  Belanja Kegiatan Komisi & Pembinaan Iman', formatIDR(arusKasSummary.outboundKegiatan)],
            ['Total Pengeluaran Kas', formatIDR(arusKasSummary.totalPengeluaranKas)],
            ['KENAIKAN / (PENURUNAN) BERSIH KAS', formatIDR(arusKasSummary.kenaikanBersihKas)]
        ];

        autoTable(doc, {
            startY: 40,
            head: [['Aktivitas Arus Kas', 'Jumlah (IDR)']],
            body: rows,
            theme: 'grid',
            headStyles: { fillColor: [30, 41, 59], halign: 'left', fontSize: 10 },
            bodyStyles: { fontSize: 9.5 },
            columnStyles: {
                0: { halign: 'left' },
                1: { halign: 'right', cellWidth: 50 }
            },
            didParseCell: (data) => {
                const label = String(data.cell.raw || '');
                const isHeader = label === 'Arus Kas Masuk (Penerimaan)' || label === 'Arus Kas Keluar (Pengeluaran)';
                const isTotal = label === 'Total Penerimaan Kas' || label === 'Total Pengeluaran Kas' || label === 'KENAIKAN / (PENURUNAN) BERSIH KAS';

                if (isHeader) {
                    data.cell.styles.fontStyle = 'bold';
                    data.cell.styles.fillColor = [241, 245, 249];
                } else if (isTotal) {
                    data.cell.styles.fontStyle = 'bold';
                    data.cell.styles.fillColor = [248, 250, 252];
                    if (label === 'KENAIKAN / (PENURUNAN) BERSIH KAS') {
                        data.cell.styles.fillColor = [226, 232, 240];
                    }
                }
            }
        });

        // Add Signatures
        const finalY = (doc as any).lastAutoTable.finalY + 15;
        let sigY = 30;
        if (finalY + 40 > 297) {
            doc.addPage();
        } else {
            sigY = finalY;
        }

        doc.setFont('Helvetica', 'normal');
        doc.setFontSize(10);
        doc.text('Mengetahui,', 30, sigY);
        doc.text(`Sempan, ${todayFormatted}`, 130, sigY);

        doc.text('Pastor Paroki,', 30, sigY + 6);
        doc.text('Bendahara Paroki,', 130, sigY + 6);

        doc.setFont('Helvetica', 'bold');
        doc.text('RP. Johannes Surono', 30, sigY + 30);
        doc.text('Yuliana Shanti', 130, sigY + 30);

        doc.save(filename);
    };

    const handleExportPDFRealisasi = (logoBase64: string) => {
        const doc = new jsPDF({ orientation: 'portrait', format: 'a4' });
        const timestamp = new Date().toISOString().slice(0, 10);
        const filename = `laporan_realisasi_anggaran_${selectedYear}_${timestamp}.pdf`;
        const todayFormatted = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

        // Add Header Logo & Styled Header Line
        if (logoBase64) {
            doc.addImage(logoBase64, 'PNG', 15, 10, 20, 20);
        }

        doc.setFont('Helvetica', 'bold');
        doc.setFontSize(14);
        doc.text('KEUSKUPAN AGUNG MERAUKE', 40, 15);

        doc.setFont('Helvetica', 'normal');
        doc.setFontSize(11);
        doc.text('Paroki St. Stefanus - Sempan', 40, 21);

        doc.setFont('Helvetica', 'bold');
        doc.setFontSize(12);
        doc.text('LAPORAN REALISASI ANGGARAN PAROKI', 40, 28);

        doc.setFont('Helvetica', 'normal');
        doc.setFontSize(9);
        doc.text(`Tahun Anggaran: ${selectedYear}`, 40, 34);

        doc.setLineWidth(0.5);
        doc.line(15, 36, 195, 36);

        // Compile rows
        const rows = realisasiSummary.map((item: any) => [
            item.nama,
            formatIDR(item.anggaran),
            formatIDR(item.realisasi),
            `${Math.round(item.persen)}%`,
            formatIDR(item.sisa)
        ]);

        const totalAnggaran = realisasiSummary.reduce((sum: number, item: any) => sum + item.anggaran, 0);
        const totalRealisasi = realisasiSummary.reduce((sum: number, item: any) => sum + item.realisasi, 0);
        const totalSisa = realisasiSummary.reduce((sum: number, item: any) => sum + item.sisa, 0);
        const totalPersen = totalAnggaran > 0 ? (totalRealisasi / totalAnggaran) * 100 : 0;

        rows.push([
            'Total Pagu Anggaran Paroki',
            formatIDR(totalAnggaran),
            formatIDR(totalRealisasi),
            `${Math.round(totalPersen)}%`,
            formatIDR(totalSisa)
        ]);

        autoTable(doc, {
            startY: 40,
            head: [['Pos Anggaran', 'Plafon Anggaran (IDR)', 'Realisasi Pengeluaran (IDR)', 'Serapan', 'Sisa Pagu (IDR)']],
            body: rows,
            theme: 'grid',
            headStyles: { fillColor: [30, 41, 59], halign: 'center', fontSize: 9.5 },
            bodyStyles: { fontSize: 9 },
            columnStyles: {
                0: { halign: 'left' },
                1: { halign: 'right', cellWidth: 38 },
                2: { halign: 'right', cellWidth: 38 },
                3: { halign: 'center', cellWidth: 20 },
                4: { halign: 'right', cellWidth: 38 }
            },
            didParseCell: (data) => {
                if (data.row.index === rows.length - 1) {
                    data.cell.styles.fontStyle = 'bold';
                    data.cell.styles.fillColor = [248, 250, 252];
                }
            }
        });

        // Add Signatures
        const finalY = (doc as any).lastAutoTable.finalY + 15;
        let sigY = 30;
        if (finalY + 40 > 297) {
            doc.addPage();
        } else {
            sigY = finalY;
        }

        doc.setFont('Helvetica', 'normal');
        doc.setFontSize(10);
        doc.text('Mengetahui,', 30, sigY);
        doc.text(`Sempan, ${todayFormatted}`, 130, sigY);

        doc.text('Pastor Paroki,', 30, sigY + 6);
        doc.text('Bendahara Paroki,', 130, sigY + 6);

        doc.setFont('Helvetica', 'bold');
        doc.text('RP. Johannes Surono', 30, sigY + 30);
        doc.text('Yuliana Shanti', 130, sigY + 30);

        doc.save(filename);
    };

    const handleExportPDF = async () => {
        setIsExporting(true);
        const logoBase64 = await getBase64ImageFromUrl(churchLogo);
        setTimeout(() => {
            try {
                if (activeTab === 'BKU') {
                    handleExportPDFBKU(logoBase64);
                } else if (activeTab === 'ARUS_KAS') {
                    handleExportPDFArusKas(logoBase64);
                } else if (activeTab === 'REALISASI') {
                    handleExportPDFRealisasi(logoBase64);
                }
            } catch (err) {
                console.error('Gagal mengekspor PDF:', err);
                alert('Terjadi kesalahan saat mengekspor PDF.');
            } finally {
                setIsExporting(false);
            }
        }, 800);
    };

    return (
        <div className="space-y-6 max-w-[1600px] mx-auto pb-10">
            {/* Header & Export Actions */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-medium text-slate-800 tracking-tight">Laporan Keuangan</h2>
                    <p className="text-sm text-gray-500">Cetak dan unduh laporan pertanggungjawaban paroki.</p>
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <Button
                        variant="outline"
                        className="flex-1 md:flex-none flex items-center justify-center gap-2 text-xs border-slate-200 rounded-none bg-white"
                        onClick={() => setIsExportModalOpen(true)}
                        disabled={isExporting}
                    >
                        {isExporting ? <Loader2 className="animate-spin" size={16} /> : <FileSpreadsheet size={16} className="text-sky-600" />}
                        Export Laporan

                    </Button>
                    <Button
                        variant="outline"
                        className="flex-1 md:flex-none flex items-center justify-center gap-2 text-xs border-slate-200 rounded-none bg-white"
                        onClick={handleExportPDF}
                        disabled={isExporting}
                    >
                        <FileText size={16} className="text-rose-600" />
                        PDF
                    </Button>
                </div>
            </div>

            {/* Report Type Selector - Sharp Bottom Border Indicator */}
            <div className="flex gap-6 border-b border-slate-200 overflow-x-auto no-scrollbar pb-0 text-sm font-medium text-slate-400">
                <button
                    onClick={() => {
                        setActiveTab('BKU');
                        setSearch('');
                    }}
                    className={`pb-3 whitespace-nowrap transition-colors duration-200 rounded-none border-b-2 ${activeTab === 'BKU'
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent hover:text-slate-700 hover:border-slate-300'
                        }`}
                >
                    Buku Kas Umum
                </button>
                <button
                    onClick={() => {
                        setActiveTab('ARUS_KAS');
                        setSearch('');
                    }}
                    className={`pb-3 whitespace-nowrap transition-colors duration-200 rounded-none border-b-2 ${activeTab === 'ARUS_KAS'
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent hover:text-slate-700 hover:border-slate-300'
                        }`}
                >
                    Arus Kas
                </button>
                <button
                    onClick={() => {
                        setActiveTab('REALISASI');
                        setSearch('');
                    }}
                    className={`pb-3 whitespace-nowrap transition-colors duration-200 rounded-none border-b-2 ${activeTab === 'REALISASI'
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent hover:text-slate-700 hover:border-slate-300'
                        }`}
                >
                    Realisasi Anggaran
                </button>
            </div>

            {/* Filter Toolbar - Flat and Seamless */}
            <Card className="p-4 bg-slate-50 shadow-none flex flex-col md:flex-row gap-4 items-center rounded-none">
                <div className="flex items-center gap-2 bg-white px-3 py-1.5 border border-slate-200 rounded-none w-full md:w-auto">
                    <Calendar size={16} className="text-slate-400" />
                    <select
                        className="bg-transparent text-xs font-medium text-slate-600 outline-none cursor-pointer"
                        value={selectedPeriod}
                        onChange={(e) => setSelectedPeriod(e.target.value)}
                    >
                        {periods.map((p) => (
                            <option key={p.value} value={p.value}>
                                {p.label}
                            </option>
                        ))}
                    </select>
                </div>
                {activeTab === 'BKU' && (
                    <div className="flex items-center gap-2 bg-white px-3 py-1.5 border border-slate-200 rounded-none w-full md:w-80 transition-colors focus-within:border-slate-700">
                        <Search size={16} className="text-slate-400" />
                        <input
                            type="text"
                            placeholder="Cari di laporan..."
                            className="bg-transparent text-xs outline-none w-full font-semibold text-slate-700"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                )}
                <div className="ml-auto flex items-center gap-1.5 text-[10px] font-semibold text-slate-400">
                    Status: <span className="text-sky-600 font-semibold">Data Final</span>
                </div>

            </Card>

            {/* Report Table Area - Print Optimized */}
            <Card className="p-0 overflow-hidden shadow-sm border border-slate-200 rounded-none">
                <div className="p-8 bg-white print:p-0">
                    {/* Header Laporan */}
                    <div className="text-center mb-8 border-b-2 border-slate-900 pb-6">
                        <h1 className="text-xl font-semibold text-slate-900">KEUSKUPAN AGUNG MERAUKE</h1>
                        <h2 className="text-lg font-medium text-slate-700 mt-1">Paroki St. Stefanus - Sempan</h2>
                        <p className="text-xs font-medium text-slate-500 mt-1">
                            {activeTab === 'REALISASI' ? `Tahun Anggaran: ${selectedYear}` : `Periode Laporan: ${selectedPeriodLabel}`}
                        </p>
                        <div className="mt-5 block text-sm font-bold text-slate-800 uppercase tracking-widest border-b border-slate-200 pb-2">
                            {activeTab === 'BKU' ? 'LAPORAN BUKU KAS UMUM' : activeTab === 'ARUS_KAS' ? 'LAPORAN ARUS KAS' : 'LAPORAN REALISASI ANGGARAN'}
                        </div>
                    </div>

                    {/* Sub Report Render Switcher */}
                    {isLoading ? (
                        <div className="py-20 text-center flex flex-col items-center justify-center gap-3">
                            <Loader2 className="animate-spin text-blue-600" size={32} />
                            <p className="text-xs font-medium text-slate-400">Memuat Laporan Keuangan...</p>
                        </div>
                    ) : (
                        <>
                            {activeTab === 'BKU' && (
                                <LaporanBKU
                                    records={bkuData}
                                    totalMasuk={totalMasuk}
                                    totalKeluar={totalKeluar}
                                    endingSaldo={endingSaldo}
                                />
                            )}

                            {activeTab === 'ARUS_KAS' && (
                                <LaporanArusKas summary={arusKasSummary} />
                            )}

                            {activeTab === 'REALISASI' && (
                                <LaporanRealisasi realisations={realisasiSummary} />
                            )}
                        </>
                    )}

                    {/* Tanda Tangan */}
                    <div className="mt-16 grid grid-cols-3 gap-8 text-center text-sm invisible print:visible">
                        <div>
                            <p className="mb-20 text-xs font-semibold text-slate-600">Mengetahui,</p>
                            <p className="font-medium border-b border-slate-800 inline-block px-6 pb-1">RP. Johannes Surono</p>
                            <p className="text-[10px] font-medium text-slate-500 mt-1">Pastor Paroki</p>
                        </div>
                        <div></div>
                        <div>
                            <p className="mb-20 text-xs font-semibold text-slate-600">
                                Sempan, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </p>
                            <p className="font-medium border-b border-slate-800 inline-block px-6 pb-1">Yuliana Shanti</p>
                            <p className="text-[10px] font-medium text-slate-500 mt-1">Bendahara Paroki</p>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Format Selection Modal */}
            {isExportModalOpen && (
                <Modal
                    isOpen={isExportModalOpen}
                    onClose={() => setIsExportModalOpen(false)}
                    title="Pilih Format Export Laporan"
                >
                    <div className="space-y-4 py-2">
                        <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                            Silakan pilih format file untuk laporan keuangan {activeTab === 'BKU' ? 'Buku Kas Umum' : activeTab === 'ARUS_KAS' ? 'Arus Kas' : 'Realisasi Anggaran'} yang ingin Anda unduh.
                        </p>

                        <div className="grid grid-cols-2 gap-4 pt-2">
                            <button
                                onClick={() => {
                                    handleExportExcel();
                                    setIsExportModalOpen(false);
                                }}
                                className="flex flex-col items-center justify-center p-6 border border-slate-200 hover:border-sky-500 hover:bg-sky-50/10 rounded-none transition-all group cursor-pointer outline-none focus:border-sky-500"
                            >
                                <div className="p-3 bg-sky-50 text-sky-600 rounded-none group-hover:bg-sky-100 transition-colors mb-3">
                                    <FileSpreadsheet size={24} />
                                </div>

                                <span className="text-xs font-bold text-slate-800">Microsoft Excel</span>
                                <span className="text-[10px] text-slate-400 mt-1 font-semibold">Template Terformat (.xls)</span>
                            </button>

                            <button
                                onClick={() => {
                                    handleExportCSV();
                                    setIsExportModalOpen(false);
                                }}
                                className="flex flex-col items-center justify-center p-6 border border-slate-200 hover:border-slate-800 hover:bg-slate-50 rounded-none transition-all group cursor-pointer outline-none focus:border-slate-800"
                            >
                                <div className="p-3 bg-slate-100 text-slate-600 rounded-none group-hover:bg-slate-200 transition-colors mb-3">
                                    <Download size={24} className="text-slate-500" />
                                </div>
                                <span className="text-xs font-bold text-slate-800">Raw Data CSV</span>
                                <span className="text-[10px] text-slate-400 mt-1 font-semibold">Teks Terpisah Koma (.csv)</span>
                            </button>
                        </div>

                        <div className="flex justify-end pt-2">
                            <Button
                                variant="outline"
                                size="sm"
                                className="rounded-none text-xs border-slate-200"
                                onClick={() => setIsExportModalOpen(false)}
                            >
                                Batal
                            </Button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
};

export default LaporanPage;