import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Sidebar from './Sidebar';
import { MemoryRouter } from 'react-router-dom';

test('renders Sidebar navigation items', () => {
  render(
    <MemoryRouter>
      <Sidebar />
    </MemoryRouter>
  );

  expect(screen.getByText(/Dashboard/i)).toBeInTheDocument();
  expect(screen.getByText(/Tasks/i)).toBeInTheDocument();
  expect(screen.getByText(/Preferences/i)).toBeInTheDocument();
});
