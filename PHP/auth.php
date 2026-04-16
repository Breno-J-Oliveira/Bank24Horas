<?php
// PHP/auth.php - LOGIN SIMPLES
session_start();
require 'conexao.php';
header("Content-Type: application/json");

// Recebe os dados do JavaScript
$dados = json_decode(file_get_contents("PHP://input"));

// Verifica se a requisição é válida
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($dados->acao)) {
    
    if ($dados->acao === 'login') {
        $login = $dados->login;
        $senha = $dados->senha; // A senha vem limpa do JavaScript

        // Busca o usuário no banco
        $stmt = $pdo->prepare("SELECT * FROM usuarios WHERE login = ?");
        $stmt->execute([$login]);
        $usuario = $stmt->fetch();

        // Validação DIRETA: se o usuário existir e a senha for igual a do banco
        if ($usuario && $usuario['senha'] === $senha) {
            $_SESSION['usuario_id'] = $usuario['id'];
            $_SESSION['nome_completo'] = $usuario['nome_completo'];
            
            echo json_encode(["sucesso" => true, "nome" => $usuario['nome_completo']]);
        } else {
            echo json_encode(["sucesso" => false, "mensagem" => "Login ou senha incorretos."]);
        }
    } 
    
    else if ($dados->acao === 'logout') {
        session_destroy();
        echo json_encode(["sucesso" => true]);
    }
} else {
    // Retorno de segurança caso o arquivo seja acessado diretamente
    echo json_encode(["sucesso" => false, "mensagem" => "Requisição inválida."]);
}
?>