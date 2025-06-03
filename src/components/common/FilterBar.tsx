import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Search, X } from 'lucide-react';
import { ReactNode } from 'react';

interface FilterOption {
  label: string;
  value: string;
}

interface FilterProps<T extends Record<string, string>> {
  searchPlaceholder?: string;
  searchValue: string;
  onSearchChange: (value: string) => void;
  filters?: {
    [K in keyof T]?: {
      label: string;
      options: FilterOption[];
      value: string;
      onChange: (value: string) => void;
    };
  };
  onReset?: () => void;
  children?: ReactNode;
}

export function FilterBar<T extends Record<string, string>>({
  searchPlaceholder = 'Search...',
  searchValue,
  onSearchChange,
  filters,
  onReset,
  children,
}: FilterProps<T>) {
  return (
    <div className="mb-6 flex flex-col gap-4 rounded-lg border p-4 md:flex-row md:items-center">
      <div className="relative flex-1">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder={searchPlaceholder}
          className="pl-8"
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      
      {filters && Object.entries(filters).length > 0 && (
        <div className="flex flex-wrap gap-2">
          {Object.entries(filters).map(([key, filter]) => (
            <Select
              key={key}
              value={filter.value}
              onValueChange={filter.onChange}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={filter.label} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All {filter.label}</SelectItem>
                {filter.options.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ))}
        </div>
      )}
      
      {children}
      
      {onReset && (
        <Button variant="ghost" size="sm" onClick={onReset}>
          <X className="mr-2 h-4 w-4" />
          Reset
        </Button>
      )}
    </div>
  );
}