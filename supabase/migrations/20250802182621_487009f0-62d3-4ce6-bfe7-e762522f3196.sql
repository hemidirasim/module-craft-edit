-- Create profiles table for user information
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user credits table for usage tracking
CREATE TABLE public.user_credits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  total_credits INTEGER NOT NULL DEFAULT 100,
  used_credits INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create workspaces table for user projects
CREATE TABLE public.workspaces (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  domain TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT unique_domain UNIQUE (domain)
);

-- Create editor widgets table
CREATE TABLE public.editor_widgets (
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
CREATE TABLE public.widget_usage (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  widget_id UUID NOT NULL REFERENCES public.editor_widgets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
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
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for user credits
CREATE POLICY "Users can view their own credits" ON public.user_credits
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own credits" ON public.user_credits
  FOR UPDATE USING (auth.uid() = user_id);

-- Create RLS policies for workspaces
CREATE POLICY "Users can view their own workspaces" ON public.workspaces
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own workspaces" ON public.workspaces
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own workspaces" ON public.workspaces
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own workspaces" ON public.workspaces
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for editor widgets
CREATE POLICY "Users can view widgets in their workspaces" ON public.editor_widgets
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.workspaces 
      WHERE workspaces.id = editor_widgets.workspace_id 
      AND workspaces.user_id = auth.uid()
    )
  );
CREATE POLICY "Users can create widgets in their workspaces" ON public.editor_widgets
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.workspaces 
      WHERE workspaces.id = editor_widgets.workspace_id 
      AND workspaces.user_id = auth.uid()
    )
  );
CREATE POLICY "Users can update widgets in their workspaces" ON public.editor_widgets
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.workspaces 
      WHERE workspaces.id = editor_widgets.workspace_id 
      AND workspaces.user_id = auth.uid()
    )
  );
CREATE POLICY "Users can delete widgets in their workspaces" ON public.editor_widgets
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.workspaces 
      WHERE workspaces.id = editor_widgets.workspace_id 
      AND workspaces.user_id = auth.uid()
    )
  );

-- Create RLS policies for widget usage (read-only for workspace owners)
CREATE POLICY "Users can view usage for their widgets" ON public.widget_usage
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.editor_widgets 
      JOIN public.workspaces ON workspaces.id = editor_widgets.workspace_id
      WHERE editor_widgets.id = widget_usage.widget_id 
      AND workspaces.user_id = auth.uid()
    )
  );

-- Create triggers for updated_at columns
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_credits_updated_at
  BEFORE UPDATE ON public.user_credits
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_workspaces_updated_at
  BEFORE UPDATE ON public.workspaces
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_editor_widgets_updated_at
  BEFORE UPDATE ON public.editor_widgets
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger for workspace domain validation
CREATE TRIGGER validate_workspace_domain_trigger
  BEFORE INSERT OR UPDATE ON public.workspaces
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_workspace_domain();

-- Create trigger for new user setup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Create indexes for performance
CREATE INDEX idx_workspaces_user_id ON public.workspaces(user_id);
CREATE INDEX idx_editor_widgets_workspace_id ON public.editor_widgets(workspace_id);
CREATE INDEX idx_widget_usage_widget_id ON public.widget_usage(widget_id);
CREATE INDEX idx_widget_usage_created_at ON public.widget_usage(created_at);
CREATE INDEX idx_editor_widgets_is_active ON public.editor_widgets(is_active);

-- Create function to increment widget usage and user credits
CREATE OR REPLACE FUNCTION public.increment_widget_usage(
  _widget_id UUID,
  _domain TEXT,
  _page_url TEXT DEFAULT NULL,
  _user_agent TEXT DEFAULT NULL,
  _ip_address INET DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  _user_id UUID;
  _current_credits INTEGER;
  _used_credits INTEGER;
BEGIN
  -- Get widget owner's user_id and check if widget is active
  SELECT w.user_id INTO _user_id
  FROM public.editor_widgets ew
  JOIN public.workspaces w ON w.id = ew.workspace_id
  WHERE ew.id = _widget_id AND ew.is_active = true;
  
  IF _user_id IS NULL THEN
    RETURN FALSE; -- Widget not found or inactive
  END IF;
  
  -- Check user's credit limits
  SELECT total_credits, used_credits INTO _current_credits, _used_credits
  FROM public.user_credits
  WHERE user_id = _user_id;
  
  IF _used_credits >= _current_credits THEN
    RETURN FALSE; -- Credit limit exceeded
  END IF;
  
  -- Log widget usage
  INSERT INTO public.widget_usage (widget_id, user_id, domain, page_url, user_agent, ip_address)
  VALUES (_widget_id, _user_id, _domain, _page_url, _user_agent, _ip_address);
  
  -- Increment widget usage count
  UPDATE public.editor_widgets
  SET usage_count = usage_count + 1
  WHERE id = _widget_id;
  
  -- Increment user's used credits
  UPDATE public.user_credits
  SET used_credits = used_credits + 1
  WHERE user_id = _user_id;
  
  RETURN TRUE;
END;
$$;