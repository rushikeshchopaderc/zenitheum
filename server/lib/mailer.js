import nodemailer from "nodemailer";

/**
 * Team notifications. Preference order: the Gmail API (works on free hosts), then SMTP, otherwise a no-op so the API
 * still works and everything is stored. A failed send is logged and never fails the visitor's request.
 */
export function createMailer(config, log = console, google = null) {
  if (google?.enabled) {
    return {
      enabled: true,
      async send(message) {
        try {
          await google.sendMail(message);
          return true;
        } catch (error) {
          log.error?.(`[mail] Gmail send failed: ${error.message}`);
          return false;
        }
      },
    };
  }

  if (!config.smtp.host) return { enabled: false, send: async () => false };

  const transporter = nodemailer.createTransport({
    host: config.smtp.host,
    port: config.smtp.port,
    secure: config.smtp.port === 465,
    auth: config.smtp.user ? { user: config.smtp.user, pass: config.smtp.pass } : undefined,
  });
  return {
    enabled: true,
    async send({ to, subject, text, replyTo, attachments }) {
      try {
        await transporter.sendMail({ from: config.mail.from, to, subject, text, replyTo, attachments });
        return true;
      } catch (error) {
        log.error?.(`[mail] send failed: ${error.message}`);
        return false;
      }
    },
  };
}
