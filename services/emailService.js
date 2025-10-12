// lets-todo-api/services/emailService.js

import nodemailer from "nodemailer";
import {
  ENV,
  ENVIRONMENT,
  debugLog,
  errorLog,
} from "./../config/environment.js";

/**
 * E-Mail-Service für Password-Reset und andere Benachrichtigungen
 */
class EmailService {
  constructor() {
    this.transporter = null;
    this.initializeTransporter();
  }

  /**
   * Initialisiert den E-Mail-Transporter basierend auf Umgebungsvariablen
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
        debugLog("📧 Development Modus - E-Mails werden in Console ausgegeben");
        return;
      } else {
        throw new Error("Kein gültiger E-Mail-Provider konfiguriert");
      }
    } catch (error) {
      errorLog(
        "❌ Fehler beim Initialisieren des E-Mail-Transporters:",
        error.message
      );
      this.transporter = null;
    }
  }

  /**
   * Erstellt Gmail SMTP Transporter
   */
  setupGmailTransporter() {
    this.transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: ENV.EMAIL_USER,
        pass: ENV.EMAIL_PASSWORD, // App-Password, nicht normales Passwort!
      },
    });
    debugLog("📧 Gmail SMTP Transporter initialisiert");
  }

  /**
   * Erstellt Outlook SMTP Transporter
   */
  setupOutlookTransporter() {
    this.transporter = nodemailer.createTransport({
      service: "hotmail",
      auth: {
        user: ENV.EMAIL_USER,
        pass: ENV.EMAIL_PASSWORD,
      },
    });
    debugLog("📧 Outlook SMTP Transporter initialisiert");
  }

  /**
   * Erstellt Custom SMTP Transporter
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
    debugLog(`📧 Custom SMTP Transporter initialisiert (${ENV.EMAIL_HOST})`);
  }

  /**
   * Sendet eine Password-Reset-E-Mail
   * @param {string} toEmail - Empfänger E-Mail-Adresse
   * @param {string} resetToken - Reset-Token für den Link
   * @param {string} userName - Name des Users (optional)
   */
  async sendPasswordResetEmail(toEmail, resetToken, userName = null) {
    const resetLink = `${ENV.FRONTEND_URL}/reset-password-confirm/${resetToken}`;

    const mailOptions = {
      from: `"${ENV.APP_NAME || "Let's Todo"}" <${ENV.EMAIL_USER}>`,
      to: toEmail,
      subject: "Passwort zurücksetzen - Let's Todo",
      html: this.generatePasswordResetHTML(resetLink, userName),
      text: this.generatePasswordResetText(resetLink, userName),
    };

    return await this.sendEmail(mailOptions);
  }

  /**
   * Sendet eine E-Mail
   * @param {Object} mailOptions - E-Mail-Optionen
   */
  async sendEmail(mailOptions) {
    try {
      // Development Modus - nur in Console ausgeben
      if (!this.transporter) {
        console.log("\n📧 ===== E-MAIL (DEVELOPMENT) =====");
        console.log("From:", mailOptions.from);
        console.log("To:", mailOptions.to);
        console.log("Subject:", mailOptions.subject);
        console.log("Text:", mailOptions.text);
        console.log("=====================================\n");
        return { success: true, messageId: "dev-mode", mode: "development" };
      }

      // Echte E-Mail senden
      const info = await this.transporter.sendMail(mailOptions);
      debugLog(`📧 E-Mail erfolgreich gesendet: ${info.messageId}`);

      return {
        success: true,
        messageId: info.messageId,
        mode: "production",
      };
    } catch (error) {
      errorLog("❌ Fehler beim E-Mail-Versand:", error.message);
      throw new Error(`E-Mail-Versand fehlgeschlagen: ${error.message}`);
    }
  }

  /**
   * Generiert HTML-Template für Password-Reset-E-Mail
   * @param {string} resetLink - Reset-Link URL
   * @param {string} userName - Name des Users (optional)
   */
  generatePasswordResetHTML(resetLink, userName = null) {
    const greeting = userName ? `Hallo ${userName}` : "Hallo";

    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Passwort zurücksetzen</title>
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
                <h1>🔐 Passwort zurücksetzen</h1>
            </div>

            <div class="content">
                <h2>${greeting}!</h2>

                <p>Du hast eine Anfrage zum Zurücksetzen deines Passworts für <strong>Let's Todo</strong> gestellt.</p>

                <p>Klicke auf den folgenden Button, um ein neues Passwort zu erstellen:</p>

                <div style="text-align: center;">
                    <a href="${resetLink}" class="button">Passwort zurücksetzen</a>
                </div>

                <div class="warning">
                    <strong>⚠️ Wichtige Sicherheitshinweise:</strong>
                    <ul>
                        <li>Dieser Link ist nur <strong>1 Stunde</strong> gültig</li>
                        <li>Der Link kann nur <strong>einmal</strong> verwendet werden</li>
                        <li>Falls du diese Anfrage nicht gestellt hast, ignoriere diese E-Mail</li>
                    </ul>
                </div>

                <p>Falls der Button nicht funktioniert, kopiere diesen Link in deinen Browser:</p>
                <p style="word-break: break-all; background: #f8f9fa; padding: 10px; border-radius: 3px;">
                    ${resetLink}
                </p>
            </div>

            <div class="footer">
                <p>Diese E-Mail wurde automatisch erstellt. Bitte antworte nicht auf diese E-Mail.</p>
                <p>© ${new Date().getFullYear()} Let's Todo - Deine persönliche Todo-Verwaltung</p>
            </div>
        </div>
    </body>
    </html>
    `;
  }

  /**
   * Generiert Text-Version für Password-Reset-E-Mail
   * @param {string} resetLink - Reset-Link URL
   * @param {string} userName - Name des Users (optional)
   */
  generatePasswordResetText(resetLink, userName = null) {
    const greeting = userName ? `Hallo ${userName}` : "Hallo";

    return `
    ${greeting}!

    Du hast eine Anfrage zum Zurücksetzen deines Passworts für Let's Todo gestellt.

    Um ein neues Passwort zu erstellen, öffne folgenden Link in deinem Browser:
    ${resetLink}

    WICHTIGE SICHERHEITSHINWEISE:
    - Dieser Link ist nur 1 Stunde gültig
    - Der Link kann nur einmal verwendet werden
    - Falls du diese Anfrage nicht gestellt hast, ignoriere diese E-Mail

    Falls du Probleme hast, wende dich an den Support.

    ---
    Diese E-Mail wurde automatisch erstellt.
    © ${new Date().getFullYear()} Let's Todo
    `.trim();
  }

  /**
   * Testet die E-Mail-Konfiguration
   */
  async testConnection() {
    if (!this.transporter) {
      return { success: false, error: "Kein E-Mail-Transporter konfiguriert" };
    }

    try {
      await this.transporter.verify();
      return {
        success: true,
        message: "E-Mail-Konfiguration erfolgreich getestet",
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

// Singleton-Instanz exportieren
export const emailService = new EmailService();
