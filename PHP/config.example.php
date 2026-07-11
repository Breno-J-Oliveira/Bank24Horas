<?php
return [
    'host' => getenv('DB_HOST') ?: 'localhost',
    'db'   => getenv('DB_NAME') ?: 'bank24horas',
    'user' => getenv('DB_USER') ?: 'root',
    'pass' => getenv('DB_PASS') ?: '',
];
