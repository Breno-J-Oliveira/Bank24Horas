<?php
if (php_sapi_name() !== 'cli') {
    $tokenConfigurado = getenv('SETUP_TOKEN');
    if (!$tokenConfigurado || !hash_equals($tokenConfigurado, $_GET['token'] ?? '')) {
        http_response_code(403);
        echo "Acesso não autorizado.";
        exit;
    }
}

// PHP/setup.php - VERSÃO ESCOLAR FINAL
header("Content-Type: text/html; charset=utf-8");

// Configurações de Conexão
$config = file_exists(__DIR__ . '/config.php')
    ? require __DIR__ . '/config.php'
    : require __DIR__ . '/config.example.php';
$host = $config['host'];
$user = $config['user'];
$pass = $config['pass'];

try {
    // Conecta ao MySQL
    $pdo = new PDO("mysql:host=$host", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    echo "<h2>🚀 Iniciando Reset do Sistema...</h2>";

    // 1. Recria o Banco de Dados
    $pdo->exec("DROP DATABASE IF EXISTS bank24horas");
    $pdo->exec("CREATE DATABASE bank24horas CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
    $pdo->exec("USE bank24horas");
    echo "<li>✅ Banco de dados <b>bank24horas</b> criado.</li>";

    // 2. Criação das Tabelas
    $pdo->exec("
        CREATE TABLE usuarios (
            id INT AUTO_INCREMENT PRIMARY KEY,
            login VARCHAR(50) UNIQUE NOT NULL,
            senha VARCHAR(255) NOT NULL,
            nome_completo VARCHAR(100) NOT NULL
        );

        CREATE TABLE cartoes (
            id INT AUTO_INCREMENT PRIMARY KEY,
            usuario_id INT NOT NULL,
            banco VARCHAR(50) NOT NULL,
            tipo_info VARCHAR(50) NOT NULL,
            numero VARCHAR(20) NOT NULL,
            final_cartao VARCHAR(4) NOT NULL,
            saldo DECIMAL(15, 2) DEFAULT 0.00,
            FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
        );

        CREATE TABLE historico (
            id INT AUTO_INCREMENT PRIMARY KEY,
            usuario_id INT NOT NULL,
            descricao TEXT NOT NULL,
            data_operacao DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
        );
    ");
    echo "<li>✅ Estrutura de tabelas (usuarios, cartoes, historico) ok.</li>";

    // 3. Inserindo Usuários
    $stmtUser = $pdo->prepare("INSERT INTO usuarios (login, senha, nome_completo) VALUES (?, ?, ?)");
    $senhaPadrao = password_hash('123', PASSWORD_DEFAULT);
    
    // Usuário 1
    $stmtUser->execute(['breno', $senhaPadrao, 'Admin Breno']);
    $idBreno = $pdo->lastInsertId();

    // Usuário 2
    $stmtUser->execute(['Mariana', $senhaPadrao, 'Mariana Nascimento']);
    $idMariana = $pdo->lastInsertId();

    // Usuário 3
    $stmtUser->execute(['Vinicius', $senhaPadrao, 'Vinicius Vila']);
    $idVinicius = $pdo->lastInsertId();

    // Usuário 4
    $stmtUser->execute(['Nicolas', $senhaPadrao, 'Nicolas da Silva']);
    $idNicolas = $pdo->lastInsertId();

    echo "<li>✅ 4 Usuários criados com sucesso.</li>";

    // 4. Inserindo os Cartões nos respectivos donos
    $stmtCartao = $pdo->prepare("INSERT INTO cartoes (usuario_id, banco, tipo_info, numero, final_cartao, saldo) VALUES (?, ?, ?, ?, ?, ?)");
    
    // Carteira do Breno
    $stmtCartao->execute([$idBreno, 'Itaú', 'Corrente', '9012 4432 8810', '6767', 601767.00]);
    $stmtCartao->execute([$idBreno, 'Nubank', 'Crédito', '5524 9910 4242', '3553', 60000.00]);
    $stmtCartao->execute([$idBreno, 'Santander', 'Poupança', '1122 3344 5566', '1122', 15000.00]);

    // Carteira da Mariana
    $stmtCartao->execute([$idMariana, 'Nubank', 'Crédito', '5524 9910 4242', '4242', 24250.00]);
    $stmtCartao->execute([$idMariana, 'Itaú', 'Corrente', '9012 4432 8810', '8810', 100000.00]);

    // Carteira do Vinicius
    $stmtCartao->execute([$idVinicius, 'Santander', 'Conta', '1122 3344 5566', '5566', 1320.50]);
    $stmtCartao->execute([$idVinicius, 'Bradesco', 'Poupança', '9988 7766 5544', '5544', 1000.00]);
    $stmtCartao->execute([$idVinicius, 'Caixa', 'Salário', '3333 4444 5555', '5555', 2000.00]);

    // Carteira do Nicolas
    $stmtCartao->execute([$idNicolas, 'Banco do Brasil', 'Corrente', '0000 1111 2222', '2222', 50.00]);
    $stmtCartao->execute([$idNicolas, 'Inter', 'Crédito', '8888 1111 2222', '2222', 100.00]);

    echo "<li>✅ Cartões e saldos iniciais configurados.</li>";

    echo "<br><h2 style='color: #2e7d32;'>✅ SISTEMA RESETADO COM SUCESSO!</h2>";
    echo "<p>Agora você pode usar os logins <b>breno</b>, <b>Mariana</b>, <b>Vinicius</b> ou <b>Nicolas</b> com a senha <b>123</b>.</p>";

} catch (PDOException $e) {
    echo "<h2 style='color: #c62828;'>❌ ERRO CRÍTICO NO SETUP:</h2>";
    die("<p>" . $e->getMessage() . "</p>");
}
?>