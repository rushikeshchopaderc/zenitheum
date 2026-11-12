import nodemailer from "nodemailer";

/**
 * Optional e-mail notifications. With no SMTP_HOST configured the mailer is a
 * no-op, so the API works out of the box and submissions are still stored.
 * A failed send is logged and never fails the visitor's request.
 */
export function createMailer(config, log = console) {
  if (!config.smtp.host) {
    return { enabled: false, send: async () => false };
  }

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
