-- Migración para corregir tabla messages y tipos TypeScript
-- Fecha: 22/09/2025 20:48 hrs
-- Objetivo: Eliminar datos simulados y crear estructura real

-- 1. Verificar si la tabla messages existe y crearla si no existe
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    conversation_id UUID NOT NULL,
    sender_id UUID NOT NULL,
    content TEXT NOT NULL,
    location_latitude DECIMAL(10, 8) NULL,
    location_longitude DECIMAL(11, 8) NULL,
    location_address TEXT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Crear índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at);

-- 3. Crear tabla conversations si no existe
CREATE TABLE IF NOT EXISTS public.conversations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    participant_1_id UUID NOT NULL,
    participant_2_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(participant_1_id, participant_2_id)
);

-- 4. Crear índices para conversations
CREATE INDEX IF NOT EXISTS idx_conversations_participant_1 ON public.conversations(participant_1_id);
CREATE INDEX IF NOT EXISTS idx_conversations_participant_2 ON public.conversations(participant_2_id);

-- 5. Habilitar RLS (Row Level Security)
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

-- 6. Crear políticas RLS para messages
CREATE POLICY "Users can view messages in their conversations" ON public.messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.conversations 
            WHERE conversations.id = messages.conversation_id 
            AND (conversations.participant_1_id = auth.uid() OR conversations.participant_2_id = auth.uid())
        )
    );

CREATE POLICY "Users can insert messages in their conversations" ON public.messages
    FOR INSERT WITH CHECK (
        sender_id = auth.uid() AND
        EXISTS (
            SELECT 1 FROM public.conversations 
            WHERE conversations.id = messages.conversation_id 
            AND (conversations.participant_1_id = auth.uid() OR conversations.participant_2_id = auth.uid())
        )
    );

-- 7. Crear políticas RLS para conversations
CREATE POLICY "Users can view their conversations" ON public.conversations
    FOR SELECT USING (
        participant_1_id = auth.uid() OR participant_2_id = auth.uid()
    );

CREATE POLICY "Users can create conversations" ON public.conversations
    FOR INSERT WITH CHECK (
        participant_1_id = auth.uid() OR participant_2_id = auth.uid()
    );

-- 8. Crear función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 9. Crear triggers para updated_at
CREATE TRIGGER handle_updated_at_messages
    BEFORE UPDATE ON public.messages
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at_conversations
    BEFORE UPDATE ON public.conversations
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 10. Insertar datos de prueba básicos (solo si no existen)
DO $$
BEGIN
    -- Solo insertar si no hay conversaciones existentes
    IF NOT EXISTS (SELECT 1 FROM public.conversations LIMIT 1) THEN
        -- Crear una conversación de ejemplo (requiere usuarios existentes)
        INSERT INTO public.conversations (id, participant_1_id, participant_2_id)
        SELECT 
            gen_random_uuid(),
            (SELECT id FROM auth.users LIMIT 1),
            (SELECT id FROM auth.users OFFSET 1 LIMIT 1)
        WHERE (SELECT COUNT(*) FROM auth.users) >= 2;
    END IF;
END $$;

-- 11. Comentarios para documentación
COMMENT ON TABLE public.messages IS 'Tabla de mensajes del chat con soporte para ubicación';
COMMENT ON TABLE public.conversations IS 'Tabla de conversaciones entre usuarios';
COMMENT ON COLUMN public.messages.location_latitude IS 'Latitud de ubicación compartida (opcional)';
COMMENT ON COLUMN public.messages.location_longitude IS 'Longitud de ubicación compartida (opcional)';
COMMENT ON COLUMN public.messages.location_address IS 'Dirección legible de ubicación (opcional)';
