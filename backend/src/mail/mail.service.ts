import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

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
    const verifyUrl = `http://localhost:3000/verify?token=${token}`;

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
      subject: 'Recuperación de contraseña',
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
}
