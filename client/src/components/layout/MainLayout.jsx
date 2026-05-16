import React, { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { Navigate, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import NotificationBell from './NotificationBell';
import {
    Menu as MenuIcon,
    ChevronDown,
    LogOut,
    User as UserIcon,
} from 'lucide-react';
import { Menu, MenuButton, MenuItems, MenuItem, Transition } from '@headlessui/react';
import { Fragment } from 'react';

const MainLayout = ({ children, title }) => {
    const { user, isLoggedIn, logout } = useAuthStore();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const navigate = useNavigate();

    if (!isLoggedIn) {
        return <Navigate to="/login" replace />;
    }

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const userInitial = user?.nama?.charAt(0).toUpperCase() ?? '?';

    return (
        <div className="flex h-screen bg-surface-subtle font-sans overflow-hidden">

            {/* ── Overlay Mobile Sidebar ── */}
            <Transition
                show={isSidebarOpen}
                as={Fragment}
                enter="transition-opacity duration-300"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="transition-opacity duration-200"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
            >
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            </Transition>

            {/* ── Sidebar ── */}
            <div className={`
                fixed inset-y-0 left-0 z-[70]
                transform transition-transform duration-300 ease-in-out
                lg:relative lg:translate-x-0
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                <Sidebar onClose={() => setIsSidebarOpen(false)} />
            </div>

            {/* ── Main Area ── */}
            <main className="flex-1 flex flex-col min-w-0 w-full overflow-hidden">

                {/* ═══════════════════════════════════════
                    HEADER
                    Height: 64px mobile / 72px desktop (h-16 / h-18)
                    Dipakai sebagai acuan top-[68px] di NotificationBell
                ═══════════════════════════════════════ */}
                <header className="
                    sticky top-0 z-40
                    h-16 lg:h-[72px]
                    bg-surface-base/90 backdrop-blur-md
                    border-b border-border-light
                    flex items-center justify-between
                    px-3 sm:px-5 lg:px-8
                    gap-3
                ">
                    {/* Left: Hamburger + Title/Search */}
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                        {/* Hamburger — mobile only */}
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className="lg:hidden shrink-0 p-2 text-text-primary hover:bg-surface-muted rounded-xl transition-all active:scale-95"
                            aria-label="Buka sidebar"
                        >
                            <MenuIcon size={22} />
                        </button>

                        {/* Page title — mobile */}
                        <span className="md:hidden text-sm font-black text-text-primary truncate">
                            {title ?? 'Dashboard'}
                        </span>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                        {/* Notification Bell */}
                        <NotificationBell />

                        {/* Profile Dropdown */}
                        <Menu as="div" className="relative ml-1">
                            <MenuButton className="flex items-center gap-2 p-1 lg:p-1.5 hover:bg-surface-muted rounded-xl lg:rounded-2xl transition-all border border-transparent hover:border-border-light focus:outline-none">
                                {/* Avatar */}
                                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-black text-sm shadow-md shadow-primary-200 shrink-0">
                                    {userInitial}
                                </div>
                                {/* Name — desktop only */}
                                <div className="hidden lg:block text-left max-w-[140px]">
                                    <p className="text-sm font-bold text-text-primary leading-none truncate">{user?.nama}</p>
                                    <p className="text-[10px] font-black text-text-disabled uppercase tracking-widest mt-0.5">{user?.role}</p>
                                </div>
                                <ChevronDown size={14} className="hidden lg:block text-text-disabled" />
                            </MenuButton>

                            <Transition
                                as={Fragment}
                                enter="transition ease-out duration-200"
                                enterFrom="opacity-0 scale-95 translate-y-1"
                                enterTo="opacity-100 scale-100 translate-y-0"
                                leave="transition ease-in duration-150"
                                leaveFrom="opacity-100 scale-100 translate-y-0"
                                leaveTo="opacity-0 scale-95 translate-y-1"
                            >
                                <MenuItems className="
                                    absolute right-0 mt-2 w-52 sm:w-56
                                    origin-top-right
                                    rounded-2xl
                                    bg-surface-base
                                    shadow-xl
                                    ring-1 ring-black/5
                                    border border-border-light
                                    divide-y divide-border-light
                                    focus:outline-none
                                    z-[100]
                                    overflow-hidden
                                ">
                                    {/* User info singkat */}
                                    <div className="px-4 py-3 bg-slate-50/60 lg:hidden">
                                        <p className="text-xs font-bold text-text-primary truncate">{user?.nama}</p>
                                        <p className="text-[10px] font-black text-text-disabled uppercase tracking-widest">{user?.role}</p>
                                    </div>

                                    <div className="p-1.5">
                                        <MenuItem>
                                            {({ focus }) => (
                                                <button
                                                    onClick={() => navigate('/profile')}
                                                    className={`${focus ? 'bg-surface-muted text-primary-600' : 'text-text-secondary'} flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-bold transition-colors`}
                                                >
                                                    <UserIcon size={16} className="shrink-0" />
                                                    Profil Saya
                                                </button>
                                            )}
                                        </MenuItem>
                                    </div>
                                    <div className="p-1.5">
                                        <MenuItem>
                                            {({ focus }) => (
                                                <button
                                                    onClick={handleLogout}
                                                    className={`${focus ? 'bg-red-50 text-red-600' : 'text-red-500'} flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-bold transition-colors`}
                                                >
                                                    <LogOut size={16} className="shrink-0" />
                                                    Keluar Aplikasi
                                                </button>
                                            )}
                                        </MenuItem>
                                    </div>
                                </MenuItems>
                            </Transition>
                        </Menu>
                    </div>
                </header>

                {/* ── Page Content ── */}
                <div className="flex-1 overflow-y-auto overscroll-contain">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default MainLayout;