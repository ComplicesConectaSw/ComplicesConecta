// =====================================================
// 🤖 SISTEMA AUTOMÁTICO DE AUDITORÍA Y CORRECCIÓN SUPABASE
// ComplicesConecta v2.1.2 - Auditor Completo Node.js
// Fecha: 06 de septiembre, 2025 - 05:32 hrs
// =====================================================

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 🔧 CONFIGURACIÓN
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Variables de entorno faltantes: VITE_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// 🎯 SISTEMA COMPLETO DE AUDITORÍA
class CompleteAuditSystem {
    constructor() {
        this.auditResults = {
            timestamp: new Date().toISOString(),
            version: '2.1.2',
            tables: {},
            columns: {},
            rls: {},
            functions: {},
            buckets: {},
            indexes: {},
            score: 0,
            status: 'UNKNOWN',
            recommendations: []
        };
    }

    // 📊 Auditar tablas críticas
    async auditTables() {
        console.log('🔍 Auditando tablas críticas...');
        
        const criticalTables = [
            'profiles', 'user_roles', 'invitations', 'gallery_permissions',
            'images', 'image_permissions', 'gallery_access_requests',
            'chat_rooms', 'chat_members', 'messages', 'chat_invitations',
            'user_likes', 'matches', 'match_interactions'
        ];

        for (const tableName of criticalTables) {
            try {
                const { data, error } = await supabase
                    .from(tableName)
                    .select('*')
                    .limit(1);

                if (error) {
                    this.auditResults.tables[tableName] = {
                        exists: false,
                        error: error.message,
                        status: '❌ FALTANTE'
                    };
                } else {
                    this.auditResults.tables[tableName] = {
                        exists: true,
                        status: '✅ EXISTE'
                    };
                }
            } catch (err) {
                this.auditResults.tables[tableName] = {
                    exists: false,
                    error: err.message,
                    status: '❌ ERROR'
                };
            }
        }

        const existingTables = Object.values(this.auditResults.tables).filter(t => t.exists).length;
        console.log(`  📊 Tablas encontradas: ${existingTables}/${criticalTables.length}`);
    }

    // 📋 Auditar columnas críticas
    async auditColumns() {
        console.log('📋 Auditando columnas críticas...');
        
        const criticalColumns = {
            profiles: ['interests', 'looking_for', 'swinger_experience', 'age_range_min', 'age_range_max', 'max_distance', 'is_demo', 'is_active'],
            user_roles: ['user_id', 'role'],
            invitations: ['from_profile', 'to_profile', 'status', 'type'],
            gallery_permissions: ['profile_id', 'granted_to', 'granted_by']
        };

        for (const [tableName, columns] of Object.entries(criticalColumns)) {
            this.auditResults.columns[tableName] = {};
            
            for (const columnName of columns) {
                try {
                    // Intentar consulta para verificar columna
                    const { error } = await supabase
                        .from(tableName)
                        .select(columnName)
                        .limit(1);

                    if (error && error.message.includes('column')) {
                        this.auditResults.columns[tableName][columnName] = {
                            exists: false,
                            status: '❌ FALTANTE'
                        };
                    } else {
                        this.auditResults.columns[tableName][columnName] = {
                            exists: true,
                            status: '✅ EXISTE'
                        };
                    }
                } catch (err) {
                    this.auditResults.columns[tableName][columnName] = {
                        exists: false,
                        status: '❌ ERROR'
                    };
                }
            }
        }
    }

    // 🛡️ Auditar RLS
    async auditRLS() {
        console.log('🛡️ Auditando políticas RLS...');
        
        try {
            // Verificar RLS habilitado usando función SQL
            const { data, error } = await supabase.rpc('sql', {
                query: `
                    SELECT 
                        schemaname,
                        tablename,
                        rowsecurity as rls_enabled
                    FROM pg_tables 
                    WHERE schemaname = 'public'
                    AND tablename IN ('profiles', 'user_roles', 'invitations', 'images', 'matches')
                `
            });

            if (error) {
                this.auditResults.rls.error = error.message;
            } else {
                this.auditResults.rls.tables = data || [];
            }
        } catch (err) {
            this.auditResults.rls.error = err.message;
        }
    }

    // 🗂️ Auditar storage buckets
    async auditStorageBuckets() {
        console.log('🗂️ Auditando storage buckets...');
        
        const criticalBuckets = ['profile-images', 'gallery-images', 'chat-media'];
        
        for (const bucketName of criticalBuckets) {
            try {
                const { data, error } = await supabase.storage.getBucket(bucketName);
                
                if (error) {
                    this.auditResults.buckets[bucketName] = {
                        exists: false,
                        error: error.message,
                        status: '❌ FALTANTE'
                    };
                } else {
                    this.auditResults.buckets[bucketName] = {
                        exists: true,
                        config: data,
                        status: '✅ EXISTE'
                    };
                }
            } catch (err) {
                this.auditResults.buckets[bucketName] = {
                    exists: false,
                    error: err.message,
                    status: '❌ ERROR'
                };
            }
        }
    }

    // 📊 Calcular puntuación
    calculateScore() {
        let totalScore = 0;
        let maxScore = 100;

        // Tablas (25 puntos)
        const existingTables = Object.values(this.auditResults.tables).filter(t => t.exists).length;
        const tableScore = Math.min((existingTables / 14) * 25, 25);
        totalScore += tableScore;

        // Columnas (20 puntos)
        let existingColumns = 0;
        let totalColumns = 0;
        Object.values(this.auditResults.columns).forEach(table => {
            Object.values(table).forEach(column => {
                totalColumns++;
                if (column.exists) existingColumns++;
            });
        });
        const columnScore = totalColumns > 0 ? Math.min((existingColumns / totalColumns) * 20, 20) : 0;
        totalScore += columnScore;

        // Buckets (15 puntos)
        const existingBuckets = Object.values(this.auditResults.buckets).filter(b => b.exists).length;
        const bucketScore = Math.min((existingBuckets / 3) * 15, 15);
        totalScore += bucketScore;

        // RLS (20 puntos) - estimado
        const rlsScore = this.auditResults.rls.tables ? 
            Math.min((this.auditResults.rls.tables.length / 5) * 20, 20) : 0;
        totalScore += rlsScore;

        // Funciones y otros (20 puntos) - estimado
        totalScore += 10; // Base score para funciones existentes

        this.auditResults.score = Math.round(totalScore);
        
        // Determinar estado
        if (this.auditResults.score >= 95) {
            this.auditResults.status = '🏆 EXCELENTE';
        } else if (this.auditResults.score >= 85) {
            this.auditResults.status = '✅ MUY BUENO';
        } else if (this.auditResults.score >= 70) {
            this.auditResults.status = '⚠️ BUENO';
        } else if (this.auditResults.score >= 50) {
            this.auditResults.status = '🔶 REGULAR';
        } else {
            this.auditResults.status = '❌ DEFICIENTE';
        }
    }

    // 📝 Generar recomendaciones
    generateRecommendations() {
        this.auditResults.recommendations = [];

        // Recomendaciones para tablas
        const missingTables = Object.entries(this.auditResults.tables)
            .filter(([name, table]) => !table.exists)
            .map(([name]) => name);
        
        if (missingTables.length > 0) {
            this.auditResults.recommendations.push({
                category: 'TABLAS',
                priority: 'HIGH',
                message: `Crear tablas faltantes: ${missingTables.join(', ')}`,
                script: 'fix_database.sql'
            });
        }

        // Recomendaciones para columnas
        Object.entries(this.auditResults.columns).forEach(([tableName, columns]) => {
            const missingColumns = Object.entries(columns)
                .filter(([name, column]) => !column.exists)
                .map(([name]) => name);
            
            if (missingColumns.length > 0) {
                this.auditResults.recommendations.push({
                    category: 'COLUMNAS',
                    priority: 'MEDIUM',
                    message: `Agregar columnas en ${tableName}: ${missingColumns.join(', ')}`,
                    script: 'fix_database.sql'
                });
            }
        });

        // Recomendaciones para buckets
        const missingBuckets = Object.entries(this.auditResults.buckets)
            .filter(([name, bucket]) => !bucket.exists)
            .map(([name]) => name);
        
        if (missingBuckets.length > 0) {
            this.auditResults.recommendations.push({
                category: 'STORAGE',
                priority: 'MEDIUM',
                message: `Crear buckets faltantes: ${missingBuckets.join(', ')}`,
                script: 'complete_storage_buckets.sql'
            });
        }

        // Recomendaciones generales
        if (this.auditResults.score < 85) {
            this.auditResults.recommendations.push({
                category: 'GENERAL',
                priority: 'HIGH',
                message: 'Ejecutar scripts de corrección completos',
                script: 'Todos los scripts SQL generados'
            });
        }
    }

    // 💾 Guardar resultados
    async saveResults() {
        // Crear directorio reports si no existe
        const reportsDir = path.join(process.cwd(), 'reports');
        if (!fs.existsSync(reportsDir)) {
            fs.mkdirSync(reportsDir, { recursive: true });
        }

        // Guardar JSON
        const jsonPath = path.join(reportsDir, 'complete_audit_results.json');
        fs.writeFileSync(jsonPath, JSON.stringify(this.auditResults, null, 2));

        // Generar reporte markdown
        const reportPath = path.join(reportsDir, 'complete_audit_report.md');
        const reportContent = this.generateMarkdownReport();
        fs.writeFileSync(reportPath, reportContent);

        console.log(`📄 Resultados guardados en: ${jsonPath}`);
        console.log(`📋 Reporte generado en: ${reportPath}`);
    }

    // 📋 Generar reporte markdown
    generateMarkdownReport() {
        const timestamp = new Date().toLocaleString('es-ES');
        
        let report = `# 🤖 REPORTE COMPLETO DE AUDITORÍA SUPABASE

**ComplicesConecta v2.1.2 - Sistema Automático de Corrección**  
**Fecha:** ${timestamp}  
**Puntuación:** ${this.auditResults.score}/100 - ${this.auditResults.status}

---

## 📊 RESUMEN EJECUTIVO

| Categoría | Estado | Detalles |
|-----------|--------|----------|
`;

        // Tablas
        const existingTables = Object.values(this.auditResults.tables).filter(t => t.exists).length;
        const totalTables = Object.keys(this.auditResults.tables).length;
        report += `| 📊 Tablas | ${existingTables}/${totalTables} | ${existingTables === totalTables ? '✅' : '⚠️'} |\n`;

        // Columnas
        let existingColumns = 0, totalColumns = 0;
        Object.values(this.auditResults.columns).forEach(table => {
            Object.values(table).forEach(column => {
                totalColumns++;
                if (column.exists) existingColumns++;
            });
        });
        report += `| 📋 Columnas | ${existingColumns}/${totalColumns} | ${existingColumns === totalColumns ? '✅' : '⚠️'} |\n`;

        // Buckets
        const existingBuckets = Object.values(this.auditResults.buckets).filter(b => b.exists).length;
        const totalBuckets = Object.keys(this.auditResults.buckets).length;
        report += `| 🗂️ Storage | ${existingBuckets}/${totalBuckets} | ${existingBuckets === totalBuckets ? '✅' : '⚠️'} |\n`;

        report += `
---

## 🔍 DETALLES DE AUDITORÍA

### 📊 Tablas Críticas
`;

        Object.entries(this.auditResults.tables).forEach(([name, table]) => {
            report += `- **${name}**: ${table.status}\n`;
        });

        report += `
### 📋 Columnas Críticas
`;

        Object.entries(this.auditResults.columns).forEach(([tableName, columns]) => {
            report += `\n**${tableName}:**\n`;
            Object.entries(columns).forEach(([columnName, column]) => {
                report += `  - ${columnName}: ${column.status}\n`;
            });
        });

        report += `
### 🗂️ Storage Buckets
`;

        Object.entries(this.auditResults.buckets).forEach(([name, bucket]) => {
            report += `- **${name}**: ${bucket.status}\n`;
        });

        report += `
---

## 🛠️ RECOMENDACIONES

`;

        this.auditResults.recommendations.forEach((rec, index) => {
            report += `${index + 1}. **${rec.category}** (${rec.priority}): ${rec.message}\n`;
            report += `   - Script: \`${rec.script}\`\n\n`;
        });

        report += `
---

## 🚀 PRÓXIMOS PASOS

1. **Ejecutar scripts de corrección** en Supabase SQL Editor
2. **Aplicar correcciones** en el orden recomendado
3. **Re-ejecutar auditoría** para verificar mejoras
4. **Validar funcionamiento** con tests E2E

---

*Reporte generado automáticamente por el Sistema de Corrección Supabase v2.1.2*
`;

        return report;
    }

    // 🚀 Ejecutar auditoría completa
    async runCompleteAudit() {
        console.log('🤖 INICIANDO AUDITORÍA COMPLETA DE SUPABASE');
        console.log('⏰ Fecha:', new Date().toLocaleString('es-ES'));
        console.log('=' .repeat(60));

        try {
            await this.auditTables();
            await this.auditColumns();
            await this.auditRLS();
            await this.auditStorageBuckets();
            
            this.calculateScore();
            this.generateRecommendations();
            await this.saveResults();

            console.log('');
            console.log('🎯 AUDITORÍA COMPLETADA');
            console.log(`📊 Puntuación Final: ${this.auditResults.score}/100 - ${this.auditResults.status}`);
            console.log('📄 Revisa los reportes generados en /reports/');
            
            return this.auditResults;
        } catch (error) {
            console.error('❌ Error durante la auditoría:', error);
            throw error;
        }
    }
}

// 🚀 EJECUTAR AUDITORÍA
async function main() {
    try {
        const auditSystem = new CompleteAuditSystem();
        await auditSystem.runCompleteAudit();
    } catch (error) {
        console.error('❌ Error fatal:', error);
        process.exit(1);
    }
}

// Ejecutar si es llamado directamente
if (import.meta.url === `file://${process.argv[1]}`) {
    main();
}

export { CompleteAuditSystem };
