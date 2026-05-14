import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { SettingsClient } from '@/app/dashboard/settings/settings-client';

// Mock the dependencies
vi.mock('@/lib/i18n', () => ({
  useI18n: () => ({
    t: (key: string) => key,
    locale: 'en',
    setLocale: vi.fn(),
  }),
}));

vi.mock('@/components/providers', () => ({
  useTheme: () => ({
    theme: 'light',
    toggle: vi.fn(),
  }),
}));

describe('SettingsClient Component', () => {
  const mockUser = {
    name: 'Test User',
    email: 'test@example.com',
    role: 'user',
  };

  const mockCompany = {
    name: 'Test Company',
    id: 'company123',
  };

  it('renders without crashing', () => {
    render(<SettingsClient user={mockUser} company={mockCompany} />);
    expect(screen.getByText('Profile Information')).toBeDefined();
  });

  it('displays user and company information correctly', () => {
    render(<SettingsClient user={mockUser} company={mockCompany} />);
    
    const nameInput = screen.getByLabelText(/Full Name/i) as HTMLInputElement;
    const emailInput = screen.getByLabelText(/Email Address/i) as HTMLInputElement;
    const companyInput = screen.getByLabelText(/Company/i) as HTMLInputElement;

    expect(nameInput.value).toBe(mockUser.name);
    expect(emailInput.value).toBe(mockUser.email);
    expect(companyInput.value).toBe(mockCompany.name);
  });

  it('switches to preferences tab', () => {
    render(<SettingsClient user={mockUser} company={mockCompany} />);
    
    const preferencesTab = screen.getAllByText('Preferences')[0];
    fireEvent.click(preferencesTab);
    
    expect(screen.getByText('App Preferences')).toBeDefined();
    expect(screen.getByText('Language')).toBeDefined();
    expect(screen.getByText('Theme')).toBeDefined();
  });

  it('switches to security tab', () => {
    render(<SettingsClient user={mockUser} company={mockCompany} />);
    
    const securityTab = screen.getAllByText('Security')[0];
    fireEvent.click(securityTab);
    
    expect(screen.getByText('Password changes are currently managed by administrators.')).toBeDefined();
  });
});
