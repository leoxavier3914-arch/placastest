// ===== Popup e navegação =====
function mostrarPopup(c) {
  document.getElementById("popupConteudo").innerHTML = c;
  document.getElementById("overlay").style.display = "block";
  document.getElementById("popupCard").style.display = "block";
}

function fecharPopup() {
  document.getElementById("overlay").style.display = "none";
  document.getElementById("popupCard").style.display = "none";
}

function toggleMenu() {
  document.getElementById("menu").classList.toggle("menu-open");
}

function mostrarPagina(p) {
  ["inicioContainer","cadastroContainer","autorizadosContainer","historicoContainer"].forEach(id => document.getElementById(id).style.display = "none");
  document.getElementById(p).style.display = "block";
  if(p==='historicoContainer'&&!document.getElementById("dataFiltro").value){
    const hoje = new Date();
    document.getElementById("dataFiltro").value = `${hoje.getFullYear()}-${String(hoje.getMonth()+1).padStart(2,'0')}-${String(hoje.getDate()).padStart(2,'0')}`;
    filtrarHistorico();
  }
}

function limparTudo() {
  let senha = prompt("Digite a senha para limpar os dados:");
  if (senha === "1234") {
    if (confirm("Deseja realmente limpar o histórico e mensagens?")) {
      bancoHistorico = [];
      localStorage.setItem("bancoHistorico", JSON.stringify(bancoHistorico));
      document.getElementById("mensagem").innerHTML = "";
      atualizarTabelaAndamento();
      filtrarHistorico();
      alert("Histórico e mensagens foram limpos!");
    }
  } else if (senha !== null) { alert("Senha incorreta ❌"); }
}

// Expondo globalmente
window.mostrarPopup = mostrarPopup;
window.fecharPopup = fecharPopup;
window.toggleMenu = toggleMenu;
window.mostrarPagina = mostrarPagina;
window.limparTudo = limparTudo;
