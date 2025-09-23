-- Migración corregida para estructura de mensajes existente
-- Fecha: 22/09/2025 20:52 hrs
-- Objetivo: Adaptar a la estructura real de la base de datos

-- 1. Verificar y crear tabla messages si no existe o modificarla
DO $$
BEGIN
    -- Verificar si la tabla messages existe
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'messages' AND table_schema = 'public') THEN
        -- La tabla existe, verificar y agregar columnas faltantes
        
        -- Agregar conversation_id si no existe
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'messages' AND column_name = 'conversation_id' AND table_schema = 'public') THEN
            ALTER TABLE public.messages ADD COLUMN conversation_id UUID;
        END IF;
        
        -- Agregar location_latitude si no existe
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'messages' AND column_name = 'location_latitude' AND table_schema = 'public') THEN
            ALTER TABLE public.messages ADD COLUMN location_latitude DECIMAL(10, 8);
        END IF;
        
        -- Agregar location_longitude si no existe
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'messages' AND column_name = 'location_longitude' AND table_schema = 'public') THEN
            ALTER TABLE public.messages ADD COLUMN location_longitude DECIMAL(11, 8);
        END IF;
        
        -- Agregar location_address si no existe
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'messages' AND column_name = 'location_address' AND table_schema = 'public') THEN
            ALTER TABLE public.messages ADD COLUMN location_address TEXT;
        END IF;
        
    ELSE
        -- La tabla no existe, crearla completa
        CREATE TABLE public.messages (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            conversation_id UUID NOT NULL,
            sender_id UUID NOT NULL,
            content TEXT NOT NULL,
            location_latitude DECIMAL(10, 8),
            location_longitude DECIMAL(11, 8),
            location_address TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
        );
    END IF;
END $$;

-- 2. Crear tabla conversations si no existe
CREATE TABLE IF NOT EXISTS public.conversations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    participant_1_id UUID NOT NULL,
    participant_2_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Crear índices si no existen
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at);

-- 4. Habilitar RLS si no está habilitado
DO $$
BEGIN
    -- Habilitar RLS en messages
    IF NOT EXISTS (
        SELECT 1 FROM pg_class c 
        JOIN pg_namespace n ON n.oid = c.relnamespace 
        WHERE c.relname = 'messages' AND n.nspname = 'public' AND c.relrowsecurity = true
    ) THEN
        ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
    END IF;
    
    -- Habilitar RLS en conversations
    IF NOT EXISTS (
        SELECT 1 FROM pg_class c 
        JOIN pg_namespace n ON n.oid = c.relnamespace 
        WHERE c.relname = 'conversations' AND n.nspname = 'public' AND c.relrowsecurity = true
    ) THEN
        ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- 5. Crear políticas RLS si no existen
DO $$
BEGIN
    -- Política para SELECT en messages
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'messages' AND policyname = 'Users can view messages in their conversations') THEN
        CREATE POLICY "Users can view messages in their conversations" ON public.messages
            FOR SELECT USING (
                EXISTS (
                    SELECT 1 FROM public.conversations 
                    WHERE conversations.id = messages.conversation_id 
                    AND (conversations.participant_1_id = auth.uid() OR conversations.participant_2_id = auth.uid())
                )
            );
    END IF;
    
    -- Política para INSERT en messages
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'messages' AND policyname = 'Users can insert messages in their conversations') THEN
        CREATE POLICY "Users can insert messages in their conversations" ON public.messages
            FOR INSERT WITH CHECK (
                sender_id = auth.uid() AND
                EXISTS (
                    SELECT 1 FROM public.conversations 
                    WHERE conversations.id = messages.conversation_id 
                    AND (conversations.participant_1_id = auth.uid() OR conversations.participant_2_id = auth.uid())
                )
            );
    END IF;
END $$;

-- 6. Crear función para updated_at si no existe
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 7. Crear triggers si no existen
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'handle_updated_at_messages') THEN
        CREATE TRIGGER handle_updated_at_messages
            BEFORE UPDATE ON public.messages
            FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'handle_updated_at_conversations') THEN
        CREATE TRIGGER handle_updated_at_conversations
            BEFORE UPDATE ON public.conversations
            FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
    END IF;
END $$;
