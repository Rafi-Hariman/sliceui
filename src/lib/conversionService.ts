import { supabase } from "@/integrations/supabase/client"
import type { Conversion, Framework, ConversionOptions } from "./types"

export async function createConversion(
  userId: string,
  imageUrl: string,
  imageName: string,
  framework: Framework,
  options: ConversionOptions,
  code: string
): Promise<Conversion> {
  const { data, error } = await supabase
    .from("conversions")
    .insert({
      user_id: userId,
      original_image_url: imageUrl,
      original_image_name: imageName,
      framework,
      options: options as any,
      generated_code: code,
      status: "completed",
      error_message: null
    })
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to create conversion: ${error.message}`)
  }

  return data
}

export async function getConversions(userId: string): Promise<Conversion[]> {
  const { data, error } = await supabase
    .from("conversions")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  if (error) {
    throw new Error(`Failed to fetch conversions: ${error.message}`)
  }

  return data || []
}

export async function getConversionById(id: string): Promise<Conversion | null> {
  const { data, error } = await supabase
    .from("conversions")
    .select("*")
    .eq("id", id)
    .single()

  if (error) {
    if (error.code === "PGRST116") {
      return null
    }
    throw new Error(`Failed to fetch conversion: ${error.message}`)
  }

  return data
}

export async function deleteConversion(id: string): Promise<void> {
  const { error } = await supabase
    .from("conversions")
    .delete()
    .eq("id", id)

  if (error) {
    throw new Error(`Failed to delete conversion: ${error.message}`)
  }
}
