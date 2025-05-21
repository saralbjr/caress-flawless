"use client";

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ProductCard } from '@/components/products/product-card';
import { Pagination } from '@/components/ui/pagination';
import { ProductFilter } from '@/components/products/product-filter';
import { ProductSort } from '@/components/products/product-sort';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
}

interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export function ProductGrid() {
  const [products, setProducts] = useState<Product[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    total: 0,
    page: 1,
    limit: 12,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // Get current search params
  const page = searchParams.get('page') || '1';
  const category = searchParams.get('category') || 'all';
  const sortBy = searchParams.get('sortBy') || 'createdAt';
  const sortOrder = searchParams.get('sortOrder') || 'desc';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const search = searchParams.get('search') || '';
  
  // Fetch products based on filters
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Build query string from search params
        const queryParams = new URLSearchParams();
        queryParams.set('page', page);
        queryParams.set('limit', '12');
        
        if (category && category !== 'all') {
          queryParams.set('category', category);
        }
        
        if (sortBy) {
          queryParams.set('sortBy', sortBy);
        }
        
        if (sortOrder) {
          queryParams.set('sortOrder', sortOrder);
        }
        
        if (minPrice) {
          queryParams.set('minPrice', minPrice);
        }
        
        if (maxPrice) {
          queryParams.set('maxPrice', maxPrice);
        }
        
        if (search) {
          queryParams.set('search', search);
        }
        
        // Fetch products
        const response = await fetch(`/api/products?${queryParams.toString()}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }
        
        const data = await response.json();
        
        if (data.success) {
          setProducts(data.products);
          setPagination(data.pagination);
        } else {
          throw new Error(data.error || 'Failed to fetch products');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        console.error('Error fetching products:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, [page, category, sortBy, sortOrder, minPrice, maxPrice, search]);
  
  // Apply filters
  const applyFilters = (filters: {
    category?: string;
    minPrice?: string;
    maxPrice?: string;
    sortBy?: string;
    sortOrder?: string;
  }) => {
    const params = new URLSearchParams(searchParams);
    
    // Reset to page 1 when filters change
    params.set('page', '1');
    
    // Update filter params
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });
    
    // Update URL with new params
    router.push(`/products?${params.toString()}`);
  };
  
  // Handle search
  const handleSearch = (searchTerm: string) => {
    const params = new URLSearchParams(searchParams);
    
    // Reset to page 1 when search changes
    params.set('page', '1');
    
    if (searchTerm) {
      params.set('search', searchTerm);
    } else {
      params.delete('search');
    }
    
    router.push(`/products?${params.toString()}`);
  };
  
  // Reset all filters
  const resetFilters = () => {
    router.push('/products');
  };
  
  // Generate URL for pagination
  const paginationBaseUrl = '/products';
  const currentQueryString = Array.from(searchParams.entries())
    .filter(([key]) => key !== 'page')
    .map(([key, value]) => `${key}=${value}`)
    .join('&');
  
  const paginationUrl = currentQueryString 
    ? `${paginationBaseUrl}?${currentQueryString}` 
    : paginationBaseUrl;
  
  return (
    <div className="space-y-6">
      <div className="md:flex md:justify-between md:items-center gap-4">
        <ProductFilter 
          currentCategory={category} 
          currentMinPrice={minPrice}
          currentMaxPrice={maxPrice}
          onApplyFilters={applyFilters}
        />
        <div className="flex items-center gap-2 mt-4 md:mt-0">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={resetFilters}
            disabled={loading}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Reset
          </Button>
          <ProductSort 
            currentSortBy={sortBy}
            currentSortOrder={sortOrder}
            onApplySort={applyFilters}
          />
        </div>
      </div>
      
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 12 }).map((_, index) => (
            <div key={index} className="space-y-3">
              <Skeleton className="aspect-square rounded-lg" />
              <Skeleton className="h-6 w-2/3" />
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-9 w-full rounded-md" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-destructive mb-4">{error}</p>
          <Button onClick={resetFilters}>Try Again</Button>
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-xl font-semibold mb-2">No products found</h3>
          <p className="text-muted-foreground mb-6">
            Try adjusting your filters or search for something else.
          </p>
          <Button onClick={resetFilters}>Clear Filters</Button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
          
          {pagination.totalPages > 1 && (
            <div className="mt-8">
              <Pagination 
                totalPages={pagination.totalPages} 
                currentPage={pagination.page} 
                baseUrl={paginationUrl}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}