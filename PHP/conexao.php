<?php
$host = 'localhost';
$db   = 'bank24horas';
$user = 'root';
$pass = 'Senai@118';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$db;charset=utf8", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
} catch (PDOException $e) {
    die(json_encode(["sucesso" => false, "mensagem" => "Erro de conexão: " . $e->getMessage()]));
}
?>