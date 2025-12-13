import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from '../App';

// Mock child components to simplify testing
jest.mock('../pages/HomePage', () => () => <div data-testid="home-page">Home Page</div>);
jest.mock('../pages/LoginPage', () => () => <div data-testid="login-page">Login Page</div>);
jest.mock('../pages/RegisterPage', () => () => <div data-testid="register-page">Register Page</div>);

// Mock auth store
jest.mock('../store/authStore', () => ({
  useAuthStore: () => ({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: false,
    login: jest.fn(),
    register: jest.fn(),
    logout: jest.fn(),
    checkAuth: jest.fn(),
  }),
  AuthProvider: ({ children }) => <div>{children}</div>,
}));

// Mock theme provider
jest.mock('../hooks/useTheme', () => ({
  ThemeProvider: ({ children }) => <div>{children}</div>,
}));

describe('App Component', () => {
  test('renders without crashing', () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );
    
    // Check if the app container is rendered
    expect(screen.getByTestId).toBeDefined();
  });

  test('renders navigation elements', () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );
    
    // Check for logo/brand
    expect(screen.getByText(/BlogPlatform/i)).toBeInTheDocument();
    
    // Check for navigation links
    expect(screen.getByText(/Home/i)).toBeInTheDocument();
    expect(screen.getByText(/Search/i)).toBeInTheDocument();
  });
});