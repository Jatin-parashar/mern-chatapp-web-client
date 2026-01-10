export const API_CONFIG = {
  SERVER_URL: import.meta.env.VITE_SERVER_URL,
  SOCKET_URL: import.meta.env.VITE_SERVER_URL,
} as const;

export const FILE_CONFIG = {
  MAX_SIZE: {
    IMAGE: 10 * 1024 * 1024,
    VIDEO: 50 * 1024 * 1024,
    DOCUMENT: 25 * 1024 * 1024,
    DEFAULT: 25 * 1024 * 1024,
  },
  ALLOWED_TYPES: {
    IMAGE: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    VIDEO: ['video/mp4', 'video/webm'],
    AUDIO: ['audio/mpeg', 'audio/wav', 'audio/ogg'],
    DOCUMENT: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  },
} as const;

export const TIMING_CONFIG = {
  TYPING_DELAY: 2000,
  DEBOUNCE_DELAY: 500,
  RETRY_DELAY: 1000,
  MAX_RETRIES: 3,
} as const;

export const APP_CONFIG = {
  TITLE: 'Elevate Messaging',
  ENABLE_DEV_TOOLS: import.meta.env.DEV,
} as const;
