/**
 * SIPENDORA — URL Resolution Helper
 * 
 * Membantu meresolve image path dari database agar kompatibel
 * baik dengan penyimpanan lokal (relative path) maupun Vercel Blob (absolute path).
 */

export const resolveImageUrl = (path) => {
    if (!path) return null;
    
    // Jika path sudah berupa absolute URL (misal dari Vercel Blob)
    if (path.startsWith('http://') || path.startsWith('https://')) {
        return path;
    }
    
    // Jika berupa relative path (misal dari upload lokal /uploads/...)
    // Normalisasi path agar selalu diawali dengan slash '/'
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    
    // Bersihkan trailing slash pada VITE_API_URL jika ada
    const baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '');
    
    return `${baseUrl}${normalizedPath}`;
};
