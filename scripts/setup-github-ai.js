/**
 * Script de configuración para GitHub AI Models - ComplicesConecta
 * Configuración para DeepSeek-V3-0324 y otros modelos AI
 */

import ModelClient, { isUnexpected } from "@azure-rest/ai-inference";
import { AzureKeyCredential } from "@azure/core-auth";

// Configuración del token y endpoint
const token = process.env["GITHUB_TOKEN"] || "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";
const endpoint = "https://models.github.ai/inference";
const model = "deepseek/DeepSeek-V3-0324";

/**
 * Función principal para probar la conexión con GitHub AI
 */
export async function testGitHubAI() {
  console.log("🤖 Iniciando prueba de GitHub AI Models...");
  console.log(`📡 Endpoint: ${endpoint}`);
  console.log(`🧠 Modelo: ${model}`);

  try {
    const client = ModelClient(
      endpoint,
      new AzureKeyCredential(token),
    );

    const response = await client.path("/chat/completions").post({
      body: {
        messages: [
          { 
            role: "system", 
            content: "Eres un asistente especializado en desarrollo web y tecnología para ComplicesConecta." 
          },
          { 
            role: "user", 
            content: "¿Cuáles son las mejores prácticas para optimizar una aplicación React con Vite?" 
          }
        ],
        temperature: 0.7,
        top_p: 0.9,
        max_tokens: 500,
        model: model
      }
    });

    if (isUnexpected(response)) {
      throw new Error(`Error en la respuesta: ${response.body.error}`);
    }

    console.log("✅ Conexión exitosa con GitHub AI!");
    console.log("🎯 Respuesta del modelo:");
    console.log(response.body.choices[0].message.content);
    
    return {
      success: true,
      response: response.body.choices[0].message.content,
      usage: response.body.usage
    };

  } catch (error) {
    console.error("❌ Error al conectar con GitHub AI:", error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Función para generar sugerencias de código para ComplicesConecta
 */
export async function generateCodeSuggestions(prompt) {
  console.log("💡 Generando sugerencias de código...");

  try {
    const client = ModelClient(
      endpoint,
      new AzureKeyCredential(token),
    );

    const response = await client.path("/chat/completions").post({
      body: {
        messages: [
          { 
            role: "system", 
            content: `Eres un experto desarrollador trabajando en ComplicesConecta, una plataforma social moderna construida con React, TypeScript, Vite, Supabase y Tailwind CSS. 
            Proporciona código limpio, optimizado y siguiendo las mejores prácticas.` 
          },
          { 
            role: "user", 
            content: prompt 
          }
        ],
        temperature: 0.3,
        top_p: 0.8,
        max_tokens: 1000,
        model: model
      }
    });

    if (isUnexpected(response)) {
      throw new Error(`Error en la respuesta: ${response.body.error}`);
    }

    return {
      success: true,
      suggestion: response.body.choices[0].message.content,
      usage: response.body.usage
    };

  } catch (error) {
    console.error("❌ Error al generar sugerencias:", error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Función para validar la configuración
 */
export function validateConfiguration() {
  console.log("🔍 Validando configuración de GitHub AI...");
  
  const checks = {
    token: !!token,
    endpoint: !!endpoint,
    model: !!model,
    tokenFormat: token.startsWith('github_pat_')
  };

  console.log("📋 Resultados de validación:");
  console.log(`  ✅ Token presente: ${checks.token}`);
  console.log(`  ✅ Endpoint configurado: ${checks.endpoint}`);
  console.log(`  ✅ Modelo seleccionado: ${checks.model}`);
  console.log(`  ✅ Formato de token correcto: ${checks.tokenFormat}`);

  const isValid = Object.values(checks).every(check => check === true);
  
  if (isValid) {
    console.log("🎉 Configuración válida!");
  } else {
    console.log("⚠️ Hay problemas en la configuración.");
  }

  return { isValid, checks };
}

// Ejecutar si es llamado directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log("🚀 ComplicesConecta - GitHub AI Setup");
  console.log("=====================================");
  
  validateConfiguration();
  
  testGitHubAI()
    .then(result => {
      if (result.success) {
        console.log("\n🎯 Setup completado exitosamente!");
        console.log(`📊 Tokens utilizados: ${result.usage?.total_tokens || 'N/A'}`);
      } else {
        console.log("\n❌ Setup falló. Revisa la configuración.");
        process.exit(1);
      }
    })
    .catch(err => {
      console.error("💥 Error crítico:", err);
      process.exit(1);
    });
}