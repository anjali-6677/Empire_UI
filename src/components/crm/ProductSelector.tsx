import React from 'react';
import { ExternalLink, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Product, Category, Unit } from '../../domain/types';

interface ProductSelectorProps {
  productId?: string;
  categoryId?: string;
  onSelectProduct: (product: Product) => void;
  products: Product[];
  categories: Category[];
  units: Unit[];
  disabled?: boolean;
}

export const ProductSelector: React.FC<ProductSelectorProps> = ({
  productId,
  categoryId,
  onSelectProduct,
  products = [],
  categories: _categories = [],
  units: _units = [],
  disabled = false,
}) => {
  const navigate = useNavigate();

  // Category-strict filtering
  const filteredProducts = categoryId
    ? products.filter((p) => p.categoryId === categoryId && p.isActive !== false)
    : [];

  if (!categoryId) {
    return (
      <select
        disabled
        className="w-full px-2.5 py-1.5 bg-slate-100 border border-slate-200 rounded-lg text-xs font-semibold text-slate-400 cursor-not-allowed"
      >
        <option>Select a category first...</option>
      </select>
    );
  }

  if (filteredProducts.length === 0) {
    return (
      <div className="flex flex-col gap-1">
        <select
          disabled
          className="w-full px-2.5 py-1.5 bg-amber-50/50 border border-amber-200 rounded-lg text-xs font-semibold text-amber-800 opacity-80"
        >
          <option>No active materials found in this category</option>
        </select>
        <div className="flex items-center justify-between text-[11px] px-1 text-slate-500">
          <span className="flex items-center gap-1">
            <AlertCircle className="h-3 w-3 text-amber-600" /> Category empty
          </span>
          <button
            type="button"
            onClick={() => navigate('/masters/products')}
            className="inline-flex items-center gap-0.5 text-[#AB9570] hover:underline font-bold"
          >
            <ExternalLink className="h-3 w-3" /> Open Product Master
          </button>
        </div>
      </div>
    );
  }

  return (
    <select
      value={productId || ''}
      disabled={disabled}
      onChange={(e) => {
        const prod = filteredProducts.find((p) => p.id === e.target.value);
        if (prod) onSelectProduct(prod);
      }}
      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#AB9570]"
    >
      <option value="">-- Select Material from Category --</option>
      {filteredProducts.map((p) => (
        <option key={p.id} value={p.id}>
          {p.name} ({p.code}) - ₹{p.basePrice}/{p.unitSymbol || 'unit'}
        </option>
      ))}
    </select>
  );
};
