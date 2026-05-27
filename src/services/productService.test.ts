import { describe, it, expect, vi, beforeEach } from 'vitest';
import { productService } from './productService';

const mockFrom = vi.hoisted(() => vi.fn());
const mockSelect = vi.hoisted(() => vi.fn());
const mockOrder = vi.hoisted(() => vi.fn());
const mockEq = vi.hoisted(() => vi.fn());
const mockSingle = vi.hoisted(() => vi.fn());

vi.mock('../lib/supabase', () => ({
  supabase: { from: mockFrom },
}));

const mockProductRow = {
  id: '1',
  full_name: 'Test Product',
  description: 'A test product',
  price: 49.99,
  image: null,
  category: 'Resource',
  sales_count: 5,
  status: 'active',
};

describe('productService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFrom.mockReturnValue({ select: mockSelect });
  });

  describe('getAll', () => {
    it('returns mapped products on success', async () => {
      mockSelect.mockReturnValue({ order: mockOrder });
      mockOrder.mockResolvedValue({ data: [mockProductRow], error: null });

      const result = await productService.getAll();

      expect(mockFrom).toHaveBeenCalledWith('products');
      expect(mockSelect).toHaveBeenCalledWith('*');
      expect(mockOrder).toHaveBeenCalledWith('created_at', { ascending: false });
      expect(result).toEqual([{
        id: '1',
        full_name: 'Test Product',
        description: 'A test product',
        price: 49.99,
        image: '',
        category: 'Resource',
        salesCount: 5,
        status: 'active',
      }]);
    });

    it('returns empty array on error', async () => {
      mockSelect.mockReturnValue({ order: mockOrder });
      mockOrder.mockResolvedValue({ data: null, error: new Error('DB error') });

      const result = await productService.getAll();
      expect(result).toEqual([]);
    });
  });

  describe('getById', () => {
    it('returns mapped product when found', async () => {
      mockSelect.mockReturnValue({ eq: mockEq });
      mockEq.mockReturnValue({ single: mockSingle });
      mockSingle.mockResolvedValue({ data: mockProductRow, error: null });

      const result = await productService.getById('1');

      expect(mockFrom).toHaveBeenCalledWith('products');
      expect(mockSelect).toHaveBeenCalledWith('*');
      expect(mockEq).toHaveBeenCalledWith('id', '1');
      expect(result).toEqual({
        id: '1',
        full_name: 'Test Product',
        description: 'A test product',
        price: 49.99,
        image: '',
        category: 'Resource',
        salesCount: 5,
        status: 'active',
      });
    });

    it('returns null on error', async () => {
      mockSelect.mockReturnValue({ eq: mockEq });
      mockEq.mockReturnValue({ single: mockSingle });
      mockSingle.mockResolvedValue({ data: null, error: new Error('Not found') });

      const result = await productService.getById('missing');
      expect(result).toBeNull();
    });
  });
});
