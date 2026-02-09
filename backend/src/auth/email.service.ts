import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter | null = null;

  constructor(private readonly configService: ConfigService) {}

  private async getTransporter(): Promise<nodemailer.Transporter> {
    if (this.transporter) return this.transporter;

    const smtpHost = this.configService.get<string>('SMTP_HOST');

    if (smtpHost) {
      this.transporter = nodemailer.createTransport({
        host: smtpHost,
        port: this.configService.get<number>('SMTP_PORT', 587),
        auth: {
          user: this.configService.get<string>('SMTP_USER'),
          pass: this.configService.get<string>('SMTP_PASS'),
        },
      });
    } else {
      const testAccount = await nodemailer.createTestAccount();
      this.transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
      this.logger.log(`Using Ethereal test email: ${testAccount.user}`);
    }

    return this.transporter;
  }

  async sendResetEmail(to: string, resetUrl: string): Promise<void> {
    const transporter = await this.getTransporter();

    const info = await transporter.sendMail({
      from: '"Favorite Movies" <noreply@favorite-movies.app>',
      to,
      subject: 'Reset your password',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 2rem;">
          <h2 style="color: #2f9e5a;">Reset your password</h2>
          <p>You requested a password reset for your Favorite Movies account.</p>
          <p>Click the button below to set a new password. This link expires in 1 hour.</p>
          <a href="${resetUrl}"
             style="display: inline-block; background: #2f9e5a; color: white; padding: 12px 24px;
                    border-radius: 8px; text-decoration: none; font-weight: 600; margin: 1rem 0;">
            Reset Password
          </a>
          <p style="color: #888; font-size: 0.85rem;">
            If you didn't request this, you can safely ignore this email.
          </p>
        </div>
      `,
    });

    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      this.logger.log(`Password reset email preview: ${previewUrl}`);
    }
  }
}
