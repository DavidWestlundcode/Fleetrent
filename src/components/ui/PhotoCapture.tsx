'use client';
import { useRef, useState } from 'react';
import { Camera, Loader2, X } from 'lucide-react';
import { uploadMachinePhoto, deleteMachinePhoto } from '@/lib/supabase/storage';

export default function PhotoCapture({
  images,
  onChange,
  orgId,
  folderId,
  label,
  hint,
  maxImages = 8,
}: {
  images: string[];
  onChange: (images: string[]) => void;
  orgId: string;
  folderId: string;
  label?: string;
  hint?: string;
  maxImages?: number;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    e.target.value = '';
    if (files.length === 0) return;

    setError(null);
    setUploading(true);
    try {
      const remaining = Math.max(0, maxImages - images.length);
      const toUpload = files.slice(0, remaining);
      const uploaded = await Promise.all(
        toUpload.map((file) => uploadMachinePhoto(file, orgId, folderId))
      );
      onChange([...images, ...uploaded]);
    } catch {
      setError('Kunde inte ladda upp bilden. Försök igen.');
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = (url: string) => {
    onChange(images.filter((i) => i !== url));
    void deleteMachinePhoto(url);
  };

  return (
    <div>
      {label && <p className="text-sm font-medium text-slate-700 mb-1">{label}</p>}
      {hint && <p className="text-xs text-slate-400 mb-2">{hint}</p>}

      <div className="grid grid-cols-3 gap-2">
        {images.map((url) => (
          <div key={url} className="relative rounded-xl overflow-hidden border border-slate-200 aspect-square bg-slate-100">
            <img src={url} alt="Foto" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => handleRemove(url)}
              className="absolute top-1.5 right-1.5 w-6 h-6 bg-white/90 rounded-full flex items-center justify-center shadow hover:bg-white cursor-pointer"
            >
              <X className="w-3.5 h-3.5 text-slate-700" />
            </button>
          </div>
        ))}

        {images.length < maxImages && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="aspect-square border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center gap-1.5 hover:border-blue-400 hover:bg-blue-50/50 transition-colors disabled:opacity-60 cursor-pointer"
          >
            {uploading ? (
              <Loader2 className="w-6 h-6 text-slate-400 animate-spin" />
            ) : (
              <>
                <Camera className="w-6 h-6 text-slate-300" />
                <span className="text-[11px] text-slate-400">Lägg till foto</span>
              </>
            )}
          </button>
        )}
      </div>

      {error && <p className="text-xs text-red-600 mt-2">{error}</p>}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        multiple
        className="hidden"
        onChange={handleFiles}
      />
    </div>
  );
}
