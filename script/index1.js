// ====================================================================
// 1. LÓGICA DE LOGIN CONECTADA AO SEU auth.php
// ====================================================================

window.entrar = async function() {
    const campoLogin = document.getElementById('login');
    const campoSenha = document.getElementById('senha');
    const modal = document.getElementById('modalBemVindo');

    if (!campoLogin || !campoSenha) {
        console.error("Campos de input não encontrados!");
        return;
    }

    // O seu PHP parece esperar o login exatamente como está no banco (ex: 'breno', 'Mariana')
    const usuarioDigitado = campoLogin.value.trim();
    const senhaDigitada = campoSenha.value.trim();

    if (!usuarioDigitado || !senhaDigitada) {
        alert("Por favor, preencha o usuário e a senha.");
        return;
    }

    try {
        // Agora apontamos para o arquivo correto: auth.php
        const resposta = await fetch('PHP/auth.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                acao: 'login',            // Seu PHP exige isso
                login: usuarioDigitado,   // Seu PHP exige isso
                senha: senhaDigitada      // Seu PHP exige isso
            })
        });

        const dados = await resposta.json();

        // Se o PHP retornar sucesso (senha e login bateram no banco)
        if (dados.sucesso) {
            document.getElementById('modalMensagem').innerText = `Bem-vindo(a), ${dados.nome}!`;
            
            // Salva na memória do navegador para as outras telas usarem
            localStorage.setItem("usuarioLogado", usuarioDigitado);
            localStorage.setItem("nomeUsuario", dados.nome);
            
            // Exibe o modal
            modal.style.display = 'flex';
        } else {
            // Se errar a senha ou o login
            alert(dados.mensagem || "Login ou senha incorretos.");
        }

    } catch (erro) {
        console.error("Erro ao conectar com o servidor PHP:", erro);
        alert("Erro de conexão com o banco de dados. Verifique se o servidor está rodando.");
    }
};

window.irParaCarteira = function() {
    window.location.href = "index2.html"; 
};

// ====================================================================
// 2. ANIMAÇÃO DE FUNDO (A SUA FITA p5.js ORIGINAL MANTIDA 100%)
// ====================================================================
const iniciarP5 = () => {
    if (!document.getElementById("fundo-animado")) return;

    new p5(function (p) {
        const SEGMENTS = 400; 
        const RIBBON_HALF_W = 14; 
        const RIBBON_X_SCALE = 1.4; 
        const RIBBON_X_OFFSET = 0.2; 
        const WAVE_SPEED = 0.018; 
        const WAVE1_FREQ = 3.5; 
        const WAVE1_TIME_SPEED = 0.7; 
        const WAVE1_AMP = 110; 
        const WAVE2_FREQ = 7.0; 
        const WAVE2_TIME_SPEED = 1.1; 
        const WAVE2_AMP = 30; 
        const TWIST_CYCLES = 6; 
        const TWIST_TIME_SPEED = 0.5; 

        // Cores
        const COLOR_FACE = [255, 60, 10]; 
        const COLOR_FOLD_A = [180, 255, 0]; 
        const COLOR_FOLD_B = [60, 80, 255]; 
        const COLOR_FOLD_C = [0, 220, 255]; 
        const COLOR_CYCLE_FREQ = 2.0; 
        const COLOR_CYCLE_SPEED = 0.3; 
        const FACE_BLEND_GAMMA = 1.2; 
        const SHADOW_COLOR = [20, 10, 0]; 
        const SHADOW_ALPHA = 15;
        const SHADOW_OFFSET_X = 4;
        const SHADOW_OFFSET_Y = 7;
        const EDGE_MIN_TWIST = 0.08; 
        const EDGE_COLOR = [0, 0, 0];
        const EDGE_ALPHA = 22;
        const EDGE_WEIGHT = 0.5;

        let t = 0;

        function lerpColorArr(a, b, f) {
            return [
                Math.round(a[0] + (b[0] - a[0]) * f),
                Math.round(a[1] + (b[1] - a[1]) * f),
                Math.round(a[2] + (b[2] - a[2]) * f)
            ];
        }

        function buildSpine(time) {
            const pts = [];
            for (let i = 0; i <= SEGMENTS; i++) {
                const progress = i / SEGMENTS;
                pts.push({
                    x: progress * p.width * RIBBON_X_SCALE - p.width * RIBBON_X_OFFSET,
                    y: p.height / 2 +
                        Math.sin(progress * Math.PI * WAVE1_FREQ + time * WAVE1_TIME_SPEED) * WAVE1_AMP +
                        Math.sin(progress * Math.PI * WAVE2_FREQ + time * WAVE2_TIME_SPEED) * WAVE2_AMP
                });
            }
            return pts;
        }

        function buildNormals(pts) {
            const last = pts.length - 1;
            return pts.map((_, i) => {
                const dx = i === 0 ? pts[1].x - pts[0].x : i === last ? pts[last].x - pts[last - 1].x : pts[i + 1].x - pts[i - 1].x;
                const dy = i === 0 ? pts[1].y - pts[0].y : i === last ? pts[last].y - pts[last - 1].y : pts[i + 1].y - pts[i - 1].y;
                const len = Math.sqrt(dx * dx + dy * dy) || 1;
                return { nx: -dy / len, ny: dx / len };
            });
        }

        function buildEdges(pts, normals, time) {
            const tops = [], bots = [], twists = [];
            for (let i = 0; i <= SEGMENTS; i++) {
                const twist = Math.cos((i / SEGMENTS) * Math.PI * TWIST_CYCLES + time * TWIST_TIME_SPEED);
                const w = RIBBON_HALF_W * Math.abs(twist);
                const sign = twist >= 0 ? 1 : -1;
                twists.push(twist);
                tops.push({
                    x: pts[i].x + normals[i].nx * w * sign,
                    y: pts[i].y + normals[i].ny * w * sign
                });
                bots.push({
                    x: pts[i].x - normals[i].nx * w * sign,
                    y: pts[i].y - normals[i].ny * w * sign
                });
            }
            return { tops, bots, twists };
        }

        function getFoldColor(frac, time) {
            const cycle = (((frac * COLOR_CYCLE_FREQ + time * COLOR_CYCLE_SPEED) % 1) + 1) % 1;
            if (cycle < 1 / 3) return lerpColorArr(COLOR_FOLD_A, COLOR_FOLD_B, cycle * 3);
            if (cycle < 2 / 3) return lerpColorArr(COLOR_FOLD_B, COLOR_FOLD_C, (cycle - 1 / 3) * 3);
            return lerpColorArr(COLOR_FOLD_C, COLOR_FOLD_A, (cycle - 2 / 3) * 3);
        }

        function getRibbonColor(frac, twist, time) {
            const foldColor = getFoldColor(frac, time);
            const facedness = Math.pow(Math.abs(twist), FACE_BLEND_GAMMA);
            return lerpColorArr(foldColor, COLOR_FACE, facedness);
        }

        function drawQuad(ax, ay, bx, by, cx, cy, dx, dy) {
            p.beginShape();
            p.vertex(ax, ay); p.vertex(bx, by);
            p.vertex(cx, cy); p.vertex(dx, dy);
            p.endShape(p.CLOSE);
        }

        p.setup = function () {
            const canvas = p.createCanvas(p.windowWidth, p.windowHeight);
            canvas.parent("fundo-animado"); 
            p.smooth();
        };

        p.windowResized = function() {
            p.resizeCanvas(p.windowWidth, p.windowHeight);
        };

        p.draw = function () {
            p.clear(); 
            t += WAVE_SPEED;

            const pts = buildSpine(t);
            const normals = buildNormals(pts);
            const { tops, bots, twists } = buildEdges(pts, normals, t);

            p.noStroke();
            p.fill(...SHADOW_COLOR, SHADOW_ALPHA);
            for (let i = 0; i < SEGMENTS; i++) {
                drawQuad(
                    tops[i].x + SHADOW_OFFSET_X, tops[i].y + SHADOW_OFFSET_Y,
                    tops[i + 1].x + SHADOW_OFFSET_X, tops[i + 1].y + SHADOW_OFFSET_Y,
                    bots[i + 1].x + SHADOW_OFFSET_X, bots[i + 1].y + SHADOW_OFFSET_Y,
                    bots[i].x + SHADOW_OFFSET_X, bots[i].y + SHADOW_OFFSET_Y
                );
            }

            for (let i = 0; i < SEGMENTS; i++) {
                const [r, g, b] = getRibbonColor(i / SEGMENTS, twists[i], t);
                p.fill(r, g, b);
                p.noStroke();
                drawQuad(
                    tops[i].x, tops[i].y,
                    tops[i + 1].x, tops[i + 1].y,
                    bots[i + 1].x, bots[i + 1].y,
                    bots[i].x, bots[i].y
                );

                if (Math.abs(twists[i]) > EDGE_MIN_TWIST) {
                    p.stroke(...EDGE_COLOR, EDGE_ALPHA);
                    p.strokeWeight(EDGE_WEIGHT);
                    p.line(tops[i].x, tops[i].y, tops[i + 1].x, tops[i + 1].y);
                    p.line(bots[i].x, bots[i].y, bots[i + 1].x, bots[i + 1].y);
                }
            }
        };
    }, "fundo-animado");
};

iniciarP5();