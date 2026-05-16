import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import MainDashboard from './pages/dashboard/MainDashboard';
import { Toaster } from 'react-hot-toast';
import Facilities from './pages/admin/Facilities';
import Users from './pages/admin/Users';
import FacilityDetail from './pages/FacilityDetail';
import AccountPending from './pages/auth/AccountPending';
import BrowseFacilities from './pages/penyewa/BrowseFacilities';
import FacilityBooking from './pages/penyewa/FacilityBooking';
import PenyewaDashboard from './pages/penyewa/Dashboard';
import MyBookings from './pages/penyewa/MyBookings';
import BookingDetail from './pages/penyewa/BookingDetail';
import ManageBookings from './pages/admin/ManageBookings';
import FCFSAnalysis from './pages/admin/FCFSAnalysis';
import ManageRekening from './pages/admin/ManageRekening';
import Notifications from './pages/Notifications';
import Profile from './pages/Profile';
import LaporanPimpinan from './pages/pimpinan/LaporanPimpinan';

function App() {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: '#FFFFFF',
            color: '#0F172A',
            border: '1px solid #E2E8F0',
            fontWeight: 'bold',
            borderRadius: '14px',
            fontSize: '14px'
          },
        }} 
      />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/pending" element={<AccountPending />} />
        <Route path="/facility/:id" element={<FacilityDetail />} />

        {/* Dashboard Routes (Shared Page, Adaptive Content) */}
        <Route path="/dashboard" element={<PenyewaDashboard />} />
        <Route path="/admin/dashboard" element={<MainDashboard />} />
        <Route path="/report/dashboard" element={<MainDashboard />} />

        {/* Penyewa Routes */}
        <Route path="/facilities" element={<BrowseFacilities />} />
        <Route path="/dashboard/facility/:id" element={<FacilityBooking />} />
        <Route path="/bookings" element={<MyBookings />} />
        <Route path="/bookings/:id" element={<BookingDetail />} />

        {/* Admin Routes */}
        <Route path="/admin/facilities" element={<Facilities />} />
        <Route path="/admin/users" element={<Users />} />
        <Route path="/admin/bookings" element={<ManageBookings />} />
        <Route path="/admin/fcfs" element={<FCFSAnalysis />} />
        <Route path="/admin/rekening" element={<ManageRekening />} />

        {/* Pimpinan Routes */}
        <Route path="/pimpinan/laporan" element={<LaporanPimpinan />} />

        {/* Profile & Notifications */}
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/profile" element={<Profile />} />

        {/* Fallback 404 can be added here */}
      </Routes>
    </Router>
  );
}

export default App;
