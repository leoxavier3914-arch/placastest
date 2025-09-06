import emailjs from '@emailjs/nodejs';
import PDFDocument from 'pdfkit';
import fs from 'fs';

/**
 * Gera um PDF com os registros do histórico.
 * @param {Array} registros Lista de objetos do histórico
 * @param {string} dataRelatorio Texto da data exibida no cabeçalho
 * @returns {Promise<Buffer>} Buffer contendo os dados do PDF
 */
function gerarRelatorioPDF(registros, dataRelatorio) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 30 });
    const buffers = [];
    doc.on('data', (d) => buffers.push(d));
    doc.on('end', () => resolve(Buffer.concat(buffers)));
    doc.on('error', reject);

    const headers = ['Placa', 'Nome', 'Tipo', 'RG/CPF', 'Status', 'Entrada', 'Saída'];
    const colWidths = [60, 100, 60, 80, 60, 60, 60];

    doc.fontSize(16).text('Empresa XYZ', { align: 'center' });
    doc.fontSize(12).text(`Data do relatório: ${dataRelatorio}`, { align: 'center' });
    doc.moveDown();

    let x = doc.page.margins.left;
    let y = doc.y;
    doc.fontSize(10);

    headers.forEach((h, i) => {
      doc.text(h, x, y, { width: colWidths[i], align: 'left' });
      x += colWidths[i];
    });

    y += 20;
    registros.forEach((reg) => {
      x = doc.page.margins.left;
      const row = [
        reg.placa,
        reg.nome,
        reg.tipo,
        reg.rgcpf,
        reg.status,
        reg.horarioEntrada || '-',
        reg.horarioSaida || '-',
      ];
      row.forEach((cell, i) => {
        doc.text(String(cell), x, y, { width: colWidths[i], align: 'left' });
        x += colWidths[i];
      });
      y += 20;
    });

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
  const filePath = new URL('../data/historico.json', import.meta.url);
  let registros = [];
  try {
    registros = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  } catch (err) {
    console.warn('histórico não encontrado, enviando PDF vazio');
  }
  const dataRelatorio = new Date().toLocaleDateString('pt-BR');
  const registrosHoje = registros.filter((r) => r.data === dataRelatorio);
  const pdf = await gerarRelatorioPDF(registrosHoje, dataRelatorio);

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
