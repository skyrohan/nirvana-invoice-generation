import { Injectable, signal, computed } from '@angular/core';
import { Invoice, InvoiceItem, ResortInfo } from '../models/invoice.model';
import QRCode from 'qrcode';

export const DEFAULT_RESORT_INFO: ResortInfo = {
  name: 'NIRVANA RESORT',
  tagline: "Nature's Serenity & Luxury Stay",
  phone: '8275581155',
  whatsapp: '8275581155',
  email: 'oneandonlynirvana0101@gmail.com',
  instagram: 'oneandonlynirvana0101@gmail.com',
  location: 'Nirvana Valley, Scenic Hillside, Nature Retreat',
  upiId: '612074552426',
  checkInTerms: 'CHECK IN TIME 12PM TO CHECK OUT TIME 11AM',
  checkOutTerms: '11:00 AM (Late checkout subject to room availability)',
  extraPersonNote: 'NOTE : FOR EXTRA PER PERSON 500RS WILL BE CHARGE',
  termsAndConditions: [
    'Government approved Photo ID proof is mandatory for all adult guests at the time of check-in.',
    'Check-in time is 12:00 PM and Check-out time is 11:00 AM.',
    'Advance payment is required to confirm booking reservation.',
    'Remaining balance payment must be cleared at or before check-in.',
    'Swimming pool & outdoor amenities timings: 7:00 AM to 8:00 PM with proper swimwear.',
    'Smoking inside deluxe rooms/cottages is strictly prohibited.',
    'For any assistance, cancellations, or reschedule requests, contact 8275581155.'
  ]
};

@Injectable({
  providedIn: 'root'
})
export class InvoiceService {
  private readonly STORAGE_KEY = 'nirvana_resort_current_invoice';
  private readonly HISTORY_KEY = 'nirvana_resort_invoice_history';

  // Active invoice state signal
  public invoice = signal<Invoice>(this.getInitialInvoice());

  // UPI QR Code Data URL signal
  public upiQrCodeUrl = signal<string>('');

  constructor() {
    this.regenerateUpiQrCode();
  }

  public getInitialInvoice(): Invoice {
    const saved = localStorage.getItem(this.STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved invoice', e);
      }
    }
    return this.createSampleInvoice();
  }

  public createSampleInvoice(): Invoice {
    const checkIn = '2026-09-05';
    const checkOut = '2026-09-07';
    const nights = this.calculateNightsBetween(checkIn, checkOut);

    const items: InvoiceItem[] = [
      {
        id: 'item-1',
        description: 'DELUXE ROOM (2 PERSON)',
        category: 'room',
        price: 3500,
        quantity: 1,
        nights: nights,
        amount: 3500 * 1 * nights // 7000
      },
      {
        id: 'item-2',
        description: 'EXTRA PERSON CHARGES',
        category: 'extra_person',
        price: 500,
        quantity: 1,
        nights: 1,
        amount: 500
      }
    ];

    const subtotal = items.reduce((acc, i) => acc + i.amount, 0); // 7500
    const advancePaid = 3500; // Manager can easily change or set full 7500
    const remainingBalance = Math.max(0, subtotal - advancePaid); // 4000

    return {
      id: 'INV-' + Date.now().toString().slice(-6),
      invoiceNumber: 'NIR-2026-0089',
      invoiceDate: '2026-04-30',
      dueDate: '2026-09-05',
      guest: {
        name: 'AISHWARYA AGHAV',
        phone: '9822001122',
        email: 'aishwarya.aghav@gmail.com',
        address: 'Pune, Maharashtra'
      },
      booking: {
        checkInDate: checkIn,
        checkInTime: '12:00 PM',
        checkOutDate: checkOut,
        checkOutTime: '11:00 AM',
        calculatedNights: nights,
        adults: 2,
        children: 0,
        roomType: 'Deluxe Room (2 Person)',
        bookingSource: 'Direct Call'
      },
      items,
      payment: {
        subtotal,
        taxPercent: 0,
        taxAmount: 0,
        discountAmount: 0,
        grandTotal: subtotal,
        advancePaid,
        remainingBalance,
        paymentMode: 'UPI',
        upiId: '612074552426',
        transactionRef: 'UPI/612074552426/REF',
        paymentDate: '2026-04-30',
        status: 'PARTIALLY PAID'
      },
      resort: { ...DEFAULT_RESORT_INFO },
      notes: 'NOTE : FOR EXTRA PER PERSON 500RS WILL BE CHARGE',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  public resetToSample(): void {
    const sample = this.createSampleInvoice();
    this.updateInvoice(sample);
  }

  public createNewBlankInvoice(): void {
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
    const randomNum = Math.floor(1000 + Math.random() * 9000);

    const newInvoice: Invoice = {
      id: 'INV-' + Date.now().toString().slice(-6),
      invoiceNumber: `NIR-${new Date().getFullYear()}-${randomNum}`,
      invoiceDate: today,
      dueDate: today,
      guest: {
        name: '',
        phone: '',
        email: '',
        address: ''
      },
      booking: {
        checkInDate: today,
        checkInTime: '12:00 PM',
        checkOutDate: tomorrow,
        checkOutTime: '11:00 AM',
        calculatedNights: 1,
        adults: 2,
        children: 0,
        roomType: 'Deluxe Room (2 Person)',
        bookingSource: 'Direct'
      },
      items: [
        {
          id: 'item-' + Date.now(),
          description: 'DELUXE ROOM (2 PERSON)',
          category: 'room',
          price: 3500,
          quantity: 1,
          nights: 1,
          amount: 3500
        }
      ],
      payment: {
        subtotal: 3500,
        taxPercent: 0,
        taxAmount: 0,
        discountAmount: 0,
        grandTotal: 3500,
        advancePaid: 0,
        remainingBalance: 3500,
        paymentMode: 'UPI',
        upiId: '612074552426',
        transactionRef: '',
        paymentDate: today,
        status: 'UNPAID'
      },
      resort: { ...DEFAULT_RESORT_INFO },
      notes: 'NOTE : FOR EXTRA PER PERSON 500RS WILL BE CHARGE',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.updateInvoice(newInvoice);
  }

  public calculateNightsBetween(startDateStr: string, endDateStr: string): number {
    if (!startDateStr || !endDateStr) return 1;
    const start = new Date(startDateStr);
    const end = new Date(endDateStr);
    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 1;
  }

  public updateInvoice(newInv: Invoice): void {
    // Recalculate financial amounts
    const updated = this.recalculateTotals(newInv);
    this.invoice.set(updated);
    this.saveToStorage(updated);
    this.regenerateUpiQrCode();
  }

  public recalculateTotals(inv: Invoice): Invoice {
    // Ensure booking nights are calculated
    const nights = this.calculateNightsBetween(inv.booking.checkInDate, inv.booking.checkOutDate);
    const updatedBooking = {
      ...inv.booking,
      calculatedNights: nights
    };

    // Calculate line item totals
    const updatedItems = inv.items.map(item => {
      const itemNights = item.nights > 0 ? item.nights : 1;
      const qty = item.quantity > 0 ? item.quantity : 1;
      const price = Number(item.price) || 0;
      const amount = price * qty * itemNights;
      return {
        ...item,
        amount
      };
    });

    const subtotal = updatedItems.reduce((sum, item) => sum + item.amount, 0);
    const taxPercent = Number(inv.payment.taxPercent) || 0;
    const taxAmount = Math.round((subtotal * taxPercent) / 100);
    const discountAmount = Number(inv.payment.discountAmount) || 0;
    const grandTotal = Math.max(0, subtotal + taxAmount - discountAmount);

    const advancePaid = Number(inv.payment.advancePaid) || 0;
    const remainingBalance = Math.max(0, grandTotal - advancePaid);

    let status: 'PAID' | 'PARTIALLY PAID' | 'UNPAID' = 'UNPAID';
    if (grandTotal > 0 && advancePaid >= grandTotal) {
      status = 'PAID';
    } else if (advancePaid > 0) {
      status = 'PARTIALLY PAID';
    }

    const updatedPayment = {
      ...inv.payment,
      subtotal,
      taxAmount,
      grandTotal,
      advancePaid,
      remainingBalance,
      status
    };

    return {
      ...inv,
      booking: updatedBooking,
      items: updatedItems,
      payment: updatedPayment,
      updatedAt: new Date().toISOString()
    };
  }

  public async regenerateUpiQrCode(): Promise<void> {
    const current = this.invoice();
    const upiId = current.payment.upiId || '7977551983@ybl';
    const amountToPay = current.payment.remainingBalance > 0 ? current.payment.remainingBalance : current.payment.grandTotal;
    const payeeName = 'Nirvana Resort';
    const note = `Invoice ${current.invoiceNumber}`;

    // UPI Deep link format with proper 2-decimal format or omitted if 0
    const amountParam = amountToPay > 0 ? `&am=${amountToPay.toFixed(2)}` : '';
    const upiUri = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(payeeName)}${amountParam}&cu=INR&tn=${encodeURIComponent(note)}`;

    try {
      const qrDataUrl = await QRCode.toDataURL(upiUri, {
        errorCorrectionLevel: 'M',
        margin: 1,
        width: 160,
        color: {
          dark: '#1B4332', // Nirvana Forest Green
          light: '#FFFFFF'
        }
      });
      this.upiQrCodeUrl.set(qrDataUrl);
    } catch (err) {
      console.error('Failed to generate QR code', err);
      this.upiQrCodeUrl.set('');
    }
  }

  public saveToStorage(inv: Invoice): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(inv));
    } catch (e) {
      console.error('Error saving current invoice', e);
    }
  }

  public saveToHistory(): void {
    const current = this.invoice();
    try {
      const historyJson = localStorage.getItem(this.HISTORY_KEY);
      let list: Invoice[] = historyJson ? JSON.parse(historyJson) : [];
      list = list.filter(i => i.invoiceNumber !== current.invoiceNumber);
      list.unshift(current);
      if (list.length > 20) list = list.slice(0, 20); // Keep last 20
      localStorage.setItem(this.HISTORY_KEY, JSON.stringify(list));
    } catch (e) {
      console.error('Failed to save to history', e);
    }
  }

  public getHistory(): Invoice[] {
    try {
      const historyJson = localStorage.getItem(this.HISTORY_KEY);
      return historyJson ? JSON.parse(historyJson) : [];
    } catch (e) {
      return [];
    }
  }

  public deleteFromHistory(invoiceNumber: string): void {
    try {
      const history = this.getHistory().filter(i => i.invoiceNumber !== invoiceNumber);
      localStorage.setItem(this.HISTORY_KEY, JSON.stringify(history));
    } catch (e) { }
  }

  public formatDisplayDate(dateStr: string): string {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      return date.toLocaleDateString('en-IN', {
        weekday: 'short',
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }).toUpperCase();
    } catch (e) {
      return dateStr;
    }
  }

  public getWhatsAppShareUrl(): string {
    const inv = this.invoice();
    const guestName = inv.guest.name || 'Valued Guest';
    const checkIn = this.formatDisplayDate(inv.booking.checkInDate);
    const checkOut = this.formatDisplayDate(inv.booking.checkOutDate);
    const nights = inv.booking.calculatedNights;
    const phone = inv.guest.phone.replace(/[^0-9]/g, '');

    const text =
      `*NIRVANA RESORT - BOOKING INVOICE & CONFIRMATION* 🌿🏨

Dear *${guestName}*,
Greetings from *Nirvana Resort*! Here are your booking and invoice details:

📄 *Invoice No:* ${inv.invoiceNumber}
📅 *Invoice Date:* ${this.formatDisplayDate(inv.invoiceDate)}
🏨 *Room / Package:* ${inv.booking.roomType}
🗓️ *Check-in:* ${checkIn} (12:00 PM)
🗓️ *Check-out:* ${checkOut} (11:00 AM)
🌙 *Duration:* ${nights} Night${nights > 1 ? 's' : ''}

💰 *Total Amount:* ₹${inv.payment.grandTotal.toLocaleString('en-IN')}
💳 *Advance Paid:* ₹${inv.payment.advancePaid.toLocaleString('en-IN')}
💵 *Remaining Balance:* ₹${inv.payment.remainingBalance.toLocaleString('en-IN')} ${inv.payment.remainingBalance > 0 ? '(Due at Check-in)' : '✅ FULLY CLEARED'}

📲 *Payment UPI ID:* ${inv.payment.upiId}
📌 *Special Note:* ${inv.notes || 'For extra per person ₹500 will be charged.'}
📍 *Contact / Location:* 8275581155 | @nirvanaresort

We look forward to hosting you for a serene and peaceful stay!`;

    const encoded = encodeURIComponent(text);
    if (phone) {
      const formattedPhone = phone.length === 10 ? `91${phone}` : phone;
      return `https://wa.me/${formattedPhone}?text=${encoded}`;
    }
    return `https://wa.me/?text=${encoded}`;
  }

  public getGmailComposeUrl(): string {
    const inv = this.invoice();
    const guestName = inv.guest.name || 'Valued Guest';
    const checkIn = this.formatDisplayDate(inv.booking.checkInDate);
    const checkOut = this.formatDisplayDate(inv.booking.checkOutDate);
    const nights = inv.booking.calculatedNights;
    const to = inv.guest.email || '';

    const subject = `Booking Invoice & Confirmation - ${inv.invoiceNumber} - Nirvana Resort`;
    const body = 
`Dear ${guestName},

Greetings from Nirvana Resort!

Thank you for choosing Nirvana Resort for your upcoming stay. Please find your reservation and booking invoice summary below:

• Invoice Number: ${inv.invoiceNumber}
• Invoice Date: ${this.formatDisplayDate(inv.invoiceDate)}
• Room / Package: ${inv.booking.roomType}
• Check-In: ${checkIn} (12:00 PM)
• Check-Out: ${checkOut} (11:00 AM)
• Stay Duration: ${nights} Night${nights > 1 ? 's' : ''}

FINANCIAL DETAILS:
• Total Amount: ₹${inv.payment.grandTotal.toLocaleString('en-IN')}
• Advance Paid: ₹${inv.payment.advancePaid.toLocaleString('en-IN')}
• Remaining Balance Due: ₹${inv.payment.remainingBalance.toLocaleString('en-IN')} ${inv.payment.remainingBalance === 0 ? '(Fully Paid)' : '(Due upon check-in)'}

PAYMENT & UPI:
• UPI ID: ${inv.payment.upiId}

RESORT POLICIES:
• Check-in time: 12:00 PM | Check-out time: 11:00 AM
• Valid Government Photo ID is required for all adult guests at check-in.
• Contact: ${inv.resort.phone} | ${inv.resort.email}

Warm regards,
Nirvana Resort Reservations Team
Phone: ${inv.resort.phone}
Email: ${inv.resort.email}`;

    return `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(to)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }
}
