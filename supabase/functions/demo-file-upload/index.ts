import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    if (req.method !== 'POST') {
      return new Response('Method not allowed', { 
        status: 405, 
        headers: corsHeaders 
      })
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    const formData = await req.formData()
    const file = formData.get('file') as File
    const sessionId = formData.get('session_id') as string

    if (!file) {
      return new Response(JSON.stringify({ error: 'No file provided' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    if (!sessionId) {
      return new Response(JSON.stringify({ error: 'No session ID provided' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    console.log('Processing demo file upload:', {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      sessionId: sessionId
    })

    // Determine file type
    const getFileType = (mimeType: string): string => {
      if (mimeType.startsWith('image/')) return 'image'
      if (mimeType.startsWith('video/')) return 'video'
      if (mimeType === 'application/pdf') return 'pdf'
      if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) return 'excel'
      if (mimeType.includes('document') || mimeType.includes('word')) return 'document'
      return 'other'
    }

    const fileType = getFileType(file.type)
    const timestamp = Date.now()
    const fileExtension = file.name.split('.').pop() || ''
    const fileName = `demo_${sessionId}_${timestamp}.${fileExtension}`
    const storagePath = `demo/${fileName}`

    // Convert File to ArrayBuffer then to Uint8Array
    const arrayBuffer = await file.arrayBuffer()
    const fileBuffer = new Uint8Array(arrayBuffer)

    // Upload to public bucket (editor-media)
    console.log('Uploading to storage:', storagePath)
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('editor-media')
      .upload(storagePath, fileBuffer, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false
      })

    if (uploadError) {
      console.error('Storage upload error:', uploadError)
      return new Response(JSON.stringify({ 
        error: 'Failed to upload file to storage',
        details: uploadError.message 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    console.log('Storage upload successful:', uploadData)

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from('editor-media')
      .getPublicUrl(storagePath)
    
    const publicUrl = publicUrlData.publicUrl

    console.log('Public URL generated:', publicUrl)

    // Add file record to database using the RPC function
    const { data: dbData, error: dbError } = await supabase.rpc('add_demo_file', {
      p_session_id: sessionId,
      p_file_name: file.name,
      p_file_type: fileType,
      p_file_size: file.size,
      p_public_url: publicUrl,
      p_storage_path: storagePath
    })

    if (dbError) {
      console.error('Database insert error:', dbError)
      
      // Try to cleanup the uploaded file if database insert fails
      try {
        await supabase.storage
          .from('editor-media')
          .remove([storagePath])
      } catch (cleanupError) {
        console.error('Failed to cleanup file after database error:', cleanupError)
      }

      return new Response(JSON.stringify({ 
        error: 'Failed to save file record',
        details: dbError.message 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    console.log('File record saved successfully:', dbData)

    const response = {
      success: true,
      file: {
        id: dbData,
        name: file.name,
        size: file.size,
        type: fileType,
        url: publicUrl,
        storage_path: storagePath
      }
    }

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})