create type "public"."relationship_type" as enum ('man-woman', 'man-man', 'woman-woman');

create sequence "public"."apk_downloads_id_seq";

create sequence "public"."app_metrics_id_seq";

create sequence "public"."compatibility_scores_id_seq";

create sequence "public"."explicit_preferences_id_seq";

create sequence "public"."faq_items_id_seq";

create sequence "public"."notifications_id_seq";

create sequence "public"."subscribers_id_seq";

create sequence "public"."swinger_interests_id_seq";

create sequence "public"."user_explicit_preferences_id_seq";

create sequence "public"."user_interests_id_seq";

drop trigger if exists "update_couple_events_updated_at" on "public"."couple_events";

drop trigger if exists "update_couple_matches_updated_at" on "public"."couple_matches";

drop trigger if exists "update_profiles_updated_at" on "public"."profiles";

drop policy "System can insert analytics events" on "public"."analytics_events";

drop policy "Users can view their own analytics" on "public"."analytics_events";

drop policy "Users can manage their own biometric sessions" on "public"."biometric_sessions";

drop policy "Admins can manage blocked IPs" on "public"."blocked_ips";

drop policy "Admins can manage cache statistics" on "public"."cache_statistics";

drop policy "Users can manage events for their couples" on "public"."couple_events";

drop policy "Users can view public events" on "public"."couple_events";

drop policy "Users can create interactions for their couples" on "public"."couple_interactions";

drop policy "Users can view interactions involving their couples" on "public"."couple_interactions";

drop policy "Users can create matches for their couples" on "public"."couple_matches";

drop policy "Users can view matches involving their couples" on "public"."couple_matches";

drop policy "Users can manage their own couple profiles" on "public"."couple_profiles";

drop policy "Users can view active couple profiles" on "public"."couple_profiles";

drop policy "Admins can manage all profiles" on "public"."profiles";

drop policy "Users can manage their own profile" on "public"."profiles";

drop policy "Users can view public profiles" on "public"."profiles";

drop policy "Admins can manage security events" on "public"."security_events";

revoke delete on table "public"."analytics_events" from "anon";

revoke insert on table "public"."analytics_events" from "anon";

revoke references on table "public"."analytics_events" from "anon";

revoke select on table "public"."analytics_events" from "anon";

revoke trigger on table "public"."analytics_events" from "anon";

revoke truncate on table "public"."analytics_events" from "anon";

revoke update on table "public"."analytics_events" from "anon";

revoke delete on table "public"."analytics_events" from "authenticated";

revoke insert on table "public"."analytics_events" from "authenticated";

revoke references on table "public"."analytics_events" from "authenticated";

revoke select on table "public"."analytics_events" from "authenticated";

revoke trigger on table "public"."analytics_events" from "authenticated";

revoke truncate on table "public"."analytics_events" from "authenticated";

revoke update on table "public"."analytics_events" from "authenticated";

revoke delete on table "public"."analytics_events" from "service_role";

revoke insert on table "public"."analytics_events" from "service_role";

revoke references on table "public"."analytics_events" from "service_role";

revoke select on table "public"."analytics_events" from "service_role";

revoke trigger on table "public"."analytics_events" from "service_role";

revoke truncate on table "public"."analytics_events" from "service_role";

revoke update on table "public"."analytics_events" from "service_role";

revoke delete on table "public"."biometric_sessions" from "anon";

revoke insert on table "public"."biometric_sessions" from "anon";

revoke references on table "public"."biometric_sessions" from "anon";

revoke select on table "public"."biometric_sessions" from "anon";

revoke trigger on table "public"."biometric_sessions" from "anon";

revoke truncate on table "public"."biometric_sessions" from "anon";

revoke update on table "public"."biometric_sessions" from "anon";

revoke delete on table "public"."biometric_sessions" from "authenticated";

revoke insert on table "public"."biometric_sessions" from "authenticated";

revoke references on table "public"."biometric_sessions" from "authenticated";

revoke select on table "public"."biometric_sessions" from "authenticated";

revoke trigger on table "public"."biometric_sessions" from "authenticated";

revoke truncate on table "public"."biometric_sessions" from "authenticated";

revoke update on table "public"."biometric_sessions" from "authenticated";

revoke delete on table "public"."biometric_sessions" from "service_role";

revoke insert on table "public"."biometric_sessions" from "service_role";

revoke references on table "public"."biometric_sessions" from "service_role";

revoke select on table "public"."biometric_sessions" from "service_role";

revoke trigger on table "public"."biometric_sessions" from "service_role";

revoke truncate on table "public"."biometric_sessions" from "service_role";

revoke update on table "public"."biometric_sessions" from "service_role";

revoke delete on table "public"."blocked_ips" from "anon";

revoke insert on table "public"."blocked_ips" from "anon";

revoke references on table "public"."blocked_ips" from "anon";

revoke select on table "public"."blocked_ips" from "anon";

revoke trigger on table "public"."blocked_ips" from "anon";

revoke truncate on table "public"."blocked_ips" from "anon";

revoke update on table "public"."blocked_ips" from "anon";

revoke delete on table "public"."blocked_ips" from "authenticated";

revoke insert on table "public"."blocked_ips" from "authenticated";

revoke references on table "public"."blocked_ips" from "authenticated";

revoke select on table "public"."blocked_ips" from "authenticated";

revoke trigger on table "public"."blocked_ips" from "authenticated";

revoke truncate on table "public"."blocked_ips" from "authenticated";

revoke update on table "public"."blocked_ips" from "authenticated";

revoke delete on table "public"."blocked_ips" from "service_role";

revoke insert on table "public"."blocked_ips" from "service_role";

revoke references on table "public"."blocked_ips" from "service_role";

revoke select on table "public"."blocked_ips" from "service_role";

revoke trigger on table "public"."blocked_ips" from "service_role";

revoke truncate on table "public"."blocked_ips" from "service_role";

revoke update on table "public"."blocked_ips" from "service_role";

revoke delete on table "public"."cache_statistics" from "anon";

revoke insert on table "public"."cache_statistics" from "anon";

revoke references on table "public"."cache_statistics" from "anon";

revoke select on table "public"."cache_statistics" from "anon";

revoke trigger on table "public"."cache_statistics" from "anon";

revoke truncate on table "public"."cache_statistics" from "anon";

revoke update on table "public"."cache_statistics" from "anon";

revoke delete on table "public"."cache_statistics" from "authenticated";

revoke insert on table "public"."cache_statistics" from "authenticated";

revoke references on table "public"."cache_statistics" from "authenticated";

revoke select on table "public"."cache_statistics" from "authenticated";

revoke trigger on table "public"."cache_statistics" from "authenticated";

revoke truncate on table "public"."cache_statistics" from "authenticated";

revoke update on table "public"."cache_statistics" from "authenticated";

revoke delete on table "public"."cache_statistics" from "service_role";

revoke insert on table "public"."cache_statistics" from "service_role";

revoke references on table "public"."cache_statistics" from "service_role";

revoke select on table "public"."cache_statistics" from "service_role";

revoke trigger on table "public"."cache_statistics" from "service_role";

revoke truncate on table "public"."cache_statistics" from "service_role";

revoke update on table "public"."cache_statistics" from "service_role";

revoke delete on table "public"."couple_events" from "anon";

revoke insert on table "public"."couple_events" from "anon";

revoke references on table "public"."couple_events" from "anon";

revoke select on table "public"."couple_events" from "anon";

revoke trigger on table "public"."couple_events" from "anon";

revoke truncate on table "public"."couple_events" from "anon";

revoke update on table "public"."couple_events" from "anon";

revoke delete on table "public"."couple_events" from "authenticated";

revoke insert on table "public"."couple_events" from "authenticated";

revoke references on table "public"."couple_events" from "authenticated";

revoke select on table "public"."couple_events" from "authenticated";

revoke trigger on table "public"."couple_events" from "authenticated";

revoke truncate on table "public"."couple_events" from "authenticated";

revoke update on table "public"."couple_events" from "authenticated";

revoke delete on table "public"."couple_events" from "service_role";

revoke insert on table "public"."couple_events" from "service_role";

revoke references on table "public"."couple_events" from "service_role";

revoke select on table "public"."couple_events" from "service_role";

revoke trigger on table "public"."couple_events" from "service_role";

revoke truncate on table "public"."couple_events" from "service_role";

revoke update on table "public"."couple_events" from "service_role";

revoke delete on table "public"."couple_interactions" from "anon";

revoke insert on table "public"."couple_interactions" from "anon";

revoke references on table "public"."couple_interactions" from "anon";

revoke select on table "public"."couple_interactions" from "anon";

revoke trigger on table "public"."couple_interactions" from "anon";

revoke truncate on table "public"."couple_interactions" from "anon";

revoke update on table "public"."couple_interactions" from "anon";

revoke delete on table "public"."couple_interactions" from "authenticated";

revoke insert on table "public"."couple_interactions" from "authenticated";

revoke references on table "public"."couple_interactions" from "authenticated";

revoke select on table "public"."couple_interactions" from "authenticated";

revoke trigger on table "public"."couple_interactions" from "authenticated";

revoke truncate on table "public"."couple_interactions" from "authenticated";

revoke update on table "public"."couple_interactions" from "authenticated";

revoke delete on table "public"."couple_interactions" from "service_role";

revoke insert on table "public"."couple_interactions" from "service_role";

revoke references on table "public"."couple_interactions" from "service_role";

revoke select on table "public"."couple_interactions" from "service_role";

revoke trigger on table "public"."couple_interactions" from "service_role";

revoke truncate on table "public"."couple_interactions" from "service_role";

revoke update on table "public"."couple_interactions" from "service_role";

revoke delete on table "public"."couple_matches" from "anon";

revoke insert on table "public"."couple_matches" from "anon";

revoke references on table "public"."couple_matches" from "anon";

revoke select on table "public"."couple_matches" from "anon";

revoke trigger on table "public"."couple_matches" from "anon";

revoke truncate on table "public"."couple_matches" from "anon";

revoke update on table "public"."couple_matches" from "anon";

revoke delete on table "public"."couple_matches" from "authenticated";

revoke insert on table "public"."couple_matches" from "authenticated";

revoke references on table "public"."couple_matches" from "authenticated";

revoke select on table "public"."couple_matches" from "authenticated";

revoke trigger on table "public"."couple_matches" from "authenticated";

revoke truncate on table "public"."couple_matches" from "authenticated";

revoke update on table "public"."couple_matches" from "authenticated";

revoke delete on table "public"."couple_matches" from "service_role";

revoke insert on table "public"."couple_matches" from "service_role";

revoke references on table "public"."couple_matches" from "service_role";

revoke select on table "public"."couple_matches" from "service_role";

revoke trigger on table "public"."couple_matches" from "service_role";

revoke truncate on table "public"."couple_matches" from "service_role";

revoke update on table "public"."couple_matches" from "service_role";

revoke delete on table "public"."couple_profiles" from "anon";

revoke insert on table "public"."couple_profiles" from "anon";

revoke references on table "public"."couple_profiles" from "anon";

revoke select on table "public"."couple_profiles" from "anon";

revoke trigger on table "public"."couple_profiles" from "anon";

revoke truncate on table "public"."couple_profiles" from "anon";

revoke update on table "public"."couple_profiles" from "anon";

revoke delete on table "public"."couple_profiles" from "authenticated";

revoke insert on table "public"."couple_profiles" from "authenticated";

revoke references on table "public"."couple_profiles" from "authenticated";

revoke select on table "public"."couple_profiles" from "authenticated";

revoke trigger on table "public"."couple_profiles" from "authenticated";

revoke truncate on table "public"."couple_profiles" from "authenticated";

revoke update on table "public"."couple_profiles" from "authenticated";

revoke delete on table "public"."couple_profiles" from "service_role";

revoke insert on table "public"."couple_profiles" from "service_role";

revoke references on table "public"."couple_profiles" from "service_role";

revoke select on table "public"."couple_profiles" from "service_role";

revoke trigger on table "public"."couple_profiles" from "service_role";

revoke truncate on table "public"."couple_profiles" from "service_role";

revoke update on table "public"."couple_profiles" from "service_role";

revoke delete on table "public"."profiles" from "anon";

revoke insert on table "public"."profiles" from "anon";

revoke references on table "public"."profiles" from "anon";

revoke select on table "public"."profiles" from "anon";

revoke trigger on table "public"."profiles" from "anon";

revoke truncate on table "public"."profiles" from "anon";

revoke update on table "public"."profiles" from "anon";

revoke delete on table "public"."profiles" from "authenticated";

revoke insert on table "public"."profiles" from "authenticated";

revoke references on table "public"."profiles" from "authenticated";

revoke select on table "public"."profiles" from "authenticated";

revoke trigger on table "public"."profiles" from "authenticated";

revoke truncate on table "public"."profiles" from "authenticated";

revoke update on table "public"."profiles" from "authenticated";

revoke delete on table "public"."profiles" from "service_role";

revoke insert on table "public"."profiles" from "service_role";

revoke references on table "public"."profiles" from "service_role";

revoke select on table "public"."profiles" from "service_role";

revoke trigger on table "public"."profiles" from "service_role";

revoke truncate on table "public"."profiles" from "service_role";

revoke update on table "public"."profiles" from "service_role";

revoke delete on table "public"."security_events" from "anon";

revoke insert on table "public"."security_events" from "anon";

revoke references on table "public"."security_events" from "anon";

revoke select on table "public"."security_events" from "anon";

revoke trigger on table "public"."security_events" from "anon";

revoke truncate on table "public"."security_events" from "anon";

revoke update on table "public"."security_events" from "anon";

revoke delete on table "public"."security_events" from "authenticated";

revoke insert on table "public"."security_events" from "authenticated";

revoke references on table "public"."security_events" from "authenticated";

revoke select on table "public"."security_events" from "authenticated";

revoke trigger on table "public"."security_events" from "authenticated";

revoke truncate on table "public"."security_events" from "authenticated";

revoke update on table "public"."security_events" from "authenticated";

revoke delete on table "public"."security_events" from "service_role";

revoke insert on table "public"."security_events" from "service_role";

revoke references on table "public"."security_events" from "service_role";

revoke select on table "public"."security_events" from "service_role";

revoke trigger on table "public"."security_events" from "service_role";

revoke truncate on table "public"."security_events" from "service_role";

revoke update on table "public"."security_events" from "service_role";

revoke delete on table "public"."spatial_ref_sys" from "anon";

revoke insert on table "public"."spatial_ref_sys" from "anon";

revoke references on table "public"."spatial_ref_sys" from "anon";

revoke select on table "public"."spatial_ref_sys" from "anon";

revoke trigger on table "public"."spatial_ref_sys" from "anon";

revoke truncate on table "public"."spatial_ref_sys" from "anon";

revoke update on table "public"."spatial_ref_sys" from "anon";

revoke delete on table "public"."spatial_ref_sys" from "authenticated";

revoke insert on table "public"."spatial_ref_sys" from "authenticated";

revoke references on table "public"."spatial_ref_sys" from "authenticated";

revoke select on table "public"."spatial_ref_sys" from "authenticated";

revoke trigger on table "public"."spatial_ref_sys" from "authenticated";

revoke truncate on table "public"."spatial_ref_sys" from "authenticated";

revoke update on table "public"."spatial_ref_sys" from "authenticated";

revoke delete on table "public"."spatial_ref_sys" from "postgres";

revoke insert on table "public"."spatial_ref_sys" from "postgres";

revoke references on table "public"."spatial_ref_sys" from "postgres";

revoke select on table "public"."spatial_ref_sys" from "postgres";

revoke trigger on table "public"."spatial_ref_sys" from "postgres";

revoke truncate on table "public"."spatial_ref_sys" from "postgres";

revoke update on table "public"."spatial_ref_sys" from "postgres";

revoke delete on table "public"."spatial_ref_sys" from "service_role";

revoke insert on table "public"."spatial_ref_sys" from "service_role";

revoke references on table "public"."spatial_ref_sys" from "service_role";

revoke select on table "public"."spatial_ref_sys" from "service_role";

revoke trigger on table "public"."spatial_ref_sys" from "service_role";

revoke truncate on table "public"."spatial_ref_sys" from "service_role";

revoke update on table "public"."spatial_ref_sys" from "service_role";

alter table "public"."analytics_events" drop constraint "analytics_events_user_id_fkey";

alter table "public"."biometric_sessions" drop constraint "biometric_sessions_confidence_check";

alter table "public"."biometric_sessions" drop constraint "biometric_sessions_session_id_key";

alter table "public"."biometric_sessions" drop constraint "biometric_sessions_session_type_check";

alter table "public"."biometric_sessions" drop constraint "biometric_sessions_user_id_fkey";

alter table "public"."blocked_ips" drop constraint "blocked_ips_ip_address_key";

alter table "public"."cache_statistics" drop constraint "cache_statistics_cache_type_check";

alter table "public"."couple_matches" drop constraint "couple_matches_couple1_id_couple2_id_key";

alter table "public"."couple_profiles" drop constraint "couple_profiles_partner1_id_partner2_id_key";

alter table "public"."profiles" drop constraint "profiles_age_check";

alter table "public"."profiles" drop constraint "profiles_email_key";

alter table "public"."profiles" drop constraint "profiles_gender_check";

alter table "public"."profiles" drop constraint "profiles_user_id_key";

alter table "public"."couple_events" drop constraint "couple_events_event_type_check";

alter table "public"."couple_interactions" drop constraint "couple_interactions_interaction_type_check";

alter table "public"."couple_matches" drop constraint "couple_matches_status_check";

alter table "public"."profiles" drop constraint "profiles_role_check";

alter table "public"."security_events" drop constraint "security_events_event_type_check";

alter table "public"."security_events" drop constraint "security_events_resolved_by_fkey";

alter table "public"."security_events" drop constraint "security_events_severity_check";

alter table "public"."security_events" drop constraint "security_events_user_id_fkey";

drop function if exists "public"."find_couples_by_compatibility"(couple_id uuid, limit_count integer);

drop function if exists "public"."find_couples_by_proximity"(lat numeric, lng numeric, max_distance integer, limit_count integer);

drop type "public"."geometry_dump";

drop type "public"."valid_detail";

alter table "public"."analytics_events" drop constraint "analytics_events_pkey";

alter table "public"."biometric_sessions" drop constraint "biometric_sessions_pkey";

alter table "public"."cache_statistics" drop constraint "cache_statistics_pkey";

drop index if exists "public"."analytics_events_pkey";

drop index if exists "public"."biometric_sessions_pkey";

drop index if exists "public"."biometric_sessions_session_id_key";

drop index if exists "public"."blocked_ips_ip_address_key";

drop index if exists "public"."cache_statistics_pkey";

drop index if exists "public"."couple_matches_couple1_id_couple2_id_key";

drop index if exists "public"."couple_profiles_partner1_id_partner2_id_key";

drop index if exists "public"."idx_analytics_events_session";

drop index if exists "public"."idx_analytics_events_timestamp";

drop index if exists "public"."idx_analytics_events_type";

drop index if exists "public"."idx_analytics_events_user";

drop index if exists "public"."idx_biometric_sessions_active";

drop index if exists "public"."idx_biometric_sessions_expires";

drop index if exists "public"."idx_biometric_sessions_session";

drop index if exists "public"."idx_biometric_sessions_user";

drop index if exists "public"."idx_blocked_ips_address";

drop index if exists "public"."idx_blocked_ips_expires";

drop index if exists "public"."idx_cache_stats_accessed";

drop index if exists "public"."idx_cache_stats_key";

drop index if exists "public"."idx_cache_stats_type";

drop index if exists "public"."idx_couple_events_couple";

drop index if exists "public"."idx_couple_interactions_couple";

drop index if exists "public"."idx_couple_interactions_created";

drop index if exists "public"."idx_couple_interactions_target";

drop index if exists "public"."idx_couple_matches_couple1";

drop index if exists "public"."idx_couple_matches_couple2";

drop index if exists "public"."idx_couple_matches_score";

drop index if exists "public"."idx_couple_profiles_active";

drop index if exists "public"."idx_couple_profiles_location";

drop index if exists "public"."idx_couple_profiles_verified";

drop index if exists "public"."idx_profiles_active";

drop index if exists "public"."idx_profiles_email";

drop index if exists "public"."idx_security_events_type";

drop index if exists "public"."idx_security_events_user";

drop index if exists "public"."profiles_email_key";

drop index if exists "public"."profiles_user_id_key";

drop table "public"."analytics_events";

drop table "public"."biometric_sessions";

drop table "public"."cache_statistics";

create table "public"."apk_downloads" (
    "id" integer not null default nextval('apk_downloads_id_seq'::regclass),
    "user_id" uuid,
    "ip_address" inet,
    "user_agent" text,
    "download_source" character varying(50) default 'direct'::character varying,
    "version" character varying(20),
    "created_at" timestamp with time zone default now()
);


alter table "public"."apk_downloads" enable row level security;

create table "public"."app_metrics" (
    "id" integer not null default nextval('app_metrics_id_seq'::regclass),
    "metric_name" character varying(100) not null,
    "metric_value" numeric(10,4) not null,
    "metric_type" character varying(50) default 'counter'::character varying,
    "recorded_at" timestamp with time zone default now(),
    "created_at" timestamp with time zone default now(),
    "metadata" jsonb default '{}'::jsonb
);


alter table "public"."app_metrics" enable row level security;

create table "public"."audit_logs" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid,
    "session_id" text,
    "ip_address" inet,
    "user_agent" text,
    "action_type" text not null,
    "resource_type" text,
    "resource_id" text,
    "action_description" text not null,
    "request_data" jsonb,
    "response_data" jsonb,
    "risk_level" text default 'low'::text,
    "fraud_score" numeric(3,2) default 0.0,
    "created_at" timestamp with time zone not null default now()
);


alter table "public"."audit_logs" enable row level security;

create table "public"."automation_rules" (
    "id" uuid not null default gen_random_uuid(),
    "name" character varying(255) not null,
    "description" text,
    "trigger" character varying(100) not null,
    "conditions" jsonb not null default '{}'::jsonb,
    "actions" jsonb not null default '{}'::jsonb,
    "enabled" boolean default true,
    "priority" integer default 1,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now(),
    "created_by" uuid,
    "last_executed_at" timestamp with time zone,
    "execution_count" integer default 0
);


alter table "public"."automation_rules" enable row level security;

create table "public"."career_applications" (
    "id" uuid not null default gen_random_uuid(),
    "nombre" text not null,
    "telefono" text not null,
    "correo" text not null,
    "domicilio" text,
    "puesto" text not null,
    "experiencia" text not null,
    "referencias" text,
    "expectativas" text not null,
    "cv_url" text,
    "status" text default 'pending'::text,
    "user_agent" text,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now(),
    "reviewed_by" uuid,
    "reviewed_at" timestamp with time zone,
    "notes" text
);


alter table "public"."career_applications" enable row level security;

create table "public"."chat_invitations" (
    "id" uuid not null default gen_random_uuid(),
    "room_id" uuid,
    "invited_by" uuid,
    "invited_user" uuid,
    "status" text default 'pending'::text,
    "created_at" timestamp with time zone default now()
);


alter table "public"."chat_invitations" enable row level security;

create table "public"."chat_members" (
    "id" uuid not null default gen_random_uuid(),
    "room_id" uuid,
    "profile_id" uuid,
    "role" text default 'member'::text,
    "joined_at" timestamp with time zone default now()
);


alter table "public"."chat_members" enable row level security;

create table "public"."chat_messages" (
    "id" uuid not null default gen_random_uuid(),
    "content" text not null,
    "message_type" text default 'text'::text,
    "room_id" uuid,
    "sender_id" uuid,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
);


alter table "public"."chat_messages" enable row level security;

create table "public"."chat_rooms" (
    "id" uuid not null default gen_random_uuid(),
    "name" text not null,
    "type" text default 'public'::text,
    "created_by" uuid,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
);


alter table "public"."chat_rooms" enable row level security;

create table "public"."comment_likes" (
    "id" uuid not null default gen_random_uuid(),
    "comment_id" uuid not null,
    "user_id" uuid not null,
    "profile_id" uuid,
    "created_at" timestamp with time zone default now()
);


alter table "public"."comment_likes" enable row level security;

create table "public"."compatibility_scores" (
    "id" integer not null default nextval('compatibility_scores_id_seq'::regclass),
    "user1_id" uuid,
    "user2_id" uuid,
    "compatibility_score" numeric(3,2),
    "shared_interests" integer default 0,
    "total_interests" integer default 0,
    "last_calculated" timestamp with time zone default now()
);


alter table "public"."compatibility_scores" enable row level security;

create table "public"."content_moderation" (
    "id" uuid not null default gen_random_uuid(),
    "content_type" text not null,
    "content_id" uuid not null,
    "user_id" uuid,
    "moderator_id" uuid,
    "status" text not null default 'pending'::text,
    "reason" text,
    "ai_confidence" numeric(3,2),
    "metadata" jsonb default '{}'::jsonb,
    "created_at" timestamp with time zone not null default now(),
    "reviewed_at" timestamp with time zone
);


alter table "public"."content_moderation" enable row level security;

create table "public"."couple_favorites" (
    "id" uuid not null default gen_random_uuid(),
    "couple_id" uuid,
    "favorite_couple_id" uuid,
    "created_at" timestamp with time zone default now()
);


alter table "public"."couple_favorites" enable row level security;

create table "public"."couple_gifts" (
    "id" uuid not null default gen_random_uuid(),
    "sender_couple_id" uuid,
    "receiver_couple_id" uuid,
    "gift_type" text not null,
    "gift_name" text not null,
    "gift_description" text,
    "gift_value" numeric(10,2),
    "is_delivered" boolean default false,
    "delivery_date" timestamp with time zone,
    "created_at" timestamp with time zone default now()
);


alter table "public"."couple_gifts" enable row level security;

create table "public"."couple_messages" (
    "id" uuid not null default gen_random_uuid(),
    "sender_couple_id" uuid,
    "receiver_couple_id" uuid,
    "message" text not null,
    "message_type" text not null,
    "is_read" boolean default false,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
);


alter table "public"."couple_messages" enable row level security;

create table "public"."couple_profile_likes" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "couple_profile_id" uuid not null,
    "liker_profile_id" uuid not null,
    "liked_at" timestamp with time zone default now()
);


alter table "public"."couple_profile_likes" enable row level security;

create table "public"."couple_profile_matches" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "couple_profile1_id" uuid not null,
    "couple_profile2_id" uuid not null,
    "matched_at" timestamp with time zone default now(),
    "is_active" boolean default true,
    "last_interaction" timestamp with time zone
);


alter table "public"."couple_profile_matches" enable row level security;

create table "public"."couple_profile_reports" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "couple_profile_id" uuid not null,
    "reporter_profile_id" uuid not null,
    "reason" character varying(50) not null,
    "description" text,
    "status" character varying(20) default 'pending'::character varying,
    "reviewed_by" uuid,
    "reviewed_at" timestamp with time zone,
    "resolution_notes" text,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
);


alter table "public"."couple_profile_reports" enable row level security;

create table "public"."couple_profile_views" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "couple_profile_id" uuid not null,
    "viewer_profile_id" uuid not null,
    "viewed_at" timestamp with time zone default now(),
    "viewed_date" date default CURRENT_DATE
);


alter table "public"."couple_profile_views" enable row level security;

create table "public"."couple_reports" (
    "id" uuid not null default gen_random_uuid(),
    "reporter_couple_id" uuid,
    "reported_couple_id" uuid,
    "report_reason" text not null,
    "report_description" text,
    "status" text not null,
    "created_at" timestamp with time zone default now(),
    "resolved_at" timestamp with time zone,
    "resolved_by" uuid
);


alter table "public"."couple_reports" enable row level security;

create table "public"."couple_statistics" (
    "id" uuid not null default gen_random_uuid(),
    "couple_id" uuid,
    "date" date not null,
    "views" integer default 0,
    "likes" integer default 0,
    "matches" integer default 0,
    "messages" integer default 0,
    "events_created" integer default 0,
    "events_joined" integer default 0,
    "created_at" timestamp with time zone default now()
);


alter table "public"."couple_statistics" enable row level security;

create table "public"."couple_verifications" (
    "id" uuid not null default gen_random_uuid(),
    "couple_id" uuid,
    "verification_type" text not null,
    "verification_status" text not null,
    "verification_data" jsonb default '{}'::jsonb,
    "verified_by" uuid,
    "created_at" timestamp with time zone default now(),
    "verified_at" timestamp with time zone
);


alter table "public"."couple_verifications" enable row level security;

create table "public"."explicit_preferences" (
    "id" integer not null default nextval('explicit_preferences_id_seq'::regclass),
    "name" character varying(100) not null,
    "category" character varying(50) not null,
    "description" text,
    "requires_verification" boolean default true,
    "is_active" boolean default true,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
);


alter table "public"."explicit_preferences" enable row level security;

create table "public"."faq_items" (
    "id" integer not null default nextval('faq_items_id_seq'::regclass),
    "question" text not null,
    "answer" text not null,
    "category" character varying(50) default 'general'::character varying,
    "is_active" boolean default true,
    "order_index" integer default 0,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
);


alter table "public"."faq_items" enable row level security;

create table "public"."follows" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "follower_user_id" uuid not null,
    "following_user_id" uuid not null,
    "created_at" timestamp with time zone default now()
);


alter table "public"."follows" enable row level security;

create table "public"."fraud_analysis" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "user_id" uuid not null,
    "transaction_id" uuid,
    "is_fraudulent" boolean not null,
    "confidence" numeric(5,2) not null,
    "patterns" text[],
    "risk_factors" text[],
    "analysis_data" jsonb default '{}'::jsonb,
    "created_at" timestamp with time zone default now()
);


alter table "public"."fraud_analysis" enable row level security;

create table "public"."gallery_access_requests" (
    "id" uuid not null default gen_random_uuid(),
    "requester_id" uuid,
    "requested_from" uuid,
    "status" text default 'pending'::text,
    "message" text,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
);


alter table "public"."gallery_access_requests" enable row level security;

create table "public"."gallery_permissions" (
    "id" uuid not null default gen_random_uuid(),
    "profile_id" uuid,
    "granted_to" uuid,
    "granted_by" uuid,
    "permission_type" text default 'view'::text,
    "created_at" timestamp with time zone default now()
);


alter table "public"."gallery_permissions" enable row level security;

create table "public"."image_permissions" (
    "id" uuid not null default gen_random_uuid(),
    "image_id" uuid,
    "granted_to" uuid,
    "granted_by" uuid,
    "granted_at" timestamp with time zone default now()
);


alter table "public"."image_permissions" enable row level security;

create table "public"."images" (
    "id" uuid not null default gen_random_uuid(),
    "profile_id" uuid,
    "url" text not null,
    "type" text default 'profile'::text,
    "is_primary" boolean default false,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
);


alter table "public"."images" enable row level security;

create table "public"."invitation_analytics" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "invitation_id" uuid not null,
    "event_type" character varying(30) not null,
    "event_data" jsonb default '{}'::jsonb,
    "ip_address" inet,
    "user_agent" text,
    "created_at" timestamp with time zone default now()
);


alter table "public"."invitation_analytics" enable row level security;

create table "public"."invitation_responses" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "invitation_id" uuid not null,
    "response_type" character varying(20) not null,
    "message" text,
    "counter_invitation_id" uuid,
    "metadata" jsonb default '{}'::jsonb,
    "created_at" timestamp with time zone default now()
);


alter table "public"."invitation_responses" enable row level security;

create table "public"."invitation_templates" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "template_name" character varying(100) not null,
    "invitation_type" character varying(20) not null,
    "template_content" text not null,
    "variables" jsonb default '{}'::jsonb,
    "is_active" boolean default true,
    "usage_count" integer default 0,
    "created_by" uuid,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
);


alter table "public"."invitation_templates" enable row level security;

create table "public"."invitations" (
    "id" uuid not null default gen_random_uuid(),
    "from_profile" uuid,
    "to_profile" uuid,
    "status" text default 'pending'::text,
    "type" text default 'connection'::text,
    "message" text,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
);


alter table "public"."invitations" enable row level security;

create table "public"."match_interactions" (
    "id" uuid not null default gen_random_uuid(),
    "match_id" uuid,
    "user_id" uuid,
    "interaction_type" text,
    "created_at" timestamp with time zone default now()
);


alter table "public"."match_interactions" enable row level security;

create table "public"."matches" (
    "id" uuid not null default gen_random_uuid(),
    "user1_id" uuid,
    "user2_id" uuid,
    "status" text default 'active'::text,
    "compatibility_score" integer default 0,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
);


alter table "public"."matches" enable row level security;

create table "public"."media_access_logs" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid,
    "media_id" uuid,
    "access_type" text not null,
    "accessed_at" timestamp with time zone default now(),
    "created_at" timestamp with time zone default now()
);


alter table "public"."media_access_logs" enable row level security;

create table "public"."messages" (
    "id" uuid not null default gen_random_uuid(),
    "room_id" uuid,
    "sender_id" uuid,
    "content" text not null,
    "message_type" text default 'text'::text,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
);


alter table "public"."messages" enable row level security;

create table "public"."moderation_logs" (
    "id" uuid not null default gen_random_uuid(),
    "moderator_id" uuid not null,
    "target_user_id" uuid,
    "action_type" text not null,
    "target_type" text not null,
    "target_id" text,
    "description" text not null,
    "previous_state" jsonb,
    "new_state" jsonb,
    "metadata" jsonb default '{}'::jsonb,
    "created_at" timestamp with time zone not null default now()
);


alter table "public"."moderation_logs" enable row level security;

create table "public"."moderator_requests" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid,
    "nombre" text not null,
    "telefono" text not null,
    "correo" text not null,
    "edad" integer not null,
    "experiencia_moderacion" text not null,
    "motivacion" text not null,
    "disponibilidad_horas" integer not null,
    "disponibilidad_horario" text not null,
    "referencias" text,
    "acepta_terminos" boolean default false,
    "status" text default 'pending'::text,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now(),
    "reviewed_by" uuid,
    "reviewed_at" timestamp with time zone,
    "rejection_reason" text,
    "notes" text
);


alter table "public"."moderator_requests" enable row level security;

create table "public"."moderators" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid,
    "status" text default 'pending'::text,
    "role" text default 'moderator'::text,
    "permissions" jsonb default '[]'::jsonb,
    "created_at" timestamp with time zone default now(),
    "activated_at" timestamp with time zone,
    "suspended_at" timestamp with time zone,
    "created_by" uuid,
    "notes" text
);


alter table "public"."moderators" enable row level security;

create table "public"."notification_history" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "notification_type" text not null,
    "title" text not null,
    "body" text not null,
    "data" jsonb default '{}'::jsonb,
    "delivery_method" text not null,
    "status" text default 'pending'::text,
    "sent_at" timestamp with time zone,
    "delivered_at" timestamp with time zone,
    "error_message" text,
    "created_at" timestamp with time zone not null default now()
);


alter table "public"."notification_history" enable row level security;

create table "public"."notification_preferences" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid,
    "notification_type" text not null,
    "enabled" boolean default true,
    "delivery_method" text default 'push'::text,
    "settings" jsonb default '{}'::jsonb,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
);


alter table "public"."notification_preferences" enable row level security;

create table "public"."notifications" (
    "id" integer not null default nextval('notifications_id_seq'::regclass),
    "user_id" uuid,
    "title" character varying(200) not null,
    "message" text not null,
    "type" character varying(50) default 'info'::character varying,
    "is_read" boolean default false,
    "data" jsonb default '{}'::jsonb,
    "created_at" timestamp with time zone default now(),
    "read_at" timestamp with time zone
);


alter table "public"."notifications" enable row level security;

create table "public"."pending_rewards" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "reward_type" text not null,
    "amount" integer not null,
    "token_type" text default 'CMPX'::text,
    "description" text not null,
    "expires_at" timestamp with time zone,
    "claimed" boolean not null default false,
    "claimed_at" timestamp with time zone,
    "created_at" timestamp with time zone not null default now()
);


alter table "public"."pending_rewards" enable row level security;

create table "public"."post_comments" (
    "id" uuid not null default gen_random_uuid(),
    "post_id" uuid not null,
    "user_id" uuid not null,
    "profile_id" uuid,
    "parent_comment_id" uuid,
    "content" text not null,
    "likes_count" integer not null default 0,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now(),
    "deleted_at" timestamp with time zone
);


alter table "public"."post_comments" enable row level security;

create table "public"."post_likes" (
    "id" uuid not null default gen_random_uuid(),
    "post_id" uuid not null,
    "user_id" uuid not null,
    "profile_id" uuid,
    "created_at" timestamp with time zone default now()
);


alter table "public"."post_likes" enable row level security;

create table "public"."post_shares" (
    "id" uuid not null default gen_random_uuid(),
    "post_id" uuid not null,
    "user_id" uuid not null,
    "profile_id" uuid,
    "share_type" character varying(20) not null default 'share'::character varying,
    "created_at" timestamp with time zone default now()
);


alter table "public"."post_shares" enable row level security;

create table "public"."posts" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "profile_id" uuid,
    "content" text not null,
    "post_type" character varying(20) not null default 'text'::character varying,
    "image_url" text,
    "video_url" text,
    "location" character varying(255),
    "is_public" boolean not null default true,
    "is_premium" boolean not null default false,
    "likes_count" integer not null default 0,
    "comments_count" integer not null default 0,
    "shares_count" integer not null default 0,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now(),
    "deleted_at" timestamp with time zone
);


alter table "public"."posts" enable row level security;

create table "public"."profile_cache" (
    "id" uuid not null default gen_random_uuid(),
    "profile_id" uuid not null,
    "cached_data" jsonb not null,
    "cache_key" text not null,
    "expires_at" timestamp with time zone not null,
    "created_at" timestamp with time zone not null default now()
);


alter table "public"."profile_cache" enable row level security;

create table "public"."referral_rewards" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid,
    "referral_code" text not null,
    "reward_type" text not null,
    "amount" numeric(10,2) not null default 0,
    "description" text,
    "claimed" boolean default false,
    "claimed_at" timestamp with time zone,
    "expires_at" timestamp with time zone,
    "created_at" timestamp with time zone default now(),
    "inviter_id" uuid,
    "invited_id" uuid,
    "status" character varying(20) default 'pending'::character varying,
    "inviter_reward_amount" bigint default 0,
    "invited_reward_amount" bigint default 0,
    "metadata" jsonb default '{}'::jsonb,
    "processed_at" timestamp with time zone
);


alter table "public"."referral_rewards" enable row level security;

create table "public"."referral_statistics" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "user_id" uuid not null,
    "referral_code" character varying(20) not null,
    "total_invites" integer not null default 0,
    "successful_invites" integer not null default 0,
    "total_earned" bigint not null default 0,
    "monthly_earned" bigint not null default 0,
    "last_invite_date" timestamp with time zone,
    "conversion_rate" numeric(5,2) default 0,
    "period_start" date not null default CURRENT_DATE,
    "period_end" date not null default (CURRENT_DATE + '1 mon'::interval),
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
);


alter table "public"."referral_statistics" enable row level security;

create table "public"."referral_transactions" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "user_id" uuid not null,
    "transaction_type" character varying(30) not null,
    "amount" bigint not null,
    "balance_before" bigint not null,
    "balance_after" bigint not null,
    "referral_code" character varying(20),
    "related_reward_id" uuid,
    "description" text,
    "metadata" jsonb default '{}'::jsonb,
    "created_at" timestamp with time zone default now()
);


alter table "public"."referral_transactions" enable row level security;

create table "public"."reports" (
    "id" uuid not null default gen_random_uuid(),
    "reporter_user_id" uuid not null,
    "reported_user_id" uuid not null,
    "content_type" text not null,
    "reported_content_id" uuid not null,
    "reason" text not null,
    "description" text,
    "severity" text default 'medium'::text,
    "status" text default 'pending'::text,
    "resolution_notes" text,
    "reviewed_at" timestamp with time zone,
    "reviewed_by" uuid,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
);


alter table "public"."reports" enable row level security;

create table "public"."roles" (
    "id" uuid not null default gen_random_uuid(),
    "name" text not null,
    "permissions" jsonb not null default '{}'::jsonb,
    "description" text,
    "is_active" boolean not null default true,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
);


alter table "public"."roles" enable row level security;

create table "public"."security" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid,
    "event_type" text not null,
    "risk_level" text not null default 'low'::text,
    "ip_address" inet,
    "user_agent" text,
    "location" jsonb,
    "details" jsonb default '{}'::jsonb,
    "resolved" boolean default false,
    "created_at" timestamp with time zone not null default now()
);


alter table "public"."security" enable row level security;

create table "public"."security_alerts" (
    "id" uuid not null default gen_random_uuid(),
    "alert_type" text not null,
    "title" text not null,
    "message" text not null,
    "severity" text not null,
    "status" text not null,
    "metadata" jsonb default '{}'::jsonb,
    "created_at" timestamp with time zone default now(),
    "acknowledged_at" timestamp with time zone,
    "acknowledged_by" uuid,
    "resolved_at" timestamp with time zone,
    "resolved_by" uuid
);


alter table "public"."security_alerts" enable row level security;

create table "public"."security_audit_logs" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "user_id" uuid not null,
    "action" character varying(100) not null,
    "resource" character varying(100) not null,
    "details" jsonb default '{}'::jsonb,
    "ip_address" inet,
    "user_agent" text,
    "risk_score" integer default 0,
    "session_id" character varying(255),
    "created_at" timestamp with time zone default now()
);


alter table "public"."security_audit_logs" enable row level security;

create table "public"."security_configurations" (
    "id" uuid not null default gen_random_uuid(),
    "config_key" text not null,
    "config_value" jsonb not null,
    "description" text,
    "updated_at" timestamp with time zone default now(),
    "updated_by" uuid
);


alter table "public"."security_configurations" enable row level security;

create table "public"."security_flags" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "user_id" uuid not null,
    "flag_type" character varying(50) not null,
    "severity" character varying(20) not null,
    "description" text not null,
    "confidence" integer not null,
    "metadata" jsonb default '{}'::jsonb,
    "is_resolved" boolean default false,
    "resolved_at" timestamp with time zone,
    "resolved_by" uuid,
    "created_at" timestamp with time zone default now()
);


alter table "public"."security_flags" enable row level security;

create table "public"."sessions" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "session_token" text not null,
    "device_info" jsonb default '{}'::jsonb,
    "ip_address" inet,
    "user_agent" text,
    "expires_at" timestamp with time zone not null,
    "last_activity" timestamp with time zone not null default now(),
    "created_at" timestamp with time zone not null default now()
);


alter table "public"."sessions" enable row level security;

create table "public"."staking_records" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "user_id" uuid not null,
    "amount" bigint not null default 0,
    "token_type" character varying(10) not null,
    "apy" numeric(5,2) not null default 0.00,
    "start_date" timestamp with time zone not null default now(),
    "end_date" timestamp with time zone,
    "status" character varying(20) not null default 'active'::character varying,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now(),
    "is_active" boolean default true,
    "rewards_earned" bigint default 0,
    "last_claimed_at" timestamp with time zone
);


alter table "public"."staking_records" enable row level security;

create table "public"."stories" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "user_id" uuid not null,
    "content_type" character varying(20) not null,
    "description" text,
    "media_url" text,
    "views_count" integer default 0,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now(),
    "likes_count" integer default 0,
    "comments_count" integer default 0,
    "shares_count" integer default 0,
    "is_public" boolean default true,
    "hashtags" text[] default '{}'::text[],
    "post_type" character varying(20) default 'story'::character varying
);


alter table "public"."stories" enable row level security;

create table "public"."story_comments" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "story_id" uuid not null,
    "user_id" uuid not null,
    "content" text not null,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now(),
    "parent_comment_id" uuid,
    "likes_count" integer default 0,
    "is_edited" boolean default false,
    "is_deleted" boolean default false,
    "metadata" jsonb default '{}'::jsonb
);


alter table "public"."story_comments" enable row level security;

create table "public"."story_likes" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "story_id" uuid not null,
    "user_id" uuid not null,
    "created_at" timestamp with time zone default now()
);


alter table "public"."story_likes" enable row level security;

create table "public"."story_reports" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "story_id" uuid not null,
    "reporter_user_id" uuid not null,
    "reason" character varying(20) not null,
    "description" text,
    "status" character varying(20) default 'pending'::character varying,
    "reviewed_by" uuid,
    "reviewed_at" timestamp with time zone,
    "resolution_notes" text,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
);


alter table "public"."story_reports" enable row level security;

create table "public"."story_shares" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "story_id" uuid not null,
    "user_id" uuid not null,
    "share_type" character varying(20) not null,
    "platform" character varying(50),
    "created_at" timestamp with time zone default now()
);


alter table "public"."story_shares" enable row level security;

create table "public"."subscribers" (
    "id" integer not null default nextval('subscribers_id_seq'::regclass),
    "email" character varying(255) not null,
    "user_id" uuid,
    "stripe_customer_id" character varying(255),
    "subscribed" boolean default false,
    "subscription_tier" character varying(50) default 'basic'::character varying,
    "subscription_end" timestamp with time zone,
    "is_trialing" boolean default false,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
);


alter table "public"."subscribers" enable row level security;

create table "public"."swinger_interests" (
    "id" integer not null default nextval('swinger_interests_id_seq'::regclass),
    "name" character varying(100) not null,
    "category" character varying(50) not null,
    "description" text,
    "is_explicit" boolean default false,
    "is_active" boolean default true,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
);


alter table "public"."swinger_interests" enable row level security;

create table "public"."system_metrics" (
    "id" uuid not null default gen_random_uuid(),
    "metric_type" text not null,
    "metric_value" numeric(10,4) not null,
    "metric_unit" text not null default 'ms'::text,
    "metadata" jsonb default '{}'::jsonb,
    "recorded_at" timestamp with time zone not null default now(),
    "created_at" timestamp with time zone not null default now(),
    "metric_name" character varying(100)
);


alter table "public"."system_metrics" enable row level security;

create table "public"."threat_detections" (
    "id" uuid not null default gen_random_uuid(),
    "threat_id" text not null,
    "threat_type" text not null,
    "severity" text not null,
    "description" text not null,
    "affected_users" uuid[] default '{}'::uuid[],
    "detected_at" timestamp with time zone default now(),
    "status" text not null,
    "mitigation_actions" text[] default '{}'::text[],
    "confidence" numeric(3,2),
    "resolved_at" timestamp with time zone,
    "resolved_by" uuid
);


alter table "public"."threat_detections" enable row level security;

create table "public"."token_analytics" (
    "id" uuid not null default gen_random_uuid(),
    "period_type" text not null,
    "period_start" timestamp with time zone not null,
    "period_end" timestamp with time zone not null,
    "total_cmpx_supply" bigint not null default 0,
    "total_gtk_supply" bigint not null default 0,
    "circulating_cmpx" bigint not null default 0,
    "circulating_gtk" bigint not null default 0,
    "transaction_count" integer not null default 0,
    "transaction_volume_cmpx" bigint not null default 0,
    "transaction_volume_gtk" bigint not null default 0,
    "total_staked_cmpx" bigint not null default 0,
    "active_stakers" integer not null default 0,
    "metadata" jsonb default '{}'::jsonb,
    "created_at" timestamp with time zone not null default now()
);


alter table "public"."token_analytics" enable row level security;

create table "public"."token_transactions" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "user_id" uuid not null,
    "transaction_type" character varying(20) not null,
    "token_type" character varying(10) not null,
    "amount" bigint not null default 0,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now(),
    "status" character varying(20) default 'completed'::character varying,
    "metadata" jsonb default '{}'::jsonb
);


alter table "public"."token_transactions" enable row level security;

create table "public"."tokens" (
    "id" uuid not null default gen_random_uuid(),
    "token_code" character varying(50) not null,
    "token_name" character varying(100) not null,
    "description" text,
    "base_value" numeric(10,2) default 0.00,
    "is_active" boolean default true,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
);


alter table "public"."tokens" enable row level security;

create table "public"."transactions" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "transaction_type" text not null,
    "token_type" text not null,
    "amount" integer not null,
    "balance_before" integer not null,
    "balance_after" integer not null,
    "description" text,
    "metadata" jsonb default '{}'::jsonb,
    "related_user_id" uuid,
    "created_at" timestamp with time zone not null default now()
);


alter table "public"."transactions" enable row level security;

create table "public"."two_factor_auth" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "user_id" uuid not null,
    "method" character varying(20) not null,
    "secret" character varying(255),
    "backup_codes" text[],
    "is_enabled" boolean default false,
    "verified_at" timestamp with time zone,
    "phone_number" character varying(20),
    "email" character varying(255),
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
);


alter table "public"."two_factor_auth" enable row level security;

create table "public"."user_2fa_settings" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "totp_secret" text,
    "totp_enabled" boolean not null default false,
    "totp_verified_at" timestamp with time zone,
    "backup_codes" text[],
    "backup_codes_used" integer not null default 0,
    "recovery_email" text,
    "recovery_phone" text,
    "last_used_at" timestamp with time zone,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
);


alter table "public"."user_2fa_settings" enable row level security;

create table "public"."user_device_tokens" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "device_token" text not null,
    "device_type" text,
    "device_info" jsonb default '{}'::jsonb,
    "is_active" boolean not null default true,
    "last_used_at" timestamp with time zone not null default now(),
    "created_at" timestamp with time zone not null default now()
);


alter table "public"."user_device_tokens" enable row level security;

create table "public"."user_explicit_preferences" (
    "id" integer not null default nextval('user_explicit_preferences_id_seq'::regclass),
    "user_id" uuid,
    "preference_id" integer,
    "privacy_level" character varying(20) default 'private'::character varying,
    "is_verified" boolean default false,
    "created_at" timestamp with time zone default now()
);


alter table "public"."user_explicit_preferences" enable row level security;

create table "public"."user_interests" (
    "id" integer not null default nextval('user_interests_id_seq'::regclass),
    "user_id" uuid,
    "interest_id" integer,
    "privacy_level" character varying(20) default 'public'::character varying,
    "created_at" timestamp with time zone default now()
);


alter table "public"."user_interests" enable row level security;

create table "public"."user_likes" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid,
    "liked_user_id" uuid,
    "liked" boolean not null,
    "created_at" timestamp with time zone default now()
);


alter table "public"."user_likes" enable row level security;

create table "public"."user_notification_preferences" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "notification_type" text not null,
    "enabled" boolean not null default true,
    "delivery_method" text default 'push'::text,
    "settings" jsonb default '{}'::jsonb,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
);


alter table "public"."user_notification_preferences" enable row level security;

create table "public"."user_referral_balances" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "user_id" uuid not null,
    "cmpx_balance" bigint not null default 0,
    "monthly_earned" bigint not null default 0,
    "last_reset_date" date not null default CURRENT_DATE,
    "referral_code" character varying(20) not null,
    "referred_by" uuid,
    "total_referrals" integer not null default 0,
    "total_earned" bigint not null default 0,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
);


alter table "public"."user_referral_balances" enable row level security;

create table "public"."user_roles" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid,
    "role" text not null default 'user'::text,
    "created_at" timestamp with time zone default now()
);


alter table "public"."user_roles" enable row level security;

create table "public"."user_sessions" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "user_id" uuid not null,
    "session_id" character varying(255) not null,
    "device_info" jsonb default '{}'::jsonb,
    "ip_address" inet,
    "user_agent" text,
    "location" jsonb default '{}'::jsonb,
    "is_active" boolean default true,
    "last_activity" timestamp with time zone default now(),
    "expires_at" timestamp with time zone not null,
    "created_at" timestamp with time zone default now()
);


alter table "public"."user_sessions" enable row level security;

create table "public"."user_staking" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "amount" integer not null,
    "start_date" timestamp with time zone not null default now(),
    "end_date" timestamp with time zone not null,
    "reward_percentage" numeric(5,2) not null default 10.00,
    "status" text default 'active'::text,
    "reward_claimed" boolean not null default false,
    "created_at" timestamp with time zone not null default now()
);


alter table "public"."user_staking" enable row level security;

create table "public"."user_token_balances" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "user_id" uuid not null,
    "cmpx_balance" bigint not null default 0,
    "gtk_balance" bigint not null default 0,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now(),
    "monthly_earned" bigint default 0,
    "monthly_limit" bigint default 1000,
    "referral_code" character varying(20),
    "referred_by" uuid,
    "total_referrals" integer default 0,
    "world_id_verified" boolean default false,
    "last_reset_date" timestamp with time zone default now()
);


alter table "public"."user_token_balances" enable row level security;

create table "public"."user_tokens" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "cmpx_balance" integer not null default 0,
    "gtk_balance" integer not null default 0,
    "cmpx_staked" integer not null default 0,
    "monthly_earned" integer not null default 0,
    "monthly_limit" integer not null default 500,
    "last_reset_date" timestamp with time zone not null default now(),
    "referral_code" text not null,
    "referred_by" uuid,
    "total_referrals" integer not null default 0,
    "world_id_verified" boolean not null default false,
    "world_id_claimed" boolean not null default false,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
);


alter table "public"."user_tokens" enable row level security;

alter table "public"."blocked_ips" alter column "blocked_by" drop default;

alter table "public"."blocked_ips" alter column "blocked_by" set not null;

alter table "public"."blocked_ips" alter column "blocked_by" set data type text using "blocked_by"::text;

alter table "public"."blocked_ips" alter column "duration" drop default;

alter table "public"."blocked_ips" alter column "duration" set not null;

alter table "public"."blocked_ips" alter column "duration" set data type text using "duration"::text;

alter table "public"."blocked_ips" alter column "id" set default gen_random_uuid();

alter table "public"."blocked_ips" alter column "reason" drop default;

alter table "public"."blocked_ips" alter column "reason" set not null;

alter table "public"."couple_events" alter column "couple_id" drop not null;

alter table "public"."couple_events" alter column "description" set not null;

alter table "public"."couple_events" alter column "event_type" set data type text using "event_type"::text;

alter table "public"."couple_events" alter column "id" set default gen_random_uuid();

alter table "public"."couple_events" alter column "location" set data type text using "location"::text;

alter table "public"."couple_events" alter column "title" set data type text using "title"::text;

alter table "public"."couple_interactions" alter column "couple_id" drop not null;

alter table "public"."couple_interactions" alter column "id" set default gen_random_uuid();

alter table "public"."couple_interactions" alter column "interaction_type" set data type text using "interaction_type"::text;

alter table "public"."couple_interactions" alter column "target_couple_id" drop not null;

alter table "public"."couple_matches" drop column "updated_at";

alter table "public"."couple_matches" alter column "couple1_id" drop not null;

alter table "public"."couple_matches" alter column "couple2_id" drop not null;

alter table "public"."couple_matches" alter column "id" set default gen_random_uuid();

alter table "public"."couple_matches" alter column "match_score" drop not null;

alter table "public"."couple_matches" alter column "status" drop default;

alter table "public"."couple_matches" alter column "status" set not null;

alter table "public"."couple_matches" alter column "status" set data type text using "status"::text;

alter table "public"."couple_profiles" drop column "age_range_max";

alter table "public"."couple_profiles" drop column "age_range_min";

alter table "public"."couple_profiles" drop column "compatibility_factors";

alter table "public"."couple_profiles" drop column "couple_interests";

alter table "public"."couple_profiles" drop column "experience_level";

alter table "public"."couple_profiles" drop column "is_active";

alter table "public"."couple_profiles" drop column "latitude";

alter table "public"."couple_profiles" drop column "location";

alter table "public"."couple_profiles" drop column "longitude";

alter table "public"."couple_profiles" drop column "looking_for";

alter table "public"."couple_profiles" drop column "preferences";

alter table "public"."couple_profiles" drop column "relationship_duration";

alter table "public"."couple_profiles" drop column "statistics";

alter table "public"."couple_profiles" alter column "couple_images" drop default;

alter table "public"."couple_profiles" alter column "couple_name" set data type text using "couple_name"::text;

alter table "public"."couple_profiles" alter column "id" set default gen_random_uuid();

alter table "public"."couple_profiles" alter column "relationship_type" drop default;

alter table "public"."couple_profiles" alter column "relationship_type" set not null;

alter table "public"."couple_profiles" alter column "relationship_type" set data type relationship_type using "relationship_type"::relationship_type;

alter table "public"."profiles" drop column "email";

alter table "public"."profiles" drop column "first_name";

alter table "public"."profiles" drop column "is_online";

alter table "public"."profiles" drop column "is_public";

alter table "public"."profiles" drop column "last_active";

alter table "public"."profiles" drop column "last_name";

alter table "public"."profiles" drop column "latitude";

alter table "public"."profiles" drop column "longitude";

alter table "public"."profiles" drop column "premium_expires_at";

alter table "public"."profiles" drop column "premium_plan";

alter table "public"."profiles" add column "account_type" text default 'single'::text;

alter table "public"."profiles" add column "age_range_max" integer default 65;

alter table "public"."profiles" add column "age_range_min" integer default 18;

alter table "public"."profiles" add column "blocked_at" timestamp with time zone;

alter table "public"."profiles" add column "blocked_reason" text;

alter table "public"."profiles" add column "interested_in" text;

alter table "public"."profiles" add column "is_active" boolean default true;

alter table "public"."profiles" add column "is_blocked" boolean default false;

alter table "public"."profiles" add column "is_premium" boolean default false;

alter table "public"."profiles" add column "lifestyle_preferences" jsonb default '{}'::jsonb;

alter table "public"."profiles" add column "location_preferences" jsonb default '{}'::jsonb;

alter table "public"."profiles" add column "looking_for" text;

alter table "public"."profiles" add column "max_distance" integer default 50;

alter table "public"."profiles" add column "name" text not null;

alter table "public"."profiles" add column "personality_traits" jsonb default '{}'::jsonb;

alter table "public"."profiles" add column "suspension_end_date" timestamp with time zone;

alter table "public"."profiles" add column "swinger_experience" text;

alter table "public"."profiles" add column "warnings_count" integer default 0;

alter table "public"."profiles" alter column "gender" set data type text using "gender"::text;

alter table "public"."profiles" alter column "id" set default gen_random_uuid();

alter table "public"."profiles" alter column "interests" drop default;

alter table "public"."profiles" alter column "location" set data type text using "location"::text;

alter table "public"."profiles" alter column "role" set default 'user'::text;

alter table "public"."profiles" alter column "role" set data type text using "role"::text;

alter table "public"."security_events" alter column "event_type" set data type text using "event_type"::text;

alter table "public"."security_events" alter column "id" set default gen_random_uuid();

alter table "public"."security_events" alter column "severity" set data type text using "severity"::text;

alter sequence "public"."apk_downloads_id_seq" owned by "public"."apk_downloads"."id";

alter sequence "public"."app_metrics_id_seq" owned by "public"."app_metrics"."id";

alter sequence "public"."compatibility_scores_id_seq" owned by "public"."compatibility_scores"."id";

alter sequence "public"."explicit_preferences_id_seq" owned by "public"."explicit_preferences"."id";

alter sequence "public"."faq_items_id_seq" owned by "public"."faq_items"."id";

alter sequence "public"."notifications_id_seq" owned by "public"."notifications"."id";

alter sequence "public"."subscribers_id_seq" owned by "public"."subscribers"."id";

alter sequence "public"."swinger_interests_id_seq" owned by "public"."swinger_interests"."id";

alter sequence "public"."user_explicit_preferences_id_seq" owned by "public"."user_explicit_preferences"."id";

alter sequence "public"."user_interests_id_seq" owned by "public"."user_interests"."id";

drop extension if exists "postgis";

CREATE UNIQUE INDEX apk_downloads_pkey ON public.apk_downloads USING btree (id);

CREATE UNIQUE INDEX app_metrics_pkey ON public.app_metrics USING btree (id);

CREATE UNIQUE INDEX audit_logs_pkey ON public.audit_logs USING btree (id);

CREATE UNIQUE INDEX automation_rules_pkey ON public.automation_rules USING btree (id);

CREATE UNIQUE INDEX career_applications_pkey ON public.career_applications USING btree (id);

CREATE UNIQUE INDEX chat_invitations_pkey ON public.chat_invitations USING btree (id);

CREATE UNIQUE INDEX chat_invitations_room_id_invited_user_key ON public.chat_invitations USING btree (room_id, invited_user);

CREATE UNIQUE INDEX chat_members_pkey ON public.chat_members USING btree (id);

CREATE UNIQUE INDEX chat_members_room_id_profile_id_key ON public.chat_members USING btree (room_id, profile_id);

CREATE UNIQUE INDEX chat_messages_pkey ON public.chat_messages USING btree (id);

CREATE UNIQUE INDEX chat_rooms_pkey ON public.chat_rooms USING btree (id);

CREATE UNIQUE INDEX comment_likes_comment_id_user_id_key ON public.comment_likes USING btree (comment_id, user_id);

CREATE UNIQUE INDEX comment_likes_pkey ON public.comment_likes USING btree (id);

CREATE UNIQUE INDEX compatibility_scores_pkey ON public.compatibility_scores USING btree (id);

CREATE UNIQUE INDEX compatibility_scores_user1_id_user2_id_key ON public.compatibility_scores USING btree (user1_id, user2_id);

CREATE UNIQUE INDEX content_moderation_pkey ON public.content_moderation USING btree (id);

CREATE UNIQUE INDEX couple_favorites_couple_id_favorite_couple_id_key ON public.couple_favorites USING btree (couple_id, favorite_couple_id);

CREATE UNIQUE INDEX couple_favorites_pkey ON public.couple_favorites USING btree (id);

CREATE UNIQUE INDEX couple_gifts_pkey ON public.couple_gifts USING btree (id);

CREATE UNIQUE INDEX couple_messages_pkey ON public.couple_messages USING btree (id);

CREATE UNIQUE INDEX couple_profile_likes_couple_profile_id_liker_profile_id_key ON public.couple_profile_likes USING btree (couple_profile_id, liker_profile_id);

CREATE UNIQUE INDEX couple_profile_likes_pkey ON public.couple_profile_likes USING btree (id);

CREATE UNIQUE INDEX couple_profile_matches_couple_profile1_id_couple_profile2_i_key ON public.couple_profile_matches USING btree (couple_profile1_id, couple_profile2_id);

CREATE UNIQUE INDEX couple_profile_matches_pkey ON public.couple_profile_matches USING btree (id);

CREATE UNIQUE INDEX couple_profile_reports_couple_profile_id_reporter_profile_i_key ON public.couple_profile_reports USING btree (couple_profile_id, reporter_profile_id);

CREATE UNIQUE INDEX couple_profile_reports_pkey ON public.couple_profile_reports USING btree (id);

CREATE UNIQUE INDEX couple_profile_views_couple_profile_id_viewer_profile_id_vi_key ON public.couple_profile_views USING btree (couple_profile_id, viewer_profile_id, viewed_date);

CREATE UNIQUE INDEX couple_profile_views_pkey ON public.couple_profile_views USING btree (id);

CREATE UNIQUE INDEX couple_reports_pkey ON public.couple_reports USING btree (id);

CREATE UNIQUE INDEX couple_statistics_couple_id_date_key ON public.couple_statistics USING btree (couple_id, date);

CREATE UNIQUE INDEX couple_statistics_pkey ON public.couple_statistics USING btree (id);

CREATE UNIQUE INDEX couple_verifications_pkey ON public.couple_verifications USING btree (id);

CREATE UNIQUE INDEX explicit_preferences_name_key ON public.explicit_preferences USING btree (name);

CREATE UNIQUE INDEX explicit_preferences_pkey ON public.explicit_preferences USING btree (id);

CREATE UNIQUE INDEX faq_items_pkey ON public.faq_items USING btree (id);

CREATE UNIQUE INDEX follows_follower_user_id_following_user_id_key ON public.follows USING btree (follower_user_id, following_user_id);

CREATE UNIQUE INDEX follows_pkey ON public.follows USING btree (id);

CREATE UNIQUE INDEX fraud_analysis_pkey ON public.fraud_analysis USING btree (id);

CREATE UNIQUE INDEX gallery_access_requests_pkey ON public.gallery_access_requests USING btree (id);

CREATE UNIQUE INDEX gallery_access_requests_requester_id_requested_from_key ON public.gallery_access_requests USING btree (requester_id, requested_from);

CREATE UNIQUE INDEX gallery_permissions_pkey ON public.gallery_permissions USING btree (id);

CREATE UNIQUE INDEX gallery_permissions_profile_id_granted_to_permission_type_key ON public.gallery_permissions USING btree (profile_id, granted_to, permission_type);

CREATE INDEX idx_apk_downloads_created_at ON public.apk_downloads USING btree (created_at);

CREATE INDEX idx_apk_downloads_user_id ON public.apk_downloads USING btree (user_id);

CREATE INDEX idx_app_metrics_name ON public.app_metrics USING btree (metric_name);

CREATE INDEX idx_app_metrics_recorded_at ON public.app_metrics USING btree (recorded_at);

CREATE INDEX idx_audit_logs_risk_level ON public.audit_logs USING btree (risk_level, created_at DESC);

CREATE INDEX idx_audit_logs_user_time ON public.audit_logs USING btree (user_id, created_at DESC);

CREATE INDEX idx_automation_rules_enabled ON public.automation_rules USING btree (enabled);

CREATE INDEX idx_automation_rules_priority ON public.automation_rules USING btree (priority);

CREATE INDEX idx_automation_rules_trigger ON public.automation_rules USING btree (trigger);

CREATE INDEX idx_blocked_ips_expires_at ON public.blocked_ips USING btree (expires_at);

CREATE INDEX idx_blocked_ips_ip_address ON public.blocked_ips USING btree (ip_address);

CREATE INDEX idx_career_applications_created_at ON public.career_applications USING btree (created_at DESC);

CREATE INDEX idx_career_applications_status ON public.career_applications USING btree (status);

CREATE INDEX idx_chat_messages_created_at ON public.chat_messages USING btree (created_at DESC);

CREATE INDEX idx_chat_messages_room_id ON public.chat_messages USING btree (room_id);

CREATE INDEX idx_chat_messages_sender_id ON public.chat_messages USING btree (sender_id);

CREATE INDEX idx_comment_likes_comment_id ON public.comment_likes USING btree (comment_id);

CREATE INDEX idx_comment_likes_created_at ON public.comment_likes USING btree (created_at);

CREATE INDEX idx_comment_likes_user_id ON public.comment_likes USING btree (user_id);

CREATE INDEX idx_compatibility_scores_users ON public.compatibility_scores USING btree (user1_id, user2_id);

CREATE INDEX idx_content_moderation_content_id ON public.content_moderation USING btree (content_id);

CREATE INDEX idx_content_moderation_status ON public.content_moderation USING btree (status);

CREATE INDEX idx_content_moderation_type ON public.content_moderation USING btree (content_type);

CREATE INDEX idx_couple_events_couple_id ON public.couple_events USING btree (couple_id);

CREATE INDEX idx_couple_favorites_couple_id ON public.couple_favorites USING btree (couple_id);

CREATE INDEX idx_couple_favorites_favorite_couple_id ON public.couple_favorites USING btree (favorite_couple_id);

CREATE INDEX idx_couple_gifts_delivered ON public.couple_gifts USING btree (is_delivered);

CREATE INDEX idx_couple_gifts_receiver ON public.couple_gifts USING btree (receiver_couple_id);

CREATE INDEX idx_couple_gifts_sender ON public.couple_gifts USING btree (sender_couple_id);

CREATE INDEX idx_couple_interactions_couple_id ON public.couple_interactions USING btree (couple_id);

CREATE INDEX idx_couple_interactions_created_at ON public.couple_interactions USING btree (created_at);

CREATE INDEX idx_couple_interactions_target_couple_id ON public.couple_interactions USING btree (target_couple_id);

CREATE INDEX idx_couple_matches_couple1_id ON public.couple_matches USING btree (couple1_id);

CREATE INDEX idx_couple_matches_couple2_id ON public.couple_matches USING btree (couple2_id);

CREATE INDEX idx_couple_matches_created_at ON public.couple_matches USING btree (created_at);

CREATE INDEX idx_couple_messages_created_at ON public.couple_messages USING btree (created_at);

CREATE INDEX idx_couple_messages_read ON public.couple_messages USING btree (is_read);

CREATE INDEX idx_couple_messages_receiver ON public.couple_messages USING btree (receiver_couple_id);

CREATE INDEX idx_couple_messages_sender ON public.couple_messages USING btree (sender_couple_id);

CREATE INDEX idx_couple_profile_likes_couple_profile_id ON public.couple_profile_likes USING btree (couple_profile_id);

CREATE INDEX idx_couple_profile_likes_liked_at ON public.couple_profile_likes USING btree (liked_at);

CREATE INDEX idx_couple_profile_likes_liker_profile_id ON public.couple_profile_likes USING btree (liker_profile_id);

CREATE INDEX idx_couple_profile_matches_couple_profile1_id ON public.couple_profile_matches USING btree (couple_profile1_id);

CREATE INDEX idx_couple_profile_matches_couple_profile2_id ON public.couple_profile_matches USING btree (couple_profile2_id);

CREATE INDEX idx_couple_profile_matches_is_active ON public.couple_profile_matches USING btree (is_active);

CREATE INDEX idx_couple_profile_matches_matched_at ON public.couple_profile_matches USING btree (matched_at);

CREATE INDEX idx_couple_profile_reports_couple_profile_id ON public.couple_profile_reports USING btree (couple_profile_id);

CREATE INDEX idx_couple_profile_reports_created_at ON public.couple_profile_reports USING btree (created_at);

CREATE INDEX idx_couple_profile_reports_reason ON public.couple_profile_reports USING btree (reason);

CREATE INDEX idx_couple_profile_reports_reporter_profile_id ON public.couple_profile_reports USING btree (reporter_profile_id);

CREATE INDEX idx_couple_profile_reports_status ON public.couple_profile_reports USING btree (status);

CREATE INDEX idx_couple_profile_views_couple_profile_id ON public.couple_profile_views USING btree (couple_profile_id);

CREATE INDEX idx_couple_profile_views_viewed_at ON public.couple_profile_views USING btree (viewed_at);

CREATE INDEX idx_couple_profile_views_viewed_date ON public.couple_profile_views USING btree (viewed_date);

CREATE INDEX idx_couple_profile_views_viewer_profile_id ON public.couple_profile_views USING btree (viewer_profile_id);

CREATE INDEX idx_couple_profiles_created_at ON public.couple_profiles USING btree (created_at);

CREATE INDEX idx_couple_profiles_is_premium ON public.couple_profiles USING btree (is_premium);

CREATE INDEX idx_couple_profiles_is_verified ON public.couple_profiles USING btree (is_verified);

CREATE INDEX idx_couple_profiles_partner1_id ON public.couple_profiles USING btree (partner1_id);

CREATE INDEX idx_couple_profiles_partner2_id ON public.couple_profiles USING btree (partner2_id);

CREATE INDEX idx_couple_profiles_relationship_type ON public.couple_profiles USING btree (relationship_type);

CREATE INDEX idx_couple_reports_reported ON public.couple_reports USING btree (reported_couple_id);

CREATE INDEX idx_couple_reports_reporter ON public.couple_reports USING btree (reporter_couple_id);

CREATE INDEX idx_couple_reports_status ON public.couple_reports USING btree (status);

CREATE INDEX idx_couple_statistics_couple_id ON public.couple_statistics USING btree (couple_id);

CREATE INDEX idx_couple_statistics_date ON public.couple_statistics USING btree (date);

CREATE INDEX idx_couple_verifications_couple_id ON public.couple_verifications USING btree (couple_id);

CREATE INDEX idx_couple_verifications_status ON public.couple_verifications USING btree (verification_status);

CREATE INDEX idx_couple_verifications_type ON public.couple_verifications USING btree (verification_type);

CREATE INDEX idx_device_tokens_user ON public.user_device_tokens USING btree (user_id, is_active);

CREATE INDEX idx_faq_items_active ON public.faq_items USING btree (is_active);

CREATE INDEX idx_faq_items_category ON public.faq_items USING btree (category);

CREATE INDEX idx_follows_created_at ON public.follows USING btree (created_at);

CREATE INDEX idx_follows_follower_user_id ON public.follows USING btree (follower_user_id);

CREATE INDEX idx_follows_following_user_id ON public.follows USING btree (following_user_id);

CREATE INDEX idx_fraud_analysis_confidence ON public.fraud_analysis USING btree (confidence);

CREATE INDEX idx_fraud_analysis_created_at ON public.fraud_analysis USING btree (created_at DESC);

CREATE INDEX idx_fraud_analysis_is_fraudulent ON public.fraud_analysis USING btree (is_fraudulent);

CREATE INDEX idx_fraud_analysis_user_id ON public.fraud_analysis USING btree (user_id);

CREATE INDEX idx_gallery_permissions_granted_by ON public.gallery_permissions USING btree (granted_by);

CREATE INDEX idx_gallery_permissions_granted_to ON public.gallery_permissions USING btree (granted_to);

CREATE INDEX idx_gallery_permissions_permission_type ON public.gallery_permissions USING btree (permission_type);

CREATE INDEX idx_invitation_analytics_created_at ON public.invitation_analytics USING btree (created_at);

CREATE INDEX idx_invitation_analytics_event_type ON public.invitation_analytics USING btree (event_type);

CREATE INDEX idx_invitation_analytics_invitation_id ON public.invitation_analytics USING btree (invitation_id);

CREATE INDEX idx_invitation_responses_created_at ON public.invitation_responses USING btree (created_at);

CREATE INDEX idx_invitation_responses_invitation_id ON public.invitation_responses USING btree (invitation_id);

CREATE INDEX idx_invitation_responses_response_type ON public.invitation_responses USING btree (response_type);

CREATE INDEX idx_invitation_templates_created_by ON public.invitation_templates USING btree (created_by);

CREATE INDEX idx_invitation_templates_invitation_type ON public.invitation_templates USING btree (invitation_type);

CREATE INDEX idx_invitation_templates_is_active ON public.invitation_templates USING btree (is_active);

CREATE INDEX idx_media_access_logs_accessed_at ON public.media_access_logs USING btree (accessed_at DESC);

CREATE INDEX idx_media_access_logs_media_id ON public.media_access_logs USING btree (media_id);

CREATE INDEX idx_media_access_logs_user_id ON public.media_access_logs USING btree (user_id);

CREATE INDEX idx_moderation_logs_created_at ON public.moderation_logs USING btree (created_at DESC);

CREATE INDEX idx_moderation_logs_moderator ON public.moderation_logs USING btree (moderator_id, created_at DESC);

CREATE INDEX idx_moderation_logs_moderator_id ON public.moderation_logs USING btree (moderator_id);

CREATE INDEX idx_moderation_logs_target_user ON public.moderation_logs USING btree (target_user_id, created_at DESC);

CREATE INDEX idx_moderator_requests_status ON public.moderator_requests USING btree (status);

CREATE INDEX idx_moderator_requests_user_id ON public.moderator_requests USING btree (user_id);

CREATE INDEX idx_moderators_status ON public.moderators USING btree (status);

CREATE INDEX idx_moderators_user_id ON public.moderators USING btree (user_id);

CREATE INDEX idx_notification_history_user ON public.notification_history USING btree (user_id, created_at DESC);

CREATE INDEX idx_notification_preferences_enabled ON public.notification_preferences USING btree (enabled);

CREATE INDEX idx_notification_preferences_type ON public.notification_preferences USING btree (notification_type);

CREATE INDEX idx_notification_preferences_user ON public.user_notification_preferences USING btree (user_id);

CREATE INDEX idx_notification_preferences_user_id ON public.notification_preferences USING btree (user_id);

CREATE INDEX idx_notifications_read ON public.notifications USING btree (is_read);

CREATE INDEX idx_notifications_user_id ON public.notifications USING btree (user_id);

CREATE INDEX idx_pending_rewards_claimed ON public.pending_rewards USING btree (claimed);

CREATE INDEX idx_pending_rewards_user_id ON public.pending_rewards USING btree (user_id);

CREATE INDEX idx_post_comments_created_at ON public.post_comments USING btree (created_at DESC);

CREATE INDEX idx_post_comments_parent ON public.post_comments USING btree (parent_comment_id) WHERE (parent_comment_id IS NOT NULL);

CREATE INDEX idx_post_comments_post_id ON public.post_comments USING btree (post_id);

CREATE INDEX idx_post_comments_user_id ON public.post_comments USING btree (user_id);

CREATE INDEX idx_post_likes_created_at ON public.post_likes USING btree (created_at DESC);

CREATE INDEX idx_post_likes_post_id ON public.post_likes USING btree (post_id);

CREATE INDEX idx_post_likes_user_id ON public.post_likes USING btree (user_id);

CREATE INDEX idx_post_shares_created_at ON public.post_shares USING btree (created_at DESC);

CREATE INDEX idx_post_shares_post_id ON public.post_shares USING btree (post_id);

CREATE INDEX idx_post_shares_user_id ON public.post_shares USING btree (user_id);

CREATE INDEX idx_posts_created_at ON public.posts USING btree (created_at DESC);

CREATE INDEX idx_posts_location ON public.posts USING btree (location) WHERE (location IS NOT NULL);

CREATE INDEX idx_posts_premium ON public.posts USING btree (is_premium) WHERE (is_premium = true);

CREATE INDEX idx_posts_profile_id ON public.posts USING btree (profile_id);

CREATE INDEX idx_posts_public ON public.posts USING btree (is_public) WHERE (is_public = true);

CREATE INDEX idx_posts_type ON public.posts USING btree (post_type);

CREATE INDEX idx_posts_user_id ON public.posts USING btree (user_id);

CREATE INDEX idx_profile_cache_expires ON public.profile_cache USING btree (expires_at);

CREATE INDEX idx_profile_cache_key ON public.profile_cache USING btree (cache_key);

CREATE INDEX idx_profile_cache_profile_id ON public.profile_cache USING btree (profile_id);

CREATE INDEX idx_profiles_age ON public.profiles USING btree (age);

CREATE INDEX idx_profiles_is_blocked ON public.profiles USING btree (is_blocked);

CREATE INDEX idx_profiles_lifestyle_preferences ON public.profiles USING gin (lifestyle_preferences);

CREATE INDEX idx_profiles_location_preferences ON public.profiles USING gin (location_preferences);

CREATE INDEX idx_profiles_personality_traits ON public.profiles USING gin (personality_traits);

CREATE INDEX idx_profiles_suspension_end_date ON public.profiles USING btree (suspension_end_date);

CREATE INDEX idx_referral_rewards_claimed ON public.referral_rewards USING btree (claimed);

CREATE INDEX idx_referral_rewards_code ON public.referral_rewards USING btree (referral_code);

CREATE INDEX idx_referral_rewards_created_at ON public.referral_rewards USING btree (created_at DESC);

CREATE INDEX idx_referral_rewards_invited_id ON public.referral_rewards USING btree (invited_id);

CREATE INDEX idx_referral_rewards_inviter_id ON public.referral_rewards USING btree (inviter_id);

CREATE INDEX idx_referral_rewards_referral_code ON public.referral_rewards USING btree (referral_code);

CREATE INDEX idx_referral_rewards_reward_type ON public.referral_rewards USING btree (reward_type);

CREATE INDEX idx_referral_rewards_status ON public.referral_rewards USING btree (status);

CREATE INDEX idx_referral_rewards_user_id ON public.referral_rewards USING btree (user_id);

CREATE INDEX idx_referral_statistics_period_end ON public.referral_statistics USING btree (period_end);

CREATE INDEX idx_referral_statistics_period_start ON public.referral_statistics USING btree (period_start);

CREATE INDEX idx_referral_statistics_referral_code ON public.referral_statistics USING btree (referral_code);

CREATE INDEX idx_referral_statistics_user_id ON public.referral_statistics USING btree (user_id);

CREATE INDEX idx_referral_transactions_created_at ON public.referral_transactions USING btree (created_at DESC);

CREATE INDEX idx_referral_transactions_referral_code ON public.referral_transactions USING btree (referral_code);

CREATE INDEX idx_referral_transactions_related_reward_id ON public.referral_transactions USING btree (related_reward_id);

CREATE INDEX idx_referral_transactions_transaction_type ON public.referral_transactions USING btree (transaction_type);

CREATE INDEX idx_referral_transactions_user_id ON public.referral_transactions USING btree (user_id);

CREATE INDEX idx_reports_content_type ON public.reports USING btree (content_type);

CREATE INDEX idx_reports_created_at ON public.reports USING btree (created_at);

CREATE INDEX idx_reports_reported_user_id ON public.reports USING btree (reported_user_id);

CREATE INDEX idx_reports_reporter_user_id ON public.reports USING btree (reporter_user_id);

CREATE INDEX idx_reports_status ON public.reports USING btree (status);

CREATE INDEX idx_roles_active ON public.roles USING btree (is_active);

CREATE INDEX idx_roles_name ON public.roles USING btree (name);

CREATE INDEX idx_security_alerts_created_at ON public.security_alerts USING btree (created_at);

CREATE INDEX idx_security_alerts_severity ON public.security_alerts USING btree (severity);

CREATE INDEX idx_security_alerts_status ON public.security_alerts USING btree (status);

CREATE INDEX idx_security_audit_logs_action ON public.security_audit_logs USING btree (action);

CREATE INDEX idx_security_audit_logs_created_at ON public.security_audit_logs USING btree (created_at DESC);

CREATE INDEX idx_security_audit_logs_ip_address ON public.security_audit_logs USING btree (ip_address);

CREATE INDEX idx_security_audit_logs_risk_score ON public.security_audit_logs USING btree (risk_score);

CREATE INDEX idx_security_audit_logs_user_id ON public.security_audit_logs USING btree (user_id);

CREATE INDEX idx_security_created_at ON public.security USING btree (created_at);

CREATE INDEX idx_security_event_type ON public.security USING btree (event_type);

CREATE INDEX idx_security_events_event_type ON public.security_events USING btree (event_type);

CREATE INDEX idx_security_events_user_id ON public.security_events USING btree (user_id);

CREATE INDEX idx_security_flags_created_at ON public.security_flags USING btree (created_at DESC);

CREATE INDEX idx_security_flags_flag_type ON public.security_flags USING btree (flag_type);

CREATE INDEX idx_security_flags_is_resolved ON public.security_flags USING btree (is_resolved);

CREATE INDEX idx_security_flags_severity ON public.security_flags USING btree (severity);

CREATE INDEX idx_security_flags_user_id ON public.security_flags USING btree (user_id);

CREATE INDEX idx_security_risk_level ON public.security USING btree (risk_level);

CREATE INDEX idx_security_user_id ON public.security USING btree (user_id);

CREATE INDEX idx_sessions_expires ON public.sessions USING btree (expires_at);

CREATE INDEX idx_sessions_token ON public.sessions USING btree (session_token);

CREATE INDEX idx_sessions_user_id ON public.sessions USING btree (user_id);

CREATE INDEX idx_staking_records_end_date ON public.staking_records USING btree (end_date);

CREATE INDEX idx_staking_records_is_active ON public.staking_records USING btree (is_active);

CREATE INDEX idx_staking_records_start_date ON public.staking_records USING btree (start_date);

CREATE INDEX idx_staking_records_status ON public.staking_records USING btree (status);

CREATE INDEX idx_staking_records_token_type ON public.staking_records USING btree (token_type);

CREATE INDEX idx_staking_records_user_id ON public.staking_records USING btree (user_id);

CREATE INDEX idx_stories_content_type ON public.stories USING btree (content_type);

CREATE INDEX idx_stories_created_at ON public.stories USING btree (created_at DESC);

CREATE INDEX idx_stories_hashtags ON public.stories USING gin (hashtags);

CREATE INDEX idx_stories_is_public ON public.stories USING btree (is_public);

CREATE INDEX idx_stories_user_id ON public.stories USING btree (user_id);

CREATE INDEX idx_stories_views_count ON public.stories USING btree (views_count DESC);

CREATE INDEX idx_story_comments_created_at ON public.story_comments USING btree (created_at DESC);

CREATE INDEX idx_story_comments_is_deleted ON public.story_comments USING btree (is_deleted);

CREATE INDEX idx_story_comments_parent_comment_id ON public.story_comments USING btree (parent_comment_id);

CREATE INDEX idx_story_comments_story_id ON public.story_comments USING btree (story_id);

CREATE INDEX idx_story_comments_user_id ON public.story_comments USING btree (user_id);

CREATE INDEX idx_story_likes_created_at ON public.story_likes USING btree (created_at);

CREATE INDEX idx_story_likes_story_id ON public.story_likes USING btree (story_id);

CREATE INDEX idx_story_likes_user_id ON public.story_likes USING btree (user_id);

CREATE INDEX idx_story_reports_created_at ON public.story_reports USING btree (created_at);

CREATE INDEX idx_story_reports_reason ON public.story_reports USING btree (reason);

CREATE INDEX idx_story_reports_reporter_user_id ON public.story_reports USING btree (reporter_user_id);

CREATE INDEX idx_story_reports_status ON public.story_reports USING btree (status);

CREATE INDEX idx_story_reports_story_id ON public.story_reports USING btree (story_id);

CREATE INDEX idx_story_shares_created_at ON public.story_shares USING btree (created_at);

CREATE INDEX idx_story_shares_share_type ON public.story_shares USING btree (share_type);

CREATE INDEX idx_story_shares_story_id ON public.story_shares USING btree (story_id);

CREATE INDEX idx_story_shares_user_id ON public.story_shares USING btree (user_id);

CREATE INDEX idx_subscribers_email ON public.subscribers USING btree (email);

CREATE INDEX idx_subscribers_user_id ON public.subscribers USING btree (user_id);

CREATE INDEX idx_swinger_interests_active ON public.swinger_interests USING btree (is_active);

CREATE INDEX idx_swinger_interests_category ON public.swinger_interests USING btree (category);

CREATE INDEX idx_system_metrics_name ON public.system_metrics USING btree (metric_name);

CREATE INDEX idx_system_metrics_type_time ON public.system_metrics USING btree (metric_type, recorded_at DESC);

CREATE INDEX idx_threat_detections_detected_at ON public.threat_detections USING btree (detected_at);

CREATE INDEX idx_threat_detections_severity ON public.threat_detections USING btree (severity);

CREATE INDEX idx_threat_detections_status ON public.threat_detections USING btree (status);

CREATE INDEX idx_threat_detections_threat_id ON public.threat_detections USING btree (threat_id);

CREATE INDEX idx_token_analytics_created_at ON public.token_analytics USING btree (created_at);

CREATE INDEX idx_token_analytics_period ON public.token_analytics USING btree (period_type, period_start DESC);

CREATE INDEX idx_token_analytics_period_start ON public.token_analytics USING btree (period_start);

CREATE INDEX idx_token_analytics_period_type ON public.token_analytics USING btree (period_type);

CREATE INDEX idx_token_transactions_created_at ON public.token_transactions USING btree (created_at);

CREATE INDEX idx_token_transactions_status ON public.token_transactions USING btree (status);

CREATE INDEX idx_token_transactions_token_type ON public.token_transactions USING btree (token_type);

CREATE INDEX idx_token_transactions_transaction_type ON public.token_transactions USING btree (transaction_type);

CREATE INDEX idx_token_transactions_user_id ON public.token_transactions USING btree (user_id);

CREATE INDEX idx_tokens_is_active ON public.tokens USING btree (is_active);

CREATE INDEX idx_tokens_token_code ON public.tokens USING btree (token_code);

CREATE INDEX idx_transactions_created_at ON public.transactions USING btree (created_at DESC);

CREATE INDEX idx_transactions_type ON public.transactions USING btree (transaction_type);

CREATE INDEX idx_transactions_user_id ON public.transactions USING btree (user_id);

CREATE INDEX idx_two_factor_auth_is_enabled ON public.two_factor_auth USING btree (is_enabled);

CREATE INDEX idx_two_factor_auth_method ON public.two_factor_auth USING btree (method);

CREATE INDEX idx_two_factor_auth_user_id ON public.two_factor_auth USING btree (user_id);

CREATE INDEX idx_user_explicit_preferences_user_id ON public.user_explicit_preferences USING btree (user_id);

CREATE INDEX idx_user_interests_interest_id ON public.user_interests USING btree (interest_id);

CREATE INDEX idx_user_interests_privacy ON public.user_interests USING btree (privacy_level);

CREATE INDEX idx_user_interests_user_id ON public.user_interests USING btree (user_id);

CREATE INDEX idx_user_referral_balances_cmpx_balance ON public.user_referral_balances USING btree (cmpx_balance);

CREATE INDEX idx_user_referral_balances_last_reset_date ON public.user_referral_balances USING btree (last_reset_date);

CREATE INDEX idx_user_referral_balances_referral_code ON public.user_referral_balances USING btree (referral_code);

CREATE INDEX idx_user_referral_balances_referred_by ON public.user_referral_balances USING btree (referred_by);

CREATE INDEX idx_user_referral_balances_total_referrals ON public.user_referral_balances USING btree (total_referrals);

CREATE INDEX idx_user_referral_balances_user_id ON public.user_referral_balances USING btree (user_id);

CREATE INDEX idx_user_sessions_expires_at ON public.user_sessions USING btree (expires_at);

CREATE INDEX idx_user_sessions_is_active ON public.user_sessions USING btree (is_active);

CREATE INDEX idx_user_sessions_last_activity ON public.user_sessions USING btree (last_activity);

CREATE INDEX idx_user_sessions_session_id ON public.user_sessions USING btree (session_id);

CREATE INDEX idx_user_sessions_user_id ON public.user_sessions USING btree (user_id);

CREATE INDEX idx_user_staking_status ON public.user_staking USING btree (status);

CREATE INDEX idx_user_staking_user_id ON public.user_staking USING btree (user_id);

CREATE INDEX idx_user_token_balances_cmpx_balance ON public.user_token_balances USING btree (cmpx_balance);

CREATE INDEX idx_user_token_balances_gtk_balance ON public.user_token_balances USING btree (gtk_balance);

CREATE INDEX idx_user_token_balances_referral_code ON public.user_token_balances USING btree (referral_code);

CREATE INDEX idx_user_token_balances_referred_by ON public.user_token_balances USING btree (referred_by);

CREATE INDEX idx_user_token_balances_user_id ON public.user_token_balances USING btree (user_id);

CREATE INDEX idx_user_tokens_referral_code ON public.user_tokens USING btree (referral_code);

CREATE INDEX idx_user_tokens_referred_by ON public.user_tokens USING btree (referred_by);

CREATE INDEX idx_user_tokens_user_id ON public.user_tokens USING btree (user_id);

CREATE UNIQUE INDEX image_permissions_image_id_granted_to_key ON public.image_permissions USING btree (image_id, granted_to);

CREATE UNIQUE INDEX image_permissions_pkey ON public.image_permissions USING btree (id);

CREATE UNIQUE INDEX images_pkey ON public.images USING btree (id);

CREATE UNIQUE INDEX invitation_analytics_pkey ON public.invitation_analytics USING btree (id);

CREATE UNIQUE INDEX invitation_responses_invitation_id_key ON public.invitation_responses USING btree (invitation_id);

CREATE UNIQUE INDEX invitation_responses_pkey ON public.invitation_responses USING btree (id);

CREATE UNIQUE INDEX invitation_templates_pkey ON public.invitation_templates USING btree (id);

CREATE UNIQUE INDEX invitations_from_profile_to_profile_type_key ON public.invitations USING btree (from_profile, to_profile, type);

CREATE UNIQUE INDEX invitations_pkey ON public.invitations USING btree (id);

CREATE UNIQUE INDEX match_interactions_pkey ON public.match_interactions USING btree (id);

CREATE UNIQUE INDEX matches_pkey ON public.matches USING btree (id);

CREATE UNIQUE INDEX matches_user1_id_user2_id_key ON public.matches USING btree (user1_id, user2_id);

CREATE UNIQUE INDEX media_access_logs_pkey ON public.media_access_logs USING btree (id);

CREATE UNIQUE INDEX messages_pkey ON public.messages USING btree (id);

CREATE UNIQUE INDEX moderation_logs_pkey ON public.moderation_logs USING btree (id);

CREATE UNIQUE INDEX moderator_requests_pkey ON public.moderator_requests USING btree (id);

CREATE UNIQUE INDEX moderator_requests_user_id_key ON public.moderator_requests USING btree (user_id);

CREATE UNIQUE INDEX moderators_pkey ON public.moderators USING btree (id);

CREATE UNIQUE INDEX moderators_user_id_key ON public.moderators USING btree (user_id);

CREATE UNIQUE INDEX notification_history_pkey ON public.notification_history USING btree (id);

CREATE UNIQUE INDEX notification_preferences_pkey ON public.notification_preferences USING btree (id);

CREATE UNIQUE INDEX notification_preferences_user_id_notification_type_key ON public.notification_preferences USING btree (user_id, notification_type);

CREATE UNIQUE INDEX notifications_pkey ON public.notifications USING btree (id);

CREATE UNIQUE INDEX pending_rewards_pkey ON public.pending_rewards USING btree (id);

CREATE UNIQUE INDEX post_comments_pkey ON public.post_comments USING btree (id);

CREATE UNIQUE INDEX post_likes_pkey ON public.post_likes USING btree (id);

CREATE UNIQUE INDEX post_likes_post_id_user_id_key ON public.post_likes USING btree (post_id, user_id);

CREATE UNIQUE INDEX post_shares_pkey ON public.post_shares USING btree (id);

CREATE UNIQUE INDEX post_shares_post_id_user_id_share_type_key ON public.post_shares USING btree (post_id, user_id, share_type);

CREATE UNIQUE INDEX posts_pkey ON public.posts USING btree (id);

CREATE UNIQUE INDEX profile_cache_pkey ON public.profile_cache USING btree (id);

CREATE UNIQUE INDEX referral_rewards_pkey ON public.referral_rewards USING btree (id);

CREATE UNIQUE INDEX referral_rewards_referral_code_key ON public.referral_rewards USING btree (referral_code);

CREATE UNIQUE INDEX referral_statistics_pkey ON public.referral_statistics USING btree (id);

CREATE UNIQUE INDEX referral_statistics_user_id_period_start_key ON public.referral_statistics USING btree (user_id, period_start);

CREATE UNIQUE INDEX referral_transactions_pkey ON public.referral_transactions USING btree (id);

CREATE UNIQUE INDEX reports_pkey ON public.reports USING btree (id);

CREATE UNIQUE INDEX roles_name_key ON public.roles USING btree (name);

CREATE UNIQUE INDEX roles_pkey ON public.roles USING btree (id);

CREATE UNIQUE INDEX security_alerts_pkey ON public.security_alerts USING btree (id);

CREATE UNIQUE INDEX security_audit_logs_pkey ON public.security_audit_logs USING btree (id);

CREATE UNIQUE INDEX security_configurations_config_key_key ON public.security_configurations USING btree (config_key);

CREATE UNIQUE INDEX security_configurations_pkey ON public.security_configurations USING btree (id);

CREATE UNIQUE INDEX security_flags_pkey ON public.security_flags USING btree (id);

CREATE UNIQUE INDEX security_pkey ON public.security USING btree (id);

CREATE UNIQUE INDEX sessions_pkey ON public.sessions USING btree (id);

CREATE UNIQUE INDEX sessions_session_token_key ON public.sessions USING btree (session_token);

CREATE UNIQUE INDEX staking_records_pkey ON public.staking_records USING btree (id);

CREATE UNIQUE INDEX stories_pkey ON public.stories USING btree (id);

CREATE UNIQUE INDEX story_comments_pkey ON public.story_comments USING btree (id);

CREATE UNIQUE INDEX story_likes_pkey ON public.story_likes USING btree (id);

CREATE UNIQUE INDEX story_likes_story_id_user_id_key ON public.story_likes USING btree (story_id, user_id);

CREATE UNIQUE INDEX story_reports_pkey ON public.story_reports USING btree (id);

CREATE UNIQUE INDEX story_reports_story_id_reporter_user_id_key ON public.story_reports USING btree (story_id, reporter_user_id);

CREATE UNIQUE INDEX story_shares_pkey ON public.story_shares USING btree (id);

CREATE UNIQUE INDEX story_shares_story_id_user_id_platform_key ON public.story_shares USING btree (story_id, user_id, platform);

CREATE UNIQUE INDEX subscribers_email_key ON public.subscribers USING btree (email);

CREATE UNIQUE INDEX subscribers_pkey ON public.subscribers USING btree (id);

CREATE UNIQUE INDEX swinger_interests_name_key ON public.swinger_interests USING btree (name);

CREATE UNIQUE INDEX swinger_interests_pkey ON public.swinger_interests USING btree (id);

CREATE UNIQUE INDEX system_metrics_pkey ON public.system_metrics USING btree (id);

CREATE UNIQUE INDEX threat_detections_pkey ON public.threat_detections USING btree (id);

CREATE UNIQUE INDEX threat_detections_threat_id_key ON public.threat_detections USING btree (threat_id);

CREATE UNIQUE INDEX token_analytics_period_type_period_start_key ON public.token_analytics USING btree (period_type, period_start);

CREATE UNIQUE INDEX token_analytics_pkey ON public.token_analytics USING btree (id);

CREATE UNIQUE INDEX token_transactions_pkey ON public.token_transactions USING btree (id);

CREATE UNIQUE INDEX tokens_pkey ON public.tokens USING btree (id);

CREATE UNIQUE INDEX tokens_token_code_key ON public.tokens USING btree (token_code);

CREATE UNIQUE INDEX transactions_pkey ON public.transactions USING btree (id);

CREATE UNIQUE INDEX two_factor_auth_pkey ON public.two_factor_auth USING btree (id);

CREATE UNIQUE INDEX two_factor_auth_user_id_method_key ON public.two_factor_auth USING btree (user_id, method);

CREATE UNIQUE INDEX unique_partner1 ON public.couple_profiles USING btree (partner1_id);

CREATE UNIQUE INDEX unique_partner2 ON public.couple_profiles USING btree (partner2_id);

CREATE UNIQUE INDEX unique_profile_cache_key ON public.profile_cache USING btree (profile_id, cache_key);

CREATE UNIQUE INDEX unique_user_profile ON public.profiles USING btree (user_id);

CREATE UNIQUE INDEX unique_user_reward ON public.pending_rewards USING btree (user_id, reward_type);

CREATE UNIQUE INDEX unique_user_tokens ON public.user_tokens USING btree (user_id);

CREATE UNIQUE INDEX user_2fa_settings_pkey ON public.user_2fa_settings USING btree (id);

CREATE UNIQUE INDEX user_2fa_settings_user_id_key ON public.user_2fa_settings USING btree (user_id);

CREATE UNIQUE INDEX user_device_tokens_pkey ON public.user_device_tokens USING btree (id);

CREATE UNIQUE INDEX user_device_tokens_user_id_device_token_key ON public.user_device_tokens USING btree (user_id, device_token);

CREATE UNIQUE INDEX user_explicit_preferences_pkey ON public.user_explicit_preferences USING btree (id);

CREATE UNIQUE INDEX user_explicit_preferences_user_id_preference_id_key ON public.user_explicit_preferences USING btree (user_id, preference_id);

CREATE UNIQUE INDEX user_interests_pkey ON public.user_interests USING btree (id);

CREATE UNIQUE INDEX user_interests_user_id_interest_id_key ON public.user_interests USING btree (user_id, interest_id);

CREATE UNIQUE INDEX user_likes_pkey ON public.user_likes USING btree (id);

CREATE UNIQUE INDEX user_likes_user_id_liked_user_id_key ON public.user_likes USING btree (user_id, liked_user_id);

CREATE UNIQUE INDEX user_notification_preferences_pkey ON public.user_notification_preferences USING btree (id);

CREATE UNIQUE INDEX user_notification_preferences_user_id_notification_type_del_key ON public.user_notification_preferences USING btree (user_id, notification_type, delivery_method);

CREATE UNIQUE INDEX user_referral_balances_pkey ON public.user_referral_balances USING btree (id);

CREATE UNIQUE INDEX user_referral_balances_referral_code_key ON public.user_referral_balances USING btree (referral_code);

CREATE UNIQUE INDEX user_referral_balances_user_id_key ON public.user_referral_balances USING btree (user_id);

CREATE UNIQUE INDEX user_roles_pkey ON public.user_roles USING btree (id);

CREATE UNIQUE INDEX user_roles_user_id_role_key ON public.user_roles USING btree (user_id, role);

CREATE UNIQUE INDEX user_sessions_pkey ON public.user_sessions USING btree (id);

CREATE UNIQUE INDEX user_staking_pkey ON public.user_staking USING btree (id);

CREATE UNIQUE INDEX user_token_balances_pkey ON public.user_token_balances USING btree (id);

CREATE UNIQUE INDEX user_token_balances_referral_code_key ON public.user_token_balances USING btree (referral_code);

CREATE UNIQUE INDEX user_token_balances_user_id_key ON public.user_token_balances USING btree (user_id);

CREATE UNIQUE INDEX user_tokens_pkey ON public.user_tokens USING btree (id);

CREATE UNIQUE INDEX user_tokens_referral_code_key ON public.user_tokens USING btree (referral_code);

CREATE UNIQUE INDEX user_tokens_referral_code_unique ON public.user_tokens USING btree (referral_code);

alter table "public"."apk_downloads" add constraint "apk_downloads_pkey" PRIMARY KEY using index "apk_downloads_pkey";

alter table "public"."app_metrics" add constraint "app_metrics_pkey" PRIMARY KEY using index "app_metrics_pkey";

alter table "public"."audit_logs" add constraint "audit_logs_pkey" PRIMARY KEY using index "audit_logs_pkey";

alter table "public"."automation_rules" add constraint "automation_rules_pkey" PRIMARY KEY using index "automation_rules_pkey";

alter table "public"."career_applications" add constraint "career_applications_pkey" PRIMARY KEY using index "career_applications_pkey";

alter table "public"."chat_invitations" add constraint "chat_invitations_pkey" PRIMARY KEY using index "chat_invitations_pkey";

alter table "public"."chat_members" add constraint "chat_members_pkey" PRIMARY KEY using index "chat_members_pkey";

alter table "public"."chat_messages" add constraint "chat_messages_pkey" PRIMARY KEY using index "chat_messages_pkey";

alter table "public"."chat_rooms" add constraint "chat_rooms_pkey" PRIMARY KEY using index "chat_rooms_pkey";

alter table "public"."comment_likes" add constraint "comment_likes_pkey" PRIMARY KEY using index "comment_likes_pkey";

alter table "public"."compatibility_scores" add constraint "compatibility_scores_pkey" PRIMARY KEY using index "compatibility_scores_pkey";

alter table "public"."content_moderation" add constraint "content_moderation_pkey" PRIMARY KEY using index "content_moderation_pkey";

alter table "public"."couple_favorites" add constraint "couple_favorites_pkey" PRIMARY KEY using index "couple_favorites_pkey";

alter table "public"."couple_gifts" add constraint "couple_gifts_pkey" PRIMARY KEY using index "couple_gifts_pkey";

alter table "public"."couple_messages" add constraint "couple_messages_pkey" PRIMARY KEY using index "couple_messages_pkey";

alter table "public"."couple_profile_likes" add constraint "couple_profile_likes_pkey" PRIMARY KEY using index "couple_profile_likes_pkey";

alter table "public"."couple_profile_matches" add constraint "couple_profile_matches_pkey" PRIMARY KEY using index "couple_profile_matches_pkey";

alter table "public"."couple_profile_reports" add constraint "couple_profile_reports_pkey" PRIMARY KEY using index "couple_profile_reports_pkey";

alter table "public"."couple_profile_views" add constraint "couple_profile_views_pkey" PRIMARY KEY using index "couple_profile_views_pkey";

alter table "public"."couple_reports" add constraint "couple_reports_pkey" PRIMARY KEY using index "couple_reports_pkey";

alter table "public"."couple_statistics" add constraint "couple_statistics_pkey" PRIMARY KEY using index "couple_statistics_pkey";

alter table "public"."couple_verifications" add constraint "couple_verifications_pkey" PRIMARY KEY using index "couple_verifications_pkey";

alter table "public"."explicit_preferences" add constraint "explicit_preferences_pkey" PRIMARY KEY using index "explicit_preferences_pkey";

alter table "public"."faq_items" add constraint "faq_items_pkey" PRIMARY KEY using index "faq_items_pkey";

alter table "public"."follows" add constraint "follows_pkey" PRIMARY KEY using index "follows_pkey";

alter table "public"."fraud_analysis" add constraint "fraud_analysis_pkey" PRIMARY KEY using index "fraud_analysis_pkey";

alter table "public"."gallery_access_requests" add constraint "gallery_access_requests_pkey" PRIMARY KEY using index "gallery_access_requests_pkey";

alter table "public"."gallery_permissions" add constraint "gallery_permissions_pkey" PRIMARY KEY using index "gallery_permissions_pkey";

alter table "public"."image_permissions" add constraint "image_permissions_pkey" PRIMARY KEY using index "image_permissions_pkey";

alter table "public"."images" add constraint "images_pkey" PRIMARY KEY using index "images_pkey";

alter table "public"."invitation_analytics" add constraint "invitation_analytics_pkey" PRIMARY KEY using index "invitation_analytics_pkey";

alter table "public"."invitation_responses" add constraint "invitation_responses_pkey" PRIMARY KEY using index "invitation_responses_pkey";

alter table "public"."invitation_templates" add constraint "invitation_templates_pkey" PRIMARY KEY using index "invitation_templates_pkey";

alter table "public"."invitations" add constraint "invitations_pkey" PRIMARY KEY using index "invitations_pkey";

alter table "public"."match_interactions" add constraint "match_interactions_pkey" PRIMARY KEY using index "match_interactions_pkey";

alter table "public"."matches" add constraint "matches_pkey" PRIMARY KEY using index "matches_pkey";

alter table "public"."media_access_logs" add constraint "media_access_logs_pkey" PRIMARY KEY using index "media_access_logs_pkey";

alter table "public"."messages" add constraint "messages_pkey" PRIMARY KEY using index "messages_pkey";

alter table "public"."moderation_logs" add constraint "moderation_logs_pkey" PRIMARY KEY using index "moderation_logs_pkey";

alter table "public"."moderator_requests" add constraint "moderator_requests_pkey" PRIMARY KEY using index "moderator_requests_pkey";

alter table "public"."moderators" add constraint "moderators_pkey" PRIMARY KEY using index "moderators_pkey";

alter table "public"."notification_history" add constraint "notification_history_pkey" PRIMARY KEY using index "notification_history_pkey";

alter table "public"."notification_preferences" add constraint "notification_preferences_pkey" PRIMARY KEY using index "notification_preferences_pkey";

alter table "public"."notifications" add constraint "notifications_pkey" PRIMARY KEY using index "notifications_pkey";

alter table "public"."pending_rewards" add constraint "pending_rewards_pkey" PRIMARY KEY using index "pending_rewards_pkey";

alter table "public"."post_comments" add constraint "post_comments_pkey" PRIMARY KEY using index "post_comments_pkey";

alter table "public"."post_likes" add constraint "post_likes_pkey" PRIMARY KEY using index "post_likes_pkey";

alter table "public"."post_shares" add constraint "post_shares_pkey" PRIMARY KEY using index "post_shares_pkey";

alter table "public"."posts" add constraint "posts_pkey" PRIMARY KEY using index "posts_pkey";

alter table "public"."profile_cache" add constraint "profile_cache_pkey" PRIMARY KEY using index "profile_cache_pkey";

alter table "public"."referral_rewards" add constraint "referral_rewards_pkey" PRIMARY KEY using index "referral_rewards_pkey";

alter table "public"."referral_statistics" add constraint "referral_statistics_pkey" PRIMARY KEY using index "referral_statistics_pkey";

alter table "public"."referral_transactions" add constraint "referral_transactions_pkey" PRIMARY KEY using index "referral_transactions_pkey";

alter table "public"."reports" add constraint "reports_pkey" PRIMARY KEY using index "reports_pkey";

alter table "public"."roles" add constraint "roles_pkey" PRIMARY KEY using index "roles_pkey";

alter table "public"."security" add constraint "security_pkey" PRIMARY KEY using index "security_pkey";

alter table "public"."security_alerts" add constraint "security_alerts_pkey" PRIMARY KEY using index "security_alerts_pkey";

alter table "public"."security_audit_logs" add constraint "security_audit_logs_pkey" PRIMARY KEY using index "security_audit_logs_pkey";

alter table "public"."security_configurations" add constraint "security_configurations_pkey" PRIMARY KEY using index "security_configurations_pkey";

alter table "public"."security_flags" add constraint "security_flags_pkey" PRIMARY KEY using index "security_flags_pkey";

alter table "public"."sessions" add constraint "sessions_pkey" PRIMARY KEY using index "sessions_pkey";

alter table "public"."staking_records" add constraint "staking_records_pkey" PRIMARY KEY using index "staking_records_pkey";

alter table "public"."stories" add constraint "stories_pkey" PRIMARY KEY using index "stories_pkey";

alter table "public"."story_comments" add constraint "story_comments_pkey" PRIMARY KEY using index "story_comments_pkey";

alter table "public"."story_likes" add constraint "story_likes_pkey" PRIMARY KEY using index "story_likes_pkey";

alter table "public"."story_reports" add constraint "story_reports_pkey" PRIMARY KEY using index "story_reports_pkey";

alter table "public"."story_shares" add constraint "story_shares_pkey" PRIMARY KEY using index "story_shares_pkey";

alter table "public"."subscribers" add constraint "subscribers_pkey" PRIMARY KEY using index "subscribers_pkey";

alter table "public"."swinger_interests" add constraint "swinger_interests_pkey" PRIMARY KEY using index "swinger_interests_pkey";

alter table "public"."system_metrics" add constraint "system_metrics_pkey" PRIMARY KEY using index "system_metrics_pkey";

alter table "public"."threat_detections" add constraint "threat_detections_pkey" PRIMARY KEY using index "threat_detections_pkey";

alter table "public"."token_analytics" add constraint "token_analytics_pkey" PRIMARY KEY using index "token_analytics_pkey";

alter table "public"."token_transactions" add constraint "token_transactions_pkey" PRIMARY KEY using index "token_transactions_pkey";

alter table "public"."tokens" add constraint "tokens_pkey" PRIMARY KEY using index "tokens_pkey";

alter table "public"."transactions" add constraint "transactions_pkey" PRIMARY KEY using index "transactions_pkey";

alter table "public"."two_factor_auth" add constraint "two_factor_auth_pkey" PRIMARY KEY using index "two_factor_auth_pkey";

alter table "public"."user_2fa_settings" add constraint "user_2fa_settings_pkey" PRIMARY KEY using index "user_2fa_settings_pkey";

alter table "public"."user_device_tokens" add constraint "user_device_tokens_pkey" PRIMARY KEY using index "user_device_tokens_pkey";

alter table "public"."user_explicit_preferences" add constraint "user_explicit_preferences_pkey" PRIMARY KEY using index "user_explicit_preferences_pkey";

alter table "public"."user_interests" add constraint "user_interests_pkey" PRIMARY KEY using index "user_interests_pkey";

alter table "public"."user_likes" add constraint "user_likes_pkey" PRIMARY KEY using index "user_likes_pkey";

alter table "public"."user_notification_preferences" add constraint "user_notification_preferences_pkey" PRIMARY KEY using index "user_notification_preferences_pkey";

alter table "public"."user_referral_balances" add constraint "user_referral_balances_pkey" PRIMARY KEY using index "user_referral_balances_pkey";

alter table "public"."user_roles" add constraint "user_roles_pkey" PRIMARY KEY using index "user_roles_pkey";

alter table "public"."user_sessions" add constraint "user_sessions_pkey" PRIMARY KEY using index "user_sessions_pkey";

alter table "public"."user_staking" add constraint "user_staking_pkey" PRIMARY KEY using index "user_staking_pkey";

alter table "public"."user_token_balances" add constraint "user_token_balances_pkey" PRIMARY KEY using index "user_token_balances_pkey";

alter table "public"."user_tokens" add constraint "user_tokens_pkey" PRIMARY KEY using index "user_tokens_pkey";

alter table "public"."apk_downloads" add constraint "apk_downloads_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL not valid;

alter table "public"."apk_downloads" validate constraint "apk_downloads_user_id_fkey";

alter table "public"."audit_logs" add constraint "audit_logs_action_type_check" CHECK ((action_type = ANY (ARRAY['login'::text, 'logout'::text, 'profile_update'::text, 'token_transaction'::text, 'report_created'::text, 'admin_action'::text, 'security_event'::text, 'api_call'::text]))) not valid;

alter table "public"."audit_logs" validate constraint "audit_logs_action_type_check";

alter table "public"."audit_logs" add constraint "audit_logs_fraud_score_check" CHECK (((fraud_score >= (0)::numeric) AND (fraud_score <= (1)::numeric))) not valid;

alter table "public"."audit_logs" validate constraint "audit_logs_fraud_score_check";

alter table "public"."audit_logs" add constraint "audit_logs_resource_type_check" CHECK ((resource_type = ANY (ARRAY['user'::text, 'profile'::text, 'token'::text, 'report'::text, 'transaction'::text, 'system'::text]))) not valid;

alter table "public"."audit_logs" validate constraint "audit_logs_resource_type_check";

alter table "public"."audit_logs" add constraint "audit_logs_risk_level_check" CHECK ((risk_level = ANY (ARRAY['low'::text, 'medium'::text, 'high'::text, 'critical'::text]))) not valid;

alter table "public"."audit_logs" validate constraint "audit_logs_risk_level_check";

alter table "public"."audit_logs" add constraint "audit_logs_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL not valid;

alter table "public"."audit_logs" validate constraint "audit_logs_user_id_fkey";

alter table "public"."automation_rules" add constraint "automation_rules_created_by_fkey" FOREIGN KEY (created_by) REFERENCES auth.users(id) not valid;

alter table "public"."automation_rules" validate constraint "automation_rules_created_by_fkey";

alter table "public"."career_applications" add constraint "career_applications_reviewed_by_fkey" FOREIGN KEY (reviewed_by) REFERENCES auth.users(id) not valid;

alter table "public"."career_applications" validate constraint "career_applications_reviewed_by_fkey";

alter table "public"."career_applications" add constraint "career_applications_status_check" CHECK ((status = ANY (ARRAY['pending'::text, 'reviewing'::text, 'approved'::text, 'rejected'::text]))) not valid;

alter table "public"."career_applications" validate constraint "career_applications_status_check";

alter table "public"."chat_invitations" add constraint "chat_invitations_invited_by_fkey" FOREIGN KEY (invited_by) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."chat_invitations" validate constraint "chat_invitations_invited_by_fkey";

alter table "public"."chat_invitations" add constraint "chat_invitations_invited_user_fkey" FOREIGN KEY (invited_user) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."chat_invitations" validate constraint "chat_invitations_invited_user_fkey";

alter table "public"."chat_invitations" add constraint "chat_invitations_room_id_fkey" FOREIGN KEY (room_id) REFERENCES chat_rooms(id) ON DELETE CASCADE not valid;

alter table "public"."chat_invitations" validate constraint "chat_invitations_room_id_fkey";

alter table "public"."chat_invitations" add constraint "chat_invitations_room_id_invited_user_key" UNIQUE using index "chat_invitations_room_id_invited_user_key";

alter table "public"."chat_invitations" add constraint "chat_invitations_status_check" CHECK ((status = ANY (ARRAY['pending'::text, 'accepted'::text, 'declined'::text]))) not valid;

alter table "public"."chat_invitations" validate constraint "chat_invitations_status_check";

alter table "public"."chat_members" add constraint "chat_members_profile_id_fkey" FOREIGN KEY (profile_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."chat_members" validate constraint "chat_members_profile_id_fkey";

alter table "public"."chat_members" add constraint "chat_members_role_check" CHECK ((role = ANY (ARRAY['admin'::text, 'moderator'::text, 'member'::text]))) not valid;

alter table "public"."chat_members" validate constraint "chat_members_role_check";

alter table "public"."chat_members" add constraint "chat_members_room_id_fkey" FOREIGN KEY (room_id) REFERENCES chat_rooms(id) ON DELETE CASCADE not valid;

alter table "public"."chat_members" validate constraint "chat_members_room_id_fkey";

alter table "public"."chat_members" add constraint "chat_members_room_id_profile_id_key" UNIQUE using index "chat_members_room_id_profile_id_key";

alter table "public"."chat_messages" add constraint "chat_messages_sender_id_fkey" FOREIGN KEY (sender_id) REFERENCES profiles(id) ON DELETE CASCADE not valid;

alter table "public"."chat_messages" validate constraint "chat_messages_sender_id_fkey";

alter table "public"."chat_rooms" add constraint "chat_rooms_created_by_fkey" FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."chat_rooms" validate constraint "chat_rooms_created_by_fkey";

alter table "public"."chat_rooms" add constraint "chat_rooms_type_check" CHECK ((type = ANY (ARRAY['public'::text, 'private'::text, 'group'::text]))) not valid;

alter table "public"."chat_rooms" validate constraint "chat_rooms_type_check";

alter table "public"."comment_likes" add constraint "comment_likes_comment_id_fkey" FOREIGN KEY (comment_id) REFERENCES post_comments(id) ON DELETE CASCADE not valid;

alter table "public"."comment_likes" validate constraint "comment_likes_comment_id_fkey";

alter table "public"."comment_likes" add constraint "comment_likes_comment_id_user_id_key" UNIQUE using index "comment_likes_comment_id_user_id_key";

alter table "public"."comment_likes" add constraint "comment_likes_profile_id_fkey" FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE not valid;

alter table "public"."comment_likes" validate constraint "comment_likes_profile_id_fkey";

alter table "public"."comment_likes" add constraint "comment_likes_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."comment_likes" validate constraint "comment_likes_user_id_fkey";

alter table "public"."compatibility_scores" add constraint "compatibility_scores_compatibility_score_check" CHECK (((compatibility_score >= (0)::numeric) AND (compatibility_score <= (1)::numeric))) not valid;

alter table "public"."compatibility_scores" validate constraint "compatibility_scores_compatibility_score_check";

alter table "public"."compatibility_scores" add constraint "compatibility_scores_user1_id_fkey" FOREIGN KEY (user1_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."compatibility_scores" validate constraint "compatibility_scores_user1_id_fkey";

alter table "public"."compatibility_scores" add constraint "compatibility_scores_user1_id_user2_id_key" UNIQUE using index "compatibility_scores_user1_id_user2_id_key";

alter table "public"."compatibility_scores" add constraint "compatibility_scores_user2_id_fkey" FOREIGN KEY (user2_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."compatibility_scores" validate constraint "compatibility_scores_user2_id_fkey";

alter table "public"."content_moderation" add constraint "content_moderation_content_type_check" CHECK ((content_type = ANY (ARRAY['post'::text, 'message'::text, 'profile'::text, 'image'::text, 'comment'::text]))) not valid;

alter table "public"."content_moderation" validate constraint "content_moderation_content_type_check";

alter table "public"."content_moderation" add constraint "content_moderation_moderator_id_fkey" FOREIGN KEY (moderator_id) REFERENCES auth.users(id) ON DELETE SET NULL not valid;

alter table "public"."content_moderation" validate constraint "content_moderation_moderator_id_fkey";

alter table "public"."content_moderation" add constraint "content_moderation_status_check" CHECK ((status = ANY (ARRAY['pending'::text, 'approved'::text, 'rejected'::text, 'flagged'::text, 'auto_approved'::text]))) not valid;

alter table "public"."content_moderation" validate constraint "content_moderation_status_check";

alter table "public"."content_moderation" add constraint "content_moderation_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL not valid;

alter table "public"."content_moderation" validate constraint "content_moderation_user_id_fkey";

alter table "public"."content_moderation" add constraint "valid_ai_confidence" CHECK (((ai_confidence >= (0)::numeric) AND (ai_confidence <= (1)::numeric))) not valid;

alter table "public"."content_moderation" validate constraint "valid_ai_confidence";

alter table "public"."couple_favorites" add constraint "couple_favorites_couple_id_favorite_couple_id_key" UNIQUE using index "couple_favorites_couple_id_favorite_couple_id_key";

alter table "public"."couple_favorites" add constraint "couple_favorites_couple_id_fkey" FOREIGN KEY (couple_id) REFERENCES couple_profiles(id) ON DELETE CASCADE not valid;

alter table "public"."couple_favorites" validate constraint "couple_favorites_couple_id_fkey";

alter table "public"."couple_favorites" add constraint "couple_favorites_favorite_couple_id_fkey" FOREIGN KEY (favorite_couple_id) REFERENCES couple_profiles(id) ON DELETE CASCADE not valid;

alter table "public"."couple_favorites" validate constraint "couple_favorites_favorite_couple_id_fkey";

alter table "public"."couple_gifts" add constraint "couple_gifts_gift_type_check" CHECK ((gift_type = ANY (ARRAY['virtual'::text, 'real'::text, 'experience'::text]))) not valid;

alter table "public"."couple_gifts" validate constraint "couple_gifts_gift_type_check";

alter table "public"."couple_gifts" add constraint "couple_gifts_receiver_couple_id_fkey" FOREIGN KEY (receiver_couple_id) REFERENCES couple_profiles(id) ON DELETE CASCADE not valid;

alter table "public"."couple_gifts" validate constraint "couple_gifts_receiver_couple_id_fkey";

alter table "public"."couple_gifts" add constraint "couple_gifts_sender_couple_id_fkey" FOREIGN KEY (sender_couple_id) REFERENCES couple_profiles(id) ON DELETE CASCADE not valid;

alter table "public"."couple_gifts" validate constraint "couple_gifts_sender_couple_id_fkey";

alter table "public"."couple_messages" add constraint "couple_messages_message_type_check" CHECK ((message_type = ANY (ARRAY['text'::text, 'image'::text, 'video'::text, 'gift'::text]))) not valid;

alter table "public"."couple_messages" validate constraint "couple_messages_message_type_check";

alter table "public"."couple_messages" add constraint "couple_messages_receiver_couple_id_fkey" FOREIGN KEY (receiver_couple_id) REFERENCES couple_profiles(id) ON DELETE CASCADE not valid;

alter table "public"."couple_messages" validate constraint "couple_messages_receiver_couple_id_fkey";

alter table "public"."couple_messages" add constraint "couple_messages_sender_couple_id_fkey" FOREIGN KEY (sender_couple_id) REFERENCES couple_profiles(id) ON DELETE CASCADE not valid;

alter table "public"."couple_messages" validate constraint "couple_messages_sender_couple_id_fkey";

alter table "public"."couple_profile_likes" add constraint "couple_profile_likes_couple_profile_id_fkey" FOREIGN KEY (couple_profile_id) REFERENCES couple_profiles(id) ON DELETE CASCADE not valid;

alter table "public"."couple_profile_likes" validate constraint "couple_profile_likes_couple_profile_id_fkey";

alter table "public"."couple_profile_likes" add constraint "couple_profile_likes_couple_profile_id_liker_profile_id_key" UNIQUE using index "couple_profile_likes_couple_profile_id_liker_profile_id_key";

alter table "public"."couple_profile_likes" add constraint "couple_profile_likes_liker_profile_id_fkey" FOREIGN KEY (liker_profile_id) REFERENCES profiles(user_id) ON DELETE CASCADE not valid;

alter table "public"."couple_profile_likes" validate constraint "couple_profile_likes_liker_profile_id_fkey";

alter table "public"."couple_profile_matches" add constraint "couple_profile_matches_check" CHECK ((couple_profile1_id <> couple_profile2_id)) not valid;

alter table "public"."couple_profile_matches" validate constraint "couple_profile_matches_check";

alter table "public"."couple_profile_matches" add constraint "couple_profile_matches_couple_profile1_id_couple_profile2_i_key" UNIQUE using index "couple_profile_matches_couple_profile1_id_couple_profile2_i_key";

alter table "public"."couple_profile_matches" add constraint "couple_profile_matches_couple_profile1_id_fkey" FOREIGN KEY (couple_profile1_id) REFERENCES couple_profiles(id) ON DELETE CASCADE not valid;

alter table "public"."couple_profile_matches" validate constraint "couple_profile_matches_couple_profile1_id_fkey";

alter table "public"."couple_profile_matches" add constraint "couple_profile_matches_couple_profile2_id_fkey" FOREIGN KEY (couple_profile2_id) REFERENCES couple_profiles(id) ON DELETE CASCADE not valid;

alter table "public"."couple_profile_matches" validate constraint "couple_profile_matches_couple_profile2_id_fkey";

alter table "public"."couple_profile_reports" add constraint "couple_profile_reports_couple_profile_id_fkey" FOREIGN KEY (couple_profile_id) REFERENCES couple_profiles(id) ON DELETE CASCADE not valid;

alter table "public"."couple_profile_reports" validate constraint "couple_profile_reports_couple_profile_id_fkey";

alter table "public"."couple_profile_reports" add constraint "couple_profile_reports_couple_profile_id_reporter_profile_i_key" UNIQUE using index "couple_profile_reports_couple_profile_id_reporter_profile_i_key";

alter table "public"."couple_profile_reports" add constraint "couple_profile_reports_reason_check" CHECK (((reason)::text = ANY ((ARRAY['fake'::character varying, 'inappropriate'::character varying, 'harassment'::character varying, 'spam'::character varying, 'other'::character varying])::text[]))) not valid;

alter table "public"."couple_profile_reports" validate constraint "couple_profile_reports_reason_check";

alter table "public"."couple_profile_reports" add constraint "couple_profile_reports_reporter_profile_id_fkey" FOREIGN KEY (reporter_profile_id) REFERENCES profiles(user_id) ON DELETE CASCADE not valid;

alter table "public"."couple_profile_reports" validate constraint "couple_profile_reports_reporter_profile_id_fkey";

alter table "public"."couple_profile_reports" add constraint "couple_profile_reports_reviewed_by_fkey" FOREIGN KEY (reviewed_by) REFERENCES profiles(user_id) not valid;

alter table "public"."couple_profile_reports" validate constraint "couple_profile_reports_reviewed_by_fkey";

alter table "public"."couple_profile_reports" add constraint "couple_profile_reports_status_check" CHECK (((status)::text = ANY ((ARRAY['pending'::character varying, 'reviewed'::character varying, 'resolved'::character varying, 'dismissed'::character varying])::text[]))) not valid;

alter table "public"."couple_profile_reports" validate constraint "couple_profile_reports_status_check";

alter table "public"."couple_profile_views" add constraint "couple_profile_views_couple_profile_id_fkey" FOREIGN KEY (couple_profile_id) REFERENCES couple_profiles(id) ON DELETE CASCADE not valid;

alter table "public"."couple_profile_views" validate constraint "couple_profile_views_couple_profile_id_fkey";

alter table "public"."couple_profile_views" add constraint "couple_profile_views_couple_profile_id_viewer_profile_id_vi_key" UNIQUE using index "couple_profile_views_couple_profile_id_viewer_profile_id_vi_key";

alter table "public"."couple_profile_views" add constraint "couple_profile_views_viewer_profile_id_fkey" FOREIGN KEY (viewer_profile_id) REFERENCES profiles(user_id) ON DELETE CASCADE not valid;

alter table "public"."couple_profile_views" validate constraint "couple_profile_views_viewer_profile_id_fkey";

alter table "public"."couple_profiles" add constraint "different_partners" CHECK ((partner1_id <> partner2_id)) not valid;

alter table "public"."couple_profiles" validate constraint "different_partners";

alter table "public"."couple_profiles" add constraint "unique_partner1" UNIQUE using index "unique_partner1";

alter table "public"."couple_profiles" add constraint "unique_partner2" UNIQUE using index "unique_partner2";

alter table "public"."couple_reports" add constraint "couple_reports_reported_couple_id_fkey" FOREIGN KEY (reported_couple_id) REFERENCES couple_profiles(id) ON DELETE CASCADE not valid;

alter table "public"."couple_reports" validate constraint "couple_reports_reported_couple_id_fkey";

alter table "public"."couple_reports" add constraint "couple_reports_reporter_couple_id_fkey" FOREIGN KEY (reporter_couple_id) REFERENCES couple_profiles(id) ON DELETE CASCADE not valid;

alter table "public"."couple_reports" validate constraint "couple_reports_reporter_couple_id_fkey";

alter table "public"."couple_reports" add constraint "couple_reports_resolved_by_fkey" FOREIGN KEY (resolved_by) REFERENCES auth.users(id) not valid;

alter table "public"."couple_reports" validate constraint "couple_reports_resolved_by_fkey";

alter table "public"."couple_reports" add constraint "couple_reports_status_check" CHECK ((status = ANY (ARRAY['pending'::text, 'reviewing'::text, 'resolved'::text, 'dismissed'::text]))) not valid;

alter table "public"."couple_reports" validate constraint "couple_reports_status_check";

alter table "public"."couple_statistics" add constraint "couple_statistics_couple_id_date_key" UNIQUE using index "couple_statistics_couple_id_date_key";

alter table "public"."couple_statistics" add constraint "couple_statistics_couple_id_fkey" FOREIGN KEY (couple_id) REFERENCES couple_profiles(id) ON DELETE CASCADE not valid;

alter table "public"."couple_statistics" validate constraint "couple_statistics_couple_id_fkey";

alter table "public"."couple_verifications" add constraint "couple_verifications_couple_id_fkey" FOREIGN KEY (couple_id) REFERENCES couple_profiles(id) ON DELETE CASCADE not valid;

alter table "public"."couple_verifications" validate constraint "couple_verifications_couple_id_fkey";

alter table "public"."couple_verifications" add constraint "couple_verifications_verification_status_check" CHECK ((verification_status = ANY (ARRAY['pending'::text, 'approved'::text, 'rejected'::text]))) not valid;

alter table "public"."couple_verifications" validate constraint "couple_verifications_verification_status_check";

alter table "public"."couple_verifications" add constraint "couple_verifications_verification_type_check" CHECK ((verification_type = ANY (ARRAY['identity'::text, 'relationship'::text, 'photos'::text, 'video'::text]))) not valid;

alter table "public"."couple_verifications" validate constraint "couple_verifications_verification_type_check";

alter table "public"."couple_verifications" add constraint "couple_verifications_verified_by_fkey" FOREIGN KEY (verified_by) REFERENCES auth.users(id) not valid;

alter table "public"."couple_verifications" validate constraint "couple_verifications_verified_by_fkey";

alter table "public"."explicit_preferences" add constraint "explicit_preferences_name_key" UNIQUE using index "explicit_preferences_name_key";

alter table "public"."follows" add constraint "follows_check" CHECK ((follower_user_id <> following_user_id)) not valid;

alter table "public"."follows" validate constraint "follows_check";

alter table "public"."follows" add constraint "follows_follower_user_id_fkey" FOREIGN KEY (follower_user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."follows" validate constraint "follows_follower_user_id_fkey";

alter table "public"."follows" add constraint "follows_follower_user_id_following_user_id_key" UNIQUE using index "follows_follower_user_id_following_user_id_key";

alter table "public"."follows" add constraint "follows_following_user_id_fkey" FOREIGN KEY (following_user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."follows" validate constraint "follows_following_user_id_fkey";

alter table "public"."fraud_analysis" add constraint "fraud_analysis_confidence_check" CHECK (((confidence >= (0)::numeric) AND (confidence <= (100)::numeric))) not valid;

alter table "public"."fraud_analysis" validate constraint "fraud_analysis_confidence_check";

alter table "public"."fraud_analysis" add constraint "fraud_analysis_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."fraud_analysis" validate constraint "fraud_analysis_user_id_fkey";

alter table "public"."gallery_access_requests" add constraint "gallery_access_requests_requested_from_fkey" FOREIGN KEY (requested_from) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."gallery_access_requests" validate constraint "gallery_access_requests_requested_from_fkey";

alter table "public"."gallery_access_requests" add constraint "gallery_access_requests_requester_id_fkey" FOREIGN KEY (requester_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."gallery_access_requests" validate constraint "gallery_access_requests_requester_id_fkey";

alter table "public"."gallery_access_requests" add constraint "gallery_access_requests_requester_id_requested_from_key" UNIQUE using index "gallery_access_requests_requester_id_requested_from_key";

alter table "public"."gallery_access_requests" add constraint "gallery_access_requests_status_check" CHECK ((status = ANY (ARRAY['pending'::text, 'approved'::text, 'denied'::text]))) not valid;

alter table "public"."gallery_access_requests" validate constraint "gallery_access_requests_status_check";

alter table "public"."gallery_permissions" add constraint "gallery_permissions_granted_by_fkey" FOREIGN KEY (granted_by) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."gallery_permissions" validate constraint "gallery_permissions_granted_by_fkey";

alter table "public"."gallery_permissions" add constraint "gallery_permissions_granted_to_fkey" FOREIGN KEY (granted_to) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."gallery_permissions" validate constraint "gallery_permissions_granted_to_fkey";

alter table "public"."gallery_permissions" add constraint "gallery_permissions_permission_type_check" CHECK ((permission_type = ANY (ARRAY['view'::text, 'download'::text, 'share'::text]))) not valid;

alter table "public"."gallery_permissions" validate constraint "gallery_permissions_permission_type_check";

alter table "public"."gallery_permissions" add constraint "gallery_permissions_profile_id_fkey" FOREIGN KEY (profile_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."gallery_permissions" validate constraint "gallery_permissions_profile_id_fkey";

alter table "public"."gallery_permissions" add constraint "gallery_permissions_profile_id_granted_to_permission_type_key" UNIQUE using index "gallery_permissions_profile_id_granted_to_permission_type_key";

alter table "public"."image_permissions" add constraint "image_permissions_granted_by_fkey" FOREIGN KEY (granted_by) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."image_permissions" validate constraint "image_permissions_granted_by_fkey";

alter table "public"."image_permissions" add constraint "image_permissions_granted_to_fkey" FOREIGN KEY (granted_to) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."image_permissions" validate constraint "image_permissions_granted_to_fkey";

alter table "public"."image_permissions" add constraint "image_permissions_image_id_fkey" FOREIGN KEY (image_id) REFERENCES images(id) ON DELETE CASCADE not valid;

alter table "public"."image_permissions" validate constraint "image_permissions_image_id_fkey";

alter table "public"."image_permissions" add constraint "image_permissions_image_id_granted_to_key" UNIQUE using index "image_permissions_image_id_granted_to_key";

alter table "public"."images" add constraint "images_profile_id_fkey" FOREIGN KEY (profile_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."images" validate constraint "images_profile_id_fkey";

alter table "public"."images" add constraint "images_type_check" CHECK ((type = ANY (ARRAY['profile'::text, 'gallery'::text, 'avatar'::text]))) not valid;

alter table "public"."images" validate constraint "images_type_check";

alter table "public"."invitation_analytics" add constraint "invitation_analytics_event_type_check" CHECK (((event_type)::text = ANY ((ARRAY['sent'::character varying, 'viewed'::character varying, 'responded'::character varying, 'expired'::character varying, 'reminder_sent'::character varying])::text[]))) not valid;

alter table "public"."invitation_analytics" validate constraint "invitation_analytics_event_type_check";

alter table "public"."invitation_analytics" add constraint "invitation_analytics_invitation_id_fkey" FOREIGN KEY (invitation_id) REFERENCES invitations(id) ON DELETE CASCADE not valid;

alter table "public"."invitation_analytics" validate constraint "invitation_analytics_invitation_id_fkey";

alter table "public"."invitation_responses" add constraint "invitation_responses_counter_invitation_id_fkey" FOREIGN KEY (counter_invitation_id) REFERENCES invitations(id) not valid;

alter table "public"."invitation_responses" validate constraint "invitation_responses_counter_invitation_id_fkey";

alter table "public"."invitation_responses" add constraint "invitation_responses_invitation_id_fkey" FOREIGN KEY (invitation_id) REFERENCES invitations(id) ON DELETE CASCADE not valid;

alter table "public"."invitation_responses" validate constraint "invitation_responses_invitation_id_fkey";

alter table "public"."invitation_responses" add constraint "invitation_responses_invitation_id_key" UNIQUE using index "invitation_responses_invitation_id_key";

alter table "public"."invitation_responses" add constraint "invitation_responses_response_type_check" CHECK (((response_type)::text = ANY ((ARRAY['accept'::character varying, 'decline'::character varying, 'counter_invite'::character varying])::text[]))) not valid;

alter table "public"."invitation_responses" validate constraint "invitation_responses_response_type_check";

alter table "public"."invitation_templates" add constraint "invitation_templates_created_by_fkey" FOREIGN KEY (created_by) REFERENCES profiles(user_id) not valid;

alter table "public"."invitation_templates" validate constraint "invitation_templates_created_by_fkey";

alter table "public"."invitation_templates" add constraint "invitation_templates_invitation_type_check" CHECK (((invitation_type)::text = ANY ((ARRAY['profile'::character varying, 'gallery'::character varying, 'chat'::character varying, 'event'::character varying, 'meetup'::character varying])::text[]))) not valid;

alter table "public"."invitation_templates" validate constraint "invitation_templates_invitation_type_check";

alter table "public"."invitations" add constraint "invitations_from_profile_fkey" FOREIGN KEY (from_profile) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."invitations" validate constraint "invitations_from_profile_fkey";

alter table "public"."invitations" add constraint "invitations_from_profile_to_profile_type_key" UNIQUE using index "invitations_from_profile_to_profile_type_key";

alter table "public"."invitations" add constraint "invitations_status_check" CHECK ((status = ANY (ARRAY['pending'::text, 'accepted'::text, 'declined'::text, 'expired'::text]))) not valid;

alter table "public"."invitations" validate constraint "invitations_status_check";

alter table "public"."invitations" add constraint "invitations_to_profile_fkey" FOREIGN KEY (to_profile) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."invitations" validate constraint "invitations_to_profile_fkey";

alter table "public"."invitations" add constraint "invitations_type_check" CHECK ((type = ANY (ARRAY['connection'::text, 'event'::text, 'group'::text]))) not valid;

alter table "public"."invitations" validate constraint "invitations_type_check";

alter table "public"."match_interactions" add constraint "match_interactions_interaction_type_check" CHECK ((interaction_type = ANY (ARRAY['like'::text, 'super_like'::text, 'pass'::text, 'block'::text]))) not valid;

alter table "public"."match_interactions" validate constraint "match_interactions_interaction_type_check";

alter table "public"."match_interactions" add constraint "match_interactions_match_id_fkey" FOREIGN KEY (match_id) REFERENCES matches(id) ON DELETE CASCADE not valid;

alter table "public"."match_interactions" validate constraint "match_interactions_match_id_fkey";

alter table "public"."match_interactions" add constraint "match_interactions_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."match_interactions" validate constraint "match_interactions_user_id_fkey";

alter table "public"."matches" add constraint "matches_status_check" CHECK ((status = ANY (ARRAY['active'::text, 'inactive'::text, 'blocked'::text]))) not valid;

alter table "public"."matches" validate constraint "matches_status_check";

alter table "public"."matches" add constraint "matches_user1_id_fkey" FOREIGN KEY (user1_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."matches" validate constraint "matches_user1_id_fkey";

alter table "public"."matches" add constraint "matches_user1_id_user2_id_key" UNIQUE using index "matches_user1_id_user2_id_key";

alter table "public"."matches" add constraint "matches_user2_id_fkey" FOREIGN KEY (user2_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."matches" validate constraint "matches_user2_id_fkey";

alter table "public"."media_access_logs" add constraint "media_access_logs_user_id_fkey" FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE not valid;

alter table "public"."media_access_logs" validate constraint "media_access_logs_user_id_fkey";

alter table "public"."messages" add constraint "messages_message_type_check" CHECK ((message_type = ANY (ARRAY['text'::text, 'image'::text, 'file'::text, 'system'::text]))) not valid;

alter table "public"."messages" validate constraint "messages_message_type_check";

alter table "public"."messages" add constraint "messages_room_id_fkey" FOREIGN KEY (room_id) REFERENCES chat_rooms(id) ON DELETE CASCADE not valid;

alter table "public"."messages" validate constraint "messages_room_id_fkey";

alter table "public"."messages" add constraint "messages_sender_id_fkey" FOREIGN KEY (sender_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."messages" validate constraint "messages_sender_id_fkey";

alter table "public"."moderation_logs" add constraint "moderation_logs_action_type_check" CHECK ((action_type = ANY (ARRAY['report_resolved'::text, 'user_warned'::text, 'user_suspended'::text, 'user_banned'::text, 'content_removed'::text, 'account_verified'::text, 'token_adjustment'::text, 'system_action'::text]))) not valid;

alter table "public"."moderation_logs" validate constraint "moderation_logs_action_type_check";

alter table "public"."moderation_logs" add constraint "moderation_logs_moderator_id_fkey" FOREIGN KEY (moderator_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."moderation_logs" validate constraint "moderation_logs_moderator_id_fkey";

alter table "public"."moderation_logs" add constraint "moderation_logs_target_type_check" CHECK ((target_type = ANY (ARRAY['user'::text, 'report'::text, 'content'::text, 'transaction'::text, 'system'::text]))) not valid;

alter table "public"."moderation_logs" validate constraint "moderation_logs_target_type_check";

alter table "public"."moderation_logs" add constraint "moderation_logs_target_user_id_fkey" FOREIGN KEY (target_user_id) REFERENCES auth.users(id) ON DELETE SET NULL not valid;

alter table "public"."moderation_logs" validate constraint "moderation_logs_target_user_id_fkey";

alter table "public"."moderator_requests" add constraint "moderator_requests_disponibilidad_horas_check" CHECK ((disponibilidad_horas > 0)) not valid;

alter table "public"."moderator_requests" validate constraint "moderator_requests_disponibilidad_horas_check";

alter table "public"."moderator_requests" add constraint "moderator_requests_edad_check" CHECK ((edad >= 18)) not valid;

alter table "public"."moderator_requests" validate constraint "moderator_requests_edad_check";

alter table "public"."moderator_requests" add constraint "moderator_requests_reviewed_by_fkey" FOREIGN KEY (reviewed_by) REFERENCES auth.users(id) not valid;

alter table "public"."moderator_requests" validate constraint "moderator_requests_reviewed_by_fkey";

alter table "public"."moderator_requests" add constraint "moderator_requests_status_check" CHECK ((status = ANY (ARRAY['pending'::text, 'reviewing'::text, 'approved'::text, 'rejected'::text]))) not valid;

alter table "public"."moderator_requests" validate constraint "moderator_requests_status_check";

alter table "public"."moderator_requests" add constraint "moderator_requests_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."moderator_requests" validate constraint "moderator_requests_user_id_fkey";

alter table "public"."moderator_requests" add constraint "moderator_requests_user_id_key" UNIQUE using index "moderator_requests_user_id_key";

alter table "public"."moderators" add constraint "moderators_created_by_fkey" FOREIGN KEY (created_by) REFERENCES auth.users(id) not valid;

alter table "public"."moderators" validate constraint "moderators_created_by_fkey";

alter table "public"."moderators" add constraint "moderators_role_check" CHECK ((role = ANY (ARRAY['moderator'::text, 'senior_moderator'::text, 'admin'::text]))) not valid;

alter table "public"."moderators" validate constraint "moderators_role_check";

alter table "public"."moderators" add constraint "moderators_status_check" CHECK ((status = ANY (ARRAY['pending'::text, 'active'::text, 'suspended'::text, 'inactive'::text]))) not valid;

alter table "public"."moderators" validate constraint "moderators_status_check";

alter table "public"."moderators" add constraint "moderators_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."moderators" validate constraint "moderators_user_id_fkey";

alter table "public"."moderators" add constraint "moderators_user_id_key" UNIQUE using index "moderators_user_id_key";

alter table "public"."notification_history" add constraint "notification_history_status_check" CHECK ((status = ANY (ARRAY['pending'::text, 'sent'::text, 'delivered'::text, 'failed'::text]))) not valid;

alter table "public"."notification_history" validate constraint "notification_history_status_check";

alter table "public"."notification_history" add constraint "notification_history_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."notification_history" validate constraint "notification_history_user_id_fkey";

alter table "public"."notification_preferences" add constraint "notification_preferences_user_id_fkey" FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE not valid;

alter table "public"."notification_preferences" validate constraint "notification_preferences_user_id_fkey";

alter table "public"."notification_preferences" add constraint "notification_preferences_user_id_notification_type_key" UNIQUE using index "notification_preferences_user_id_notification_type_key";

alter table "public"."notifications" add constraint "notifications_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."notifications" validate constraint "notifications_user_id_fkey";

alter table "public"."pending_rewards" add constraint "pending_rewards_amount_check" CHECK ((amount > 0)) not valid;

alter table "public"."pending_rewards" validate constraint "pending_rewards_amount_check";

alter table "public"."pending_rewards" add constraint "pending_rewards_reward_type_check" CHECK ((reward_type = ANY (ARRAY['world_id_verification'::text, 'referral_bonus'::text, 'beta_feedback'::text, 'daily_login'::text, 'profile_completion'::text, 'first_match'::text]))) not valid;

alter table "public"."pending_rewards" validate constraint "pending_rewards_reward_type_check";

alter table "public"."pending_rewards" add constraint "pending_rewards_token_type_check" CHECK ((token_type = ANY (ARRAY['CMPX'::text, 'GTK'::text]))) not valid;

alter table "public"."pending_rewards" validate constraint "pending_rewards_token_type_check";

alter table "public"."pending_rewards" add constraint "pending_rewards_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."pending_rewards" validate constraint "pending_rewards_user_id_fkey";

alter table "public"."pending_rewards" add constraint "unique_user_reward" UNIQUE using index "unique_user_reward";

alter table "public"."post_comments" add constraint "comments_content_length" CHECK (((char_length(content) >= 1) AND (char_length(content) <= 500))) not valid;

alter table "public"."post_comments" validate constraint "comments_content_length";

alter table "public"."post_comments" add constraint "post_comments_parent_comment_id_fkey" FOREIGN KEY (parent_comment_id) REFERENCES post_comments(id) ON DELETE CASCADE not valid;

alter table "public"."post_comments" validate constraint "post_comments_parent_comment_id_fkey";

alter table "public"."post_comments" add constraint "post_comments_post_id_fkey" FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE not valid;

alter table "public"."post_comments" validate constraint "post_comments_post_id_fkey";

alter table "public"."post_comments" add constraint "post_comments_profile_id_fkey" FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE not valid;

alter table "public"."post_comments" validate constraint "post_comments_profile_id_fkey";

alter table "public"."post_comments" add constraint "post_comments_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."post_comments" validate constraint "post_comments_user_id_fkey";

alter table "public"."post_likes" add constraint "post_likes_post_id_fkey" FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE not valid;

alter table "public"."post_likes" validate constraint "post_likes_post_id_fkey";

alter table "public"."post_likes" add constraint "post_likes_post_id_user_id_key" UNIQUE using index "post_likes_post_id_user_id_key";

alter table "public"."post_likes" add constraint "post_likes_profile_id_fkey" FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE not valid;

alter table "public"."post_likes" validate constraint "post_likes_profile_id_fkey";

alter table "public"."post_likes" add constraint "post_likes_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."post_likes" validate constraint "post_likes_user_id_fkey";

alter table "public"."post_shares" add constraint "post_shares_post_id_fkey" FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE not valid;

alter table "public"."post_shares" validate constraint "post_shares_post_id_fkey";

alter table "public"."post_shares" add constraint "post_shares_post_id_user_id_share_type_key" UNIQUE using index "post_shares_post_id_user_id_share_type_key";

alter table "public"."post_shares" add constraint "post_shares_profile_id_fkey" FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE not valid;

alter table "public"."post_shares" validate constraint "post_shares_profile_id_fkey";

alter table "public"."post_shares" add constraint "post_shares_share_type_check" CHECK (((share_type)::text = ANY ((ARRAY['share'::character varying, 'repost'::character varying])::text[]))) not valid;

alter table "public"."post_shares" validate constraint "post_shares_share_type_check";

alter table "public"."post_shares" add constraint "post_shares_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."post_shares" validate constraint "post_shares_user_id_fkey";

alter table "public"."posts" add constraint "posts_content_length" CHECK (((char_length(content) >= 1) AND (char_length(content) <= 2000))) not valid;

alter table "public"."posts" validate constraint "posts_content_length";

alter table "public"."posts" add constraint "posts_post_type_check" CHECK (((post_type)::text = ANY ((ARRAY['text'::character varying, 'photo'::character varying, 'video'::character varying])::text[]))) not valid;

alter table "public"."posts" validate constraint "posts_post_type_check";

alter table "public"."posts" add constraint "posts_profile_id_fkey" FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE not valid;

alter table "public"."posts" validate constraint "posts_profile_id_fkey";

alter table "public"."posts" add constraint "posts_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."posts" validate constraint "posts_user_id_fkey";

alter table "public"."posts" add constraint "posts_valid_media" CHECK (((((post_type)::text = 'text'::text) AND (image_url IS NULL) AND (video_url IS NULL)) OR (((post_type)::text = 'photo'::text) AND (image_url IS NOT NULL) AND (video_url IS NULL)) OR (((post_type)::text = 'video'::text) AND (video_url IS NOT NULL) AND (image_url IS NULL)))) not valid;

alter table "public"."posts" validate constraint "posts_valid_media";

alter table "public"."profile_cache" add constraint "profile_cache_profile_id_fkey" FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE not valid;

alter table "public"."profile_cache" validate constraint "profile_cache_profile_id_fkey";

alter table "public"."profile_cache" add constraint "unique_profile_cache_key" UNIQUE using index "unique_profile_cache_key";

alter table "public"."profiles" add constraint "profiles_account_type_check" CHECK ((account_type = ANY (ARRAY['single'::text, 'couple'::text]))) not valid;

alter table "public"."profiles" validate constraint "profiles_account_type_check";

alter table "public"."profiles" add constraint "profiles_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."profiles" validate constraint "profiles_user_id_fkey";

alter table "public"."profiles" add constraint "unique_user_profile" UNIQUE using index "unique_user_profile";

alter table "public"."referral_rewards" add constraint "referral_rewards_invited_id_fkey" FOREIGN KEY (invited_id) REFERENCES auth.users(id) not valid;

alter table "public"."referral_rewards" validate constraint "referral_rewards_invited_id_fkey";

alter table "public"."referral_rewards" add constraint "referral_rewards_inviter_id_fkey" FOREIGN KEY (inviter_id) REFERENCES auth.users(id) not valid;

alter table "public"."referral_rewards" validate constraint "referral_rewards_inviter_id_fkey";

alter table "public"."referral_rewards" add constraint "referral_rewards_referral_code_key" UNIQUE using index "referral_rewards_referral_code_key";

alter table "public"."referral_rewards" add constraint "referral_rewards_user_id_fkey" FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE not valid;

alter table "public"."referral_rewards" validate constraint "referral_rewards_user_id_fkey";

alter table "public"."referral_statistics" add constraint "referral_statistics_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."referral_statistics" validate constraint "referral_statistics_user_id_fkey";

alter table "public"."referral_statistics" add constraint "referral_statistics_user_id_period_start_key" UNIQUE using index "referral_statistics_user_id_period_start_key";

alter table "public"."referral_transactions" add constraint "referral_transactions_related_reward_id_fkey" FOREIGN KEY (related_reward_id) REFERENCES referral_rewards(id) not valid;

alter table "public"."referral_transactions" validate constraint "referral_transactions_related_reward_id_fkey";

alter table "public"."referral_transactions" add constraint "referral_transactions_transaction_type_check" CHECK (((transaction_type)::text = ANY ((ARRAY['referral_earn'::character varying, 'referral_spend'::character varying, 'monthly_reset'::character varying, 'bonus_grant'::character varying])::text[]))) not valid;

alter table "public"."referral_transactions" validate constraint "referral_transactions_transaction_type_check";

alter table "public"."referral_transactions" add constraint "referral_transactions_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."referral_transactions" validate constraint "referral_transactions_user_id_fkey";

alter table "public"."reports" add constraint "reports_content_type_check" CHECK ((content_type = ANY (ARRAY['profile'::text, 'story'::text, 'post'::text]))) not valid;

alter table "public"."reports" validate constraint "reports_content_type_check";

alter table "public"."reports" add constraint "reports_reported_user_id_fkey" FOREIGN KEY (reported_user_id) REFERENCES profiles(id) ON DELETE CASCADE not valid;

alter table "public"."reports" validate constraint "reports_reported_user_id_fkey";

alter table "public"."reports" add constraint "reports_reporter_user_id_fkey" FOREIGN KEY (reporter_user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."reports" validate constraint "reports_reporter_user_id_fkey";

alter table "public"."reports" add constraint "reports_reviewed_by_fkey" FOREIGN KEY (reviewed_by) REFERENCES auth.users(id) not valid;

alter table "public"."reports" validate constraint "reports_reviewed_by_fkey";

alter table "public"."reports" add constraint "reports_severity_check" CHECK ((severity = ANY (ARRAY['low'::text, 'medium'::text, 'high'::text, 'critical'::text]))) not valid;

alter table "public"."reports" validate constraint "reports_severity_check";

alter table "public"."reports" add constraint "reports_status_check" CHECK ((status = ANY (ARRAY['pending'::text, 'resolved'::text, 'dismissed'::text]))) not valid;

alter table "public"."reports" validate constraint "reports_status_check";

alter table "public"."roles" add constraint "roles_name_key" UNIQUE using index "roles_name_key";

alter table "public"."security" add constraint "security_event_type_check" CHECK ((event_type = ANY (ARRAY['login'::text, 'logout'::text, 'failed_login'::text, 'password_change'::text, 'suspicious_activity'::text, 'account_locked'::text, 'data_access'::text]))) not valid;

alter table "public"."security" validate constraint "security_event_type_check";

alter table "public"."security" add constraint "security_risk_level_check" CHECK ((risk_level = ANY (ARRAY['low'::text, 'medium'::text, 'high'::text, 'critical'::text]))) not valid;

alter table "public"."security" validate constraint "security_risk_level_check";

alter table "public"."security" add constraint "security_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL not valid;

alter table "public"."security" validate constraint "security_user_id_fkey";

alter table "public"."security_alerts" add constraint "security_alerts_acknowledged_by_fkey" FOREIGN KEY (acknowledged_by) REFERENCES auth.users(id) not valid;

alter table "public"."security_alerts" validate constraint "security_alerts_acknowledged_by_fkey";

alter table "public"."security_alerts" add constraint "security_alerts_resolved_by_fkey" FOREIGN KEY (resolved_by) REFERENCES auth.users(id) not valid;

alter table "public"."security_alerts" validate constraint "security_alerts_resolved_by_fkey";

alter table "public"."security_alerts" add constraint "security_alerts_severity_check" CHECK ((severity = ANY (ARRAY['low'::text, 'medium'::text, 'high'::text, 'critical'::text]))) not valid;

alter table "public"."security_alerts" validate constraint "security_alerts_severity_check";

alter table "public"."security_alerts" add constraint "security_alerts_status_check" CHECK ((status = ANY (ARRAY['active'::text, 'acknowledged'::text, 'resolved'::text]))) not valid;

alter table "public"."security_alerts" validate constraint "security_alerts_status_check";

alter table "public"."security_audit_logs" add constraint "security_audit_logs_risk_score_check" CHECK (((risk_score >= 0) AND (risk_score <= 100))) not valid;

alter table "public"."security_audit_logs" validate constraint "security_audit_logs_risk_score_check";

alter table "public"."security_audit_logs" add constraint "security_audit_logs_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."security_audit_logs" validate constraint "security_audit_logs_user_id_fkey";

alter table "public"."security_configurations" add constraint "security_configurations_config_key_key" UNIQUE using index "security_configurations_config_key_key";

alter table "public"."security_configurations" add constraint "security_configurations_updated_by_fkey" FOREIGN KEY (updated_by) REFERENCES auth.users(id) not valid;

alter table "public"."security_configurations" validate constraint "security_configurations_updated_by_fkey";

alter table "public"."security_flags" add constraint "security_flags_confidence_check" CHECK (((confidence >= 0) AND (confidence <= 100))) not valid;

alter table "public"."security_flags" validate constraint "security_flags_confidence_check";

alter table "public"."security_flags" add constraint "security_flags_flag_type_check" CHECK (((flag_type)::text = ANY ((ARRAY['suspicious_login'::character varying, 'multiple_devices'::character varying, 'unusual_activity'::character varying, 'fraud_pattern'::character varying, 'account_compromise'::character varying])::text[]))) not valid;

alter table "public"."security_flags" validate constraint "security_flags_flag_type_check";

alter table "public"."security_flags" add constraint "security_flags_resolved_by_fkey" FOREIGN KEY (resolved_by) REFERENCES auth.users(id) not valid;

alter table "public"."security_flags" validate constraint "security_flags_resolved_by_fkey";

alter table "public"."security_flags" add constraint "security_flags_severity_check" CHECK (((severity)::text = ANY ((ARRAY['low'::character varying, 'medium'::character varying, 'high'::character varying, 'critical'::character varying])::text[]))) not valid;

alter table "public"."security_flags" validate constraint "security_flags_severity_check";

alter table "public"."security_flags" add constraint "security_flags_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."security_flags" validate constraint "security_flags_user_id_fkey";

alter table "public"."sessions" add constraint "sessions_session_token_key" UNIQUE using index "sessions_session_token_key";

alter table "public"."sessions" add constraint "sessions_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."sessions" validate constraint "sessions_user_id_fkey";

alter table "public"."sessions" add constraint "valid_expiry" CHECK ((expires_at > created_at)) not valid;

alter table "public"."sessions" validate constraint "valid_expiry";

alter table "public"."staking_records" add constraint "staking_records_status_check" CHECK (((status)::text = ANY ((ARRAY['active'::character varying, 'completed'::character varying, 'cancelled'::character varying])::text[]))) not valid;

alter table "public"."staking_records" validate constraint "staking_records_status_check";

alter table "public"."staking_records" add constraint "staking_records_token_type_check" CHECK (((token_type)::text = ANY ((ARRAY['CMPX'::character varying, 'GTK'::character varying])::text[]))) not valid;

alter table "public"."staking_records" validate constraint "staking_records_token_type_check";

alter table "public"."staking_records" add constraint "staking_records_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."staking_records" validate constraint "staking_records_user_id_fkey";

alter table "public"."stories" add constraint "stories_content_type_check" CHECK (((content_type)::text = ANY ((ARRAY['image'::character varying, 'video'::character varying, 'text'::character varying])::text[]))) not valid;

alter table "public"."stories" validate constraint "stories_content_type_check";

alter table "public"."stories" add constraint "stories_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."stories" validate constraint "stories_user_id_fkey";

alter table "public"."story_comments" add constraint "story_comments_parent_comment_id_fkey" FOREIGN KEY (parent_comment_id) REFERENCES story_comments(id) not valid;

alter table "public"."story_comments" validate constraint "story_comments_parent_comment_id_fkey";

alter table "public"."story_comments" add constraint "story_comments_story_id_fkey" FOREIGN KEY (story_id) REFERENCES stories(id) ON DELETE CASCADE not valid;

alter table "public"."story_comments" validate constraint "story_comments_story_id_fkey";

alter table "public"."story_comments" add constraint "story_comments_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."story_comments" validate constraint "story_comments_user_id_fkey";

alter table "public"."story_likes" add constraint "story_likes_story_id_fkey" FOREIGN KEY (story_id) REFERENCES stories(id) ON DELETE CASCADE not valid;

alter table "public"."story_likes" validate constraint "story_likes_story_id_fkey";

alter table "public"."story_likes" add constraint "story_likes_story_id_user_id_key" UNIQUE using index "story_likes_story_id_user_id_key";

alter table "public"."story_likes" add constraint "story_likes_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."story_likes" validate constraint "story_likes_user_id_fkey";

alter table "public"."story_reports" add constraint "story_reports_reason_check" CHECK (((reason)::text = ANY ((ARRAY['spam'::character varying, 'inappropriate'::character varying, 'harassment'::character varying, 'fake'::character varying, 'other'::character varying])::text[]))) not valid;

alter table "public"."story_reports" validate constraint "story_reports_reason_check";

alter table "public"."story_reports" add constraint "story_reports_reporter_user_id_fkey" FOREIGN KEY (reporter_user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."story_reports" validate constraint "story_reports_reporter_user_id_fkey";

alter table "public"."story_reports" add constraint "story_reports_reviewed_by_fkey" FOREIGN KEY (reviewed_by) REFERENCES auth.users(id) not valid;

alter table "public"."story_reports" validate constraint "story_reports_reviewed_by_fkey";

alter table "public"."story_reports" add constraint "story_reports_status_check" CHECK (((status)::text = ANY ((ARRAY['pending'::character varying, 'reviewed'::character varying, 'resolved'::character varying, 'dismissed'::character varying])::text[]))) not valid;

alter table "public"."story_reports" validate constraint "story_reports_status_check";

alter table "public"."story_reports" add constraint "story_reports_story_id_fkey" FOREIGN KEY (story_id) REFERENCES stories(id) ON DELETE CASCADE not valid;

alter table "public"."story_reports" validate constraint "story_reports_story_id_fkey";

alter table "public"."story_reports" add constraint "story_reports_story_id_reporter_user_id_key" UNIQUE using index "story_reports_story_id_reporter_user_id_key";

alter table "public"."story_shares" add constraint "story_shares_share_type_check" CHECK (((share_type)::text = ANY ((ARRAY['share'::character varying, 'repost'::character varying])::text[]))) not valid;

alter table "public"."story_shares" validate constraint "story_shares_share_type_check";

alter table "public"."story_shares" add constraint "story_shares_story_id_fkey" FOREIGN KEY (story_id) REFERENCES stories(id) ON DELETE CASCADE not valid;

alter table "public"."story_shares" validate constraint "story_shares_story_id_fkey";

alter table "public"."story_shares" add constraint "story_shares_story_id_user_id_platform_key" UNIQUE using index "story_shares_story_id_user_id_platform_key";

alter table "public"."story_shares" add constraint "story_shares_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."story_shares" validate constraint "story_shares_user_id_fkey";

alter table "public"."subscribers" add constraint "subscribers_email_key" UNIQUE using index "subscribers_email_key";

alter table "public"."subscribers" add constraint "subscribers_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."subscribers" validate constraint "subscribers_user_id_fkey";

alter table "public"."swinger_interests" add constraint "swinger_interests_name_key" UNIQUE using index "swinger_interests_name_key";

alter table "public"."system_metrics" add constraint "system_metrics_metric_type_check" CHECK ((metric_type = ANY (ARRAY['response_time'::text, 'query_count'::text, 'error_rate'::text, 'active_users'::text, 'token_transactions'::text, 'report_activity'::text, 'memory_usage'::text, 'cpu_usage'::text]))) not valid;

alter table "public"."system_metrics" validate constraint "system_metrics_metric_type_check";

alter table "public"."system_metrics" add constraint "system_metrics_metric_unit_check" CHECK ((metric_unit = ANY (ARRAY['ms'::text, 'count'::text, 'percentage'::text, 'bytes'::text, 'users'::text]))) not valid;

alter table "public"."system_metrics" validate constraint "system_metrics_metric_unit_check";

alter table "public"."threat_detections" add constraint "threat_detections_confidence_check" CHECK (((confidence >= (0)::numeric) AND (confidence <= (1)::numeric))) not valid;

alter table "public"."threat_detections" validate constraint "threat_detections_confidence_check";

alter table "public"."threat_detections" add constraint "threat_detections_resolved_by_fkey" FOREIGN KEY (resolved_by) REFERENCES auth.users(id) not valid;

alter table "public"."threat_detections" validate constraint "threat_detections_resolved_by_fkey";

alter table "public"."threat_detections" add constraint "threat_detections_severity_check" CHECK ((severity = ANY (ARRAY['low'::text, 'medium'::text, 'high'::text, 'critical'::text]))) not valid;

alter table "public"."threat_detections" validate constraint "threat_detections_severity_check";

alter table "public"."threat_detections" add constraint "threat_detections_status_check" CHECK ((status = ANY (ARRAY['active'::text, 'investigating'::text, 'resolved'::text, 'false_positive'::text]))) not valid;

alter table "public"."threat_detections" validate constraint "threat_detections_status_check";

alter table "public"."threat_detections" add constraint "threat_detections_threat_id_key" UNIQUE using index "threat_detections_threat_id_key";

alter table "public"."threat_detections" add constraint "threat_detections_threat_type_check" CHECK ((threat_type = ANY (ARRAY['brute_force'::text, 'data_breach'::text, 'suspicious_pattern'::text, 'unauthorized_access'::text, 'malware'::text]))) not valid;

alter table "public"."threat_detections" validate constraint "threat_detections_threat_type_check";

alter table "public"."token_analytics" add constraint "token_analytics_period_type_check" CHECK ((period_type = ANY (ARRAY['hourly'::text, 'daily'::text, 'weekly'::text, 'monthly'::text]))) not valid;

alter table "public"."token_analytics" validate constraint "token_analytics_period_type_check";

alter table "public"."token_analytics" add constraint "token_analytics_period_type_period_start_key" UNIQUE using index "token_analytics_period_type_period_start_key";

alter table "public"."token_transactions" add constraint "token_transactions_status_check" CHECK (((status)::text = ANY ((ARRAY['pending'::character varying, 'completed'::character varying, 'failed'::character varying])::text[]))) not valid;

alter table "public"."token_transactions" validate constraint "token_transactions_status_check";

alter table "public"."token_transactions" add constraint "token_transactions_token_type_check" CHECK (((token_type)::text = ANY ((ARRAY['CMPX'::character varying, 'GTK'::character varying])::text[]))) not valid;

alter table "public"."token_transactions" validate constraint "token_transactions_token_type_check";

alter table "public"."token_transactions" add constraint "token_transactions_transaction_type_check" CHECK (((transaction_type)::text = ANY ((ARRAY['deposit'::character varying, 'withdrawal'::character varying, 'transfer'::character varying, 'reward'::character varying, 'penalty'::character varying])::text[]))) not valid;

alter table "public"."token_transactions" validate constraint "token_transactions_transaction_type_check";

alter table "public"."token_transactions" add constraint "token_transactions_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."token_transactions" validate constraint "token_transactions_user_id_fkey";

alter table "public"."tokens" add constraint "tokens_token_code_key" UNIQUE using index "tokens_token_code_key";

alter table "public"."transactions" add constraint "transactions_related_user_id_fkey" FOREIGN KEY (related_user_id) REFERENCES auth.users(id) not valid;

alter table "public"."transactions" validate constraint "transactions_related_user_id_fkey";

alter table "public"."transactions" add constraint "transactions_token_type_check" CHECK ((token_type = ANY (ARRAY['CMPX'::text, 'GTK'::text]))) not valid;

alter table "public"."transactions" validate constraint "transactions_token_type_check";

alter table "public"."transactions" add constraint "transactions_transaction_type_check" CHECK ((transaction_type = ANY (ARRAY['referral_bonus'::text, 'welcome_bonus'::text, 'world_id_bonus'::text, 'staking_reward'::text, 'premium_purchase'::text, 'beta_reward'::text, 'stake_tokens'::text, 'unstake_tokens'::text, 'manual_adjustment'::text]))) not valid;

alter table "public"."transactions" validate constraint "transactions_transaction_type_check";

alter table "public"."transactions" add constraint "transactions_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."transactions" validate constraint "transactions_user_id_fkey";

alter table "public"."transactions" add constraint "valid_amount" CHECK ((amount <> 0)) not valid;

alter table "public"."transactions" validate constraint "valid_amount";

alter table "public"."two_factor_auth" add constraint "two_factor_auth_method_check" CHECK (((method)::text = ANY ((ARRAY['2fa_app'::character varying, 'sms'::character varying, 'email'::character varying])::text[]))) not valid;

alter table "public"."two_factor_auth" validate constraint "two_factor_auth_method_check";

alter table "public"."two_factor_auth" add constraint "two_factor_auth_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."two_factor_auth" validate constraint "two_factor_auth_user_id_fkey";

alter table "public"."two_factor_auth" add constraint "two_factor_auth_user_id_method_key" UNIQUE using index "two_factor_auth_user_id_method_key";

alter table "public"."user_2fa_settings" add constraint "user_2fa_settings_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."user_2fa_settings" validate constraint "user_2fa_settings_user_id_fkey";

alter table "public"."user_2fa_settings" add constraint "user_2fa_settings_user_id_key" UNIQUE using index "user_2fa_settings_user_id_key";

alter table "public"."user_device_tokens" add constraint "user_device_tokens_device_type_check" CHECK ((device_type = ANY (ARRAY['android'::text, 'ios'::text, 'web'::text]))) not valid;

alter table "public"."user_device_tokens" validate constraint "user_device_tokens_device_type_check";

alter table "public"."user_device_tokens" add constraint "user_device_tokens_user_id_device_token_key" UNIQUE using index "user_device_tokens_user_id_device_token_key";

alter table "public"."user_device_tokens" add constraint "user_device_tokens_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."user_device_tokens" validate constraint "user_device_tokens_user_id_fkey";

alter table "public"."user_explicit_preferences" add constraint "user_explicit_preferences_preference_id_fkey" FOREIGN KEY (preference_id) REFERENCES explicit_preferences(id) ON DELETE CASCADE not valid;

alter table "public"."user_explicit_preferences" validate constraint "user_explicit_preferences_preference_id_fkey";

alter table "public"."user_explicit_preferences" add constraint "user_explicit_preferences_privacy_level_check" CHECK (((privacy_level)::text = ANY ((ARRAY['public'::character varying, 'friends'::character varying, 'private'::character varying, 'hidden'::character varying])::text[]))) not valid;

alter table "public"."user_explicit_preferences" validate constraint "user_explicit_preferences_privacy_level_check";

alter table "public"."user_explicit_preferences" add constraint "user_explicit_preferences_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."user_explicit_preferences" validate constraint "user_explicit_preferences_user_id_fkey";

alter table "public"."user_explicit_preferences" add constraint "user_explicit_preferences_user_id_preference_id_key" UNIQUE using index "user_explicit_preferences_user_id_preference_id_key";

alter table "public"."user_interests" add constraint "user_interests_interest_id_fkey" FOREIGN KEY (interest_id) REFERENCES swinger_interests(id) ON DELETE CASCADE not valid;

alter table "public"."user_interests" validate constraint "user_interests_interest_id_fkey";

alter table "public"."user_interests" add constraint "user_interests_privacy_level_check" CHECK (((privacy_level)::text = ANY ((ARRAY['public'::character varying, 'friends'::character varying, 'private'::character varying, 'hidden'::character varying])::text[]))) not valid;

alter table "public"."user_interests" validate constraint "user_interests_privacy_level_check";

alter table "public"."user_interests" add constraint "user_interests_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."user_interests" validate constraint "user_interests_user_id_fkey";

alter table "public"."user_interests" add constraint "user_interests_user_id_interest_id_key" UNIQUE using index "user_interests_user_id_interest_id_key";

alter table "public"."user_likes" add constraint "user_likes_liked_user_id_fkey" FOREIGN KEY (liked_user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."user_likes" validate constraint "user_likes_liked_user_id_fkey";

alter table "public"."user_likes" add constraint "user_likes_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."user_likes" validate constraint "user_likes_user_id_fkey";

alter table "public"."user_likes" add constraint "user_likes_user_id_liked_user_id_key" UNIQUE using index "user_likes_user_id_liked_user_id_key";

alter table "public"."user_notification_preferences" add constraint "user_notification_preferences_delivery_method_check" CHECK ((delivery_method = ANY (ARRAY['push'::text, 'email'::text, 'in_app'::text, 'sms'::text]))) not valid;

alter table "public"."user_notification_preferences" validate constraint "user_notification_preferences_delivery_method_check";

alter table "public"."user_notification_preferences" add constraint "user_notification_preferences_notification_type_check" CHECK ((notification_type = ANY (ARRAY['report_resolved'::text, 'token_transaction'::text, 'moderation_action'::text, 'system_alert'::text, 'match_notification'::text, 'message_notification'::text]))) not valid;

alter table "public"."user_notification_preferences" validate constraint "user_notification_preferences_notification_type_check";

alter table "public"."user_notification_preferences" add constraint "user_notification_preferences_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."user_notification_preferences" validate constraint "user_notification_preferences_user_id_fkey";

alter table "public"."user_notification_preferences" add constraint "user_notification_preferences_user_id_notification_type_del_key" UNIQUE using index "user_notification_preferences_user_id_notification_type_del_key";

alter table "public"."user_referral_balances" add constraint "user_referral_balances_referral_code_key" UNIQUE using index "user_referral_balances_referral_code_key";

alter table "public"."user_referral_balances" add constraint "user_referral_balances_referred_by_fkey" FOREIGN KEY (referred_by) REFERENCES auth.users(id) not valid;

alter table "public"."user_referral_balances" validate constraint "user_referral_balances_referred_by_fkey";

alter table "public"."user_referral_balances" add constraint "user_referral_balances_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."user_referral_balances" validate constraint "user_referral_balances_user_id_fkey";

alter table "public"."user_referral_balances" add constraint "user_referral_balances_user_id_key" UNIQUE using index "user_referral_balances_user_id_key";

alter table "public"."user_roles" add constraint "user_roles_role_check" CHECK ((role = ANY (ARRAY['admin'::text, 'moderator'::text, 'user'::text, 'premium'::text]))) not valid;

alter table "public"."user_roles" validate constraint "user_roles_role_check";

alter table "public"."user_roles" add constraint "user_roles_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."user_roles" validate constraint "user_roles_user_id_fkey";

alter table "public"."user_roles" add constraint "user_roles_user_id_role_key" UNIQUE using index "user_roles_user_id_role_key";

alter table "public"."user_sessions" add constraint "user_sessions_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."user_sessions" validate constraint "user_sessions_user_id_fkey";

alter table "public"."user_staking" add constraint "user_staking_amount_check" CHECK ((amount > 0)) not valid;

alter table "public"."user_staking" validate constraint "user_staking_amount_check";

alter table "public"."user_staking" add constraint "user_staking_status_check" CHECK ((status = ANY (ARRAY['active'::text, 'completed'::text, 'cancelled'::text]))) not valid;

alter table "public"."user_staking" validate constraint "user_staking_status_check";

alter table "public"."user_staking" add constraint "user_staking_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."user_staking" validate constraint "user_staking_user_id_fkey";

alter table "public"."user_staking" add constraint "valid_staking_period" CHECK ((end_date > start_date)) not valid;

alter table "public"."user_staking" validate constraint "valid_staking_period";

alter table "public"."user_token_balances" add constraint "user_token_balances_referral_code_key" UNIQUE using index "user_token_balances_referral_code_key";

alter table "public"."user_token_balances" add constraint "user_token_balances_referred_by_fkey" FOREIGN KEY (referred_by) REFERENCES auth.users(id) not valid;

alter table "public"."user_token_balances" validate constraint "user_token_balances_referred_by_fkey";

alter table "public"."user_token_balances" add constraint "user_token_balances_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."user_token_balances" validate constraint "user_token_balances_user_id_fkey";

alter table "public"."user_token_balances" add constraint "user_token_balances_user_id_key" UNIQUE using index "user_token_balances_user_id_key";

alter table "public"."user_tokens" add constraint "unique_user_tokens" UNIQUE using index "unique_user_tokens";

alter table "public"."user_tokens" add constraint "user_tokens_referral_code_key" UNIQUE using index "user_tokens_referral_code_key";

alter table "public"."user_tokens" add constraint "user_tokens_referral_code_unique" UNIQUE using index "user_tokens_referral_code_unique";

alter table "public"."user_tokens" add constraint "user_tokens_referred_by_fkey" FOREIGN KEY (referred_by) REFERENCES auth.users(id) not valid;

alter table "public"."user_tokens" validate constraint "user_tokens_referred_by_fkey";

alter table "public"."user_tokens" add constraint "user_tokens_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."user_tokens" validate constraint "user_tokens_user_id_fkey";

alter table "public"."user_tokens" add constraint "valid_balances" CHECK (((cmpx_balance >= 0) AND (gtk_balance >= 0) AND (cmpx_staked >= 0))) not valid;

alter table "public"."user_tokens" validate constraint "valid_balances";

alter table "public"."user_tokens" add constraint "valid_monthly" CHECK (((monthly_earned >= 0) AND (monthly_earned <= monthly_limit))) not valid;

alter table "public"."user_tokens" validate constraint "valid_monthly";

alter table "public"."couple_events" add constraint "couple_events_event_type_check" CHECK ((event_type = ANY (ARRAY['meetup'::text, 'party'::text, 'dinner'::text, 'travel'::text, 'other'::text]))) not valid;

alter table "public"."couple_events" validate constraint "couple_events_event_type_check";

alter table "public"."couple_interactions" add constraint "couple_interactions_interaction_type_check" CHECK ((interaction_type = ANY (ARRAY['view'::text, 'like'::text, 'message'::text, 'wink'::text, 'gift'::text]))) not valid;

alter table "public"."couple_interactions" validate constraint "couple_interactions_interaction_type_check";

alter table "public"."couple_matches" add constraint "couple_matches_status_check" CHECK ((status = ANY (ARRAY['pending'::text, 'accepted'::text, 'rejected'::text, 'expired'::text]))) not valid;

alter table "public"."couple_matches" validate constraint "couple_matches_status_check";

alter table "public"."profiles" add constraint "profiles_role_check" CHECK ((role = ANY (ARRAY['admin'::text, 'moderator'::text, 'premium'::text, 'user'::text]))) not valid;

alter table "public"."profiles" validate constraint "profiles_role_check";

alter table "public"."security_events" add constraint "security_events_event_type_check" CHECK ((event_type = ANY (ARRAY['login'::text, 'logout'::text, 'suspicious_activity'::text, 'failed_login'::text, 'data_access'::text, 'admin_action'::text]))) not valid;

alter table "public"."security_events" validate constraint "security_events_event_type_check";

alter table "public"."security_events" add constraint "security_events_resolved_by_fkey" FOREIGN KEY (resolved_by) REFERENCES auth.users(id) not valid;

alter table "public"."security_events" validate constraint "security_events_resolved_by_fkey";

alter table "public"."security_events" add constraint "security_events_severity_check" CHECK ((severity = ANY (ARRAY['low'::text, 'medium'::text, 'high'::text, 'critical'::text]))) not valid;

alter table "public"."security_events" validate constraint "security_events_severity_check";

alter table "public"."security_events" add constraint "security_events_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."security_events" validate constraint "security_events_user_id_fkey";

set check_function_bodies = off;

create or replace view "public"."active_security_flags" as  SELECT sf.id,
    sf.user_id,
    sf.flag_type,
    sf.severity,
    sf.description,
    sf.confidence,
    sf.created_at,
    'Usuario'::text AS first_name,
    'Anónimo'::text AS last_name
   FROM security_flags sf
  WHERE (sf.is_resolved = false)
  ORDER BY sf.severity DESC, sf.confidence DESC;


CREATE OR REPLACE FUNCTION public.audit_suspicious_transactions()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    -- Alertar sobre transacciones grandes
    IF ABS(NEW.amount) > 1000 THEN
        -- Log de auditoría simple (sin tabla audit_logs por ahora)
        RAISE NOTICE 'Transacción grande detectada: % tokens para usuario %', NEW.amount, NEW.user_id;
    END IF;
    
    RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.calculate_compatibility(user1_uuid uuid, user2_uuid uuid)
 RETURNS numeric
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  shared_count INTEGER;
  total_user1 INTEGER;
  total_user2 INTEGER;
  compatibility DECIMAL(3,2);
BEGIN
  -- Contar intereses compartidos
  SELECT COUNT(*) INTO shared_count
  FROM public.user_interests ui1
  JOIN public.user_interests ui2 ON ui1.interest_id = ui2.interest_id
  WHERE ui1.user_id = user1_uuid 
    AND ui2.user_id = user2_uuid
    AND ui1.privacy_level IN ('public', 'friends')
    AND ui2.privacy_level IN ('public', 'friends');
  
  -- Contar total de intereses del usuario 1
  SELECT COUNT(*) INTO total_user1
  FROM public.user_interests
  WHERE user_id = user1_uuid AND privacy_level IN ('public', 'friends');
  
  -- Contar total de intereses del usuario 2
  SELECT COUNT(*) INTO total_user2
  FROM public.user_interests
  WHERE user_id = user2_uuid AND privacy_level IN ('public', 'friends');
  
  -- Calcular compatibilidad (Jaccard similarity)
  IF (total_user1 + total_user2 - shared_count) > 0 THEN
    compatibility := shared_count::DECIMAL / (total_user1 + total_user2 - shared_count);
  ELSE
    compatibility := 0;
  END IF;
  
  -- Insertar o actualizar el score
  INSERT INTO public.compatibility_scores (user1_id, user2_id, compatibility_score, shared_interests, total_interests)
  VALUES (user1_uuid, user2_uuid, compatibility, shared_count, total_user1 + total_user2 - shared_count)
  ON CONFLICT (user1_id, user2_id) 
  DO UPDATE SET 
    compatibility_score = compatibility,
    shared_interests = shared_count,
    total_interests = total_user1 + total_user2 - shared_count,
    last_calculated = NOW();
  
  RETURN compatibility;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.claim_world_id_reward(user_id_param uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.clean_expired_cache()
 RETURNS void
 LANGUAGE plpgsql
AS $function$
BEGIN
    DELETE FROM public.profile_cache WHERE expires_at < NOW();
    DELETE FROM public.sessions WHERE expires_at < NOW();
END;
$function$
;

CREATE OR REPLACE FUNCTION public.cleanup_old_couple_data()
 RETURNS void
 LANGUAGE plpgsql
AS $function$
BEGIN
  -- Eliminar interacciones de más de 1 año
  DELETE FROM couple_interactions 
  WHERE created_at < NOW() - INTERVAL '1 year';
  
  -- Eliminar mensajes de más de 6 meses
  DELETE FROM couple_messages 
  WHERE created_at < NOW() - INTERVAL '6 months';
  
  -- Eliminar estadísticas de más de 2 años
  DELETE FROM couple_statistics 
  WHERE date < CURRENT_DATE - INTERVAL '2 years';
  
  -- Eliminar eventos pasados de más de 1 mes
  DELETE FROM couple_events 
  WHERE date < NOW() - INTERVAL '1 month';
END;
$function$
;

CREATE OR REPLACE FUNCTION public.complete_staking(staking_id_param uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
AS $function$
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
$function$
;

create or replace view "public"."couple_profile_stats" as  SELECT cp.id,
    cp.couple_name,
    cp.relationship_type,
    cp.is_verified,
    cp.is_premium,
    cp.created_at,
    count(DISTINCT cpv.id) AS total_views,
    count(DISTINCT cpl.id) AS total_likes,
    count(DISTINCT cpm.id) AS total_matches,
    'Usuario'::text AS partner1_first_name,
    'Anónimo'::text AS partner1_last_name,
    NULL::text AS partner1_age,
    'Usuario'::text AS partner2_first_name,
    'Anónimo'::text AS partner2_last_name,
    NULL::text AS partner2_age
   FROM (((couple_profiles cp
     LEFT JOIN couple_profile_views cpv ON ((cp.id = cpv.couple_profile_id)))
     LEFT JOIN couple_profile_likes cpl ON ((cp.id = cpl.couple_profile_id)))
     LEFT JOIN couple_profile_matches cpm ON (((cp.id = cpm.couple_profile1_id) OR (cp.id = cpm.couple_profile2_id))))
  WHERE (cp.is_verified = true)
  GROUP BY cp.id, cp.couple_name, cp.relationship_type, cp.is_verified, cp.is_premium, cp.created_at;


create or replace view "public"."couple_profiles_with_partners" as  SELECT cp.id,
    cp.couple_name,
    cp.couple_bio,
    cp.relationship_type,
    cp.partner1_id,
    cp.partner2_id,
    cp.couple_images,
    cp.is_verified,
    cp.is_premium,
    cp.created_at,
    cp.updated_at,
    p1.name AS partner1_name,
    p1.age AS partner1_age,
    p1.bio AS partner1_bio,
    p1.gender AS partner1_gender,
    p2.name AS partner2_name,
    p2.age AS partner2_age,
    p2.bio AS partner2_bio,
    p2.gender AS partner2_gender
   FROM ((couple_profiles cp
     JOIN profiles p1 ON ((cp.partner1_id = p1.id)))
     JOIN profiles p2 ON ((cp.partner2_id = p2.id)));


CREATE OR REPLACE FUNCTION public.create_couple_match()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    -- Check if there's a mutual like
    IF EXISTS (
        SELECT 1 FROM couple_profile_likes cpl1
        JOIN couple_profile_likes cpl2 ON cpl1.couple_profile_id = cpl2.liker_profile_id
        WHERE cpl1.liker_profile_id = NEW.couple_profile_id
        AND cpl2.couple_profile_id = NEW.liker_profile_id
    ) THEN
        -- Create match if it doesn't exist
        INSERT INTO couple_profile_matches (couple_profile1_id, couple_profile2_id)
        VALUES (NEW.couple_profile_id, NEW.liker_profile_id)
        ON CONFLICT (couple_profile1_id, couple_profile2_id) DO NOTHING;
    END IF;
    
    RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.create_notification(notification_type text, title text, body text, user_id uuid, data jsonb DEFAULT '{}'::jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.create_post(p_user_id uuid, p_profile_id uuid, p_content text, p_post_type text DEFAULT 'text'::text)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.create_post(p_user_id uuid, p_profile_id uuid, p_content text, p_post_type text DEFAULT 'text'::text, p_image_url text DEFAULT NULL::text, p_video_url text DEFAULT NULL::text, p_location text DEFAULT NULL::text)
 RETURNS TABLE(id uuid, user_id uuid, profile_id uuid, content text, post_type text, image_url text, video_url text, location text, likes_count integer, comments_count integer, shares_count integer, created_at timestamp with time zone, updated_at timestamp with time zone, profile_name text, profile_avatar text, is_verified boolean)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
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
    $function$
;

CREATE OR REPLACE FUNCTION public.create_user_tokens()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
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
$function$
;

create or replace view "public"."current_token_metrics" as  SELECT sum(user_token_balances.cmpx_balance) AS total_cmpx_balance,
    sum(user_token_balances.gtk_balance) AS total_gtk_balance,
    count(DISTINCT user_token_balances.user_id) AS active_users,
    count(DISTINCT
        CASE
            WHEN (user_token_balances.updated_at > (now() - '24:00:00'::interval)) THEN user_token_balances.user_id
            ELSE NULL::uuid
        END) AS active_users_24h
   FROM user_token_balances;


CREATE OR REPLACE FUNCTION public.expire_old_sessions()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    -- Mark sessions as inactive if they've expired
    -- Only if expires_at column exists
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'user_sessions' AND column_name = 'expires_at') THEN
        UPDATE user_sessions 
        SET is_active = FALSE 
        WHERE expires_at < NOW() AND is_active = TRUE;
    END IF;
    
    RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.generate_couple_report(couple_id_param uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
AS $function$
DECLARE
  result JSONB;
  couple_data RECORD;
  stats_data RECORD;
  recent_interactions INTEGER;
  recent_matches INTEGER;
BEGIN
  -- Obtener datos de la pareja
  SELECT * INTO couple_data
  FROM couple_profiles
  WHERE id = couple_id_param;
  
  -- Obtener estadísticas
  SELECT 
    SUM(views) as total_views,
    SUM(likes) as total_likes,
    SUM(matches) as total_matches,
    SUM(messages) as total_messages
  INTO stats_data
  FROM couple_statistics
  WHERE couple_id = couple_id_param;
  
  -- Obtener interacciones recientes
  SELECT COUNT(*) INTO recent_interactions
  FROM couple_interactions
  WHERE couple_id = couple_id_param
  AND created_at >= NOW() - INTERVAL '30 days';
  
  -- Obtener matches recientes
  SELECT COUNT(*) INTO recent_matches
  FROM couple_matches
  WHERE (couple1_id = couple_id_param OR couple2_id = couple_id_param)
  AND created_at >= NOW() - INTERVAL '30 days';
  
  -- Construir resultado
  result := jsonb_build_object(
    'couple_id', couple_id_param,
    'couple_name', couple_data.couple_name,
    'total_views', COALESCE(stats_data.total_views, 0),
    'total_likes', COALESCE(stats_data.total_likes, 0),
    'total_matches', COALESCE(stats_data.total_matches, 0),
    'total_messages', COALESCE(stats_data.total_messages, 0),
    'recent_interactions', recent_interactions,
    'recent_matches', recent_matches,
    'profile_completeness', couple_data.statistics->>'profile_completeness',
    'last_active', couple_data.statistics->>'last_active'
  );
  
  RETURN result;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.generate_referral_code(user_uuid uuid)
 RETURNS text
 LANGUAGE plpgsql
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.get_couple_profile_by_user_id(user_uuid uuid)
 RETURNS TABLE(id uuid, couple_name text, couple_bio text, relationship_type relationship_type, partner1_id uuid, partner2_id uuid, couple_images text[], is_verified boolean, is_premium boolean, created_at timestamp with time zone, updated_at timestamp with time zone, partner1_first_name text, partner1_last_name text, partner1_age integer, partner1_bio text, partner1_gender text, partner2_first_name text, partner2_last_name text, partner2_age integer, partner2_bio text, partner2_gender text)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
    RETURN QUERY
    SELECT cpwp.*
    FROM couple_profiles_with_partners cpwp
    WHERE cpwp.partner1_id IN (SELECT id FROM profiles WHERE user_id = user_uuid)
       OR cpwp.partner2_id IN (SELECT id FROM profiles WHERE user_id = user_uuid);
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_post_comments(post_uuid uuid, page_limit integer DEFAULT 10, page_offset integer DEFAULT 0)
 RETURNS TABLE(id uuid, user_id uuid, profile_id uuid, parent_comment_id uuid, content text, likes_count integer, created_at timestamp with time zone, profile_name text, profile_avatar text, user_liked boolean)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
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
    $function$
;

CREATE OR REPLACE FUNCTION public.get_potential_matches(user_id_param uuid, limit_param integer DEFAULT 10)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.get_user_feed(user_id_param uuid, limit_param integer DEFAULT 20, offset_param integer DEFAULT 0)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.get_user_matches(user_id_param uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.log_security_event(p_user_id uuid, p_event_type text, p_risk_level text DEFAULT 'low'::text, p_details jsonb DEFAULT '{}'::jsonb)
 RETURNS uuid
 LANGUAGE plpgsql
AS $function$
DECLARE
    event_id UUID;
BEGIN
    INSERT INTO public.security (user_id, event_type, risk_level, details)
    VALUES (p_user_id, p_event_type, p_risk_level, p_details)
    RETURNING id INTO event_id;
    
    RETURN event_id;
END;
$function$
;

create or replace view "public"."popular_couple_profiles" as  SELECT cp.id,
    cp.couple_name,
    cp.relationship_type,
    count(DISTINCT cpl.id) AS likes_count,
    count(DISTINCT cpv.id) AS views_count,
    count(DISTINCT cpm.id) AS matches_count,
    ((count(DISTINCT cpl.id) + count(DISTINCT cpv.id)) + count(DISTINCT cpm.id)) AS engagement_score
   FROM (((couple_profiles cp
     LEFT JOIN couple_profile_likes cpl ON ((cp.id = cpl.couple_profile_id)))
     LEFT JOIN couple_profile_views cpv ON ((cp.id = cpv.couple_profile_id)))
     LEFT JOIN couple_profile_matches cpm ON (((cp.id = cpm.couple_profile1_id) OR (cp.id = cpm.couple_profile2_id))))
  WHERE (cp.is_verified = true)
  GROUP BY cp.id, cp.couple_name, cp.relationship_type
  ORDER BY ((count(DISTINCT cpl.id) + count(DISTINCT cpv.id)) + count(DISTINCT cpm.id)) DESC, (count(DISTINCT cpl.id)) DESC;


create or replace view "public"."popular_hashtags" as  SELECT hashtag.hashtag,
    count(*) AS story_count,
    sum(COALESCE(sl.likes_count, (0)::bigint)) AS total_likes,
    sum(COALESCE(sc.comments_count, (0)::bigint)) AS total_comments,
    sum(COALESCE(ss.shares_count, (0)::bigint)) AS total_shares
   FROM (((stories s
     LEFT JOIN ( SELECT story_likes.story_id,
            count(*) AS likes_count
           FROM story_likes
          GROUP BY story_likes.story_id) sl ON ((s.id = sl.story_id)))
     LEFT JOIN ( SELECT story_comments.story_id,
            count(*) AS comments_count
           FROM story_comments
          GROUP BY story_comments.story_id) sc ON ((s.id = sc.story_id)))
     LEFT JOIN ( SELECT story_shares.story_id,
            count(*) AS shares_count
           FROM story_shares
          GROUP BY story_shares.story_id) ss ON ((s.id = ss.story_id))),
    LATERAL unnest(COALESCE(s.hashtags, ARRAY[]::text[])) hashtag(hashtag)
  WHERE ((s.is_public = true) AND (hashtag.hashtag IS NOT NULL) AND (hashtag.hashtag <> ''::text))
  GROUP BY hashtag.hashtag
  ORDER BY (count(*)) DESC, (sum(COALESCE(sl.likes_count, (0)::bigint))) DESC;


CREATE OR REPLACE FUNCTION public.process_referral_reward(referral_code_param text, new_user_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
AS $function$
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
$function$
;

create or replace view "public"."recent_transactions" as  SELECT transactions.user_id,
    transactions.transaction_type,
    transactions.token_type,
    transactions.amount,
    transactions.balance_before,
    transactions.balance_after,
    transactions.description,
    transactions.created_at
   FROM transactions
  WHERE ((auth.uid() = transactions.user_id) AND (transactions.created_at >= (now() - '30 days'::interval)))
  ORDER BY transactions.created_at DESC
 LIMIT 50;


CREATE OR REPLACE FUNCTION public.remove_post_like(p_post_id uuid, p_user_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
    DELETE FROM public.post_likes WHERE post_id = p_post_id AND user_id = p_user_id;
    UPDATE public.posts SET likes_count = likes_count - 1 WHERE id = p_post_id AND likes_count > 0;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.reset_monthly_limits()
 RETURNS void
 LANGUAGE plpgsql
AS $function$
BEGIN
    UPDATE public.user_tokens 
    SET 
        monthly_earned = 0,
        last_reset_date = NOW()
    WHERE last_reset_date < DATE_TRUNC('month', NOW());
END;
$function$
;

create or replace view "public"."security_metrics" as  SELECT count(*) AS total_audit_logs,
    count(
        CASE
            WHEN (security_audit_logs.risk_score > 70) THEN 1
            ELSE NULL::integer
        END) AS high_risk_events,
    count(
        CASE
            WHEN (security_audit_logs.created_at > (now() - '24:00:00'::interval)) THEN 1
            ELSE NULL::integer
        END) AS events_24h,
    count(DISTINCT security_audit_logs.user_id) AS affected_users,
    avg(security_audit_logs.risk_score) AS avg_risk_score
   FROM security_audit_logs;


CREATE OR REPLACE FUNCTION public.set_updated_at_reports()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.set_updated_at_tokens()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$
;

create or replace view "public"."staking_metrics" as  SELECT count(*) AS total_staking_positions,
    sum(staking_records.amount) AS total_staked_amount,
    count(
        CASE
            WHEN ((staking_records.status)::text = 'active'::text) THEN 1
            ELSE NULL::integer
        END) AS active_positions,
    count(
        CASE
            WHEN ((staking_records.status)::text = 'completed'::text) THEN 1
            ELSE NULL::integer
        END) AS completed_positions
   FROM staking_records;


CREATE OR REPLACE FUNCTION public.start_staking(user_id_param uuid, amount_param integer, duration_days integer DEFAULT 30)
 RETURNS jsonb
 LANGUAGE plpgsql
AS $function$
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
$function$
;

create or replace view "public"."story_engagement_metrics" as  SELECT s.id,
    s.description AS content,
    s.content_type AS post_type,
    COALESCE(sl.likes_count, (0)::bigint) AS likes_count,
    COALESCE(sc.comments_count, (0)::bigint) AS comments_count,
    COALESCE(ss.shares_count, (0)::bigint) AS shares_count,
    s.views_count,
    s.created_at,
    'Usuario'::text AS first_name,
    'Anónimo'::text AS last_name,
    'No especificado'::text AS gender,
    ((COALESCE(sl.likes_count, (0)::bigint) + COALESCE(sc.comments_count, (0)::bigint)) + COALESCE(ss.shares_count, (0)::bigint)) AS total_engagement,
        CASE
            WHEN (s.views_count > 0) THEN ((((COALESCE(sl.likes_count, (0)::bigint) + COALESCE(sc.comments_count, (0)::bigint)) + COALESCE(ss.shares_count, (0)::bigint)))::double precision / (s.views_count)::double precision)
            ELSE (0)::double precision
        END AS engagement_rate
   FROM (((stories s
     LEFT JOIN ( SELECT story_likes.story_id,
            count(*) AS likes_count
           FROM story_likes
          GROUP BY story_likes.story_id) sl ON ((s.id = sl.story_id)))
     LEFT JOIN ( SELECT story_comments.story_id,
            count(*) AS comments_count
           FROM story_comments
          GROUP BY story_comments.story_id) sc ON ((s.id = sc.story_id)))
     LEFT JOIN ( SELECT story_shares.story_id,
            count(*) AS shares_count
           FROM story_shares
          GROUP BY story_shares.story_id) ss ON ((s.id = ss.story_id)))
  WHERE (s.is_public = true);


CREATE OR REPLACE FUNCTION public.toggle_post_like(p_post_id uuid, p_user_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
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
$function$
;

create or replace view "public"."two_factor_stats" as  SELECT count(*) AS total_2fa_setups,
    count(
        CASE
            WHEN (two_factor_auth.is_enabled = true) THEN 1
            ELSE NULL::integer
        END) AS active_2fa_users,
    count(
        CASE
            WHEN ((two_factor_auth.method)::text = '2fa_app'::text) THEN 1
            ELSE NULL::integer
        END) AS app_based_2fa,
    count(
        CASE
            WHEN ((two_factor_auth.method)::text = 'sms'::text) THEN 1
            ELSE NULL::integer
        END) AS sms_based_2fa,
    count(
        CASE
            WHEN ((two_factor_auth.method)::text = 'email'::text) THEN 1
            ELSE NULL::integer
        END) AS email_based_2fa
   FROM two_factor_auth;


CREATE OR REPLACE FUNCTION public.update_automation_rules_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_comment_likes_count()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE story_comments SET likes_count = likes_count + 1 WHERE id = NEW.comment_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE story_comments SET likes_count = likes_count - 1 WHERE id = OLD.comment_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_couple_profiles_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_couple_statistics()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  -- Actualizar estadísticas diarias
  INSERT INTO couple_statistics (couple_id, date, views, likes, matches, messages)
  VALUES (
    NEW.couple_id,
    CURRENT_DATE,
    CASE WHEN NEW.interaction_type = 'view' THEN 1 ELSE 0 END,
    CASE WHEN NEW.interaction_type = 'like' THEN 1 ELSE 0 END,
    0,
    0
  )
  ON CONFLICT (couple_id, date) DO UPDATE SET
    views = couple_statistics.views + CASE WHEN NEW.interaction_type = 'view' THEN 1 ELSE 0 END,
    likes = couple_statistics.likes + CASE WHEN NEW.interaction_type = 'like' THEN 1 ELSE 0 END;
  
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_post_comments_count()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
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
    $function$
;

CREATE OR REPLACE FUNCTION public.update_post_likes_count()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
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
    $function$
;

CREATE OR REPLACE FUNCTION public.update_post_shares_count()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
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
    $function$
;

CREATE OR REPLACE FUNCTION public.update_story_comments_count()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE stories SET comments_count = comments_count + 1 WHERE id = NEW.story_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE stories SET comments_count = comments_count - 1 WHERE id = OLD.story_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_story_likes_count()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE stories SET likes_count = likes_count + 1 WHERE id = NEW.story_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE stories SET likes_count = likes_count - 1 WHERE id = OLD.story_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_story_shares_count()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE stories SET shares_count = shares_count + 1 WHERE id = NEW.story_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE stories SET shares_count = shares_count - 1 WHERE id = OLD.story_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_user_token_balance()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    -- Update user_token_balances table based on transaction
    INSERT INTO user_token_balances (user_id, cmpx_balance, gtk_balance, updated_at)
    VALUES (
        NEW.user_id, 
        CASE WHEN NEW.token_type = 'CMPX' AND NEW.transaction_type = 'deposit' THEN NEW.amount ELSE 0 END,
        CASE WHEN NEW.token_type = 'GTK' AND NEW.transaction_type = 'deposit' THEN NEW.amount ELSE 0 END,
        NEW.created_at
    )
    ON CONFLICT (user_id) 
    DO UPDATE SET
        cmpx_balance = CASE 
            WHEN NEW.token_type = 'CMPX' AND NEW.transaction_type = 'deposit' THEN user_token_balances.cmpx_balance + NEW.amount
            WHEN NEW.token_type = 'CMPX' AND NEW.transaction_type = 'withdrawal' THEN user_token_balances.cmpx_balance - NEW.amount
            ELSE user_token_balances.cmpx_balance
        END,
        gtk_balance = CASE 
            WHEN NEW.token_type = 'GTK' AND NEW.transaction_type = 'deposit' THEN user_token_balances.gtk_balance + NEW.amount
            WHEN NEW.token_type = 'GTK' AND NEW.transaction_type = 'withdrawal' THEN user_token_balances.gtk_balance - NEW.amount
            ELSE user_token_balances.gtk_balance
        END,
        updated_at = NEW.created_at;
    
    RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_user_tokens_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_viewed_date()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    NEW.viewed_date = DATE(NEW.viewed_at);
    RETURN NEW;
END;
$function$
;

create or replace view "public"."user_staking_summary" as  SELECT us.user_id,
    sum(us.amount) AS total_staked,
    count(*) AS total_stakes,
    avg(us.reward_percentage) AS avg_reward_percentage,
    count(
        CASE
            WHEN (us.status = 'active'::text) THEN 1
            ELSE NULL::integer
        END) AS active_stakes,
    count(
        CASE
            WHEN (us.status = 'completed'::text) THEN 1
            ELSE NULL::integer
        END) AS completed_stakes
   FROM user_staking us
  WHERE (auth.uid() = us.user_id)
  GROUP BY us.user_id;


create or replace view "public"."user_story_stats" as  SELECT s.user_id,
    'Usuario'::text AS first_name,
    'Anónimo'::text AS last_name,
    count(s.id) AS total_stories,
    sum(COALESCE(sl.likes_count, (0)::bigint)) AS total_likes_received,
    sum(COALESCE(sc.comments_count, (0)::bigint)) AS total_comments_received,
    sum(COALESCE(ss.shares_count, (0)::bigint)) AS total_shares_received,
    avg(COALESCE(sl.likes_count, (0)::bigint)) AS avg_likes_per_story,
    max(s.created_at) AS last_story_date
   FROM (((stories s
     LEFT JOIN ( SELECT story_likes.story_id,
            count(*) AS likes_count
           FROM story_likes
          GROUP BY story_likes.story_id) sl ON ((s.id = sl.story_id)))
     LEFT JOIN ( SELECT story_comments.story_id,
            count(*) AS comments_count
           FROM story_comments
          GROUP BY story_comments.story_id) sc ON ((s.id = sc.story_id)))
     LEFT JOIN ( SELECT story_shares.story_id,
            count(*) AS shares_count
           FROM story_shares
          GROUP BY story_shares.story_id) ss ON ((s.id = ss.story_id)))
  WHERE (s.is_public = true)
  GROUP BY s.user_id;


CREATE OR REPLACE FUNCTION public.validate_token_modification()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    -- Solo permitir modificaciones desde funciones específicas o admins
    IF NOT (
        current_setting('application_name', true) LIKE '%supabase%'
    ) THEN
        RAISE EXCEPTION 'Modificación de tokens no autorizada';
    END IF;
    
    RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$function$
;

create policy "System can insert audit logs"
on "public"."audit_logs"
as permissive
for insert
to public
with check (true);


create policy "Admins can manage automation rules"
on "public"."automation_rules"
as permissive
for all
to public
using ((EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.user_id = auth.uid()) AND (profiles.account_type = 'admin'::text)))));


create policy "Users can read enabled automation rules"
on "public"."automation_rules"
as permissive
for select
to public
using (((enabled = true) AND (auth.uid() IS NOT NULL)));


create policy "blocked_ips_admin_access"
on "public"."blocked_ips"
as permissive
for all
to public
using ((EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.user_id = auth.uid()) AND (profiles.is_admin = true)))));


create policy "Admins pueden ver todas las solicitudes de carrera"
on "public"."career_applications"
as permissive
for select
to public
using ((EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.user_id = auth.uid()) AND (profiles.role = 'admin'::text)))));


create policy "Usuarios pueden crear solicitudes de carrera"
on "public"."career_applications"
as permissive
for insert
to public
with check (true);


create policy "Users can view own chat invitations"
on "public"."chat_invitations"
as permissive
for select
to public
using (((invited_by = auth.uid()) OR (invited_user = auth.uid())));


create policy "Users can view room members"
on "public"."chat_members"
as permissive
for select
to public
using ((profile_id = auth.uid()));


create policy "Users can view accessible rooms"
on "public"."chat_rooms"
as permissive
for select
to public
using (((type = 'public'::text) OR (created_by = auth.uid())));


create policy "Users can create their own comment likes"
on "public"."comment_likes"
as permissive
for insert
to public
with check ((user_id = auth.uid()));


create policy "Users can delete their own comment likes"
on "public"."comment_likes"
as permissive
for delete
to public
using ((user_id = auth.uid()));


create policy "Users can view all comment likes"
on "public"."comment_likes"
as permissive
for select
to public
using (true);


create policy "comment_likes_own_data"
on "public"."comment_likes"
as permissive
for all
to public
using ((user_id = auth.uid()));


create policy "comment_likes_public_read"
on "public"."comment_likes"
as permissive
for select
to public
using (true);


create policy "Los usuarios pueden ver scores donde participan"
on "public"."compatibility_scores"
as permissive
for select
to public
using (((auth.uid() = user1_id) OR (auth.uid() = user2_id)));


create policy "Solo el sistema puede actualizar scores de compatibilidad"
on "public"."compatibility_scores"
as permissive
for update
to public
using (false);


create policy "Solo el sistema puede insertar scores de compatibilidad"
on "public"."compatibility_scores"
as permissive
for insert
to public
with check (false);


create policy "Moderators can manage content moderation"
on "public"."content_moderation"
as permissive
for all
to public
using ((EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.user_id = auth.uid()) AND (profiles.role = ANY (ARRAY['admin'::text, 'moderator'::text]))))));


create policy "Moderators can view content moderation"
on "public"."content_moderation"
as permissive
for select
to public
using ((EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.user_id = auth.uid()) AND (profiles.role = ANY (ARRAY['admin'::text, 'moderator'::text]))))));


create policy "couple_events_own_data"
on "public"."couple_events"
as permissive
for all
to public
using (((couple_id IN ( SELECT couple_profiles.id
   FROM couple_profiles
  WHERE ((couple_profiles.partner1_id = auth.uid()) OR (couple_profiles.partner2_id = auth.uid())))) OR (is_public = true)));


create policy "couple_favorites_own_data"
on "public"."couple_favorites"
as permissive
for all
to public
using ((couple_id IN ( SELECT couple_profiles.id
   FROM couple_profiles
  WHERE ((couple_profiles.partner1_id = auth.uid()) OR (couple_profiles.partner2_id = auth.uid())))));


create policy "couple_gifts_own_data"
on "public"."couple_gifts"
as permissive
for all
to public
using (((sender_couple_id IN ( SELECT couple_profiles.id
   FROM couple_profiles
  WHERE ((couple_profiles.partner1_id = auth.uid()) OR (couple_profiles.partner2_id = auth.uid())))) OR (receiver_couple_id IN ( SELECT couple_profiles.id
   FROM couple_profiles
  WHERE ((couple_profiles.partner1_id = auth.uid()) OR (couple_profiles.partner2_id = auth.uid()))))));


create policy "couple_interactions_own_data"
on "public"."couple_interactions"
as permissive
for all
to public
using (((couple_id IN ( SELECT couple_profiles.id
   FROM couple_profiles
  WHERE ((couple_profiles.partner1_id = auth.uid()) OR (couple_profiles.partner2_id = auth.uid())))) OR (target_couple_id IN ( SELECT couple_profiles.id
   FROM couple_profiles
  WHERE ((couple_profiles.partner1_id = auth.uid()) OR (couple_profiles.partner2_id = auth.uid()))))));


create policy "couple_matches_own_data"
on "public"."couple_matches"
as permissive
for all
to public
using (((couple1_id IN ( SELECT couple_profiles.id
   FROM couple_profiles
  WHERE ((couple_profiles.partner1_id = auth.uid()) OR (couple_profiles.partner2_id = auth.uid())))) OR (couple2_id IN ( SELECT couple_profiles.id
   FROM couple_profiles
  WHERE ((couple_profiles.partner1_id = auth.uid()) OR (couple_profiles.partner2_id = auth.uid()))))));


create policy "couple_messages_own_data"
on "public"."couple_messages"
as permissive
for all
to public
using (((sender_couple_id IN ( SELECT couple_profiles.id
   FROM couple_profiles
  WHERE ((couple_profiles.partner1_id = auth.uid()) OR (couple_profiles.partner2_id = auth.uid())))) OR (receiver_couple_id IN ( SELECT couple_profiles.id
   FROM couple_profiles
  WHERE ((couple_profiles.partner1_id = auth.uid()) OR (couple_profiles.partner2_id = auth.uid()))))));


create policy "couple_profile_likes_own_data"
on "public"."couple_profile_likes"
as permissive
for all
to public
using ((liker_profile_id IN ( SELECT profiles.user_id
   FROM profiles
  WHERE (profiles.user_id = auth.uid()))));


create policy "couple_profile_likes_public_read"
on "public"."couple_profile_likes"
as permissive
for select
to public
using (true);


create policy "couple_profile_matches_own_data"
on "public"."couple_profile_matches"
as permissive
for all
to public
using (((couple_profile1_id IN ( SELECT couple_profiles.id
   FROM couple_profiles
  WHERE ((couple_profiles.partner1_id IN ( SELECT profiles.user_id
           FROM profiles
          WHERE (profiles.user_id = auth.uid()))) OR (couple_profiles.partner2_id IN ( SELECT profiles.user_id
           FROM profiles
          WHERE (profiles.user_id = auth.uid())))))) OR (couple_profile2_id IN ( SELECT couple_profiles.id
   FROM couple_profiles
  WHERE ((couple_profiles.partner1_id IN ( SELECT profiles.user_id
           FROM profiles
          WHERE (profiles.user_id = auth.uid()))) OR (couple_profiles.partner2_id IN ( SELECT profiles.user_id
           FROM profiles
          WHERE (profiles.user_id = auth.uid()))))))));


create policy "couple_profile_matches_public_read"
on "public"."couple_profile_matches"
as permissive
for select
to public
using (true);


create policy "couple_profile_reports_admin_read"
on "public"."couple_profile_reports"
as permissive
for select
to public
using (false);


create policy "couple_profile_reports_own_data"
on "public"."couple_profile_reports"
as permissive
for all
to public
using ((reporter_profile_id IN ( SELECT profiles.user_id
   FROM profiles
  WHERE (profiles.user_id = auth.uid()))));


create policy "couple_profile_views_own_data"
on "public"."couple_profile_views"
as permissive
for all
to public
using ((viewer_profile_id IN ( SELECT profiles.user_id
   FROM profiles
  WHERE (profiles.user_id = auth.uid()))));


create policy "couple_profile_views_public_read"
on "public"."couple_profile_views"
as permissive
for select
to public
using (true);


create policy "couple_profiles_delete_members"
on "public"."couple_profiles"
as permissive
for delete
to public
using ((auth.uid() IN ( SELECT profiles.user_id
   FROM profiles
  WHERE (profiles.id = couple_profiles.partner1_id)
UNION
 SELECT profiles.user_id
   FROM profiles
  WHERE (profiles.id = couple_profiles.partner2_id))));


create policy "couple_profiles_insert_members"
on "public"."couple_profiles"
as permissive
for insert
to public
with check ((auth.uid() IN ( SELECT profiles.user_id
   FROM profiles
  WHERE (profiles.id = couple_profiles.partner1_id)
UNION
 SELECT profiles.user_id
   FROM profiles
  WHERE (profiles.id = couple_profiles.partner2_id))));


create policy "couple_profiles_own_all"
on "public"."couple_profiles"
as permissive
for all
to public
using (((partner1_id IN ( SELECT profiles.user_id
   FROM profiles
  WHERE (profiles.user_id = auth.uid()))) OR (partner2_id IN ( SELECT profiles.user_id
   FROM profiles
  WHERE (profiles.user_id = auth.uid())))));


create policy "couple_profiles_premium_read"
on "public"."couple_profiles"
as permissive
for select
to public
using (((is_premium = true) AND (EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.user_id = auth.uid()) AND (profiles.is_premium = true))))));


create policy "couple_profiles_public_read"
on "public"."couple_profiles"
as permissive
for select
to public
using ((is_verified = true));


create policy "couple_profiles_select_all"
on "public"."couple_profiles"
as permissive
for select
to public
using (true);


create policy "couple_profiles_update_members"
on "public"."couple_profiles"
as permissive
for update
to public
using ((auth.uid() IN ( SELECT profiles.user_id
   FROM profiles
  WHERE (profiles.id = couple_profiles.partner1_id)
UNION
 SELECT profiles.user_id
   FROM profiles
  WHERE (profiles.id = couple_profiles.partner2_id))));


create policy "couple_reports_own_data"
on "public"."couple_reports"
as permissive
for all
to public
using ((reporter_couple_id IN ( SELECT couple_profiles.id
   FROM couple_profiles
  WHERE ((couple_profiles.partner1_id = auth.uid()) OR (couple_profiles.partner2_id = auth.uid())))));


create policy "couple_statistics_own_data"
on "public"."couple_statistics"
as permissive
for all
to public
using ((couple_id IN ( SELECT couple_profiles.id
   FROM couple_profiles
  WHERE ((couple_profiles.partner1_id = auth.uid()) OR (couple_profiles.partner2_id = auth.uid())))));


create policy "couple_verifications_own_data"
on "public"."couple_verifications"
as permissive
for all
to public
using ((couple_id IN ( SELECT couple_profiles.id
   FROM couple_profiles
  WHERE ((couple_profiles.partner1_id = auth.uid()) OR (couple_profiles.partner2_id = auth.uid())))));


create policy "Las preferencias explícitas son públicas para lectura"
on "public"."explicit_preferences"
as permissive
for select
to public
using ((is_active = true));


create policy "FAQ items are public for reading"
on "public"."faq_items"
as permissive
for select
to public
using ((is_active = true));


create policy "follows_own_data"
on "public"."follows"
as permissive
for all
to public
using ((follower_user_id = auth.uid()));


create policy "follows_public_read"
on "public"."follows"
as permissive
for select
to public
using (true);


create policy "fraud_analysis_admin_all"
on "public"."fraud_analysis"
as permissive
for all
to public
using (false);


create policy "fraud_analysis_own_data"
on "public"."fraud_analysis"
as permissive
for select
to public
using ((user_id = auth.uid()));


create policy "Users can view own requests"
on "public"."gallery_access_requests"
as permissive
for select
to public
using (((requester_id = auth.uid()) OR (requested_from = auth.uid())));


create policy "Users can view own permissions"
on "public"."gallery_permissions"
as permissive
for select
to public
using (((granted_by = auth.uid()) OR (granted_to = auth.uid())));


create policy "gallery_permissions_own_data"
on "public"."gallery_permissions"
as permissive
for all
to public
using (((granted_by IN ( SELECT profiles.user_id
   FROM profiles
  WHERE (profiles.user_id = auth.uid()))) OR (granted_to IN ( SELECT profiles.user_id
   FROM profiles
  WHERE (profiles.user_id = auth.uid())))));


create policy "Users can view own image permissions"
on "public"."image_permissions"
as permissive
for select
to public
using (((granted_by = auth.uid()) OR (granted_to = auth.uid())));


create policy "Users can manage own images"
on "public"."images"
as permissive
for all
to public
using ((profile_id = auth.uid()));


create policy "Users can view own images"
on "public"."images"
as permissive
for select
to public
using ((profile_id = auth.uid()));


create policy "invitation_analytics_own_data"
on "public"."invitation_analytics"
as permissive
for all
to public
using ((invitation_id IN ( SELECT invitations.id
   FROM invitations
  WHERE ((invitations.from_profile IN ( SELECT profiles.user_id
           FROM profiles
          WHERE (profiles.user_id = auth.uid()))) OR (invitations.to_profile IN ( SELECT profiles.user_id
           FROM profiles
          WHERE (profiles.user_id = auth.uid())))))));


create policy "invitation_responses_own_data"
on "public"."invitation_responses"
as permissive
for all
to public
using ((invitation_id IN ( SELECT invitations.id
   FROM invitations
  WHERE ((invitations.from_profile IN ( SELECT profiles.user_id
           FROM profiles
          WHERE (profiles.user_id = auth.uid()))) OR (invitations.to_profile IN ( SELECT profiles.user_id
           FROM profiles
          WHERE (profiles.user_id = auth.uid())))))));


create policy "invitation_templates_admin_all"
on "public"."invitation_templates"
as permissive
for all
to public
using (false);


create policy "invitation_templates_public_read"
on "public"."invitation_templates"
as permissive
for select
to public
using ((is_active = true));


create policy "Users can create invitations"
on "public"."invitations"
as permissive
for insert
to public
with check ((from_profile = auth.uid()));


create policy "Users can view own invitations"
on "public"."invitations"
as permissive
for select
to public
using (((from_profile = auth.uid()) OR (to_profile = auth.uid())));


create policy "Users can view own interactions"
on "public"."match_interactions"
as permissive
for select
to public
using ((user_id = auth.uid()));


create policy "Users can view own matches"
on "public"."matches"
as permissive
for select
to public
using (((user1_id = auth.uid()) OR (user2_id = auth.uid())));


create policy "Los usuarios pueden crear logs de acceso"
on "public"."media_access_logs"
as permissive
for insert
to public
with check ((user_id = auth.uid()));


create policy "Los usuarios pueden ver sus propios logs de acceso"
on "public"."media_access_logs"
as permissive
for select
to public
using ((user_id = auth.uid()));


create policy "Users can create messages"
on "public"."messages"
as permissive
for insert
to public
with check ((sender_id = auth.uid()));


create policy "Users can view room messages"
on "public"."messages"
as permissive
for select
to public
using ((sender_id = auth.uid()));


create policy "Admins pueden ver todos los logs de moderación"
on "public"."moderation_logs"
as permissive
for all
to public
using ((EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.user_id = auth.uid()) AND (profiles.role = 'admin'::text)))));


create policy "Moderadores pueden ver sus propios logs"
on "public"."moderation_logs"
as permissive
for select
to public
using ((EXISTS ( SELECT 1
   FROM moderators
  WHERE ((moderators.id = moderation_logs.moderator_id) AND (moderators.user_id = auth.uid())))));


create policy "Admins pueden ver todas las solicitudes de moderador"
on "public"."moderator_requests"
as permissive
for all
to public
using ((EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.user_id = auth.uid()) AND (profiles.role = 'admin'::text)))));


create policy "Usuarios autenticados pueden crear solicitudes de moderador"
on "public"."moderator_requests"
as permissive
for insert
to public
with check (((auth.uid() IS NOT NULL) AND (user_id = auth.uid())));


create policy "Usuarios pueden ver sus propias solicitudes"
on "public"."moderator_requests"
as permissive
for select
to public
using ((user_id = auth.uid()));


create policy "Admins pueden gestionar moderadores"
on "public"."moderators"
as permissive
for all
to public
using ((EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.user_id = auth.uid()) AND (profiles.role = 'admin'::text)))));


create policy "Moderadores pueden ver su propio registro"
on "public"."moderators"
as permissive
for select
to public
using ((user_id = auth.uid()));


create policy "System can insert notification history"
on "public"."notification_history"
as permissive
for insert
to public
with check (true);


create policy "Users can view own notification history"
on "public"."notification_history"
as permissive
for select
to public
using ((auth.uid() = user_id));


create policy "Los usuarios pueden gestionar sus preferencias"
on "public"."notification_preferences"
as permissive
for all
to public
using ((user_id = auth.uid()));


create policy "Users can see their own notifications"
on "public"."notifications"
as permissive
for all
to public
using ((auth.uid() = user_id));


create policy "System can insert rewards"
on "public"."pending_rewards"
as permissive
for insert
to public
with check (true);


create policy "Users can claim own rewards"
on "public"."pending_rewards"
as permissive
for update
to public
using ((auth.uid() = user_id));


create policy "Users can view own pending rewards"
on "public"."pending_rewards"
as permissive
for select
to public
using ((auth.uid() = user_id));


create policy "Users can create comments on public posts"
on "public"."post_comments"
as permissive
for insert
to public
with check (((user_id = auth.uid()) AND (EXISTS ( SELECT 1
   FROM posts
  WHERE ((posts.id = post_comments.post_id) AND ((posts.is_public = true) OR (posts.user_id = auth.uid())))))));


create policy "Users can create their own post comments"
on "public"."post_comments"
as permissive
for insert
to public
with check ((user_id = auth.uid()));


create policy "Users can delete their own comments"
on "public"."post_comments"
as permissive
for delete
to public
using ((user_id = auth.uid()));


create policy "Users can delete their own post comments"
on "public"."post_comments"
as permissive
for delete
to public
using ((user_id = auth.uid()));


create policy "Users can update their own comments"
on "public"."post_comments"
as permissive
for update
to public
using ((user_id = auth.uid()));


create policy "Users can update their own post comments"
on "public"."post_comments"
as permissive
for update
to public
using ((user_id = auth.uid()));


create policy "Users can view all post comments"
on "public"."post_comments"
as permissive
for select
to public
using (true);


create policy "Users can view comments on public posts"
on "public"."post_comments"
as permissive
for select
to public
using ((EXISTS ( SELECT 1
   FROM posts
  WHERE ((posts.id = post_comments.post_id) AND ((posts.is_public = true) OR (posts.user_id = auth.uid()))))));


create policy "Users can create their own post likes"
on "public"."post_likes"
as permissive
for insert
to public
with check ((user_id = auth.uid()));


create policy "Users can delete their own post likes"
on "public"."post_likes"
as permissive
for delete
to public
using ((user_id = auth.uid()));


create policy "Users can view all post likes"
on "public"."post_likes"
as permissive
for select
to public
using (true);


create policy "Users can create their own post shares"
on "public"."post_shares"
as permissive
for insert
to public
with check ((user_id = auth.uid()));


create policy "Users can delete their own post shares"
on "public"."post_shares"
as permissive
for delete
to public
using ((user_id = auth.uid()));


create policy "Users can view all post shares"
on "public"."post_shares"
as permissive
for select
to public
using (true);


create policy "Users can create their own posts"
on "public"."posts"
as permissive
for insert
to public
with check ((user_id = auth.uid()));


create policy "Users can delete their own posts"
on "public"."posts"
as permissive
for delete
to public
using ((user_id = auth.uid()));


create policy "Users can update their own posts"
on "public"."posts"
as permissive
for update
to public
using ((user_id = auth.uid()));


create policy "Users can view public posts"
on "public"."posts"
as permissive
for select
to public
using (((is_public = true) OR (user_id = auth.uid())));


create policy "Users can access own profile cache"
on "public"."profile_cache"
as permissive
for all
to public
using ((EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = profile_cache.profile_id) AND (profiles.user_id = auth.uid())))));


create policy "Usuarios pueden actualizar su propio perfil"
on "public"."profiles"
as permissive
for update
to public
using ((auth.uid() = user_id));


create policy "Usuarios pueden insertar su propio perfil"
on "public"."profiles"
as permissive
for insert
to public
with check ((auth.uid() = user_id));


create policy "Usuarios pueden ver perfiles públicos"
on "public"."profiles"
as permissive
for select
to public
using ((NOT is_blocked));


create policy "Los usuarios pueden reclamar sus recompensas"
on "public"."referral_rewards"
as permissive
for update
to public
using ((user_id = auth.uid()));


create policy "Los usuarios pueden ver sus recompensas"
on "public"."referral_rewards"
as permissive
for select
to public
using ((user_id = auth.uid()));


create policy "Sistema puede crear recompensas"
on "public"."referral_rewards"
as permissive
for insert
to public
with check (true);


create policy "referral_statistics_admin_read"
on "public"."referral_statistics"
as permissive
for select
to public
using (false);


create policy "referral_transactions_own_data"
on "public"."referral_transactions"
as permissive
for all
to public
using ((user_id = auth.uid()));


create policy "Authenticated users can update reports"
on "public"."reports"
as permissive
for update
to public
using ((auth.uid() IS NOT NULL));


create policy "Users can create reports"
on "public"."reports"
as permissive
for insert
to public
with check ((auth.uid() = reporter_user_id));


create policy "Users can view their own reports"
on "public"."reports"
as permissive
for select
to public
using ((auth.uid() = reporter_user_id));


create policy "Admins can manage roles"
on "public"."roles"
as permissive
for all
to public
using ((EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.user_id = auth.uid()) AND (profiles.role = 'admin'::text)))));


create policy "Users can read active roles"
on "public"."roles"
as permissive
for select
to public
using (((is_active = true) AND (auth.uid() IS NOT NULL)));


create policy "Admins can view security logs"
on "public"."security"
as permissive
for select
to public
using ((EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.user_id = auth.uid()) AND (profiles.role = 'admin'::text)))));


create policy "security_alerts_admin_access"
on "public"."security_alerts"
as permissive
for all
to public
using ((EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.user_id = auth.uid()) AND (profiles.is_admin = true)))));


create policy "security_audit_logs_admin_all"
on "public"."security_audit_logs"
as permissive
for all
to public
using (false);


create policy "security_audit_logs_own_data"
on "public"."security_audit_logs"
as permissive
for select
to public
using ((user_id = auth.uid()));


create policy "security_configurations_admin_access"
on "public"."security_configurations"
as permissive
for all
to public
using ((EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.user_id = auth.uid()) AND (profiles.is_admin = true)))));


create policy "security_events_admin_access"
on "public"."security_events"
as permissive
for all
to public
using ((EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.user_id = auth.uid()) AND (profiles.is_admin = true)))));


create policy "security_events_own_data"
on "public"."security_events"
as permissive
for select
to public
using ((user_id = auth.uid()));


create policy "security_flags_admin_all"
on "public"."security_flags"
as permissive
for all
to public
using (false);


create policy "security_flags_own_data"
on "public"."security_flags"
as permissive
for select
to public
using ((user_id = auth.uid()));


create policy "Users can update own sessions"
on "public"."sessions"
as permissive
for update
to public
using ((user_id = auth.uid()));


create policy "Users can view own sessions"
on "public"."sessions"
as permissive
for select
to public
using ((user_id = auth.uid()));


create policy "staking_records_own_data"
on "public"."staking_records"
as permissive
for all
to public
using ((user_id = auth.uid()));


create policy "stories_own_all"
on "public"."stories"
as permissive
for all
to public
using ((user_id = auth.uid()));


create policy "stories_public_read"
on "public"."stories"
as permissive
for select
to public
using ((is_public = true));


create policy "story_comments_own_all"
on "public"."story_comments"
as permissive
for all
to public
using ((user_id = auth.uid()));


create policy "story_comments_public_read"
on "public"."story_comments"
as permissive
for select
to public
using ((is_deleted = false));


create policy "story_likes_own_data"
on "public"."story_likes"
as permissive
for all
to public
using ((user_id = auth.uid()));


create policy "story_likes_public_read"
on "public"."story_likes"
as permissive
for select
to public
using (true);


create policy "story_reports_admin_read"
on "public"."story_reports"
as permissive
for select
to public
using ((EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.user_id = auth.uid()) AND (profiles.role = ANY (ARRAY['admin'::text, 'moderator'::text]))))));


create policy "story_reports_own_data"
on "public"."story_reports"
as permissive
for all
to public
using ((reporter_user_id = auth.uid()));


create policy "story_shares_own_data"
on "public"."story_shares"
as permissive
for all
to public
using ((user_id = auth.uid()));


create policy "story_shares_public_read"
on "public"."story_shares"
as permissive
for select
to public
using (true);


create policy "Users can see their own subscription"
on "public"."subscribers"
as permissive
for all
to public
using ((auth.uid() = user_id));


create policy "Los intereses son públicos para lectura"
on "public"."swinger_interests"
as permissive
for select
to public
using ((is_active = true));


create policy "System can insert metrics"
on "public"."system_metrics"
as permissive
for insert
to public
with check (true);


create policy "threat_detections_admin_access"
on "public"."threat_detections"
as permissive
for all
to public
using ((EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.user_id = auth.uid()) AND (profiles.is_admin = true)))));


create policy "System can insert analytics"
on "public"."token_analytics"
as permissive
for insert
to public
with check (true);


create policy "token_analytics_admin_only"
on "public"."token_analytics"
as permissive
for all
to public
using ((EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.user_id = auth.uid()) AND (profiles.role = 'admin'::text)))));


create policy "token_transactions_own_data"
on "public"."token_transactions"
as permissive
for all
to public
using ((user_id = auth.uid()));


create policy "Users can view active tokens"
on "public"."tokens"
as permissive
for select
to public
using ((is_active = true));


create policy "System can insert transactions"
on "public"."transactions"
as permissive
for insert
to public
with check (true);


create policy "Users can view own transactions"
on "public"."transactions"
as permissive
for select
to public
using ((auth.uid() = user_id));


create policy "two_factor_auth_own_data"
on "public"."two_factor_auth"
as permissive
for all
to public
using ((user_id = auth.uid()));


create policy "Users can manage own 2FA settings"
on "public"."user_2fa_settings"
as permissive
for all
to public
using ((auth.uid() = user_id));


create policy "Users can manage own device tokens"
on "public"."user_device_tokens"
as permissive
for all
to public
using ((auth.uid() = user_id));


create policy "Los usuarios pueden actualizar sus propias preferencias explíc"
on "public"."user_explicit_preferences"
as permissive
for update
to public
using ((auth.uid() = user_id));


create policy "Los usuarios pueden eliminar sus propias preferencias explícit"
on "public"."user_explicit_preferences"
as permissive
for delete
to public
using ((auth.uid() = user_id));


create policy "Los usuarios pueden insertar sus propias preferencias explícit"
on "public"."user_explicit_preferences"
as permissive
for insert
to public
with check ((auth.uid() = user_id));


create policy "Los usuarios pueden ver preferencias explícitas públicas veri"
on "public"."user_explicit_preferences"
as permissive
for select
to public
using ((((privacy_level)::text = 'public'::text) AND (is_verified = true)));


create policy "Los usuarios pueden ver sus propias preferencias explícitas"
on "public"."user_explicit_preferences"
as permissive
for all
to public
using ((auth.uid() = user_id));


create policy "Los usuarios pueden actualizar sus propios intereses"
on "public"."user_interests"
as permissive
for update
to public
using ((auth.uid() = user_id));


create policy "Los usuarios pueden eliminar sus propios intereses"
on "public"."user_interests"
as permissive
for delete
to public
using ((auth.uid() = user_id));


create policy "Los usuarios pueden insertar sus propios intereses"
on "public"."user_interests"
as permissive
for insert
to public
with check ((auth.uid() = user_id));


create policy "Los usuarios pueden ver intereses públicos de otros"
on "public"."user_interests"
as permissive
for select
to public
using (((privacy_level)::text = 'public'::text));


create policy "Los usuarios pueden ver sus propios intereses"
on "public"."user_interests"
as permissive
for all
to public
using ((auth.uid() = user_id));


create policy "Users can manage own likes"
on "public"."user_likes"
as permissive
for all
to public
using ((user_id = auth.uid()));


create policy "Users can view own likes"
on "public"."user_likes"
as permissive
for select
to public
using (((user_id = auth.uid()) OR (liked_user_id = auth.uid())));


create policy "Users can manage own notification preferences"
on "public"."user_notification_preferences"
as permissive
for all
to public
using ((auth.uid() = user_id));


create policy "user_referral_balances_admin_read"
on "public"."user_referral_balances"
as permissive
for all
to public;


create policy "user_referral_balances_own_data"
on "public"."user_referral_balances"
as permissive
for all
to public
using ((user_id = auth.uid()));


create policy "Users can view own roles"
on "public"."user_roles"
as permissive
for select
to public
using ((user_id = auth.uid()));


create policy "user_sessions_own_data"
on "public"."user_sessions"
as permissive
for all
to public
using ((user_id = auth.uid()));


create policy "System can insert staking"
on "public"."user_staking"
as permissive
for insert
to public
with check (true);


create policy "System can manage staking"
on "public"."user_staking"
as permissive
for all
to public
with check (true);


create policy "Users can update own staking"
on "public"."user_staking"
as permissive
for update
to public
using ((auth.uid() = user_id));


create policy "Users can view own staking"
on "public"."user_staking"
as permissive
for select
to public
using ((auth.uid() = user_id));


create policy "user_token_balances_own_data"
on "public"."user_token_balances"
as permissive
for all
to public
using ((user_id = auth.uid()));


create policy "Users can update own tokens"
on "public"."user_tokens"
as permissive
for update
to public
using ((auth.uid() = user_id));


create policy "Users can view own tokens"
on "public"."user_tokens"
as permissive
for select
to public
using ((auth.uid() = user_id));


CREATE TRIGGER automation_rules_updated_at BEFORE UPDATE ON public.automation_rules FOR EACH ROW EXECUTE FUNCTION update_automation_rules_updated_at();

CREATE TRIGGER update_career_applications_updated_at BEFORE UPDATE ON public.career_applications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_chat_messages_updated_at BEFORE UPDATE ON public.chat_messages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_comment_likes_count AFTER INSERT OR DELETE ON public.comment_likes FOR EACH ROW EXECUTE FUNCTION update_comment_likes_count();

CREATE TRIGGER update_comment_likes_count_trigger AFTER INSERT OR DELETE ON public.comment_likes FOR EACH ROW EXECUTE FUNCTION update_comment_likes_count();

CREATE TRIGGER update_couple_statistics_trigger AFTER INSERT ON public.couple_interactions FOR EACH ROW EXECUTE FUNCTION update_couple_statistics();

CREATE TRIGGER create_couple_match_trigger AFTER INSERT ON public.couple_profile_likes FOR EACH ROW EXECUTE FUNCTION create_couple_match();

CREATE TRIGGER update_couple_profile_reports_updated_at BEFORE UPDATE ON public.couple_profile_reports FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_couple_profile_views_viewed_date BEFORE INSERT OR UPDATE ON public.couple_profile_views FOR EACH ROW EXECUTE FUNCTION update_viewed_date();

CREATE TRIGGER couple_profiles_updated_at BEFORE UPDATE ON public.couple_profiles FOR EACH ROW EXECUTE FUNCTION update_couple_profiles_updated_at();

CREATE TRIGGER update_explicit_preferences_updated_at BEFORE UPDATE ON public.explicit_preferences FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_gallery_permissions_updated_at BEFORE UPDATE ON public.gallery_permissions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invitation_templates_updated_at BEFORE UPDATE ON public.invitation_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_moderator_requests_updated_at BEFORE UPDATE ON public.moderator_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notification_preferences_updated_at BEFORE UPDATE ON public.notification_preferences FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_post_comments_count AFTER INSERT OR DELETE ON public.post_comments FOR EACH ROW EXECUTE FUNCTION update_post_comments_count();

CREATE TRIGGER trigger_update_post_likes_count AFTER INSERT OR DELETE ON public.post_likes FOR EACH ROW EXECUTE FUNCTION update_post_likes_count();

CREATE TRIGGER trigger_update_post_shares_count AFTER INSERT OR DELETE ON public.post_shares FOR EACH ROW EXECUTE FUNCTION update_post_shares_count();

CREATE TRIGGER update_referral_statistics_updated_at BEFORE UPDATE ON public.referral_statistics FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_set_updated_at_reports BEFORE UPDATE ON public.reports FOR EACH ROW EXECUTE FUNCTION set_updated_at_reports();

CREATE TRIGGER update_reports_updated_at BEFORE UPDATE ON public.reports FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_staking_records_updated_at BEFORE UPDATE ON public.staking_records FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_stories_updated_at BEFORE UPDATE ON public.stories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_story_comments_count_trigger AFTER INSERT OR DELETE ON public.story_comments FOR EACH ROW EXECUTE FUNCTION update_story_comments_count();

CREATE TRIGGER update_story_comments_updated_at BEFORE UPDATE ON public.story_comments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_story_likes_count_trigger AFTER INSERT OR DELETE ON public.story_likes FOR EACH ROW EXECUTE FUNCTION update_story_likes_count();

CREATE TRIGGER update_story_reports_updated_at BEFORE UPDATE ON public.story_reports FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_story_shares_count_trigger AFTER INSERT OR DELETE ON public.story_shares FOR EACH ROW EXECUTE FUNCTION update_story_shares_count();

CREATE TRIGGER update_subscribers_updated_at BEFORE UPDATE ON public.subscribers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_swinger_interests_updated_at BEFORE UPDATE ON public.swinger_interests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_token_analytics_updated_at BEFORE UPDATE ON public.token_analytics FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_balance_after_transaction AFTER INSERT ON public.token_transactions FOR EACH ROW EXECUTE FUNCTION update_user_token_balance();

CREATE TRIGGER trg_set_updated_at_tokens BEFORE UPDATE ON public.tokens FOR EACH ROW EXECUTE FUNCTION set_updated_at_tokens();

CREATE TRIGGER audit_large_transactions AFTER INSERT ON public.transactions FOR EACH ROW EXECUTE FUNCTION audit_suspicious_transactions();

CREATE TRIGGER update_two_factor_auth_updated_at BEFORE UPDATE ON public.two_factor_auth FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_2fa_settings_updated_at BEFORE UPDATE ON public.user_2fa_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notification_preferences_updated_at BEFORE UPDATE ON public.user_notification_preferences FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_referral_balances_updated_at BEFORE UPDATE ON public.user_referral_balances FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER expire_old_sessions_trigger AFTER INSERT ON public.user_sessions FOR EACH ROW EXECUTE FUNCTION expire_old_sessions();

CREATE TRIGGER update_user_token_balances_updated_at BEFORE UPDATE ON public.user_token_balances FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


