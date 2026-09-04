import { Injectable, signal } from '@angular/core';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Invoice } from '../models/invoice.model';

@Injectable({
  providedIn: 'root'
})
export class PdfService {
  public isGenerating = signal<boolean>(false);
  public progressMessage = signal<string>('');

  /**
   * Builds the jsPDF document from a DOM element
   */
  public async createPdfDocument(element: HTMLElement): Promise<jsPDF | null> {
    if (!element) return null;

    // Pause to let DOM settle and all fonts/images render
    await new Promise(resolve => setTimeout(resolve, 200));

    // Capture at high resolution (scale 2 for crisp 300+ DPI Retina quality)
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#FFFFFF',
      logging: false,
      imageTimeout: 15000
    });

    // Use JPEG with high quality 0.95 for reliable, ultra-crisp output
    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    
    // Standard A4: 210 x 297 mm
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true
    });

    const pdfWidth = 210;
    const pdfHeight = 297;
    
    const imgRatio = canvas.height / canvas.width;
    const a4Ratio = pdfHeight / pdfWidth; // ~1.4143

    // Fit on exactly 1 single page!
    if (imgRatio <= a4Ratio * 1.25) {
      let printW = pdfWidth;
      let printH = printW * imgRatio;

      if (printH > pdfHeight) {
        printH = pdfHeight;
        printW = printH / imgRatio;
      }

      const offsetX = (pdfWidth - printW) / 2;
      const offsetY = (pdfHeight - printH) / 2;

      pdf.addImage(imgData, 'JPEG', offsetX, offsetY, printW, printH, undefined, 'FAST');
    } else {
      // Genuine multi-page document
      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
      heightLeft -= pdfHeight;

      while (heightLeft > 15) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
        heightLeft -= pdfHeight;
      }
    }

    return pdf;
  }

  /**
   * Generates and downloads high-definition A4 PDF from a DOM element
   */
  public async exportToPdf(element: HTMLElement, fileName: string): Promise<void> {
    this.isGenerating.set(true);
    this.progressMessage.set('Preparing luxury high-definition PDF...');

    try {
      this.progressMessage.set('Rendering crisp vector graphics & fonts...');
      const pdf = await this.createPdfDocument(element);
      if (!pdf) return;

      this.progressMessage.set('Downloading PDF...');
      const cleanFileName = fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`;
      pdf.save(cleanFileName);
    } catch (error) {
      console.error('Error creating PDF:', error);
      alert('Could not create PDF automatically. You can also use the "Print Invoice" button to save as PDF.');
    } finally {
      this.isGenerating.set(false);
      this.progressMessage.set('');
    }
  }

  /**
   * Direct Share: Sends PDF directly to WhatsApp / Gmail using the Web Share API (File Sharing)
   */
  public async sharePdfFile(element: HTMLElement, inv: Invoice): Promise<void> {
    const guestClean = (inv.guest.name || 'Guest').replace(/[^a-zA-Z0-9]/g, '_');
    const fileName = `Nirvana_Resort_Invoice_${inv.invoiceNumber}_${guestClean}.pdf`;

    this.isGenerating.set(true);
    this.progressMessage.set('Preparing PDF for sharing...');

    try {
      const pdf = await this.createPdfDocument(element);
      if (!pdf) return;

      const pdfBlob = pdf.output('blob');
      const pdfFile = new File([pdfBlob], fileName, { type: 'application/pdf' });

      // Check if browser supports direct file sharing (Mobile Chrome/Safari/macOS)
      if (navigator.canShare && navigator.canShare({ files: [pdfFile] })) {
        this.progressMessage.set('Opening Share Sheet (Select WhatsApp or Gmail)...');
        await navigator.share({
          files: [pdfFile],
          title: `Nirvana Resort Invoice - ${inv.invoiceNumber}`,
          text: `Booking Invoice & Confirmation for ${inv.guest.name || 'Valued Guest'} - Nirvana Resort.`
        });
      } else {
        // Desktop browser fallback: Download PDF and prompt for WhatsApp / Gmail
        pdf.save(fileName);
        const choice = confirm(
          `📄 PDF downloaded as "${fileName}"!\n\nWould you like to open WhatsApp Web to send it to the guest now?`
        );
        if (choice) {
          const phone = inv.guest.phone.replace(/[^0-9]/g, '');
          const formattedPhone = phone.length === 10 ? `91${phone}` : phone;
          const text = encodeURIComponent(`Hello ${inv.guest.name || 'Guest'}, please find your Nirvana Resort Booking Invoice PDF attached.`);
          window.open(`https://web.whatsapp.com/send?phone=${formattedPhone}&text=${text}`, '_blank');
        }
      }
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        console.error('Share error:', error);
      }
    } finally {
      this.isGenerating.set(false);
      this.progressMessage.set('');
    }
  }

  /**
   * Native browser print with print-tailored CSS
   */
  public printDirectly(): void {
    window.print();
  }
}
