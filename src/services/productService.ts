import { supabase } from '../lib/supabase';
import { Product } from '../types';

export const productService = {
  async getAll(): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching products:', error);
      return [];
    }
    return (data || []).map(mapProduct);
  },

  async getById(id: string): Promise<Product | null> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (error) return null;
    return data ? mapProduct(data) : null;
  },
};

function mapProduct(data: any): Product {
  return {
    id: data.id,
    full_name: data.full_name,
    description: data.description || '',
    price: data.price,
    image: data.image || '',
    category: data.category || '',
    salesCount: data.sales_count,
    status: data.status,
  };
}
