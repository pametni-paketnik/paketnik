import { render, screen } from '@testing-library/react';
import App from './App';

test('renders InPlant logo', () => {
  render(<App />);
  const logoElement = screen.getByText(/InPlant/i);
  expect(logoElement).toBeInTheDocument();
});
