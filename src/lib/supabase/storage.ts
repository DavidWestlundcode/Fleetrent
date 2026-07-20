import { createClient } from './client';

const BUCKET = 'machine-photos';
// Bucket is private; a long-lived signed URL lets us store a plain string in
// Machine.images / Order.pickupImages / Order.returnImages and render it
// directly with <img src>, matching how those fields are already typed.
const SIGNED_URL_EXPIRY_SECONDS = 60 * 60 * 24 * 365 * 5;

export async function uploadMachinePhoto(file: File, orgId: string, machineId: string): Promise<string> {
  const supabase = createClient();
  const ext = file.name.split('.').pop() || 'jpg';
  const path = `${orgId}/${machineId}/${crypto.randomUUID()}.${ext}`;

  const { error: uploadError } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: '3600',
    upsert: false,
  });
  if (uploadError) throw uploadError;

  const { data, error: signError } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(path, SIGNED_URL_EXPIRY_SECONDS);
  if (signError || !data) throw signError ?? new Error('Kunde inte skapa bild-URL');

  return data.signedUrl;
}

export async function deleteMachinePhoto(url: string): Promise<void> {
  const path = pathFromSignedUrl(url);
  if (!path) return;
  const supabase = createClient();
  await supabase.storage.from(BUCKET).remove([path]);
}

function pathFromSignedUrl(url: string): string | null {
  const marker = `/object/sign/${BUCKET}/`;
  const idx = url.indexOf(marker);
  if (idx === -1) return null;
  const rest = url.slice(idx + marker.length);
  const queryIdx = rest.indexOf('?');
  const encodedPath = queryIdx === -1 ? rest : rest.slice(0, queryIdx);
  return decodeURIComponent(encodedPath);
}
