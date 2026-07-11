CREATE DATABASE bank24horas CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE bank24horas;

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
