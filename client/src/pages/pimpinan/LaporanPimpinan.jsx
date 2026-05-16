import { useState, useEffect, useMemo } from 'react';
import api from '../../utils/api';
import {
    Download, User, CalendarDays, Calendar, X,
    ClipboardList, TrendingUp, CalendarRange,
    ReceiptIcon,
} from 'lucide-react';
import DataTable from '../../components/ui/DataTable';
import Card from '../../components/ui/Card';
import Select from '../../components/ui/Select';
import DataListCard, { DataListCardHeader, DataListCardMeta, DataListCardFooter } from '../../components/ui/DataListCard';
import MainLayout from '../../components/layout/MainLayout';

const LaporanPimpinan = () => {
    const today = new Date();
    const currentMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;

    const [laporan, setLaporan] = useState([]);
    const [allLaporan, setAllLaporan] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterPeriod, setFilterPeriod] = useState('all'); // all | month | year | custom
    const [startMonth, setStartMonth] = useState(currentMonth);
    const [endMonth, setEndMonth] = useState(currentMonth);
    const [filterDateStart, setFilterDateStart] = useState('');
    const [filterDateEnd, setFilterDateEnd] = useState('');

    useEffect(() => {
        const fetchLaporan = async () => {
            setLoading(true);
            try {
                const params = new URLSearchParams();

                if (filterPeriod === 'custom') {
                    params.set('startMonth', startMonth);
                    params.set('endMonth', endMonth);
                } else {
                    params.set('period', filterPeriod);
                }

                const response = await api.get(`/pimpinan/laporan?${params.toString()}`);
                setLaporan(response.data);
            } catch (error) {
                console.error('Error fetching laporan:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchLaporan();
    }, [filterPeriod, startMonth, endMonth]);

    useEffect(() => {
        const fetchAllLaporan = async () => {
            try {
                const response = await api.get('/pimpinan/laporan?period=all');
                setAllLaporan(response.data);
            } catch (error) {
                console.error('Error fetching all laporan for summary counts:', error);
            }
        };

        fetchAllLaporan();
    }, []);

    /* ─── Helpers ─────────────────────────────────────────────────────────── */
    const formatIDR = (value = 0) => {
        const amount = Number(value);
        if (Number.isNaN(amount)) return 'Rp0';
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        if (Number.isNaN(date.getTime())) return '-';
        return date.toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const formatMonthLabel = (monthValue) => {
        const [year, month] = (monthValue || currentMonth).split('-');
        const date = new Date(Number(year), Number(month) - 1);
        if (Number.isNaN(date.getTime())) return '-';
        return date.toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'long',
        });
    };

    const totalPendapatan = useMemo(
        () => laporan.reduce((acc, curr) => acc + Number(curr?.total_biaya || 0), 0),
        [laporan]
    );

    // Filter client-side berdasarkan rentang tanggal (di atas filter periode server)
    const filteredLaporan = useMemo(() => {
        let result = laporan;
        if (filterDateStart) {
            result = result.filter(item => item.tanggal_booking?.slice(0, 10) >= filterDateStart);
        }
        if (filterDateEnd) {
            result = result.filter(item => item.tanggal_booking?.slice(0, 10) <= filterDateEnd);
        }
        return result;
    }, [laporan, filterDateStart, filterDateEnd]);

    const filteredTotalPendapatan = useMemo(
        () => filteredLaporan.reduce((acc, curr) => acc + Number(curr?.total_biaya || 0), 0),
        [filteredLaporan]
    );

    const summaryCounts = useMemo(() => {
        const now = new Date();
        const monthCount = allLaporan.filter((item) => {
            const d = new Date(item.tanggal_booking);
            return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        }).length;
        const yearCount = allLaporan.filter((item) => {
            const d = new Date(item.tanggal_booking);
            return d.getFullYear() === now.getFullYear();
        }).length;

        return {
            all: allLaporan.length,
            month: monthCount,
            year: yearCount,
        };
    }, [allLaporan]);

    const periodLabel =
        filterPeriod === 'month'
            ? 'Bulan Ini'
            : filterPeriod === 'year'
            ? 'Tahun Ini'
            : filterPeriod === 'custom'
            ? `${formatMonthLabel(startMonth)} - ${formatMonthLabel(endMonth)}`
            : 'Keseluruhan';

    /* ─── Table Columns ───────────────────────────────────────────────────── */
    const columns = useMemo(
        () => [
            {
                header: 'ID Transaksi',
                accessorKey: 'id',
                cell: (info) => (
                    <span className="font-mono text-xs font-bold text-slate-900">
                        #{info.getValue()}
                    </span>
                ),
            },
            {
                header: 'Tanggal Booking',
                accessorKey: 'tanggal_booking',
                cell: (info) => (
                    <span className="font-medium text-slate-600">{formatDate(info.getValue())}</span>
                ),
            },
            {
                header: 'Penyewa',
                accessorKey: 'penyewa',
                cell: (info) => (
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-600">
                            <User size={14} />
                        </div>
                        <span className="font-bold text-slate-900 text-xs">{info.getValue()}</span>
                    </div>
                ),
            },
            {
                header: 'Fasilitas / Sesi',
                accessorKey: 'nama_fasilitas',
                cell: (info) => (
                    <div>
                        <div className="font-bold text-slate-900 text-xs leading-tight">
                            {info.getValue()}
                        </div>
                        <div className="text-[9px] font-black text-primary-500 uppercase tracking-widest mt-0.5">
                            {info.row.original.nama_tarif}
                        </div>
                    </div>
                ),
            },
            {
                header: 'Pendapatan',
                accessorKey: 'total_biaya',
                cell: (info) => (
                    <span className="font-black text-emerald-600 text-xs tracking-tight">
                        {formatIDR(info.getValue())}
                    </span>
                ),
            },
        ],
        []
    );

    /* ─── Export Excel ────────────────────────────────────────────────────── */
    const exportToExcel = async () => {
        try {
            const ExcelJS = (await import('exceljs')).default;
            const { saveAs } = await import('file-saver');

            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Laporan Pendapatan');

            // Kop surat
            worksheet.mergeCells('A1:E1');
            worksheet.getCell('A1').value = 'DINAS PEMUDA DAN OLAHRAGA KOTA PALEMBANG';
            worksheet.getCell('A1').font = { name: 'Arial', size: 16, bold: true };
            worksheet.getCell('A1').alignment = { vertical: 'middle', horizontal: 'center' };

            worksheet.mergeCells('A2:E2');
            worksheet.getCell('A2').value = 'LAPORAN REKAPITULASI PENDAPATAN FASILITAS OLAHRAGA';
            worksheet.getCell('A2').font = { name: 'Arial', size: 14, bold: true };
            worksheet.getCell('A2').alignment = { vertical: 'middle', horizontal: 'center' };

            worksheet.mergeCells('A3:E3');
            worksheet.getCell('A3').value = `Periode: ${periodLabel}`;
            worksheet.getCell('A3').font = { name: 'Arial', size: 12 };
            worksheet.getCell('A3').alignment = { vertical: 'middle', horizontal: 'center' };

            worksheet.mergeCells('A4:E4');
            worksheet.getCell('A4').border = { bottom: { style: 'double' } };

            // Header tabel
            const headerRow = worksheet.getRow(6);
            headerRow.values = ['ID Transaksi', 'Tanggal Booking', 'Penyewa', 'Fasilitas / Sesi', 'Pendapatan'];
            headerRow.font = { bold: true };
            headerRow.alignment = { horizontal: 'center' };
            headerRow.eachCell((cell) => {
                cell.border = {
                    top: { style: 'thin' }, left: { style: 'thin' },
                    bottom: { style: 'thin' }, right: { style: 'thin' },
                };
            });

            worksheet.getColumn(1).width = 15;
            worksheet.getColumn(2).width = 20;
            worksheet.getColumn(3).width = 30;
            worksheet.getColumn(4).width = 35;
            worksheet.getColumn(5).width = 25;

            // Data rows
            let currentRowIndex = 7;
            let totalRevenue = 0;

            laporan.forEach((item) => {
                const revenue = Number(item?.total_biaya || 0);
                const row = worksheet.getRow(currentRowIndex);
                row.values = [
                    `#${item.id}`,
                    formatDate(item.tanggal_booking),
                    item.penyewa || '-',
                    `${item.nama_fasilitas || '-'} - ${item.nama_tarif || '-'}`,
                    revenue,
                ];
                row.getCell(5).numFmt = '"Rp"#,##0';
                row.eachCell((cell) => {
                    cell.border = {
                        top: { style: 'thin' }, left: { style: 'thin' },
                        bottom: { style: 'thin' }, right: { style: 'thin' },
                    };
                });
                totalRevenue += revenue;
                currentRowIndex++;
            });

            // Total row
            worksheet.mergeCells(`A${currentRowIndex}:D${currentRowIndex}`);
            const totalText = worksheet.getCell(`A${currentRowIndex}`);
            totalText.value = 'Total Pendapatan';
            totalText.font = { bold: true };
            totalText.alignment = { horizontal: 'right' };

            const totalValue = worksheet.getCell(`E${currentRowIndex}`);
            totalValue.value = totalRevenue;
            totalValue.font = { bold: true };
            totalValue.numFmt = '"Rp"#,##0';

            for (let col = 1; col <= 5; col++) {
                worksheet.getCell(currentRowIndex, col).border = {
                    top: { style: 'thin' }, left: { style: 'thin' },
                    bottom: { style: 'thin' }, right: { style: 'thin' },
                };
            }

            // Tanda tangan
            currentRowIndex += 3;
            const today = new Date().toLocaleDateString('id-ID', {
                year: 'numeric', month: 'long', day: 'numeric',
            });

            worksheet.mergeCells(`A${currentRowIndex}:B${currentRowIndex}`);
            worksheet.getCell(`A${currentRowIndex}`).value = 'Mengetahui,';
            worksheet.getCell(`A${currentRowIndex}`).alignment = { horizontal: 'center' };

            worksheet.mergeCells(`D${currentRowIndex}:E${currentRowIndex}`);
            worksheet.getCell(`D${currentRowIndex}`).value = `Palembang, ${today}`;
            worksheet.getCell(`D${currentRowIndex}`).alignment = { horizontal: 'center' };

            currentRowIndex++;
            worksheet.mergeCells(`A${currentRowIndex}:B${currentRowIndex}`);
            worksheet.getCell(`A${currentRowIndex}`).value = 'Kepala Dinas Pemuda dan Olahraga';
            worksheet.getCell(`A${currentRowIndex}`).alignment = { horizontal: 'center' };

            worksheet.mergeCells(`D${currentRowIndex}:E${currentRowIndex}`);
            worksheet.getCell(`D${currentRowIndex}`).value = 'Bendahara Penerima';
            worksheet.getCell(`D${currentRowIndex}`).alignment = { horizontal: 'center' };

            currentRowIndex += 4;
            worksheet.mergeCells(`A${currentRowIndex}:B${currentRowIndex}`);
            worksheet.getCell(`A${currentRowIndex}`).value = '(...................................)';
            worksheet.getCell(`A${currentRowIndex}`).alignment = { horizontal: 'center' };
            worksheet.getCell(`A${currentRowIndex}`).font = { bold: true };

            worksheet.mergeCells(`D${currentRowIndex}:E${currentRowIndex}`);
            worksheet.getCell(`D${currentRowIndex}`).value = '(...................................)';
            worksheet.getCell(`D${currentRowIndex}`).alignment = { horizontal: 'center' };
            worksheet.getCell(`D${currentRowIndex}`).font = { bold: true };

            const buffer = await workbook.xlsx.writeBuffer();
            const blob = new Blob([buffer], {
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            });
            saveAs(blob, `Laporan_Pendapatan_Sipendora_${Date.now()}.xlsx`);
        } catch (error) {
            console.error('Failed to export Excel:', error);
            alert('Gagal mengunduh Excel. Pastikan modul telah terinstal dengan baik.');
        }
    };

    /* ─── Render ──────────────────────────────────────────────────────────── */
    return (
        <MainLayout title="Laporan Rekapitulasi">
            <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 md:space-y-8">

                {/* ── Page Header ── */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tightest leading-none">
                            Laporan Rekapitulasi
                        </h1>
                        <p className="text-[10px] md:text-xs text-slate-400 font-bold uppercase tracking-[0.2em] mt-1 md:mt-2">
                            Laporan Lengkap Booking Fasilitas di Dispora
                        </p>
                    </div>
                </div>

                {/* ── Stats Grid — Mobile: 2 cols, Desktop: 4 cols ── */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                    <Card className="border border-primary-700">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-primary-500 flex items-center justify-center shadow-md">
                                <ClipboardList className="text-white" size={20} />
                            </div>
                            <div>
                                <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                    Total Transaksi
                                </p>
                                <p className="text-lg md:text-2xl font-black text-slate-900">
                                    {laporan.length}
                                </p>
                            </div>
                        </div>
                    </Card>

                    <Card className="border border-emerald-500">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-emerald-500 flex items-center justify-center shadow-md">
                                <TrendingUp className="text-white" size={20} />
                            </div>
                            <div>
                                <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                    Total Pendapatan
                                </p>
                                <p className="text-sm md:text-base font-black text-slate-900 leading-tight">
                                    {formatIDR(totalPendapatan)}
                                </p>
                            </div>
                        </div>
                    </Card>

                    <Card className="border border-secondary-500">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-secondary-500 flex items-center justify-center shadow-md">
                                <CalendarRange className="text-white" size={20} />
                            </div>
                            <div>
                                <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                    Bulan Ini
                                </p>
                                <p className="text-lg md:text-2xl font-black text-slate-900">
                                    {laporan.filter((item) => {
                                        const d = new Date(item.tanggal_booking);
                                        const now = new Date();
                                        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
                                    }).length}
                                </p>
                            </div>
                        </div>
                    </Card>

                    <Card className="border border-accent-500">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-accent-500 flex items-center justify-center shadow-md">
                                <ReceiptIcon className="text-white" size={20} />
                            </div>
                            <div>
                                <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                    Periode
                                </p>
                                <p className="text-sm md:text-base font-black text-slate-900 leading-tight">
                                    {periodLabel}
                                </p>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* ── Main Card ── */}
                <Card noPadding className="shadow-xl shadow-slate-100/50">

                    {/* Card Header — filter + export */}
                    <div className="px-4 md:px-8 py-4 md:py-6 bg-primary-50 border-b border-primary-100">
                        {/* Row 1: Title + Filter Periode + Export */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                                <ClipboardList size={20} className="text-primary-600" />
                                <h2 className="text-base md:text-lg font-black text-slate-900 tracking-tight">
                                    Daftar Transaksi
                                </h2>
                            </div>
                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                                <div className="flex items-center gap-3">
                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest hidden md:block">Filter Periode:</span>
                                    <Select value={filterPeriod} onChange={(e) => setFilterPeriod(e.target.value)} className="w-full sm:w-48">
                                        <option value="all">Semua Waktu ({summaryCounts.all})</option>
                                        <option value="month">Bulan Ini ({summaryCounts.month})</option>
                                        <option value="year">Tahun Ini ({summaryCounts.year})</option>
                                        <option value="custom">Rentang Bulan</option>
                                    </Select>
                                </div>
                                <button
                                    onClick={exportToExcel}
                                    disabled={loading || laporan.length === 0}
                                    className="flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-md shadow-emerald-200/50 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Download size={14} /> Export Excel
                                </button>
                            </div>
                        </div>

                        {/* Row 2 (conditional): Custom Month Range */}
                        {filterPeriod === 'custom' && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                                <label className="flex flex-col gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
                                    Mulai
                                    <input type="month" value={startMonth} onChange={(e) => { const v = e.target.value; setStartMonth(v); if (v > endMonth) setEndMonth(v); }} className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-900 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100" />
                                </label>
                                <label className="flex flex-col gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
                                    Sampai
                                    <input type="month" value={endMonth} onChange={(e) => { const v = e.target.value; setEndMonth(v); if (v < startMonth) setStartMonth(v); }} className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-900 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100" />
                                </label>
                            </div>
                        )}

                        {/* Row 3: Date Range Filter */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 mt-3">
                            <div className="flex items-center gap-2">
                                <Calendar size={13} className="text-primary-400 shrink-0" />
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest whitespace-nowrap">Rentang Tanggal:</span>
                            </div>
                            <div className="flex items-center gap-2 flex-1">
                                <input id="laporan-date-start" type="date" value={filterDateStart} onChange={(e) => setFilterDateStart(e.target.value)} className="flex-1 sm:flex-none px-3 py-1.5 text-[11px] font-bold text-slate-700 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-400 transition-all cursor-pointer" />
                                <span className="text-[10px] font-black text-slate-400">–</span>
                                <input id="laporan-date-end" type="date" value={filterDateEnd} min={filterDateStart || undefined} onChange={(e) => setFilterDateEnd(e.target.value)} className="flex-1 sm:flex-none px-3 py-1.5 text-[11px] font-bold text-slate-700 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-400 transition-all cursor-pointer" />
                                {(filterDateStart || filterDateEnd) && (
                                    <button onClick={() => { setFilterDateStart(''); setFilterDateEnd(''); }} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all" title="Reset filter tanggal"><X size={13} /></button>
                                )}
                            </div>
                            {(filterDateStart || filterDateEnd) && (
                                <span className="text-[9px] font-black text-primary-500 uppercase tracking-widest bg-primary-50 border border-primary-200 px-2 py-1 rounded-lg whitespace-nowrap">{filteredLaporan.length} hasil</span>
                            )}
                        </div>
                    </div>

                    {/* ── Mobile View: Data List Cards ── */}
                    <div className="md:hidden p-4 space-y-3">
                        {loading ? (
                            <div className="space-y-3">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="h-32 bg-slate-100 rounded-2xl animate-pulse" />
                                ))}
                            </div>
                        ) : filteredLaporan.length === 0 ? (
                            <div className="text-center py-12 text-slate-400">
                                <p className="text-sm font-medium">Tidak ada data untuk periode ini.</p>
                            </div>
                        ) : (
                            filteredLaporan.map((item) => (
                                <DataListCard key={item.id}>
                                    <DataListCardHeader
                                        title={item.penyewa}
                                        subtitle={`ID: #${item.id}`}
                                        icon={User}
                                    />
                                    <DataListCardMeta
                                        items={[
                                            { icon: CalendarDays, text: formatDate(item.tanggal_booking) },
                                        ]}
                                    />
                                    <div className="px-1">
                                        <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                                            Fasilitas / Sesi
                                        </div>
                                        <div className="font-bold text-slate-800 text-xs">{item.nama_fasilitas}</div>
                                        <div className="text-[10px] text-slate-500">{item.nama_tarif}</div>
                                    </div>
                                    <DataListCardFooter
                                        value={formatIDR(item.total_biaya)}
                                        valueClass="font-black text-emerald-600 text-sm"
                                    />
                                </DataListCard>
                            ))
                        )}

                        {/* Mobile total */}
                        {!loading && filteredLaporan.length > 0 && (
                            <div className="flex items-center justify-between gap-4 px-4 py-4 bg-slate-50 rounded-2xl border border-slate-100">
                                <span className="font-black text-slate-400 uppercase tracking-widest text-[10px]">
                                    Total Pendapatan
                                </span>
                                <span className="font-black text-emerald-600 text-lg">
                                    {formatIDR(filteredTotalPendapatan)}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* ── Desktop View: Data Table ── */}
                    <div className="hidden md:block">
                        <DataTable columns={columns} data={filteredLaporan} loading={loading} />

                        {!loading && filteredLaporan.length > 0 && (
                            <div className="flex items-center justify-end gap-6 px-6 py-5 bg-slate-50 rounded-2xl mx-6 mb-6 border border-slate-100">
                                <span className="font-black text-slate-400 uppercase tracking-widest text-xs">
                                    Total Pendapatan
                                </span>
                                <span className="font-black text-emerald-600 text-2xl">
                                    {formatIDR(filteredTotalPendapatan)}
                                </span>
                            </div>
                        )}
                    </div>

                </Card>
            </div>
        </MainLayout>
    );
};

export default LaporanPimpinan;