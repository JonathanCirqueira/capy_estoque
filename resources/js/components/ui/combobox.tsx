'use client';

import { SearchableSelect, SearchableSelectProps, SearchableSelectOption } from '@/components/ui/searchable-select';

export type ComboboxItem = SearchableSelectOption;

export interface ComboboxProps extends Omit<SearchableSelectProps, 'options'> {
    items?: ComboboxItem[];
    options?: ComboboxItem[];
}

export function Combobox({ items, options, ...props }: ComboboxProps) {
    return <SearchableSelect options={items ?? options ?? []} {...props} />;
}

export { SearchableSelect };
