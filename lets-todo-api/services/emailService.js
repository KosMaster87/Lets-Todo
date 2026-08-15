/**
 * @fileoverview Email service for password reset and other notifications
 * @description Provides functions for sending emails
 * @module services/emailService
 */

import nodemailer from "nodemailer";
import {
  ENV,
  ENVIRONMENT,
  debugLog,
  errorLog,
} from "./../config/environment.js";

/**
 * Email service for password reset and other notifications
 */
class EmailService {
  constructor() {
    this.transporter = null;
    this.initializeTransporter();
  }

  /**
   * Initializes the email transporter based on environment variables
   */
  initializeTransporter() {
    try {
      if (ENV.EMAIL_PROVIDER === "gmail") {
        this.setupGmailTransporter();
      } else if (ENV.EMAIL_PROVIDER === "outlook") {
        this.setupOutlookTransporter();
      } else if (ENV.EMAIL_PROVIDER === "smtp") {
        this.setupCustomSmtpTransporter();
      } else if (ENVIRONMENT === "development" && !ENV.EMAIL_PROVIDER) {
        debugLog("📧 Development mode - Emails will be printed to console");
        return;
      } else {
        throw new Error("No valid email provider configured");
      }
    } catch (error) {
      errorLog("❌ Error initializing email transporter:", error.message);
      this.transporter = null;
    }
  }

  /**
   * Creates Gmail SMTP transporter
   */
  setupGmailTransporter() {
    this.transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: ENV.EMAIL_USER,
        pass: ENV.EMAIL_PASSWORD, // App password, not a regular password!
      },
    });
    debugLog("📧 Gmail SMTP Transporter initialized");
  }

  /**
   * Creates Outlook SMTP transporter
   */
  setupOutlookTransporter() {
    this.transporter = nodemailer.createTransport({
      service: "hotmail",
      auth: {
        user: ENV.EMAIL_USER,
        pass: ENV.EMAIL_PASSWORD,
      },
    });
    debugLog("📧 Outlook SMTP Transporter initialized");
  }

  /**
   * Creates custom SMTP transporter
   */
  setupCustomSmtpTransporter() {
    this.transporter = nodemailer.createTransport({
      host: ENV.EMAIL_HOST,
      port: ENV.EMAIL_PORT || 587,
      secure: ENV.EMAIL_SECURE === "true",
      auth: {
        user: ENV.EMAIL_USER,
        pass: ENV.EMAIL_PASSWORD,
      },
    });
    debugLog(`📧 Custom SMTP Transporter initialized (${ENV.EMAIL_HOST})`);
  }

  /**
   * Sends a password reset email
   * @param {string} toEmail - Recipient email address
   * @param {string} resetToken - Reset token for the link
   * @param {string} userName - User name (optional)
   */
  async sendPasswordResetEmail(toEmail, resetToken, userName = null) {
    const resetLink = `${ENV.FRONTEND_URL}/reset-password-confirm/${resetToken}`;

    const mailOptions = {
      from: `"${ENV.APP_NAME || "Let's Todo"}" <${ENV.EMAIL_USER}>`,
      to: toEmail,
      subject: "Reset Password - Let's Todo",
      html: this.generatePasswordResetHTML(resetLink, userName),
      text: this.generatePasswordResetText(resetLink, userName),
    };

    return await this.sendEmail(mailOptions);
  }

  /**
   * Sends an email
   * @param {Object} mailOptions - Email options
   */
  async sendEmail(mailOptions) {
    try {
      // Development Modus - nur in Console ausgeben
      if (!this.transporter) {
        console.log("\n📧 ===== EMAIL (DEVELOPMENT) =====");
        console.log("From:", mailOptions.from);
        console.log("To:", mailOptions.to);
        console.log("Subject:", mailOptions.subject);
        console.log("Text:", mailOptions.text);
        console.log("=====================================\n");
        return { success: true, messageId: "dev-mode", mode: "development" };
      }

      // Echte E-Mail senden
      const info = await this.transporter.sendMail(mailOptions);
      debugLog(`📧 Email sent successfully: ${info.messageId}`);

      return {
        success: true,
        messageId: info.messageId,
        mode: "production",
      };
    } catch (error) {
      errorLog("❌ Error sending email:", error.message);
      throw new Error(`Email sending failed: ${error.message}`);
    }
  }

  /**
   * Generates HTML template for password reset email
   * @param {string} resetLink - Reset link URL
   * @param {string} userName - User name (optional)
   */
  generatePasswordResetHTML(resetLink, userName = null) {
    const greeting = userName ? `Hello ${userName}` : "Hello";

    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Password</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #007bff; color: white; padding: 20px; text-align: center; }
            .content { padding: 30px 20px; }
            .button {
                display: inline-block;
                background: #007bff;
                color: white;
                padding: 12px 30px;
                text-decoration: none;
                border-radius: 5px;
                margin: 20px 0;
            }
            .footer { background: #f8f9fa; padding: 15px; text-align: center; font-size: 12px; color: #666; }
            .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🔐 Reset Password</h1>
            </div>

            <div class="content">
                <h2>${greeting}!</h2>

                <p>You have requested to reset your password for <strong>Let's Todo</strong>.</p>

                <p>Click the following button to create a new password:</p>

                <div style="text-align: center;">
                    <a href="${resetLink}" class="button">Reset Password</a>
                </div>

                <div class="warning">
                    <strong>⚠️ Important Security Notice:</strong>
                    <ul>
                        <li>This link is valid for <strong>1 hour</strong> only</li>
                        <li>The link can be used <strong>only once</strong></li>
                        <li>If you did not request this, please ignore this email</li>
                    </ul>
                </div>

                <p>If the button doesn't work, copy this link into your browser:</p>
                <p style="word-break: break-all; background: #f8f9fa; padding: 10px; border-radius: 3px;">
                    ${resetLink}
                </p>
            </div>

            <div class="footer">
                <p>This email was automatically generated. Please do not reply to this email.</p>
                <p>© ${new Date().getFullYear()} Let's Todo - Your Personal Todo Management</p>
            </div>
        </div>
    </body>
    </html>
    `;
  }

  /**
   * Generates text version for password reset email
   * @param {string} resetLink - Reset link URL
   * @param {string} userName - User name (optional)
   */
  generatePasswordResetText(resetLink, userName = null) {
    const greeting = userName ? `Hello ${userName}` : "Hello";

    return `
    ${greeting}!

    You have requested to reset your password for Let's Todo.

    To create a new password, open the following link in your browser:
    ${resetLink}

    IMPORTANT SECURITY NOTICE:
    - This link is valid for 1 hour only
    - The link can be used only once
    - If you did not request this, please ignore this email

    If you have any problems, please contact support.

    ---
    This email was automatically generated.
    © ${new Date().getFullYear()} Let's Todo
    `.trim();
  }

  /**
   * Tests the email configuration
   */
  async testConnection() {
    if (!this.transporter) {
      return { success: false, error: "No email transporter configured" };
    }

    try {
      await this.transporter.verify();
      return {
        success: true,
        message: "Email configuration successfully tested",
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

// Export singleton instance
export const emailService = new EmailService();
