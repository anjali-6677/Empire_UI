import React from 'react';
import { FilterToolbar } from '../../common/FilterToolbar';

interface ProjectFiltersBarProps {
  searchTerm: string;
  onSearchChange: (val: string) => void;
  statusFilter: string;
  onStatusFilterChange: (val: string) => void;
  cityFilter: string;
  onCityFilterChange: (val: string) => void;
  availableCities: string[];
  onResetFilters: () => void;
}

export const ProjectFiltersBar: React.FC<ProjectFiltersBarProps> = ({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  cityFilter,
  onCityFilterChange,
  availableCities,
  onResetFilters,
}) => {
  const isFiltered = searchTerm !== '' || statusFilter !== 'all' || cityFilter !== 'all';

  const selectFilters = [
    {
      id: 'status',
      label: 'Status',
      value: statusFilter,
      onChange: onStatusFilterChange,
      options: [
        { value: 'all', label: 'All Statuses' },
        { value: 'draft', label: 'Draft Setup' },
        { value: 'planning', label: 'Planning' },
        { value: 'active', label: 'Active Execution' },
        { value: 'on_hold', label: 'On Hold' },
        { value: 'completed', label: 'Completed' },
        { value: 'cancelled', label: 'Cancelled' },
      ],
    },
  ];

  if (availableCities.length > 0) {
    selectFilters.push({
      id: 'city',
      label: 'City',
      value: cityFilter,
      onChange: onCityFilterChange,
      options: [
        { value: 'all', label: 'All Cities' },
        ...availableCities.map((city) => ({ value: city, label: city })),
      ],
    });
  }

  return (
    <FilterToolbar
      searchQuery={searchTerm}
      onSearchChange={onSearchChange}
      searchPlaceholder="Search by project name, code, client, or location..."
      selectFilters={selectFilters}
      onResetFilters={onResetFilters}
      hasActiveFilters={isFiltered}
    />
  );
};
