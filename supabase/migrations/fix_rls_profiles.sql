-- Solución para RLS bloqueando consultas en tabla profiles
-- Las políticas RLS están impidiendo que la aplicación lea los perfiles

-- OPCIÓN 1: Desactivar RLS temporalmente para testing
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- OPCIÓN 2: Crear política permisiva para usuarios autenticados
-- (Ejecutar solo si quieres mantener RLS habilitado)
/*
CREATE POLICY "Users can read their own profile" ON public.profiles
FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can read all profiles" ON public.profiles
FOR SELECT USING (true);
*/

-- Verificar que el perfil ahora es accesible
SELECT 
  id,
  first_name,
  last_name,
  display_name,
  role,
  email
FROM public.profiles 
WHERE id = '10b2fa75-5a62-4299-921c-9a1cc99c765b';
