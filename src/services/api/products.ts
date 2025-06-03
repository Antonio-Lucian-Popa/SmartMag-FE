import { api } from './index';
import { Product, Stock } from '@/types';

interface CreateProductDto {
  name: string;
  barcode: string;
  unit: string;
  sgr?: boolean;
}

interface StockUpdateDto {
  productId: string;
  storeId: string;
  quantity: number;
}

export const createProduct = async (productData: CreateProductDto): Promise<Product> => {
  const response = await api.post<Product>('/product', productData);
  return response.data;
};

export const getProductsByCompany = async (): Promise<Product[]> => {
  const response = await api.get<Product[]>('/product/by-company');
  return response.data;
};

export const getProductStock = async (productId: string, storeId: string): Promise<Stock> => {
  const response = await api.get<Stock>(`/product/stock?productId=${productId}&storeId=${storeId}`);
  return response.data;
};

export const updateStock = async (stockData: StockUpdateDto): Promise<Stock> => {
  const response = await api.post<Stock>('/product/stock/add', stockData);
  return response.data;
};