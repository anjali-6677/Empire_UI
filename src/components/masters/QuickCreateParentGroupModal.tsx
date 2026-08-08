import React, { useState } from 'react';
import { X, Layers } from 'lucide-react';
import { Button } from '../ui/Button';

export interface QuickCreateParentGroupModalProps {
  isOpen: boolean;
  initialName?: string;
  onClose: () => void;
  onSave: (group: { name: string; description?: string }) => void;
}

export const QuickCreateParentGroupModal: React.FC<QuickCreateParentGroupModalProps> = ({
  isOpen,
  initialName = '',
  onClose,
  onSave,
}) => {
  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Parent Group Name is required.');
      return;
    }
    setError('');
    onSave({ name: name.trim(), description: description.trim() || undefined });
    setName('');
    setDescription('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-lg shadow-xl border border-[#D9DEE7] w-full max-w-md overflow-hidden">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-[#D9DEE7] flex items-center justify-between bg-[#F6F7F9]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md bg-[#F1ECE2] text-[#B39A6A] flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#172033]">Quick Create Parent Group</h3>
              <p className="text-xs text-[#6E7889]">Add a new top-level controlled parent group</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#6E7889] hover:text-[#172033] p-1 rounded-md hover:bg-[#F1F3F6] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#172033] mb-1">
              Parent Group Name <span className="text-[#B35E62]">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError('');
              }}
              placeholder="e.g. Civil & Architectural, MEP Services"
              className={`w-full px-3 py-2 text-sm text-[#172033] bg-white border ${
                error ? 'border-[#B35E62]' : 'border-[#D9DEE7] focus:border-[#7186A2]'
              } rounded-md outline-none focus:ring-2 focus:ring-[#7186A2]/20`}
              autoFocus
            />
            {error && <p className="mt-1 text-xs text-[#B35E62] font-medium">{error}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#172033] mb-1">
              Description <span className="text-[#6E7889] font-normal">(Optional)</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Brief description of categories grouped under this parent..."
              className="w-full px-3 py-2 text-sm text-[#172033] bg-white border border-[#D9DEE7] focus:border-[#7186A2] rounded-md outline-none focus:ring-2 focus:ring-[#7186A2]/20 resize-none"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-[#D9DEE7] flex items-center justify-end gap-2.5">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-[#B39A6A] hover:bg-[#9E865A] text-[#172033] font-semibold border-none"
            >
              Save Parent Group
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
