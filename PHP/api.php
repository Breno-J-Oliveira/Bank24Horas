<?php
session_start();
require 'conexao.php';
header("Content-Type: application/json");

if (!isset($_SESSION['usuario_id'])) {
    echo json_encode(["sucesso" => false, "mensagem" => "Não autenticado."]);
    exit;
}

$user_id = $_SESSION['usuario_id'];

$stmtCartoes = $pdo->prepare("SELECT id, banco, tipo_info, numero, final_cartao as final, saldo FROM cartoes WHERE usuario_id = ?");
$stmtCartoes->execute([$user_id]);
$cartoes = $stmtCartoes->fetchAll();

$stmtHist = $pdo->prepare("SELECT descricao, data_operacao FROM historico WHERE usuario_id = ? ORDER BY id DESC");
$stmtHist->execute([$user_id]);
$historico = $stmtHist->fetchAll();

$saldoTotal = array_sum(array_column($cartoes, 'saldo'));

echo json_encode([
    "sucesso" => true,
    "dados" => [
        "nomeCompleto" => $_SESSION['nome_completo'],
        "saldoTotal" => $saldoTotal,
        "cartoes" => $cartoes,
        "historico" => $historico
    ]
]);
?>