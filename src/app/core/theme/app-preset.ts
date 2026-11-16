import { definePreset } from '@primeuix/themes';
import Aura from '@primeuix/themes/aura';

/**
 * Tema PrimeNG de NovaStore — "Hardware Press".
 * Alineado con src/styles/_tokens.scss y design-system/novastore/MASTER.md.
 * Los detalles visuales duros (bordes 2px, sombras offset) viven en
 * src/styles/_prime-overrides.scss; aquí se define la base cromática y la forma.
 */
export const NovaPreset = definePreset(Aura, {
  semantic: {
    primary: {
      50: '#eef2ff',
      100: '#dbe4ff',
      200: '#b8caff',
      300: '#8aa8ff',
      400: '#5b86ff',
      500: '#0047ff',
      600: '#0038cc',
      700: '#002ca3',
      800: '#00217a',
      900: '#001652',
      950: '#000c2e',
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
          50: '#faf8f2',
          100: '#f5f2e9',
          200: '#ede9de',
          300: '#ddd7c8',
          400: '#c2bbaa',
          500: '#8f887c',
          600: '#6b655b',
          700: '#57534e',
          800: '#33322f',
          900: '#0b0b0c',
          950: '#000000',
        },
        text: {
          color: '#0b0b0c',
          mutedColor: '#57534e',
        },
        content: {
          background: '#ffffff',
          borderColor: '#0b0b0c',
        },
      },
      dark: {
        primary: {
          color: '{primary.400}',
          inverseColor: '#0b0b0c',
          hoverColor: '{primary.300}',
          activeColor: '{primary.200}',
        },
        surface: {
          0: '#ffffff',
          50: '#f5f2e9',
          100: '#ede9de',
          200: '#ddd7c8',
          300: '#c2bbaa',
          400: '#8f887c',
          500: '#6b655b',
          600: '#57534e',
          700: '#2b2b31',
          800: '#1f1f23',
          900: '#17171a',
          950: '#0b0b0c',
        },
        text: {
          color: '#f5f2e9',
          mutedColor: '#a8a29e',
        },
        content: {
          background: '#17171a',
          borderColor: '#f5f2e9',
        },
      },
    },
  },
  components: {
    button: {
      root: {
        borderRadius: '0',
        paddingX: '1.05rem',
        paddingY: '0.68rem',
        label: {
          fontWeight: '700',
        },
        focusRing: {
          width: '3px',
          style: 'solid',
          offset: '3px',
        },
      },
    },
    inputtext: {
      root: {
        borderRadius: '0',
      },
    },
    select: {
      root: {
        borderRadius: '0',
      },
      overlay: {
        borderRadius: '0',
      },
    },
    card: {
      root: {
        borderRadius: '0',
      },
    },
    tag: {
      root: {
        borderRadius: '0',
      },
    },
    dialog: {
      root: {
        borderRadius: '0',
      },
    },
  },
});
