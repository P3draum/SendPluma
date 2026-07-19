"use client";

import { useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Camera, Loader, User } from "lucide-react";

interface AvatarEditorProps {
  userId: string;
  profileAvatarUrl?: string | null;
  googleAvatarUrl?: string | null;
  fullName: string;
  onUploadSuccess: (newUrl: string) => void;
  onUploadError: (error: string) => void;
}

export default function AvatarEditor({
  userId,
  profileAvatarUrl,
  googleAvatarUrl,
  fullName,
  onUploadSuccess,
  onUploadError,
}: AvatarEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  // Lógica de Precedência (Híbrida)
  const avatarSrc = profileAvatarUrl || googleAvatarUrl || null;

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    
    setUploading(true);
    
    const fileExt = file.name.split(".").pop();
    const filePath = `${userId}/avatar.${fileExt}`;
    
    try {
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        throw new Error("Erro no envio do arquivo. Verifique se o bucket 'avatars' está configurado.");
      }

      const { data: { publicUrl } } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      // Atualiza banco de dados
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl })
        .eq("id", userId);

      if (updateError) throw updateError;
      
      onUploadSuccess(publicUrl);
    } catch (err: any) {
      onUploadError(err.message || "Erro ao realizar upload do avatar.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="relative group">
      <div className="w-20 h-20 rounded-full bg-zinc-100 border border-zinc-200 overflow-hidden flex items-center justify-center text-zinc-400 text-xl font-bold select-none">
        {avatarSrc ? (
          <img src={avatarSrc} alt="Avatar" className="w-full h-full object-cover" />
        ) : (
          fullName?.charAt(0)?.toUpperCase() || <User className="w-8 h-8" />
        )}
      </div>
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-zinc-900 hover:bg-zinc-800 text-white flex items-center justify-center transition shadow-sm cursor-pointer border border-white disabled:opacity-50"
        title="Alterar foto"
      >
        {uploading ? (
          <Loader className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <Camera className="w-3.5 h-3.5" />
        )}
      </button>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleAvatarUpload}
        accept="image/*"
        className="hidden"
      />
    </div>
  );
}
