import { SupabaseClient } from "@supabase/supabase-js"

export async function uploadImage(file: File, supabase: SupabaseClient) {
  const { data, error } = await supabase.storage
    .from('climbing_walls') // Bucket name
    .upload(`public/${file.name}`, file, {
      cacheControl: '3600',
      upsert: false
    })

  if (error) {
    console.error('Error uploading:', error.message)
  } else {
    console.log('Success:', data)
  }
}