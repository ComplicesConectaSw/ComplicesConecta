-- Seed data para ComplicesConecta
-- Fecha: 2025-09-25
-- Descripción: Datos iniciales para roles básicos y configuración

-- Poblar tabla roles con roles básicos
INSERT INTO roles (name, description, permissions) VALUES 
('user', 'Usuario básico del sistema', '{"read": true, "write_own": true}'),
('moderator', 'Moderador de contenido', '{"read": true, "write": true, "moderate": true}'),
('admin', 'Administrador del sistema', '{"read": true, "write": true, "moderate": true, "admin": true}')
ON CONFLICT (name) DO NOTHING;

-- Crear usuario demo para testing
INSERT INTO profiles (email, username, full_name, role, is_verified) VALUES 
('demo@complicesconecta.com', 'demo_user', 'Usuario Demo', 'user', true),
('admin@complicesconecta.com', 'admin_user', 'Administrador Demo', 'admin', true),
('moderator@complicesconecta.com', 'mod_user', 'Moderador Demo', 'moderator', true)
ON CONFLICT (email) DO NOTHING;
