/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,ts,html}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#E8F3FF', 100: '#BEDAFF', 200: '#94BFFF', 300: '#6AA1FF',
          400: '#4085FF', 500: '#165DFF', 600: '#0E42D2', 700: '#072CA6',
          800: '#031A79', 900: '#000D4D',
        },
        success: {
          50: '#E8FFEA', 100: '#AFF0B5', 200: '#7BE188', 300: '#4CD263',
          400: '#23C343', 500: '#00B42A', 600: '#009A29', 700: '#008026',
          800: '#006622', 900: '#004D1C',
        },
        warning: {
          50: '#FFF7E8', 100: '#FFE4BA', 200: '#FFCF8B', 300: '#FFB85C',
          400: '#FF9A2E', 500: '#FF7D00', 600: '#D25F00', 700: '#A64500',
          800: '#792E00', 900: '#4D1B00',
        },
        danger: {
          50: '#FFECE8', 100: '#FDCDC5', 200: '#FBACA3', 300: '#F98981',
          400: '#F76560', 500: '#F53F3F', 600: '#CB272D', 700: '#A1151D',
          800: '#770813', 900: '#4D000A',
        },
      },
      fontFamily: {
        sans: ['"PingFang SC"', '"Microsoft YaHei"', '"Helvetica Neue"', 'Helvetica', 'Arial', 'sans-serif'],
      },
      fontSize: {
        display: ['32px', { lineHeight: '40px', fontWeight: '600' }],
        headline: ['24px', { lineHeight: '32px', fontWeight: '600' }],
        title: ['20px', { lineHeight: '28px', fontWeight: '500' }],
        body: ['14px', { lineHeight: '22px', fontWeight: '400' }],
        label: ['12px', { lineHeight: '20px', fontWeight: '400' }],
      },
      boxShadow: {
        'card-hover': '0 4px 12px rgba(0, 0, 0, 0.08)',
        modal: '0 8px 24px rgba(0, 0, 0, 0.12)',
        dropdown: '0 4px 16px rgba(0, 0, 0, 0.1)',
      },
      borderRadius: {
        DEFAULT: '8px',
        sm: '4px',
      },
      transitionTimingFunction: {
        'ease-standard': 'cubic-bezier(0.25, 0.1, 0.25, 1)',
      },
    },
  },
  plugins: [],
}
