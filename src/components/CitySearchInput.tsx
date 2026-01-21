import * as React from 'react';
import { Check, ChevronsUpDown, Loader2, Plane, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Label } from '@/components/ui/label';


export interface City {
    name: string;
    code: string;
    country: string;
}

interface CitySearchInputProps {
    id?: string;
    label?: string;
    value: string;
    onChange: (value: string) => void;
    cities?: City[]; // Made optional
    placeholder?: string;
    className?: string;
    onSearch?: (query: string) => Promise<City[]>; // New prop for async search
}

export function CitySearchInput({
    id,
    label,
    value,
    onChange,
    cities = [],
    placeholder = 'Select city...',
    className,
    onSearch,
}: CitySearchInputProps) {
    const [open, setOpen] = React.useState(false);
    const [searchQuery, setSearchQuery] = React.useState('');
    const [loading, setLoading] = React.useState(false);
    const [asyncCities, setAsyncCities] = React.useState<City[]>([]);

    // Internal debounced query state handling manually since we might not have a hook
    const [debouncedQuery, setDebouncedQuery] = React.useState(searchQuery);

    React.useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedQuery(searchQuery);
        }, 300); // 300ms debounce

        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Effect to fetch suggestions when debounced query changes
    React.useEffect(() => {
        if (!onSearch) return;

        const fetchCities = async () => {
            if (!debouncedQuery) {
                setAsyncCities([]);
                return;
            }

            setLoading(true);
            try {
                const results = await onSearch(debouncedQuery);
                setAsyncCities(results);
            } catch (error) {
                console.error('Failed to fetch cities:', error);
                setAsyncCities([]);
            } finally {
                setLoading(false);
            }
        };

        fetchCities();
    }, [debouncedQuery, onSearch]);

    // Determine which list to show
    const displayCities = onSearch ? asyncCities : cities;

    // Client-side filtering if NOT using async search
    const filteredCities = React.useMemo(() => {
        if (onSearch) return displayCities; // Async search already handles filtering
        if (!searchQuery) return cities;
        const lowerQuery = searchQuery.toLowerCase();
        return cities.filter(
            (city) =>
                city.name.toLowerCase().includes(lowerQuery) ||
                city.code.toLowerCase().includes(lowerQuery) ||
                city.country.toLowerCase().includes(lowerQuery)
        );
    }, [cities, searchQuery, onSearch, displayCities]);

    // Handle clearing the input
    const handleClear = (e: React.MouseEvent) => {
        e.stopPropagation();
        onChange('');
        setOpen(false);
    };

    return (
        <div className={cn("flex flex-col gap-2", className)}>
            {label && <Label htmlFor={id} className="text-sm font-medium">{label}</Label>}
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <div className="relative w-full">
                        <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={open}
                            id={id}
                            className="w-full justify-between h-12 text-left font-normal pl-3 pr-10"
                            onClick={() => setOpen(true)}
                        >
                            <span className="truncate">
                                {value ? value : <span className="text-muted-foreground">{placeholder}</span>}
                            </span>
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50 absolute right-3" />
                        </Button>
                        {value && (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="absolute right-8 top-1/2 -translate-y-1/2 h-8 w-8 text-muted-foreground hover:text-foreground"
                                onClick={handleClear}
                            >
                                <X className="h-4 w-4" />
                                <span className="sr-only">Clear</span>
                            </Button>
                        )}
                    </div>
                </PopoverTrigger>
                <PopoverContent className="w-[300px] p-0" align="start">
                    <Command shouldFilter={!onSearch}> {/* Disable local filtering if async */}
                        <CommandInput
                            placeholder="Search cities..."
                            value={searchQuery}
                            onValueChange={setSearchQuery}
                        />
                        <CommandList>
                            {loading && (
                                <div className="py-6 text-center text-sm text-muted-foreground flex items-center justify-center">
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Loading...
                                </div>
                            )}
                            {!loading && filteredCities.length === 0 && (
                                <CommandEmpty>No city found.</CommandEmpty>
                            )}
                            {!loading && (
                                <CommandGroup>
                                    {filteredCities.map((city) => (
                                        <CommandItem
                                            key={city.code}
                                            value={`${city.name} (${city.code})`}
                                            onSelect={(currentValue) => {
                                                onChange(currentValue);
                                                setOpen(false);
                                            }}
                                        >
                                            <div className="flex flex-col">
                                                <span className="font-medium">
                                                    {city.name} ({city.code})
                                                </span>
                                                <span className="text-xs text-gray-500">
                                                    {city.country}
                                                </span>
                                            </div>
                                            <Check
                                                className={cn(
                                                    'ml-auto h-4 w-4',
                                                    value === `${city.name} (${city.code})` ? 'opacity-100' : 'opacity-0'
                                                )}
                                            />
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            )}
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>
        </div>
    );
}
