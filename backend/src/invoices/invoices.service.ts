import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import PDFDocument from 'pdfkit';

@Injectable()
export class InvoicesService {
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
    const doc = new PDFDocument({ margin: 50 });
    const writeStream = fs.createWriteStream(filePath);
    doc.pipe(writeStream);

    // 🧾 Encabezado
    doc
      .fontSize(20)
      .text('Factura - Combat Strike', { align: 'center' })
      .moveDown(1);

    // Datos del usuario
    doc
      .fontSize(12)
      .text(`Cliente: ${user.name}`)
      .text(`Email: ${user.email}`)
      .text(`Fecha: ${new Date(purchase.createdAt).toLocaleDateString()}`)
      .moveDown(1);

    // Detalle del curso
    doc
      .fontSize(14)
      .text(`Curso: ${course.title}`)
      .text(`Importe: ${course.price.toFixed(2)} €`)
      .text(`Total pagado: ${purchase.amount.toFixed(2)} €`)
      .moveDown(2);

    // Footer
    doc
      .fontSize(10)
      .text('Gracias por tu compra en Combat Strike.', { align: 'center' });

    doc.end();

    // ✅ Esperar a que termine de escribirse el archivo
    await new Promise<void>((resolve) =>
      writeStream.on('finish', () => resolve()),
    );

    return filePath;
  }
}
