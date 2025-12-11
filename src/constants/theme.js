// NeuroDetect AI - Professional Medical Theme
export const COLORS = {
  // Primary Palette - Deep Medical Blue
  primary: '#0A1628',
  primaryLight: '#1A2D4A',
  primaryDark: '#050D18',
  
  // Accent Colors - Neural Network Inspired
  accent: '#00D4AA',
  accentLight: '#00FFD1',
  accentDark: '#00A88A',
  
  // Secondary - Warm Coral for Alerts
  secondary: '#FF6B6B',
  secondaryLight: '#FF8E8E',
  
  // Status Colors
  success: '#00E5A0',
  warning: '#FFB800',
  danger: '#FF4D6A',
  
  // Neutrals
  white: '#FFFFFF',
  offWhite: '#F8FAFC',
  lightGray: '#E2E8F0',
  gray: '#94A3B8',
  darkGray: '#475569',
  
  // Gradient Sets
  gradientPrimary: ['#0A1628', '#1A2D4A', '#2A4365'],
  gradientAccent: ['#00D4AA', '#00A88A', '#008B70'],
  gradientNeural: ['#667EEA', '#764BA2'],
  gradientSunrise: ['#F093FB', '#F5576C'],
  gradientOcean: ['#4FACFE', '#00F2FE'],
  
  // Glass Effect
  glass: 'rgba(255, 255, 255, 0.1)',
  glassBorder: 'rgba(255, 255, 255, 0.2)',
};

export const FONTS = {
  // Using system fonts for now - can be replaced with custom fonts
  title: {
    fontWeight: '800',
    letterSpacing: -1,
  },
  heading: {
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  subheading: {
    fontWeight: '600',
    letterSpacing: 0,
  },
  body: {
    fontWeight: '400',
    letterSpacing: 0.2,
  },
  caption: {
    fontWeight: '500',
    letterSpacing: 0.5,
  },
};

export const SIZES = {
  // Spacing
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  
  // Font Sizes
  tiny: 10,
  small: 12,
  regular: 14,
  medium: 16,
  large: 20,
  xlarge: 24,
  xxlarge: 32,
  title: 40,
  hero: 56,
  
  // Border Radius
  radiusSm: 8,
  radiusMd: 16,
  radiusLg: 24,
  radiusXl: 32,
  radiusFull: 9999,
};

export const SHADOWS = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  glow: {
    shadowColor: '#00D4AA',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
};

export default { COLORS, FONTS, SIZES, SHADOWS };

