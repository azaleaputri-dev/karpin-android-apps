/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';

jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(() => Promise.resolve()),
  getItem: jest.fn(() => Promise.resolve(null)),
  removeItem: jest.fn(() => Promise.resolve()),
}));

jest.mock('../src/navigation/AppNavigator', () => {
  const mockReact = require('react');
  const {Text} = require('react-native');

  function MockNavigator() {
    return mockReact.createElement(Text, null, 'Mock App Navigator');
  }

  return MockNavigator;
});

import App from '../App';

test('renders correctly', async () => {
  await ReactTestRenderer.act(() => {
    ReactTestRenderer.create(<App />);
  });
});
