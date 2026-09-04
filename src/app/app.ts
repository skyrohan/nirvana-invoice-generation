import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InvoiceEditorComponent } from './components/invoice-editor.component';
import { InvoicePreviewComponent } from './components/invoice-preview.component';
import { HistoryDrawerComponent } from './components/history-drawer.component';
import { InvoiceService } from './services/invoice.service';
import { PdfService } from './services/pdf.service';
import { NIRVANA_LOGO_BASE64 } from './models/logo-base64';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    InvoiceEditorComponent,
    InvoicePreviewComponent,
    HistoryDrawerComponent
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  public invoiceService = inject(InvoiceService);
  public pdfService = inject(PdfService);

  public logoBase64 = NIRVANA_LOGO_BASE64;
  public showHistory = false;
  public activeTab: 'edit' | 'preview' = 'edit'; // For mobile responsiveness

  public saveCurrent(): void {
    this.invoiceService.saveToHistory();
    alert('Invoice saved successfully to local records!');
  }

  public resetExample(): void {
    this.invoiceService.resetToSample();
  }

  public newInvoice(): void {
    if (confirm('Create a new blank invoice? Any unsaved edits will be replaced.')) {
      this.invoiceService.createNewBlankInvoice();
    }
  }
}
