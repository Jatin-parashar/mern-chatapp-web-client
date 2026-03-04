import { API_CONFIG, APP_CONFIG } from '../config/constants';

export const getServerURL = (path: string) => {
  return `${API_CONFIG.SERVER_URL}/api/v1/${path}`;
};

export const socketURL = API_CONFIG.SOCKET_URL;

export const appTitle = APP_CONFIG.TITLE;
