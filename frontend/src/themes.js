
import { createTheme } from '@mui/material/styles'
// Enhanced theme for POS systems
export const lightTheme = createTheme({
    palette: {
      mode: 'light',
      primary: {
        main: '#2563eb', // Modern blue
        light: '#3b82f6',
        dark: '#1d4ed8',
        contrastText: '#ffffff',
      },
      secondary: {
        main: '#f59e0b', // Amber for highlights
        light: '#fbbf24',
        dark: '#d97706',
        contrastText: '#000000',
      },
      success: {
        main: '#10b981',
        light: '#34d399',
        dark: '#059669',
      },
      warning: {
        main: '#f59e0b',
        light: '#fbbf24',
        dark: '#d97706',
      },
      error: {
        main: '#ef4444',
        light: '#f87171',
        dark: '#dc2626',
      },
      background: {
        default: '#f8fafc',
        paper: '#ffffff',
      },
      grey: {
        50: '#f8fafc',
        100: '#f1f5f9',
        200: '#e2e8f0',
        300: '#cbd5e1',
        400: '#94a3b8',
        500: '#64748b',
        600: '#475569',
        700: '#334155',
        800: '#1e293b',
        900: '#0f172a',
      },
    },
    typography: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      h1: {
        fontWeight: 700,
        fontSize: '2.25rem',
        lineHeight: 1.2,
      },
      h2: {
        fontWeight: 600,
        fontSize: '1.875rem',
        lineHeight: 1.3,
      },
      h3: {
        fontWeight: 600,
        fontSize: '1.5rem',
        lineHeight: 1.4,
      },
      h4: {
        fontWeight: 600,
        fontSize: '1.25rem',
        lineHeight: 1.4,
      },
      h5: {
        fontWeight: 600,
        fontSize: '1.125rem',
        lineHeight: 1.4,
      },
      h6: {
        fontWeight: 600,
        fontSize: '1rem',
        lineHeight: 1.4,
      },
      body1: {
        fontSize: '1rem',
        lineHeight: 1.5,
      },
      body2: {
        fontSize: '0.875rem',
        lineHeight: 1.5,
      },
      button: {
        fontWeight: 500,
        fontSize: '0.875rem',
        textTransform: 'none',
      },
    },
    shape: {
      borderRadius: 8,
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontWeight: 500,
            borderRadius: 8,
            boxShadow: 'none',
            '&:hover': {
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            },
          },
          contained: {
            '&:hover': {
              boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
            },
          },
          outlined: {
            borderWidth: 1.5,
            '&:hover': {
              borderWidth: 1.5,
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
            border: "1px solid rgba(0,0,0,0.05)",
            '&:hover': {
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            },
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: 8,
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: 'rgba(0,0,0,0.23)',
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderWidth: 2,
              },
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
          },
          elevation1: {
            boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
            borderBottom: '1px solid rgba(0,0,0,0.08)',
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            borderRight: '1px solid rgba(0,0,0,0.08)',
          },
        },
      },
    },
  });
  
  // Enhanced dark theme for POS systems
  export const darkTheme = createTheme({
    palette: {
      mode: 'dark',
      primary: {
        main: '#3b82f6', // Slightly lighter blue for dark mode
        light: '#60a5fa',
        dark: '#2563eb',
        contrastText: '#ffffff',
      },
      secondary: {
        main: '#fbbf24', // Brighter amber for dark mode visibility
        light: '#fcd34d',
        dark: '#f59e0b',
        contrastText: '#000000',
      },
      success: {
        main: '#34d399',
        light: '#6ee7b7',
        dark: '#10b981',
      },
      warning: {
        main: '#fbbf24',
        light: '#fcd34d',
        dark: '#f59e0b',
      },
      error: {
        main: '#f87171',
        light: '#fca5a5',
        dark: '#ef4444',
      },
      background: {
        default: '#0f172a', // Deep slate background
        paper: '#1e293b',   // Elevated surfaces
      },
      grey: {
        50: '#0f172a',
        100: '#1e293b',
        200: '#334155',
        300: '#475569',
        400: '#64748b',
        500: '#94a3b8',
        600: '#cbd5e1',
        700: '#e2e8f0',
        800: '#f1f5f9',
        900: '#f8fafc',
      },
      text: {
        primary: '#f8fafc',
        secondary: '#cbd5e1',
        disabled: '#64748b',
      },
      divider: 'rgba(148, 163, 184, 0.12)',
    },
    typography: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      h1: {
        fontWeight: 700,
        fontSize: '2.25rem',
        lineHeight: 1.2,
        color: '#f8fafc',
      },
      h2: {
        fontWeight: 600,
        fontSize: '1.875rem',
        lineHeight: 1.3,
        color: '#f8fafc',
      },
      h3: {
        fontWeight: 600,
        fontSize: '1.5rem',
        lineHeight: 1.4,
        color: '#f8fafc',
      },
      h4: {
        fontWeight: 600,
        fontSize: '1.25rem',
        lineHeight: 1.4,
        color: '#f8fafc',
      },
      h5: {
        fontWeight: 600,
        fontSize: '1.125rem',
        lineHeight: 1.4,
        color: '#f8fafc',
      },
      h6: {
        fontWeight: 600,
        fontSize: '1rem',
        lineHeight: 1.4,
        color: '#f8fafc',
      },
      body1: {
        fontSize: '1rem',
        lineHeight: 1.5,
        color: '#e2e8f0',
      },
      body2: {
        fontSize: '0.875rem',
        lineHeight: 1.5,
        color: '#cbd5e1',
      },
      button: {
        fontWeight: 500,
        fontSize: '0.875rem',
        textTransform: 'none',
      },
    },
    shape: {
      borderRadius: 8,
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontWeight: 500,
            borderRadius: 8,
            boxShadow: 'none',
            '&:hover': {
              boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
            },
          },
          contained: {
            '&:hover': {
              boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
            },
          },
          outlined: {
            '&:hover': {
              borderWidth: 1.5,
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            backgroundColor: '#1e293b',
            boxShadow: '0 1px 3px rgba(0,0,0,0.5), 0 1px 2px rgba(0,0,0,0.6)',
            borderRadius: 12,
            border: '1px solid rgba(148, 163, 184, 0.1)',
            '&:hover': {
              boxShadow: '0 4px 12px rgba(0,0,0,0.6)',
              borderColor: 'rgba(148, 163, 184, 0.2)',
            },
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: 8,
              backgroundColor: 'rgba(148, 163, 184, 0.05)',
              '& fieldset': {
                borderColor: 'rgba(148, 163, 184, 0.3)',
              },
              '&:hover fieldset': {
                borderColor: 'rgba(148, 163, 184, 0.5)',
              },
              '&.Mui-focused fieldset': {
                borderWidth: 2,
                borderColor: '#3b82f6',
              },
            },
            '& .MuiInputLabel-root': {
              color: '#cbd5e1',
            },
            '& .MuiOutlinedInput-input': {
              color: '#f8fafc',
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            backgroundColor: '#1e293b',
          },
          elevation1: {
            boxShadow: '0 1px 3px rgba(0,0,0,0.5), 0 1px 2px rgba(0,0,0,0.6)',
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: '#1e293b',
            boxShadow: '0 1px 3px rgba(0,0,0,0.5)',
            borderBottom: '1px solid rgba(148, 163, 184, 0.1)',
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            backgroundColor: '#1e293b',
            borderRight: '1px solid rgba(148, 163, 184, 0.1)',
          },
        },
      },
      MuiIconButton: {
        styleOverrides: {
          root: {
            color: '#cbd5e1',
            '&:hover': {
              backgroundColor: 'rgba(148, 163, 184, 0.08)',
            },
          },
        },
      },
      MuiDivider: {
        styleOverrides: {
          root: {
            borderColor: 'rgba(148, 163, 184, 0.12)',
          },
        },
      },
    },
  });