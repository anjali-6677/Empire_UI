import { Client, Enquiry } from '../domain/types';

export interface ClientDisplayDetails {
  clientName: string;
  companyName: string;
  contactPerson: string;
  phone: string;
  email: string;
  billingAddress: string;
  gstin: string;
  clientCode: string;
}

/**
 * Single source of truth helper for formatting Client Master details.
 * Ensures consistent read-only display across all CRM views.
 */
export function getClientDisplayDetails(client?: Client | null): ClientDisplayDetails {
  if (!client) {
    return {
      clientName: 'Not available in Client Master',
      companyName: 'Not available in Client Master',
      contactPerson: 'Not available in Client Master',
      phone: 'Not available in Client Master',
      email: 'Not available in Client Master',
      billingAddress: 'Not available in Client Master',
      gstin: 'Not available in Client Master',
      clientCode: 'N/A',
    };
  }

  return {
    clientName: client.name || client.companyName || 'Not available in Client Master',
    companyName: client.companyName || 'N/A',
    contactPerson: client.contactPerson || client.name || 'Not available in Client Master',
    phone: client.phone || (client as any).mobile || 'Not available in Client Master',
    email: client.email || 'Not available in Client Master',
    billingAddress:
      client.address ||
      [client.city, client.state, (client as any).pincode].filter(Boolean).join(', ') ||
      'Not available in Client Master',
    gstin: client.gstin || (client as any).gstNumber || 'Not available in Client Master',
    clientCode: client.code || (client as any).clientCode || 'CLI-DEFAULT',
  };
}

/**
 * Normalizes Project Requirement string. Prevents single '.' dots from rendering.
 */
export function normalizeEnquiryRequirement(requirement?: string): string {
  if (!requirement || requirement.trim() === '.' || requirement.trim() === '') {
    return 'Requirement not entered';
  }
  return requirement.trim();
}

/**
 * Normalizes Estimator name. Replaces 'Unassigned' or missing names with 'Not Assigned'.
 */
export function normalizeEstimatorName(name?: string): string {
  if (!name || name.trim().toLowerCase() === 'unassigned' || name.trim() === '') {
    return 'Not Assigned';
  }
  return name.trim();
}

/**
 * Normalizes legacy statuses.
 * Maps legacy 'submitted' to 'sent_to_client' ONLY if sentDetails exists, otherwise 'quotation_ready'.
 */
export function normalizeCRMStatus(status: string, sentDetails?: any): string {
  const lower = (status || '').toLowerCase().trim();
  if (lower === 'submitted') {
    return sentDetails && sentDetails.sentDate ? 'sent_to_client' : 'quotation_ready';
  }
  return status;
}

/**
 * Normalizes enquiry numbers for legacy seed records missing valid format.
 */
export function normalizeEnquiryNumber(enquiry: Partial<Enquiry>, index = 1): string {
  if (enquiry.enquiryNumber && enquiry.enquiryNumber.trim() !== '' && enquiry.enquiryNumber !== 'ENQ-LEGACY') {
    return enquiry.enquiryNumber;
  }
  return `ENQ-2026-${String(index).padStart(3, '0')}`;
}
