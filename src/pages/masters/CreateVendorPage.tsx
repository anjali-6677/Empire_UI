import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useERPStore } from '../../store/ERPStoreContext';
import { Vendor } from '../../domain/types';
import { Button } from '../../components/ui/Button';
import { Store, ArrowLeft, Save, AlertTriangle, ShieldCheck } from 'lucide-react';

export const CreateVendorPage: React.FC = () => {
  const navigate = useNavigate();
  const { vendorId } = useParams<{ vendorId?: string }>();
  const { state, addItem, updateItem } = useERPStore();

  const isEditMode = Boolean(vendorId);
  const vendors = state.vendors || [];
  const categories = state.categories || [];
  const existingVendor = vendors.find((v) => v.id === vendorId);

  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [approvedCategoryIds, setApprovedCategoryIds] = useState<string[]>([]);
  const [gstin, setGstin] = useState('');
  const [pan, setPan] = useState('');
  const [city, setCity] = useState('');
  const [stateName, setStateName] = useState('');
  const [address, setAddress] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [paymentTermsDays, setPaymentTermsDays] = useState<number>(30);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isEditMode && existingVendor) {
      setCode(existingVendor.code);
      setName(existingVendor.name);
      setApprovedCategoryIds(
        existingVendor.approvedCategoryIds ||
          categories.filter((c) => c.name === existingVendor.category).map((c) => c.id)
      );
      setGstin(existingVendor.gstin);
      setPan(existingVendor.pan || '');
      setCity(existingVendor.city);
      setStateName(existingVendor.state || '');
      setAddress(existingVendor.address || '');
      setContactPerson(existingVendor.contactPerson);
      setPhone(existingVendor.phone);
      setEmail(existingVendor.email);
      setPaymentTermsDays(existingVendor.paymentTermsDays || 30);
    } else {
      setCode(`VEN-${String(vendors.length + 1).padStart(3, '0')}`);
      if (categories.length > 0) setApprovedCategoryIds([categories[0].id]);
    }
  }, [isEditMode, existingVendor, vendors.length, categories]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!code.trim() || !name.trim()) {
      setErrorMessage('Vendor code and legal name are required.');
      return;
    }

    if (approvedCategoryIds.length === 0) {
      setErrorMessage('Select at least one approved item category for this vendor.');
      return;
    }

    // Code uniqueness check
    const isDuplicate = vendors.some(
      (v) => v.code.toLowerCase() === code.trim().toLowerCase() && v.id !== vendorId
    );

    if (isDuplicate) {
      setErrorMessage(`Vendor code '${code}' already exists. Code must be unique.`);
      return;
    }

    const primaryCat = categories.find((c) => approvedCategoryIds.includes(c.id));

    if (isEditMode && vendorId) {
      updateItem('vendors', vendorId, {
        code: code.trim().toUpperCase(),
        name: name.trim(),
        category: primaryCat?.name || 'General Supply',
        approvedCategoryIds,
        gstin: gstin.trim(),
        pan: pan.trim(),
        city: city.trim(),
        state: stateName.trim(),
        address: address.trim(),
        contactPerson: contactPerson.trim(),
        phone: phone.trim(),
        email: email.trim(),
        paymentTermsDays,
      });
    } else {
      const newVendor: Vendor = {
        id: `ven-${Date.now()}`,
        code: code.trim().toUpperCase(),
        name: name.trim(),
        category: primaryCat?.name || 'General Supply',
        approvedCategoryIds,
        gstin: gstin.trim(),
        pan: pan.trim(),
        city: city.trim(),
        state: stateName.trim(),
        address: address.trim(),
        contactPerson: contactPerson.trim(),
        phone: phone.trim(),
        email: email.trim(),
        paymentTermsDays,
        status: 'empanelled',
        rating: '4.5 ★',
        active: true,
        complianceStatus: 'Active',
      };
      addItem('vendors', newVendor);
    }

    navigate('/masters/vendors');
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6 bg-[#F6F7F9] min-h-screen">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-[#D9DEE7] pb-4">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => navigate('/masters/vendors')} className="gap-1">
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-[#172033] flex items-center gap-2">
              <Store className="h-6 w-6 text-[#B39A6A]" />
              {isEditMode ? `Edit Vendor: ${existingVendor?.name || ''}` : 'Add Vendor'}
            </h1>
            <p className="text-xs text-[#6E7889] mt-0.5">
              Manage supplier details, categories, contacts and payment terms.
            </p>
          </div>
        </div>
      </div>

      {errorMessage && (
        <div className="p-3.5 bg-[#F8E9EA] border border-[#B35E62]/30 rounded-md text-[#B35E62] text-xs flex items-center gap-2 font-medium">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="bg-white border border-[#D9DEE7] rounded-lg p-6 shadow-sm space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#172033] mb-1">
              Vendor Code <span className="text-[#B35E62]">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. VEN-CENTURY"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full px-3 py-2 text-sm font-mono text-[#172033] bg-white border border-[#D9DEE7] focus:border-[#7186A2] rounded-md outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#172033] mb-1">
              Vendor Legal Name <span className="text-[#B35E62]">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Century Plyboards (India) Ltd."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 text-sm text-[#172033] bg-white border border-[#D9DEE7] focus:border-[#7186A2] rounded-md outline-none"
            />
          </div>
        </div>

        {/* Multi-Select Approved Categories */}
        <div>
          <label className="block text-xs font-semibold text-[#172033] mb-1.5 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#4F8A72]" />
            Approved Item Categories <span className="text-[#B35E62]">*</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 border border-[#D9DEE7] rounded-md p-3 bg-[#F6F7F9] max-h-44 overflow-y-auto">
            {categories.map((c) => {
              const isChecked = approvedCategoryIds.includes(c.id);
              return (
                <label
                  key={c.id}
                  className={`flex items-center gap-2 p-2 rounded-md border text-xs cursor-pointer transition ${
                    isChecked
                      ? 'bg-white border-[#B39A6A] font-bold text-[#172033]'
                      : 'bg-white/70 border-[#D9DEE7] text-[#263247] hover:border-[#7186A2]'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={(e) => {
                      if (e.target.checked) setApprovedCategoryIds([...approvedCategoryIds, c.id]);
                      else setApprovedCategoryIds(approvedCategoryIds.filter((id) => id !== c.id));
                    }}
                    className="rounded text-[#B39A6A]"
                  />
                  <span>
                    {c.code} - {c.name}
                  </span>
                </label>
              );
            })}
          </div>
          <p className="mt-1 text-[11px] text-[#6E7889]">
            Only suppliers approved for a category will be selectable on products under that category.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#172033] mb-1">GSTIN Number</label>
            <input
              type="text"
              placeholder="e.g. 27AAACC1234H1Z5"
              value={gstin}
              onChange={(e) => setGstin(e.target.value)}
              className="w-full px-3 py-2 text-sm font-mono text-[#172033] bg-white border border-[#D9DEE7] focus:border-[#7186A2] rounded-md outline-none uppercase"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#172033] mb-1">PAN Number</label>
            <input
              type="text"
              placeholder="e.g. AAACC1234H"
              value={pan}
              onChange={(e) => setPan(e.target.value)}
              className="w-full px-3 py-2 text-sm font-mono text-[#172033] bg-white border border-[#D9DEE7] focus:border-[#7186A2] rounded-md outline-none uppercase"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#172033] mb-1">Standard Credit Days</label>
            <input
              type="number"
              min={0}
              value={paymentTermsDays}
              onChange={(e) => setPaymentTermsDays(parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 text-sm font-semibold text-[#172033] bg-white border border-[#D9DEE7] focus:border-[#7186A2] rounded-md outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#172033] mb-1">
              Primary Contact Name <span className="text-[#B35E62]">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Rajesh Sharma"
              value={contactPerson}
              onChange={(e) => setContactPerson(e.target.value)}
              className="w-full px-3 py-2 text-sm text-[#172033] bg-white border border-[#D9DEE7] focus:border-[#7186A2] rounded-md outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#172033] mb-1">
              Phone Number <span className="text-[#B35E62]">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. +91 98200 12345"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3 py-2 text-sm text-[#172033] bg-white border border-[#D9DEE7] focus:border-[#7186A2] rounded-md outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#172033] mb-1">
              Email Address <span className="text-[#B35E62]">*</span>
            </label>
            <input
              type="email"
              required
              placeholder="e.g. sales@centuryply.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 text-sm text-[#172033] bg-white border border-[#D9DEE7] focus:border-[#7186A2] rounded-md outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#172033] mb-1">
              City / Location <span className="text-[#B35E62]">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Mumbai"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full px-3 py-2 text-sm text-[#172033] bg-white border border-[#D9DEE7] focus:border-[#7186A2] rounded-md outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#172033] mb-1">State / Province</label>
            <input
              type="text"
              placeholder="e.g. Maharashtra"
              value={stateName}
              onChange={(e) => setStateName(e.target.value)}
              className="w-full px-3 py-2 text-sm text-[#172033] bg-white border border-[#D9DEE7] focus:border-[#7186A2] rounded-md outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#172033] mb-1">Full Registered Address</label>
          <textarea
            rows={2}
            placeholder="Factory / Registered office address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full px-3 py-2 text-sm text-[#172033] bg-white border border-[#D9DEE7] focus:border-[#7186A2] rounded-md outline-none resize-none"
          />
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#D9DEE7]">
          <Button type="button" variant="outline" onClick={() => navigate('/masters/vendors')}>
            Cancel
          </Button>
          <Button
            type="submit"
            className="bg-[#B39A6A] hover:bg-[#9E865A] text-[#172033] font-semibold border-none px-6 gap-2"
          >
            <Save className="h-4 w-4" /> Save Vendor
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateVendorPage;
