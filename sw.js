importScripts('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');
importScripts('https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js');

const CACHE_NAME = 'placas-cache-v1';
const URLS_TO_CACHE = [
  '/',
  'index.html',
  'css/style.css',
  'assets/Icone.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(URLS_TO_CACHE))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => response || fetch(event.request))
  );
});

// ===== Agendamento de envio diário de e-mail =====
const EMAILJS_SERVICE_ID = 'service_t9bocqh';
const EMAILJS_TEMPLATE_ID = 'template_n4uw7xi';
const EMAILJS_PUBLIC_KEY = 'vPVpXFO3k8QblVbqr';

emailjs.init(EMAILJS_PUBLIC_KEY);

async function enviarEmailDiario() {
  try {
    const { jsPDF } = self.jspdf;
    const doc = new jsPDF();
    doc.text('Histórico diário', 10, 10);
    const pdfDataUri = doc.output('datauristring');

    await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
      to_email: 'leomatos3914@gmail.com',
      message: 'Envio automático diário',
      attachment: pdfDataUri,
    });
    console.log('E-mail diário enviado');
  } catch (err) {
    console.error('Falha ao enviar e-mail diário', err);
  }
}

self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'daily-email') {
    event.waitUntil(enviarEmailDiario());
  }
});

