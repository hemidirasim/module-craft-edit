-- Create profiles table for user information
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user credits table for usage tracking
CREATE TABLE IF NOT EXISTS public.user_credits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  total_credits INTEGER NOT NULL DEFAULT 100,
  used_credits INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create workspaces table for user projects
CREATE TABLE IF NOT EXISTS public.workspaces (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  domain TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT unique_domain UNIQUE (domain)
);

-- Create editor widgets table
CREATE TABLE IF NOT EXISTS public.editor_widgets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  configuration JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  embed_code TEXT,
  usage_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create widget usage tracking table
CREATE TABLE IF NOT EXISTS public.widget_usage (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  widget_id UUID NOT NULL REFERENCES public.editor_widgets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  domain TEXT NOT NULL,
  page_url TEXT,
  user_agent TEXT,
  ip_address INET,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.editor_widgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.widget_usage ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for user credits
DROP POLICY IF EXISTS "Users can view their own credits" ON public.user_credits;
CREATE POLICY "Users can view their own credits" ON public.user_credits
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own credits" ON public.user_credits;
CREATE POLICY "Users can update their own credits" ON public.user_credits
  FOR UPDATE USING (auth.uid() = user_id);

-- Create RLS policies for workspaces
DROP POLICY IF EXISTS "Users can view their own workspaces" ON public.workspaces;
CREATE POLICY "Users can view their own workspaces" ON public.workspaces
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own workspaces" ON public.workspaces;
CREATE POLICY "Users can create their own workspaces" ON public.workspaces
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own workspaces" ON public.workspaces;
CREATE POLICY "Users can update their own workspaces" ON public.workspaces
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own workspaces" ON public.workspaces;
CREATE POLICY "Users can delete their own workspaces" ON public.workspaces
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for editor widgets
DROP POLICY IF EXISTS "Users can view widgets in their workspaces" ON public.editor_widgets;
CREATE POLICY "Users can view widgets in their workspaces" ON public.editor_widgets
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.workspaces 
      WHERE workspaces.id = editor_widgets.workspace_id 
      AND workspaces.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can create widgets in their workspaces" ON public.editor_widgets;
CREATE POLICY "Users can create widgets in their workspaces" ON public.editor_widgets
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.workspaces 
      WHERE workspaces.id = editor_widgets.workspace_id 
      AND workspaces.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can update widgets in their workspaces" ON public.editor_widgets;
CREATE POLICY "Users can update widgets in their workspaces" ON public.editor_widgets
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.workspaces 
      WHERE workspaces.id = editor_widgets.workspace_id 
      AND workspaces.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can delete widgets in their workspaces" ON public.editor_widgets;
CREATE POLICY "Users can delete widgets in their workspaces" ON public.editor_widgets
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.workspaces 
      WHERE workspaces.id = editor_widgets.workspace_id 
      AND workspaces.user_id = auth.uid()
    )
  );

-- Create RLS policies for widget usage
DROP POLICY IF EXISTS "Users can view usage for their widgets" ON public.widget_usage;
CREATE POLICY "Users can view usage for their widgets" ON public.widget_usage
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.editor_widgets 
      JOIN public.workspaces ON workspaces.id = editor_widgets.workspace_id
      WHERE editor_widgets.id = widget_usage.widget_id 
      AND workspaces.user_id = auth.uid()
    )
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_workspaces_user_id ON public.workspaces(user_id);
CREATE INDEX IF NOT EXISTS idx_editor_widgets_workspace_id ON public.editor_widgets(workspace_id);
CREATE INDEX IF NOT EXISTS idx_widget_usage_widget_id ON public.widget_usage(widget_id);
CREATE INDEX IF NOT EXISTS idx_widget_usage_created_at ON public.widget_usage(created_at);
CREATE INDEX IF NOT EXISTS idx_editor_widgets_is_active ON public.editor_widgets(is_active);