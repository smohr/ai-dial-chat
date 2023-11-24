import { DialFile } from '@/src/types/files';

export function triggerDownload(url: string, name: string): void {
  const link = document.createElement('a');
  link.download = name;
  link.href = url;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export const getPathNameId = (name: string, relativePath?: string): string => {
  return [relativePath, name].filter(Boolean).join('/');
};

export const getRelativePath = (
  absolutePath: string | undefined,
): string | undefined => {
  // '/users/asd/files/folder-1/folder-2' -> folder-1/folder-2
  return absolutePath?.split('/').toSpliced(0, 4).join('/') || undefined;
};

export const getUserCustomContent = (files: DialFile[]) => {
  if (files.length === 0) {
    return undefined;
  }

  return {
    custom_content: {
      attachments: files
        .filter(
          (file) => file.status !== 'FAILED' && file.status !== 'UPLOADING',
        )
        .map((file) => ({
          type: file.contentType,
          title: file.name,
          url: encodeURI(`${file.absolutePath}/${file.name}`),
        })),
    },
  };
};

export const getDialFilesWithInvalidFileType = (
  files: DialFile[],
  allowedFileTypes: string[],
): DialFile[] => {
  return allowedFileTypes.includes('*/*')
    ? []
    : files.filter((file) => !allowedFileTypes.includes(file.contentType));
};

export const getDialFilesWithInvalidFileSize = (
  files: DialFile[],
  sizeLimit: number,
): DialFile[] => {
  return files.filter((file) => file.contentLength > sizeLimit);
};

export const getFilesWithInvalidFileType = (
  files: File[],
  allowedFileTypes: string[],
): File[] => {
  return allowedFileTypes.includes('*/*')
    ? []
    : files.filter((file) => !allowedFileTypes.includes(file.type));
};

export const getFilesWithInvalidFileSize = (
  files: File[],
  sizeLimit: number,
): File[] => {
  return files.filter((file) => file.size > sizeLimit);
};