-- Migración para corregir error de trigger duplicado
-- Fecha: 2025-09-04
-- Descripción: Elimina y recrea el trigger para evitar conflictos

-- Eliminar trigger existente si existe
DROP TRIGGER IF EXISTS update_user_token_balances_updated_at ON user_token_balances;

-- Recrear el trigger
CREATE TRIGGER update_user_token_balances_updated_at 
    BEFORE UPDATE ON user_token_balances 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
