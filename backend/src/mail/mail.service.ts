import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import * as fs from 'fs';

@Injectable()
export class MailService {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail', // o usa SMTP de tu proveedor
      auth: {
        user: process.env.EMAIL_USER, // config en .env
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  async sendVerificationEmail(to: string, token: string) {
    const verifyUrl = `${process.env.FRONTEND_URL}/verify?token=${token}`;

    await this.transporter.sendMail({
      from: `"DL Combat Strike" <${process.env.EMAIL_USER}>`,
      to,
      subject: 'Verifica tu correo',
      html: `
        <div style="font-family: Arial, sans-serif; color: #333;">
          <h1 style="color: #055293;">¡Bienvenido a DL Combat Strike!</h1>
          <p>Haz clic en el botón de abajo para verificar tu cuenta:</p>
          <a href="${verifyUrl}" 
             style="
               display: inline-block;
               padding: 12px 24px;
               margin-top: 10px;
               background-color: #055293;
               color: #ffffff;
               text-decoration: none;
               border-radius: 6px;
               font-weight: bold;
             ">
            Verificar cuenta
          </a>
          <p style="margin-top: 20px; font-size: 0.9rem; color: #555;">
            Si no creaste esta cuenta, ignora este correo.
          </p>
        </div>
      `,
    });
  }
  // 🔹 Email para resetear contraseña
  async sendResetPasswordEmail(to: string, resetLink: string) {
    await this.transporter.sendMail({
      from: `"DL Combat Strike" <${process.env.EMAIL_USER}>`,
      to,
      subject: 'Restablecer contraseña',
      html: `
      <div style="font-family: Arial, sans-serif; color: #333;">
        <h1 style="color: #055293;">Recupera tu contraseña</h1>
        <p>Haz clic en el botón de abajo para restablecer tu contraseña:</p>
        <a href="${resetLink}" 
           style="
             display: inline-block;
             padding: 12px 24px;
             margin-top: 10px;
             background-color: #055293;
             color: #ffffff;
             text-decoration: none;
             border-radius: 6px;
             font-weight: bold;
           ">
          Restablecer contraseña
        </a>
        <p style="margin-top: 20px; font-size: 0.9rem; color: #555;">
          Si no solicitaste este cambio, ignora este correo.
        </p>
      </div>
    `,
    });
  }

  /**
   * 🔹 Envía una factura PDF al usuario después de la compra.
   */
  async sendInvoiceEmail(to: string, pdfPath: string) {
    await this.transporter.sendMail({
      from: `"DL Combat Strike" <${process.env.EMAIL_USER}>`,
      to,
      subject: 'Tu factura de compra 🧾',
      html: `
        <div style="font-family: Arial, sans-serif;">
          <h1 style="color: #055293;">Gracias por tu compra en DL Combat Strike</h1>
          <p>Adjuntamos tu factura en formato PDF. ¡Guárdala para tus registros!</p>
          <p style="font-size: 0.9rem; color: #555;">Si tienes cualquier duda, contáctanos a soporte@combatstrike.es.</p>
        </div>
      `,
      attachments: [
        {
          filename: pdfPath.split('/').pop(),
          content: fs.createReadStream(pdfPath),
        },
      ],
    });
  }
  /**
   * 🔹 Envía el correo del usuario al correo de la empresa
   */
  async sendContactEmail(name: string, email: string, subject: string, message: string) {
    const to = process.env.CONTACT_EMAIL || process.env.EMAIL_USER;
    if (!to) {
      throw new Error('CONTACT_EMAIL/EMAIL_USER no configurado en variables de entorno');
    }

    await this.transporter.sendMail({
      from: `"DL Combat Strike - Contacto" <${to}>`,
      to,
      replyTo: email,
      subject: subject || 'Nuevo mensaje de contacto',
      html: `
        <div style="font-family: Arial, sans-serif; color: #111827; line-height: 1.5;">
          <h1 style="margin: 0 0 12px; color: #055293;">Nuevo mensaje desde el formulario de contacto</h1>
          <p style="margin: 0 0 4px;"><strong>Nombre:</strong> ${name || '—'}</p>
          <p style="margin: 0 0 12px;"><strong>Email:</strong> ${email}</p>
          <p style="margin: 0 0 8px;"><strong>Asunto:</strong> ${subject || 'Sin asunto'}</p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 16px 0;" />
          <p style="white-space: pre-wrap; margin: 0;">${message}</p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 16px 0;" />
          <p style="font-size: 0.85rem; color: #6b7280;">
            Responde directamente a este correo para contestar al usuario.
          </p>
        </div>
      `,
    });
  }
}
