/**
 * =====================================================
 * REPORT EXPORT UTILITY
 * =====================================================
 * Utilidad para exportar reportes de analytics en múltiples formatos
 * Fecha: 2025-01-29
 * Versión: v3.4.1
 * =====================================================
 */

import type { PerformanceMetric, PerformanceReport } from '@/services/PerformanceMonitoringService';
import type { ErrorAlert } from '@/services/ErrorAlertService';
import { logger } from '@/lib/logger';

// =====================================================
// INTERFACES
// =====================================================

export interface ExportOptions {
  format: 'csv' | 'json' | 'excel';
  filename?: string;
  includeMetadata?: boolean;
}

export interface ExportData {
  metrics?: PerformanceMetric[];
  alerts?: ErrorAlert[];
  report?: PerformanceReport;
  metadata?: {
    exportDate: string;
    appVersion: string;
    totalRecords: number;
  };
}

// =====================================================
// EXPORT FUNCTIONS
// =====================================================

/**
 * Exportar datos a CSV
 */
export function exportToCSV(data: ExportData, options?: ExportOptions): void {
  try {
    const filename = options?.filename || `analytics-export-${new Date().toISOString().split('T')[0]}.csv`;
    let csvContent = '';

    // Exportar métricas
    if (data.metrics && data.metrics.length > 0) {
      csvContent += '### PERFORMANCE METRICS ###\n';
      csvContent += 'ID,Name,Value,Unit,Category,Timestamp\n';
      
      data.metrics.forEach(metric => {
        csvContent += `${metric.id},${metric.name},${metric.value},${metric.unit},${metric.category},${metric.timestamp}\n`;
      });
      
      csvContent += '\n';
    }

    // Exportar alertas
    if (data.alerts && data.alerts.length > 0) {
      csvContent += '### ERROR ALERTS ###\n';
      csvContent += 'ID,Severity,Category,Message,Resolved,Timestamp\n';
      
      data.alerts.forEach(alert => {
        const message = alert.message.replace(/,/g, ';').replace(/\n/g, ' ');
        csvContent += `${alert.id},${alert.severity},${alert.category},${message},${alert.resolved},${alert.timestamp}\n`;
      });
      
      csvContent += '\n';
    }

    // Agregar metadata si se solicita
    if (options?.includeMetadata && data.metadata) {
      csvContent += '### METADATA ###\n';
      csvContent += `Export Date,${data.metadata.exportDate}\n`;
      csvContent += `App Version,${data.metadata.appVersion}\n`;
      csvContent += `Total Records,${data.metadata.totalRecords}\n`;
    }

    // Crear y descargar archivo
    downloadFile(csvContent, filename, 'text/csv');
    
    logger.info('✅ CSV export completed', { filename, records: data.metrics?.length || 0 });
  } catch (error) {
    logger.error('❌ Error exporting to CSV:', { error: String(error) });
    throw new Error('Failed to export to CSV');
  }
}

/**
 * Exportar datos a JSON
 */
export function exportToJSON(data: ExportData, options?: ExportOptions): void {
  try {
    const filename = options?.filename || `analytics-export-${new Date().toISOString().split('T')[0]}.json`;
    
    const exportData = {
      ...data,
      metadata: {
        ...data.metadata,
        exportDate: new Date().toISOString(),
        appVersion: '3.4.1',
        format: 'json'
      }
    };

    const jsonContent = JSON.stringify(exportData, null, 2);
    
    // Crear y descargar archivo
    downloadFile(jsonContent, filename, 'application/json');
    
    logger.info('✅ JSON export completed', { filename, size: `${(jsonContent.length / 1024).toFixed(2)} KB` });
  } catch (error) {
    logger.error('❌ Error exporting to JSON:', { error: String(error) });
    throw new Error('Failed to export to JSON');
  }
}

/**
 * Exportar datos a Excel (CSV con formato Excel)
 */
export function exportToExcel(data: ExportData, options?: ExportOptions): void {
  try {
    const filename = options?.filename || `analytics-export-${new Date().toISOString().split('T')[0]}.xlsx`;
    
    // Por ahora, usamos CSV con formato compatible con Excel
    // En el futuro se puede agregar librería como xlsx para formato nativo
    let excelContent = '\uFEFF'; // BOM for Excel UTF-8 detection
    
    // Hoja 1: Métricas de Performance
    if (data.metrics && data.metrics.length > 0) {
      excelContent += 'Performance Metrics\n';
      excelContent += 'ID\tName\tValue\tUnit\tCategory\tTimestamp\n';
      
      data.metrics.forEach(metric => {
        excelContent += `${metric.id}\t${metric.name}\t${metric.value}\t${metric.unit}\t${metric.category}\t${metric.timestamp}\n`;
      });
      
      excelContent += '\n\n';
    }

    // Hoja 2: Alertas de Errores
    if (data.alerts && data.alerts.length > 0) {
      excelContent += 'Error Alerts\n';
      excelContent += 'ID\tSeverity\tCategory\tMessage\tResolved\tTimestamp\n';
      
      data.alerts.forEach(alert => {
        const message = alert.message.replace(/\t/g, ' ').replace(/\n/g, ' ');
        excelContent += `${alert.id}\t${alert.severity}\t${alert.category}\t${message}\t${alert.resolved}\t${alert.timestamp}\n`;
      });
      
      excelContent += '\n\n';
    }

    // Hoja 3: Resumen
    if (data.report) {
      excelContent += 'Summary Report\n';
      excelContent += 'Metric\tValue\n';
      excelContent += `Period\t${data.report.period}\n`;
      excelContent += `Total Metrics\t${data.report.metrics.length}\n`;
      excelContent += `Avg Load Time\t${data.report.summary.avgLoadTime}ms\n`;
      excelContent += `Avg Interaction Time\t${data.report.summary.avgInteractionTime}ms\n`;
      excelContent += `Total Requests\t${data.report.summary.totalRequests}\n`;
      excelContent += `Failed Requests\t${data.report.summary.failedRequests}\n`;
      excelContent += `Memory Usage\t${data.report.summary.memoryUsage}MB\n`;
    }

    // Crear y descargar archivo
    downloadFile(excelContent, filename, 'application/vnd.ms-excel');
    
    logger.info('✅ Excel export completed', { filename });
  } catch (error) {
    logger.error('❌ Error exporting to Excel:', { error: String(error) });
    throw new Error('Failed to export to Excel');
  }
}

/**
 * Función genérica de exportación
 */
export function exportReport(data: ExportData, options: ExportOptions): void {
  switch (options.format) {
    case 'csv':
      exportToCSV(data, options);
      break;
    case 'json':
      exportToJSON(data, options);
      break;
    case 'excel':
      exportToExcel(data, options);
      break;
    default:
      throw new Error(`Unsupported export format: ${options.format}`);
  }
}

/**
 * Crear y descargar archivo
 */
function downloadFile(content: string, filename: string, mimeType: string): void {
  try {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a') as HTMLAnchorElement;
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    
    document.body.appendChild(link as Node);
    link.click();
    
    // Cleanup
    document.body.removeChild(link as Node);
    URL.revokeObjectURL(url);
    
    logger.debug('File downloaded successfully', { filename });
  } catch (error) {
    logger.error('Error downloading file:', { error: String(error) });
    throw new Error('Failed to download file');
  }
}

/**
 * Validar datos antes de exportar
 */
export function validateExportData(data: ExportData): boolean {
  if (!data.metrics && !data.alerts && !data.report) {
    logger.warn('No data to export');
    return false;
  }
  
  return true;
}

/**
 * Obtener tamaño estimado del export
 */
export function getExportSize(data: ExportData): number {
  const jsonString = JSON.stringify(data);
  return jsonString.length;
}

/**
 * Formatear tamaño de archivo
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

