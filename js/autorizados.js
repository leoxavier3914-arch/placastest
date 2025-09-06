// ===== Autorizados =====
let autorizadoSelecionado = null;

// Normaliza texto removendo acentos e ignorando maiúsculas/minúsculas
function normalizarTexto(texto) {
  return (texto || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

/* 
  Espera que exista um array/LS chamado bancoAutorizados
  no seu db.js (ou similar), no formato:
  [{ nome: "Fulano", placa: "ABC1234", rgcpf: "000.000.000-00" }, ...]
*/

// --- CRUD básico ---
function adicionarAutorizado() {
  const nome  = document.getElementById("nomeAutInput")?.value?.trim();
  const placa = document.getElementById("placaAutInput")?.value?.toUpperCase()?.trim();
  const rgcpf = document.getElementById("rgcpfAutInput")?.value?.trim();

  if (!nome || !placa || !rgcpf) { alert("Preencha todos os campos!"); return; }

  bancoAutorizados.push({ nome, placa, rgcpf });
  try { localStorage.setItem("bancoAutorizados", JSON.stringify(bancoAutorizados)); } catch (e) {}

  limparFormAut();
  pesquisarAutorizados();
  alert("Autorizado adicionado!");
}

function limparFormAut() {
  const n = document.getElementById("nomeAutInput");
  const p = document.getElementById("placaAutInput");
  const r = document.getElementById("rgcpfAutInput");
  if (n) n.value = "";
  if (p) p.value = "";
  if (r) r.value = "";
}

function selecionarAutorizado(idx) {
  autorizadoSelecionado = idx;
}

function iniciarEdicaoAut() {
  if (autorizadoSelecionado == null) return;
  const item = bancoAutorizados[autorizadoSelecionado];
  const novoNome  = prompt("Motorista:", item.nome);
  if (novoNome == null) return;

  const novaPlaca = prompt("Placa:", item.placa);
  if (novaPlaca == null) return;

  const novoDoc   = prompt("RG/CPF:", item.rgcpf);
  if (novoDoc == null) return;

  bancoAutorizados[autorizadoSelecionado] = {
    nome: novoNome.trim(),
    placa: (novaPlaca || "").toUpperCase().trim(),
    rgcpf: novoDoc.trim()
  };

  try { localStorage.setItem("bancoAutorizados", JSON.stringify(bancoAutorizados)); } catch (e) {}
  pesquisarAutorizados();
  alert("Autorizado atualizado!");
}

function confirmarEdicaoAut() {
  iniciarEdicaoAut();
}

function iniciarExclusaoAut() {
  if (autorizadoSelecionado == null) return;
  const item = bancoAutorizados[autorizadoSelecionado];
  if (confirm(`Excluir ${item?.placa || ""} - ${item?.nome || ""}?`)) {
    bancoAutorizados.splice(autorizadoSelecionado, 1);
    try { localStorage.setItem("bancoAutorizados", JSON.stringify(bancoAutorizados)); } catch (e) {}
    autorizadoSelecionado = null;
    pesquisarAutorizados();
    alert("Autorizado excluído com sucesso!");
  }
}

// --- Render (cards estilo do print) ---
function atualizarAutorizados(filtro = "") {
  const listaDiv = document.getElementById("listaAutorizados");
  if (!listaDiv) return;
  listaDiv.innerHTML = "";

  const filtroNorm = normalizarTexto(filtro);

  (bancoAutorizados || []).forEach((item, index) => {
    const nomeNorm  = normalizarTexto(item?.nome);
    const placaNorm = normalizarTexto(item?.placa);

    if (!filtroNorm || nomeNorm.includes(filtroNorm) || placaNorm.includes(filtroNorm)) {
      // card
      const card = document.createElement("div");
      card.className = "aut-card";
      card.dataset.index = index;

      // topo: badge + ações
      const top = document.createElement("div");
      top.className = "aut-topline";

      const badge = document.createElement("span");
      badge.className = "aut-placa-badge";
      badge.textContent = (item?.placa || "").toUpperCase();

      const actions = document.createElement("div");
      actions.className = "aut-actions";

      const btnEdit = document.createElement("button");
      btnEdit.className = "aut-pill edit";
      btnEdit.textContent = "Editar";
      btnEdit.onclick = (e) => {
        e.stopPropagation();
        autorizadoSelecionado = index;
        iniciarEdicaoAut();
      };

      const btnDel = document.createElement("button");
      btnDel.className = "aut-pill del";
      btnDel.textContent = "Excluir";
      btnDel.onclick = (e) => {
        e.stopPropagation();
        autorizadoSelecionado = index;
        iniciarExclusaoAut();
      };

      actions.appendChild(btnEdit);
      actions.appendChild(btnDel);
      top.appendChild(badge);
      top.appendChild(actions);

      // grid de campos
      const grid = document.createElement("div");
      grid.className = "aut-grid";

      const fMotorista = document.createElement("div");
      fMotorista.className = "aut-field";
      fMotorista.innerHTML = `<span class="label">Motorista</span><span class="value">${item?.nome || "-"}</span>`;

      const fDoc = document.createElement("div");
      fDoc.className = "aut-field";
      fDoc.innerHTML = `<span class="label">Documento</span><span class="value">${item?.rgcpf || "-"}</span>`;

      grid.appendChild(fMotorista);
      grid.appendChild(fDoc);

      // seleção por toque (compatível com fluxo existente)
      card.onclick = () => selecionarAutorizado(index);

      // monta card
      card.appendChild(top);
      card.appendChild(grid);
      listaDiv.appendChild(card);
    }
  });
}

// --- Busca dinâmica ---
function pesquisarAutorizados() {
  const campo = document.getElementById("pesquisaAut");
  const termo = campo ? campo.value : "";
  atualizarAutorizados(termo);
}

document.addEventListener("DOMContentLoaded", () => {
  const campoPesquisa = document.getElementById("pesquisaAut");
  if (campoPesquisa) {
    campoPesquisa.addEventListener("input", pesquisarAutorizados);
    atualizarAutorizados(campoPesquisa.value);
  } else {
    atualizarAutorizados();
  }
});

// Expondo globalmente (se outras partes chamam)
window.adicionarAutorizado = adicionarAutorizado;
window.atualizarAutorizados = atualizarAutorizados;
window.selecionarAutorizado = selecionarAutorizado;
window.iniciarEdicaoAut = iniciarEdicaoAut;
window.confirmarEdicaoAut = confirmarEdicaoAut;
window.iniciarExclusaoAut = iniciarExclusaoAut;
window.pesquisarAutorizados = pesquisarAutorizados;
