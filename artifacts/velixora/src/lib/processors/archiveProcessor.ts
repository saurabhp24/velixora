export async function zipFiles(files: File[]): Promise<Blob> {
  const JSZip = (await import('jszip')).default;
  const zip = new JSZip();
  
  files.forEach(file => {
    zip.file(file.name, file);
  });
  
  return await zip.generateAsync({ type: 'blob' });
}

export async function unzipFiles(file: File): Promise<{ name: string, blob: Blob }[]> {
  const JSZip = (await import('jszip')).default;
  const zip = await JSZip.loadAsync(file);
  const extractedFiles: { name: string, blob: Blob }[] = [];
  
  const promises = Object.keys(zip.files).map(async filename => {
    if (!zip.files[filename].dir) {
      const blob = await zip.files[filename].async('blob');
      extractedFiles.push({ name: filename, blob });
    }
  });
  
  await Promise.all(promises);
  return extractedFiles;
}
