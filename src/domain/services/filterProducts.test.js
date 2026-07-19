import { describe, it, expect } from 'vitest';
import { filterProducts } from './filterProducts.js';

const PRODUCTS = [
  { id: '1', brand: 'Acer', model: 'Iconia Talk S' },
  { id: '2', brand: 'Acer', model: 'Liquid Z6' },
  { id: '3', brand: 'Samsung', model: 'Galaxy S8' },
];

describe('filterProducts', () => {
  it('returns every product when the query is empty or whitespace', () => {
    expect(filterProducts(PRODUCTS, '')).toEqual(PRODUCTS);
    expect(filterProducts(PRODUCTS, '   ')).toEqual(PRODUCTS);
    expect(filterProducts(PRODUCTS, undefined)).toEqual(PRODUCTS);
  });

  it('filters by brand, case-insensitively', () => {
    expect(filterProducts(PRODUCTS, 'SAMSUNG')).toEqual([PRODUCTS[2]]);
  });

  it('filters by model, case-insensitively', () => {
    expect(filterProducts(PRODUCTS, 'liquid')).toEqual([PRODUCTS[1]]);
  });

  it('matches partial terms', () => {
    expect(filterProducts(PRODUCTS, 'gal')).toEqual([PRODUCTS[2]]);
  });

  it('matches a query spanning brand and model', () => {
    expect(filterProducts(PRODUCTS, 'acer liquid')).toEqual([PRODUCTS[1]]);
  });

  it('returns an empty array when nothing matches', () => {
    expect(filterProducts(PRODUCTS, 'nokia')).toEqual([]);
  });
});
