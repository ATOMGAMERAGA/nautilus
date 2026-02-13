import { isNative } from './platform';

export async function pickImageFromCamera(): Promise<File | null> {
  if (!isNative) return null;

  const { Camera, CameraResultType, CameraSource } = await import('@capacitor/camera');

  const photo = await Camera.getPhoto({
    quality: 85,
    resultType: CameraResultType.Uri,
    source: CameraSource.Camera,
    allowEditing: false,
  });

  if (!photo.webPath) return null;
  const response = await fetch(photo.webPath);
  const blob = await response.blob();
  return new File([blob], `photo-${Date.now()}.${photo.format}`, { type: `image/${photo.format}` });
}

export async function pickImageFromGallery(): Promise<File | null> {
  if (!isNative) return null;

  const { Camera, CameraResultType, CameraSource } = await import('@capacitor/camera');

  const photo = await Camera.getPhoto({
    quality: 85,
    resultType: CameraResultType.Uri,
    source: CameraSource.Photos,
    allowEditing: false,
  });

  if (!photo.webPath) return null;
  const response = await fetch(photo.webPath);
  const blob = await response.blob();
  return new File([blob], `gallery-${Date.now()}.${photo.format}`, { type: `image/${photo.format}` });
}
