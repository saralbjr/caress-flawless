"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from '@/components/ui/popover';
import { Filter } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';

interface ProductFilterProps {
  currentCategory: string;
  currentMinPrice: string;
  currentMaxPrice: string;
  onApplyFilters: (filters: {
    category?: string;
    minPrice?: string;
    maxPrice?: string;
  }) => void;
}

export function ProductFilter({
  currentCategory = 'all',
  currentMinPrice = '',
  currentMaxPrice = '',
  onApplyFilters,
}: ProductFilterProps) {
  const [category, setCategory] = useState(currentCategory);
  const [minPrice, setMinPrice] = useState(currentMinPrice);
  const [maxPrice, setMaxPrice] = useState(currentMaxPrice);
  const [open, setOpen] = useState(false);
  
  // Update state when props change
  useEffect(() => {
    setCategory(currentCategory);
    setMinPrice(currentMinPrice);
    setMaxPrice(currentMaxPrice);
  }, [currentCategory, currentMinPrice, currentMaxPrice]);
  
  const handleApplyFilters = () => {
    onApplyFilters({
      category,
      minPrice,
      maxPrice,
    });
    setOpen(false);
  };
  
  const categories = [
    { id: 'all', name: 'All Categories' },
    { id: 'electronics', name: 'Electronics' },
    { id: 'clothing', name: 'Clothing' },
    { id: 'books', name: 'Books' },
    { id: 'home', name: 'Home & Kitchen' },
    { id: 'beauty', name: 'Beauty' },
    { id: 'other', name: 'Other' },
  ];
  
  const isFiltersApplied = 
    currentCategory !== 'all' || 
    currentMinPrice !== '' || 
    currentMaxPrice !== '';
  
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          className="border-dashed gap-1"
        >
          <Filter className="h-4 w-4 mr-2" />
          Filters
          {isFiltersApplied && (
            <span className="ml-1 rounded-full bg-primary w-2 h-2" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-4">
          <h4 className="font-medium leading-none">Filter Products</h4>
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select
              value={category}
              onValueChange={(value) => setCategory(value)}
            >
              <SelectTrigger id="category">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="price-range">Price Range</Label>
            <div className="flex items-center space-x-2">
              <Input
                type="number"
                id="min-price"
                placeholder="Min"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                min="0"
                className="w-full"
              />
              <span>to</span>
              <Input
                type="number"
                id="max-price"
                placeholder="Max"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                min="0"
                className="w-full"
              />
            </div>
          </div>
          
          <div className="flex justify-end pt-2">
            <Button onClick={handleApplyFilters}>
              Apply Filters
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}