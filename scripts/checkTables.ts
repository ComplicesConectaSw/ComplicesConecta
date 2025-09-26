// checkTables.ts
import { Database } from "./types"

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

// 🔹 Tablas detectadas en types.ts
type Tables = keyof Database["public"]["Tables"]
const actualTables: string[] = Object.keys(
  ({} as Database["public"]["Tables"])
)

// 🔹 Comparación
const missing = expectedTables.filter(t => !actualTables.includes(t))
const extra = actualTables.filter(t => !expectedTables.includes(t))

console.log("📊 Auditoría de Tablas - ComplicesConecta\n")

console.log("✅ Tablas encontradas en types.ts:")
actualTables.forEach(t => {
  console.log("  •", t)
})

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
