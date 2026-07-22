import { MAX_IMAGE_SIZE } from "@/lib/constants";

export async function compressImage(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const size = MAX_IMAGE_SIZE;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas context unavailable");

  const scale = Math.max(size / bitmap.width, size / bitmap.height);
  const drawWidth = bitmap.width * scale;
  const drawHeight = bitmap.height * scale;
  const dx = (size - drawWidth) / 2;
  const dy = (size - drawHeight) / 2;
  ctx.drawImage(bitmap, dx, dy, drawWidth, drawHeight);
  bitmap.close();

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Image encode failed"))),
      "image/webp",
      0.85,
    );
  });
}
