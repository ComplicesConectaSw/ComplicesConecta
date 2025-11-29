CREATE INDEX security_logs_event_idx ON public.security_logs (event);
CREATE INDEX security_logs_created_at_idx ON public.security_logs (created_at DESC);