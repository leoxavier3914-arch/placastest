// ===== Entrada/Saída de placas =====
function verificarPlaca() {
  const placaInput = document.getElementById("placaInput");
  const placa = placaInput.value.toUpperCase();
  placaInput.value = placa;
  if (placa.length !== 7) {
    alert("A placa deve ter exatamente 7 caracteres!");
    placaInput.value = "";
    placaInput.focus();
    return;
  }
  const autorizado = bancoAutorizados.find(i => i.placa === placa);
  if (autorizado) {
    mostrarPopup(`
      <h3>AUTORIZADO ✅</h3>
      <p><b>Nome:</b> ${autorizado.nome}</p>
      <p><b>Placa:</b> ${autorizado.placa}</p>
      <p><b>Modelo:</b> ${autorizado.modelo || '-'}</p>
      <p><b>Cor:</b> ${autorizado.cor || '-'}</p>
      <button class="entrada" onclick="fecharPopup()">OK</button>
    `);
  } else {
    const registro = bancoCadastros.find(i => i.placa === placa);
    const ultimoHistorico = [...bancoHistorico].reverse().find(h => h.placa === placa);
    const statusAtual = ultimoHistorico ? ultimoHistorico.status : "-";
    const cor = statusAtual === "Em andamento" ? "red" : statusAtual === "Finalizado" ? "green" : "black";
    if (registro) {
      mostrarPopup(`
        <h3>Placa encontrada ✅</h3>
        <p><b>Placa:</b> ${placa}</p>
        <p><b>Nome:</b> ${registro.nome}</p>
        <p><b>RG/CPF:</b> ${registro.rgcpf}</p>
        <p><b>Status:</b><span style="color:${cor}">${statusAtual}</span></p>
        <label>Tipo:</label>
        <select id="tipoEntrada">
          <option value="Despacho" ${registro.tipo === "Despacho" ? "selected" : ""}>Despacho</option>
          <option value="Retiro" ${registro.tipo === "Retiro" ? "selected" : ""}>Retiro</option>
        </select>
        <br><br>
        <button class="entrada" onclick="marcarEntradaComTipo('${placa}')">Entrada</button>
        <button class="saida" onclick="marcarSaida('${placa}')">Saída</button>
      `);
    } else {
      mostrarPopup(`
        <h3>Placa não registrada ⚠️</h3>
        <input type="text" id="nomeInput" placeholder="Nome">
        <input type="text" id="rgcpfInput" placeholder="RG/CPF">
        <select id="tipoInput">
          <option value="" disabled selected>Tipo:</option>
          <option value="Despacho">Despacho</option>
          <option value="Retiro">Retiro</option>
        </select>
        <button class="entrada" onclick="entradaNovaPlaca('${placa}')">Entrada</button>
      `);
    }
  }
  placaInput.value = "";
  placaInput.focus();
}

function marcarEntradaComTipo(placa) {
  const tipoSelecionado = document.getElementById("tipoEntrada").value;
  const existe = [...bancoHistorico].reverse().find(h => h.placa === placa && h.status === "Em andamento");
  if (existe) { alert("Essa placa já está em andamento!"); return; }
  const cadastro = bancoCadastros.find(i => i.placa === placa) || bancoAutorizados.find(i => i.placa === placa);
  if (!cadastro) return;
  const hoje = formatarData(new Date());
  bancoHistorico.push({
    nome: cadastro.nome,
    placa: cadastro.placa,
    rgcpf: cadastro.rgcpf,
    tipo: tipoSelecionado,
    status: "Em andamento",
    data: hoje,
    horarioEntrada: new Date().toLocaleTimeString(),
    horarioSaida: ""
  });
  salvarBanco();
  atualizarTabelaAndamento();
  filtrarHistorico();
  fecharPopup();
  alert("Entrada registrada com sucesso! ✅");
}

function entradaNovaPlaca(placa) {
  const nome = document.getElementById("nomeInput").value;
  const rgcpf = document.getElementById("rgcpfInput").value;
  const tipo = document.getElementById("tipoInput").value;
  if (!nome || !rgcpf || !tipo || !placa) { alert("Preencha todos os campos!"); return; }
  const hoje = formatarData(new Date());
  bancoCadastros.push({ nome, placa, rgcpf, tipo });
  bancoHistorico.push({ nome, placa, rgcpf, tipo, status: "Em andamento", data: hoje, horarioEntrada: new Date().toLocaleTimeString(), horarioSaida: "" });
  salvarBanco();
  atualizarCadastros();
  atualizarTabelaAndamento();
  filtrarHistorico();
  fecharPopup();
  alert("Entrada registrada com sucesso! ✅");
}

function marcarEntrada(placa) {
  const existe = [...bancoHistorico].reverse().find(h => h.placa === placa && h.status === "Em andamento");
  if (existe) { alert("Essa placa já está em andamento!"); return; }
  const cadastro = bancoCadastros.find(i => i.placa === placa) || bancoAutorizados.find(i => i.placa === placa);
  if (!cadastro) return;
  const hoje = formatarData(new Date());
  bancoHistorico.push({ nome: cadastro.nome, placa: cadastro.placa, rgcpf: cadastro.rgcpf, tipo: cadastro.tipo || "Autorizado", status: "Em andamento", data: hoje, horarioEntrada: new Date().toLocaleTimeString(), horarioSaida: "" });
  salvarBanco();
  atualizarTabelaAndamento();
  filtrarHistorico();
  fecharPopup();
}

function marcarSaida(placa) {
  const ultimo = [...bancoHistorico].reverse().find(h => h.placa === placa && h.status === "Em andamento");
  if (!ultimo) return;
  ultimo.status = "Finalizado";
  ultimo.horarioSaida = new Date().toLocaleTimeString();
  salvarBanco();
  atualizarTabelaAndamento();
  filtrarHistorico();
  document.getElementById("mensagem").innerHTML = "Saída registrada com sucesso! ✅";
  setTimeout(() => { document.getElementById("mensagem").innerHTML = ""; }, 5000);
  fecharPopup();
}

// Expondo globalmente
window.verificarPlaca = verificarPlaca;
window.marcarEntradaComTipo = marcarEntradaComTipo;
window.entradaNovaPlaca = entradaNovaPlaca;
window.marcarEntrada = marcarEntrada;
window.marcarSaida = marcarSaida;
