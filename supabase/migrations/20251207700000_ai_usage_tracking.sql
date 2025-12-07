-- AI Usage Tracking Table
-- Tracks daily token usage and request counts for rate limiting

-- Create ai_usage table
CREATE TABLE IF NOT EXISTS public.ai_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  tokens_used INTEGER NOT NULL DEFAULT 0,
  request_count INTEGER NOT NULL DEFAULT 0,
  last_request_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Ensure one record per user per day
  UNIQUE(user_id, date),

  -- Check constraints
  CONSTRAINT tokens_used_positive CHECK (tokens_used >= 0),
  CONSTRAINT request_count_positive CHECK (request_count >= 0)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_ai_usage_user_date ON public.ai_usage(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_ai_usage_date ON public.ai_usage(date DESC);

-- Enable Row Level Security
ALTER TABLE public.ai_usage ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can only view their own usage
CREATE POLICY "Users can view their own AI usage"
  ON public.ai_usage
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own usage records
CREATE POLICY "Users can insert their own AI usage"
  ON public.ai_usage
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own usage records
CREATE POLICY "Users can update their own AI usage"
  ON public.ai_usage
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Admins can view all usage (for analytics)
CREATE POLICY "Admins can view all AI usage"
  ON public.ai_usage
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Add comment
COMMENT ON TABLE public.ai_usage IS 'Tracks AI token usage and request counts for rate limiting';
COMMENT ON COLUMN public.ai_usage.user_id IS 'Reference to the user';
COMMENT ON COLUMN public.ai_usage.date IS 'Date of usage (YYYY-MM-DD)';
COMMENT ON COLUMN public.ai_usage.tokens_used IS 'Total tokens used on this date';
COMMENT ON COLUMN public.ai_usage.request_count IS 'Total requests made on this date';
COMMENT ON COLUMN public.ai_usage.last_request_at IS 'Timestamp of last request';

-- Function to automatically clean up old usage records (optional)
-- Keep only last 90 days of data
CREATE OR REPLACE FUNCTION public.cleanup_old_ai_usage()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM public.ai_usage
  WHERE date < CURRENT_DATE - INTERVAL '90 days';
END;
$$;

-- Create a scheduled job to run cleanup weekly (requires pg_cron extension)
-- Note: This is commented out as it requires pg_cron to be enabled
-- SELECT cron.schedule('cleanup-ai-usage', '0 0 * * 0', 'SELECT public.cleanup_old_ai_usage()');
