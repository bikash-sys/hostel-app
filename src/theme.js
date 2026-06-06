// Design System Colors & Constants for DormDesk Mobile
export const Colors = {
  primary: '#6C63FF',
  primaryDark: '#5A52D5',
  secondary: '#A78BFA',
  background: '#0F0F1A',
  surface: '#1A1A2E',
  surfaceLight: '#232340',
  border: '#2D2D4A',
  text: '#F0F0FF',
  textMuted: '#8888AA',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  info: '#3B82F6',
  blue: '#3B82F6',
  purple: '#8B5CF6',
  amber: '#F59E0B',
  green: '#10B981',
  red: '#EF4444',
  indigo: '#6366F1',
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 9999,
};

export const Typography = {
  h1: { fontSize: 28, fontWeight: '700', color: Colors.text },
  h2: { fontSize: 22, fontWeight: '700', color: Colors.text },
  h3: { fontSize: 18, fontWeight: '600', color: Colors.text },
  body: { fontSize: 15, fontWeight: '400', color: Colors.text },
  bodySmall: { fontSize: 13, fontWeight: '400', color: Colors.textMuted },
  label: { fontSize: 12, fontWeight: '600', color: Colors.textMuted, letterSpacing: 0.5 },
  caption: { fontSize: 11, fontWeight: '500', color: Colors.textMuted },
};
