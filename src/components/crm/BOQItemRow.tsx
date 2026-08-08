import React from 'react';
import { Trash2, Copy, ChevronUp, ChevronDown } from 'lucide-react';
import { BOQItem, Category, Product, Unit } from '../../domain/types';
import { ProductSelector } from './ProductSelector';
import { formatIndianCurrency } from '../../utils/format';

interface BOQItemRowProps {
  item: BOQItem;
  index: number;
  onUpdate: (updated: BOQItem) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  categories: Category[];
  products: Product[];
  units: Unit[];
  readOnly?: boolean;
}

export const BOQItemRow: React.FC<BOQItemRowProps> = ({
  item,
  index,
  onUpdate,
  onDelete,
  onDuplicate,
  onMoveUp,
  onMoveDown,
  categories = [],
  products = [],
  units = [],
  readOnly = false,
}) => {
  const handleProductSelect = (prod: Product) => {
    const qty = item.quantity || 1;
    const matCost = qty * prod.basePrice;
    const total = matCost + (item.labourCost || 0) + (item.installationCost || 0) + (item.otherCost || 0);

    onUpdate({
      ...item,
      productId: prod.id,
      productName: prod.name,
      description: item.description || prod.name,
      categoryId: prod.categoryId || item.categoryId,
      categoryName: categories.find((c) => c.id === prod.categoryId)?.name || item.categoryName,
      unit: prod.unitSymbol || item.unit,
      baseRate: prod.basePrice,
      materialCost: matCost,
      totalCost: total,
    });
  };

  const handleCategoryChange = (catId: string) => {
    const cat = categories.find((c) => c.id === catId);
    // Check if currently selected product belongs to the new category
    const selectedProd = products.find((p) => p.id === item.productId);
    const prodMatchesNewCat = selectedProd && selectedProd.categoryId === catId;

    onUpdate({
      ...item,
      categoryId: catId,
      categoryName: cat?.name || '',
      productId: prodMatchesNewCat ? item.productId : undefined,
      productName: prodMatchesNewCat ? item.productName : '',
      baseRate: prodMatchesNewCat ? item.baseRate : 0,
      materialCost: prodMatchesNewCat ? item.materialCost : 0,
      totalCost: prodMatchesNewCat
        ? item.totalCost
        : (item.labourCost || 0) + (item.installationCost || 0) + (item.otherCost || 0),
    });
  };

  const handleFieldChange = (field: keyof BOQItem, val: any) => {
    const updated = { ...item, [field]: val };
    const qty = field === 'quantity' ? parseFloat(val) || 0 : item.quantity;
    const rate = field === 'baseRate' ? parseFloat(val) || 0 : item.baseRate;
    const matCost = qty * rate;
    const labCost = field === 'labourCost' ? parseFloat(val) || 0 : item.labourCost || 0;
    const instCost = field === 'installationCost' ? parseFloat(val) || 0 : item.installationCost || 0;
    const othCost = field === 'otherCost' ? parseFloat(val) || 0 : item.otherCost || 0;

    updated.quantity = qty;
    updated.baseRate = rate;
    updated.materialCost = matCost;
    updated.labourCost = labCost;
    updated.installationCost = instCost;
    updated.otherCost = othCost;
    updated.totalCost = matCost + labCost + instCost + othCost;

    onUpdate(updated);
  };

  if (readOnly) {
    return (
      <tr className="border-b border-slate-100 hover:bg-slate-50/60 text-xs">
        <td className="py-2.5 px-3 font-mono text-slate-500">{index + 1}</td>
        <td className="py-2.5 px-3">
          <span className="capitalize font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
            {item.itemType}
          </span>
        </td>
        <td className="py-2.5 px-3">
          <div className="font-bold text-slate-900">{item.productName || item.description}</div>
          <div className="text-[11px] text-slate-500">{item.categoryName}</div>
        </td>
        <td className="py-2.5 px-3 text-slate-600 max-w-[180px] truncate">{item.description}</td>
        <td className="py-2.5 px-3 text-right font-mono font-semibold text-slate-800">
          {item.quantity} {item.unit}
        </td>
        <td className="py-2.5 px-3 text-right font-mono text-slate-700">{formatIndianCurrency(item.baseRate)}</td>
        <td className="py-2.5 px-3 text-right font-mono text-slate-700">{formatIndianCurrency(item.labourCost)}</td>
        <td className="py-2.5 px-3 text-right font-mono text-slate-700">{formatIndianCurrency(item.installationCost)}</td>
        <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">{formatIndianCurrency(item.totalCost)}</td>
      </tr>
    );
  }

  return (
    <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-sm space-y-2 text-xs">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2">
        <div className="flex items-center gap-2">
          <span className="font-mono font-bold text-slate-400">#{index + 1}</span>

          {/* Item Type */}
          <select
            value={item.itemType}
            onChange={(e) => handleFieldChange('itemType', e.target.value)}
            className="px-2 py-1 bg-slate-50 border border-slate-200 rounded text-xs font-bold text-slate-800 focus:border-[#AB9570]"
          >
            <option value="material">Material</option>
            <option value="labour">Labour Work</option>
            <option value="service">Service / Consultancy</option>
            <option value="custom">Custom Item</option>
            <option value="transportation">Transportation / Freight</option>
            <option value="subcontract">Subcontract Work</option>
          </select>

          {/* Category */}
          <select
            value={item.categoryId || ''}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className="px-2 py-1 bg-slate-50 border border-slate-200 rounded text-xs font-semibold text-slate-700 focus:border-[#AB9570]"
          >
            <option value="">-- Select Category --</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1">
          {onMoveUp && (
            <button type="button" onClick={onMoveUp} className="p-1 text-slate-400 hover:text-slate-700" title="Move Up">
              <ChevronUp className="h-3.5 w-3.5" />
            </button>
          )}
          {onMoveDown && (
            <button type="button" onClick={onMoveDown} className="p-1 text-slate-400 hover:text-slate-700" title="Move Down">
              <ChevronDown className="h-3.5 w-3.5" />
            </button>
          )}
          <button type="button" onClick={onDuplicate} title="Duplicate Row" className="p-1 text-slate-400 hover:text-[#AB9570]">
            <Copy className="h-3.5 w-3.5" />
          </button>
          <button type="button" onClick={onDelete} title="Delete Row" className="p-1 text-slate-400 hover:text-rose-600">
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Product Picker & Description */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <div>
          <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">
            Material Master {item.itemType !== 'material' && '(Optional for Non-Material)'}
          </label>
          <ProductSelector
            productId={item.productId}
            categoryId={item.categoryId}
            onSelectProduct={handleProductSelect}
            products={products}
            categories={categories}
            units={units}
          />
        </div>
        <div>
          <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Specification / Work Details *</label>
          <input
            type="text"
            value={item.description}
            onChange={(e) => handleFieldChange('description', e.target.value)}
            placeholder="Detailed specification or scope of work..."
            className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 font-medium focus:border-[#AB9570]"
          />
        </div>
      </div>

      {/* Numeric Cost Controls */}
      <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 pt-1 border-t border-slate-100">
        <div>
          <label className="block text-[10px] font-semibold text-slate-500">Qty</label>
          <input
            type="number"
            value={item.quantity || ''}
            onChange={(e) => handleFieldChange('quantity', e.target.value)}
            placeholder="1"
            className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded font-mono font-bold text-slate-900 focus:border-[#AB9570] text-xs"
          />
        </div>

        <div>
          <label className="block text-[10px] font-semibold text-slate-500">Unit</label>
          <select
            value={item.unit}
            onChange={(e) => handleFieldChange('unit', e.target.value)}
            className="w-full px-1.5 py-1 bg-slate-50 border border-slate-200 rounded text-slate-800 text-xs font-semibold focus:border-[#AB9570]"
          >
            {units.map((u) => (
              <option key={u.id} value={u.symbol}>
                {u.symbol} ({u.name})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-semibold text-slate-500">Base Rate (₹)</label>
          <input
            type="number"
            value={item.baseRate || ''}
            onChange={(e) => handleFieldChange('baseRate', e.target.value)}
            placeholder="0"
            className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded font-mono font-bold text-slate-900 focus:border-[#AB9570] text-xs"
          />
        </div>

        <div>
          <label className="block text-[10px] font-semibold text-slate-500">Labour (₹)</label>
          <input
            type="number"
            value={item.labourCost || ''}
            onChange={(e) => handleFieldChange('labourCost', e.target.value)}
            placeholder="0"
            className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded font-mono text-slate-900 focus:border-[#AB9570] text-xs"
          />
        </div>

        <div>
          <label className="block text-[10px] font-semibold text-slate-500">Installation (₹)</label>
          <input
            type="number"
            value={item.installationCost || ''}
            onChange={(e) => handleFieldChange('installationCost', e.target.value)}
            placeholder="0"
            className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded font-mono text-slate-900 focus:border-[#AB9570] text-xs"
          />
        </div>

        <div>
          <label className="block text-[10px] font-bold text-slate-600">Line Total (₹)</label>
          <div className="px-2 py-1 bg-slate-100 border border-slate-200 rounded font-mono font-extrabold text-[#AB9570] text-right text-xs">
            {formatIndianCurrency(item.totalCost || 0)}
          </div>
        </div>
      </div>
    </div>
  );
};
