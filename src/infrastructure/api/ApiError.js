/**
 * Uniform error shape for every API failure mode.
 * `status` is the HTTP status code, or 0 for network-level failures.
 */
export class ApiError extends Error {
  constructor(message, status = 0) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}
