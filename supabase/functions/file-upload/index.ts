import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Get user from JWT token
    const jwt = authHeader.replace('Bearer ', '')
    const { data: userData, error: userError } = await supabase.auth.getUser(jwt)
    
    if (userError || !userData.user) {
      return new Response(
        JSON.stringify({ error: 'Invalid or expired token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const userId = userData.user.id

    const formData = await req.formData()
    const file = formData.get('file') as File
    const folderId = formData.get('folder_id') as string || null
    
    if (!file) {
      return new Response(
        JSON.stringify({ error: 'No file provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop() || ''
    const fileName = `${crypto.randomUUID()}.${fileExt}`
    const storagePath = `${userId}/${fileName}`
    
    // Determine file type
    let fileType = 'other'
    if (file.type.startsWith('image/')) fileType = 'image'
    else if (file.type.startsWith('video/')) fileType = 'video'
    else if (file.type.includes('pdf')) fileType = 'pdf'
    else if (file.type.includes('excel') || file.type.includes('spreadsheet')) fileType = 'excel'
    else if (file.type.includes('word') || file.type.includes('document')) fileType = 'document'
    
    // Upload to storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('user-files')
      .upload(storagePath, file)

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return new Response(
        JSON.stringify({ error: 'Upload failed' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get public URL (for signed URLs later)
    const { data: { publicUrl } } = supabase.storage
      .from('user-files')
      .getPublicUrl(storagePath)

    // Save file record to database
    const { data: fileRecord, error: dbError } = await supabase
      .from('files')
      .insert({
        user_id: userId,
        folder_id: folderId,
        name: fileName,
        original_name: file.name,
        file_type: fileType,
        file_size: file.size,
        mime_type: file.type,
        storage_path: storagePath,
        public_url: publicUrl
      })
      .select()
      .single()

    if (dbError) {
      console.error('Database error:', dbError)
      // Clean up uploaded file if database save fails
      await supabase.storage.from('user-files').remove([storagePath])
      
      return new Response(
        JSON.stringify({ error: 'Failed to save file record' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        file: fileRecord
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})