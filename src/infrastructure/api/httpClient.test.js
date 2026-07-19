import { describe, it, expect, afterEach, vi } from 'vitest';
import { request } from './httpClient.js';
import { ApiError } from './ApiError.js';
import { API_BASE_URL } from './config.js';

describe('httpClient.request', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('resolves with parsed JSON and prefixes the base URL', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ hello: 'world' }),
    });
    vi.stubGlobal('fetch', fetchMock);

    await expect(request('/api/product')).resolves.toEqual({ hello: 'world' });
    expect(fetchMock).toHaveBeenCalledWith(`${API_BASE_URL}/api/product`, {});
  });

  it('rejects with ApiError carrying the status on non-OK responses', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: false, status: 404, statusText: 'Not Found' }),
    );

    const error = await request('/api/product/x').catch((e) => e);
    expect(error).toBeInstanceOf(ApiError);
    expect(error.status).toBe(404);
    expect(error.message).toBe('Not Found');
  });

  it('rejects with ApiError(status 0) on network failure', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));

    const error = await request('/api/product').catch((e) => e);
    expect(error).toBeInstanceOf(ApiError);
    expect(error.status).toBe(0);
  });

  it('rejects with ApiError when the body is not valid JSON', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.reject(new SyntaxError('Unexpected token')),
      }),
    );

    const error = await request('/api/product').catch((e) => e);
    expect(error).toBeInstanceOf(ApiError);
    expect(error.message).toBe('Invalid JSON response');
  });
});
