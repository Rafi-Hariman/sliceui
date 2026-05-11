import { supabase } from "@/integrations/supabase/client"

const BUCKET_NAME = "sliceui-images"

export async function uploadSliceImage(
  file: File,
  userId: string
): Promise<{ url: string; path: string }> {
  const fileExt = file.name.split(".").pop()
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
  const filePath = `${userId}/${fileName}`

  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: false
    })

  if (error) {
    throw new Error(`Failed to upload image: ${error.message}`)
  }

  const { data: urlData } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(data.path)

  return { url: urlData.publicUrl, path: data.path }
}

export async function deleteSliceImage(imagePath: string): Promise<void> {
  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .remove([imagePath])

  if (error) {
    console.error("Failed to delete image:", error)
  }
}
