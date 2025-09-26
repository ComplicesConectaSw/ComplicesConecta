

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE EXTENSION IF NOT EXISTS "pg_net" WITH SCHEMA "extensions";






COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgjwt" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE TYPE "public"."relationship_type" AS ENUM (
    'man-woman',
    'man-man',
    'woman-woman'
);


ALTER TYPE "public"."relationship_type" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."audit_suspicious_transactions"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    -- Alertar sobre transacciones grandes
    IF ABS(NEW.amount) > 1000 THEN
        -- Log de auditoría simple (sin tabla audit_logs por ahora)
        RAISE NOTICE 'Transacción grande detectada: % tokens para usuario %', NEW.amount, NEW.user_id;
    END IF;
    
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."audit_suspicious_transactions"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."claim_world_id_reward"("user_id_param" "uuid") RETURNS "jsonb"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    user_tokens RECORD;
    world_id_amount INTEGER := 100;
BEGIN
    -- Obtener datos del usuario
    SELECT * INTO user_tokens FROM public.user_tokens WHERE user_id = user_id_param;
    
    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'success', false,
            'message', 'Usuario no encontrado'
        );
    END IF;
    
    -- Verificar si ya reclamó
    IF user_tokens.world_id_claimed THEN
        RETURN jsonb_build_object(
            'success', false,
            'message', 'Ya has reclamado tu recompensa de World ID'
        );
    END IF;
    
    -- Verificar límite mensual
    IF (user_tokens.monthly_earned + world_id_amount) > user_tokens.monthly_limit THEN
        RETURN jsonb_build_object(
            'success', false,
            'message', 'Límite mensual alcanzado (' || user_tokens.monthly_limit || ' CMPX)'
        );
    END IF;
    
    -- Actualizar tokens
    UPDATE public.user_tokens 
    SET 
        cmpx_balance = cmpx_balance + world_id_amount,
        monthly_earned = monthly_earned + world_id_amount,
        world_id_claimed = true,
        updated_at = NOW()
    WHERE user_id = user_id_param;
    
    -- Registrar transacción
    INSERT INTO public.transactions (
        user_id, transaction_type, token_type, amount,
        balance_before, balance_after, description
    ) VALUES (
        user_id_param, 'world_id_bonus', 'CMPX', world_id_amount,
        user_tokens.cmpx_balance, user_tokens.cmpx_balance + world_id_amount,
        'Recompensa por verificación World ID'
    );
    
    RETURN jsonb_build_object(
        'success', true,
        'message', 'Recompensa de World ID reclamada: ' || world_id_amount || ' CMPX',
        'amount', world_id_amount,
        'new_balance', user_tokens.cmpx_balance + world_id_amount
    );
END;
$$;


ALTER FUNCTION "public"."claim_world_id_reward"("user_id_param" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."complete_staking"("staking_id_param" "uuid") RETURNS "jsonb"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    staking_record RECORD;
    reward_amount INTEGER;
    total_return INTEGER;
BEGIN
    -- Obtener registro de staking
    SELECT * INTO staking_record 
    FROM public.user_staking 
    WHERE id = staking_id_param AND status = 'active';
    
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'message', 'Staking no encontrado o ya completado');
    END IF;
    
    -- Verificar si ya terminó el período
    IF NOW() < staking_record.end_date THEN
        RETURN jsonb_build_object(
            'success', false, 
            'message', 'El staking termina el ' || staking_record.end_date::DATE
        );
    END IF;
    
    -- Calcular recompensa
    reward_amount := ROUND(staking_record.amount * staking_record.reward_percentage / 100);
    total_return := staking_record.amount + reward_amount;
    
    -- Actualizar balance del usuario
    UPDATE public.user_tokens 
    SET 
        cmpx_balance = cmpx_balance + total_return,
        cmpx_staked = cmpx_staked - staking_record.amount,
        updated_at = NOW()
    WHERE user_id = staking_record.user_id;
    
    -- Marcar staking como completado
    UPDATE public.user_staking 
    SET 
        status = 'completed',
        reward_claimed = true
    WHERE id = staking_id_param;
    
    -- Registrar transacciones
    INSERT INTO public.transactions (
        user_id, transaction_type, token_type, amount,
        balance_before, balance_after, description
    ) 
    SELECT 
        staking_record.user_id, 'unstake_tokens', 'CMPX', staking_record.amount,
        ut.cmpx_balance - total_return, ut.cmpx_balance - reward_amount,
        'Recuperación de tokens en staking'
    FROM public.user_tokens ut WHERE ut.user_id = staking_record.user_id;
    
    INSERT INTO public.transactions (
        user_id, transaction_type, token_type, amount,
        balance_before, balance_after, description
    ) 
    SELECT 
        staking_record.user_id, 'staking_reward', 'CMPX', reward_amount,
        ut.cmpx_balance - reward_amount, ut.cmpx_balance,
        'Recompensa por staking (' || staking_record.reward_percentage || '%)'
    FROM public.user_tokens ut WHERE ut.user_id = staking_record.user_id;
    
    RETURN jsonb_build_object(
        'success', true,
        'message', 'Staking completado. Recuperaste ' || staking_record.amount || ' CMPX + ' || reward_amount || ' CMPX de recompensa',
        'original_amount', staking_record.amount,
        'reward_amount', reward_amount,
        'total_return', total_return
    );
END;
$$;


ALTER FUNCTION "public"."complete_staking"("staking_id_param" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_notification"("notification_type" "text", "title" "text", "body" "text", "user_id" "uuid", "data" "jsonb" DEFAULT '{}'::"jsonb") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    result JSONB;
BEGIN
    INSERT INTO notification_history (
        notification_type,
        title,
        body,
        user_id,
        data,
        delivery_method,
        status
    ) VALUES (
        notification_type,
        title,
        body,
        user_id,
        data,
        'push',
        'pending'
    );
    
    result := jsonb_build_object(
        'success', true,
        'message', 'Notificación creada exitosamente'
    );
    
    RETURN result;
EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object(
        'success', false,
        'error', SQLERRM
    );
END;
$$;


ALTER FUNCTION "public"."create_notification"("notification_type" "text", "title" "text", "body" "text", "user_id" "uuid", "data" "jsonb") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_post"("p_user_id" "uuid", "p_profile_id" "uuid", "p_content" "text", "p_post_type" "text" DEFAULT 'text'::"text") RETURNS "json"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    new_post_id UUID;
    result JSON;
BEGIN
    INSERT INTO public.posts (user_id, profile_id, content, post_type)
    VALUES (p_user_id, p_profile_id, p_content, p_post_type)
    RETURNING id INTO new_post_id;
    
    SELECT json_build_object(
        'id', p.id,
        'user_id', p.user_id,
        'content', p.content,
        'post_type', p.post_type,
        'likes_count', p.likes_count,
        'created_at', p.created_at
    ) INTO result
    FROM public.posts p
    WHERE p.id = new_post_id;
    
    RETURN result;
END;
$$;


ALTER FUNCTION "public"."create_post"("p_user_id" "uuid", "p_profile_id" "uuid", "p_content" "text", "p_post_type" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_post"("p_user_id" "uuid", "p_profile_id" "uuid", "p_content" "text", "p_post_type" "text" DEFAULT 'text'::"text", "p_image_url" "text" DEFAULT NULL::"text", "p_video_url" "text" DEFAULT NULL::"text", "p_location" "text" DEFAULT NULL::"text") RETURNS TABLE("id" "uuid", "user_id" "uuid", "profile_id" "uuid", "content" "text", "post_type" "text", "image_url" "text", "video_url" "text", "location" "text", "likes_count" integer, "comments_count" integer, "shares_count" integer, "created_at" timestamp with time zone, "updated_at" timestamp with time zone, "profile_name" "text", "profile_avatar" "text", "is_verified" boolean)
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
    DECLARE
        new_post_id UUID;
    BEGIN
        INSERT INTO public.posts (
            user_id, profile_id, content, post_type, 
            image_url, video_url, location
        ) VALUES (
            p_user_id, p_profile_id, p_content, p_post_type,
            p_image_url, p_video_url, p_location
        ) RETURNING posts.id INTO new_post_id;

        RETURN QUERY
        SELECT 
            p.id,
            p.user_id,
            p.profile_id,
            p.content,
            p.post_type,
            p.image_url,
            p.video_url,
            p.location,
            p.likes_count,
            p.comments_count,
            p.shares_count,
            p.created_at,
            p.updated_at,
            pr.first_name as profile_name,
            pr.avatar_url as profile_avatar,
            pr.is_verified
        FROM public.posts p
        LEFT JOIN public.profiles pr ON p.profile_id = pr.id
        WHERE p.id = new_post_id;
    END;
    $$;


ALTER FUNCTION "public"."create_post"("p_user_id" "uuid", "p_profile_id" "uuid", "p_content" "text", "p_post_type" "text", "p_image_url" "text", "p_video_url" "text", "p_location" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_user_tokens"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    INSERT INTO public.user_tokens (
        user_id,
        referral_code,
        cmpx_balance,
        gtk_balance
    ) VALUES (
        NEW.id,
        generate_referral_code(NEW.id),
        0,
        0
    );
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."create_user_tokens"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."generate_referral_code"("user_uuid" "uuid") RETURNS "text"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    code TEXT;
    counter INTEGER := 0;
BEGIN
    LOOP
        -- Generar código basado en UUID + contador
        code := 'CMPX' || UPPER(SUBSTRING(REPLACE(user_uuid::TEXT, '-', ''), 1, 4)) || 
                LPAD(counter::TEXT, 2, '0');
        
        -- Verificar si ya existe
        IF NOT EXISTS (SELECT 1 FROM public.user_tokens WHERE referral_code = code) THEN
            RETURN code;
        END IF;
        
        counter := counter + 1;
        IF counter > 99 THEN
            RAISE EXCEPTION 'No se pudo generar código de referido único';
        END IF;
    END LOOP;
END;
$$;


ALTER FUNCTION "public"."generate_referral_code"("user_uuid" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_couple_profile_by_user_id"("user_uuid" "uuid") RETURNS TABLE("id" "uuid", "couple_name" "text", "couple_bio" "text", "relationship_type" "public"."relationship_type", "partner1_id" "uuid", "partner2_id" "uuid", "couple_images" "text"[], "is_verified" boolean, "is_premium" boolean, "created_at" timestamp with time zone, "updated_at" timestamp with time zone, "partner1_first_name" "text", "partner1_last_name" "text", "partner1_age" integer, "partner1_bio" "text", "partner1_gender" "text", "partner2_first_name" "text", "partner2_last_name" "text", "partner2_age" integer, "partner2_bio" "text", "partner2_gender" "text")
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    RETURN QUERY
    SELECT cpwp.*
    FROM couple_profiles_with_partners cpwp
    WHERE cpwp.partner1_id IN (SELECT id FROM profiles WHERE user_id = user_uuid)
       OR cpwp.partner2_id IN (SELECT id FROM profiles WHERE user_id = user_uuid);
END;
$$;


ALTER FUNCTION "public"."get_couple_profile_by_user_id"("user_uuid" "uuid") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."get_couple_profile_by_user_id"("user_uuid" "uuid") IS 'Returns couple profile data for a given user ID';



CREATE OR REPLACE FUNCTION "public"."get_post_comments"("post_uuid" "uuid", "page_limit" integer DEFAULT 10, "page_offset" integer DEFAULT 0) RETURNS TABLE("id" "uuid", "user_id" "uuid", "profile_id" "uuid", "parent_comment_id" "uuid", "content" "text", "likes_count" integer, "created_at" timestamp with time zone, "profile_name" "text", "profile_avatar" "text", "user_liked" boolean)
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
    BEGIN
        RETURN QUERY
        SELECT 
            c.id,
            c.user_id,
            c.profile_id,
            c.parent_comment_id,
            c.content,
            c.likes_count,
            c.created_at,
            pr.first_name as profile_name,
            pr.avatar_url as profile_avatar,
            EXISTS(
                SELECT 1 FROM public.comment_likes cl 
                WHERE cl.comment_id = c.id AND cl.user_id = auth.uid()
            ) as user_liked
        FROM public.post_comments c
        LEFT JOIN public.profiles pr ON c.profile_id = pr.id
        WHERE c.post_id = post_uuid
        AND c.deleted_at IS NULL
        ORDER BY c.created_at ASC
        LIMIT page_limit OFFSET page_offset;
    END;
    $$;


ALTER FUNCTION "public"."get_post_comments"("post_uuid" "uuid", "page_limit" integer, "page_offset" integer) OWNER TO "postgres";


COMMENT ON FUNCTION "public"."get_post_comments"("post_uuid" "uuid", "page_limit" integer, "page_offset" integer) IS 'Función para obtener comentarios de un post específico';



CREATE OR REPLACE FUNCTION "public"."get_potential_matches"("user_id_param" "uuid", "limit_param" integer DEFAULT 10) RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    result JSONB;
BEGIN
    SELECT jsonb_agg(
        jsonb_build_object(
            'id', p.id,
            'name', p.name,
            'age', p.age,
            'bio', p.bio,
            'avatar_url', p.avatar_url,
            'interests', p.interests,
            'compatibility_score', RANDOM() * 100 -- Simulado por ahora
        )
    ) INTO result
    FROM profiles p
    WHERE p.id != user_id_param
    AND p.is_active = true
    AND p.is_blocked = false
    AND NOT EXISTS (
        SELECT 1 FROM matches m 
        WHERE (m.user1_id = user_id_param AND m.user2_id = p.id)
        OR (m.user1_id = p.id AND m.user2_id = user_id_param)
    )
    LIMIT limit_param;
    
    RETURN COALESCE(result, '[]'::jsonb);
EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object(
        'error', SQLERRM
    );
END;
$$;


ALTER FUNCTION "public"."get_potential_matches"("user_id_param" "uuid", "limit_param" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_user_feed"("user_id_param" "uuid", "limit_param" integer DEFAULT 20, "offset_param" integer DEFAULT 0) RETURNS "json"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_agg(
        json_build_object(
            'id', p.id,
            'user_id', p.user_id,
            'content', p.content,
            'post_type', p.post_type,
            'image_url', p.image_url,
            'likes_count', p.likes_count,
            'comments_count', p.comments_count,
            'created_at', p.created_at,
            'profile_name', pr.first_name,
            'profile_avatar', pr.avatar_url
        )
    ) INTO result
    FROM public.posts p
    LEFT JOIN public.profiles pr ON p.profile_id = pr.id
    WHERE p.deleted_at IS NULL AND (p.is_public = true OR p.user_id = user_id_param)
    ORDER BY p.created_at DESC
    LIMIT limit_param OFFSET offset_param;
    
    RETURN COALESCE(result, '[]'::json);
END;
$$;


ALTER FUNCTION "public"."get_user_feed"("user_id_param" "uuid", "limit_param" integer, "offset_param" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_user_matches"("user_id_param" "uuid") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    result JSONB;
BEGIN
    SELECT jsonb_agg(
        jsonb_build_object(
            'id', m.id,
            'user1_id', m.user1_id,
            'user2_id', m.user2_id,
            'compatibility_score', m.compatibility_score,
            'status', m.status,
            'created_at', m.created_at
        )
    ) INTO result
    FROM matches m
    WHERE (m.user1_id = user_id_param OR m.user2_id = user_id_param)
    AND m.status = 'active';
    
    RETURN COALESCE(result, '[]'::jsonb);
EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object(
        'error', SQLERRM
    );
END;
$$;


ALTER FUNCTION "public"."get_user_matches"("user_id_param" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."process_referral_reward"("referral_code_param" "text", "new_user_id" "uuid") RETURNS "jsonb"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    inviter_record RECORD;
    inviter_tokens RECORD;
    new_user_tokens RECORD;
    referral_amount INTEGER := 50;
    welcome_amount INTEGER := 50;
    result JSONB;
BEGIN
    -- Buscar invitador por código
    SELECT ut.*, u.email 
    INTO inviter_record
    FROM public.user_tokens ut
    JOIN auth.users u ON ut.user_id = u.id
    WHERE ut.referral_code = referral_code_param;
    
    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'success', false,
            'message', 'Código de referido inválido'
        );
    END IF;
    
    -- Verificar que no se auto-refiera
    IF inviter_record.user_id = new_user_id THEN
        RETURN jsonb_build_object(
            'success', false,
            'message', 'No puedes referirte a ti mismo'
        );
    END IF;
    
    -- Verificar límite mensual del invitador
    IF (inviter_record.monthly_earned + referral_amount) > inviter_record.monthly_limit THEN
        RETURN jsonb_build_object(
            'success', false,
            'message', 'Límite mensual alcanzado (' || inviter_record.monthly_limit || ' CMPX)'
        );
    END IF;
    
    -- Actualizar tokens del invitador
    UPDATE public.user_tokens 
    SET 
        cmpx_balance = cmpx_balance + referral_amount,
        monthly_earned = monthly_earned + referral_amount,
        total_referrals = total_referrals + 1,
        updated_at = NOW()
    WHERE user_id = inviter_record.user_id;
    
    -- Actualizar tokens del nuevo usuario
    UPDATE public.user_tokens 
    SET 
        cmpx_balance = cmpx_balance + welcome_amount,
        referred_by = inviter_record.user_id,
        updated_at = NOW()
    WHERE user_id = new_user_id;
    
    -- Registrar transacciones
    INSERT INTO public.transactions (
        user_id, transaction_type, token_type, amount, 
        balance_before, balance_after, description, related_user_id
    ) VALUES 
    (
        inviter_record.user_id, 'referral_bonus', 'CMPX', referral_amount,
        inviter_record.cmpx_balance, inviter_record.cmpx_balance + referral_amount,
        'Recompensa por referir usuario', new_user_id
    ),
    (
        new_user_id, 'welcome_bonus', 'CMPX', welcome_amount,
        0, welcome_amount,
        'Bono de bienvenida por registro', inviter_record.user_id
    );
    
    RETURN jsonb_build_object(
        'success', true,
        'message', 'Recompensas asignadas: ' || referral_amount || ' CMPX para invitador, ' || welcome_amount || ' CMPX de bienvenida',
        'inviter_reward', referral_amount,
        'welcome_bonus', welcome_amount
    );
END;
$$;


ALTER FUNCTION "public"."process_referral_reward"("referral_code_param" "text", "new_user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."remove_post_like"("p_post_id" "uuid", "p_user_id" "uuid") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    DELETE FROM public.post_likes WHERE post_id = p_post_id AND user_id = p_user_id;
    UPDATE public.posts SET likes_count = likes_count - 1 WHERE id = p_post_id AND likes_count > 0;
END;
$$;


ALTER FUNCTION "public"."remove_post_like"("p_post_id" "uuid", "p_user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."reset_monthly_limits"() RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    UPDATE public.user_tokens 
    SET 
        monthly_earned = 0,
        last_reset_date = NOW()
    WHERE last_reset_date < DATE_TRUNC('month', NOW());
END;
$$;


ALTER FUNCTION "public"."reset_monthly_limits"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_updated_at_reports"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."set_updated_at_reports"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_updated_at_tokens"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."set_updated_at_tokens"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."start_staking"("user_id_param" "uuid", "amount_param" integer, "duration_days" integer DEFAULT 30) RETURNS "jsonb"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    user_tokens RECORD;
    end_date_calc TIMESTAMP WITH TIME ZONE;
BEGIN
    -- Obtener datos del usuario
    SELECT * INTO user_tokens FROM public.user_tokens WHERE user_id = user_id_param;
    
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'message', 'Usuario no encontrado');
    END IF;
    
    -- Verificar balance suficiente
    IF user_tokens.cmpx_balance < amount_param THEN
        RETURN jsonb_build_object(
            'success', false, 
            'message', 'Balance insuficiente. Tienes ' || user_tokens.cmpx_balance || ' CMPX'
        );
    END IF;
    
    -- Calcular fecha de fin
    end_date_calc := NOW() + (duration_days || ' days')::INTERVAL;
    
    -- Actualizar balance (mover a staking)
    UPDATE public.user_tokens 
    SET 
        cmpx_balance = cmpx_balance - amount_param,
        cmpx_staked = cmpx_staked + amount_param,
        updated_at = NOW()
    WHERE user_id = user_id_param;
    
    -- Crear registro de staking
    INSERT INTO public.user_staking (
        user_id, amount, end_date, reward_percentage
    ) VALUES (
        user_id_param, amount_param, end_date_calc, 10.00
    );
    
    -- Registrar transacción
    INSERT INTO public.transactions (
        user_id, transaction_type, token_type, amount,
        balance_before, balance_after, description
    ) VALUES (
        user_id_param, 'stake_tokens', 'CMPX', -amount_param,
        user_tokens.cmpx_balance, user_tokens.cmpx_balance - amount_param,
        'Tokens puestos en staking por ' || duration_days || ' días'
    );
    
    RETURN jsonb_build_object(
        'success', true,
        'message', 'Staking iniciado: ' || amount_param || ' CMPX por ' || duration_days || ' días',
        'amount', amount_param,
        'end_date', end_date_calc,
        'reward_percentage', 10.00
    );
END;
$$;


ALTER FUNCTION "public"."start_staking"("user_id_param" "uuid", "amount_param" integer, "duration_days" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."toggle_post_like"("p_post_id" "uuid", "p_user_id" "uuid") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    existing_like_id UUID;
    profile_id_var UUID;
BEGIN
    SELECT id INTO profile_id_var FROM public.profiles WHERE user_id = p_user_id LIMIT 1;
    SELECT id INTO existing_like_id FROM public.post_likes WHERE post_id = p_post_id AND user_id = p_user_id;
    
    IF existing_like_id IS NOT NULL THEN
        DELETE FROM public.post_likes WHERE id = existing_like_id;
        UPDATE public.posts SET likes_count = likes_count - 1 WHERE id = p_post_id;
        RETURN FALSE;
    ELSE
        INSERT INTO public.post_likes (post_id, user_id, profile_id) VALUES (p_post_id, p_user_id, profile_id_var);
        UPDATE public.posts SET likes_count = likes_count + 1 WHERE id = p_post_id;
        RETURN TRUE;
    END IF;
END;
$$;


ALTER FUNCTION "public"."toggle_post_like"("p_post_id" "uuid", "p_user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_comment_likes_count"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
    BEGIN
        IF TG_OP = 'INSERT' THEN
            UPDATE public.post_comments 
            SET likes_count = likes_count + 1,
                updated_at = NOW()
            WHERE id = NEW.comment_id;
            RETURN NEW;
        ELSIF TG_OP = 'DELETE' THEN
            UPDATE public.post_comments 
            SET likes_count = GREATEST(likes_count - 1, 0),
                updated_at = NOW()
            WHERE id = OLD.comment_id;
            RETURN OLD;
        END IF;
        RETURN NULL;
    END;
    $$;


ALTER FUNCTION "public"."update_comment_likes_count"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_couple_profiles_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_couple_profiles_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_post_comments_count"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
    BEGIN
        IF TG_OP = 'INSERT' THEN
            UPDATE public.posts 
            SET comments_count = comments_count + 1,
                updated_at = NOW()
            WHERE id = NEW.post_id;
            RETURN NEW;
        ELSIF TG_OP = 'DELETE' THEN
            UPDATE public.posts 
            SET comments_count = GREATEST(comments_count - 1, 0),
                updated_at = NOW()
            WHERE id = OLD.post_id;
            RETURN OLD;
        END IF;
        RETURN NULL;
    END;
    $$;


ALTER FUNCTION "public"."update_post_comments_count"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_post_likes_count"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
    BEGIN
        IF TG_OP = 'INSERT' THEN
            UPDATE public.posts 
            SET likes_count = likes_count + 1,
                updated_at = NOW()
            WHERE id = NEW.post_id;
            RETURN NEW;
        ELSIF TG_OP = 'DELETE' THEN
            UPDATE public.posts 
            SET likes_count = GREATEST(likes_count - 1, 0),
                updated_at = NOW()
            WHERE id = OLD.post_id;
            RETURN OLD;
        END IF;
        RETURN NULL;
    END;
    $$;


ALTER FUNCTION "public"."update_post_likes_count"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_post_shares_count"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
    BEGIN
        IF TG_OP = 'INSERT' THEN
            UPDATE public.posts 
            SET shares_count = shares_count + 1,
                updated_at = NOW()
            WHERE id = NEW.post_id;
            RETURN NEW;
        ELSIF TG_OP = 'DELETE' THEN
            UPDATE public.posts 
            SET shares_count = GREATEST(shares_count - 1, 0),
                updated_at = NOW()
            WHERE id = OLD.post_id;
            RETURN OLD;
        END IF;
        RETURN NULL;
    END;
    $$;


ALTER FUNCTION "public"."update_post_shares_count"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_updated_at_column"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_updated_at_column"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_user_tokens_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_user_tokens_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."validate_token_modification"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    -- Solo permitir modificaciones desde funciones específicas o admins
    IF NOT (
        current_setting('application_name', true) LIKE '%supabase%'
    ) THEN
        RAISE EXCEPTION 'Modificación de tokens no autorizada';
    END IF;
    
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."validate_token_modification"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."audit_logs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "session_id" "text",
    "ip_address" "inet",
    "user_agent" "text",
    "action_type" "text" NOT NULL,
    "resource_type" "text",
    "resource_id" "text",
    "action_description" "text" NOT NULL,
    "request_data" "jsonb",
    "response_data" "jsonb",
    "risk_level" "text" DEFAULT 'low'::"text",
    "fraud_score" numeric(3,2) DEFAULT 0.0,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "audit_logs_action_type_check" CHECK (("action_type" = ANY (ARRAY['login'::"text", 'logout'::"text", 'profile_update'::"text", 'token_transaction'::"text", 'report_created'::"text", 'admin_action'::"text", 'security_event'::"text", 'api_call'::"text"]))),
    CONSTRAINT "audit_logs_fraud_score_check" CHECK ((("fraud_score" >= (0)::numeric) AND ("fraud_score" <= (1)::numeric))),
    CONSTRAINT "audit_logs_resource_type_check" CHECK (("resource_type" = ANY (ARRAY['user'::"text", 'profile'::"text", 'token'::"text", 'report'::"text", 'transaction'::"text", 'system'::"text"]))),
    CONSTRAINT "audit_logs_risk_level_check" CHECK (("risk_level" = ANY (ARRAY['low'::"text", 'medium'::"text", 'high'::"text", 'critical'::"text"])))
);


ALTER TABLE "public"."audit_logs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."chat_invitations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "room_id" "uuid",
    "invited_by" "uuid",
    "invited_user" "uuid",
    "status" "text" DEFAULT 'pending'::"text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "chat_invitations_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'accepted'::"text", 'declined'::"text"])))
);


ALTER TABLE "public"."chat_invitations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."chat_members" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "room_id" "uuid",
    "profile_id" "uuid",
    "role" "text" DEFAULT 'member'::"text",
    "joined_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "chat_members_role_check" CHECK (("role" = ANY (ARRAY['admin'::"text", 'moderator'::"text", 'member'::"text"])))
);


ALTER TABLE "public"."chat_members" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."chat_messages" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "content" "text" NOT NULL,
    "message_type" "text" DEFAULT 'text'::"text",
    "room_id" "uuid",
    "sender_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."chat_messages" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."chat_rooms" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "type" "text" DEFAULT 'public'::"text",
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "chat_rooms_type_check" CHECK (("type" = ANY (ARRAY['public'::"text", 'private'::"text", 'group'::"text"])))
);


ALTER TABLE "public"."chat_rooms" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."comment_likes" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "comment_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "profile_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."comment_likes" OWNER TO "postgres";


COMMENT ON TABLE "public"."comment_likes" IS 'Tabla para likes en comentarios';



CREATE TABLE IF NOT EXISTS "public"."couple_profiles" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "couple_name" "text" NOT NULL,
    "couple_bio" "text",
    "relationship_type" "public"."relationship_type" NOT NULL,
    "partner1_id" "uuid" NOT NULL,
    "partner2_id" "uuid" NOT NULL,
    "couple_images" "text"[],
    "is_verified" boolean DEFAULT false,
    "is_premium" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "different_partners" CHECK (("partner1_id" <> "partner2_id"))
);


ALTER TABLE "public"."couple_profiles" OWNER TO "postgres";


COMMENT ON TABLE "public"."couple_profiles" IS 'Stores couple profile information linking two individual profiles';



COMMENT ON COLUMN "public"."couple_profiles"."relationship_type" IS 'Type of relationship: man-woman, man-man, or woman-woman';



COMMENT ON COLUMN "public"."couple_profiles"."couple_images" IS 'Array of image URLs for couple photos';



CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "bio" "text",
    "age" integer,
    "location" "text",
    "interests" "text"[],
    "looking_for" "text",
    "swinger_experience" "text",
    "age_range_min" integer DEFAULT 18,
    "age_range_max" integer DEFAULT 65,
    "gender" "text",
    "interested_in" "text",
    "avatar_url" "text",
    "is_verified" boolean DEFAULT false,
    "is_premium" boolean DEFAULT false,
    "is_blocked" boolean DEFAULT false,
    "blocked_reason" "text",
    "blocked_at" timestamp with time zone,
    "warnings_count" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "account_type" "text" DEFAULT 'single'::"text",
    "max_distance" integer DEFAULT 50,
    "is_demo" boolean DEFAULT false,
    "is_active" boolean DEFAULT true,
    "suspension_end_date" timestamp with time zone,
    CONSTRAINT "profiles_account_type_check" CHECK (("account_type" = ANY (ARRAY['single'::"text", 'couple'::"text"])))
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."couple_profiles_with_partners" AS
 SELECT "cp"."id",
    "cp"."couple_name",
    "cp"."couple_bio",
    "cp"."relationship_type",
    "cp"."partner1_id",
    "cp"."partner2_id",
    "cp"."couple_images",
    "cp"."is_verified",
    "cp"."is_premium",
    "cp"."created_at",
    "cp"."updated_at",
    "p1"."name" AS "partner1_name",
    "p1"."age" AS "partner1_age",
    "p1"."bio" AS "partner1_bio",
    "p1"."gender" AS "partner1_gender",
    "p2"."name" AS "partner2_name",
    "p2"."age" AS "partner2_age",
    "p2"."bio" AS "partner2_bio",
    "p2"."gender" AS "partner2_gender"
   FROM (("public"."couple_profiles" "cp"
     JOIN "public"."profiles" "p1" ON (("cp"."partner1_id" = "p1"."id")))
     JOIN "public"."profiles" "p2" ON (("cp"."partner2_id" = "p2"."id")));


ALTER TABLE "public"."couple_profiles_with_partners" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."gallery_access_requests" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "requester_id" "uuid",
    "requested_from" "uuid",
    "status" "text" DEFAULT 'pending'::"text",
    "message" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "gallery_access_requests_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'approved'::"text", 'denied'::"text"])))
);


ALTER TABLE "public"."gallery_access_requests" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."gallery_permissions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "profile_id" "uuid",
    "granted_to" "uuid",
    "granted_by" "uuid",
    "permission_type" "text" DEFAULT 'view'::"text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "gallery_permissions_permission_type_check" CHECK (("permission_type" = ANY (ARRAY['view'::"text", 'download'::"text", 'share'::"text"])))
);


ALTER TABLE "public"."gallery_permissions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."image_permissions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "image_id" "uuid",
    "granted_to" "uuid",
    "granted_by" "uuid",
    "granted_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."image_permissions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."images" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "profile_id" "uuid",
    "url" "text" NOT NULL,
    "type" "text" DEFAULT 'profile'::"text",
    "is_primary" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "images_type_check" CHECK (("type" = ANY (ARRAY['profile'::"text", 'gallery'::"text", 'avatar'::"text"])))
);


ALTER TABLE "public"."images" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."invitations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "from_profile" "uuid",
    "to_profile" "uuid",
    "status" "text" DEFAULT 'pending'::"text",
    "type" "text" DEFAULT 'connection'::"text",
    "message" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "invitations_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'accepted'::"text", 'declined'::"text", 'expired'::"text"]))),
    CONSTRAINT "invitations_type_check" CHECK (("type" = ANY (ARRAY['connection'::"text", 'event'::"text", 'group'::"text"])))
);


ALTER TABLE "public"."invitations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."match_interactions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "match_id" "uuid",
    "user_id" "uuid",
    "interaction_type" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "match_interactions_interaction_type_check" CHECK (("interaction_type" = ANY (ARRAY['like'::"text", 'super_like'::"text", 'pass'::"text", 'block'::"text"])))
);


ALTER TABLE "public"."match_interactions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."matches" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user1_id" "uuid",
    "user2_id" "uuid",
    "status" "text" DEFAULT 'active'::"text",
    "compatibility_score" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "matches_status_check" CHECK (("status" = ANY (ARRAY['active'::"text", 'inactive'::"text", 'blocked'::"text"])))
);


ALTER TABLE "public"."matches" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."media_access_logs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "media_id" "uuid",
    "access_type" "text" NOT NULL,
    "accessed_at" timestamp with time zone DEFAULT "now"(),
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."media_access_logs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."messages" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "room_id" "uuid",
    "sender_id" "uuid",
    "content" "text" NOT NULL,
    "message_type" "text" DEFAULT 'text'::"text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "messages_message_type_check" CHECK (("message_type" = ANY (ARRAY['text'::"text", 'image'::"text", 'file'::"text", 'system'::"text"])))
);


ALTER TABLE "public"."messages" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."moderation_logs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "moderator_id" "uuid" NOT NULL,
    "target_user_id" "uuid",
    "action_type" "text" NOT NULL,
    "target_type" "text" NOT NULL,
    "target_id" "text",
    "description" "text" NOT NULL,
    "previous_state" "jsonb",
    "new_state" "jsonb",
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "moderation_logs_action_type_check" CHECK (("action_type" = ANY (ARRAY['report_resolved'::"text", 'user_warned'::"text", 'user_suspended'::"text", 'user_banned'::"text", 'content_removed'::"text", 'account_verified'::"text", 'token_adjustment'::"text", 'system_action'::"text"]))),
    CONSTRAINT "moderation_logs_target_type_check" CHECK (("target_type" = ANY (ARRAY['user'::"text", 'report'::"text", 'content'::"text", 'transaction'::"text", 'system'::"text"])))
);


ALTER TABLE "public"."moderation_logs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."notification_history" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "notification_type" "text" NOT NULL,
    "title" "text" NOT NULL,
    "body" "text" NOT NULL,
    "data" "jsonb" DEFAULT '{}'::"jsonb",
    "delivery_method" "text" NOT NULL,
    "status" "text" DEFAULT 'pending'::"text",
    "sent_at" timestamp with time zone,
    "delivered_at" timestamp with time zone,
    "error_message" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "notification_history_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'sent'::"text", 'delivered'::"text", 'failed'::"text"])))
);


ALTER TABLE "public"."notification_history" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."notification_preferences" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "notification_type" "text" NOT NULL,
    "enabled" boolean DEFAULT true,
    "delivery_method" "text" DEFAULT 'push'::"text",
    "settings" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."notification_preferences" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."pending_rewards" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "reward_type" "text" NOT NULL,
    "amount" integer NOT NULL,
    "token_type" "text" DEFAULT 'CMPX'::"text",
    "description" "text" NOT NULL,
    "expires_at" timestamp with time zone,
    "claimed" boolean DEFAULT false NOT NULL,
    "claimed_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "pending_rewards_amount_check" CHECK (("amount" > 0)),
    CONSTRAINT "pending_rewards_reward_type_check" CHECK (("reward_type" = ANY (ARRAY['world_id_verification'::"text", 'referral_bonus'::"text", 'beta_feedback'::"text", 'daily_login'::"text", 'profile_completion'::"text", 'first_match'::"text"]))),
    CONSTRAINT "pending_rewards_token_type_check" CHECK (("token_type" = ANY (ARRAY['CMPX'::"text", 'GTK'::"text"])))
);


ALTER TABLE "public"."pending_rewards" OWNER TO "postgres";


COMMENT ON TABLE "public"."pending_rewards" IS 'Recompensas pendientes de reclamar por usuario';



CREATE TABLE IF NOT EXISTS "public"."post_comments" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "post_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "profile_id" "uuid",
    "parent_comment_id" "uuid",
    "content" "text" NOT NULL,
    "likes_count" integer DEFAULT 0 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "deleted_at" timestamp with time zone,
    CONSTRAINT "comments_content_length" CHECK ((("char_length"("content") >= 1) AND ("char_length"("content") <= 500)))
);


ALTER TABLE "public"."post_comments" OWNER TO "postgres";


COMMENT ON TABLE "public"."post_comments" IS 'Tabla para comentarios en posts con soporte para hilos';



CREATE TABLE IF NOT EXISTS "public"."post_likes" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "post_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "profile_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."post_likes" OWNER TO "postgres";


COMMENT ON TABLE "public"."post_likes" IS 'Tabla para gestionar likes en posts';



CREATE TABLE IF NOT EXISTS "public"."post_shares" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "post_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "profile_id" "uuid",
    "share_type" character varying(20) DEFAULT 'share'::character varying NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "post_shares_share_type_check" CHECK ((("share_type")::"text" = ANY ((ARRAY['share'::character varying, 'repost'::character varying])::"text"[])))
);


ALTER TABLE "public"."post_shares" OWNER TO "postgres";


COMMENT ON TABLE "public"."post_shares" IS 'Tabla para compartir y repostear contenido';



CREATE TABLE IF NOT EXISTS "public"."posts" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "profile_id" "uuid",
    "content" "text" NOT NULL,
    "post_type" character varying(20) DEFAULT 'text'::character varying NOT NULL,
    "image_url" "text",
    "video_url" "text",
    "location" character varying(255),
    "is_public" boolean DEFAULT true NOT NULL,
    "is_premium" boolean DEFAULT false NOT NULL,
    "likes_count" integer DEFAULT 0 NOT NULL,
    "comments_count" integer DEFAULT 0 NOT NULL,
    "shares_count" integer DEFAULT 0 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "deleted_at" timestamp with time zone,
    CONSTRAINT "posts_content_length" CHECK ((("char_length"("content") >= 1) AND ("char_length"("content") <= 2000))),
    CONSTRAINT "posts_post_type_check" CHECK ((("post_type")::"text" = ANY ((ARRAY['text'::character varying, 'photo'::character varying, 'video'::character varying])::"text"[]))),
    CONSTRAINT "posts_valid_media" CHECK ((((("post_type")::"text" = 'text'::"text") AND ("image_url" IS NULL) AND ("video_url" IS NULL)) OR ((("post_type")::"text" = 'photo'::"text") AND ("image_url" IS NOT NULL) AND ("video_url" IS NULL)) OR ((("post_type")::"text" = 'video'::"text") AND ("video_url" IS NOT NULL) AND ("image_url" IS NULL))))
);


ALTER TABLE "public"."posts" OWNER TO "postgres";


COMMENT ON TABLE "public"."posts" IS 'Tabla principal para almacenar posts del feed social';



CREATE TABLE IF NOT EXISTS "public"."transactions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "transaction_type" "text" NOT NULL,
    "token_type" "text" NOT NULL,
    "amount" integer NOT NULL,
    "balance_before" integer NOT NULL,
    "balance_after" integer NOT NULL,
    "description" "text",
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "related_user_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "transactions_token_type_check" CHECK (("token_type" = ANY (ARRAY['CMPX'::"text", 'GTK'::"text"]))),
    CONSTRAINT "transactions_transaction_type_check" CHECK (("transaction_type" = ANY (ARRAY['referral_bonus'::"text", 'welcome_bonus'::"text", 'world_id_bonus'::"text", 'staking_reward'::"text", 'premium_purchase'::"text", 'beta_reward'::"text", 'stake_tokens'::"text", 'unstake_tokens'::"text", 'manual_adjustment'::"text"]))),
    CONSTRAINT "valid_amount" CHECK (("amount" <> 0))
);


ALTER TABLE "public"."transactions" OWNER TO "postgres";


COMMENT ON TABLE "public"."transactions" IS 'Historial completo de transacciones de tokens';



CREATE OR REPLACE VIEW "public"."recent_transactions" AS
 SELECT "transactions"."user_id",
    "transactions"."transaction_type",
    "transactions"."token_type",
    "transactions"."amount",
    "transactions"."balance_before",
    "transactions"."balance_after",
    "transactions"."description",
    "transactions"."created_at"
   FROM "public"."transactions"
  WHERE (("auth"."uid"() = "transactions"."user_id") AND ("transactions"."created_at" >= ("now"() - '30 days'::interval)))
  ORDER BY "transactions"."created_at" DESC
 LIMIT 50;


ALTER TABLE "public"."recent_transactions" OWNER TO "postgres";


COMMENT ON VIEW "public"."recent_transactions" IS 'Transacciones recientes del usuario autenticado';



CREATE TABLE IF NOT EXISTS "public"."referral_rewards" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "referral_code" "text" NOT NULL,
    "reward_type" "text" NOT NULL,
    "amount" numeric(10,2) DEFAULT 0 NOT NULL,
    "description" "text",
    "claimed" boolean DEFAULT false,
    "claimed_at" timestamp with time zone,
    "expires_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."referral_rewards" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."reports" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "reporter_user_id" "uuid" NOT NULL,
    "reported_user_id" "uuid" NOT NULL,
    "content_type" "text" NOT NULL,
    "reported_content_id" "uuid" NOT NULL,
    "reason" "text" NOT NULL,
    "description" "text",
    "severity" "text" DEFAULT 'medium'::"text",
    "status" "text" DEFAULT 'pending'::"text",
    "resolution_notes" "text",
    "reviewed_at" timestamp with time zone,
    "reviewed_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "reports_content_type_check" CHECK (("content_type" = ANY (ARRAY['profile'::"text", 'story'::"text", 'post'::"text"]))),
    CONSTRAINT "reports_severity_check" CHECK (("severity" = ANY (ARRAY['low'::"text", 'medium'::"text", 'high'::"text", 'critical'::"text"]))),
    CONSTRAINT "reports_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'resolved'::"text", 'dismissed'::"text"])))
);


ALTER TABLE "public"."reports" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."system_metrics" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "metric_type" "text" NOT NULL,
    "metric_value" numeric(10,4) NOT NULL,
    "metric_unit" "text" DEFAULT 'ms'::"text" NOT NULL,
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "recorded_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "metric_name" character varying(100),
    CONSTRAINT "system_metrics_metric_type_check" CHECK (("metric_type" = ANY (ARRAY['response_time'::"text", 'query_count'::"text", 'error_rate'::"text", 'active_users'::"text", 'token_transactions'::"text", 'report_activity'::"text", 'memory_usage'::"text", 'cpu_usage'::"text"]))),
    CONSTRAINT "system_metrics_metric_unit_check" CHECK (("metric_unit" = ANY (ARRAY['ms'::"text", 'count'::"text", 'percentage'::"text", 'bytes'::"text", 'users'::"text"])))
);


ALTER TABLE "public"."system_metrics" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."token_analytics" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "period_type" "text" NOT NULL,
    "period_start" timestamp with time zone NOT NULL,
    "period_end" timestamp with time zone NOT NULL,
    "total_cmpx_supply" bigint DEFAULT 0 NOT NULL,
    "total_gtk_supply" bigint DEFAULT 0 NOT NULL,
    "circulating_cmpx" bigint DEFAULT 0 NOT NULL,
    "circulating_gtk" bigint DEFAULT 0 NOT NULL,
    "transaction_count" integer DEFAULT 0 NOT NULL,
    "transaction_volume_cmpx" bigint DEFAULT 0 NOT NULL,
    "transaction_volume_gtk" bigint DEFAULT 0 NOT NULL,
    "total_staked_cmpx" bigint DEFAULT 0 NOT NULL,
    "active_stakers" integer DEFAULT 0 NOT NULL,
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "token_analytics_period_type_check" CHECK (("period_type" = ANY (ARRAY['hourly'::"text", 'daily'::"text", 'weekly'::"text", 'monthly'::"text"])))
);


ALTER TABLE "public"."token_analytics" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."tokens" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "token_code" character varying(50) NOT NULL,
    "token_name" character varying(100) NOT NULL,
    "description" "text",
    "base_value" numeric(10,2) DEFAULT 0.00,
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."tokens" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_2fa_settings" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "totp_secret" "text",
    "totp_enabled" boolean DEFAULT false NOT NULL,
    "totp_verified_at" timestamp with time zone,
    "backup_codes" "text"[],
    "backup_codes_used" integer DEFAULT 0 NOT NULL,
    "recovery_email" "text",
    "recovery_phone" "text",
    "last_used_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."user_2fa_settings" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_device_tokens" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "device_token" "text" NOT NULL,
    "device_type" "text",
    "device_info" "jsonb" DEFAULT '{}'::"jsonb",
    "is_active" boolean DEFAULT true NOT NULL,
    "last_used_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "user_device_tokens_device_type_check" CHECK (("device_type" = ANY (ARRAY['android'::"text", 'ios'::"text", 'web'::"text"])))
);


ALTER TABLE "public"."user_device_tokens" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_likes" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "liked_user_id" "uuid",
    "liked" boolean NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."user_likes" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_notification_preferences" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "notification_type" "text" NOT NULL,
    "enabled" boolean DEFAULT true NOT NULL,
    "delivery_method" "text" DEFAULT 'push'::"text",
    "settings" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "user_notification_preferences_delivery_method_check" CHECK (("delivery_method" = ANY (ARRAY['push'::"text", 'email'::"text", 'in_app'::"text", 'sms'::"text"]))),
    CONSTRAINT "user_notification_preferences_notification_type_check" CHECK (("notification_type" = ANY (ARRAY['report_resolved'::"text", 'token_transaction'::"text", 'moderation_action'::"text", 'system_alert'::"text", 'match_notification'::"text", 'message_notification'::"text"])))
);


ALTER TABLE "public"."user_notification_preferences" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_roles" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "role" "text" DEFAULT 'user'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "user_roles_role_check" CHECK (("role" = ANY (ARRAY['admin'::"text", 'moderator'::"text", 'user'::"text", 'premium'::"text"])))
);


ALTER TABLE "public"."user_roles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_staking" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "amount" integer NOT NULL,
    "start_date" timestamp with time zone DEFAULT "now"() NOT NULL,
    "end_date" timestamp with time zone NOT NULL,
    "reward_percentage" numeric(5,2) DEFAULT 10.00 NOT NULL,
    "status" "text" DEFAULT 'active'::"text",
    "reward_claimed" boolean DEFAULT false NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "user_staking_amount_check" CHECK (("amount" > 0)),
    CONSTRAINT "user_staking_status_check" CHECK (("status" = ANY (ARRAY['active'::"text", 'completed'::"text", 'cancelled'::"text"]))),
    CONSTRAINT "valid_staking_period" CHECK (("end_date" > "start_date"))
);


ALTER TABLE "public"."user_staking" OWNER TO "postgres";


COMMENT ON TABLE "public"."user_staking" IS 'Registros de staking con recompensas del 10%';



CREATE OR REPLACE VIEW "public"."user_staking_summary" AS
 SELECT "us"."user_id",
    "sum"("us"."amount") AS "total_staked",
    "count"(*) AS "total_stakes",
    "avg"("us"."reward_percentage") AS "avg_reward_percentage",
    "count"(
        CASE
            WHEN ("us"."status" = 'active'::"text") THEN 1
            ELSE NULL::integer
        END) AS "active_stakes",
    "count"(
        CASE
            WHEN ("us"."status" = 'completed'::"text") THEN 1
            ELSE NULL::integer
        END) AS "completed_stakes"
   FROM "public"."user_staking" "us"
  WHERE ("auth"."uid"() = "us"."user_id")
  GROUP BY "us"."user_id";


ALTER TABLE "public"."user_staking_summary" OWNER TO "postgres";


COMMENT ON VIEW "public"."user_staking_summary" IS 'Resumen de actividad de staking por usuario';



CREATE TABLE IF NOT EXISTS "public"."user_tokens" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "token_id" "uuid" NOT NULL,
    "quantity" integer DEFAULT 0,
    "last_earned_at" timestamp with time zone,
    "last_spent_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "cmpx_balance" integer DEFAULT 0 NOT NULL,
    "gtk_balance" integer DEFAULT 0 NOT NULL,
    "cmpx_staked" integer DEFAULT 0 NOT NULL,
    "monthly_earned" integer DEFAULT 0 NOT NULL,
    "monthly_limit" integer DEFAULT 500 NOT NULL,
    "total_referrals" integer DEFAULT 0 NOT NULL,
    "world_id_verified" boolean DEFAULT false NOT NULL,
    "world_id_claimed" boolean DEFAULT false NOT NULL,
    "last_reset_date" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "valid_cmpx_balances" CHECK ((("cmpx_balance" >= 0) AND ("gtk_balance" >= 0) AND ("cmpx_staked" >= 0))),
    CONSTRAINT "valid_monthly_limits" CHECK ((("monthly_earned" >= 0) AND ("monthly_earned" <= "monthly_limit")))
);


ALTER TABLE "public"."user_tokens" OWNER TO "postgres";


COMMENT ON TABLE "public"."user_tokens" IS 'Balances de tokens CMPX/GTK por usuario con límites mensuales';



COMMENT ON COLUMN "public"."user_tokens"."cmpx_balance" IS 'Balance de tokens CMPX (internos)';



COMMENT ON COLUMN "public"."user_tokens"."gtk_balance" IS 'Balance de tokens GTK (blockchain)';



COMMENT ON COLUMN "public"."user_tokens"."cmpx_staked" IS 'Tokens CMPX en staking';



COMMENT ON COLUMN "public"."user_tokens"."monthly_earned" IS 'Tokens ganados este mes (máx 500)';



COMMENT ON COLUMN "public"."user_tokens"."monthly_limit" IS 'Límite mensual de tokens por referidos';



COMMENT ON COLUMN "public"."user_tokens"."total_referrals" IS 'Total de referidos exitosos';



COMMENT ON COLUMN "public"."user_tokens"."world_id_verified" IS 'Usuario verificado con World ID';



COMMENT ON COLUMN "public"."user_tokens"."world_id_claimed" IS 'Bonus de World ID reclamado';



CREATE OR REPLACE VIEW "public"."user_token_balances" AS
 SELECT "user_tokens"."user_id",
    "user_tokens"."cmpx_balance",
    "user_tokens"."gtk_balance",
    "user_tokens"."cmpx_staked",
    "user_tokens"."total_referrals",
    "user_tokens"."world_id_verified",
    ("user_tokens"."monthly_limit" - "user_tokens"."monthly_earned") AS "monthly_remaining",
    "user_tokens"."monthly_earned",
    "user_tokens"."monthly_limit",
    "user_tokens"."last_reset_date",
    "user_tokens"."world_id_claimed"
   FROM "public"."user_tokens"
  WHERE ("auth"."uid"() = "user_tokens"."user_id");


ALTER TABLE "public"."user_token_balances" OWNER TO "postgres";


COMMENT ON VIEW "public"."user_token_balances" IS 'Vista segura de balances de tokens CMPX/GTK por usuario';



ALTER TABLE ONLY "public"."audit_logs"
    ADD CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."chat_invitations"
    ADD CONSTRAINT "chat_invitations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."chat_invitations"
    ADD CONSTRAINT "chat_invitations_room_id_invited_user_key" UNIQUE ("room_id", "invited_user");



ALTER TABLE ONLY "public"."chat_members"
    ADD CONSTRAINT "chat_members_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."chat_members"
    ADD CONSTRAINT "chat_members_room_id_profile_id_key" UNIQUE ("room_id", "profile_id");



ALTER TABLE ONLY "public"."chat_messages"
    ADD CONSTRAINT "chat_messages_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."chat_rooms"
    ADD CONSTRAINT "chat_rooms_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."comment_likes"
    ADD CONSTRAINT "comment_likes_comment_id_user_id_key" UNIQUE ("comment_id", "user_id");



ALTER TABLE ONLY "public"."comment_likes"
    ADD CONSTRAINT "comment_likes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."couple_profiles"
    ADD CONSTRAINT "couple_profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."gallery_access_requests"
    ADD CONSTRAINT "gallery_access_requests_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."gallery_access_requests"
    ADD CONSTRAINT "gallery_access_requests_requester_id_requested_from_key" UNIQUE ("requester_id", "requested_from");



ALTER TABLE ONLY "public"."gallery_permissions"
    ADD CONSTRAINT "gallery_permissions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."gallery_permissions"
    ADD CONSTRAINT "gallery_permissions_profile_id_granted_to_permission_type_key" UNIQUE ("profile_id", "granted_to", "permission_type");



ALTER TABLE ONLY "public"."image_permissions"
    ADD CONSTRAINT "image_permissions_image_id_granted_to_key" UNIQUE ("image_id", "granted_to");



ALTER TABLE ONLY "public"."image_permissions"
    ADD CONSTRAINT "image_permissions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."images"
    ADD CONSTRAINT "images_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."invitations"
    ADD CONSTRAINT "invitations_from_profile_to_profile_type_key" UNIQUE ("from_profile", "to_profile", "type");



ALTER TABLE ONLY "public"."invitations"
    ADD CONSTRAINT "invitations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."match_interactions"
    ADD CONSTRAINT "match_interactions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."matches"
    ADD CONSTRAINT "matches_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."matches"
    ADD CONSTRAINT "matches_user1_id_user2_id_key" UNIQUE ("user1_id", "user2_id");



ALTER TABLE ONLY "public"."media_access_logs"
    ADD CONSTRAINT "media_access_logs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."messages"
    ADD CONSTRAINT "messages_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."moderation_logs"
    ADD CONSTRAINT "moderation_logs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."notification_history"
    ADD CONSTRAINT "notification_history_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."notification_preferences"
    ADD CONSTRAINT "notification_preferences_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."notification_preferences"
    ADD CONSTRAINT "notification_preferences_user_id_notification_type_key" UNIQUE ("user_id", "notification_type");



ALTER TABLE ONLY "public"."pending_rewards"
    ADD CONSTRAINT "pending_rewards_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."post_comments"
    ADD CONSTRAINT "post_comments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."post_likes"
    ADD CONSTRAINT "post_likes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."post_likes"
    ADD CONSTRAINT "post_likes_post_id_user_id_key" UNIQUE ("post_id", "user_id");



ALTER TABLE ONLY "public"."post_shares"
    ADD CONSTRAINT "post_shares_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."post_shares"
    ADD CONSTRAINT "post_shares_post_id_user_id_share_type_key" UNIQUE ("post_id", "user_id", "share_type");



ALTER TABLE ONLY "public"."posts"
    ADD CONSTRAINT "posts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."referral_rewards"
    ADD CONSTRAINT "referral_rewards_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."referral_rewards"
    ADD CONSTRAINT "referral_rewards_referral_code_key" UNIQUE ("referral_code");



ALTER TABLE ONLY "public"."reports"
    ADD CONSTRAINT "reports_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."system_metrics"
    ADD CONSTRAINT "system_metrics_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."token_analytics"
    ADD CONSTRAINT "token_analytics_period_type_period_start_key" UNIQUE ("period_type", "period_start");



ALTER TABLE ONLY "public"."token_analytics"
    ADD CONSTRAINT "token_analytics_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."tokens"
    ADD CONSTRAINT "tokens_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."tokens"
    ADD CONSTRAINT "tokens_token_code_key" UNIQUE ("token_code");



ALTER TABLE ONLY "public"."transactions"
    ADD CONSTRAINT "transactions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."couple_profiles"
    ADD CONSTRAINT "unique_partner1" UNIQUE ("partner1_id");



ALTER TABLE ONLY "public"."couple_profiles"
    ADD CONSTRAINT "unique_partner2" UNIQUE ("partner2_id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "unique_user_profile" UNIQUE ("user_id");



ALTER TABLE ONLY "public"."pending_rewards"
    ADD CONSTRAINT "unique_user_reward" UNIQUE ("user_id", "reward_type");



ALTER TABLE ONLY "public"."user_2fa_settings"
    ADD CONSTRAINT "user_2fa_settings_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_2fa_settings"
    ADD CONSTRAINT "user_2fa_settings_user_id_key" UNIQUE ("user_id");



ALTER TABLE ONLY "public"."user_device_tokens"
    ADD CONSTRAINT "user_device_tokens_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_device_tokens"
    ADD CONSTRAINT "user_device_tokens_user_id_device_token_key" UNIQUE ("user_id", "device_token");



ALTER TABLE ONLY "public"."user_likes"
    ADD CONSTRAINT "user_likes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_likes"
    ADD CONSTRAINT "user_likes_user_id_liked_user_id_key" UNIQUE ("user_id", "liked_user_id");



ALTER TABLE ONLY "public"."user_notification_preferences"
    ADD CONSTRAINT "user_notification_preferences_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_notification_preferences"
    ADD CONSTRAINT "user_notification_preferences_user_id_notification_type_del_key" UNIQUE ("user_id", "notification_type", "delivery_method");



ALTER TABLE ONLY "public"."user_roles"
    ADD CONSTRAINT "user_roles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_roles"
    ADD CONSTRAINT "user_roles_user_id_role_key" UNIQUE ("user_id", "role");



ALTER TABLE ONLY "public"."user_staking"
    ADD CONSTRAINT "user_staking_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_tokens"
    ADD CONSTRAINT "user_tokens_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_tokens"
    ADD CONSTRAINT "user_tokens_user_id_token_id_key" UNIQUE ("user_id", "token_id");



CREATE INDEX "idx_audit_logs_risk_level" ON "public"."audit_logs" USING "btree" ("risk_level", "created_at" DESC);



CREATE INDEX "idx_audit_logs_user_time" ON "public"."audit_logs" USING "btree" ("user_id", "created_at" DESC);



CREATE INDEX "idx_chat_messages_created_at" ON "public"."chat_messages" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_chat_messages_room_id" ON "public"."chat_messages" USING "btree" ("room_id");



CREATE INDEX "idx_chat_messages_sender_id" ON "public"."chat_messages" USING "btree" ("sender_id");



CREATE INDEX "idx_comment_likes_comment_id" ON "public"."comment_likes" USING "btree" ("comment_id");



CREATE INDEX "idx_comment_likes_user_id" ON "public"."comment_likes" USING "btree" ("user_id");



CREATE INDEX "idx_couple_profiles_created_at" ON "public"."couple_profiles" USING "btree" ("created_at");



CREATE INDEX "idx_couple_profiles_partner1" ON "public"."couple_profiles" USING "btree" ("partner1_id");



CREATE INDEX "idx_couple_profiles_partner2" ON "public"."couple_profiles" USING "btree" ("partner2_id");



CREATE INDEX "idx_couple_profiles_relationship_type" ON "public"."couple_profiles" USING "btree" ("relationship_type");



CREATE INDEX "idx_device_tokens_user" ON "public"."user_device_tokens" USING "btree" ("user_id", "is_active");



CREATE INDEX "idx_media_access_logs_accessed_at" ON "public"."media_access_logs" USING "btree" ("accessed_at" DESC);



CREATE INDEX "idx_media_access_logs_media_id" ON "public"."media_access_logs" USING "btree" ("media_id");



CREATE INDEX "idx_media_access_logs_user_id" ON "public"."media_access_logs" USING "btree" ("user_id");



CREATE INDEX "idx_moderation_logs_moderator" ON "public"."moderation_logs" USING "btree" ("moderator_id", "created_at" DESC);



CREATE INDEX "idx_moderation_logs_target_user" ON "public"."moderation_logs" USING "btree" ("target_user_id", "created_at" DESC);



CREATE INDEX "idx_notification_history_user" ON "public"."notification_history" USING "btree" ("user_id", "created_at" DESC);



CREATE INDEX "idx_notification_preferences_enabled" ON "public"."notification_preferences" USING "btree" ("enabled");



CREATE INDEX "idx_notification_preferences_type" ON "public"."notification_preferences" USING "btree" ("notification_type");



CREATE INDEX "idx_notification_preferences_user" ON "public"."user_notification_preferences" USING "btree" ("user_id");



CREATE INDEX "idx_notification_preferences_user_id" ON "public"."notification_preferences" USING "btree" ("user_id");



CREATE INDEX "idx_pending_rewards_claimed" ON "public"."pending_rewards" USING "btree" ("claimed");



CREATE INDEX "idx_pending_rewards_user_id" ON "public"."pending_rewards" USING "btree" ("user_id");



CREATE INDEX "idx_post_comments_created_at" ON "public"."post_comments" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_post_comments_parent" ON "public"."post_comments" USING "btree" ("parent_comment_id") WHERE ("parent_comment_id" IS NOT NULL);



CREATE INDEX "idx_post_comments_post_id" ON "public"."post_comments" USING "btree" ("post_id");



CREATE INDEX "idx_post_comments_user_id" ON "public"."post_comments" USING "btree" ("user_id");



CREATE INDEX "idx_post_likes_created_at" ON "public"."post_likes" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_post_likes_post_id" ON "public"."post_likes" USING "btree" ("post_id");



CREATE INDEX "idx_post_likes_user_id" ON "public"."post_likes" USING "btree" ("user_id");



CREATE INDEX "idx_post_shares_created_at" ON "public"."post_shares" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_post_shares_post_id" ON "public"."post_shares" USING "btree" ("post_id");



CREATE INDEX "idx_post_shares_user_id" ON "public"."post_shares" USING "btree" ("user_id");



CREATE INDEX "idx_posts_created_at" ON "public"."posts" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_posts_location" ON "public"."posts" USING "btree" ("location") WHERE ("location" IS NOT NULL);



CREATE INDEX "idx_posts_premium" ON "public"."posts" USING "btree" ("is_premium") WHERE ("is_premium" = true);



CREATE INDEX "idx_posts_profile_id" ON "public"."posts" USING "btree" ("profile_id");



CREATE INDEX "idx_posts_public" ON "public"."posts" USING "btree" ("is_public") WHERE ("is_public" = true);



CREATE INDEX "idx_posts_type" ON "public"."posts" USING "btree" ("post_type");



CREATE INDEX "idx_posts_user_id" ON "public"."posts" USING "btree" ("user_id");



CREATE INDEX "idx_profiles_age" ON "public"."profiles" USING "btree" ("age");



CREATE INDEX "idx_profiles_is_blocked" ON "public"."profiles" USING "btree" ("is_blocked");



CREATE INDEX "idx_profiles_location" ON "public"."profiles" USING "btree" ("location");



CREATE INDEX "idx_profiles_suspension_end_date" ON "public"."profiles" USING "btree" ("suspension_end_date");



CREATE INDEX "idx_profiles_user_id" ON "public"."profiles" USING "btree" ("user_id");



CREATE INDEX "idx_referral_rewards_claimed" ON "public"."referral_rewards" USING "btree" ("claimed");



CREATE INDEX "idx_referral_rewards_code" ON "public"."referral_rewards" USING "btree" ("referral_code");



CREATE INDEX "idx_referral_rewards_user_id" ON "public"."referral_rewards" USING "btree" ("user_id");



CREATE INDEX "idx_reports_content_type" ON "public"."reports" USING "btree" ("content_type");



CREATE INDEX "idx_reports_created_at" ON "public"."reports" USING "btree" ("created_at");



CREATE INDEX "idx_reports_reported_user_id" ON "public"."reports" USING "btree" ("reported_user_id");



CREATE INDEX "idx_reports_reporter_user_id" ON "public"."reports" USING "btree" ("reporter_user_id");



CREATE INDEX "idx_reports_status" ON "public"."reports" USING "btree" ("status");



CREATE INDEX "idx_system_metrics_name" ON "public"."system_metrics" USING "btree" ("metric_name");



CREATE INDEX "idx_system_metrics_type_time" ON "public"."system_metrics" USING "btree" ("metric_type", "recorded_at" DESC);



CREATE INDEX "idx_token_analytics_period" ON "public"."token_analytics" USING "btree" ("period_type", "period_start" DESC);



CREATE INDEX "idx_tokens_is_active" ON "public"."tokens" USING "btree" ("is_active");



CREATE INDEX "idx_tokens_token_code" ON "public"."tokens" USING "btree" ("token_code");



CREATE INDEX "idx_transactions_created_at" ON "public"."transactions" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_transactions_type" ON "public"."transactions" USING "btree" ("transaction_type");



CREATE INDEX "idx_transactions_user_id" ON "public"."transactions" USING "btree" ("user_id");



CREATE INDEX "idx_user_staking_status" ON "public"."user_staking" USING "btree" ("status");



CREATE INDEX "idx_user_staking_user_id" ON "public"."user_staking" USING "btree" ("user_id");



CREATE INDEX "idx_user_tokens_cmpx_balance" ON "public"."user_tokens" USING "btree" ("cmpx_balance");



CREATE INDEX "idx_user_tokens_gtk_balance" ON "public"."user_tokens" USING "btree" ("gtk_balance");



CREATE INDEX "idx_user_tokens_monthly_reset" ON "public"."user_tokens" USING "btree" ("last_reset_date");



CREATE INDEX "idx_user_tokens_quantity" ON "public"."user_tokens" USING "btree" ("quantity");



CREATE INDEX "idx_user_tokens_token_id" ON "public"."user_tokens" USING "btree" ("token_id");



CREATE INDEX "idx_user_tokens_user_id" ON "public"."user_tokens" USING "btree" ("user_id");



CREATE INDEX "idx_user_tokens_world_id" ON "public"."user_tokens" USING "btree" ("world_id_verified");



CREATE OR REPLACE TRIGGER "audit_large_transactions" AFTER INSERT ON "public"."transactions" FOR EACH ROW EXECUTE FUNCTION "public"."audit_suspicious_transactions"();



CREATE OR REPLACE TRIGGER "couple_profiles_updated_at" BEFORE UPDATE ON "public"."couple_profiles" FOR EACH ROW EXECUTE FUNCTION "public"."update_couple_profiles_updated_at"();



CREATE OR REPLACE TRIGGER "trg_set_updated_at_reports" BEFORE UPDATE ON "public"."reports" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at_reports"();



CREATE OR REPLACE TRIGGER "trg_set_updated_at_tokens" BEFORE UPDATE ON "public"."tokens" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at_tokens"();



CREATE OR REPLACE TRIGGER "trg_set_updated_at_user_tokens" BEFORE UPDATE ON "public"."user_tokens" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at_tokens"();



CREATE OR REPLACE TRIGGER "trigger_update_comment_likes_count" AFTER INSERT OR DELETE ON "public"."comment_likes" FOR EACH ROW EXECUTE FUNCTION "public"."update_comment_likes_count"();



CREATE OR REPLACE TRIGGER "trigger_update_post_comments_count" AFTER INSERT OR DELETE ON "public"."post_comments" FOR EACH ROW EXECUTE FUNCTION "public"."update_post_comments_count"();



CREATE OR REPLACE TRIGGER "trigger_update_post_likes_count" AFTER INSERT OR DELETE ON "public"."post_likes" FOR EACH ROW EXECUTE FUNCTION "public"."update_post_likes_count"();



CREATE OR REPLACE TRIGGER "trigger_update_post_shares_count" AFTER INSERT OR DELETE ON "public"."post_shares" FOR EACH ROW EXECUTE FUNCTION "public"."update_post_shares_count"();



CREATE OR REPLACE TRIGGER "update_2fa_settings_updated_at" BEFORE UPDATE ON "public"."user_2fa_settings" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_chat_messages_updated_at" BEFORE UPDATE ON "public"."chat_messages" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_notification_preferences_updated_at" BEFORE UPDATE ON "public"."notification_preferences" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_notification_preferences_updated_at" BEFORE UPDATE ON "public"."user_notification_preferences" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_user_tokens_updated_at_trigger" BEFORE UPDATE ON "public"."user_tokens" FOR EACH ROW EXECUTE FUNCTION "public"."update_user_tokens_updated_at"();



CREATE OR REPLACE TRIGGER "validate_token_modifications" BEFORE UPDATE ON "public"."user_tokens" FOR EACH ROW EXECUTE FUNCTION "public"."validate_token_modification"();



ALTER TABLE ONLY "public"."audit_logs"
    ADD CONSTRAINT "audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."chat_invitations"
    ADD CONSTRAINT "chat_invitations_invited_by_fkey" FOREIGN KEY ("invited_by") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."chat_invitations"
    ADD CONSTRAINT "chat_invitations_invited_user_fkey" FOREIGN KEY ("invited_user") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."chat_invitations"
    ADD CONSTRAINT "chat_invitations_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "public"."chat_rooms"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."chat_members"
    ADD CONSTRAINT "chat_members_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."chat_members"
    ADD CONSTRAINT "chat_members_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "public"."chat_rooms"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."chat_messages"
    ADD CONSTRAINT "chat_messages_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "public"."chat_rooms"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."chat_messages"
    ADD CONSTRAINT "chat_messages_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."chat_rooms"
    ADD CONSTRAINT "chat_rooms_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."comment_likes"
    ADD CONSTRAINT "comment_likes_comment_id_fkey" FOREIGN KEY ("comment_id") REFERENCES "public"."post_comments"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."comment_likes"
    ADD CONSTRAINT "comment_likes_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."comment_likes"
    ADD CONSTRAINT "comment_likes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."couple_profiles"
    ADD CONSTRAINT "couple_profiles_partner1_id_fkey" FOREIGN KEY ("partner1_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."couple_profiles"
    ADD CONSTRAINT "couple_profiles_partner2_id_fkey" FOREIGN KEY ("partner2_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."gallery_access_requests"
    ADD CONSTRAINT "gallery_access_requests_requested_from_fkey" FOREIGN KEY ("requested_from") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."gallery_access_requests"
    ADD CONSTRAINT "gallery_access_requests_requester_id_fkey" FOREIGN KEY ("requester_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."gallery_permissions"
    ADD CONSTRAINT "gallery_permissions_granted_by_fkey" FOREIGN KEY ("granted_by") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."gallery_permissions"
    ADD CONSTRAINT "gallery_permissions_granted_to_fkey" FOREIGN KEY ("granted_to") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."gallery_permissions"
    ADD CONSTRAINT "gallery_permissions_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."image_permissions"
    ADD CONSTRAINT "image_permissions_granted_by_fkey" FOREIGN KEY ("granted_by") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."image_permissions"
    ADD CONSTRAINT "image_permissions_granted_to_fkey" FOREIGN KEY ("granted_to") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."image_permissions"
    ADD CONSTRAINT "image_permissions_image_id_fkey" FOREIGN KEY ("image_id") REFERENCES "public"."images"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."images"
    ADD CONSTRAINT "images_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."invitations"
    ADD CONSTRAINT "invitations_from_profile_fkey" FOREIGN KEY ("from_profile") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."invitations"
    ADD CONSTRAINT "invitations_to_profile_fkey" FOREIGN KEY ("to_profile") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."match_interactions"
    ADD CONSTRAINT "match_interactions_match_id_fkey" FOREIGN KEY ("match_id") REFERENCES "public"."matches"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."match_interactions"
    ADD CONSTRAINT "match_interactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."matches"
    ADD CONSTRAINT "matches_user1_id_fkey" FOREIGN KEY ("user1_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."matches"
    ADD CONSTRAINT "matches_user2_id_fkey" FOREIGN KEY ("user2_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."media_access_logs"
    ADD CONSTRAINT "media_access_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."messages"
    ADD CONSTRAINT "messages_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "public"."chat_rooms"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."messages"
    ADD CONSTRAINT "messages_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."moderation_logs"
    ADD CONSTRAINT "moderation_logs_moderator_id_fkey" FOREIGN KEY ("moderator_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."moderation_logs"
    ADD CONSTRAINT "moderation_logs_target_user_id_fkey" FOREIGN KEY ("target_user_id") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."notification_history"
    ADD CONSTRAINT "notification_history_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."notification_preferences"
    ADD CONSTRAINT "notification_preferences_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."pending_rewards"
    ADD CONSTRAINT "pending_rewards_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."post_comments"
    ADD CONSTRAINT "post_comments_parent_comment_id_fkey" FOREIGN KEY ("parent_comment_id") REFERENCES "public"."post_comments"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."post_comments"
    ADD CONSTRAINT "post_comments_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."post_comments"
    ADD CONSTRAINT "post_comments_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."post_comments"
    ADD CONSTRAINT "post_comments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."post_likes"
    ADD CONSTRAINT "post_likes_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."post_likes"
    ADD CONSTRAINT "post_likes_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."post_likes"
    ADD CONSTRAINT "post_likes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."post_shares"
    ADD CONSTRAINT "post_shares_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."post_shares"
    ADD CONSTRAINT "post_shares_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."post_shares"
    ADD CONSTRAINT "post_shares_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."posts"
    ADD CONSTRAINT "posts_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."posts"
    ADD CONSTRAINT "posts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."referral_rewards"
    ADD CONSTRAINT "referral_rewards_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."reports"
    ADD CONSTRAINT "reports_reported_user_id_fkey" FOREIGN KEY ("reported_user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."reports"
    ADD CONSTRAINT "reports_reporter_user_id_fkey" FOREIGN KEY ("reporter_user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."reports"
    ADD CONSTRAINT "reports_reviewed_by_fkey" FOREIGN KEY ("reviewed_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."transactions"
    ADD CONSTRAINT "transactions_related_user_id_fkey" FOREIGN KEY ("related_user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."transactions"
    ADD CONSTRAINT "transactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_2fa_settings"
    ADD CONSTRAINT "user_2fa_settings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_device_tokens"
    ADD CONSTRAINT "user_device_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_likes"
    ADD CONSTRAINT "user_likes_liked_user_id_fkey" FOREIGN KEY ("liked_user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_likes"
    ADD CONSTRAINT "user_likes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_notification_preferences"
    ADD CONSTRAINT "user_notification_preferences_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_roles"
    ADD CONSTRAINT "user_roles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_staking"
    ADD CONSTRAINT "user_staking_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_tokens"
    ADD CONSTRAINT "user_tokens_token_id_fkey" FOREIGN KEY ("token_id") REFERENCES "public"."tokens"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_tokens"
    ADD CONSTRAINT "user_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



CREATE POLICY "Admins can view audit logs" ON "public"."audit_logs" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."user_roles"
  WHERE (("user_roles"."user_id" = "auth"."uid"()) AND ("user_roles"."role" = 'admin'::"text")))));



CREATE POLICY "Admins can view system metrics" ON "public"."system_metrics" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."user_roles"
  WHERE (("user_roles"."user_id" = "auth"."uid"()) AND ("user_roles"."role" = ANY (ARRAY['admin'::"text", 'moderator'::"text"]))))));



CREATE POLICY "Admins can view token analytics" ON "public"."token_analytics" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."user_roles"
  WHERE (("user_roles"."user_id" = "auth"."uid"()) AND ("user_roles"."role" = ANY (ARRAY['admin'::"text", 'moderator'::"text"]))))));



CREATE POLICY "Authenticated users can update reports" ON "public"."reports" FOR UPDATE USING (("auth"."uid"() IS NOT NULL));



CREATE POLICY "Los usuarios pueden crear logs de acceso" ON "public"."media_access_logs" FOR INSERT WITH CHECK (("user_id" = "auth"."uid"()));



CREATE POLICY "Los usuarios pueden enviar mensajes a sus salas" ON "public"."chat_messages" FOR INSERT WITH CHECK ((("sender_id" = "auth"."uid"()) AND (EXISTS ( SELECT 1
   FROM "public"."chat_members"
  WHERE (("chat_members"."room_id" = "chat_messages"."room_id") AND ("chat_members"."profile_id" = "auth"."uid"()))))));



CREATE POLICY "Los usuarios pueden gestionar sus preferencias" ON "public"."notification_preferences" USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Los usuarios pueden reclamar sus recompensas" ON "public"."referral_rewards" FOR UPDATE USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Los usuarios pueden ver mensajes de sus salas" ON "public"."chat_messages" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."chat_members"
  WHERE (("chat_members"."room_id" = "chat_messages"."room_id") AND ("chat_members"."profile_id" = "auth"."uid"())))));



CREATE POLICY "Los usuarios pueden ver sus propios logs de acceso" ON "public"."media_access_logs" FOR SELECT USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Los usuarios pueden ver sus recompensas" ON "public"."referral_rewards" FOR SELECT USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Moderators can insert moderation logs" ON "public"."moderation_logs" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."user_roles"
  WHERE (("user_roles"."user_id" = "auth"."uid"()) AND ("user_roles"."role" = ANY (ARRAY['admin'::"text", 'moderator'::"text"]))))));



CREATE POLICY "Moderators can view moderation logs" ON "public"."moderation_logs" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."user_roles"
  WHERE (("user_roles"."user_id" = "auth"."uid"()) AND ("user_roles"."role" = ANY (ARRAY['admin'::"text", 'moderator'::"text"]))))));



CREATE POLICY "Sistema puede crear recompensas" ON "public"."referral_rewards" FOR INSERT WITH CHECK (true);



CREATE POLICY "System can insert analytics" ON "public"."token_analytics" FOR INSERT WITH CHECK (true);



CREATE POLICY "System can insert audit logs" ON "public"."audit_logs" FOR INSERT WITH CHECK (true);



CREATE POLICY "System can insert metrics" ON "public"."system_metrics" FOR INSERT WITH CHECK (true);



CREATE POLICY "System can insert notification history" ON "public"."notification_history" FOR INSERT WITH CHECK (true);



CREATE POLICY "System can insert rewards" ON "public"."pending_rewards" FOR INSERT WITH CHECK (true);



CREATE POLICY "System can insert staking" ON "public"."user_staking" FOR INSERT WITH CHECK (true);



CREATE POLICY "System can insert tokens" ON "public"."user_tokens" FOR INSERT WITH CHECK (true);



COMMENT ON POLICY "System can insert tokens" ON "public"."user_tokens" IS 'Solo el sistema puede crear nuevos registros de tokens';



CREATE POLICY "System can insert transactions" ON "public"."transactions" FOR INSERT WITH CHECK (true);



CREATE POLICY "System can manage staking" ON "public"."user_staking" WITH CHECK (true);



CREATE POLICY "Users can claim own rewards" ON "public"."pending_rewards" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can create comments on public posts" ON "public"."post_comments" FOR INSERT WITH CHECK ((("user_id" = "auth"."uid"()) AND (EXISTS ( SELECT 1
   FROM "public"."posts"
  WHERE (("posts"."id" = "post_comments"."post_id") AND (("posts"."is_public" = true) OR ("posts"."user_id" = "auth"."uid"())))))));



CREATE POLICY "Users can create invitations" ON "public"."invitations" FOR INSERT WITH CHECK (("from_profile" = "auth"."uid"()));



CREATE POLICY "Users can create messages" ON "public"."messages" FOR INSERT WITH CHECK (("sender_id" = "auth"."uid"()));



CREATE POLICY "Users can create reports" ON "public"."reports" FOR INSERT WITH CHECK (("auth"."uid"() = "reporter_user_id"));



CREATE POLICY "Users can create their own comment likes" ON "public"."comment_likes" FOR INSERT WITH CHECK (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can create their own post comments" ON "public"."post_comments" FOR INSERT WITH CHECK (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can create their own post likes" ON "public"."post_likes" FOR INSERT WITH CHECK (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can create their own post shares" ON "public"."post_shares" FOR INSERT WITH CHECK (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can create their own posts" ON "public"."posts" FOR INSERT WITH CHECK (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can delete their own comment likes" ON "public"."comment_likes" FOR DELETE USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can delete their own comments" ON "public"."post_comments" FOR DELETE USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can delete their own post comments" ON "public"."post_comments" FOR DELETE USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can delete their own post likes" ON "public"."post_likes" FOR DELETE USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can delete their own post shares" ON "public"."post_shares" FOR DELETE USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can delete their own posts" ON "public"."posts" FOR DELETE USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can manage own 2FA settings" ON "public"."user_2fa_settings" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can manage own device tokens" ON "public"."user_device_tokens" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can manage own images" ON "public"."images" USING (("profile_id" = "auth"."uid"()));



CREATE POLICY "Users can manage own likes" ON "public"."user_likes" USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can manage own notification preferences" ON "public"."user_notification_preferences" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update own staking" ON "public"."user_staking" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update own tokens" ON "public"."user_tokens" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update their own comments" ON "public"."post_comments" FOR UPDATE USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can update their own post comments" ON "public"."post_comments" FOR UPDATE USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can update their own posts" ON "public"."posts" FOR UPDATE USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can update their own tokens" ON "public"."user_tokens" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view accessible rooms" ON "public"."chat_rooms" FOR SELECT USING ((("type" = 'public'::"text") OR ("created_by" = "auth"."uid"())));



CREATE POLICY "Users can view active tokens" ON "public"."tokens" FOR SELECT USING (("is_active" = true));



CREATE POLICY "Users can view all comment likes" ON "public"."comment_likes" FOR SELECT USING (true);



CREATE POLICY "Users can view all post comments" ON "public"."post_comments" FOR SELECT USING (true);



CREATE POLICY "Users can view all post likes" ON "public"."post_likes" FOR SELECT USING (true);



CREATE POLICY "Users can view all post shares" ON "public"."post_shares" FOR SELECT USING (true);



CREATE POLICY "Users can view comments on public posts" ON "public"."post_comments" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."posts"
  WHERE (("posts"."id" = "post_comments"."post_id") AND (("posts"."is_public" = true) OR ("posts"."user_id" = "auth"."uid"()))))));



CREATE POLICY "Users can view own chat invitations" ON "public"."chat_invitations" FOR SELECT USING ((("invited_by" = "auth"."uid"()) OR ("invited_user" = "auth"."uid"())));



CREATE POLICY "Users can view own image permissions" ON "public"."image_permissions" FOR SELECT USING ((("granted_by" = "auth"."uid"()) OR ("granted_to" = "auth"."uid"())));



CREATE POLICY "Users can view own images" ON "public"."images" FOR SELECT USING (("profile_id" = "auth"."uid"()));



CREATE POLICY "Users can view own interactions" ON "public"."match_interactions" FOR SELECT USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can view own invitations" ON "public"."invitations" FOR SELECT USING ((("from_profile" = "auth"."uid"()) OR ("to_profile" = "auth"."uid"())));



CREATE POLICY "Users can view own likes" ON "public"."user_likes" FOR SELECT USING ((("user_id" = "auth"."uid"()) OR ("liked_user_id" = "auth"."uid"())));



CREATE POLICY "Users can view own matches" ON "public"."matches" FOR SELECT USING ((("user1_id" = "auth"."uid"()) OR ("user2_id" = "auth"."uid"())));



CREATE POLICY "Users can view own notification history" ON "public"."notification_history" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view own pending rewards" ON "public"."pending_rewards" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view own permissions" ON "public"."gallery_permissions" FOR SELECT USING ((("granted_by" = "auth"."uid"()) OR ("granted_to" = "auth"."uid"())));



CREATE POLICY "Users can view own requests" ON "public"."gallery_access_requests" FOR SELECT USING ((("requester_id" = "auth"."uid"()) OR ("requested_from" = "auth"."uid"())));



CREATE POLICY "Users can view own roles" ON "public"."user_roles" FOR SELECT USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can view own staking" ON "public"."user_staking" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view own tokens" ON "public"."user_tokens" FOR SELECT USING (("auth"."uid"() = "user_id"));



COMMENT ON POLICY "Users can view own tokens" ON "public"."user_tokens" IS 'Usuarios solo ven sus propios balances de tokens';



CREATE POLICY "Users can view own transactions" ON "public"."transactions" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view public posts" ON "public"."posts" FOR SELECT USING ((("is_public" = true) OR ("user_id" = "auth"."uid"())));



CREATE POLICY "Users can view room members" ON "public"."chat_members" FOR SELECT USING (("profile_id" = "auth"."uid"()));



CREATE POLICY "Users can view room messages" ON "public"."messages" FOR SELECT USING (("sender_id" = "auth"."uid"()));



CREATE POLICY "Users can view their own reports" ON "public"."reports" FOR SELECT USING (("auth"."uid"() = "reporter_user_id"));



CREATE POLICY "Users can view their own tokens" ON "public"."user_tokens" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Usuarios pueden actualizar su propio perfil" ON "public"."profiles" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Usuarios pueden insertar su propio perfil" ON "public"."profiles" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Usuarios pueden ver perfiles públicos" ON "public"."profiles" FOR SELECT USING ((NOT "is_blocked"));



ALTER TABLE "public"."audit_logs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."chat_invitations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."chat_members" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."chat_messages" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."chat_rooms" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."comment_likes" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."couple_profiles" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "couple_profiles_delete_members" ON "public"."couple_profiles" FOR DELETE USING (("auth"."uid"() IN ( SELECT "profiles"."user_id"
   FROM "public"."profiles"
  WHERE ("profiles"."id" = "couple_profiles"."partner1_id")
UNION
 SELECT "profiles"."user_id"
   FROM "public"."profiles"
  WHERE ("profiles"."id" = "couple_profiles"."partner2_id"))));



CREATE POLICY "couple_profiles_insert_members" ON "public"."couple_profiles" FOR INSERT WITH CHECK (("auth"."uid"() IN ( SELECT "profiles"."user_id"
   FROM "public"."profiles"
  WHERE ("profiles"."id" = "couple_profiles"."partner1_id")
UNION
 SELECT "profiles"."user_id"
   FROM "public"."profiles"
  WHERE ("profiles"."id" = "couple_profiles"."partner2_id"))));



CREATE POLICY "couple_profiles_select_all" ON "public"."couple_profiles" FOR SELECT USING (true);



CREATE POLICY "couple_profiles_update_members" ON "public"."couple_profiles" FOR UPDATE USING (("auth"."uid"() IN ( SELECT "profiles"."user_id"
   FROM "public"."profiles"
  WHERE ("profiles"."id" = "couple_profiles"."partner1_id")
UNION
 SELECT "profiles"."user_id"
   FROM "public"."profiles"
  WHERE ("profiles"."id" = "couple_profiles"."partner2_id"))));



ALTER TABLE "public"."gallery_access_requests" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."gallery_permissions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."image_permissions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."images" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."invitations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."match_interactions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."matches" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."media_access_logs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."messages" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."moderation_logs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."notification_history" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."notification_preferences" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."pending_rewards" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."post_comments" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."post_likes" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."post_shares" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."posts" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."referral_rewards" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."reports" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."system_metrics" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."token_analytics" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."tokens" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."transactions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_2fa_settings" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_device_tokens" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_likes" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_notification_preferences" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_roles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_staking" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_tokens" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";









GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";











































































































































































GRANT ALL ON FUNCTION "public"."audit_suspicious_transactions"() TO "anon";
GRANT ALL ON FUNCTION "public"."audit_suspicious_transactions"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."audit_suspicious_transactions"() TO "service_role";



GRANT ALL ON FUNCTION "public"."claim_world_id_reward"("user_id_param" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."claim_world_id_reward"("user_id_param" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."claim_world_id_reward"("user_id_param" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."complete_staking"("staking_id_param" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."complete_staking"("staking_id_param" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."complete_staking"("staking_id_param" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."create_notification"("notification_type" "text", "title" "text", "body" "text", "user_id" "uuid", "data" "jsonb") TO "anon";
GRANT ALL ON FUNCTION "public"."create_notification"("notification_type" "text", "title" "text", "body" "text", "user_id" "uuid", "data" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_notification"("notification_type" "text", "title" "text", "body" "text", "user_id" "uuid", "data" "jsonb") TO "service_role";



GRANT ALL ON FUNCTION "public"."create_post"("p_user_id" "uuid", "p_profile_id" "uuid", "p_content" "text", "p_post_type" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."create_post"("p_user_id" "uuid", "p_profile_id" "uuid", "p_content" "text", "p_post_type" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_post"("p_user_id" "uuid", "p_profile_id" "uuid", "p_content" "text", "p_post_type" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."create_post"("p_user_id" "uuid", "p_profile_id" "uuid", "p_content" "text", "p_post_type" "text", "p_image_url" "text", "p_video_url" "text", "p_location" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."create_post"("p_user_id" "uuid", "p_profile_id" "uuid", "p_content" "text", "p_post_type" "text", "p_image_url" "text", "p_video_url" "text", "p_location" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_post"("p_user_id" "uuid", "p_profile_id" "uuid", "p_content" "text", "p_post_type" "text", "p_image_url" "text", "p_video_url" "text", "p_location" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."create_user_tokens"() TO "anon";
GRANT ALL ON FUNCTION "public"."create_user_tokens"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_user_tokens"() TO "service_role";



GRANT ALL ON FUNCTION "public"."generate_referral_code"("user_uuid" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."generate_referral_code"("user_uuid" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."generate_referral_code"("user_uuid" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_couple_profile_by_user_id"("user_uuid" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_couple_profile_by_user_id"("user_uuid" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_couple_profile_by_user_id"("user_uuid" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_post_comments"("post_uuid" "uuid", "page_limit" integer, "page_offset" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_post_comments"("post_uuid" "uuid", "page_limit" integer, "page_offset" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_post_comments"("post_uuid" "uuid", "page_limit" integer, "page_offset" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_potential_matches"("user_id_param" "uuid", "limit_param" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_potential_matches"("user_id_param" "uuid", "limit_param" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_potential_matches"("user_id_param" "uuid", "limit_param" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_user_feed"("user_id_param" "uuid", "limit_param" integer, "offset_param" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_user_feed"("user_id_param" "uuid", "limit_param" integer, "offset_param" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_user_feed"("user_id_param" "uuid", "limit_param" integer, "offset_param" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_user_matches"("user_id_param" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_user_matches"("user_id_param" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_user_matches"("user_id_param" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."process_referral_reward"("referral_code_param" "text", "new_user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."process_referral_reward"("referral_code_param" "text", "new_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."process_referral_reward"("referral_code_param" "text", "new_user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."remove_post_like"("p_post_id" "uuid", "p_user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."remove_post_like"("p_post_id" "uuid", "p_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."remove_post_like"("p_post_id" "uuid", "p_user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."reset_monthly_limits"() TO "anon";
GRANT ALL ON FUNCTION "public"."reset_monthly_limits"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."reset_monthly_limits"() TO "service_role";



GRANT ALL ON FUNCTION "public"."set_updated_at_reports"() TO "anon";
GRANT ALL ON FUNCTION "public"."set_updated_at_reports"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_updated_at_reports"() TO "service_role";



GRANT ALL ON FUNCTION "public"."set_updated_at_tokens"() TO "anon";
GRANT ALL ON FUNCTION "public"."set_updated_at_tokens"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_updated_at_tokens"() TO "service_role";



GRANT ALL ON FUNCTION "public"."start_staking"("user_id_param" "uuid", "amount_param" integer, "duration_days" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."start_staking"("user_id_param" "uuid", "amount_param" integer, "duration_days" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."start_staking"("user_id_param" "uuid", "amount_param" integer, "duration_days" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."toggle_post_like"("p_post_id" "uuid", "p_user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."toggle_post_like"("p_post_id" "uuid", "p_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."toggle_post_like"("p_post_id" "uuid", "p_user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."update_comment_likes_count"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_comment_likes_count"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_comment_likes_count"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_couple_profiles_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_couple_profiles_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_couple_profiles_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_post_comments_count"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_post_comments_count"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_post_comments_count"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_post_likes_count"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_post_likes_count"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_post_likes_count"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_post_shares_count"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_post_shares_count"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_post_shares_count"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_user_tokens_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_user_tokens_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_user_tokens_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."validate_token_modification"() TO "anon";
GRANT ALL ON FUNCTION "public"."validate_token_modification"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."validate_token_modification"() TO "service_role";


















GRANT ALL ON TABLE "public"."audit_logs" TO "anon";
GRANT ALL ON TABLE "public"."audit_logs" TO "authenticated";
GRANT ALL ON TABLE "public"."audit_logs" TO "service_role";



GRANT ALL ON TABLE "public"."chat_invitations" TO "anon";
GRANT ALL ON TABLE "public"."chat_invitations" TO "authenticated";
GRANT ALL ON TABLE "public"."chat_invitations" TO "service_role";



GRANT ALL ON TABLE "public"."chat_members" TO "anon";
GRANT ALL ON TABLE "public"."chat_members" TO "authenticated";
GRANT ALL ON TABLE "public"."chat_members" TO "service_role";



GRANT ALL ON TABLE "public"."chat_messages" TO "anon";
GRANT ALL ON TABLE "public"."chat_messages" TO "authenticated";
GRANT ALL ON TABLE "public"."chat_messages" TO "service_role";



GRANT ALL ON TABLE "public"."chat_rooms" TO "anon";
GRANT ALL ON TABLE "public"."chat_rooms" TO "authenticated";
GRANT ALL ON TABLE "public"."chat_rooms" TO "service_role";



GRANT ALL ON TABLE "public"."comment_likes" TO "anon";
GRANT ALL ON TABLE "public"."comment_likes" TO "authenticated";
GRANT ALL ON TABLE "public"."comment_likes" TO "service_role";



GRANT ALL ON TABLE "public"."couple_profiles" TO "anon";
GRANT ALL ON TABLE "public"."couple_profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."couple_profiles" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";



GRANT ALL ON TABLE "public"."couple_profiles_with_partners" TO "anon";
GRANT ALL ON TABLE "public"."couple_profiles_with_partners" TO "authenticated";
GRANT ALL ON TABLE "public"."couple_profiles_with_partners" TO "service_role";



GRANT ALL ON TABLE "public"."gallery_access_requests" TO "anon";
GRANT ALL ON TABLE "public"."gallery_access_requests" TO "authenticated";
GRANT ALL ON TABLE "public"."gallery_access_requests" TO "service_role";



GRANT ALL ON TABLE "public"."gallery_permissions" TO "anon";
GRANT ALL ON TABLE "public"."gallery_permissions" TO "authenticated";
GRANT ALL ON TABLE "public"."gallery_permissions" TO "service_role";



GRANT ALL ON TABLE "public"."image_permissions" TO "anon";
GRANT ALL ON TABLE "public"."image_permissions" TO "authenticated";
GRANT ALL ON TABLE "public"."image_permissions" TO "service_role";



GRANT ALL ON TABLE "public"."images" TO "anon";
GRANT ALL ON TABLE "public"."images" TO "authenticated";
GRANT ALL ON TABLE "public"."images" TO "service_role";



GRANT ALL ON TABLE "public"."invitations" TO "anon";
GRANT ALL ON TABLE "public"."invitations" TO "authenticated";
GRANT ALL ON TABLE "public"."invitations" TO "service_role";



GRANT ALL ON TABLE "public"."match_interactions" TO "anon";
GRANT ALL ON TABLE "public"."match_interactions" TO "authenticated";
GRANT ALL ON TABLE "public"."match_interactions" TO "service_role";



GRANT ALL ON TABLE "public"."matches" TO "anon";
GRANT ALL ON TABLE "public"."matches" TO "authenticated";
GRANT ALL ON TABLE "public"."matches" TO "service_role";



GRANT ALL ON TABLE "public"."media_access_logs" TO "anon";
GRANT ALL ON TABLE "public"."media_access_logs" TO "authenticated";
GRANT ALL ON TABLE "public"."media_access_logs" TO "service_role";



GRANT ALL ON TABLE "public"."messages" TO "anon";
GRANT ALL ON TABLE "public"."messages" TO "authenticated";
GRANT ALL ON TABLE "public"."messages" TO "service_role";



GRANT ALL ON TABLE "public"."moderation_logs" TO "anon";
GRANT ALL ON TABLE "public"."moderation_logs" TO "authenticated";
GRANT ALL ON TABLE "public"."moderation_logs" TO "service_role";



GRANT ALL ON TABLE "public"."notification_history" TO "anon";
GRANT ALL ON TABLE "public"."notification_history" TO "authenticated";
GRANT ALL ON TABLE "public"."notification_history" TO "service_role";



GRANT ALL ON TABLE "public"."notification_preferences" TO "anon";
GRANT ALL ON TABLE "public"."notification_preferences" TO "authenticated";
GRANT ALL ON TABLE "public"."notification_preferences" TO "service_role";



GRANT ALL ON TABLE "public"."pending_rewards" TO "anon";
GRANT ALL ON TABLE "public"."pending_rewards" TO "authenticated";
GRANT ALL ON TABLE "public"."pending_rewards" TO "service_role";



GRANT ALL ON TABLE "public"."post_comments" TO "anon";
GRANT ALL ON TABLE "public"."post_comments" TO "authenticated";
GRANT ALL ON TABLE "public"."post_comments" TO "service_role";



GRANT ALL ON TABLE "public"."post_likes" TO "anon";
GRANT ALL ON TABLE "public"."post_likes" TO "authenticated";
GRANT ALL ON TABLE "public"."post_likes" TO "service_role";



GRANT ALL ON TABLE "public"."post_shares" TO "anon";
GRANT ALL ON TABLE "public"."post_shares" TO "authenticated";
GRANT ALL ON TABLE "public"."post_shares" TO "service_role";



GRANT ALL ON TABLE "public"."posts" TO "anon";
GRANT ALL ON TABLE "public"."posts" TO "authenticated";
GRANT ALL ON TABLE "public"."posts" TO "service_role";



GRANT ALL ON TABLE "public"."transactions" TO "anon";
GRANT ALL ON TABLE "public"."transactions" TO "authenticated";
GRANT ALL ON TABLE "public"."transactions" TO "service_role";



GRANT ALL ON TABLE "public"."recent_transactions" TO "anon";
GRANT ALL ON TABLE "public"."recent_transactions" TO "authenticated";
GRANT ALL ON TABLE "public"."recent_transactions" TO "service_role";



GRANT ALL ON TABLE "public"."referral_rewards" TO "anon";
GRANT ALL ON TABLE "public"."referral_rewards" TO "authenticated";
GRANT ALL ON TABLE "public"."referral_rewards" TO "service_role";



GRANT ALL ON TABLE "public"."reports" TO "anon";
GRANT ALL ON TABLE "public"."reports" TO "authenticated";
GRANT ALL ON TABLE "public"."reports" TO "service_role";



GRANT ALL ON TABLE "public"."system_metrics" TO "anon";
GRANT ALL ON TABLE "public"."system_metrics" TO "authenticated";
GRANT ALL ON TABLE "public"."system_metrics" TO "service_role";



GRANT ALL ON TABLE "public"."token_analytics" TO "anon";
GRANT ALL ON TABLE "public"."token_analytics" TO "authenticated";
GRANT ALL ON TABLE "public"."token_analytics" TO "service_role";



GRANT ALL ON TABLE "public"."tokens" TO "anon";
GRANT ALL ON TABLE "public"."tokens" TO "authenticated";
GRANT ALL ON TABLE "public"."tokens" TO "service_role";



GRANT ALL ON TABLE "public"."user_2fa_settings" TO "anon";
GRANT ALL ON TABLE "public"."user_2fa_settings" TO "authenticated";
GRANT ALL ON TABLE "public"."user_2fa_settings" TO "service_role";



GRANT ALL ON TABLE "public"."user_device_tokens" TO "anon";
GRANT ALL ON TABLE "public"."user_device_tokens" TO "authenticated";
GRANT ALL ON TABLE "public"."user_device_tokens" TO "service_role";



GRANT ALL ON TABLE "public"."user_likes" TO "anon";
GRANT ALL ON TABLE "public"."user_likes" TO "authenticated";
GRANT ALL ON TABLE "public"."user_likes" TO "service_role";



GRANT ALL ON TABLE "public"."user_notification_preferences" TO "anon";
GRANT ALL ON TABLE "public"."user_notification_preferences" TO "authenticated";
GRANT ALL ON TABLE "public"."user_notification_preferences" TO "service_role";



GRANT ALL ON TABLE "public"."user_roles" TO "anon";
GRANT ALL ON TABLE "public"."user_roles" TO "authenticated";
GRANT ALL ON TABLE "public"."user_roles" TO "service_role";



GRANT ALL ON TABLE "public"."user_staking" TO "anon";
GRANT ALL ON TABLE "public"."user_staking" TO "authenticated";
GRANT ALL ON TABLE "public"."user_staking" TO "service_role";



GRANT ALL ON TABLE "public"."user_staking_summary" TO "anon";
GRANT ALL ON TABLE "public"."user_staking_summary" TO "authenticated";
GRANT ALL ON TABLE "public"."user_staking_summary" TO "service_role";



GRANT ALL ON TABLE "public"."user_tokens" TO "anon";
GRANT ALL ON TABLE "public"."user_tokens" TO "authenticated";
GRANT ALL ON TABLE "public"."user_tokens" TO "service_role";



GRANT ALL ON TABLE "public"."user_token_balances" TO "anon";
GRANT ALL ON TABLE "public"."user_token_balances" TO "authenticated";
GRANT ALL ON TABLE "public"."user_token_balances" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "service_role";






























RESET ALL;
