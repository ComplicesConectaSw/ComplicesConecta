/* Actualizar función generate_referral_code para evitar duplicados */

-- Actualizar función con mejor lógica de unicidad
CREATE OR REPLACE FUNCTION generate_referral_code(user_uuid UUID)
RETURNS TEXT AS $$
DECLARE
    code TEXT;
    counter INTEGER := 0;
    base_code TEXT;
BEGIN
    -- Generar código base de 8 caracteres del UUID
    base_code := UPPER(SUBSTRING(REPLACE(user_uuid::TEXT, '-', ''), 1, 8));
    
    LOOP
        -- En la primera iteración usar el código base, después agregar sufijo
        IF counter = 0 THEN
            code := base_code;
        ELSE
            code := base_code || LPAD(counter::TEXT, 2, '0');
        END IF;
        
        -- Verificar si ya existe
        IF NOT EXISTS (SELECT 1 FROM user_tokens WHERE referral_code = code) THEN
            RETURN code;
        END IF;
        
        counter := counter + 1;
        IF counter > 99 THEN
            -- Si llegamos aquí, usar timestamp para garantizar unicidad
            code := base_code || TO_CHAR(NOW(), 'SSMS');
            IF NOT EXISTS (SELECT 1 FROM user_tokens WHERE referral_code = code) THEN
                RETURN code;
            END IF;
            RAISE EXCEPTION 'No se pudo generar código de referido único después de 99 intentos';
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;
