import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error?: Error; resetError: () => void }>;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // CRÍTICO: Ignorar errores de wallet que no deberían bloquear la aplicación
    const errorMessage = error?.message || '';
    const errorStack = error?.stack || '';
    const isWalletError = 
      errorMessage.includes('solana') ||
      errorMessage.includes('ethereum') ||
      errorMessage.includes('wallet') ||
      errorMessage.includes('Cannot redefine property') ||
      errorMessage.includes('Cannot assign to read only property') ||
      errorStack.includes('solana.js') ||
      errorStack.includes('inpage.js') ||
      errorStack.includes('evmAsk.js');
    
    if (isWalletError) {
      // No establecer hasError para errores de wallet
      return { hasError: false };
    }
    
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // CRÍTICO: Ignorar errores de wallet que no deberían bloquear la aplicación
    const errorMessage = error?.message || '';
    const errorStack = error?.stack || '';
    const isWalletError = 
      errorMessage.includes('solana') ||
      errorMessage.includes('ethereum') ||
      errorMessage.includes('wallet') ||
      errorMessage.includes('Cannot redefine property') ||
      errorMessage.includes('Cannot assign to read only property') ||
      errorStack.includes('solana.js') ||
      errorStack.includes('inpage.js') ||
      errorStack.includes('evmAsk.js');
    
    if (isWalletError) {
      console.warn('⚠️ Error de wallet ignorado por ErrorBoundary:', error);
      // No actualizar el estado para errores de wallet
      return;
    }
    
    console.error('🚨 Error capturado por ErrorBoundary:', error);
    console.error('📍 Información del error:', errorInfo);
    
    this.setState({
      error,
      errorInfo
    });
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return <FallbackComponent error={this.state.error} resetError={this.resetError} />;
      }

      return (
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
          <Card className="w-full max-w-md mx-auto bg-white/10 backdrop-blur-md border-white/20">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="w-8 h-8 text-red-400" />
              </div>
              <CardTitle className="text-white text-xl">
                ¡Oops! Algo salió mal
              </CardTitle>
              <CardDescription className="text-white/70">
                La aplicación encontró un error inesperado. Esto puede deberse a conflictos con extensiones del navegador.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                <p className="text-red-300 text-sm font-mono">
                  {this.state.error?.message || 'Error desconocido'}
                </p>
              </div>
              
              <div className="text-white/60 text-xs space-y-1">
                <p>💡 <strong>Posibles soluciones:</strong></p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Desactiva extensiones de wallets (MetaMask, TronLink, etc.)</li>
                  <li>Prueba en modo incógnito</li>
                  <li>Actualiza tu navegador</li>
                  <li>Limpia la caché del navegador</li>
                </ul>
              </div>

              <div className="flex gap-2 pt-2">
                <Button 
                  onClick={this.resetError}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Reintentar
                </Button>
                <Button 
                  onClick={() => window.location.href = '/'}
                  variant="outline"
                  className="flex-1 border-white/20 text-white hover:bg-white/10"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Inicio
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

