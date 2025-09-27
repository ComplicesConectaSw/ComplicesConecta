#!/usr/bin/env node
/**
 * ===========================================
 *  🧪 TEST DEBUGGER SCRIPT (E2E + Unit + Integration)
 * ===========================================
 *  Ejecuta los tests y captura errores con debugger + console.log
 *  Compatible con Jest, Vitest y Playwright
 *
 *  Uso:
 *   node debug-tests.js --runner=jest
 *   node debug-tests.js --runner=vitest
 *   node debug-tests.js --runner=playwright
 * ===========================================
 */

import { spawn } from "child_process";
import { platform } from "os";

// Obtener runner desde args o usar vitest por defecto
const args = process.argv.slice(2);
const runnerArg = args.find(arg => arg.startsWith("--runner="));
const runner = runnerArg ? runnerArg.split("=")[1] : "vitest";

let command, cmdArgs;
const isWindows = platform() === "win32";

switch (runner) {
  case "vitest":
    command = isWindows ? "npm.cmd" : "npm";
    cmdArgs = ["run", "test"];
    break;
  case "playwright":
    command = isWindows ? "npm.cmd" : "npm";
    cmdArgs = ["run", "test:e2e"];
    break;
  case "jest":
  default:
    command = isWindows ? "npm.cmd" : "npm";
    cmdArgs = ["test"];
    break;
}

console.log("===========================================");
console.log(`🚀 Ejecutando tests con runner: ${runner}`);
console.log(`📦 Comando: ${command} ${cmdArgs.join(" ")}`);
console.log("===========================================");

// Lanzar proceso hijo con debugger habilitado
const testProcess = spawn(command, cmdArgs, {
  stdio: ["inherit", "pipe", "pipe"],
  shell: isWindows,
  env: {
    ...process.env,
    NODE_OPTIONS: "--inspect-brk" // habilita debugger para VSCode/Chrome
  }
});

// Capturar stdout
testProcess.stdout.on("data", (data) => {
  const output = data.toString();
  console.log(output);

  // Detectar fallos en test
  if (/FAIL|Error|Exception|Rejected/i.test(output)) {
    console.log("⚠️ Error detectado:");
    console.log("────────────────────────────");
    console.log(output);
    console.log("────────────────────────────");
  }
});

// Capturar stderr
testProcess.stderr.on("data", (data) => {
  console.log("❌ STDERR:");
  console.log(data.toString());
});

// Cuando termine
testProcess.on("close", (code) => {
  if (code === 0) {
    console.log("✅ Todos los tests pasaron correctamente");
  } else {
    console.log(`❌ Algunos tests fallaron (código ${code})`);
    console.log("👉 Revisa arriba los logs para identificar el error.");
  }
});
