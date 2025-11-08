import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import PDFDocument from 'pdfkit';

@Injectable()
export class InvoicesService {
  private readonly logger = new Logger(InvoicesService.name);
  /**
   * Genera una factura en PDF con los datos del usuario, curso y compra.
   * @returns la ruta local del PDF generado.
   */
  async generateInvoice({
    user,
    course,
    purchase,
  }: {
    user: { name: string; email: string };
    course: { title: string; price: number };
    purchase: { id: string; amount: number; createdAt: Date };
  }): Promise<string> {
    const invoiceDir = path.join(process.cwd(), 'invoices');
    await fs.promises.mkdir(invoiceDir, { recursive: true });

    const filePath = path.join(invoiceDir, `invoice-${purchase.id}.pdf`);
    const currencyCode = process.env.INVOICE_CURRENCY ?? 'EUR';

    try {
      const doc = new PDFDocument({ margin: 50, size: 'A4' });
      const writeStream = fs.createWriteStream(filePath);
      doc.pipe(writeStream);

      const streamFinished = new Promise<void>((resolve, reject) => {
        doc.on('error', reject);
        writeStream.on('finish', resolve);
        writeStream.on('error', reject);
      });

      const accentColor = '#111827';
      const mutedColor = '#6b7280';
      const borderColor = '#e5e7eb';
      const highlightColor = '#f9fafb';
      const margin = 50;
      const pageWidth = doc.page.width;
      const contentWidth = pageWidth - margin * 2;

      const invoiceNumber = this.formatInvoiceNumber(purchase.id);
      const issueDate = this.parseDate(purchase.createdAt);
      const formattedDate = this.formatDate(issueDate);
      const coursePrice = this.ensureNumber(course.price);
      const totalPaid = this.ensureNumber(purchase.amount ?? coursePrice);
      const safeUserName = user.name || 'Cliente Combat Strike';
      const safeUserEmail = user.email || 'sin-email@combatstrike.com';
      const courseTitle = course.title || 'Curso Combat Strike';

      // Header
      doc
        .save()
        .rect(0, 0, pageWidth, 110)
        .fill(accentColor)
        .restore();

      doc
        .font('Helvetica-Bold')
        .fontSize(24)
        .fillColor('#ffffff')
        .text('Combat Strike', margin, 35, { width: contentWidth });

      doc
        .fontSize(12)
        .fillColor('#ffffff')
        .text('Factura electrónica', margin, 65);

      doc
        .fontSize(10)
        .fillColor('#ffffff')
        .text(
          `Factura Nº ${invoiceNumber}\n${formattedDate}`,
          pageWidth - margin - 200,
          35,
          { width: 200, align: 'right' },
        );

      // Cliente + resumen
      const infoTop = 150;
      const rightColumnX = margin + contentWidth / 2 + 10;
      const rightColumnWidth = contentWidth / 2 - 10;

      doc
        .font('Helvetica')
        .fontSize(11)
        .fillColor(mutedColor)
        .text('Cliente', margin, infoTop);

      doc
        .font('Helvetica-Bold')
        .fontSize(13)
        .fillColor(accentColor)
        .text(safeUserName, margin, infoTop + 16);

      doc
        .font('Helvetica')
        .fontSize(11)
        .fillColor('#111827')
        .text(safeUserEmail, margin, infoTop + 34);

      doc
        .font('Helvetica')
        .fontSize(11)
        .fillColor(mutedColor)
        .text('Datos de la orden', rightColumnX, infoTop, {
          width: rightColumnWidth,
        });

      doc
        .font('Helvetica-Bold')
        .fontSize(12)
        .fillColor(accentColor)
        .text(`Factura Nº ${invoiceNumber}`, rightColumnX, infoTop + 16, {
          width: rightColumnWidth,
        });

      doc
        .font('Helvetica')
        .fontSize(11)
        .fillColor('#111827')
        .text(`Emitida: ${formattedDate}`, rightColumnX, infoTop + 34, {
          width: rightColumnWidth,
        });

      doc
        .font('Helvetica')
        .fontSize(11)
        .fillColor('#111827')
        .text(`Pedido: ${purchase.id}`, rightColumnX, infoTop + 50, {
          width: rightColumnWidth,
        });

      doc
        .save()
        .lineWidth(1)
        .strokeColor(borderColor)
        .moveTo(margin, infoTop + 80)
        .lineTo(margin + contentWidth, infoTop + 80)
        .stroke()
        .restore();

      // Tabla de conceptos
      const tableTop = infoTop + 110;

      doc
        .save()
        .fillColor(accentColor)
        .rect(margin, tableTop, contentWidth, 28)
        .fill()
        .restore();

      doc
        .font('Helvetica-Bold')
        .fontSize(11)
        .fillColor('#ffffff')
        .text('Concepto', margin + 12, tableTop + 8);

      doc.text('Precio', margin + contentWidth - 200, tableTop + 8, {
        width: 80,
        align: 'right',
      });

      doc.text('Total', margin + contentWidth - 90, tableTop + 8, {
        width: 80,
        align: 'right',
      });

      const rowTop = tableTop + 28;
      doc
        .save()
        .fillColor(highlightColor)
        .rect(margin, rowTop, contentWidth, 36)
        .fill()
        .restore();

      doc
        .font('Helvetica')
        .fontSize(11)
        .fillColor('#111827')
        .text(courseTitle, margin + 12, rowTop + 10, {
          width: contentWidth - 240,
        });

      doc.text(this.formatCurrency(coursePrice, currencyCode), margin + contentWidth - 200, rowTop + 10, {
        width: 80,
        align: 'right',
      });

      doc.text(this.formatCurrency(totalPaid, currencyCode), margin + contentWidth - 90, rowTop + 10, {
        width: 80,
        align: 'right',
      });

      // Resumen
      const summaryTop = rowTop + 70;
      doc
        .save()
        .lineWidth(1)
        .fillColor('#ffffff')
        .strokeColor(borderColor)
        .roundedRect(margin, summaryTop, contentWidth, 110, 12)
        .fillAndStroke()
        .restore();

      doc
        .font('Helvetica-Bold')
        .fontSize(13)
        .fillColor(accentColor)
        .text('Resumen del pago', margin + 20, summaryTop + 18);

      const summaryItems = [
        { label: 'Subtotal', value: coursePrice },
        { label: 'Total pagado', value: totalPaid },
      ];

      let summaryY = summaryTop + 48;
      summaryItems.forEach((item) => {
        doc
          .font('Helvetica')
          .fontSize(11)
          .fillColor(mutedColor)
          .text(item.label, margin + 20, summaryY);

        doc
          .font('Helvetica-Bold')
          .fontSize(12)
          .fillColor('#111827')
          .text(this.formatCurrency(item.value, currencyCode), margin + contentWidth - 180, summaryY, {
            width: 160,
            align: 'right',
          });

        summaryY += 22;
      });

      const footerTop = summaryTop + 140;
      doc
        .font('Helvetica')
        .fontSize(10)
        .fillColor(mutedColor)
        .text(
          'Si tienes preguntas sobre esta factura, responde a este correo y estaremos encantados de ayudarte.',
          margin,
          footerTop,
          { width: contentWidth, align: 'center' },
        );

      doc
        .font('Helvetica')
        .fontSize(10)
        .fillColor(mutedColor)
        .text('Gracias por tu compra en Combat Strike.', margin, footerTop + 24, {
          width: contentWidth,
          align: 'center',
        });

      doc.end();
      await streamFinished;

      return filePath;
    } catch (error) {
      await fs.promises.unlink(filePath).catch(() => undefined);
      this.logger.error(
        'Error generando factura',
        error instanceof Error ? error.stack : undefined,
      );
      throw new InternalServerErrorException(
        'No se pudo generar la factura. Inténtalo más tarde.',
      );
    }
  }

  private formatCurrency(value: number, currency: string) {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
    }).format(value);
  }

  private formatDate(date: Date) {
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  }

  private formatInvoiceNumber(id: string | number) {
    const sanitized = String(id ?? '')
      .replace(/[^a-zA-Z0-9]/g, '')
      .toUpperCase();
    return `CS-${sanitized.padStart(6, '0').slice(-12)}`;
  }

  private ensureNumber(value: unknown) {
    const parsed =
      typeof value === 'number' ? value : Number(value ?? 0);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  private parseDate(value: Date | string) {
    const date = value instanceof Date ? value : new Date(value);
    return Number.isNaN(date.getTime()) ? new Date() : date;
  }
}
