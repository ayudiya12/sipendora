/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {

      // ─────────────────────────────────────────
      // FONTS
      // ─────────────────────────────────────────
      fontFamily: {
        sans:    ['DM Sans', 'sans-serif'],
        heading: ['Syne', 'sans-serif'],
        mono:    ['JetBrains Mono', 'monospace'],
      },

      // ─────────────────────────────────────────
      // COLORS
      // ─────────────────────────────────────────
      colors: {

        // PRIMARY — Biru jernih & percaya diri
        primary: {
          50:  '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          300: '#93C5FD',
          400: '#60A5FA',
          500: '#3B82F6',   // default
          600: '#2563EB',   // hover
          700: '#1D4ED8',   // active / pressed
          800: '#1E40AF',
          900: '#1E3A8A',
          950: '#172554',
        },

        // SECONDARY — Indigo lembut
        secondary: {
          50:  '#EEF2FF',
          100: '#E0E7FF',
          200: '#C7D2FE',
          300: '#A5B4FC',
          400: '#818CF8',
          500: '#6366F1',   // default
          600: '#4F46E5',   // hover
          700: '#4338CA',   // active
          800: '#3730A3',
          900: '#312E81',
          950: '#1E1B4B',
        },

        // ACCENT — Teal/cyan segar
        accent: {
          50:  '#F0FDFA',
          100: '#CCFBF1',
          200: '#99F6E4',
          300: '#5EEAD4',
          400: '#2DD4BF',
          500: '#14B8A6',   // default
          600: '#0D9488',   // hover
          700: '#0F766E',
          800: '#115E59',
          900: '#134E4A',
          950: '#042F2E',
        },

        // SUCCESS — Hijau bersih
        success: {
          50:  '#F0FDF4',
          100: '#DCFCE7',
          200: '#BBF7D0',
          300: '#86EFAC',
          400: '#4ADE80',
          500: '#22C55E',   // default
          600: '#16A34A',   // hover
          700: '#15803D',
          800: '#166534',
          900: '#14532D',
        },

        // WARNING — Kuning hangat
        warning: {
          50:  '#FFFBEB',
          100: '#FEF3C7',
          200: '#FDE68A',
          300: '#FCD34D',
          400: '#FBBF24',
          500: '#F59E0B',   // default
          600: '#D97706',   // hover
          700: '#B45309',
          800: '#92400E',
          900: '#78350F',
        },

        // DANGER / ERROR — Merah kalem
        danger: {
          50:  '#FFF1F2',
          100: '#FFE4E6',
          200: '#FECDD3',
          300: '#FDA4AF',
          400: '#FB7185',
          500: '#F43F5E',   // default
          600: '#E11D48',   // hover
          700: '#BE123C',
          800: '#9F1239',
          900: '#881337',
        },

        // INFO — Biru langit
        info: {
          50:  '#F0F9FF',
          100: '#E0F2FE',
          200: '#BAE6FD',
          300: '#7DD3FC',
          400: '#38BDF8',
          500: '#0EA5E9',   // default
          600: '#0284C7',   // hover
          700: '#0369A1',
          800: '#075985',
          900: '#0C4A6E',
        },

        // ─────────────────────────────────────────
        // NEUTRAL (Teks, Border, Surface)
        // ─────────────────────────────────────────
        neutral: {
          0:   '#FFFFFF',
          50:  '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          300: '#CBD5E1',
          400: '#94A3B8',
          500: '#64748B',
          600: '#475569',
          700: '#334155',
          800: '#1E293B',
          900: '#0F172A',
          950: '#020617',
        },

        // ─────────────────────────────────────────
        // TEXT (semantic aliases)
        // ─────────────────────────────────────────
        text: {
          primary:   '#0F172A',   // judul, heading utama
          secondary: '#334155',   // body, paragraf
          muted:     '#64748B',   // placeholder, label
          disabled:  '#94A3B8',   // teks non-aktif
          inverse:   '#FFFFFF',   // teks di atas bg gelap
          link:      '#2563EB',   // hyperlink
          'link-hover': '#1D4ED8',
        },

        // ─────────────────────────────────────────
        // SURFACE / BACKGROUND
        // ─────────────────────────────────────────
        surface: {
          base:    '#FFFFFF',     // latar putih bersih
          subtle:  '#F8FAFC',     // halaman/layout bg
          muted:   '#F1F5F9',     // section alternating
          overlay: 'rgba(15, 23, 42, 0.45)', // modal backdrop
          invert:  '#0F172A',     // dark section
        },

        // ─────────────────────────────────────────
        // CARD
        // ─────────────────────────────────────────
        card: {
          bg:       '#FFFFFF',
          border:   '#E2E8F0',
          'border-hover': '#BFDBFE',
          shadow:   'rgba(15, 23, 42, 0.06)',
        },

        // ─────────────────────────────────────────
        // BORDER
        // ─────────────────────────────────────────
        border: {
          light:   '#F1F5F9',
          DEFAULT: '#E2E8F0',
          medium:  '#CBD5E1',
          dark:    '#94A3B8',
          focus:   '#3B82F6',
        },

      },

      // ─────────────────────────────────────────
      // BORDER RADIUS
      // ─────────────────────────────────────────
      borderRadius: {
        'none':  '0',
        'xs':    '4px',
        'sm':    '6px',
        DEFAULT: '8px',
        'md':    '10px',
        'lg':    '14px',
        'xl':    '18px',
        '2xl':   '22px',
        '3xl':   '28px',
        '4xl':   '36px',
        'full':  '9999px',
      },

      // ─────────────────────────────────────────
      // SPACING (tambahan)
      // ─────────────────────────────────────────
      spacing: {
        '4.5':  '1.125rem',
        '13':   '3.25rem',
        '15':   '3.75rem',
        '18':   '4.5rem',
        '22':   '5.5rem',
        '26':   '6.5rem',
        '30':   '7.5rem',
        '128':  '32rem',
        '144':  '36rem',
      },

      // ─────────────────────────────────────────
      // TYPOGRAPHY
      // ─────────────────────────────────────────
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '1rem' }],
        'xs':  ['0.75rem',  { lineHeight: '1.125rem' }],
        'sm':  ['0.875rem', { lineHeight: '1.375rem' }],
        'base':['1rem',     { lineHeight: '1.625rem' }],
        'lg':  ['1.125rem', { lineHeight: '1.75rem' }],
        'xl':  ['1.25rem',  { lineHeight: '1.875rem' }],
        '2xl': ['1.5rem',   { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.375rem' }],
        '4xl': ['2.25rem',  { lineHeight: '2.75rem' }],
        '5xl': ['3rem',     { lineHeight: '1.1' }],
        '6xl': ['3.75rem',  { lineHeight: '1.05' }],
        '7xl': ['4.5rem',   { lineHeight: '1.0' }],
        '8xl': ['5.5rem',   { lineHeight: '1.0' }],
      },

      fontWeight: {
        thin:       '100',
        light:      '300',
        normal:     '400',
        medium:     '500',
        semibold:   '600',
        bold:       '700',
        extrabold:  '800',
        black:      '900',
      },

      letterSpacing: {
        tightest: '-0.04em',
        tighter:  '-0.03em',
        tight:    '-0.02em',
        snug:     '-0.01em',
        normal:   '0em',
        wide:     '0.02em',
        wider:    '0.05em',
        widest:   '0.15em',
      },

      lineHeight: {
        none:    '1',
        tightest:'1.1',
        tighter: '1.2',
        tight:   '1.35',
        snug:    '1.5',
        normal:  '1.625',
        relaxed: '1.75',
        loose:   '2',
      },

      // ─────────────────────────────────────────
      // BOX SHADOW
      // ─────────────────────────────────────────
      boxShadow: {
        // Card shadows
        'card-xs': '0 1px 3px rgba(15,23,42,0.06)',
        'card-sm': '0 2px 8px rgba(15,23,42,0.07)',
        'card':    '0 4px 16px rgba(15,23,42,0.08)',
        'card-md': '0 8px 24px rgba(15,23,42,0.09)',
        'card-lg': '0 16px 40px rgba(15,23,42,0.10)',
        'card-xl': '0 24px 60px rgba(15,23,42,0.12)',
        // Hover lift
        'hover':   '0 20px 50px rgba(15,23,42,0.13)',
        // Colored glow
        'glow-primary':   '0 8px 30px rgba(37,99,235,0.35)',
        'glow-secondary': '0 8px 30px rgba(99,102,241,0.30)',
        'glow-accent':    '0 8px 30px rgba(20,184,166,0.30)',
        'glow-success':   '0 8px 25px rgba(34,197,94,0.30)',
        'glow-warning':   '0 8px 25px rgba(245,158,11,0.30)',
        'glow-danger':    '0 8px 25px rgba(244,63,94,0.30)',
        // Focus ring
        'focus':          '0 0 0 3px rgba(59,130,246,0.35)',
        'focus-danger':   '0 0 0 3px rgba(244,63,94,0.30)',
        // Elevation (seperti Material Design)
        'elevation-1': '0 1px 2px rgba(15,23,42,0.05)',
        'elevation-2': '0 2px 6px rgba(15,23,42,0.07), 0 1px 2px rgba(15,23,42,0.04)',
        'elevation-3': '0 4px 12px rgba(15,23,42,0.08), 0 2px 4px rgba(15,23,42,0.04)',
        'elevation-4': '0 12px 30px rgba(15,23,42,0.10), 0 4px 8px rgba(15,23,42,0.05)',
        'elevation-5': '0 24px 56px rgba(15,23,42,0.13), 0 8px 16px rgba(15,23,42,0.06)',
        // Inner
        'inner-sm':  'inset 0 1px 3px rgba(15,23,42,0.08)',
        'inner':     'inset 0 2px 6px rgba(15,23,42,0.10)',
        // None override
        'none': 'none',
      },

      // ─────────────────────────────────────────
      // TRANSITION
      // ─────────────────────────────────────────
      transitionDuration: {
        '75':  '75ms',
        '100': '100ms',
        '150': '150ms',
        '200': '200ms',
        '250': '250ms',
        '300': '300ms',
        '350': '350ms',
        '400': '400ms',
        '500': '500ms',
        '700': '700ms',
      },
      transitionTimingFunction: {
        'smooth':  'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        'spring':  'cubic-bezier(0.34, 1.56, 0.64, 1)',
        'ease-in-expo':  'cubic-bezier(0.95, 0.05, 0.795, 0.035)',
        'ease-out-expo': 'cubic-bezier(0.19, 1, 0.22, 1)',
      },

      // ─────────────────────────────────────────
      // BACKDROP BLUR
      // ─────────────────────────────────────────
      backdropBlur: {
        'xs': '2px',
        'sm': '6px',
        DEFAULT: '12px',
        'md': '18px',
        'lg': '28px',
        'xl': '48px',
      },

      // ─────────────────────────────────────────
      // ANIMATION (tambahan)
      // ─────────────────────────────────────────
      keyframes: {
        'fade-up': {
          '0%':   { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-10px)' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0.6' },
        },
        'shimmer': {
          '0%':   { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
      },
      animation: {
        'fade-up':    'fade-up 0.6s ease-out both',
        'fade-in':    'fade-in 0.5s ease-out both',
        'float':      'float 5s ease-in-out infinite',
        'pulse-soft': 'pulse-soft 2s ease-in-out infinite',
        'shimmer':    'shimmer 2.5s linear infinite',
      },

    },
    
  },

  plugins: [],
}