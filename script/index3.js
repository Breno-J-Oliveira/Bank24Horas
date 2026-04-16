// =======================================================
// 1. CONFIGURAÇÕES INICIAIS E VERIFICAÇÃO DE ACESSO
// =======================================================
const bancoAcessado = localStorage.getItem('bancoAcessado');
const cartaoAcessado = localStorage.getItem('cartaoAcessado');
const cartaoIdAcessado = localStorage.getItem('cartaoIdAcessado');

if (!bancoAcessado || !cartaoIdAcessado) {
    alert("Acesso inválido. Retornando à carteira."); 
    window.location.href = 'index2.html'; 
}

let dadosConta = null;

window.onload = async function() {
    await carregarDadosDaAPI();
    aplicarTema();
};

// =======================================================
// 2. COMUNICAÇÃO COM O BACKEND (API)
// =======================================================
async function carregarDadosDaAPI() {
    try {
        const resposta = await fetch('PHP/api.php');
        const dados = await resposta.json();
        if (!dados.sucesso) {
            window.location.href = 'index1.html';
            return;
        }
        dadosConta = dados.dados;
        preencherUI();
    } catch (erro) {
        console.error("Erro ao puxar dados:", erro);
        alert("Erro de conexão com o banco de dados.");
    }
}

// =======================================================
// 3. GERENCIAMENTO DE TEMAS E CORES DINÂMICAS
// =======================================================

// Cores para o MODO CLARO (Vibrantes/Pastéis)
const coresClaro = {
    'Nubank': '#d8b4fe',
    'Itaú': '#fed7aa',
    'Santander': '#fca5a5',
    'Bradesco': '#fda4af',
    'Caixa': '#93c5fd',
    'Banco do Brasil': '#fef08a',
    'Inter': '#fdba74'
};

// Cores para o MODO ESCURO (Mais coloridas e vibrantes que antes)
const coresEscuro = {
    'Nubank': '#3b0a5e',          // Roxo vibrante escuro
    'Itaú': '#5c2d00',            // Marrom alaranjado quente
    'Santander': '#610000',       // Vermelho profundo
    'Bradesco': '#6b0416',        // Vinho vibrante
    'Caixa': '#003366',           // Azul royal escuro
    'Banco do Brasil': '#4a4a00', // Dourado envelhecido escuro
    'Inter': '#7a3d00'            // Laranja queimado intenso
};

function aplicarTema() {
    const temasBancos = {
        'Nubank': { p: '#8a05be', s: '#9e14d6', t: '#fff' },
        'Itaú': { p: '#ec7000', s: '#ff9900', t: '#fff' },
        'Santander': { p: '#cc0000', s: '#ff1a1a', t: '#fff' },
        'Caixa': { p: '#005ca9', s: '#007bc9', t: '#fff' },
        'Banco do Brasil': { p: '#fcf82a', s: '#ffe100', t: '#003da5' },
        'Inter': { p: '#ff7a00', s: '#ff9100', t: '#fff' },
        'Bradesco': { p: '#cc092f', s: '#e60000', t: '#fff' }
    };

    const tema = temasBancos[bancoAcessado] || { p: '#333333', s: '#555555', t: '#ffffff' };
    
    document.documentElement.style.setProperty('--banco-cor-principal', tema.p);
    document.documentElement.style.setProperty('--banco-cor-secundaria', tema.s);
    document.documentElement.style.setProperty('--banco-cor-texto', tema.t);

    const isDarkMode = document.documentElement.classList.contains('dark-theme');
    
    if (isDarkMode) {
        document.body.style.backgroundColor = coresEscuro[bancoAcessado] || '#1a1a1a';
    } else {
        document.body.style.backgroundColor = coresClaro[bancoAcessado] || '#f8f9fa';
    }
}

document.addEventListener('change', (e) => {
    if (e.target.id === 'theme-toggle') {
        setTimeout(aplicarTema, 10);
    }
});

// =======================================================
// 4. INTERFACE DO USUÁRIO (UI)
// =======================================================
function preencherUI() {
    document.getElementById('nomeBancoCartao').innerText = bancoAcessado;
    document.getElementById('numCartaoUI').innerText = `**** **** **** ${cartaoAcessado}`;
    document.getElementById('tituloMenu').innerText = `Agência ${bancoAcessado} - Olá, ${dadosConta.nomeCompleto.split(' ')[0]}`;
}

function verSaldo() {
    let tela = document.getElementById("saldoTela");
    if(tela.innerText !== "") {
        tela.innerText = "";
    } else {
        tela.innerText = "Saldo Total: " + parseFloat(dadosConta.saldoTotal).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    }
}

// =======================================================
// 5. OPERAÇÕES BANCÁRIAS
// =======================================================
const regexNumeros = /^\d+(\.\d+)?$/;

async function processarTransacaoBackend(tipoTransacao, valor, destinatario = null) {
    try {
        const corpoRequisicao = {
            acao: tipoTransacao === 'transferencia' ? 'transferencia' : 'transacao',
            tipo: tipoTransacao,
            cartao_id: cartaoIdAcessado,
            valor: valor,
            bancoNome: bancoAcessado
        };
        if (destinatario) corpoRequisicao.destinatario = destinatario;

        const resposta = await fetch('PHP/operacoes.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(corpoRequisicao)
        });

        const res = await resposta.json();
        
        if (res.sucesso) {
            alert("Operação realizada com sucesso!");
            document.getElementById("saldoTela").innerText = ""; 
            await carregarDadosDaAPI(); 
        } else {
            alert("Operação negada: " + res.mensagem);
        }
    } catch (erro) {
        console.error(erro);
        alert("Erro ao comunicar com o servidor.");
    }
}

async function depositar() {
    let valor = prompt("DEPÓSITO\nDigite o valor (Ex: 150.50):");
    if (valor && regexNumeros.test(valor)) {
        await processarTransacaoBackend('deposito', parseFloat(valor));
    } else if (valor) alert("Valor Inválido!");
}

async function sacar() {
    let valor = prompt("SAQUE\nDigite o valor:");
    if (valor && regexNumeros.test(valor)) {
        await processarTransacaoBackend('saque', parseFloat(valor));
    } else if (valor) alert("Valor Inválido!");
}

async function transferir() {
    let dest = prompt("Login do destinatário:");
    if (!dest) return;
    let valor = prompt(`Valor para ${dest}:`);
    if (valor && regexNumeros.test(valor)) {
        await processarTransacaoBackend('transferencia', parseFloat(valor), dest);
    } else if (valor) alert("Valor inválido.");
}

// =======================================================
// 6. EXTRATO E UTILITÁRIOS
// =======================================================
function mostrarExtrato() {
    const ul = document.getElementById("historico");
    ul.innerHTML = "";
    
    if (dadosConta.historico.length === 0) {
        ul.innerHTML = "<li>Nenhuma operação realizada ainda.</li>";
    } else {
        dadosConta.historico.forEach(op => {
            let li = document.createElement("li");
            let dataFormatada = new Date(op.data_operacao).toLocaleString('pt-BR');
            li.innerText = `${dataFormatada} - ${op.descricao}`;
            ul.appendChild(li);
        });
    }
    document.getElementById("tituloExtrato").style.display = "block";
}

function gerarPDF() {
    try {
        const PDFDocument = window.jspdf ? window.jspdf.jsPDF : window.jsPDF;
        const doc = new PDFDocument();
        const nomeCliente = dadosConta.nomeCompleto;
        const saldoAtual = parseFloat(dadosConta.saldoTotal).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

        doc.setFont("helvetica", "bold");
        doc.text(`Bank 24 Horas - ${bancoAcessado}`, 14, 22);
        doc.setFontSize(11);
        doc.text(`Titular: ${nomeCliente}`, 14, 45);
        doc.text(`Saldo Final: ${saldoAtual}`, 14, 55);

        let linhas = dadosConta.historico.map(op => [
            new Date(op.data_operacao).toLocaleString('pt-BR'),
            bancoAcessado,
            op.descricao
        ]);

        doc.autoTable({
            startY: 65,
            head: [['Data', 'Banco', 'Descrição']],
            body: linhas.length > 0 ? linhas : [["-", "-", "Sem registros"]]
        });

        doc.save(`Extrato_${bancoAcessado}.pdf`);
    } catch (e) { alert("Erro ao gerar PDF."); }
}

async function sair() {
    try {
        await fetch('PHP/auth.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ acao: 'logout' })
        });
    } catch(e) {}
    localStorage.clear();
    window.location.href = 'index.html';
}