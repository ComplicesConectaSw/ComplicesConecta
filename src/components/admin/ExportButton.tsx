/**
 * =====================================================
 * EXPORT BUTTON COMPONENT
 * =====================================================
 * Componente para exportar datos del dashboard de analytics
 * Fecha: 2025-01-29
 * Versión: v3.4.1
 * =====================================================
 */

import React, { useState } from 'react';
import { Download, FileText, FileJson, FileSpreadsheet, Loader2 } from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/useToast';
import { exportReport, validateExportData, formatFileSize, getExportSize, type ExportData, type ExportOptions } from '@/utils/reportExport';
import { logger } from '@/lib/logger';

// =====================================================
// INTERFACES
// =====================================================

export interface ExportButtonProps {
  data: ExportData;
  disabled?: boolean;
  className?: string;
}

// =====================================================
// COMPONENT
// =====================================================

export const ExportButton: React.FC<ExportButtonProps> = ({ 
  data, 
  disabled = false,
  className = ''
}) => {
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);

  /**
   * Manejar exportación
   */
  const handleExport = async (format: 'csv' | 'json' | 'excel') => {
    try {
      setIsExporting(true);

      // Validar datos
      if (!validateExportData(data)) {
        toast({
          title: "Sin datos",
          description: "No hay datos disponibles para exportar",
          variant: "destructive",
        });
        return;
      }

      // Obtener tamaño estimado
      const estimatedSize = getExportSize(data);
      logger.info('Exporting data', { format, size: formatFileSize(estimatedSize) });

      // Preparar opciones
      const options: ExportOptions = {
        format,
        filename: `analytics-export-${new Date().toISOString().split('T')[0]}.${format === 'excel' ? 'xlsx' : format}`,
        includeMetadata: true
      };

      // Exportar
      exportReport(data, options);

      // Mostrar notificación de éxito
      toast({
        title: "✅ Exportación exitosa",
        description: `Archivo ${format.toUpperCase()} descargado correctamente (${formatFileSize(estimatedSize)})`,
      });

      logger.info('✅ Export completed successfully', { format });
    } catch (error) {
      logger.error('❌ Export failed:', { error: String(error) });
      
      toast({
        title: "Error al exportar",
        description: "No se pudo exportar el archivo. Por favor intenta de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled || isExporting}
          className={`${className} flex items-center gap-2`}
        >
          {isExporting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Exportando...</span>
            </>
          ) : (
            <>
              <Download className="h-4 w-4" />
              <span>Exportar</span>
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Formato de Exportación</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <DropdownMenuItem
          onClick={() => handleExport('csv')}
          disabled={isExporting}
          className="cursor-pointer"
        >
          <FileText className="mr-2 h-4 w-4" />
          <span>CSV (Excel Compatible)</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem
          onClick={() => handleExport('json')}
          disabled={isExporting}
          className="cursor-pointer"
        >
          <FileJson className="mr-2 h-4 w-4" />
          <span>JSON (Formato Técnico)</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem
          onClick={() => handleExport('excel')}
          disabled={isExporting}
          className="cursor-pointer"
        >
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          <span>Excel (XLSX)</span>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem disabled className="text-xs text-gray-500">
          {data.metrics?.length || 0} métricas · {data.alerts?.length || 0} alertas
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ExportButton;

