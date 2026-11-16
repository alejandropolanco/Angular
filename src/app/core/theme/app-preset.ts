import { definePreset } from '@primeuix/themes';
import Aura from '@primeuix/themes/aura';

/**
 * Tema PrimeNG de NovaStore — "Quiet Tech".
 * Alineado con src/styles/_tokens.scss y design-system/novastore/MASTER.md.
 */
export const NovaPreset = definePreset(Aura, {
  semantic: {
    primary: {
      50: '#eaf4ff',
      100: '#d5e9ff',
      200: '#aed3ff',
      300: '#7ab8ff',
      400: '#3d97ff',
      500: '#0a84ff',
      600: '#0066cc',
      700: '#0052a3',
      800: '#003d7a',
      900: '#002952',
      950: '#001733',
    },
    colorScheme: {
      light: {
        primary: {
          color: '{primary.500}',
          inverseColor: '#ffffff',
          hoverColor: '{primary.600}',
          activeColor: '{primary.700}',
        },
        surface: {
          0: '#ffffff',
          50: '#f9f9fb',
          100: '#f2f2f7',
          200: '#e5e5ea',
          300: '#d1d1d6',
          400: '#c7c7cc',
          500: '#aeaeb2',
          600: '#8e8e93',
          700: '#6e6e73',
          800: '#48484a',
          900: '#1d1d1f',
          950: '#000000',
        },
        text: {
          color: '#1d1d1f',
          mutedColor: '#6e6e73',
        },
        content: {
          background: '#ffffff',
          borderColor: 'rgba(60, 60, 67, 0.12)',
        },
      },
      dark: {
        primary: {
          color: '{primary.500}',
          inverseColor: '#04121f',
          hoverColor: '{primary.400}',
          activeColor: '{primary.300}',
        },
        surface: {
          0: '#ffffff',
          50: '#f5f5f7',
          100: '#e5e5ea',
          200: '#d1d1d6',
          300: '#aeaeb2',
          400: '#8e8e93',
          500: '#636366',
          600: '#48484a',
          700: '#3a3a3c',
          800: '#2c2c2e',
          900: '#1c1c1e',
          950: '#000000',
        },
        text: {
          color: '#f5f5f7',
          mutedColor: '#a1a1a6',
        },
        content: {
          background: '#1c1c1e',
          borderColor: 'rgba(84, 84, 88, 0.6)',
        },
      },
    },
  },
  components: {
    button: {
      root: {
        borderRadius: '14px',
        paddingX: '1.05rem',
        paddingY: '0.68rem',
        label: {
          fontWeight: '600',
        },
      },
    },
    inputtext: {
      root: {
        borderRadius: '10px',
      },
    },
    select: {
      root: {
        borderRadius: '10px',
      },
    },
    card: {
      root: {
        borderRadius: '24px',
      },
    },
    tag: {
      root: {
        borderRadius: '999px',
      },
    },
    dialog: {
      root: {
        borderRadius: '24px',
      },
    },
  },
});
