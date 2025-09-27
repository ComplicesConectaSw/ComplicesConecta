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

const { spawn } = require("child_process");

// Obtener runner desde args o usar jest por defecto
const args = process.argv.slice(2);
const runnerArg = args.find(arg => arg.startsWith("--runner="));
const runner = runnerArg ? runnerArg.split("=")[1] : "jest";

let command, cmdArgs;

switch (runner) {
  case "vitest":
    command = "npx";
    cmdArgs = ["vitest", "run", "--reporter=verbose"];
    break;
  case "playwright":
    command = "npx";
    cmdArgs = ["playwright", "test", "--reporter=list"];
    break;
  case "jest":
  default:
    command = "npx";
    cmdArgs = ["jest", "--runInBand", "--detectOpenHandles", "--verbose"];
    break;
}

console.log("===========================================");
console.log(`🚀 Ejecutando tests con runner: ${runner}`);
console.log("===========================================");

// Lanzar proceso hijo con debugger habilitado
const testProcess = spawn(command, cmdArgs, {
  stdio: ["inherit", "pipe", "pipe"],
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
