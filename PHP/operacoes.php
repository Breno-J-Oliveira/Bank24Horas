<?php
session_start();
require 'conexao.php';
header("Content-Type: application/json");

if (!isset($_SESSION['usuario_id'])) {
    echo json_encode(["sucesso" => false, "mensagem" => "Não autenticado."]);
    exit;
}

$user_id = $_SESSION['usuario_id'];
$dados = json_decode(file_get_contents("PHP://input"));

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($dados->acao)) {
    
    try {
        $pdo->beginTransaction();

        if ($dados->acao === 'criar_banco') {
            $stmt = $pdo->prepare("INSERT INTO cartoes (usuario_id, banco, tipo_info, numero, final_cartao, saldo) VALUES (?, ?, ?, ?, ?, 0.00)");
            $stmt->execute([$user_id, $dados->banco, $dados->tipo, $dados->numero, $dados->final]);
            
            echo json_encode(["sucesso" => true]);
        }
        else if ($dados->acao === 'transacao') {
            // Saque ou Depósito
            $cartao_id = $dados->cartao_id;
            $valor = floatval($dados->valor);
            $tipo = $dados->tipo; // 'saque' ou 'deposito'
            $bancoNome = $dados->bancoNome;

            // Bloqueia saque sem saldo
            if ($tipo === 'saque') {
                $check = $pdo->prepare("SELECT saldo FROM cartoes WHERE id = ? AND usuario_id = ?");
                $check->execute([$cartao_id, $user_id]);
                $saldoAtual = $check->fetchColumn();
                
                if ($saldoAtual < $valor) {
                    throw new Exception("Saldo insuficiente na conta $bancoNome.");
                }
                $sql = "UPDATE cartoes SET saldo = saldo - ? WHERE id = ? AND usuario_id = ?";
                $desc = "Saque de R$ " . number_format($valor, 2, ',', '.') . " no " . $bancoNome;
            } else {
                $sql = "UPDATE cartoes SET saldo = saldo + ? WHERE id = ? AND usuario_id = ?";
                $desc = "Depósito de R$ " . number_format($valor, 2, ',', '.') . " no " . $bancoNome;
            }

            // Atualiza saldo
            $stmt = $pdo->prepare($sql);
            $stmt->execute([$valor, $cartao_id, $user_id]);

            // Grava histórico
            $hist = $pdo->prepare("INSERT INTO historico (usuario_id, descricao) VALUES (?, ?)");
            $hist->execute([$user_id, $desc]);

            echo json_encode(["sucesso" => true]);
        }
        else if ($dados->acao === 'transferencia') {
            $cartao_id = $dados->cartao_id;
            $valor = floatval($dados->valor);
            $destinatario_login = $dados->destinatario;
            $bancoNome = $dados->bancoNome;

            // 1. Verifica se destinatário existe
            $stmtDest = $pdo->prepare("SELECT id, nome_completo FROM usuarios WHERE login = ?");
            $stmtDest->execute([$destinatario_login]);
            $destinatario = $stmtDest->fetch();

            if (!$destinatario || $destinatario['id'] == $user_id) {
                throw new Exception("Usuário destino não encontrado ou inválido.");
            }

            // 2. Verifica saldo do remetente
            $check = $pdo->prepare("SELECT saldo FROM cartoes WHERE id = ? AND usuario_id = ?");
            $check->execute([$cartao_id, $user_id]);
            $saldoAtual = $check->fetchColumn();

            if ($saldoAtual < $valor) throw new Exception("Saldo insuficiente.");

            // 3. Tira do remetente
            $stmt = $pdo->prepare("UPDATE cartoes SET saldo = saldo - ? WHERE id = ? AND usuario_id = ?");
            $stmt->execute([$valor, $cartao_id, $user_id]);

            // 4. Bota no primeiro cartão do destinatário
            $stmtFirstCard = $pdo->prepare("SELECT id FROM cartoes WHERE usuario_id = ? LIMIT 1");
            $stmtFirstCard->execute([$destinatario['id']]);
            $primeiroCartao = $stmtFirstCard->fetchColumn();

            if($primeiroCartao) {
                $stmtAdd = $pdo->prepare("UPDATE cartoes SET saldo = saldo + ? WHERE id = ?");
                $stmtAdd->execute([$valor, $primeiroCartao]);
            } else {
                throw new Exception("O destinatário não possui contas ativas para receber.");
            }

            // 5. Histórico Remetente
            $descRemetente = "Transferência enviada para " . $destinatario['nome_completo'] . " (R$ " . number_format($valor, 2, ',', '.') . ")";
            $pdo->prepare("INSERT INTO historico (usuario_id, descricao) VALUES (?, ?)")->execute([$user_id, $descRemetente]);

            // 6. Histórico Destinatário
            $descDest = "Transferência recebida de " . $_SESSION['nome_completo'] . " (R$ " . number_format($valor, 2, ',', '.') . ")";
            $pdo->prepare("INSERT INTO historico (usuario_id, descricao) VALUES (?, ?)")->execute([$destinatario['id'], $descDest]);

            echo json_encode(["sucesso" => true]);
        }

        $pdo->commit();

    } catch (Exception $e) {
        $pdo->rollBack();
        echo json_encode(["sucesso" => false, "mensagem" => $e->getMessage()]);
    }
}
?>