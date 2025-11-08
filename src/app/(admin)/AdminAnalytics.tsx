/**
 * =====================================================
 * ADMIN ANALYTICS PAGE
 * =====================================================
 * Página de análisis y monitoreo para administradores
 * Fecha: 2025-10-29
 * Versión: v3.4.1
 * =====================================================
 */

import React, { useEffect } from 'react';
import { AdminNav } from '@/components/AdminNav';
import { AnalyticsDashboard } from '@/components/admin/AnalyticsDashboard';
import { logger } from '@/lib/logger';
import { ChartBarIcon } from '@heroicons/react/24/outline';

export const AdminAnalytics: React.FC = () => {
  useEffect(() => {
    logger.info('📊 Admin Analytics page loaded');
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800">
      {/* Navegación del Admin */}
      <AdminNav userRole="admin" />

      {/* Contenido Principal */}
      <main className="pt-20 px-4 sm:px-6 lg:px-8 pb-12">
        <div className="max-w-7xl mx-auto">
          {/* Header de la Página */}
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-2">
              <ChartBarIcon className="h-10 w-10 text-blue-400" />
              <h1 className="text-4xl font-bold text-white">
                Analytics & Monitoring
              </h1>
            </div>
            <p className="text-gray-400 text-lg">
              Monitoreo en tiempo real de métricas de performance, errores y Web Vitals
            </p>
          </div>

          {/* Breadcrumbs */}
          <nav className="flex mb-6" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-3">
              <li className="inline-flex items-center">
                <a
                  href="/admin"
                  className="inline-flex items-center text-sm font-medium text-gray-400 hover:text-blue-400"
                >
                  Admin
                </a>
              </li>
              <li>
                <div className="flex items-center">
                  <svg
                    className="w-3 h-3 text-gray-400 mx-1"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 6 10"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="m1 9 4-4-4-4"
                    />
                  </svg>
                  <span className="ml-1 text-sm font-medium text-white md:ml-2">
                    Analytics
                  </span>
                </div>
              </li>
            </ol>
          </nav>

          {/* Dashboard de Analytics */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg border border-slate-700 shadow-xl">
            <AnalyticsDashboard />
          </div>

          {/* Información Adicional */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg border border-slate-700 p-6">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-blue-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-white">Performance</h3>
              </div>
              <p className="text-gray-400 text-sm">
                Monitoreo de tiempos de carga, interacción y uso de memoria en tiempo real.
              </p>
            </div>

            <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg border border-slate-700 p-6">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-red-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-white">Errores</h3>
              </div>
              <p className="text-gray-400 text-sm">
                Captura y categorización de errores con alertas configurables por severidad.
              </p>
            </div>

            <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg border border-slate-700 p-6">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-green-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-white">Web Vitals</h3>
              </div>
              <p className="text-gray-400 text-sm">
                Seguimiento de Core Web Vitals (LCP, FCP, FID, CLS, TTFB) según estándares de Google.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminAnalytics;

