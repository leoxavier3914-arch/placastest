// ===== Envio de e-mails =====
function enviarPDFManual() {
  const hoje = formatarData(new Date());
  const filtered = bancoHistorico.filter(item => item.data === hoje);
  if (filtered.length === 0) {
    alert("Nenhum histórico encontrado para hoje!");
    return;
  }
  let mensagem = "📌 Histórico de Placas - " + hoje + "\n\n";
  filtered.forEach(item => {
    mensagem += `🚗 Placa: ${item.placa} | 👤 Nome: ${item.nome} | 🏷 Tipo: ${item.tipo} | 🆔 RG/CPF: ${item.rgcpf} | 📍 Status: ${item.status} | ⏰ Entrada: ${item.horarioEntrada || "-"} | ⏱ Saída: ${item.horarioSaida || "-"}\n`;
  });
  emailjs.send("service_t9bocqh", "template_n4uw7xi", {
    to_email: "leomatos3914@gmail.com",
    title: "Histórico Diário (Envio Manual)",
    name: "Sistema de Placas",
    message: mensagem
  }).then(() => {
    alert("📧 Histórico enviado manualmente com sucesso!");
  }).catch(err => {
    alert("❌ Erro ao enviar: " + JSON.stringify(err));
  });
}

const horaEnvio = 18;
const minutoEnvio = 30;

function jaEnviouHoje() {
  const ultimoEnvio = localStorage.getItem("ultimoEnvio");
  const hoje = formatarData(new Date());
  return ultimoEnvio === hoje;
}

function marcarEnvio() {
  const hoje = formatarData(new Date());
  localStorage.setItem("ultimoEnvio", hoje);
}

function enviarHistoricoDiario() {
  const hoje = formatarData(new Date());
  const filtered = bancoHistorico.filter(item => item.data === hoje);
  if (filtered.length === 0) return;
  let mensagem = "📌 Histórico de Placas - " + hoje + "\n\n";
  filtered.forEach(item => {
    mensagem += `🚗 Placa: ${item.placa} | 👤 Nome: ${item.nome} | 🏷 Tipo: ${item.tipo} | 🆔 RG/CPF: ${item.rgcpf} | 📍 Status: ${item.status} | ⏰ Entrada: ${item.horarioEntrada || "-"} | ⏱ Saída: ${item.horarioSaida || "-"}\n`;
  });
  emailjs.send("service_t9bocqh", "template_n4uw7xi", {
    to_email: "leomatos3914@gmail.com",
    message: mensagem,
    title: "Histórico Diário",
    name: "Sistema de Placas"
  }).then(() => {
    console.log("✅ Histórico do dia enviado por e-mail.");
    marcarEnvio();
  }).catch(err => {
    alert("❌ Erro no envio: " + JSON.stringify(err));
  });
}

window.addEventListener("load", () => {
  const agora = new Date();
  if (!jaEnviouHoje() && (agora.getHours() > horaEnvio || (agora.getHours() === horaEnvio && agora.getMinutes() >= minutoEnvio))) {
    enviarHistoricoDiario();
  }
});

setInterval(() => {
  const agora = new Date();
  if (!jaEnviouHoje() && agora.getHours() === horaEnvio && agora.getMinutes() === minutoEnvio) {
    enviarHistoricoDiario();
  }
}, 60000);

// Expondo globalmente
window.enviarPDFManual = enviarPDFManual;
