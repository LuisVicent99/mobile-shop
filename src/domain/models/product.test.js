import { describe, it, expect } from 'vitest';
import { mapProductListItem, mapProductDetail } from './product.js';

// Fixtures mirror the real wire format, including its misspelled fields.
const RAW_DETAIL = {
  id: 'ZmGrkLRPXOTpxsU4jjAcv',
  brand: 'Acer',
  model: 'Iconia Talk S',
  price: '170',
  imgUrl: 'https://example.com/img.jpg',
  cpu: 'Quad-core 1.3 GHz Cortex-A53',
  ram: '2 GB RAM',
  os: 'Android 6.0 (Marshmallow)',
  displayResolution: '7.0 inches (~69.8% screen-to-body ratio)',
  battery: 'Non-removable Li-Ion 3400 mAh battery',
  primaryCamera: ['13 MP', 'autofocus'],
  secondaryCmera: ['2 MP', '720p'],
  dimentions: '191.7 x 101 x 9.4 mm',
  weight: '260',
  options: {
    colors: [{ code: 1000, name: 'Black' }],
    storages: [
      { code: 2000, name: '16 GB' },
      { code: 2001, name: '32 GB' },
    ],
  },
};

describe('mapProductListItem', () => {
  it('maps the list fields and formats the price', () => {
    expect(mapProductListItem(RAW_DETAIL)).toEqual({
      id: 'ZmGrkLRPXOTpxsU4jjAcv',
      brand: 'Acer',
      model: 'Iconia Talk S',
      price: '170 €',
      imgUrl: 'https://example.com/img.jpg',
    });
  });

  it('normalizes an empty price to null (never undefined or NaN)', () => {
    const item = mapProductListItem({ ...RAW_DETAIL, price: '' });
    expect(item.price).toBeNull();
  });

  it('tolerates a completely empty payload', () => {
    expect(mapProductListItem({})).toEqual({
      id: '',
      brand: '',
      model: '',
      price: null,
      imgUrl: null,
    });
  });
});

describe('mapProductDetail', () => {
  it('joins array-valued camera specs into readable text', () => {
    const detail = mapProductDetail(RAW_DETAIL);
    expect(detail.specs.primaryCamera).toBe('13 MP, autofocus');
    expect(detail.specs.secondaryCamera).toBe('2 MP, 720p');
  });

  it('keeps string-valued camera specs as-is (API mixes both shapes)', () => {
    const detail = mapProductDetail({ ...RAW_DETAIL, secondaryCmera: '8 MP' });
    expect(detail.specs.secondaryCamera).toBe('8 MP');
  });

  it('renames the misspelled wire fields', () => {
    const detail = mapProductDetail(RAW_DETAIL);
    expect(detail.specs.dimensions).toBe('191.7 x 101 x 9.4 mm');
    expect(detail.specs).not.toHaveProperty('dimentions');
  });

  it('appends grams to bare numeric weights', () => {
    expect(mapProductDetail(RAW_DETAIL).specs.weight).toBe('260 g');
    expect(mapProductDetail({ ...RAW_DETAIL, weight: '190 g' }).specs.weight).toBe('190 g');
    expect(mapProductDetail({ ...RAW_DETAIL, weight: '' }).specs.weight).toBeNull();
  });

  it('normalizes every empty spec to null', () => {
    const detail = mapProductDetail({ id: 'x', brand: 'B', model: 'M' });
    for (const value of Object.values(detail.specs)) {
      expect(value).toBeNull();
    }
  });

  it('maps the color and storage options with their codes', () => {
    const detail = mapProductDetail(RAW_DETAIL);
    expect(detail.colors).toEqual([{ code: 1000, name: 'Black' }]);
    expect(detail.storages).toEqual([
      { code: 2000, name: '16 GB' },
      { code: 2001, name: '32 GB' },
    ]);
  });

  it('returns empty option arrays when options are missing', () => {
    const detail = mapProductDetail({ id: 'x' });
    expect(detail.colors).toEqual([]);
    expect(detail.storages).toEqual([]);
  });
});
