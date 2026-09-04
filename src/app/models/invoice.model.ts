export interface InvoiceItem {
  id: string;
  description: string;
  category: 'room' | 'extra_person' | 'food' | 'activity' | 'other';
  price: number;
  quantity: number;
  nights: number;
  amount: number;
}

export interface GuestDetails {
  name: string;
  phone: string;
  email: string;
  address: string;
  idProofType?: string;
  idProofNumber?: string;
}

export interface BookingDetails {
  checkInDate: string; // YYYY-MM-DD
  checkInTime: string; // e.g. 12:00 PM
  checkOutDate: string; // YYYY-MM-DD
  checkOutTime: string; // e.g. 11:00 AM
  calculatedNights: number;
  adults: number;
  children: number;
  roomType: string;
  bookingSource?: string;
}

export interface PaymentDetails {
  subtotal: number;
  taxPercent: number; // e.g. 0, 5, 12, 18
  taxAmount: number;
  discountAmount: number;
  grandTotal: number;
  advancePaid: number;
  remainingBalance: number;
  paymentMode: 'UPI' | 'Cash' | 'Credit Card' | 'Net Banking' | 'Cheque';
  upiId: string;
  transactionRef: string;
  paymentDate: string;
  status: 'PAID' | 'PARTIALLY PAID' | 'UNPAID';
}

export interface ResortInfo {
  name: string;
  tagline: string;
  phone: string;
  whatsapp: string;
  email: string;
  instagram: string;
  location: string;
  upiId: string;
  checkInTerms: string;
  checkOutTerms: string;
  extraPersonNote: string;
  termsAndConditions: string[];
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate?: string;
  guest: GuestDetails;
  booking: BookingDetails;
  items: InvoiceItem[];
  payment: PaymentDetails;
  resort: ResortInfo;
  notes: string;
  createdAt: string;
  updatedAt: string;
}
