import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      isLoggedIn: false,

      // Fungsi untuk menyimpan data login
      login: (userData, token) => {
        set({ 
          user: userData, 
          token: token, 
          isLoggedIn: true 
        });
      },

      // Fungsi untuk logout
      logout: () => {
        // Clear login toast flag
        const state = useAuthStore.getState();
        if (state.user) {
          sessionStorage.removeItem(`login-toast-${state.user.id}`);
        }
        
        set({ 
          user: null, 
          token: null, 
          isLoggedIn: false 
        });
        localStorage.removeItem('auth-storage');
        sessionStorage.removeItem('notif_shown');
      },

      // Fungsi untuk mengecek status auth terbaru ke server
      checkAuth: async () => {
        const state = useAuthStore.getState();
        if (!state.token) return;

        try {
          const axios = (await import('axios')).default;
          const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/me`, {
            headers: { Authorization: `Bearer ${state.token}` }
          });
          
          set({ user: res.data });
        } catch (error) {
          console.error("Gagal verifikasi auth:", error.message);
          // Token kadaluarsa, logout otomatis
          if (error.response?.status === 401 || error.response?.status === 403) {
            state.logout();
          }
        }
      },

      getRedirectPath: (userData) => {
        if (!userData) return '/';
        
        // Cek status akun dulu
        if (userData.status_akun === 0) return '/pending';

        const userRole = userData.role ? userData.role.toLowerCase() : '';
        switch (userRole) {
          case 'admin':
            return '/admin/dashboard';
          case 'pimpinan':
            return '/report/dashboard';
          case 'penyewa':
            return '/dashboard';
          default:
            return '/';
        }
      }
    }),
    {
      name: 'auth-storage', // Nama key di localStorage
    }
  )
);
