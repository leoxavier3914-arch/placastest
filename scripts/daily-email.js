import emailjs from '@emailjs/nodejs';
import PDFDocument from 'pdfkit';

/**
 * Generate a simple PDF buffer.
 * @returns {Promise<Buffer>} A buffer containing the PDF data.
 */
function generatePdf() {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument();
    const buffers = [];
    doc.on('data', (data) => buffers.push(data));
    doc.on('end', () => resolve(Buffer.concat(buffers)));
    doc.on('error', reject);

    doc.fontSize(20).text('Relatório diário', { align: 'center' });
    doc.end();
  });
}

/**
 * Send the PDF via EmailJS.
 * Expects the following environment variables:
 *   EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID,
 *   EMAILJS_PUBLIC_KEY, EMAILJS_PRIVATE_KEY, EMAILJS_RECIPIENTS
 */
async function sendEmail(pdfBuffer) {
  const pdfBase64 = pdfBuffer.toString('base64');
  const templateParams = {
    to_email: process.env.EMAILJS_RECIPIENTS,
    attachment: pdfBase64,
  };

  await emailjs.send(
    process.env.EMAILJS_SERVICE_ID,
    process.env.EMAILJS_TEMPLATE_ID,
    templateParams,
    {
      publicKey: process.env.EMAILJS_PUBLIC_KEY,
      privateKey: process.env.EMAILJS_PRIVATE_KEY,
    }
  );
}

export async function runDailyEmail() {
  const pdf = await generatePdf();
  await sendEmail(pdf);
  console.log('Daily email sent');
}

// Allow manual execution: `node scripts/daily-email.js`
if (import.meta.url === `file://${process.argv[1]}`) {
  runDailyEmail().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
