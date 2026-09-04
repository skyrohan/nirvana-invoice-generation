import { Component, EventEmitter, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InvoiceService } from '../services/invoice.service';
import { Invoice } from '../models/invoice.model';

@Component({
  selector: 'app-history-drawer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="drawer-overlay" (click)="close.emit()">
      <div class="drawer-panel" (click)="$event.stopPropagation()">
        <div class="drawer-header">
          <div class="drawer-title">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
            <span>Saved Invoices & Bookings</span>
          </div>
          <button type="button" class="close-btn" (click)="close.emit()">×</button>
        </div>

        <div class="drawer-body">
          <div *ngIf="history.length === 0" class="empty-history">
            <div class="empty-icon">📂</div>
            <h4>No Saved Invoices Yet</h4>
            <p>Invoices are automatically saved when you download PDFs or click "Save Invoice".</p>
          </div>

          <div *ngFor="let item of history" class="history-item-card">
            <div class="item-meta-top">
              <span class="history-inv-num">{{ item.invoiceNumber }}</span>
              <span 
                class="badge"
                [ngClass]="{
                  'badge-paid': item.payment.status === 'PAID',
                  'badge-partial': item.payment.status === 'PARTIALLY PAID',
                  'badge-unpaid': item.payment.status === 'UNPAID'
                }"
              >
                {{ item.payment.status }}
              </span>
            </div>

            <div class="history-guest">{{ item.guest.name || 'Unnamed Guest' }}</div>
            
            <div class="history-dates">
              <span>📅 {{ invoiceService.formatDisplayDate(item.booking.checkInDate) }} – {{ invoiceService.formatDisplayDate(item.booking.checkOutDate) }}</span>
              <span class="history-room">{{ item.booking.roomType }}</span>
            </div>

            <div class="history-finance-row">
              <div>Total: <strong>₹{{ item.payment.grandTotal | number }}</strong></div>
              <div>Advance: <strong class="text-green">₹{{ item.payment.advancePaid | number }}</strong></div>
              <div>Balance: <strong class="text-amber">₹{{ item.payment.remainingBalance | number }}</strong></div>
            </div>

            <div class="history-actions">
              <button type="button" class="btn btn-secondary btn-sm" (click)="loadInvoice(item)">
                Open / Edit
              </button>
              <button type="button" class="delete-icon-btn" (click)="deleteInvoice(item.invoiceNumber)" title="Delete from history">
                🗑️
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .drawer-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(15, 23, 42, 0.45);
      backdrop-filter: blur(4px);
      z-index: 999;
      display: flex;
      justify-content: flex-end;
    }

    .drawer-panel {
      width: 420px;
      max-width: 90vw;
      height: 100%;
      background: #FFFFFF;
      box-shadow: -10px 0 25px rgba(0, 0, 0, 0.15);
      display: flex;
      flex-direction: column;
      animation: slideIn 0.25s ease-out;
    }

    @keyframes slideIn {
      from { transform: translateX(100%); }
      to { transform: translateX(0); }
    }

    .drawer-header {
      padding: 18px 20px;
      border-bottom: 1px solid var(--neutral-border);
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #F8FAFC;
    }

    .drawer-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 700;
      color: var(--primary-forest);
      font-size: 1.05rem;
    }

    .close-btn {
      font-size: 1.5rem;
      color: #64748B;
      line-height: 1;
      padding: 0 4px;
    }
    .close-btn:hover {
      color: #0F172A;
    }

    .drawer-body {
      padding: 16px;
      overflow-y: auto;
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .empty-history {
      text-align: center;
      padding: 50px 20px;
      color: #64748B;
    }

    .empty-icon {
      font-size: 3rem;
      margin-bottom: 10px;
    }

    .history-item-card {
      border: 1px solid var(--neutral-border);
      border-radius: var(--radius-md);
      padding: 14px;
      background: #FFFFFF;
      transition: all 0.2s;
    }

    .history-item-card:hover {
      border-color: var(--primary-green);
      box-shadow: var(--shadow-md);
    }

    .item-meta-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 6px;
    }

    .history-inv-num {
      font-family: monospace;
      font-weight: 700;
      color: var(--primary-forest);
      font-size: 0.88rem;
    }

    .history-guest {
      font-weight: 700;
      font-size: 1rem;
      color: #0F172A;
      margin-bottom: 4px;
    }

    .history-dates {
      font-size: 0.78rem;
      color: #64748B;
      display: flex;
      flex-direction: column;
      gap: 2px;
      margin-bottom: 8px;
    }

    .history-room {
      color: #2A7F9E;
      font-weight: 600;
    }

    .history-finance-row {
      display: flex;
      justify-content: space-between;
      font-size: 0.82rem;
      background: #F8FAFC;
      padding: 6px 10px;
      border-radius: 4px;
      margin-bottom: 10px;
    }

    .text-green { color: #166534; }
    .text-amber { color: #B45309; }

    .history-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .delete-icon-btn {
      background: none;
      font-size: 1rem;
      padding: 4px;
      border-radius: 4px;
      opacity: 0.7;
    }
    .delete-icon-btn:hover {
      opacity: 1;
      background: #FEE2E2;
    }
  `]
})
export class HistoryDrawerComponent {
  @Output() close = new EventEmitter<void>();

  public invoiceService = inject(InvoiceService);
  public history: Invoice[] = [];

  constructor() {
    this.refreshHistory();
  }

  public refreshHistory(): void {
    this.history = this.invoiceService.getHistory();
  }

  public loadInvoice(inv: Invoice): void {
    this.invoiceService.updateInvoice(inv);
    this.close.emit();
  }

  public deleteInvoice(invoiceNumber: string): void {
    if (confirm(`Delete invoice ${invoiceNumber} from history?`)) {
      this.invoiceService.deleteFromHistory(invoiceNumber);
      this.refreshHistory();
    }
  }
}
