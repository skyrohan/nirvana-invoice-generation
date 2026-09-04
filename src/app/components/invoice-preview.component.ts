import { Component, ElementRef, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InvoiceService } from '../services/invoice.service';
import { PdfService } from '../services/pdf.service';
import { NIRVANA_LOGO_BASE64 } from '../models/logo-base64';

@Component({
  selector: 'app-invoice-preview',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="preview-wrapper">
      <!-- Toolbar above invoice canvas -->
      <div class="preview-actions-bar no-print">
        <div class="preview-badge">
          <span class="preview-indicator"></span>
          <span>Live A4 Invoice Canvas</span>
        </div>

        <div class="action-buttons-group">
          <!-- Share PDF Directly to WhatsApp / Gmail -->
          <button 
            type="button" 
            class="btn btn-success btn-sm" 
            [disabled]="pdfService.isGenerating()"
            (click)="sharePdf()"
            title="Share PDF directly to WhatsApp, Gmail, etc."
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="18" cy="5" r="3"></circle>
              <circle cx="6" cy="12" r="3"></circle>
              <circle cx="18" cy="19" r="3"></circle>
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
            </svg>
            <span>Share PDF</span>
          </button>

          <!-- WhatsApp Text Summary -->
          <a 
            [href]="invoiceService.getWhatsAppShareUrl()" 
            target="_blank" 
            rel="noopener noreferrer" 
            class="btn btn-whatsapp btn-sm"
            title="Send booking invoice summary to guest on WhatsApp"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.669-.699c.983.541 1.776.814 2.791.814 3.179 0 5.766-2.587 5.766-5.766 0-3.18-2.587-5.766-5.766-5.766zm9.969 5.766c0 5.518-4.482 10-10 10-1.748 0-3.414-.46-4.887-1.309l-7.113 1.871 1.889-6.945c-.933-1.524-1.449-3.287-1.449-5.117 0-5.518 4.482-10 10-10s10 4.482 10 10z"/>
            </svg>
            <span>WhatsApp</span>
          </a>

          <!-- Gmail Direct Compose -->
          <a 
            [href]="invoiceService.getGmailComposeUrl()" 
            target="_blank" 
            rel="noopener noreferrer" 
            class="btn btn-secondary btn-sm"
            title="Open Gmail compose with booking details pre-filled"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="#EA4335">
              <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
            </svg>
            <span>Gmail</span>
          </a>

          <!-- Native Print -->
          <button 
            type="button" 
            class="btn btn-secondary btn-sm" 
            (click)="printInvoice()"
            title="Print or Save via browser"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="6 9 6 2 18 2 18 9"></polyline>
              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
              <rect x="6" y="14" width="12" height="8"></rect>
            </svg>
            <span>Print</span>
          </button>

          <!-- Download High-Def PDF -->
          <button 
            type="button" 
            class="btn btn-primary btn-sm btn-download" 
            [disabled]="pdfService.isGenerating()"
            (click)="downloadPdf()"
          >
            <svg *ngIf="!pdfService.isGenerating()" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            <span *ngIf="pdfService.isGenerating()" class="spinner"></span>
            <span>{{ pdfService.isGenerating() ? 'Generating...' : 'Download PDF' }}</span>
          </button>
        </div>
      </div>

      <!-- Live Loading Notification -->
      <div *ngIf="pdfService.isGenerating()" class="pdf-generating-banner">
        <span class="spinner-dark"></span>
        <span>{{ pdfService.progressMessage() }}</span>
      </div>

      <!-- The A4 Canvas Container (Captured by html2pdf / html2canvas) -->
      <div class="invoice-canvas-wrapper">
        <div #invoiceCanvas id="invoice-printable" class="invoice-a4-sheet">

          <!-- Top Decorative Accent Bar -->
          <div class="luxury-top-strip">
            <div class="strip-green"></div>
            <div class="strip-river"></div>
            <div class="strip-sun"></div>
          </div>

          <!-- Invoice Header -->
          <header class="invoice-header">
            <div class="brand-block">
              <!-- Official Resort Logo -->
              <div class="logo-container">
                <img [src]="logoBase64" alt="Nirvana Resort Logo" class="resort-logo-img" />
              </div>
              <div class="brand-text">
                <h1 class="brand-name">NIRVANA RESORT</h1>
                <p class="brand-tagline">{{ inv().resort.tagline }}</p>
                <div class="brand-contact-row">
                  <span class="contact-pill">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                    </svg>
                    {{ inv().resort.phone }}
                  </span>
                  <span class="contact-pill">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <circle cx="12" cy="12" r="10"></circle>
                      <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon>
                    </svg>
                    {{ inv().resort.instagram }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Invoice Meta Block -->
            <div class="invoice-meta-block">
              <div class="invoice-title-badge">
                <span class="title-label">BOOKING INVOICE</span>
              </div>
              
              <div class="meta-data-table">
                <div class="meta-row">
                  <span class="meta-key">INVOICE NO:</span>
                  <span class="meta-val font-mono font-bold">{{ inv().invoiceNumber }}</span>
                </div>
                <div class="meta-row">
                  <span class="meta-key">INVOICE DATE:</span>
                  <span class="meta-val">{{ invoiceService.formatDisplayDate(inv().invoiceDate) }}</span>
                </div>
                <div class="meta-row">
                  <span class="meta-key">PAYMENT STATUS:</span>
                  <span 
                    class="meta-val badge" 
                    [ngClass]="{
                      'badge-paid': inv().payment.status === 'PAID',
                      'badge-partial': inv().payment.status === 'PARTIALLY PAID',
                      'badge-unpaid': inv().payment.status === 'UNPAID'
                    }"
                  >
                    {{ inv().payment.status }}
                  </span>
                </div>
              </div>
            </div>
          </header>

          <div class="section-divider"></div>

          <!-- Guest & Stay Details Grid -->
          <div class="guest-booking-grid">
            <!-- Guest Info Card -->
            <div class="card-info-box">
              <div class="box-title">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                <span>PAID BY / GUEST DETAILS</span>
              </div>
              <div class="box-content">
                <div class="guest-name-highlight">{{ inv().guest.name || 'GUEST NAME' }}</div>
                <div class="detail-line">
                  <span class="detail-label">Phone:</span>
                  <span class="detail-value">{{ inv().guest.phone || '—' }}</span>
                </div>
                <div *ngIf="inv().guest.email" class="detail-line">
                  <span class="detail-label">Email:</span>
                  <span class="detail-value">{{ inv().guest.email }}</span>
                </div>
                <div *ngIf="inv().guest.address" class="detail-line">
                  <span class="detail-label">Address:</span>
                  <span class="detail-value">{{ inv().guest.address }}</span>
                </div>
              </div>
            </div>

            <!-- Booking Stay Details Card -->
            <div class="card-info-box booking-highlight">
              <div class="box-title">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
                <span>BOOKING & STAY SCHEDULE</span>
              </div>
              <div class="box-content">
                <div class="stay-timeline">
                  <div class="timeline-step">
                    <span class="step-badge checkin">CHECK-IN</span>
                    <span class="step-date">{{ invoiceService.formatDisplayDate(inv().booking.checkInDate) }}</span>
                    <span class="step-time">{{ inv().booking.checkInTime || '12:00 PM' }}</span>
                  </div>
                  <div class="timeline-arrow">
                    <span class="nights-pill">{{ inv().booking.calculatedNights }} Night{{ inv().booking.calculatedNights > 1 ? 's' : '' }}</span>
                    <div class="arrow-line"></div>
                  </div>
                  <div class="timeline-step">
                    <span class="step-badge checkout">CHECK-OUT</span>
                    <span class="step-date">{{ invoiceService.formatDisplayDate(inv().booking.checkOutDate) }}</span>
                    <span class="step-time">{{ inv().booking.checkOutTime || '11:00 AM' }}</span>
                  </div>
                </div>

                <div class="booking-specs-row">
                  <span><strong>Room:</strong> {{ inv().booking.roomType }}</span>
                  <span>•</span>
                  <span><strong>Guests:</strong> {{ inv().booking.adults }} Adults{{ inv().booking.children ? ', ' + inv().booking.children + ' Kids' : '' }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Itemized Invoice Table -->
          <div class="invoice-table-section">
            <table class="luxury-table">
              <thead>
                <tr>
                  <th style="width: 38px;" class="text-center">#</th>
                  <th>ROOM / SERVICE DESCRIPTION</th>
                  <th style="width: 95px;" class="text-right">PRICE</th>
                  <th style="width: 55px;" class="text-center">QTY</th>
                  <th style="width: 65px;" class="text-center">NIGHTS</th>
                  <th style="width: 115px;" class="text-right">AMOUNT (₹)</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let item of inv().items; let idx = index">
                  <td class="text-center text-muted">{{ idx + 1 }}</td>
                  <td>
                    <div class="item-desc-text">{{ item.description }}</div>
                    <div *ngIf="item.category === 'room'" class="item-sub-info">
                      Luxury accommodation inclusive of resort amenities
                    </div>
                  </td>
                  <td class="text-right font-mono">₹{{ item.price | number }}</td>
                  <td class="text-center">{{ item.quantity }}</td>
                  <td class="text-center">{{ item.nights }}</td>
                  <td class="text-right font-mono font-bold">₹{{ item.amount | number }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Highlight Note Box -->
          <div *ngIf="inv().notes" class="invoice-notice-banner">
            <div class="notice-icon-circle">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="16" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12.01" y2="8"></line>
              </svg>
            </div>
            <div class="notice-text">
              <strong>{{ inv().notes }}</strong>
            </div>
          </div>

          <!-- Financial Calculation & Payment Section -->
          <div class="calculation-payment-grid">
            
            <!-- Left: Payment Information & Scannable UPI QR -->
            <div class="payment-details-card">
              <div class="section-micro-heading">PAYMENT & BANKING DETAILS</div>
              
              <div class="payment-inner-layout">
                <div class="payment-info-text">
                  <div class="pay-row">
                    <span class="pay-label">UPI ID:</span>
                    <span class="pay-value upi-highlight">{{ inv().payment.upiId }}</span>
                  </div>
                  <div class="pay-row">
                    <span class="pay-label">PAYMENT MODE:</span>
                    <span class="pay-value font-semibold">{{ inv().payment.paymentMode }}</span>
                  </div>
                  <div *ngIf="inv().payment.transactionRef" class="pay-row">
                    <span class="pay-label">REF / UTR:</span>
                    <span class="pay-value font-mono">{{ inv().payment.transactionRef }}</span>
                  </div>
                  <div class="pay-row">
                    <span class="pay-label">DATE:</span>
                    <span class="pay-value">{{ invoiceService.formatDisplayDate(inv().payment.paymentDate) }}</span>
                  </div>

                  <p class="upi-instructions">
                    Scan the QR code with Google Pay, PhonePe, or Paytm to pay advance / remaining amount directly to Nirvana Resort.
                  </p>
                </div>

                <!-- QR Code Box -->
                <div class="qr-code-box">
                  <div class="qr-wrapper">
                    <img 
                      *ngIf="invoiceService.upiQrCodeUrl()" 
                      [src]="invoiceService.upiQrCodeUrl()" 
                      alt="UPI QR Code" 
                      class="upi-qr-image"
                    />
                  </div>
                  <span class="qr-label">SCAN TO PAY UPI</span>
                </div>
              </div>
            </div>

            <!-- Right: Subtotal, Total, Advance, and REMAINING BALANCE -->
            <div class="financial-summary-card">
              <div class="calc-line">
                <span class="calc-label">SUBTOTAL:</span>
                <span class="calc-value font-mono">₹{{ inv().payment.subtotal | number }}</span>
              </div>

              <div *ngIf="inv().payment.taxPercent > 0" class="calc-line">
                <span class="calc-label">GST / TAX ({{ inv().payment.taxPercent }}%):</span>
                <span class="calc-value font-mono">+ ₹{{ inv().payment.taxAmount | number }}</span>
              </div>

              <div *ngIf="inv().payment.discountAmount > 0" class="calc-line discount-line">
                <span class="calc-label">DISCOUNT:</span>
                <span class="calc-value font-mono">- ₹{{ inv().payment.discountAmount | number }}</span>
              </div>

              <div class="calc-line grand-total-line">
                <span class="calc-label">TOTAL AMOUNT:</span>
                <span class="calc-value font-mono total-amount-val">₹{{ inv().payment.grandTotal | number }}</span>
              </div>

              <div class="calc-line advance-paid-line">
                <span class="calc-label">ADVANCE PAID:</span>
                <span class="calc-value font-mono advance-amount-val">₹{{ inv().payment.advancePaid | number }}</span>
              </div>

              <!-- REMAINING BALANCE: Prominent High Impact Card -->
              <div 
                class="remaining-balance-box" 
                [ngClass]="{'cleared-box': inv().payment.remainingBalance === 0}"
              >
                <div class="remaining-meta">
                  <span class="rem-title">REMAINING BALANCE</span>
                  <span class="rem-status">
                    {{ inv().payment.remainingBalance === 0 ? '✓ FULLY PAID' : 'DUE AT CHECK-IN' }}
                  </span>
                </div>
                <div class="rem-amount font-mono">
                  ₹{{ inv().payment.remainingBalance | number }}
                </div>
              </div>
            </div>

          </div>

          <!-- Terms & Conditions Section -->
          <footer class="invoice-footer">
            <div class="footer-terms-block">
              <div class="terms-title">TERMS & CONDITIONS • NIRVANA RESORT</div>
              <ul class="terms-list">
                <li class="primary-term">
                  <strong>CHECK IN TIME 1:00 PM TO CHECK OUT TIME 10:30 AM</strong> | Contact: <strong>{{ inv().resort.phone }}</strong> | <strong>{{ inv().resort.instagram }}</strong>
                </li>
                <li>Valid Government Photo ID proof is required for all adult occupants upon arrival.</li>
                <li>Advance payment confirms reservation; balance payment due upon check-in.</li>
              </ul>
            </div>

            <div class="signature-block">
              <div class="signature-line"></div>
              <div class="signatory-title">AUTHORISED SIGNATORY</div>
              <div class="resort-sign-name">NIRVANA RESORT</div>
            </div>
          </footer>

          <!-- Bottom Accent Strip -->
          <div class="luxury-bottom-strip">
            <div class="strip-green"></div>
            <div class="strip-river"></div>
            <div class="strip-sun"></div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .preview-wrapper {
      display: flex;
      flex-direction: column;
      gap: 14px;
    }

    .preview-actions-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: #FFFFFF;
      padding: 12px 18px;
      border-radius: var(--radius-lg);
      border: 1px solid var(--neutral-border);
      box-shadow: var(--shadow-sm);
      flex-wrap: wrap;
      gap: 10px;
    }

    .preview-badge {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.85rem;
      font-weight: 700;
      color: var(--primary-forest);
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    .preview-indicator {
      width: 9px;
      height: 9px;
      border-radius: 50%;
      background-color: #25D366;
      box-shadow: 0 0 0 3px rgba(37, 211, 102, 0.25);
    }

    .action-buttons-group {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .btn-download {
      min-width: 145px;
    }

    .spinner {
      width: 14px;
      height: 14px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-top-color: #FFFFFF;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    .spinner-dark {
      width: 16px;
      height: 16px;
      border: 2px solid rgba(27, 67, 50, 0.2);
      border-top-color: var(--primary-forest);
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .pdf-generating-banner {
      display: flex;
      align-items: center;
      gap: 10px;
      background: #E8F5E9;
      color: #1B4332;
      border: 1px solid #A5D6A7;
      padding: 10px 16px;
      border-radius: var(--radius-md);
      font-size: 0.88rem;
      font-weight: 600;
    }

    /* A4 Canvas styling */
    .invoice-canvas-wrapper {
      display: flex;
      justify-content: center;
      overflow-x: auto;
      padding: 10px 0 30px 0;
    }

    .invoice-a4-sheet {
      width: 794px; /* Exact 96 DPI A4 width */
      min-height: 1060px;
      background: #FFFFFF;
      box-shadow: var(--shadow-invoice);
      border-radius: 6px;
      padding: 26px 36px;
      position: relative;
      display: flex;
      flex-direction: column;
      box-sizing: border-box;
      color: #1E293B;
    }

    /* Top Strip */
    .luxury-top-strip {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 6px;
      display: flex;
      border-top-left-radius: 6px;
      border-top-right-radius: 6px;
      overflow: hidden;
    }
    .strip-green { flex: 4; background-color: #1B4332; }
    .strip-river { flex: 3; background-color: #2A7F9E; }
    .strip-sun { flex: 1.5; background-color: #E5A93C; }

    /* Header */
    .invoice-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-top: 2px;
      margin-bottom: 14px;
    }

    .brand-block {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .logo-container {
      width: 86px;
      height: 85px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #1c4332;
      padding: 13px;
      border-radius: 50%;
    }

    .resort-logo-img {
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
    }

    .brand-text {
      display: flex;
      flex-direction: column;
    }

    .brand-name {
      font-family: var(--font-serif);
      font-size: 1.65rem;
      font-weight: 700;
      color: #1B4332;
      letter-spacing: 0.03em;
      margin: 0;
      line-height: 1.15;
    }

    .brand-tagline {
      font-size: 0.78rem;
      font-weight: 500;
      color: #2A7F9E;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      margin: 2px 0 6px 0;
    }

    .brand-contact-row {
      display: flex;
      gap: 12px;
    }

    .contact-pill {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      font-size: 0.76rem;
      font-weight: 600;
      color: #475569;
    }

    /* Meta Block */
    .invoice-meta-block {
      text-align: right;
      display: flex;
      flex-direction: column;
      align-items: flex-end;
    }

    .invoice-title-badge {
      background: #1B4332;
      color: #FFFFFF;
      padding: 6px 14px;
      border-radius: 4px;
      margin-bottom: 8px;
    }

    .title-label {
      font-family: var(--font-display);
      font-size: 0.92rem;
      font-weight: 800;
      letter-spacing: 0.12em;
    }

    .meta-data-table {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .meta-row {
      display: flex;
      justify-content: flex-end;
      align-items: center;
      gap: 8px;
      font-size: 0.8rem;
    }

    .meta-key {
      font-weight: 700;
      color: #64748B;
      font-size: 0.74rem;
      letter-spacing: 0.04em;
    }

    .meta-val {
      color: #0F172A;
      font-weight: 600;
    }

    .section-divider {
      height: 2px;
      background: #1B4332;
      margin-bottom: 12px;
    }

    /* Guest & Booking Grid */
    .guest-booking-grid {
      display: grid;
      grid-template-columns: 1fr 1.3fr;
      gap: 12px;
      margin-bottom: 12px;
    }

    .card-info-box {
      border: 1px solid #E2E8F0;
      border-radius: 8px;
      background: #F8FAFC;
      padding: 12px 14px;
    }

    .card-info-box.booking-highlight {
      background: #F0FDF4;
      border-color: #BBF7D0;
    }

    .box-title {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 0.72rem;
      font-weight: 800;
      color: #1B4332;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      margin-bottom: 8px;
      padding-bottom: 5px;
      border-bottom: 1px solid rgba(0, 0, 0, 0.06);
    }

    .guest-name-highlight {
      font-size: 1.05rem;
      font-weight: 800;
      color: #0F172A;
      font-family: var(--font-display);
      margin-bottom: 4px;
      letter-spacing: 0.02em;
    }

    .detail-line {
      display: flex;
      gap: 6px;
      font-size: 0.78rem;
      margin-bottom: 2px;
    }

    .detail-label {
      font-weight: 600;
      color: #64748B;
    }

    .detail-value {
      font-weight: 600;
      color: #1E293B;
    }

    /* Stay Timeline */
    .stay-timeline {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 8px;
    }

    .timeline-step {
      display: flex;
      flex-direction: column;
    }

    .step-badge {
      font-size: 0.65rem;
      font-weight: 800;
      letter-spacing: 0.04em;
      padding: 2px 6px;
      border-radius: 3px;
      width: fit-content;
      margin-bottom: 2px;
    }

    .step-badge.checkin {
      background: #DCFCE7;
      color: #166534;
    }

    .step-badge.checkout {
      background: #E0F2FE;
      color: #0369A1;
    }

    .step-date {
      font-size: 0.88rem;
      font-weight: 700;
      color: #0F172A;
    }

    .step-time {
      font-size: 0.74rem;
      font-weight: 600;
      color: #64748B;
    }

    .timeline-arrow {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 0 8px;
    }

    .nights-pill {
      background: #1B4332;
      color: #FFFFFF;
      font-size: 0.68rem;
      font-weight: 700;
      padding: 2px 8px;
      border-radius: 12px;
      margin-bottom: 2px;
      white-space: nowrap;
    }

    .arrow-line {
      width: 40px;
      height: 1.5px;
      background: #94A3B8;
      position: relative;
    }

    .arrow-line::after {
      content: '';
      position: absolute;
      right: 0;
      top: -3px;
      width: 6px;
      height: 6px;
      border-top: 1.5px solid #94A3B8;
      border-right: 1.5px solid #94A3B8;
      transform: rotate(45deg);
    }

    .booking-specs-row {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.78rem;
      color: #334155;
      padding-top: 4px;
      border-top: 1px dashed #CBD5E1;
    }

    /* Table Section */
    .invoice-table-section {
      margin-bottom: 14px;
    }

    .luxury-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.82rem;
    }

    .luxury-table thead tr {
      background: #1B4332;
      color: #FFFFFF;
    }

    .luxury-table th {
      padding: 8px 10px;
      font-size: 0.72rem;
      font-weight: 700;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      border: none;
    }

    .luxury-table tbody tr {
      border-bottom: 1px solid #E2E8F0;
    }

    .luxury-table tbody tr:nth-child(even) {
      background-color: #F8FAFC;
    }

    .luxury-table td {
      padding: 9px 10px;
      vertical-align: middle;
    }

    .item-desc-text {
      font-weight: 700;
      color: #0F172A;
    }

    .item-sub-info {
      font-size: 0.72rem;
      color: #64748B;
      margin-top: 1px;
    }

    .text-center { text-align: center; }
    .text-right { text-align: right; }
    .text-muted { color: #94A3B8; }
    .font-mono { font-family: monospace; }
    .font-bold { font-weight: 700; }
    .font-semibold { font-weight: 600; }

    /* Notice Banner */
    .invoice-notice-banner {
      display: flex;
      align-items: center;
      gap: 10px;
      background: #FFFBEB;
      border: 1px solid #FDE68A;
      border-left: 4px solid #D97706;
      border-radius: 4px;
      padding: 8px 12px;
      margin-bottom: 12px;
    }

    .notice-icon-circle {
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: #FEF3C7;
      color: #B45309;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .notice-text {
      font-size: 0.78rem;
      color: #92400E;
      letter-spacing: 0.02em;
    }

    /* Calc & Payment Grid */
    .calculation-payment-grid {
      display: grid;
      grid-template-columns: 1.1fr 1fr;
      gap: 14px;
      margin-bottom: 14px;
    }

    .payment-details-card {
      background: #F8FAFC;
      border: 1px solid #E2E8F0;
      border-radius: 8px;
      padding: 12px;
    }

    .section-micro-heading {
      font-size: 0.72rem;
      font-weight: 800;
      color: #1B4332;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      margin-bottom: 8px;
      padding-bottom: 4px;
      border-bottom: 1px solid #E2E8F0;
    }

    .payment-inner-layout {
      display: flex;
      gap: 12px;
      align-items: center;
    }

    .payment-info-text {
      flex: 1;
    }

    .pay-row {
      display: flex;
      gap: 6px;
      font-size: 0.76rem;
      margin-bottom: 4px;
    }

    .pay-label {
      font-weight: 700;
      color: #64748B;
      min-width: 90px;
    }

    .pay-value {
      font-weight: 600;
      color: #0F172A;
    }

    .upi-highlight {
      font-family: monospace;
      font-weight: 800;
      color: #1B4332;
      background: #DCFCE7;
      padding: 1px 6px;
      border-radius: 3px;
    }

    .upi-instructions {
      font-size: 0.68rem;
      color: #64748B;
      line-height: 1.25;
      margin-top: 6px;
    }

    .qr-code-box {
      display: flex;
      flex-direction: column;
      align-items: center;
      flex-shrink: 0;
    }

    .qr-wrapper {
      width: 78px;
      height: 78px;
      background: #FFFFFF;
      border: 1px solid #CBD5E1;
      border-radius: 6px;
      padding: 3px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .upi-qr-image {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }

    .qr-label {
      font-size: 0.62rem;
      font-weight: 800;
      color: #1B4332;
      margin-top: 4px;
      letter-spacing: 0.04em;
    }

    /* Financial Summary Card */
    .financial-summary-card {
      border: 1px solid #E2E8F0;
      border-radius: 8px;
      padding: 12px 14px;
      background: #FFFFFF;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .calc-line {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.8rem;
    }

    .calc-label {
      font-weight: 600;
      color: #475569;
    }

    .calc-value {
      font-weight: 700;
      color: #0F172A;
    }

    .discount-line {
      color: #DC2626;
    }

    .grand-total-line {
      border-top: 1.5px solid #E2E8F0;
      padding-top: 6px;
      margin-top: 2px;
    }

    .grand-total-line .calc-label {
      font-weight: 800;
      color: #0F172A;
      font-size: 0.85rem;
    }

    .total-amount-val {
      font-size: 1.15rem;
      font-weight: 800;
      color: #1B4332;
    }

    .advance-paid-line {
      border-bottom: 1.5px solid #E2E8F0;
      padding-bottom: 6px;
      margin-bottom: 4px;
    }

    .advance-amount-val {
      color: #2D6A4F;
      font-weight: 800;
      font-size: 0.95rem;
    }

    /* REMAINING BALANCE BOX */
    .remaining-balance-box {
      background: #FEF3C7;
      border: 1.5px solid #FCD34D;
      border-radius: 6px;
      padding: 8px 12px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-top: 2px;
    }

    .remaining-balance-box.cleared-box {
      background: #ECFDF5;
      border-color: #6EE7B7;
    }

    .remaining-meta {
      display: flex;
      flex-direction: column;
    }

    .rem-title {
      font-size: 0.72rem;
      font-weight: 800;
      letter-spacing: 0.05em;
      color: #92400E;
    }

    .cleared-box .rem-title {
      color: #065F46;
    }

    .rem-status {
      font-size: 0.65rem;
      font-weight: 700;
      color: #B45309;
    }

    .cleared-box .rem-status {
      color: #047857;
    }

    .rem-amount {
      font-size: 1.35rem;
      font-weight: 800;
      color: #92400E;
      line-height: 1;
    }

    .cleared-box .rem-amount {
      color: #065F46;
    }

    /* Footer */
    .invoice-footer {
      margin-top: auto;
      padding-top: 10px;
      border-top: 1px solid #E2E8F0;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      gap: 20px;
    }

    .footer-terms-block {
      flex: 1;
    }

    .terms-title {
      font-size: 0.72rem;
      font-weight: 800;
      color: #1B4332;
      letter-spacing: 0.05em;
      margin-bottom: 4px;
    }

    .terms-list {
      list-style-type: none;
      padding: 0;
      margin: 0;
      font-size: 0.68rem;
      color: #64748B;
      line-height: 1.4;
    }

    .terms-list li {
      margin-bottom: 2px;
    }

    .primary-term {
      color: #1E293B;
      font-weight: 600;
    }

    .signature-block {
      text-align: center;
      width: 170px;
      flex-shrink: 0;
    }

    .signature-line {
      height: 1px;
      background: #94A3B8;
      margin-bottom: 6px;
    }

    .signatory-title {
      font-size: 0.68rem;
      font-weight: 800;
      color: #0F172A;
      letter-spacing: 0.05em;
    }

    .resort-sign-name {
      font-size: 0.65rem;
      font-weight: 600;
      color: #2A7F9E;
    }

    .luxury-bottom-strip {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 6px;
      display: flex;
      border-bottom-left-radius: 6px;
      border-bottom-right-radius: 6px;
      overflow: hidden;
    }
  `]
})
export class InvoicePreviewComponent {
  @ViewChild('invoiceCanvas') invoiceCanvas!: ElementRef<HTMLElement>;

  public invoiceService = inject(InvoiceService);
  public pdfService = inject(PdfService);
  public inv = this.invoiceService.invoice;
  public logoBase64 = NIRVANA_LOGO_BASE64;

  public downloadPdf(): void {
    const el = this.invoiceCanvas.nativeElement;
    const invData = this.inv();
    const guestClean = (invData.guest.name || 'Guest').replace(/[^a-zA-Z0-9]/g, '_');
    const fileName = `Nirvana_Resort_Invoice_${invData.invoiceNumber}_${guestClean}.pdf`;

    // Save to history automatically on download
    this.invoiceService.saveToHistory();
    this.pdfService.exportToPdf(el, fileName);
  }

  public printInvoice(): void {
    this.invoiceService.saveToHistory();
    this.pdfService.printDirectly();
  }

  public sharePdf(): void {
    const el = this.invoiceCanvas.nativeElement;
    this.invoiceService.saveToHistory();
    this.pdfService.sharePdfFile(el, this.inv());
  }
}
