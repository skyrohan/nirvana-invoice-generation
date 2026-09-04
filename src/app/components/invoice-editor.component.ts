import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InvoiceService } from '../services/invoice.service';
import { InvoiceItem, Invoice, GuestDetails, BookingDetails, PaymentDetails } from '../models/invoice.model';

@Component({
  selector: 'app-invoice-editor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="editor-container">
      <!-- Section 1: Quick Action Bar -->
      <div class="editor-header-bar">
        <div class="header-title-wrap">
          <span class="pulse-dot"></span>
          <h2 class="editor-section-title">Manager Booking Console</h2>
        </div>
        <div class="quick-chips">
          <button type="button" class="chip-btn chip-primary" (click)="loadSample()">
            ✨ Reset to User Example (Aishwarya Aghav)
          </button>
          <button type="button" class="chip-btn" (click)="newBlank()">
            📄 New Blank
          </button>
        </div>
      </div>

      <!-- Section 2: Guest Details -->
      <div class="panel-card">
        <div class="panel-header">
          <div class="panel-title">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
            <span>Guest Information</span>
          </div>
          <span class="badge badge-paid">Customer</span>
        </div>

        <div class="form-grid-2">
          <div class="form-group">
            <label class="form-label">Customer Name *</label>
            <input 
              type="text" 
              class="form-control font-bold" 
              placeholder="e.g. AISHWARYA AGHAV"
              [ngModel]="inv().guest.name"
              (ngModelChange)="updateGuest('name', $event)"
            />
          </div>

          <div class="form-group">
            <label class="form-label">Phone / WhatsApp *</label>
            <input 
              type="text" 
              class="form-control" 
              placeholder="e.g. 9822001122"
              [ngModel]="inv().guest.phone"
              (ngModelChange)="updateGuest('phone', $event)"
            />
          </div>

          <div class="form-group">
            <label class="form-label">Email Address (Optional)</label>
            <input 
              type="email" 
              class="form-control" 
              placeholder="e.g. aishwarya.aghav@gmail.com"
              [ngModel]="inv().guest.email"
              (ngModelChange)="updateGuest('email', $event)"
            />
          </div>

          <div class="form-group">
            <label class="form-label">City / Address</label>
            <input 
              type="text" 
              class="form-control" 
              placeholder="e.g. Pune, Maharashtra"
              [ngModel]="inv().guest.address"
              (ngModelChange)="updateGuest('address', $event)"
            />
          </div>
        </div>
      </div>

      <!-- Section 3: Booking & Stay Dates -->
      <div class="panel-card">
        <div class="panel-header">
          <div class="panel-title">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
            <span>Stay & Check-In Details</span>
          </div>
          <div class="nights-badge">
            🌙 <strong>{{ inv().booking.calculatedNights }} Night{{ inv().booking.calculatedNights > 1 ? 's' : '' }}</strong>
          </div>
        </div>

        <div class="form-grid-2">
          <div class="form-group">
            <label class="form-label">Check-In Date *</label>
            <input 
              type="date" 
              class="form-control" 
              [ngModel]="inv().booking.checkInDate"
              (ngModelChange)="updateBookingDate('checkInDate', $event)"
            />
            <span class="field-hint">{{ invoiceService.formatDisplayDate(inv().booking.checkInDate) }}</span>
          </div>

          <div class="form-group">
            <label class="form-label">Check-In Time</label>
            <input 
              type="text" 
              class="form-control" 
              placeholder="12:00 PM"
              [ngModel]="inv().booking.checkInTime"
              (ngModelChange)="updateBookingField('checkInTime', $event)"
            />
          </div>

          <div class="form-group">
            <label class="form-label">Check-Out Date *</label>
            <input 
              type="date" 
              class="form-control" 
              [ngModel]="inv().booking.checkOutDate"
              (ngModelChange)="updateBookingDate('checkOutDate', $event)"
            />
            <span class="field-hint">{{ invoiceService.formatDisplayDate(inv().booking.checkOutDate) }}</span>
          </div>

          <div class="form-group">
            <label class="form-label">Check-Out Time</label>
            <input 
              type="text" 
              class="form-control" 
              placeholder="11:00 AM"
              [ngModel]="inv().booking.checkOutTime"
              (ngModelChange)="updateBookingField('checkOutTime', $event)"
            />
          </div>
        </div>

        <div class="form-grid-3 mt-3">
          <div class="form-group">
            <label class="form-label">Room Type / Category</label>
            <input 
              type="text" 
              class="form-control" 
              placeholder="Deluxe Room (2 Person)"
              [ngModel]="inv().booking.roomType"
              (ngModelChange)="updateBookingField('roomType', $event)"
            />
          </div>

          <div class="form-group">
            <label class="form-label">Adults</label>
            <input 
              type="number" 
              min="1"
              class="form-control" 
              [ngModel]="inv().booking.adults"
              (ngModelChange)="updateBookingField('adults', +$event)"
            />
          </div>

          <div class="form-group">
            <label class="form-label">Children</label>
            <input 
              type="number" 
              min="0"
              class="form-control" 
              [ngModel]="inv().booking.children"
              (ngModelChange)="updateBookingField('children', +$event)"
            />
          </div>
        </div>
      </div>

      <!-- Section 4: Line Items (Rooms, Extra Person, Food) -->
      <div class="panel-card">
        <div class="panel-header">
          <div class="panel-title">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="8" y1="6" x2="21" y2="6"></line>
              <line x1="8" y1="12" x2="21" y2="12"></line>
              <line x1="8" y1="18" x2="21" y2="18"></line>
              <line x1="3" y1="6" x2="3.01" y2="6"></line>
              <line x1="3" y1="12" x2="3.01" y2="12"></line>
              <line x1="3" y1="18" x2="3.01" y2="18"></line>
            </svg>
            <span>Rooms & Charge Items</span>
          </div>

          <div class="add-item-btns">
            <button type="button" class="btn btn-secondary btn-sm" (click)="addExtraPersonItem()">
              + Extra Person (₹500)
            </button>
            <button type="button" class="btn btn-primary btn-sm" (click)="addNewItem()">
              + Add Item
            </button>
          </div>
        </div>

        <div class="items-table-wrapper">
          <table class="editor-table">
            <thead>
              <tr>
                <th>Description</th>
                <th style="width: 100px;">Price (₹)</th>
                <th style="width: 70px;">Qty</th>
                <th style="width: 75px;">Nights</th>
                <th style="width: 110px;">Total (₹)</th>
                <th style="width: 45px;"></th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let item of inv().items; let i = index">
                <td>
                  <input 
                    type="text" 
                    class="form-control table-input" 
                    [(ngModel)]="item.description" 
                    (ngModelChange)="onItemFieldChange()"
                    placeholder="e.g. DELUXE ROOM (2 PERSON)"
                  />
                </td>
                <td>
                  <input 
                    type="number" 
                    min="0"
                    class="form-control table-input text-right" 
                    [(ngModel)]="item.price" 
                    (ngModelChange)="onItemFieldChange()"
                  />
                </td>
                <td>
                  <input 
                    type="number" 
                    min="1"
                    class="form-control table-input text-center" 
                    [(ngModel)]="item.quantity" 
                    (ngModelChange)="onItemFieldChange()"
                  />
                </td>
                <td>
                  <input 
                    type="number" 
                    min="1"
                    class="form-control table-input text-center" 
                    [(ngModel)]="item.nights" 
                    (ngModelChange)="onItemFieldChange()"
                  />
                </td>
                <td class="amount-cell">
                  ₹{{ (item.price * item.quantity * item.nights) | number }}
                </td>
                <td>
                  <button 
                    type="button" 
                    class="delete-btn" 
                    [disabled]="inv().items.length <= 1"
                    (click)="removeItem(i)"
                    title="Remove line item"
                  >
                    ×
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Extra person note highlight -->
        <div class="note-box mt-3">
          <div class="note-icon">💡</div>
          <div class="note-content">
            <span class="note-label">Resort Policy Note:</span>
            <input 
              type="text" 
              class="form-control form-control-sm mt-1" 
              [ngModel]="inv().notes"
              (ngModelChange)="updateNotes($event)"
              placeholder="NOTE : FOR EXTRA PER PERSON 500RS WILL BE CHARGE"
            />
          </div>
        </div>
      </div>

      <!-- Section 5: Payment Details, Advance & Remaining Balance -->
      <div class="panel-card highlight-card">
        <div class="panel-header">
          <div class="panel-title">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
              <line x1="1" y1="10" x2="23" y2="10"></line>
            </svg>
            <span>Payment & Balance Breakdown</span>
          </div>

          <span 
            class="badge" 
            [ngClass]="{
              'badge-paid': inv().payment.status === 'PAID',
              'badge-partial': inv().payment.status === 'PARTIALLY PAID',
              'badge-unpaid': inv().payment.status === 'UNPAID'
            }"
          >
            {{ inv().payment.status }}
          </span>
        </div>

        <div class="form-grid-3">
          <div class="form-group">
            <label class="form-label">Subtotal Amount (₹)</label>
            <input 
              type="text" 
              class="form-control font-semibold bg-gray" 
              [value]="'₹' + (inv().payment.subtotal | number)" 
              disabled
            />
          </div>

          <div class="form-group">
            <label class="form-label">Taxes / GST (%)</label>
            <select 
              class="form-control" 
              [ngModel]="inv().payment.taxPercent"
              (ngModelChange)="updateTax($event)"
            >
              <option [value]="0">0% (Inclusive / No GST)</option>
              <option [value]="5">5% GST</option>
              <option [value]="12">12% GST</option>
              <option [value]="18">18% GST</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Discount (₹)</label>
            <input 
              type="number" 
              min="0"
              class="form-control" 
              placeholder="0"
              [ngModel]="inv().payment.discountAmount"
              (ngModelChange)="updateDiscount($event)"
            />
          </div>
        </div>

        <!-- Grand Total & Remaining Balance Highlight Boxes -->
        <div class="calc-cards-grid">
          <div class="calc-card total-box">
            <span class="calc-card-title">TOTAL AMOUNT</span>
            <span class="calc-card-value">₹{{ inv().payment.grandTotal | number }}</span>
            <span class="calc-card-sub">Sum of all charges</span>
          </div>

          <div class="calc-card advance-box">
            <div class="flex justify-between items-center mb-1">
              <span class="calc-card-title">ADVANCE PAID (₹) *</span>
              <button 
                type="button" 
                class="chip-link" 
                (click)="setAdvanceFull()"
              >
                Set Full
              </button>
            </div>
            <div class="input-with-symbol">
              <span class="currency-symbol">₹</span>
              <input 
                type="number" 
                min="0"
                class="form-control advance-input" 
                [ngModel]="inv().payment.advancePaid"
                (ngModelChange)="updateAdvance($event)"
              />
            </div>
            <span class="calc-card-sub">Received confirmation amount</span>
          </div>

          <div class="calc-card balance-box" [ngClass]="{'zero-balance': inv().payment.remainingBalance === 0}">
            <span class="calc-card-title">REMAINING BALANCE</span>
            <span class="calc-card-value">₹{{ inv().payment.remainingBalance | number }}</span>
            <span class="calc-card-sub">
              {{ inv().payment.remainingBalance === 0 ? '✓ Fully Cleared' : 'Due at Check-in' }}
            </span>
          </div>
        </div>

        <div class="form-grid-3 mt-4">
          <div class="form-group">
            <label class="form-label">UPI ID for Payment *</label>
            <input 
              type="text" 
              class="form-control font-mono font-bold" 
              placeholder="612074552426"
              [ngModel]="inv().payment.upiId"
              (ngModelChange)="updatePaymentField('upiId', $event)"
            />
          </div>

          <div class="form-group">
            <label class="form-label">Payment Mode</label>
            <select 
              class="form-control" 
              [ngModel]="inv().payment.paymentMode"
              (ngModelChange)="updatePaymentField('paymentMode', $event)"
            >
              <option value="UPI">UPI (Google Pay, PhonePe, Paytm)</option>
              <option value="Cash">Cash</option>
              <option value="Credit Card">Credit / Debit Card</option>
              <option value="Net Banking">Net Banking</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Transaction / UTR Ref</label>
            <input 
              type="text" 
              class="form-control" 
              placeholder="e.g. 612074552426"
              [ngModel]="inv().payment.transactionRef"
              (ngModelChange)="updatePaymentField('transactionRef', $event)"
            />
          </div>
        </div>
      </div>

      <!-- Section 6: Invoice Metadata & Terms -->
      <div class="panel-card">
        <div class="panel-header">
          <div class="panel-title">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
            </svg>
            <span>Invoice Details & Contact</span>
          </div>
        </div>

        <div class="form-grid-3">
          <div class="form-group">
            <label class="form-label">Invoice Number</label>
            <input 
              type="text" 
              class="form-control font-mono font-bold" 
              [ngModel]="inv().invoiceNumber"
              (ngModelChange)="updateInvoiceField('invoiceNumber', $event)"
            />
          </div>

          <div class="form-group">
            <label class="form-label">Invoice Date</label>
            <input 
              type="date" 
              class="form-control" 
              [ngModel]="inv().invoiceDate"
              (ngModelChange)="updateInvoiceField('invoiceDate', $event)"
            />
          </div>

          <div class="form-group">
            <label class="form-label">Resort Contact Phone</label>
            <input 
              type="text" 
              class="form-control" 
              [ngModel]="inv().resort.phone"
              (ngModelChange)="updateResortPhone($event)"
            />
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .editor-container {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .editor-header-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: #FFFFFF;
      padding: 16px 20px;
      border-radius: var(--radius-lg);
      border: 1px solid var(--neutral-border);
      box-shadow: var(--shadow-sm);
      flex-wrap: wrap;
      gap: 12px;
    }

    .header-title-wrap {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .pulse-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background-color: #10B981;
      box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.2);
    }

    .editor-section-title {
      font-size: 1.15rem;
      font-weight: 700;
      color: var(--primary-forest);
      margin: 0;
    }

    .quick-chips {
      display: flex;
      gap: 8px;
    }

    .chip-btn {
      font-size: 0.82rem;
      font-weight: 600;
      padding: 6px 14px;
      border-radius: 9999px;
      border: 1px solid var(--neutral-border);
      background: var(--neutral-light);
      color: var(--neutral-dark);
      transition: all 0.15s;
    }

    .chip-btn:hover {
      background: #E2E8F0;
      border-color: #CBD5E1;
    }

    .chip-primary {
      background: #E8F5E9;
      color: #1B4332;
      border-color: #C8E6C9;
    }
    .chip-primary:hover {
      background: #C8E6C9;
    }

    .chip-link {
      font-size: 0.75rem;
      font-weight: 700;
      color: var(--primary-green);
      text-decoration: underline;
      background: none;
      padding: 0;
    }

    .form-grid-2 {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 14px;
    }

    .form-grid-3 {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 14px;
    }

    @media (max-width: 640px) {
      .form-grid-2, .form-grid-3 {
        grid-template-columns: 1fr;
      }
    }

    .nights-badge {
      background: #F1F5F9;
      border: 1px solid #CBD5E1;
      border-radius: 20px;
      padding: 4px 12px;
      font-size: 0.85rem;
      color: #1E293B;
    }

    .field-hint {
      display: block;
      font-size: 0.74rem;
      color: #64748B;
      margin-top: 4px;
      font-weight: 500;
    }

    .items-table-wrapper {
      overflow-x: auto;
    }

    .editor-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.88rem;
    }

    .editor-table th {
      text-align: left;
      font-size: 0.76rem;
      font-weight: 700;
      color: #64748B;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      padding: 8px 10px;
      border-bottom: 2px solid #E2E8F0;
    }

    .editor-table td {
      padding: 8px 6px;
      vertical-align: middle;
    }

    .table-input {
      padding: 8px 10px;
      font-size: 0.88rem;
    }

    .amount-cell {
      font-weight: 700;
      color: var(--primary-forest);
      text-align: right;
      padding-right: 12px;
      font-size: 0.95rem;
    }

    .text-right {
      text-align: right;
    }

    .text-center {
      text-align: center;
    }

    .delete-btn {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: #FEE2E2;
      color: #DC2626;
      font-size: 1.2rem;
      line-height: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto;
    }

    .delete-btn:hover:not(:disabled) {
      background: #FCA5A5;
    }

    .delete-btn:disabled {
      opacity: 0.3;
      cursor: not-allowed;
    }

    .note-box {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      background: #FFFBEB;
      border: 1px solid #FDE68A;
      border-radius: var(--radius-md);
      padding: 12px;
    }

    .note-icon {
      font-size: 1.2rem;
      line-height: 1.2;
    }

    .note-content {
      flex: 1;
    }

    .note-label {
      font-size: 0.78rem;
      font-weight: 700;
      color: #92400E;
      text-transform: uppercase;
    }

    .highlight-card {
      background: linear-gradient(180deg, #FFFFFF 0%, #F9FCF9 100%);
      border: 1.5px solid #C8E6C9;
    }

    .calc-cards-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 14px;
      margin-top: 14px;
    }

    @media (max-width: 640px) {
      .calc-cards-grid {
        grid-template-columns: 1fr;
      }
    }

    .calc-card {
      padding: 14px;
      border-radius: var(--radius-md);
      display: flex;
      flex-direction: column;
      box-shadow: var(--shadow-sm);
    }

    .calc-card-title {
      font-size: 0.72rem;
      font-weight: 700;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      margin-bottom: 6px;
    }

    .calc-card-value {
      font-size: 1.6rem;
      font-weight: 800;
      font-family: var(--font-display);
      line-height: 1.1;
      margin-bottom: 4px;
    }

    .calc-card-sub {
      font-size: 0.75rem;
      font-weight: 500;
      opacity: 0.85;
    }

    .total-box {
      background: #F1F5F9;
      border: 1.5px solid #CBD5E1;
      color: #1E293B;
    }

    .advance-box {
      background: #E8F5E9;
      border: 1.5px solid #A5D6A7;
      color: #1B4332;
    }

    .input-with-symbol {
      position: relative;
      display: flex;
      align-items: center;
    }

    .currency-symbol {
      position: absolute;
      left: 12px;
      font-weight: 700;
      color: #2D6A4F;
      font-size: 1.1rem;
    }

    .advance-input {
      padding-left: 28px;
      font-weight: 800;
      font-size: 1.3rem;
      color: #1B4332;
      background: #FFFFFF;
      border-color: #81C784;
    }

    .balance-box {
      background: #FEF3C7;
      border: 1.5px solid #FCD34D;
      color: #92400E;
    }

    .balance-box.zero-balance {
      background: #ECFDF5;
      border: 1.5px solid #6EE7B7;
      color: #065F46;
    }

    .font-bold { font-weight: 700; }
    .font-semibold { font-weight: 600; }
    .font-mono { font-family: monospace; }
    .bg-gray { background-color: #F1F5F9; }
    .mt-1 { margin-top: 4px; }
    .mt-3 { margin-top: 12px; }
    .mt-4 { margin-top: 16px; }
    .mb-1 { margin-bottom: 4px; }
    .flex { display: flex; }
    .justify-between { justify-content: space-between; }
    .items-center { align-items: center; }
  `]
})
export class InvoiceEditorComponent {
  public invoiceService = inject(InvoiceService);
  public inv = this.invoiceService.invoice;

  public loadSample(): void {
    this.invoiceService.resetToSample();
  }

  public newBlank(): void {
    this.invoiceService.createNewBlankInvoice();
  }

  public updateGuest(field: keyof GuestDetails, val: string): void {
    const updated = {
      ...this.inv(),
      guest: {
        ...this.inv().guest,
        [field]: val
      }
    };
    this.invoiceService.updateInvoice(updated);
  }

  public updateBookingDate(field: 'checkInDate' | 'checkOutDate', val: string): void {
    const updated = {
      ...this.inv(),
      booking: {
        ...this.inv().booking,
        [field]: val
      }
    };
    // If nights changed, update line items with 'room' category
    const nights = this.invoiceService.calculateNightsBetween(
      field === 'checkInDate' ? val : updated.booking.checkInDate,
      field === 'checkOutDate' ? val : updated.booking.checkOutDate
    );
    updated.booking.calculatedNights = nights;
    updated.items = updated.items.map(item => {
      if (item.category === 'room') {
        return { ...item, nights };
      }
      return item;
    });

    this.invoiceService.updateInvoice(updated);
  }

  public updateBookingField(field: keyof BookingDetails, val: any): void {
    const updated = {
      ...this.inv(),
      booking: {
        ...this.inv().booking,
        [field]: val
      }
    };
    this.invoiceService.updateInvoice(updated);
  }

  public onItemFieldChange(): void {
    this.invoiceService.updateInvoice({ ...this.inv() });
  }

  public addNewItem(): void {
    const newItem: InvoiceItem = {
      id: 'item-' + Date.now(),
      description: 'Deluxe Room Extra',
      category: 'room',
      price: 3500,
      quantity: 1,
      nights: this.inv().booking.calculatedNights || 1,
      amount: 3500 * (this.inv().booking.calculatedNights || 1)
    };
    const updated = {
      ...this.inv(),
      items: [...this.inv().items, newItem]
    };
    this.invoiceService.updateInvoice(updated);
  }

  public addExtraPersonItem(): void {
    const extraItem: InvoiceItem = {
      id: 'item-' + Date.now(),
      description: 'EXTRA PERSON CHARGES (500 RS/PERSON)',
      category: 'extra_person',
      price: 500,
      quantity: 1,
      nights: 1,
      amount: 500
    };
    const updated = {
      ...this.inv(),
      items: [...this.inv().items, extraItem]
    };
    this.invoiceService.updateInvoice(updated);
  }

  public removeItem(index: number): void {
    if (this.inv().items.length <= 1) return;
    const newItems = [...this.inv().items];
    newItems.splice(index, 1);
    const updated = {
      ...this.inv(),
      items: newItems
    };
    this.invoiceService.updateInvoice(updated);
  }

  public updateTax(taxVal: any): void {
    const updated = {
      ...this.inv(),
      payment: {
        ...this.inv().payment,
        taxPercent: Number(taxVal) || 0
      }
    };
    this.invoiceService.updateInvoice(updated);
  }

  public updateDiscount(discVal: any): void {
    const updated = {
      ...this.inv(),
      payment: {
        ...this.inv().payment,
        discountAmount: Number(discVal) || 0
      }
    };
    this.invoiceService.updateInvoice(updated);
  }

  public updateAdvance(advVal: any): void {
    const updated = {
      ...this.inv(),
      payment: {
        ...this.inv().payment,
        advancePaid: Number(advVal) || 0
      }
    };
    this.invoiceService.updateInvoice(updated);
  }

  public setAdvanceFull(): void {
    const total = this.inv().payment.grandTotal;
    this.updateAdvance(total);
  }

  public updatePaymentField(field: keyof PaymentDetails, val: any): void {
    const updated = {
      ...this.inv(),
      payment: {
        ...this.inv().payment,
        [field]: val
      }
    };
    this.invoiceService.updateInvoice(updated);
  }

  public updateNotes(val: string): void {
    const updated = {
      ...this.inv(),
      notes: val
    };
    this.invoiceService.updateInvoice(updated);
  }

  public updateInvoiceField(field: keyof Invoice, val: any): void {
    const updated = {
      ...this.inv(),
      [field]: val
    };
    this.invoiceService.updateInvoice(updated);
  }

  public updateResortPhone(phone: string): void {
    const updated = {
      ...this.inv(),
      resort: {
        ...this.inv().resort,
        phone
      }
    };
    this.invoiceService.updateInvoice(updated);
  }
}
