# Bab 6 — Layout, Sidebar & Halaman Per Role

> **Tujuan bab ini:** Memahami arsitektur halaman SIPENDORA — bagaimana layout dibagi, mengapa Sidebar berubah isi sesuai role, dan bagaimana halaman per role dibangun di atas fondasi yang sama.

---

## 6.1 Arsitektur Layout

SIPENDORA menggunakan pola **Layout Wrapper** — satu komponen `MainLayout` yang membungkus semua halaman authenticated. Ini menghindari duplikasi kode (tidak perlu pasang Sidebar & Header di setiap halaman satu per satu).

```
┌────────────────────────────────────────────────────────────┐
│  MainLayout.jsx                                            │
│  ┌──────────┐  ┌──────────────────────────────────────┐    │
│  │          │  │  Header (Sticky)                     │    │
│  │          │  │  [☰ Hamburger]  [🔔 Notif] [👤 User]│    │
│  │ Sidebar  │  ├──────────────────────────────────────┤    │
│  │ (Fixed)  │  │                                      │    │
│  │          │  │  {children}                          │    │
│  │ [Menu 1] │  │  ← Konten halaman dirender di sini   │    │
│  │ [Menu 2] │  │                                      │    │
│  │ [Menu 3] │  │                                      │    │
│  │          │  │                                      │    │
│  └──────────┘  └──────────────────────────────────────┘    │
└────────────────────────────────────────────────────────────┘
```

---

## 6.2 MainLayout: Guard Autentikasi + Shell UI

`MainLayout` bertugas sebagai:
1. **Route Guard** — redirect ke `/login` jika belum login
2. **Shell UI** — render Sidebar + Header + konten anak

```jsx
// client/src/components/layout/MainLayout.jsx
const MainLayout = ({ children, title }) => {
    const { user, isLoggedIn, logout } = useAuthStore();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Untuk mobile
    const navigate = useNavigate();

    // ── Route Guard ──
    // Jika belum login, lempar ke halaman login
    if (!isLoggedIn) {
        return <Navigate to="/login" replace />;
    }

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="flex h-screen bg-surface-subtle font-sans overflow-hidden">

            {/* ── Overlay gelap saat sidebar terbuka di mobile ── */}
            <Transition show={isSidebarOpen}>
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            </Transition>

            {/* ── Sidebar (fixed di kiri, tersembunyi di mobile) ── */}
            <div className={`
                fixed inset-y-0 left-0 z-[70]
                transform transition-transform duration-300
                lg:relative lg:translate-x-0
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                <Sidebar onClose={() => setIsSidebarOpen(false)} />
            </div>

            {/* ── Area Konten Utama ── */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden">

                {/* Header Sticky */}
                <header className="sticky top-0 z-40 h-16 lg:h-[72px] bg-surface-base/90 backdrop-blur-md border-b border-border-light flex items-center justify-between px-4 lg:px-8">
                    {/* Hamburger button - hanya tampil di mobile */}
                    <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden">
                        <MenuIcon size={22} />
                    </button>

                    <div className="flex items-center gap-2">
                        <NotificationBell />
                        {/* Dropdown profile user */}
                        <Menu as="div" className="relative">
                            <MenuButton>
                                {/* Avatar inisial nama user */}
                                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-black">
                                    {user?.nama?.charAt(0).toUpperCase()}
                                </div>
                            </MenuButton>
                            {/* Dropdown: Profil Saya | Keluar Aplikasi */}
                        </Menu>
                    </div>
                </header>

                {/* Konten halaman — children di-render di sini */}
                <div className="flex-1 overflow-y-auto overscroll-contain">
                    {children}
                </div>
            </main>
        </div>
    );
};
```

### Responsif Mobile

Di layar kecil (mobile), Sidebar **tersembunyi** di luar layar (`-translate-x-full`). Saat tombol hamburger ditekan, class berubah menjadi `translate-x-0` sehingga Sidebar **meluncur masuk** dari kiri dengan animasi CSS transition.

---

## 6.3 Sidebar: Menu Dinamis Berdasarkan Role

Sidebar membaca `user.role` dari Zustand store dan menampilkan menu yang sesuai:

```jsx
// client/src/components/layout/Sidebar.jsx
const Sidebar = ({ onClose }) => {
  const location = useLocation(); // Tahu URL saat ini (untuk highlight menu aktif)
  const { user } = useAuthStore();

  // Konfigurasi menu per role
  const menuConfig = {
    penyewa: [
      { name: 'Dashboard',    path: '/dashboard',  icon: LayoutDashboard },
      { name: 'Pesanan Saya', path: '/bookings',   icon: ClipboardList },
      { name: 'Cari Lapangan',path: '/facilities', icon: MapPin },
      { name: 'Profil',       path: '/profile',    icon: UserIcon },
    ],
    admin: [
      { name: 'Dashboard Admin',    path: '/admin/dashboard', icon: LayoutDashboard },
      { name: 'Verifikasi Booking', path: '/admin/bookings',  icon: ClipboardList },
      { name: 'Antrean FCFS',       path: '/admin/fcfs',      icon: Activity },
      { name: 'Kelola Fasilitas',   path: '/admin/facilities',icon: MapPin },
      { name: 'Data Pengguna',      path: '/admin/users',     icon: Users },
      { name: 'Data Rekening',      path: '/admin/rekening',  icon: CreditCard },
    ],
    pimpinan: [
      { name: 'Dashboard Pimpinan',   path: '/report/dashboard',  icon: LayoutDashboard },
      { name: 'Laporan Rekapitulasi', path: '/pimpinan/laporan',  icon: FileText },
    ]
  };

  // Ambil menu sesuai role, default ke array kosong jika role tidak dikenali
  const menus = menuConfig[user?.role?.toLowerCase()] || [];

  return (
    <aside className="w-72 bg-text-primary h-screen sticky top-0 flex flex-col">
      {/* Branding */}
      <div className="p-8 mb-4">
        <img src={logo} alt="SIPENDORA" className="h-10 brightness-0 invert" />
        <div className="mt-4 h-1 w-12 bg-primary-500 rounded-full" />
      </div>

      {/* Daftar Menu */}
      <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto pb-10">
        {menus.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.name}
              to={item.path}
              onClick={onClose}  // Tutup sidebar saat klik di mobile
              className={`flex items-center justify-between px-5 py-4 rounded-2xl transition-all ${
                isActive
                  ? 'bg-primary-600 text-white shadow-lg'  // Menu aktif
                  : 'text-white/60 hover:bg-white/5 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-4">
                <item.icon size={20} />
                <span className="text-sm font-bold">{item.name}</span>
              </div>

              {/* Animasi highlight menu aktif menggunakan Framer Motion */}
              {isActive && (
                <motion.div
                  layoutId="activeTab"  // layoutId yang sama = shared animation
                  className="absolute inset-0 bg-gradient-to-r from-primary-600 to-primary-700"
                />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer Sidebar */}
      <div className="p-4 mt-auto border-t border-white/5">
        <Link to="/" className="flex items-center gap-4 px-5 py-4 rounded-2xl text-white/50 hover:bg-white/5">
          <Home size={20} />
          <span className="text-sm font-bold">Kembali ke Beranda</span>
        </Link>
        {/* Status Sistem */}
        <div className="bg-white/5 rounded-2xl p-4 border border-white/10 mt-4">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-success-500 rounded-full animate-pulse" />
            <span className="text-xs font-bold text-white/80">Sistem Online</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
```

### Mengapa `layoutId="activeTab"` di Framer Motion?

Saat `layoutId` yang sama digunakan di beberapa elemen, Framer Motion secara otomatis menganimasikan perpindahan elemen tersebut antar posisi. Efeknya: highlight menu bergerak mulus saat user pindah halaman — tanpa menulis animasi manual satu pun.

---

## 6.4 Halaman Admin Dashboard

Contoh nyata bagaimana halaman admin dibangun di atas `MainLayout`:

```jsx
// client/src/pages/admin/AdminDashboard.jsx
const AdminDashboard = () => {
    const [stats, setStats] = useState({ totalBookings: 0, activeUsers: 0, revenue: 0, pendingVerifications: 0 });
    const [pendingPayments, setPendingPayments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAdminData = async () => {
            try {
                // Satu call ke endpoint khusus dashboard yang sudah agregasi semua data
                const response = await api.get('/bookings/admin/dashboard-stats');
                setStats(response.data.stats);
                setPendingPayments(response.data.pendingPayments);
            } finally {
                setLoading(false);
            }
        };
        fetchAdminData();
    }, []);

    return (
        // AdminDashboard tidak pakai MainLayout langsung
        // — ia dirender oleh MainDashboard.jsx yang sudah punya MainLayout
        <div className="max-w-7xl mx-auto px-6 py-10 space-y-12">
            <h1 className="text-4xl font-black text-slate-900 uppercase">Dashboard Admin</h1>

            {/* Stat Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <StatCard title="Total Booking"          value={stats.totalBookings}       icon={Calendar} />
                <StatCard title="Perlu Verifikasi"       value={stats.pendingVerifications} icon={Clock} />
                <StatCard title="Pengguna Aktif"         value={stats.activeUsers}          icon={Users} />
                <StatCard title="Total Pendapatan"       value={formatIDR(stats.revenue)}   icon={CreditCard} />
            </div>

            {/* Tabel Pending Payments */}
            <DataTable columns={pendingColumns} data={pendingPayments} loading={loading} />
        </div>
    );
};
```

### Komponen StatCard — Contoh Sub-Komponen Lokal

```jsx
// Definisikan di file yang sama, hanya dipakai oleh AdminDashboard
const StatCard = ({ title, value, icon: Icon, color }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}   // Mulai: transparan & sedikit di bawah
        animate={{ opacity: 1, y: 0 }}    // Akhir: tampil di posisi normal
        className="bg-primary-500 border border-primary-400/30 p-8 rounded-[2.5rem] shadow-md hover:shadow-xl transition-all"
    >
        <div className="flex items-center gap-3 mb-6">
            <div className={`p-4 rounded-2xl ${color}`}>
                <Icon size={24} className="text-white" />
            </div>
            <p className="text-primary-100 text-[10px] font-black uppercase tracking-widest">{title}</p>
        </div>
        <h5 className="text-2xl font-black text-white">{value}</h5>
    </motion.div>
);
```

---

## 6.5 Shell Dashboard: `MainDashboard.jsx`

Satu halaman yang dipakai bersama oleh admin dan pimpinan — kontennya adaptif berdasarkan role:

```jsx
// client/src/pages/dashboard/MainDashboard.jsx
const MainDashboard = () => {
    const { user } = useAuthStore();

    // Pilih konten berdasarkan role
    const renderContent = () => {
        switch (user?.role?.toLowerCase()) {
            case 'admin':    return <AdminDashboard />;
            case 'pimpinan': return <PimpinanDashboard />;
            default:         return <Navigate to="/" />;
        }
    };

    return (
        <MainLayout title="Dashboard">
            {renderContent()}
        </MainLayout>
    );
};
```

Pola ini menghindari duplikasi — satu `<MainLayout>` wrapper untuk semua dashboard.

---

## 6.6 Halaman Penyewa: Pola Fetch & Render

```jsx
// client/src/pages/penyewa/MyBookings.jsx (disederhanakan)
const MyBookings = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/bookings/my')
           .then(res => setBookings(res.data))
           .catch(err => toast.error(err.response?.data?.error || 'Gagal memuat'))
           .finally(() => setLoading(false));
    }, []);

    const handleCancel = async (bookingId) => {
        if (!window.confirm('Batalkan pesanan ini?')) return;
        try {
            await api.patch(`/bookings/cancel/${bookingId}`);
            toast.success('Pesanan berhasil dibatalkan');
            // Update list lokal tanpa fetch ulang (optimistic update)
            setBookings(prev => prev.map(b =>
                b.id === bookingId ? { ...b, status_booking: 'CANCELED' } : b
            ));
        } catch (err) {
            toast.error(err.response?.data?.error || 'Gagal membatalkan');
        }
    };

    return (
        <MainLayout title="Pesanan Saya">
            <div className="max-w-4xl mx-auto px-6 py-10">
                {loading ? (
                    <div>Memuat...</div>
                ) : bookings.length === 0 ? (
                    <div>Belum ada pesanan.</div>
                ) : (
                    bookings.map(booking => (
                        <BookingCard
                            key={booking.id}
                            booking={booking}
                            onCancel={() => handleCancel(booking.id)}
                        />
                    ))
                )}
            </div>
        </MainLayout>
    );
};
```

---

## 6.7 Peta Lengkap Halaman per Role

### 👤 Penyewa

| Path | Komponen | Fungsi |
|------|----------|--------|
| `/dashboard` | `penyewa/Dashboard.jsx` | Ringkasan booking & status |
| `/facilities` | `penyewa/BrowseFacilities.jsx` | Cari & filter fasilitas |
| `/dashboard/facility/:id` | `penyewa/FacilityBooking.jsx` | Form booking FCFS |
| `/bookings` | `penyewa/MyBookings.jsx` | Riwayat semua pesanan |
| `/bookings/:id` | `penyewa/BookingDetail.jsx` | Detail pesanan + upload bukti bayar |

### 🛡️ Admin

| Path | Komponen | Fungsi |
|------|----------|--------|
| `/admin/dashboard` | `MainDashboard` → `AdminDashboard.jsx` | Statistik & log aktivitas |
| `/admin/bookings` | `admin/ManageBookings.jsx` | Verifikasi & kelola booking |
| `/admin/fcfs` | `admin/FCFSAnalysis.jsx` | Visualisasi antrean FCFS |
| `/admin/facilities` | `admin/Facilities.jsx` | CRUD fasilitas & tarif |
| `/admin/users` | `admin/Users.jsx` | Manajemen akun penyewa |
| `/admin/rekening` | `admin/ManageRekening.jsx` | Data rekening pembayaran |

### 👔 Pimpinan

| Path | Komponen | Fungsi |
|------|----------|--------|
| `/report/dashboard` | `MainDashboard` → `PimpinanDashboard.jsx` | Grafik & KPI pendapatan |
| `/pimpinan/laporan` | `pimpinan/LaporanPimpinan.jsx` | Laporan periodik detail |

### 🌐 Publik (Tanpa Login)

| Path | Komponen | Fungsi |
|------|----------|--------|
| `/` | `LandingPage.jsx` | Halaman beranda publik |
| `/login` | `auth/Login.jsx` | Form login |
| `/register` | `auth/Register.jsx` | Form registrasi penyewa |
| `/pending` | `auth/AccountPending.jsx` | Halaman tunggu verifikasi admin |
| `/facility/:id` | `FacilityDetail.jsx` | Preview fasilitas (tanpa login) |

---

## 6.8 Ringkasan Bab 6

| Konsep | Detail |
|--------|--------|
| `MainLayout` | Wrapper + route guard + shell UI (Sidebar, Header) |
| Route Guard | `if (!isLoggedIn) return <Navigate to="/login" />` |
| Sidebar menu adaptif | `menuConfig[user.role.toLowerCase()]` |
| `MainDashboard` | Shell adaptif: render `AdminDashboard` atau `PimpinanDashboard` |
| `layoutId` Framer Motion | Animasi shared element antar halaman |
| Responsif Mobile | Sidebar di-toggle dengan state `isSidebarOpen` |

---

## 🎉 Selamat! Kamu Sudah Menyelesaikan Tutorial Book SIPENDORA

### Rekap Perjalanan Belajar:

```
[Bab 1] Server Express → db.js → index.js
    ↓
[Bab 2] Middleware JWT → verifyToken → isAdmin
    ↓
[Bab 3] Routes API → FCFS Engine → Upload File
    ↓
[Bab 4] React + Vite → SPA Routing → Tailwind
    ↓
[Bab 5] Zustand Store → Axios Instance → Interceptor
    ↓
[Bab 6] MainLayout → Sidebar → Halaman per Role
```

### Langkah Selanjutnya:
1. **Jalankan aplikasi** — ikuti panduan di [INSTALLATION.md](./INSTALLATION.md)
2. **Baca skema database** — lihat `server/database/mydb.sql`
3. **Eksplor FCFS** — baca [FCFS.md](./FCFS.md) untuk penjelasan algoritma lebih dalam
4. **Modifikasi kode** — coba tambahkan field baru atau endpoint baru sendiri
