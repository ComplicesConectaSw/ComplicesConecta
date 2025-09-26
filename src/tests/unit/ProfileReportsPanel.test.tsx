import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProfileReportsPanel } from '@/components/admin/ProfileReportsPanel';

// Mock services
const mockProfileReportService = {
  getPendingProfileReports: vi.fn(),
  getProfileReportStats: vi.fn(),
  resolveProfileReport: vi.fn()
};

const mockReportService = {
  getUserReportStats: vi.fn(),
  getPendingReports: vi.fn(),
  resolveReport: vi.fn()
};

vi.mock('@/services/ProfileReportService', () => ({
  ProfileReportService: vi.fn(() => mockProfileReportService)
}));

vi.mock('@/services/ReportService', () => ({
  ReportService: vi.fn(() => mockReportService)
}));

// Mock toast
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn()
  })
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
    mockProfileReportService.getPendingProfileReports.mockResolvedValue({
      success: true,
      reports: [
        {
          id: '1',
          reported_user_id: 'user1',
          reporter_user_id: 'user2',
          reason: 'harassment',
          status: 'pending',
          description: 'Test report',
          created_at: '2023-01-01T00:00:00Z'
        }
      ]
    });

    mockProfileReportService.getProfileReportStats.mockResolvedValue({
      success: true,
      stats: {
        userId: 'user1',
        reportsMade: 2,
        reportsReceived: 1,
        recentReports: 0,
        isBlocked: false
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
    mockProfileReportService.getPendingProfileReports.mockResolvedValue({
      success: false,
      error: 'Error al cargar reportes'
    });

    render(<ProfileReportsPanel />);
    
    // El componente debería manejar el error gracefully
    expect(mockProfileReportService.getPendingProfileReports).toHaveBeenCalled();
  });

  it('debería llamar a los servicios correctos al montar', () => {
    render(<ProfileReportsPanel />);
    
    expect(mockProfileReportService.getPendingProfileReports).toHaveBeenCalled();
  });

  it('debería renderizar iconos correctamente', () => {
    render(<ProfileReportsPanel />);
    
    // Los iconos deberían estar presentes en el DOM
    expect(screen.getByTestId('alert-triangle')).toBeInTheDocument();
  });
});
