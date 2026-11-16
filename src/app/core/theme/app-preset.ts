import { definePreset } from '@primeuix/themes';
import Aura from '@primeuix/themes/aura';

/**
 * Tema PrimeNG de NovaStore — "Clean Tech Monocromo".
 * Escala neutra cálida (stone); el acento es la tinta, no un color.
 * Alineado con src/styles/_tokens.scss y design-system/novastore/MASTER.md.
 */
export const NovaPreset = definePreset(Aura, {
  semantic: {
    primary: {
      50: '#fafaf9',
      100: '#f5f5f4',
      200: '#e7e5e4',
      300: '#d6d3d1',
      400: '#a8a29e',
      500: '#78716c',
      600: '#57534e',
      700: '#44403c',
      800: '#292524',
      900: '#1c1917',
      950: '#0c0a09',
    },
    colorScheme: {
      light: {
        primary: {
          color: '{primary.950}',
          inverseColor: '#ffffff',
          hoverColor: '{primary.800}',
          activeColor: '{primary.700}',
        },
        surface: {
          0: '#ffffff',
          50: '#fafaf9',
          100: '#f5f5f4',
          200: '#e7e5e4',
          300: '#d6d3d1',
          400: '#a8a29e',
          500: '#78716c',
          600: '#57534e',
          700: '#44403c',
          800: '#292524',
          900: '#1c1917',
          950: '#0c0a09',
        },
        text: {
          color: '#0c0a09',
          mutedColor: '#57534e',
        },
        content: {
          background: '#ffffff',
          borderColor: '#e7e5e4',
        },
      },
      dark: {
        primary: {
          color: '{primary.50}',
          inverseColor: '#0c0a09',
          hoverColor: '{primary.200}',
          activeColor: '{primary.300}',
        },
        surface: {
          0: '#ffffff',
          50: '#fafaf9',
          100: '#f5f5f4',
          200: '#e7e5e4',
          300: '#d6d3d1',
          400: '#a8a29e',
          500: '#78716c',
          600: '#57534e',
          700: '#44403c',
          800: '#292524',
          900: '#1c1917',
          950: '#0c0a09',
        },
        text: {
          color: '#fafaf9',
          mutedColor: '#a8a29e',
        },
        content: {
          background: '#1c1917',
          borderColor: '#292524',
        },
      },
    },
  },
  components: {
    button: {
      root: {
        borderRadius: '12px',
        paddingX: '1.05rem',
        paddingY: '0.68rem',
        label: {
          fontWeight: '600',
        },
      },
    },
    inputtext: {
      root: {
        borderRadius: '8px',
      },
    },
    select: {
      root: {
        borderRadius: '8px',
      },
      overlay: {
        borderRadius: 'var(--nv-radius-md)',
        shadow: 'var(--nv-shadow-lg)',
      },
    },
    card: {
      root: {
        borderRadius: '20px',
      },
    },
    tag: {
      root: {
        borderRadius: '999px',
      },
    },
    dialog: {
      root: {
        borderRadius: '20px',
      },
    },
  },
});
