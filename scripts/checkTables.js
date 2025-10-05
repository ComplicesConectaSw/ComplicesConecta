// checkTables.js - Script para verificar tablas de Supabase

// 🔹 Tablas que deberían existir según tus reportes y auditorías
const expectedTables = [
  "profiles",
  "messages", 
  "invitations",
  "roles",
  "profile_cache",
  "staking",
  "tokens",
  "sessions",
  "auth",
  "content_moderation",
  "reports",
  "audit_logs",
  "security"
]

// 🔹 Simulación de tablas detectadas (necesitarías conectar a Supabase real)
const actualTables = [
  "profiles",
  "messages",
  "invitations", 
  "audit_logs",
  "reports"
]

const missing = expectedTables.filter(t => !actualTables.includes(t))
const extra = actualTables.filter(t => !expectedTables.includes(t))

console.log("📊 Auditoría de Tablas - ComplicesConecta\n")

console.log("✅ Tablas encontradas:")
actualTables.forEach(t => console.log("  •", t))

console.log("\n❌ Tablas faltantes según auditoría:")
if (missing.length > 0) {
  missing.forEach(t => console.log("  •", t))
} else {
  console.log("  (Ninguna 🎉)")
}

console.log("\n⚠️ Tablas extra detectadas (no esperadas):")
if (extra.length > 0) {
  extra.forEach(t => console.log("  •", t))
} else {
  console.log("  (Ninguna)")
}

console.log(`\n📈 Resumen:`)
console.log(`   • Tablas encontradas: ${actualTables.length}`)
console.log(`   • Tablas faltantes: ${missing.length}`)
console.log(`   • Cobertura: ${Math.round((actualTables.length / expectedTables.length) * 100)}%`)
