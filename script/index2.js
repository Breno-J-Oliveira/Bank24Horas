// Roda essa função assim que a tela abre
window.onload = async function() {
    await carregarDadosDaAPI();
};

async function carregarDadosDaAPI() {
    try {
        // Puxa os dados direto do nosso backend PHP!
        const resposta = await fetch('PHP/api.php');
        const dados = await resposta.json();

        // Se o PHP disser que não está logado (sessão expirada/inexistente), manda pro login
        if (!dados.sucesso) {
            window.location.href = 'index.html';
            return;
        }

        const dadosUsuario = dados.dados;

        // 1. Atualiza os textos principais na tela
        document.getElementById('mensagem-boas-vindas').innerText = `Bem-vindo(a), ${dadosUsuario.nomeCompleto}!`;
        document.getElementById('saldo-total').innerText = dadosUsuario.saldoTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

        // 2. Chama a função de montar a carteira passando os cartões vindos do MySQL
        renderizarCartoes(dadosUsuario.cartoes, dadosUsuario.nomeCompleto);

    } catch (erro) {
        console.error("Erro ao conectar com o banco de dados:", erro);
        alert("Erro ao carregar a sua carteira.");
    }
}

// Função para salvar qual banco clicou e ir para tela 3
// ATENÇÃO: Agora salvamos também o idCartao para o PHP saber em qual conta fazer as transações!
window.acessarConta = function(nomeBanco, numCartao, idCartao) {
    localStorage.setItem('bancoAcessado', nomeBanco);
    localStorage.setItem('cartaoAcessado', numCartao);
    localStorage.setItem('cartaoIdAcessado', idCartao); // <-- ID do BD salvo aqui
    window.location.href = 'index3.html';
};

// Função que desenha os cartões na tela (mantendo 100% do seu visual)
function escaparHTML(str) {
    return String(str).replace(/[&<>"']/g, caractere => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    }[caractere]));
}

function renderizarCartoes(cartoes, nomeCompleto) {
    const pocketElement = document.querySelector('.pocket'); 

    cartoes.forEach((cartao, index) => {
        const posClass = `card-pos-${index + 1}`;
        const coresBanco = window.BANCOS_CORES[cartao.banco];
        const corFundo = coresBanco ? coresBanco.cartao.fundo : '#333';
        const corTexto = coresBanco ? coresBanco.cartao.texto : '#fff';

        // Note que cartao.tipo_info vem com underline pois é assim que está na tabela MySQL
        const cartaoHTML = `
            <div class="card ${posClass}" style="background: ${corFundo}; color: ${corTexto}">
                <div class="card-inner">
                <div class="card-top">
                    <span>${escaparHTML(cartao.banco)}</span>
                    <div class="chip"></div>
                </div>
                <div class="card-bottom">
                    <div class="card-info">
                    <span class="label">${escaparHTML(cartao.tipo_info)}</span>
                    <span class="value">${escaparHTML(nomeCompleto)}</span>
                    </div>
                    <div class="card-number-wrapper">
                    <span class="hidden-stars">**** ${escaparHTML(cartao.final)}</span>
                    <span class="card-number">${escaparHTML(cartao.numero)}</span>
                    </div>
                </div>
                </div>
            </div>
        `;
        pocketElement.insertAdjacentHTML('beforebegin', cartaoHTML);
        pocketElement.previousElementSibling.addEventListener('click', () => {
            acessarConta(cartao.banco, cartao.final, cartao.id);
        });
    });
}

// Bônus: A função de criar novo banco já conectada com o PHP!
async function criarNovoBanco() {
    let nomeBanco = prompt("Digite o nome do novo Banco (Ex: C6 Bank, Inter, PicPay):");
    if (!nomeBanco) return;
    
    let tipoConta = prompt("Digite o tipo da conta (Ex: Corrente, Poupança, Black):");
    if (!tipoConta) return;

    // Gera os números do cartão
    let p1 = Math.floor(1000 + Math.random() * 9000);
    let p2 = Math.floor(1000 + Math.random() * 9000);
    let p3 = Math.floor(1000 + Math.random() * 9000);
    let p4 = Math.floor(1000 + Math.random() * 9000);

    const novoCartao = {
        acao: 'criar_banco',
        banco: nomeBanco,
        tipo: tipoConta,
        numero: `${p1} ${p2} ${p3} ${p4}`,
        final: p4.toString()
    };

    try {
        const resposta = await fetch('PHP/operacoes.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(novoCartao)
        });

        const res = await resposta.json();
        
        if(res.sucesso) {
            alert("Sucesso! O banco foi adicionado à sua carteira.");
            location.reload(); // Atualiza a página para puxar os dados frescos do MySQL
        } else {
            alert("Erro ao criar banco: " + res.mensagem);
        }
    } catch (erro) {
        console.error("Erro na requisição:", erro);
        alert("Erro na conexão com o servidor ao tentar criar o banco.");
    }
}