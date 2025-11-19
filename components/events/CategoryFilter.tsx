'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { logger } from '@/lib/utils/logger';
import { Category } from '@/types/event';

interface CategoryFilterProps {
  selectedCategory?: number | null;
  onCategoryChange: (categoryId: number | null) => void;
  className?: string;
}

/**
 * CategoryFilter Component
 *
 * Displays horizontally scrollable category chips for filtering events.
 *
 * Features:
 * - Fetches categories from API
 * - Horizontal scroll on mobile
 * - Active state indication
 * - "All Categories" option
 * - Loading state
 * - Icon support for categories
 *
 * @example
 * ```tsx
 * <CategoryFilter
 *   selectedCategory={categoryId}
 *   onCategoryChange={handleCategoryChange}
 * />
 * ```
 */
export function CategoryFilter({
  selectedCategory,
  onCategoryChange,
  className
}: CategoryFilterProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      // TODO: Replace with actual API endpoint when available
      // For now, using mock data
      const mockCategories: Category[] = [
        { id: 1, name: 'Music', slug: 'music', icon: '🎵' },
        { id: 2, name: 'Sports', slug: 'sports', icon: '⚽' },
        { id: 3, name: 'Arts & Culture', slug: 'arts-culture', icon: '🎨' },
        { id: 4, name: 'Food & Drink', slug: 'food-drink', icon: '🍽️' },
        { id: 5, name: 'Business', slug: 'business', icon: '💼' },
        { id: 6, name: 'Tech', slug: 'tech', icon: '💻' },
        { id: 7, name: 'Education', slug: 'education', icon: '📚' },
        { id: 8, name: 'Health', slug: 'health', icon: '🏥' },
        { id: 9, name: 'Community', slug: 'community', icon: '👥' },
        { id: 10, name: 'Entertainment', slug: 'entertainment', icon: '🎬' },
      ];
      setCategories(mockCategories);
    } catch (error) {
      logger.error('Failed to fetch categories', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className={cn('flex gap-2 overflow-x-auto pb-2', className)}>
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="h-10 w-24 animate-pulse rounded-full bg-gray-200"
          />
        ))}
      </div>
    );
  }

  return (
    <div className={cn('relative', className)}>
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {/* All Categories Button */}
        <button
          onClick={() => onCategoryChange(null)}
          className={cn(
            'flex-shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-all',
            'border-2',
            selectedCategory === null
              ? 'border-brand-primary bg-brand-primary text-white'
              : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50'
          )}
        >
          All Categories
        </button>

        {/* Category Chips */}
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => onCategoryChange(category.id)}
            className={cn(
              'flex flex-shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all',
              'border-2',
              selectedCategory === category.id
                ? 'border-brand-primary bg-brand-primary text-white'
                : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50'
            )}
          >
            {category.icon && <span>{category.icon}</span>}
            <span>{category.name}</span>
          </button>
        ))}
      </div>

      {/* Gradient fade on right for scroll indication */}
      <div className="pointer-events-none absolute right-0 top-0 h-full w-8 bg-gradient-to-l from-white to-transparent" />

      {/* Custom scrollbar styles */}
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
