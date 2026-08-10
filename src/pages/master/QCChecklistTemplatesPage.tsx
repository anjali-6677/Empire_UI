import React, { useState } from 'react';
import { useERPStore } from '../../store/ERPStoreContext';
import { QCChecklistTemplate, QCChecklistParameter } from '../../domain/types';
import { ListPageLayout } from '../../components/common/ListPageLayout';
import { PageHeader } from '../../components/common/PageHeader';
import { FilterToolbar } from '../../components/common/FilterToolbar';
import { DEFAULT_QC_TEMPLATES } from '../../data/defaultQCTemplates';
import {
  ClipboardCheck,
  Plus,
  Trash2,
  Sliders,
} from 'lucide-react';

export const QCChecklistTemplatesPage: React.FC = () => {
  const { state, addItem, updateItem } = useERPStore();

  const templates: QCChecklistTemplate[] = state.qcChecklistTemplates?.length
    ? state.qcChecklistTemplates
    : DEFAULT_QC_TEMPLATES;

  const categories = state.categories || [];

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [editingTemplate, setEditingTemplate] = useState<QCChecklistTemplate | null>(null);

  // Form State
  const [templateName, setTemplateName] = useState<string>('');
  const [categoryName, setCategoryName] = useState<string>(categories[0]?.name || 'Wooden Joinery & Millwork');
  const [parameters, setParameters] = useState<QCChecklistParameter[]>([
    { id: 'p1', parameterName: 'Brand Verification', expectedValue: 'Standard Specification', inspectionType: 'Pass / Fail', isRequired: true, sequence: 1 },
    { id: 'p2', parameterName: 'Dimensional Check', expectedValue: 'As per PO drawing', inspectionType: 'Numeric', tolerance: '±0.5mm', isRequired: true, sequence: 2 },
  ]);

  const filteredTemplates = templates.filter((tpl) => {
    const matchesCategory = selectedCategory === 'all' || tpl.categoryName === selectedCategory;
    const matchesSearch =
      searchQuery === '' ||
      tpl.templateName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tpl.categoryName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleOpenCreate = () => {
    setEditingTemplate(null);
    setTemplateName('');
    setCategoryName(categories[0]?.name || 'Wooden Joinery & Millwork');
    setParameters([
      { id: `p-${Date.now()}-1`, parameterName: 'Brand & Grade Verification', expectedValue: 'As per PO', inspectionType: 'Pass / Fail', isRequired: true, sequence: 1 },
      { id: `p-${Date.now()}-2`, parameterName: 'Surface & Physical Defect Inspection', expectedValue: 'Flawless condition', inspectionType: 'Visual Check', isRequired: true, sequence: 2 },
    ]);
    setModalOpen(true);
  };

  const handleOpenEdit = (tpl: QCChecklistTemplate) => {
    setEditingTemplate(tpl);
    setTemplateName(tpl.templateName);
    setCategoryName(tpl.categoryName);
    setParameters(tpl.parameters);
    setModalOpen(true);
  };

  const handleAddParameter = () => {
    const newParam: QCChecklistParameter = {
      id: `p-${Date.now()}`,
      parameterName: '',
      expectedValue: '',
      inspectionType: 'Pass / Fail',
      isRequired: true,
      sequence: parameters.length + 1,
    };
    setParameters([...parameters, newParam]);
  };

  const handleRemoveParameter = (id: string) => {
    setParameters(parameters.filter((p) => p.id !== id));
  };

  const handleParamChange = (id: string, key: keyof QCChecklistParameter, value: any) => {
    setParameters(
      parameters.map((p) => (p.id === id ? { ...p, [key]: value } : p))
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!templateName.trim()) return;

    if (editingTemplate) {
      updateItem('qcChecklistTemplates', editingTemplate.id, {
        templateName,
        categoryName,
        parameters,
      });
    } else {
      const newTemplate: QCChecklistTemplate = {
        id: `qc-tpl-${Date.now()}`,
        templateName,
        categoryName,
        isActive: true,
        parameters,
        createdAt: new Date().toISOString().split('T')[0],
        createdBy: 'Quality Manager',
      };
      addItem('qcChecklistTemplates', newTemplate);
    }

    setModalOpen(false);
  };

  return (
    <ListPageLayout>
      <PageHeader
        title="Quality Control Checklist Templates"
        subtitle="Configure material category inspection templates, parameters, expected standards, and tolerance limits."
        actions={
          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center px-4 py-2 text-xs font-bold text-slate-950 bg-[#AB9570] hover:bg-[#927D5E] rounded-lg shadow-sm"
          >
            <Plus className="w-4 h-4 mr-1.5" /> Create QC Template
          </button>
        }
      />

      <FilterToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search template name or material category..."
        selectFilters={[
          {
            id: 'category-filter',
            label: 'Category',
            value: selectedCategory,
            onChange: setSelectedCategory,
            options: [
              { value: 'all', label: 'All Categories' },
              ...categories.map((c) => ({ value: c.name, label: c.name })),
              { value: 'Laminate', label: 'Laminate' },
              { value: 'Glass & Mirrors', label: 'Glass & Mirrors' },
              { value: 'Hardware & Fittings', label: 'Hardware & Fittings' },
            ],
          },
        ]}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
        {filteredTemplates.map((tpl) => (
          <div key={tpl.id} className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-bold text-gray-900 text-sm flex items-center">
                    <ClipboardCheck className="w-4 h-4 mr-1.5 text-[#AB9570]" /> {tpl.templateName}
                  </h3>
                  <span className="text-xs text-gray-500 font-medium">{tpl.categoryName}</span>
                </div>
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${tpl.isActive ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-gray-100 text-gray-600'}`}>
                  {tpl.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>

              <div className="mt-3 space-y-1.5 border-t border-gray-100 pt-3">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Inspection Parameters ({tpl.parameters.length})
                </p>
                {tpl.parameters.map((p, i) => (
                  <div key={p.id || i} className="flex justify-between items-center text-xs bg-gray-50/80 p-2 rounded border border-gray-100">
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-gray-700">{p.sequence}. {p.parameterName}</span>
                      <span className="px-1.5 py-0.2 rounded text-[10px] bg-slate-200 text-slate-800">{p.inspectionType}</span>
                    </div>
                    <span className="text-gray-500 text-[11px]">Req: <strong className="text-gray-700">{p.expectedValue}</strong></span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end space-x-2 border-t border-gray-100 pt-3 mt-4">
              <button
                onClick={() => handleOpenEdit(tpl)}
                className="px-3 py-1 text-xs font-medium text-[#121214] bg-gray-100 hover:bg-gray-200 rounded transition-colors"
              >
                Edit Template
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Template Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-gray-900 flex items-center">
              <Sliders className="w-5 h-5 mr-2 text-[#AB9570]" />
              {editingTemplate ? 'Edit Quality Checklist Template' : 'Create Quality Checklist Template'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Template Name *</label>
                  <input
                    type="text"
                    value={templateName}
                    onChange={(e) => setTemplateName(e.target.value)}
                    required
                    placeholder="e.g. Plywood Incoming QC Inspection"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Material Category *</label>
                  <select
                    value={categoryName}
                    onChange={(e) => setCategoryName(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                    <option value="Laminate">Laminate</option>
                    <option value="Glass & Mirrors">Glass & Mirrors</option>
                    <option value="Hardware & Fittings">Hardware & Fittings</option>
                  </select>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">Quality Inspection Parameters</h4>
                  <button
                    type="button"
                    onClick={handleAddParameter}
                    className="inline-flex items-center px-2.5 py-1 text-xs font-semibold text-[#121214] bg-amber-50 border border-amber-200 rounded hover:bg-amber-100"
                  >
                    <Plus className="w-3.5 h-3.5 mr-1 text-[#AB9570]" /> Add Parameter
                  </button>
                </div>

                <div className="space-y-3">
                  {parameters.map((param) => (
                    <div key={param.id} className="p-3 bg-gray-50 rounded-lg border border-gray-200 grid grid-cols-12 gap-2 items-center text-xs">
                      <div className="col-span-4">
                        <label className="block text-[10px] text-gray-500 mb-0.5">Parameter Name</label>
                        <input
                          type="text"
                          value={param.parameterName}
                          onChange={(e) => handleParamChange(param.id, 'parameterName', e.target.value)}
                          placeholder="e.g. Thickness (mm)"
                          className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                        />
                      </div>

                      <div className="col-span-3">
                        <label className="block text-[10px] text-gray-500 mb-0.5">Inspection Type</label>
                        <select
                          value={param.inspectionType}
                          onChange={(e) => handleParamChange(param.id, 'inspectionType', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                        >
                          <option value="Text">Text</option>
                          <option value="Numeric">Numeric</option>
                          <option value="Pass / Fail">Pass / Fail</option>
                          <option value="Yes / No">Yes / No</option>
                          <option value="Range">Range</option>
                          <option value="Visual Check">Visual Check</option>
                        </select>
                      </div>

                      <div className="col-span-4">
                        <label className="block text-[10px] text-gray-500 mb-0.5">Expected Standard</label>
                        <input
                          type="text"
                          value={param.expectedValue}
                          onChange={(e) => handleParamChange(param.id, 'expectedValue', e.target.value)}
                          placeholder="e.g. 18.0mm / CenturyPly"
                          className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                        />
                      </div>

                      <div className="col-span-1 flex justify-center pt-3">
                        <button
                          type="button"
                          onClick={() => handleRemoveParameter(param.id)}
                          className="text-red-500 hover:text-red-700"
                          title="Remove Parameter"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-[#121214] hover:bg-[#252528] rounded-lg shadow-sm"
                >
                  Save Checklist Template
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </ListPageLayout>
  );
};

export default QCChecklistTemplatesPage;
