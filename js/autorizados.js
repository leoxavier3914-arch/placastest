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
  Estrutura esperada de cada item no bancoAutorizados:
  {
    nome: "Fulano",
    placa: "ABC1234",
    autoridade: "Segurança",
    documento: "000.000.000-00",
    modelo: "Fox",
    cor: "Preto"
  }
*/

// ---------- Helpers de popup (usa overlay/popupCard do index) ----------
function _openPopup(innerHTML) {
  const overlay = document.getElementById("overlay");
  const card = document.getElementById("popupCard");
  const cont = document.getElementById("popupConteudo");
  if (!overlay || !card || !cont) return;
  cont.innerHTML = innerHTML;
  overlay.style.display = "block";
  card.style.display = "block";

  // fallback global
  if (!window.fecharPopup) {
    window.fecharPopup = () => {
      overlay.style.display = "none";
      card.style.display = "none";
      cont.innerHTML = "";
    };
  }
}

// ---------- CRUD ----------
function adicionarAutorizado() {
  const nome  = document.getElementById("nomeAutInput")?.value?.trim();
  const placa = document.getElementById("placaAutInput")?.value?.toUpperCase()?.trim();
  const autoridade = document.getElementById("autoridadeAutInput")?.value?.trim();
  const documento  = document.getElementById("rgcpfAutInput")?.value?.trim();
  const modelo = document.getElementById("modeloAutInput")?.value?.trim();
  const cor = document.getElementById("corAutInput")?.value?.trim();

  if (!nome || !placa || !autoridade || !documento) {
    alert("Preencha nome, placa, autoridade e documento.");
    return;
  }

  bancoAutorizados.push({ nome, placa, autoridade, documento, modelo, cor });
  try { localStorage.setItem("bancoAutorizados", JSON.stringify(bancoAutorizados)); } catch (e) {}

  ["nomeAutInput","placaAutInput","autoridadeAutInput","rgcpfAutInput","modeloAutInput","corAutInput"].forEach(id=>{
    const el = document.getElementById(id); if (el) el.value = "";
  });

  pesquisarAutorizados();
  alert("Autorizado adicionado!");
}

function selecionarAutorizado(idx) { autorizadoSelecionado = idx; }

// ---------- Popup de Edição (todos os campos) ----------
function iniciarEdicaoAut() {
  if (autorizadoSelecionado == null) return;
  const item = bancoAutorizados[autorizadoSelecionado] || {};

  const html = `
    <div class="aut-modal">
      <h3>Editar Autorizado</h3>

      <div class="aut-modal-grid">
        <div class="aut-field">
          <label class="label" for="editNome">Nome</label>
          <input id="editNome" class="aut-input" type="text" value="${item.nome || ""}" placeholder="Nome completo">
        </div>

        <div class="aut-field">
          <label class="label" for="editPlaca">Placa</label>
          <input id="editPlaca" class="aut-input" type="text" maxlength="7" value="${(item.placa||"").toUpperCase()}" placeholder="ABC1234" oninput="this.value=this.value.toUpperCase()">
        </div>

        <div class="aut-field">
          <label class="label" for="editAutoridade">Autoridade</label>
          <input id="editAutoridade" class="aut-input" type="text" value="${item.autoridade || ""}" placeholder="Ex.: Segurança, Fiscal...">
        </div>

        <div class="aut-field">
          <label class="label" for="editDocumento">Documento (RG/CPF)</label>
          <input id="editDocumento" class="aut-input" type="text" value="${item.documento || ""}" placeholder="RG/CPF">
        </div>

        <div class="aut-field">
          <label class="label" for="editModelo">Modelo do carro (opcional)</label>
          <input id="editModelo" class="aut-input" type="text" value="${item.modelo || ""}" placeholder="Modelo">
        </div>

        <div class="aut-field">
          <label class="label" for="editCor">Cor (opcional)</label>
          <input id="editCor" class="aut-input" type="text" value="${item.cor || ""}" placeholder="Cor">
        </div>
      </div>

      <div class="aut-modal-actions">
        <button class="aut-btn cancel" onclick="fecharPopup()">Cancelar</button>
        <button class="aut-btn save" id="btnSalvarEdicao">Salvar</button>
      </div>
    </div>
  `;

  _openPopup(html);

  const btnSalvar = document.getElementById("btnSalvarEdicao");
  if (btnSalvar) {
    btnSalvar.onclick = () => {
      const nome  = document.getElementById("editNome")?.value?.trim();
      const placa = document.getElementById("editPlaca")?.value?.toUpperCase()?.trim();
      const autoridade = document.getElementById("editAutoridade")?.value?.trim();
      const documento  = document.getElementById("editDocumento")?.value?.trim();
      const modelo = document.getElementById("editModelo")?.value?.trim();
      const cor = document.getElementById("editCor")?.value?.trim();

      if (!nome || !placa || !autoridade || !documento) {
        alert("Preencha nome, placa, autoridade e documento.");
        return;
      }

      bancoAutorizados[autorizadoSelecionado] = { nome, placa, autoridade, documento, modelo, cor };
      try { localStorage.setItem("bancoAutorizados", JSON.stringify(bancoAutorizados)); } catch (e) {}

      fecharPopup();
      pesquisarAutorizados();
      alert("Autorizado atualizado!");
    };
  }
}

// compat
function confirmarEdicaoAut(){ iniciarEdicaoAut(); }

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

// ---------- Render (cards + veja mais) ----------
function atualizarAutorizados(filtro = "") {
  const listaDiv = document.getElementById("listaAutorizados");
  if (!listaDiv) return;
  listaDiv.innerHTML = "";

  const filtroNorm = normalizarTexto(filtro);

  (bancoAutorizados || []).forEach((item, index) => {
    const nomeNorm  = normalizarTexto(item?.nome);
    const placaNorm = normalizarTexto(item?.placa);
    const autNorm   = normalizarTexto(item?.autoridade);

    if (!filtroNorm || nomeNorm.includes(filtroNorm) || placaNorm.includes(filtroNorm) || autNorm.includes(filtroNorm)) {
      const card = document.createElement("div");
      card.className = "aut-card";
      card.dataset.index = index;

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
        selecionarAutorizado(index);
        iniciarEdicaoAut();
      };

      const btnDel = document.createElement("button");
      btnDel.className = "aut-pill del";
      btnDel.textContent = "Excluir";
      btnDel.onclick = (e) => {
        e.stopPropagation();
        selecionarAutorizado(index);
        iniciarExclusaoAut();
      };

      actions.appendChild(btnEdit);
      actions.appendChild(btnDel);
      top.appendChild(badge);
      top.appendChild(actions);

      const grid = document.createElement("div");
      grid.className = "aut-grid";

      const fNome = document.createElement("div");
      fNome.className = "aut-field";
      fNome.innerHTML = `<span class="label">Nome</span><span class="value">${item?.nome || "-"}</span>`;

      const fAutoridade = document.createElement("div");
      fAutoridade.className = "aut-field";
      fAutoridade.innerHTML = `<span class="label">Autoridade</span><span class="value">${item?.autoridade || "-"}</span>`;

      const fDoc = document.createElement("div");
      fDoc.className = "aut-field";
      fDoc.innerHTML = `<span class="label">Documento</span><span class="value">${item?.documento || "-"}</span>`;

      grid.appendChild(fNome);
      grid.appendChild(fAutoridade);
      grid.appendChild(fDoc);

      // Veja mais (modelo/cor)
      const more = document.createElement("div");
      more.className = "aut-more";
      more.innerHTML = `
        <div class="aut-field"><span class="label">Modelo</span><span class="value">${item?.modelo || "-"}</span></div>
        <div class="aut-field"><span class="label">Cor</span><span class="value">${item?.cor || "-"}</span></div>
      `;

      const btnMore = document.createElement("button");
      btnMore.className = "aut-more-btn";
      btnMore.textContent = "Veja mais";
      btnMore.onclick = (e) => {
        e.stopPropagation();
        if (more.style.display === "block") {
          more.style.display = "none";
          btnMore.textContent = "Veja mais";
        } else {
          more.style.display = "block";
          btnMore.textContent = "Ocultar";
        }
      };

      card.onclick = () => selecionarAutorizado(index);

      card.appendChild(top);
      card.appendChild(grid);
      card.appendChild(btnMore);
      card.appendChild(more);
      listaDiv.appendChild(card);
    }
  });
}

// ---------- Busca dinâmica ----------
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

// Expor globais
window.adicionarAutorizado = adicionarAutorizado;
window.atualizarAutorizados = atualizarAutorizados;
window.selecionarAutorizado = selecionarAutorizado;
window.iniciarEdicaoAut = iniciarEdicaoAut;
window.confirmarEdicaoAut = confirmarEdicaoAut;
window.iniciarExclusaoAut = iniciarExclusaoAut;
window.pesquisarAutorizados = pesquisarAutorizados;
