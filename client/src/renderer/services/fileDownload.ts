import { isNative } from './platform';

export async function downloadFile(url: string, fileName: string) {
  if (isNative) {
    const { Filesystem, Directory } = await import('@capacitor/filesystem');

    const response = await fetch(url);
    const blob = await response.blob();

    const reader = new FileReader();
    const base64 = await new Promise<string>((resolve) => {
      reader.onloadend = () => {
        const result = reader.result as string;
        resolve(result.split(',')[1]);
      };
      reader.readAsDataURL(blob);
    });

    await Filesystem.writeFile({
      path: `Download/${fileName}`,
      data: base64,
      directory: Directory.ExternalStorage,
    });

    return;
  }

  // Web/Electron fallback: standard browser download
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
