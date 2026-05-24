import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import LoadingSpinner from './LoadingSpinner';

test('renders spinner with default size', () => {
  render(<LoadingSpinner />);
  const spinner = screen.getByRole('status');
  expect(spinner).toBeInTheDocument();
});
