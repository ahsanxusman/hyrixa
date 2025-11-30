import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function uploadCV(file: File, userId: string): Promise<string> {
  const fileExt = file.name.split(".").pop();
  const fileName = `${userId}-${Date.now()}.${fileExt}`;
  const filePath = `cvs/${fileName}`;

  const { error } = await supabase.storage
    .from("hirix-cv")
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) {
    throw new Error(`Upload failed: ${error.message}`);
  }

  const { data } = supabase.storage.from("hirix-cv").getPublicUrl(filePath);

  return data.publicUrl;
}

export async function deleteCV(cvUrl: string): Promise<void> {
  const filePath = cvUrl.split("/").slice(-2).join("/");

  const { error } = await supabase.storage.from("hirix-cv").remove([filePath]);

  if (error) {
    throw new Error(`Delete failed: ${error.message}`);
  }
}
