// ===== Inicialização =====
function atualizarTudo(){
  atualizarCadastros();
  atualizarAutorizados();
  atualizarTabelaAndamento();
  filtrarHistorico();
}

mostrarPagina('inicioContainer');
atualizarTudo();
window.addEventListener("load", checarExportacaoAutomaticaPDF);
// garante que bancos estejam persistidos
salvarBanco();
