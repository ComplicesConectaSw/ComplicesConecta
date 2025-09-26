-- ==========================================
-- Crear perfiles demo para testing (usando campos que existen en la tabla profiles)
-- Nota: user_id debe ser proporcionado desde auth.users, estos son ejemplos con UUIDs ficticios
-- Los valores válidos para account_type son: 'single', 'couple', 'group'
INSERT INTO profiles (user_id, name, bio, age, gender, interested_in, account_type, is_verified, personality_traits, lifestyle_preferences, location_preferences) VALUES 
('11111111-1111-1111-1111-111111111111', 'Usuario Demo', 'Perfil de demostración para testing', 28, 'Mujer', 'Hombre', 'single', true, '{"openness": 75, "conscientiousness": 65, "extraversion": 80}', '{"activity_level": "moderate", "social_preference": "balanced"}', '{"max_distance": 50}'),
('22222222-2222-2222-2222-222222222222', 'Administrador Demo', 'Perfil administrador para testing', 35, 'Hombre', 'Mujer', 'single', true, '{"openness": 85, "conscientiousness": 90, "extraversion": 70}', '{"activity_level": "high", "social_preference": "outgoing"}', '{"max_distance": 100}'),
('33333333-3333-3333-3333-333333333333', 'Moderador Demo', 'Perfil moderador para testing', 30, 'No binario', 'Todos', 'couple', true, '{"openness": 80, "conscientiousness": 85, "extraversion": 60}', '{"activity_level": "moderate", "social_preference": "selective"}', '{"max_distance": 75}');

INSERT INTO automation_rules (
    name, 
    description, 
    trigger, 
    conditions, 
    actions, 
    enabled, 
    priority
) VALUES
(
    'Bienvenida Nuevos Usuarios', 
    'Envía mensaje de bienvenida a usuarios recién registrados', 
    'event_based', 
    '{"event": "user_signup"}', 
    '{"type": "notification", "template": "welcome"}', 
    true, 
    1
),
(
    'Notificación Nuevo Match', 
    'Notifica cuando se crea un nuevo match', 
    'event_based', 
    '{"event": "match_created"}', 
    '{"type": "notification", "template": "new_match"}', 
    true, 
    2
),
(
    'Recordatorio Usuarios Inactivos', 
    'Recuerda a usuarios inactivos que regresen', 
    'time_based', 
    '{"schedule": "weekly", "inactivity_days": 7}', 
    '{"type": "notification", "template": "comeback"}', 
    true, 
    3
);
