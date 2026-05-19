'use client';

import { createTheme } from '@mui/material/styles';

declare module '@mui/material/styles' {
  interface Palette {
    sage: { main: string; light: string; dark: string; contrastText: string };
    calm: { main: string; light: string; dark: string; contrastText: string };
    sand: { main: string; light: string; dark: string; contrastText: string };
    terra: { main: string; light: string; dark: string; contrastText: string };
    peach: { main: string; light: string; dark: string; contrastText: string };
    night: { main: string; light: string; dark: string; contrastText: string };
  }
  interface PaletteOptions {
    sage?: { main: string; light: string; dark: string; contrastText: string };
    calm?: { main: string; light: string; dark: string; contrastText: string };
    sand?: { main: string; light: string; dark: string; contrastText: string };
    terra?: { main: string; light: string; dark: string; contrastText: string };
    peach?: { main: string; light: string; dark: string; contrastText: string };
    night?: { main: string; light: string; dark: string; contrastText: string };
  }
}

export const anclaTheme = createTheme({
  palette: {
    primary: {
      main: '#6b7f5e',       // sage-500
      light: '#adc29d',      // sage-300
      dark: '#4a6148',       // sage-700
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#5b81a8',       // calm-500
      light: '#9ab7d5',      // calm-300
      dark: '#3d5e81',       // calm-700
      contrastText: '#ffffff',
    },
    error: {
      main: '#bf6b4a',       // terra-500
      light: '#e0a896',      // terra-300
      dark: '#9e4a28',       // terra-700
    },
    warning: {
      main: '#c4a882',       // sand-500
      light: '#e0d0b8',      // sand-300
      dark: '#9b6a38',       // sand-700
    },
    success: {
      main: '#6b7f5e',       // sage-500
      light: '#adc29d',      // sage-300
      dark: '#4a6148',       // sage-700
    },
    sage: {
      main: '#6b7f5e',
      light: '#adc29d',
      dark: '#4a6148',
      contrastText: '#ffffff',
    },
    calm: {
      main: '#5b81a8',
      light: '#9ab7d5',
      dark: '#3d5e81',
      contrastText: '#ffffff',
    },
    sand: {
      main: '#c4a882',
      light: '#e0d0b8',
      dark: '#9b6a38',
      contrastText: '#332e28',
    },
    terra: {
      main: '#bf6b4a',
      light: '#e0a896',
      dark: '#9e4a28',
      contrastText: '#ffffff',
    },
    peach: {
      main: '#e08090',
      light: '#f0bcc2',
      dark: '#a85060',
      contrastText: '#ffffff',
    },
    night: {
      main: '#2c3e50',
      light: '#4e7090',
      dark: '#1a242f',
      contrastText: '#ffffff',
    },
    background: {
      default: '#faf9f7',
      paper: '#ffffff',
    },
    text: {
      primary: '#332e28',
      secondary: '#8a8078',
      disabled: '#c8c1b8',
    },
  },
  typography: {
    fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
    h1: {
      fontFamily: "'Lora', Georgia, serif",
      fontWeight: 600,
      lineHeight: 1.25,
    },
    h2: {
      fontFamily: "'Lora', Georgia, serif",
      fontWeight: 600,
      lineHeight: 1.25,
    },
    h3: {
      fontFamily: "'Lora', Georgia, serif",
      fontWeight: 600,
      lineHeight: 1.3,
    },
    h4: {
      fontFamily: "'Lora', Georgia, serif",
      fontWeight: 500,
      lineHeight: 1.35,
    },
    h5: {
      fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h6: {
      fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
      fontWeight: 600,
      lineHeight: 1.4,
    },
    body1: {
      fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
      fontSize: '1rem',
      lineHeight: 1.625,
    },
    body2: {
      fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
      fontSize: '0.875rem',
      lineHeight: 1.5,
    },
    caption: {
      fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
      fontSize: '0.75rem',
    },
    overline: {
      fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
      fontSize: '0.75rem',
      fontWeight: 600,
      letterSpacing: '0.08em',
      textTransform: 'uppercase',
    },
  },
  shape: {
    borderRadius: 12,
  },
  shadows: [
    'none',
    '0 1px 3px rgba(0,0,0,0.08)',
    '0 2px 6px rgba(0,0,0,0.08)',
    '0 4px 12px rgba(0,0,0,0.08)',
    '0 6px 16px rgba(0,0,0,0.09)',
    '0 8px 24px rgba(0,0,0,0.10)',
    '0 10px 28px rgba(0,0,0,0.10)',
    '0 12px 32px rgba(0,0,0,0.10)',
    '0 14px 36px rgba(0,0,0,0.11)',
    '0 16px 40px rgba(0,0,0,0.11)',
    '0 18px 44px rgba(0,0,0,0.12)',
    '0 20px 48px rgba(0,0,0,0.12)',
    '0 22px 52px rgba(0,0,0,0.12)',
    '0 24px 56px rgba(0,0,0,0.12)',
    '0 26px 60px rgba(0,0,0,0.13)',
    '0 28px 64px rgba(0,0,0,0.13)',
    '0 30px 68px rgba(0,0,0,0.14)',
    '0 32px 72px rgba(0,0,0,0.14)',
    '0 34px 76px rgba(0,0,0,0.14)',
    '0 36px 80px rgba(0,0,0,0.15)',
    '0 38px 84px rgba(0,0,0,0.15)',
    '0 40px 88px rgba(0,0,0,0.15)',
    '0 42px 92px rgba(0,0,0,0.16)',
    '0 44px 96px rgba(0,0,0,0.16)',
    '0 46px 100px rgba(0,0,0,0.16)',
  ],
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '999px',
          textTransform: 'none',
          fontWeight: 600,
          fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
          letterSpacing: '0.01em',
          padding: '10px 24px',
          transition: 'all 250ms ease',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: '999px',
          fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
          fontWeight: 500,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
            fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
          },
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          borderRadius: 8,
          fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
          fontSize: '0.8rem',
        },
      },
    },
  },
});

export const anclaNightTheme = createTheme({
  ...anclaTheme,
  palette: {
    ...anclaTheme.palette,
    mode: 'dark',
    primary: {
      main: '#5b81a8',
      light: '#9ab7d5',
      dark: '#3d5e81',
      contrastText: '#ffffff',
    },
    background: {
      default: '#1a242f',
      paper: '#232e3c',
    },
    text: {
      primary: '#dce8f0',
      secondary: '#8aaac4',
      disabled: '#4e7090',
    },
    divider: 'rgba(255,255,255,0.08)',
  },
});
