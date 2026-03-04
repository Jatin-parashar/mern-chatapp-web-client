import { FILE_CONFIG } from '../config/constants';

const HTML_ENTITIES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '/': '&#x2F;',
};

const DANGEROUS_EXTENSIONS = [
  '.exe', '.bat', '.cmd', '.sh', '.ps1', '.msi', '.app', '.deb', '.rpm',
  '.dmg', '.pkg', '.run', '.bin', '.com', '.scr', '.vbs', '.js', '.jar'
];

const MIME_TYPE_EXTENSIONS: Record<string, string[]> = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/gif': ['.gif'],
  'image/webp': ['.webp'],
  'video/mp4': ['.mp4'],
  'video/webm': ['.webm'],
  'video/quicktime': ['.mov'],
  'audio/mpeg': ['.mp3'],
  'audio/wav': ['.wav'],
  'audio/ogg': ['.ogg'],
  'application/pdf': ['.pdf'],
  'application/msword': ['.doc'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
};

export const sanitizeHtml = (str: string): string => {
  if (!str) return '';
  return str.replace(/[&<>"'\/]/g, (char) => HTML_ENTITIES[char]);
};

export const sanitizeFilename = (filename: string): string => {
  if (!filename) return '';
  return filename.replace(/[^a-zA-Z0-9._-]/g, '_').replace(/\.\./g, '_');
};

export const validateFile = (file: File): { valid: boolean; error?: string } => {
  const ext = file.name.toLowerCase().match(/\.[^.]+$/)?.[0] || '';
  
  // Block dangerous extensions
  if (DANGEROUS_EXTENSIONS.includes(ext)) {
    return { valid: false, error: `File type ${ext} is not allowed` };
  }
  
  // Validate MIME type matches extension
  const allowedExts = MIME_TYPE_EXTENSIONS[file.type];
  if (allowedExts && !allowedExts.includes(ext)) {
    return { valid: false, error: 'File extension does not match file type' };
  }
  
  // Validate file size
  let sizeLimit = FILE_CONFIG.MAX_SIZE.DEFAULT;
  if (file.type.startsWith('image/')) sizeLimit = FILE_CONFIG.MAX_SIZE.IMAGE;
  else if (file.type.startsWith('video/')) sizeLimit = FILE_CONFIG.MAX_SIZE.VIDEO;
  else if (file.type.includes('pdf') || file.type.includes('document')) {
    sizeLimit = FILE_CONFIG.MAX_SIZE.DOCUMENT;
  }
  
  if (file.size > sizeLimit) {
    return { 
      valid: false, 
      error: `File size exceeds limit of ${sizeLimit / 1024 / 1024}MB` 
    };
  }
  
  return { valid: true };
};

export const validateFiles = (files: File[]): { valid: boolean; error?: string } => {
  for (const file of files) {
    const result = validateFile(file);
    if (!result.valid) {
      return result;
    }
  }
  return { valid: true };
};
