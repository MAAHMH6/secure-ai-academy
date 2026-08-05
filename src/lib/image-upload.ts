/** Read an image file and return a resized JPEG/PNG data URL (no storage bucket needed). */
export async function fileToResizedDataUrl(file: File, maxWidth = 960, quality = 0.82): Promise<string> {
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Could not read that file"));
    reader.readAsDataURL(file);
  });

  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const el = new Image();
    el.onload = () => resolve(el);
    el.onerror = () => reject(new Error("That file is not a valid image"));
    el.src = dataUrl;
  });

  const scale = Math.min(1, maxWidth / (img.naturalWidth || maxWidth));
  const w = Math.round((img.naturalWidth || maxWidth) * scale);
  const h = Math.round((img.naturalHeight || maxWidth) * scale);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return dataUrl;
  ctx.drawImage(img, 0, 0, w, h);
  return canvas.toDataURL("image/jpeg", quality);
}
