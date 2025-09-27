import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { ProfileReportsPanel } from '@/components/admin/ProfileReportsPanel';
import { testDebugger } from '@/utils/testDebugger';
import { profileReportService } from '@/services/ProfileReportService';

// Mock services
vi.mock('@/services/ProfileReportService', () => {
  const mockService = {
    getPendingProfileReports: vi.fn(),
    getProfileReportStats: vi.fn(),
    resolveProfileReport: vi.fn()
  };
  
  return {
    ProfileReportService: vi.fn(() => mockService),
    profileReportService: mockService
  };
});

vi.mock('@/services/ReportService', () => {
  const mockService = {
    getUserReportStats: vi.fn(),
    getPendingReports: vi.fn(),
    resolveReport: vi.fn()
  };
  
  return {
    ReportService: vi.fn(() => mockService)
  };
});

// Mock toast
vi.mock('sonner', () => ({
  toast: vi.fn()
}));

// Mock icons
vi.mock('lucide-react', () => ({
  AlertTriangle: () => <div data-testid="alert-triangle" />,
  Eye: () => <div data-testid="eye" />,
  Check: () => <div data-testid="check" />,
  X: () => <div data-testid="x" />,
  Filter: () => <div data-testid="filter" />,
  Search: () => <div data-testid="search" />,
  Clock: () => <div data-testid="clock-icon" />,
  CheckCircle: () => <div data-testid="check-circle-icon" />,
  XCircle: () => <div data-testid="x-circle-icon" />,
  User: () => <div data-testid="user" />,
  Shield: () => <div data-testid="shield" />
}));

describe('ProfileReportsPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup default mocks
    const mockedService = vi.mocked(profileReportService);
    mockedService.getPendingProfileReports.mockResolvedValue({
      success: true,
      reports: [
        {
          id: '1',
          content_type: 'profile',
          reported_user_id: 'user1',
          reporter_user_id: 'user2',
          reported_content_id: 'profile1',
          reason: 'harassment',
          severity: 'medium',
          status: 'pending',
          description: 'Test report',
          resolution_notes: null,
          reviewed_at: null,
          reviewed_by: null,
          created_at: '2023-01-01T00:00:00Z',
          updated_at: '2023-01-01T00:00:00Z'
        }
      ]
    });

    mockedService.getProfileReportStats.mockResolvedValue({
      success: true,
      stats: {
        reportsMade: 2,
        reportsReceived: 1,
        recentReports: 0,
        canReport: true
      }
    });
  });

  it('debería renderizar correctamente', async () => {
    render(<ProfileReportsPanel />);
    
    expect(screen.getByText('Panel de Reportes de Perfiles')).toBeInTheDocument();
  });

  it('debería mostrar mensaje de carga inicialmente', () => {
    render(<ProfileReportsPanel />);
    
    expect(screen.getByText('Cargando reportes...')).toBeInTheDocument();
  });

  it('debería manejar errores al cargar reportes', async () => {
    const mockedService = vi.mocked(profileReportService);
    mockedService.getPendingProfileReports.mockResolvedValue({
      success: false,
      error: 'Error al cargar reportes'
    });

    render(<ProfileReportsPanel />);
    
    // El componente debería manejar el error gracefully
    expect(mockedService.getPendingProfileReports).toHaveBeenCalled();
  });

  it('debería llamar a los servicios correctos al montar', async () => {
    testDebugger.logTestStart('ProfileReportsPanel - service calls on mount');
    
    const mockedService = vi.mocked(profileReportService);
    render(<ProfileReportsPanel />);
    
    // Wait for useEffect to complete
    await waitFor(() => {
      expect(mockedService.getPendingProfileReports).toHaveBeenCalled();
    });
    
    testDebugger.verifyMockCalls('getPendingProfileReports', 1);
    testDebugger.logTestEnd('ProfileReportsPanel - service calls on mount', true);
  });

  it('debería renderizar iconos correctamente', () => {
    render(<ProfileReportsPanel />);
    
    // Los iconos deberían estar presentes en el DOM
    expect(screen.getByTestId('alert-triangle')).toBeInTheDocument();
  });
});
