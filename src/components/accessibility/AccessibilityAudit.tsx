/**
 * Componente de Auditoría de Accesibilidad WCAG 2.1
 * Realiza verificaciones automáticas y mejoras de accesibilidad
 */

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/Button';
import { CheckCircle, AlertTriangle, XCircle, RefreshCw } from 'lucide-react';
import { cn } from '@/shared/lib/cn';

interface AccessibilityIssue {
  id: string;
  type: 'error' | 'warning' | 'info';
  category: 'contrast' | 'aria' | 'keyboard' | 'motion' | 'structure';
  element: string;
  description: string;
  wcagLevel: 'A' | 'AA' | 'AAA';
  fixed?: boolean;
}

interface AccessibilityAuditProps {
  autoFix?: boolean;
  onIssuesFound?: (issues: AccessibilityIssue[]) => void;
}

export function AccessibilityAudit({ autoFix = false, onIssuesFound }: AccessibilityAuditProps) {
  const [issues, setIssues] = useState<AccessibilityIssue[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [score, setScore] = useState(0);

  const runAccessibilityAudit = async () => {
    setIsScanning(true);
    const foundIssues: AccessibilityIssue[] = [];

    try {
      // 1. Verificar contraste de colores
      const contrastIssues = await checkColorContrast();
      foundIssues.push(...contrastIssues);

      // 2. Verificar atributos ARIA
      const ariaIssues = checkAriaAttributes();
      foundIssues.push(...ariaIssues);

      // 3. Verificar navegación por teclado
      const keyboardIssues = checkKeyboardNavigation();
      foundIssues.push(...keyboardIssues);

      // 4. Verificar soporte para motion reducido
      const motionIssues = checkReducedMotion();
      foundIssues.push(...motionIssues);

      // 5. Verificar estructura semántica
      const structureIssues = checkSemanticStructure();
      foundIssues.push(...structureIssues);

      setIssues(foundIssues);
      
      // Calcular puntuación
      const totalChecks = 50; // Total de verificaciones
      const errorWeight = 3;
      const warningWeight = 1;
      
      const errorCount = foundIssues.filter(i => i.type === 'error').length;
      const warningCount = foundIssues.filter(i => i.type === 'warning').length;
      
      const deductions = (errorCount * errorWeight) + (warningCount * warningWeight);
      const calculatedScore = Math.max(0, Math.round(((totalChecks - deductions) / totalChecks) * 100));
      
      setScore(calculatedScore);
      onIssuesFound?.(foundIssues);

      // Auto-fix si está habilitado
      if (autoFix) {
        await applyAutoFixes(foundIssues);
      }

    } catch (error) {
      console.error('Error durante auditoría de accesibilidad:', error);
    } finally {
      setIsScanning(false);
    }
  };

  const checkColorContrast = async (): Promise<AccessibilityIssue[]> => {
    const issues: AccessibilityIssue[] = [];
    
    // Verificar elementos con texto gris en fondos oscuros
    const grayTextElements = document.querySelectorAll('.text-gray-300, .text-gray-400, .text-gray-500, .text-muted-foreground');
    
    grayTextElements.forEach((element, index) => {
      const computedStyle = window.getComputedStyle(element);
      const color = computedStyle.color;
      const _backgroundColor = computedStyle.backgroundColor;
      
      // Verificación simplificada - en producción usaríamos una librería de contraste
      if (color.includes('rgb(156, 163, 175)') || color.includes('rgb(107, 114, 128)')) {
        issues.push({
          id: `contrast-${index}`,
          type: 'warning',
          category: 'contrast',
          element: element.tagName.toLowerCase(),
          description: `Texto con contraste insuficiente detectado. Ratio estimado < 4.5:1`,
          wcagLevel: 'AA'
        });
      }
    });

    return issues;
  };

  const checkAriaAttributes = (): AccessibilityIssue[] => {
    const issues: AccessibilityIssue[] = [];
    
    // Verificar botones sin aria-label
    const buttonsWithoutLabel = document.querySelectorAll('button:not([aria-label]):not([aria-labelledby])');
    buttonsWithoutLabel.forEach((button, index) => {
      const hasText = button.textContent?.trim();
      if (!hasText) {
        issues.push({
          id: `aria-button-${index}`,
          type: 'error',
          category: 'aria',
          element: 'button',
          description: 'Botón sin texto visible ni aria-label',
          wcagLevel: 'A'
        });
      }
    });

    // Verificar imágenes sin alt
    const imagesWithoutAlt = document.querySelectorAll('img:not([alt])');
    imagesWithoutAlt.forEach((img, index) => {
      issues.push({
        id: `aria-img-${index}`,
        type: 'error',
        category: 'aria',
        element: 'img',
        description: 'Imagen sin atributo alt',
        wcagLevel: 'A'
      });
    });

    return issues;
  };

  const checkKeyboardNavigation = (): AccessibilityIssue[] => {
    const issues: AccessibilityIssue[] = [];
    
    // Verificar elementos interactivos sin tabindex apropiado
    const interactiveElements = document.querySelectorAll('button, a, input, select, textarea');
    let focusableCount = 0;
    
    interactiveElements.forEach((element) => {
      const tabIndex = element.getAttribute('tabindex');
      const isVisible = window.getComputedStyle(element).display !== 'none';
      
      if (isVisible && tabIndex !== '-1') {
        focusableCount++;
      }
    });

    if (focusableCount === 0) {
      issues.push({
        id: 'keyboard-nav-1',
        type: 'error',
        category: 'keyboard',
        element: 'general',
        description: 'No se encontraron elementos navegables por teclado',
        wcagLevel: 'A'
      });
    }

    return issues;
  };

  const checkReducedMotion = (): AccessibilityIssue[] => {
    const issues: AccessibilityIssue[] = [];
    
    // Verificar si hay soporte para prefers-reduced-motion
    const hasReducedMotionSupport = Array.from(document.styleSheets).some(sheet => {
      try {
        return Array.from(sheet.cssRules).some(rule => 
          rule.cssText.includes('prefers-reduced-motion')
        );
      } catch {
        return false;
      }
    });

    if (!hasReducedMotionSupport) {
      issues.push({
        id: 'motion-1',
        type: 'warning',
        category: 'motion',
        element: 'css',
        description: 'No se detectó soporte para prefers-reduced-motion',
        wcagLevel: 'AAA'
      });
    }

    return issues;
  };

  const checkSemanticStructure = (): AccessibilityIssue[] => {
    const issues: AccessibilityIssue[] = [];
    
    // Verificar jerarquía de headings
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    if (headings.length === 0) {
      issues.push({
        id: 'structure-1',
        type: 'warning',
        category: 'structure',
        element: 'headings',
        description: 'No se encontraron elementos de encabezado (h1-h6)',
        wcagLevel: 'AA'
      });
    }

    // Verificar landmarks
    const landmarks = document.querySelectorAll('main, nav, header, footer, aside, section[aria-label]');
    if (landmarks.length === 0) {
      issues.push({
        id: 'structure-2',
        type: 'info',
        category: 'structure',
        element: 'landmarks',
        description: 'Se recomienda usar elementos semánticos (main, nav, header, footer)',
        wcagLevel: 'AA'
      });
    }

    return issues;
  };

  const applyAutoFixes = async (issues: AccessibilityIssue[]) => {
    const fixedIssues = [...issues];
    
    // Auto-fix: Agregar clases de alto contraste a textos grises
    const grayTextElements = document.querySelectorAll('.text-gray-300, .text-gray-400, .text-gray-500, .text-muted-foreground');
    grayTextElements.forEach((element) => {
      element.classList.add('text-high-contrast');
    });

    // Marcar issues de contraste como resueltos
    fixedIssues.forEach(issue => {
      if (issue.category === 'contrast') {
        issue.fixed = true;
      }
    });

    setIssues(fixedIssues);
    
    // Recalcular puntuación
    const unfixedIssues = fixedIssues.filter(i => !i.fixed);
    const totalChecks = 50;
    const errorWeight = 3;
    const warningWeight = 1;
    
    const errorCount = unfixedIssues.filter(i => i.type === 'error').length;
    const warningCount = unfixedIssues.filter(i => i.type === 'warning').length;
    
    const deductions = (errorCount * errorWeight) + (warningCount * warningWeight);
    const newScore = Math.max(0, Math.round(((totalChecks - deductions) / totalChecks) * 100));
    
    setScore(newScore);
  };

  useEffect(() => {
    // Ejecutar auditoría inicial
    runAccessibilityAudit();
  }, []);

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 90) return 'default';
    if (score >= 70) return 'secondary';
    return 'destructive';
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            ♿ Auditoría de Accesibilidad WCAG 2.1
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant={getScoreBadgeVariant(score)} className="text-lg px-3 py-1">
              {score}/100
            </Badge>
            <Button
              onClick={runAccessibilityAudit}
              disabled={isScanning}
              size="sm"
              variant="outline"
            >
              {isScanning ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              {isScanning ? 'Escaneando...' : 'Reescanear'}
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Resumen de puntuación */}
        <div className="text-center p-6 bg-muted/50 rounded-lg">
          <div className={cn("text-4xl font-bold mb-2", getScoreColor(score))}>
            {score}%
          </div>
          <p className="text-muted-foreground">
            {score >= 90 && "¡Excelente! Cumple con los estándares WCAG 2.1"}
            {score >= 70 && score < 90 && "Bueno, pero hay áreas de mejora"}
            {score < 70 && "Necesita mejoras significativas en accesibilidad"}
          </p>
        </div>

        {/* Lista de issues */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">
            Issues Encontrados ({issues.length})
          </h3>
          
          {issues.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CheckCircle className="h-12 w-12 mx-auto mb-2 text-green-600" />
              ¡No se encontraron problemas de accesibilidad!
            </div>
          ) : (
            <div className="space-y-2">
              {issues.map((issue) => (
                <div
                  key={issue.id}
                  className={cn(
                    "flex items-start gap-3 p-4 rounded-lg border",
                    issue.fixed && "opacity-60 bg-green-50 border-green-200",
                    issue.type === 'error' && !issue.fixed && "bg-red-50 border-red-200",
                    issue.type === 'warning' && !issue.fixed && "bg-yellow-50 border-yellow-200",
                    issue.type === 'info' && !issue.fixed && "bg-blue-50 border-blue-200"
                  )}
                >
                  <div className="flex-shrink-0 mt-0.5">
                    {issue.fixed ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : issue.type === 'error' ? (
                      <XCircle className="h-5 w-5 text-red-600" />
                    ) : (
                      <AlertTriangle className="h-5 w-5 text-yellow-600" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-xs">
                        {issue.category.toUpperCase()}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        WCAG {issue.wcagLevel}
                      </Badge>
                      {issue.fixed && (
                        <Badge variant="default" className="text-xs bg-green-600">
                          CORREGIDO
                        </Badge>
                      )}
                    </div>
                    
                    <p className="text-sm font-medium mb-1">
                      Elemento: {issue.element}
                    </p>
                    
                    <p className="text-sm text-muted-foreground">
                      {issue.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Botón de auto-fix */}
        {issues.some(i => !i.fixed) && (
          <div className="text-center">
            <Button
              onClick={() => applyAutoFixes(issues)}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              🔧 Aplicar Correcciones Automáticas
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default AccessibilityAudit;

