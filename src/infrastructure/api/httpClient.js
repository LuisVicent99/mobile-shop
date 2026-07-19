import { API_BASE_URL } from './config.js';
import { ApiError } from './ApiError.js';

export async function request(path, options = {}) {
  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, options);
  } catch (error) {
    throw new ApiError(error.message || 'Network error', 0);
  }

  if (!response.ok) {
    throw new ApiError(
      response.statusText || `Request failed (${response.status})`,
      response.status,
    );
  }

  try {
    return await response.json();
  } catch {
    throw new ApiError('Invalid JSON response', response.status);
  }
}
