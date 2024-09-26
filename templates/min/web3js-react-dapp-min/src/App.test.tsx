import { render, screen } from '@testing-library/react';
import App from './App';

test('renders React Docs link', () => {
  render(<App />);
  const linkElement = screen.getByText(/React Docs/i);
  expect(linkElement).toBeInTheDocument();
});
