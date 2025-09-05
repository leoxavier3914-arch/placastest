// ===== Autorizados =====
let autorizadoSelecionado = null;

// Normaliza texto removendo acentos e ignorando maiúsculas/minúsculas
function normalizarTexto(texto) {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function adicionarAutorizado() {
  const nome = document.getElementById("nomeAutInput").value;
  const placa = document.getElementById("placaAutInput").value;
  const rgcpf = document.getElementById("rgcpfAutInput").value;
  if (!nome || !placa || !rgcpf) { alert("Preencha todos os campos!"); return; }
  bancoAutorizados.push({ nome, placa, rgcpf });
  salvarBanco();
  // reaplica o filtro atual após adicionar
  pesquisarAutorizados();
  document.getElementById("nomeAutInput").value = "";
  document.getElementById("placaAutInput").value = "";
  document.getElementById("rgcpfAutInput").value = "";
  alert("Autorizado cadastrado com sucesso!");
}

function atualizarAutorizados(filtro = "") {
  const listaDiv = document.getElementById("listaAutorizados");
  if (!listaDiv) return;
  listaDiv.innerHTML = "";

  const filtroNorm = normalizarTexto(filtro);

  bancoAutorizados.forEach((item, index) => {
    const nomeNorm = normalizarTexto(item.nome);
    const placaNorm = normalizarTexto(item.placa);
    if (nomeNorm.includes(filtroNorm) || placaNorm.includes(filtroNorm)) {
      const div = document.createElement("div");
      div.className = "item";
      div.dataset.index = index;
      div.innerHTML = `<b>${item.placa}</b> - ${item.nome} - RG/CPF: ${item.rgcpf}`;
      div.onclick = () => selecionarAutorizado(index);
      listaDiv.appendChild(div);
    }
  });
}

function selecionarAutorizado(index) {
  const itens = document.querySelectorAll("#listaAutorizados .item");
  itens.forEach((el) => {
    if (parseInt(el.dataset.index, 10) === index) {
      el.classList.add("selecionado");
      autorizadoSelecionado = index;
    } else {
      el.classList.remove("selecionado");
    }
  });
}

function iniciarEdicaoAut() {
  if (autorizadoSelecionado === null) {
    alert("Selecione um autorizado para editar!");
    return;
  }
  const index = autorizadoSelecionado;
  const item = bancoAutorizados[index];

  mostrarPopup(`
    <h3>Editar Autorizado</h3>
    <input type="text" id="editNome" value="${item.nome}" placeholder="Nome">
    <input type="text" id="editPlaca" value="${item.placa}" placeholder="Placa">
    <input type="text" id="editRgcpf" value="${item.rgcpf}" placeholder="RG/CPF">
    <button class="entrada" onclick="confirmarEdicaoAut(${index})">Confirmar</button>
  `);
}

function confirmarEdicaoAut(index) {
  const nome = document.getElementById("editNome").value;
  const placa = document.getElementById("editPlaca").value;
  const rgcpf = document.getElementById("editRgcpf").value;
  if (!nome || !placa || !rgcpf) { alert("Preencha todos os campos!"); return; }
  bancoAutorizados[index] = { nome, placa, rgcpf };
  salvarBanco();
  // mantém resultados filtrados
  pesquisarAutorizados();
  fecharPopup();
  alert("Autorizado editado com sucesso!");
  const itens = document.querySelectorAll("#listaAutorizados .item");
  itens.forEach(el => el.classList.remove("selecionado"));
  autorizadoSelecionado = null;
}

function iniciarExclusaoAut() {
  if (autorizadoSelecionado === null) {
    alert("Selecione um autorizado para excluir!");
    return;
  }
  const index = autorizadoSelecionado;
  if (confirm(`Deseja realmente excluir ${bancoAutorizados[index].nome}?`)) {
    bancoAutorizados.splice(index, 1);
    autorizadoSelecionado = null;
    salvarBanco();
    // atualiza lista conforme termo pesquisado
    pesquisarAutorizados();
    alert("Autorizado excluído com sucesso!");
  }
}

function pesquisarAutorizados() {
  const campo = document.getElementById("pesquisaAut");
  const termo = campo ? campo.value : "";
  atualizarAutorizados(termo);
}

// garante que o campo de busca esteja pronto antes de anexar o evento
document.addEventListener("DOMContentLoaded", () => {
  const campoPesquisa = document.getElementById("pesquisaAut");
  if (campoPesquisa) {
    campoPesquisa.addEventListener("input", pesquisarAutorizados);
  }
});

// Expondo globalmente
window.adicionarAutorizado = adicionarAutorizado;
window.atualizarAutorizados = atualizarAutorizados;
window.selecionarAutorizado = selecionarAutorizado;
window.iniciarEdicaoAut = iniciarEdicaoAut;
window.confirmarEdicaoAut = confirmarEdicaoAut;
window.iniciarExclusaoAut = iniciarExclusaoAut;
window.pesquisarAutorizados = pesquisarAutorizados;
