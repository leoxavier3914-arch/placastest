// ===== Autorizados =====
window.bancoAutorizados = Array.isArray(window.bancoAutorizados)
  ? window.bancoAutorizados
  : (()=>{
      try { return JSON.parse(localStorage.getItem("bancoAutorizados")) || []; }
      catch(e){ return []; }
    })();

let autorizadoSelecionado = null;

function normalizarTexto(txt){
  return (txt||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().trim();
}

function _openPopup(innerHTML){
  const ov=document.getElementById("overlay");
  const card=document.getElementById("popupCard");
  const cont=document.getElementById("popupConteudo");
  cont.innerHTML=innerHTML;
  ov.style.display="block"; card.style.display="block";
  if(!window.fecharPopup){ window.fecharPopup=()=>{ov.style.display="none";card.style.display="none";cont.innerHTML="";}; }
}

function adicionarAutorizado(){
  const nome=document.getElementById("nomeAutInput")?.value.trim();
  const placa=(document.getElementById("placaAutInput")?.value||"").toUpperCase().trim();
  const autoridade=document.getElementById("autoridadeAutInput")?.value.trim();
  const documento=document.getElementById("rgcpfAutInput")?.value.trim();
  const modelo=document.getElementById("modeloAutInput")?.value.trim();
  const cor=document.getElementById("corAutInput")?.value.trim();

  if(!nome||!autoridade){ alert("Preencha pelo menos Nome e Autoridade."); return; }

  window.bancoAutorizados.push({nome,placa,autoridade,documento,modelo,cor});
  try{localStorage.setItem("bancoAutorizados",JSON.stringify(window.bancoAutorizados));}catch(e){}
  ["nomeAutInput","placaAutInput","autoridadeAutInput","rgcpfAutInput","modeloAutInput","corAutInput"].forEach(id=>{
    const el=document.getElementById(id); if(el) el.value="";
  });
  pesquisarAutorizados(); alert("Autorizado adicionado!");
}

function selecionarAutorizado(i){ autorizadoSelecionado=i; }

function iniciarExclusaoAut(){
  if(autorizadoSelecionado==null)return;
  const it=window.bancoAutorizados[autorizadoSelecionado];
  if(confirm(`Excluir ${it?.nome||""}${it?.placa?" - "+it.placa:""}?`)){
    window.bancoAutorizados.splice(autorizadoSelecionado,1);
    try{localStorage.setItem("bancoAutorizados",JSON.stringify(window.bancoAutorizados));}catch(e){}
    autorizadoSelecionado=null; pesquisarAutorizados(); alert("Excluído!");
  }
}

function iniciarEdicaoAut(){
  if(autorizadoSelecionado==null)return;
  const it=window.bancoAutorizados[autorizadoSelecionado]||{};
  const html=`
    <div class="aut-modal">
      <h3>Editar Autorizado</h3>
      <div class="aut-modal-grid">
        <div class="aut-field"><label class="label">Nome</label>
          <input id="editNome" class="aut-input" type="text" value="${it.nome||""}"></div>
        <div class="aut-field"><label class="label">Autoridade</label>
          <input id="editAutoridade" class="aut-input" type="text" value="${it.autoridade||""}"></div>
        <div class="aut-field"><label class="label">Placa</label>
          <input id="editPlaca" class="aut-input" type="text" maxlength="7" value="${(it.placa||"").toUpperCase()}"></div>
        <div class="aut-field"><label class="label">Documento</label>
          <input id="editDocumento" class="aut-input" type="text" value="${it.documento||""}"></div>
        <div class="aut-field"><label class="label">Modelo</label>
          <input id="editModelo" class="aut-input" type="text" value="${it.modelo||""}"></div>
        <div class="aut-field"><label class="label">Cor</label>
          <input id="editCor" class="aut-input" type="text" value="${it.cor||""}"></div>
      </div>
      <div class="aut-modal-actions">
        <button class="aut-btn cancel" onclick="fecharPopup()">Cancelar</button>
        <button class="aut-btn save" id="btnSalvarEdicao">Salvar</button>
      </div>
    </div>`;
  _openPopup(html);
  document.getElementById("btn
