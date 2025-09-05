// ===== Cadastro de veículos =====
let cadastroSelecionado = null;

function atualizarCadastros() {
  const listaDiv = document.getElementById("listaCadastros");
  listaDiv.innerHTML = "";
  cadastroSelecionado = null; // limpa seleção ao atualizar

  bancoCadastros.forEach((item, index) => {
    const div = document.createElement("div");
    div.className = "item";
    div.innerHTML = `
      <span><b>${item.placa}</b> - ${item.nome} [${item.tipo}] - RG/CPF: ${item.rgcpf}</span>
      <span class="menuSerra">⋮
        <div class="submenu" style="display:none">
          <div onclick="editarCadastro(${index})">Editar</div>
          <div onclick="excluirCadastro(${index})">Excluir</div>
        </div>
      </span>
    `;

    div.onclick = (e) => {
      if (!e.target.classList.contains("menuSerra") && !e.target.closest(".submenu")) {
        selecionarCadastro(index);
      }
    };

    const serrinha = div.querySelector(".menuSerra");
    serrinha.addEventListener("click", (e) => {
      e.stopPropagation(); // não ativa seleção do item
      const submenu = serrinha.querySelector(".submenu");
      const isVisible = submenu.style.display === "block";
      document.querySelectorAll(".submenu").forEach(s => s.style.display = "none");
      submenu.style.display = isVisible ? "none" : "block";
    });

    listaDiv.appendChild(div);
  });
}

function selecionarCadastro(index) {
  const itens = document.querySelectorAll("#listaCadastros .item");
  const clicado = itens[index];

  if (clicado.classList.contains("selecionado")) {
    clicado.classList.remove("selecionado");
    const submenu = clicado.querySelector(".submenu");
    if (submenu) submenu.style.display = "none";
    cadastroSelecionado = null;
  } else {
    itens.forEach((el, i) => {
      if (i === index) {
        el.classList.add("selecionado");
      } else {
        el.classList.remove("selecionado");
        const submenu = el.querySelector(".submenu");
        if (submenu) submenu.style.display = "none";
      }
    });
    cadastroSelecionado = index;
  }
}

function editarCadastro(index) {
  const item = bancoCadastros[index];
  mostrarPopup(`
    <h3>Editar Cadastro</h3>
    <input type="text" id="editNomeCad" value="${item.nome}" placeholder="Nome">
    <input type="text" id="editPlacaCad" value="${item.placa}" placeholder="Placa">
    <input type="text" id="editRgcpfCad" value="${item.rgcpf}" placeholder="RG/CPF">
    <select id="editTipoCad">
      <option value="Despacho" ${item.tipo === "Despacho" ? "selected" : ""}>Despacho</option>
      <option value="Retiro" ${item.tipo === "Retiro" ? "selected" : ""}>Retiro</option>
    </select>
    <button class="entrada" onclick="confirmarEdicaoCad(${index})">Confirmar</button>
  `);
}

function confirmarEdicaoCad(index) {
  const nome = document.getElementById("editNomeCad").value;
  const placa = document.getElementById("editPlacaCad").value;
  const rgcpf = document.getElementById("editRgcpfCad").value;
  const tipo = document.getElementById("editTipoCad").value;
  if (!nome || !placa || !rgcpf || !tipo) { alert("Preencha todos os campos!"); return; }
  bancoCadastros[index] = { nome, placa, rgcpf, tipo };
  salvarBanco();
  atualizarCadastros();
  fecharPopup();
  cadastroSelecionado = null;
}

function excluirCadastro(index) {
  if (confirm(`Deseja realmente excluir ${bancoCadastros[index].nome}?`)) {
    bancoCadastros.splice(index, 1);
    salvarBanco();
    atualizarCadastros();
    cadastroSelecionado = null;
  }
}

// Expondo globalmente
window.atualizarCadastros = atualizarCadastros;
window.selecionarCadastro = selecionarCadastro;
window.editarCadastro = editarCadastro;
window.confirmarEdicaoCad = confirmarEdicaoCad;
window.excluirCadastro = excluirCadastro;
