import { TIMING_CONFIG } from '../config/constants';

export async function retryAsync<T>(
  fn: () => Promise<T>,
  maxRetries: number = TIMING_CONFIG.MAX_RETRIES,
  delay: number = TIMING_CONFIG.RETRY_DELAY
): Promise<T> {
  let lastError: Error;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
      }
    }
  }
  
  throw lastError!;
}
