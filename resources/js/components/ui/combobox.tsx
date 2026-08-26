'use client';

import { SearchableSelect, SearchableSelectProps, SearchableSelectOption } from '@/components/ui/searchable-select';

export type ComboboxItem = SearchableSelectOption;

export interface ComboboxProps extends Omit<SearchableSelectProps, 'options'> {
    items: ComboboxItem[];
}

export function Combobox({ items, ...props }: ComboboxProps) {
    return <SearchableSelect options={items} {...props} />;
}

export { SearchableSelect };
