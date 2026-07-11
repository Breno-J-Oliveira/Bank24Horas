<?php
$caminhoConfig = __DIR__ . '/config.php';
$config = file_exists($caminhoConfig)
    ? require $caminhoConfig
    : require __DIR__ . '/config.example.php';

$host = $config['host'];
$db   = $config['db'];
$user = $config['user'];
$pass = $config['pass'];

try {
    $pdo = new PDO("mysql:host=$host;dbname=$db;charset=utf8", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
} catch (PDOException $e) {
    die(json_encode(["sucesso" => false, "mensagem" => "Erro de conexão: " . $e->getMessage()]));
}
?>