"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowUpDown } from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuRadioGroup, 
  DropdownMenuRadioItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';

interface ProductSortProps {
  currentSortBy: string;
  currentSortOrder: string;
  onApplySort: (sort: {
    sortBy: string;
    sortOrder: string;
  }) => void;
}

export function ProductSort({
  currentSortBy = 'createdAt',
  currentSortOrder = 'desc',
  onApplySort,
}: ProductSortProps) {
  const [value, setValue] = useState<string>(`${currentSortBy}-${currentSortOrder}`);
  
  // Update internal state when props change
  useEffect(() => {
    setValue(`${currentSortBy}-${currentSortOrder}`);
  }, [currentSortBy, currentSortOrder]);
  
  const handleValueChange = (newValue: string) => {
    setValue(newValue);
    
    // Split the value to get sortBy and sortOrder
    const [sortBy, sortOrder] = newValue.split('-');
    
    onApplySort({
      sortBy,
      sortOrder,
    });
  };
  
  const getSortLabel = () => {
    switch (value) {
      case 'createdAt-desc':
        return 'Newest';
      case 'createdAt-asc':
        return 'Oldest';
      case 'price-asc':
        return 'Price: Low to High';
      case 'price-desc':
        return 'Price: High to Low';
      case 'name-asc':
        return 'Name: A to Z';
      case 'name-desc':
        return 'Name: Z to A';
      default:
        return 'Sort';
    }
  };
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="min-w-[140px]">
          <ArrowUpDown className="h-4 w-4 mr-2" />
          {getSortLabel()}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuRadioGroup value={value} onValueChange={handleValueChange}>
          <DropdownMenuRadioItem value="createdAt-desc">Newest</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="createdAt-asc">Oldest</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="price-asc">Price: Low to High</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="price-desc">Price: High to Low</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="name-asc">Name: A to Z</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="name-desc">Name: Z to A</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}