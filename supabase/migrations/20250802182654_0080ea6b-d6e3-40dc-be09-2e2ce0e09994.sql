-- Create function to increment widget usage and user credits (only function)
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