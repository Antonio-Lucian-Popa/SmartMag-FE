import { useState } from 'react';
import { Package, Plus, Barcode } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { PageHeader } from '@/components/common/PageHeader';
import { FilterBar } from '@/components/common/FilterBar';
import { EmptyState } from '@/components/common/EmptyState';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import { Product, Stock, Store } from '@/types';
import { createProduct, getProductsByCompany, getProductStock, updateStock } from '@/services/api/products';
import { getStoresByCompany } from '@/services/api/stores';
import { toast } from 'sonner';

const productSchema = z.object({
  name: z.string().min(2, 'Product name must be at least 2 characters'),
  barcode: z.string().min(5, 'Barcode must be at least 5 characters'),
  unit: z.string().min(1, 'Unit is required'),
  sgr: z.boolean().optional(),
});

type ProductFormValues = z.infer<typeof productSchema>;

const stockSchema = z.object({
  quantity: z.number().min(0, 'Quantity must be positive'),
  storeId: z.string().min(1, 'Store is required'),
});

type StockFormValues = z.infer<typeof stockSchema>;

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isStockDialogOpen, setIsStockDialogOpen] = useState(false);

  const productForm = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      barcode: '',
      unit: '',
      sgr: false,
    },
  });

  const stockForm = useForm<StockFormValues>({
    resolver: zodResolver(stockSchema),
    defaultValues: {
      quantity: 0,
      storeId: '',
    },
  });

  const onSubmitProduct = async (data: ProductFormValues) => {
    try {
      setIsLoading(true);
      const newProduct = await createProduct(data);
      setProducts((prev) => [...prev, newProduct]);
      setIsCreateDialogOpen(false);
      productForm.reset();
      toast.success('Product created successfully');
    } catch (error) {
      console.error('Error creating product:', error);
      toast.error('Failed to create product');
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmitStock = async (data: StockFormValues) => {
    if (!selectedProduct) return;

    try {
      setIsLoading(true);
      const updatedStock = await updateStock({
        productId: selectedProduct.id,
        storeId: data.storeId,
        quantity: data.quantity,
      });
      
      setStocks((prev) => {
        const index = prev.findIndex(s => 
          s.productId === updatedStock.productId && 
          s.storeId === updatedStock.storeId
        );
        
        if (index >= 0) {
          const newStocks = [...prev];
          newStocks[index] = updatedStock;
          return newStocks;
        }
        
        return [...prev, updatedStock];
      });
      
      setIsStockDialogOpen(false);
      stockForm.reset();
      toast.success('Stock updated successfully');
    } catch (error) {
      console.error('Error updating stock:', error);
      toast.error('Failed to update stock');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.barcode.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleViewStock = async (product: Product) => {
    setSelectedProduct(product);
    setIsStockDialogOpen(true);
    
    try {
      const stockPromises = stores.map(store => 
        getProductStock(product.id, store.id)
      );
      const stockData = await Promise.all(stockPromises);
      setStocks(stockData);
    } catch (error) {
      console.error('Error fetching stock data:', error);
      toast.error('Failed to fetch stock data');
    }
  };

  return (
    <div>
      <PageHeader
        title="Products & Stocks"
        description="Manage your products and inventory"
        icon={Package}
        action={{
          label: "Add Product",
          onClick: () => setIsCreateDialogOpen(true),
        }}
      />

      <FilterBar
        searchPlaceholder="Search products..."
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {products.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No products found"
          description="Get started by adding your first product"
          action={{
            label: "Add Product",
            onClick: () => setIsCreateDialogOpen(true),
          }}
        />
      ) : (
        <div className="grid gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Products List</CardTitle>
              <CardDescription>
                View and manage your product inventory
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Barcode</TableHead>
                    <TableHead>Unit</TableHead>
                    <TableHead>SGR</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>{product.name}</TableCell>
                      <TableCell>{product.barcode}</TableCell>
                      <TableCell>{product.unit}</TableCell>
                      <TableCell>{product.sgr ? 'Yes' : 'No'}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewStock(product)}
                        >
                          View Stock
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Create Product Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Product</DialogTitle>
            <DialogDescription>
              Create a new product in your inventory
            </DialogDescription>
          </DialogHeader>

          <Form {...productForm}>
            <form onSubmit={productForm.handleSubmit(onSubmitProduct)} className="space-y-4">
              <FormField
                control={productForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter product name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={productForm.control}
                name="barcode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Barcode</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter barcode" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={productForm.control}
                name="unit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unit</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select unit" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="piece">Piece</SelectItem>
                        <SelectItem value="kg">Kilogram</SelectItem>
                        <SelectItem value="l">Liter</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={productForm.control}
                name="sgr"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        SGR Product
                      </FormLabel>
                      <FormDescription>
                        This product requires SGR handling
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Creating...' : 'Create Product'}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Stock Management Dialog */}
      <Dialog open={isStockDialogOpen} onOpenChange={setIsStockDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              Stock Management - {selectedProduct?.name}
            </DialogTitle>
            <DialogDescription>
              View and update stock levels across stores
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Store</TableHead>
                  <TableHead>Current Stock</TableHead>
                  <TableHead>Last Updated</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stocks.map((stock) => (
                  <TableRow key={`${stock.productId}-${stock.storeId}`}>
                    <TableCell>
                      {stores.find(s => s.id === stock.storeId)?.name}
                    </TableCell>
                    <TableCell>{stock.quantity}</TableCell>
                    <TableCell>
                      {new Date(stock.updatedAt).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <Card>
              <CardHeader>
                <CardTitle>Update Stock</CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...stockForm}>
                  <form onSubmit={stockForm.handleSubmit(onSubmitStock)} className="space-y-4">
                    <FormField
                      control={stockForm.control}
                      name="storeId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Store</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select store" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {stores.map((store) => (
                                <SelectItem key={store.id} value={store.id}>
                                  {store.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={stockForm.control}
                      name="quantity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Quantity</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="0"
                              {...field}
                              onChange={(e) => field.onChange(Number(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex justify-end gap-2">
                      <Button type="submit" disabled={isLoading}>
                        {isLoading ? 'Updating...' : 'Update Stock'}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}