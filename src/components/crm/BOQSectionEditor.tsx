import React, { useState } from 'react';
import { Plus, FolderPlus, Trash2, Layers, ChevronDown, ChevronUp, Edit2, Copy, FileText } from 'lucide-react';
import { BOQSection, BOQItem, Category, Product, Unit } from '../../domain/types';
import { BOQItemRow } from './BOQItemRow';
import { formatIndianCurrency } from '../../utils/format';

interface BOQSectionEditorProps {
  sections: BOQSection[];
  onChange: (sections: BOQSection[]) => void;
  categories: Category[];
  products: Product[];
  units: Unit[];
  readOnly?: boolean;
}

export const BOQSectionEditor: React.FC<BOQSectionEditorProps> = ({
  sections = [],
  onChange,
  categories = [],
  products = [],
  units = [],
  readOnly = false,
}) => {
  const [newSectionName, setNewSectionName] = useState('');
  const [showAddSectionModal, setShowAddSectionModal] = useState(false);
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [editingSectionName, setEditingSectionName] = useState('');

  const handleAddSection = (name?: string) => {
    const secName = name || newSectionName;
    if (!secName.trim()) return;
    const newSec: BOQSection = {
      id: `sec-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name: secName.trim(),
      sortOrder: sections.length + 1,
      items: [],
    };
    onChange([...sections, newSec]);
    setNewSectionName('');
    setShowAddSectionModal(false);
  };

  const handleRenameSection = (secId: string) => {
    if (!editingSectionName.trim()) return;
    const updated = sections.map((sec) =>
      sec.id === secId ? { ...sec, name: editingSectionName.trim() } : sec
    );
    onChange(updated);
    setEditingSectionId(null);
    setEditingSectionName('');
  };

  const handleDuplicateSection = (secId: string) => {
    const sec = sections.find((s) => s.id === secId);
    if (!sec) return;
    const duplicated: BOQSection = {
      ...sec,
      id: `sec-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name: `${sec.name} (Copy)`,
      items: sec.items.map((item) => ({
        ...item,
        id: `item-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      })),
    };
    const secIdx = sections.findIndex((s) => s.id === secId);
    const newSecs = [...sections];
    newSecs.splice(secIdx + 1, 0, duplicated);
    onChange(newSecs);
  };

  const handleMoveSection = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= sections.length) return;
    const newSecs = [...sections];
    const [moved] = newSecs.splice(index, 1);
    newSecs.splice(targetIdx, 0, moved);
    onChange(newSecs);
  };

  const handleDeleteSection = (secId: string) => {
    if (window.confirm('Are you sure you want to delete this BOQ section and all its line items?')) {
      onChange(sections.filter((s) => s.id !== secId));
    }
  };

  const handleAddItemToSection = (secId: string) => {
    const newSecs = sections.map((sec) => {
      if (sec.id !== secId) return sec;
      const newItem: BOQItem = {
        id: `item-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        itemType: 'material',
        categoryId: categories[0]?.id || '',
        categoryName: categories[0]?.name || '',
        productName: '',
        description: '',
        quantity: 1,
        unit: 'sqft',
        baseRate: 0,
        materialCost: 0,
        labourCost: 0,
        installationCost: 0,
        otherCost: 0,
        totalCost: 0,
      };
      return { ...sec, items: [...sec.items, newItem] };
    });
    onChange(newSecs);
  };

  const handleUpdateItem = (secId: string, itemIdx: number, updatedItem: BOQItem) => {
    const newSecs = sections.map((sec) => {
      if (sec.id !== secId) return sec;
      const updatedItems = [...sec.items];
      updatedItems[itemIdx] = updatedItem;
      return { ...sec, items: updatedItems };
    });
    onChange(newSecs);
  };

  const handleDeleteItem = (secId: string, itemIdx: number) => {
    const newSecs = sections.map((sec) => {
      if (sec.id !== secId) return sec;
      return { ...sec, items: sec.items.filter((_, idx) => idx !== itemIdx) };
    });
    onChange(newSecs);
  };

  const handleDuplicateItem = (secId: string, itemIdx: number) => {
    const newSecs = sections.map((sec) => {
      if (sec.id !== secId) return sec;
      const itemToDup = sec.items[itemIdx];
      const dup: BOQItem = {
        ...itemToDup,
        id: `item-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        description: itemToDup.description ? `${itemToDup.description} (Copy)` : '',
      };
      const newItems = [...sec.items];
      newItems.splice(itemIdx + 1, 0, dup);
      return { ...sec, items: newItems };
    });
    onChange(newSecs);
  };

  const handleMoveItem = (secId: string, itemIdx: number, direction: 'up' | 'down') => {
    const newSecs = sections.map((sec) => {
      if (sec.id !== secId) return sec;
      const targetIdx = direction === 'up' ? itemIdx - 1 : itemIdx + 1;
      if (targetIdx < 0 || targetIdx >= sec.items.length) return sec;
      const items = [...sec.items];
      const [moved] = items.splice(itemIdx, 1);
      items.splice(targetIdx, 0, moved);
      return { ...sec, items };
    });
    onChange(newSecs);
  };

  const totalItemsCount = sections.reduce((acc, s) => acc + s.items.length, 0);
  const totalBOQCost = sections.reduce(
    (acc, s) => acc + s.items.reduce((secAcc, i) => secAcc + (i.totalCost || 0), 0),
    0
  );

  return (
    <div className="space-y-6 text-xs">
      {/* Header Summary & Add Section Action */}
      <div className="bg-[#121214] text-white p-4 rounded-xl flex flex-wrap items-center justify-between gap-3 shadow-md border border-slate-800">
        <div>
          <div className="text-[10px] uppercase tracking-wider text-[#AB9570] font-bold">BOQ Structure</div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Layers className="h-4 w-4 text-[#AB9570]" /> Bill of Quantities breakdown ({sections.length} Sections, {totalItemsCount} Line Items)
          </h3>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-[10px] text-slate-400">Total Base BOQ Cost</div>
            <div className="text-base font-mono font-extrabold text-[#AB9570]">
              {formatIndianCurrency(totalBOQCost)}
            </div>
          </div>

          {!readOnly && (
            <button
              type="button"
              onClick={() => setShowAddSectionModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-[#AB9570] hover:bg-[#927D5E] text-slate-950 font-bold rounded-lg shadow-sm"
            >
              <FolderPlus className="h-4 w-4" /> Add BOQ Section
            </button>
          )}
        </div>
      </div>

      {/* Add Section Inline Input Modal */}
      {showAddSectionModal && !readOnly && (
        <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl flex items-center gap-2">
          <input
            type="text"
            value={newSectionName}
            onChange={(e) => setNewSectionName(e.target.value)}
            placeholder="Enter section name (e.g. Joinery & Paneling, Flooring, Electrical)..."
            className="flex-1 px-3 py-2 bg-white border border-amber-300 rounded-lg text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#AB9570]"
            onKeyDown={(e) => e.key === 'Enter' && handleAddSection()}
            autoFocus
          />
          <button
            type="button"
            onClick={() => handleAddSection()}
            className="px-4 py-2 bg-[#AB9570] hover:bg-[#927D5E] text-slate-950 font-bold rounded-lg"
          >
            Add Section
          </button>
          <button
            type="button"
            onClick={() => setShowAddSectionModal(false)}
            className="px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded-lg"
          >
            Cancel
          </button>
        </div>
      )}

      {/* EMPTY STATE BUILDER FOR NEW ESTIMATES */}
      {sections.length === 0 && (
        <div className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-2xl p-10 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center mx-auto text-slate-400">
            <FileText className="h-6 w-6 stroke-[1.5]" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h4 className="font-bold text-slate-900 text-sm">No BOQ sections added yet</h4>
            <p className="text-slate-500 text-xs">
              Start creating custom BOQ sections tailored to this project's specifications and requirement scope.
            </p>
          </div>
          {!readOnly && (
            <button
              type="button"
              onClick={() => setShowAddSectionModal(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#AB9570] hover:bg-[#927D5E] text-slate-950 font-black rounded-xl shadow-md transition-transform active:scale-95"
            >
              <FolderPlus className="h-4 w-4 stroke-[2.5]" /> Add BOQ Section
            </button>
          )}
        </div>
      )}

      {/* Sections List */}
      {sections.map((sec, secIdx) => {
        const secTotalCost = sec.items.reduce((sum, item) => sum + (item.totalCost || 0), 0);
        const isEditingName = editingSectionId === sec.id;

        return (
          <div key={sec.id} className="bg-slate-50/70 border border-slate-200 rounded-xl p-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between border-b border-slate-200/80 pb-2 gap-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 font-mono font-bold flex items-center justify-center text-xs">
                  {secIdx + 1}
                </span>

                {isEditingName ? (
                  <div className="flex items-center gap-1">
                    <input
                      type="text"
                      value={editingSectionName}
                      onChange={(e) => setEditingSectionName(e.target.value)}
                      className="px-2 py-1 border border-[#AB9570] rounded bg-white text-xs font-bold text-slate-900"
                      onKeyDown={(e) => e.key === 'Enter' && handleRenameSection(sec.id)}
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => handleRenameSection(sec.id)}
                      className="px-2 py-1 bg-[#AB9570] text-slate-950 font-bold rounded text-xs"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingSectionId(null)}
                      className="px-2 py-1 bg-slate-200 text-slate-700 font-medium rounded text-xs"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-bold text-slate-900 text-xs">{sec.name}</h4>
                    {!readOnly && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingSectionId(sec.id);
                          setEditingSectionName(sec.name);
                        }}
                        className="p-0.5 text-slate-400 hover:text-slate-700"
                        title="Rename Section"
                      >
                        <Edit2 className="h-3 w-3" />
                      </button>
                    )}
                    <span className="text-[11px] text-slate-500">({sec.items.length} items)</span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3">
                <span className="font-mono font-bold text-slate-900">
                  Section Total: <span className="text-[#AB9570]">{formatIndianCurrency(secTotalCost)}</span>
                </span>

                {!readOnly && (
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={secIdx === 0}
                      onClick={() => handleMoveSection(secIdx, 'up')}
                      className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30"
                      title="Move Section Up"
                    >
                      <ChevronUp className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      disabled={secIdx === sections.length - 1}
                      onClick={() => handleMoveSection(secIdx, 'down')}
                      className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30"
                      title="Move Section Down"
                    >
                      <ChevronDown className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDuplicateSection(sec.id)}
                      className="p-1 text-slate-400 hover:text-[#AB9570]"
                      title="Duplicate Section"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteSection(sec.id)}
                      className="p-1 text-slate-400 hover:text-rose-600"
                      title="Delete Section"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Items in Section */}
            {sec.items.length === 0 ? (
              <div className="p-4 bg-white rounded-xl border border-dashed border-slate-300 text-center text-slate-400">
                No items in this section yet.{' '}
                {!readOnly && (
                  <button
                    type="button"
                    onClick={() => handleAddItemToSection(sec.id)}
                    className="text-[#AB9570] font-bold underline hover:text-[#927D5E]"
                  >
                    Click to add first line item
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                {sec.items.map((item, itemIdx) => (
                  <BOQItemRow
                    key={item.id}
                    item={item}
                    index={itemIdx}
                    onUpdate={(updated) => handleUpdateItem(sec.id, itemIdx, updated)}
                    onDelete={() => handleDeleteItem(sec.id, itemIdx)}
                    onDuplicate={() => handleDuplicateItem(sec.id, itemIdx)}
                    onMoveUp={itemIdx > 0 ? () => handleMoveItem(sec.id, itemIdx, 'up') : undefined}
                    onMoveDown={itemIdx < sec.items.length - 1 ? () => handleMoveItem(sec.id, itemIdx, 'down') : undefined}
                    categories={categories}
                    products={products}
                    units={units}
                    readOnly={readOnly}
                  />
                ))}
              </div>
            )}

            {/* Add Line Item Action */}
            {!readOnly && (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => handleAddItemToSection(sec.id)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-200 hover:bg-[#EFE9DE] text-slate-800 hover:text-slate-950 font-bold text-[11px] rounded-lg transition-colors"
                >
                  <Plus className="h-3.5 w-3.5" /> Add Row to {sec.name}
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
