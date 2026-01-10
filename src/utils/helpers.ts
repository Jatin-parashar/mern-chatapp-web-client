// String helpers
export const getInitials = (name: string): string => {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

// Array helpers
export const sortByDate = <T extends { createdAt?: string; updatedAt: string }>(
  items: T[],
  dateField: keyof T = 'updatedAt'
): T[] => {
  return [...items].sort((a, b) => {
    const aTime = new Date(a[dateField] as string).getTime();
    const bTime = new Date(b[dateField] as string).getTime();
    return bTime - aTime;
  });
};

// File helpers
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

export const getFileType = (mimeType: string): 'image' | 'video' | 'audio' | 'document' => {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType.startsWith('audio/')) return 'audio';
  return 'document';
};
