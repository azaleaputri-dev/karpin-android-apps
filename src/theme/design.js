import {StyleSheet} from 'react-native';

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
};

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  full: 999,
};

export const typography = StyleSheet.create({
  h1: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0f172a',
  },
  h2: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0f172a',
  },
  h3: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0f172a',
  },
  h4: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
  },
  body: {
    fontSize: 14,
    color: '#64748b',
  },
  caption: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748b',
  },
  small: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748b',
  },
  number: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0f172a',
  },
  badge: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0d9488',
  },
});
