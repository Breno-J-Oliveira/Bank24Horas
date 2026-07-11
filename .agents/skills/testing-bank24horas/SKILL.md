---
name: testing-bank24horas
description: Set up and test the Bank24Horas PHP/MySQL + vanilla JS banking app end-to-end locally. Use when verifying login, wallet, transactions, transfers, PDF export, or the setup.php security guard.
---

# Testing Bank24Horas

Bank24Horas is a PHP (PDO) + MySQL/MariaDB backend with a static vanilla-JS frontend (`index.html` → `index2.html` wallet → `index3.html` account). No build step, no CI, no package manager.

## Local setup

1. `php-cli` + `php-mysql` (the `pdo_mysql` driver is required — `php -m | grep pdo_mysql`). Install a MySQL/MariaDB server (`mariadb-server`) and start it with `sudo service mariadb start` (no systemd in this env).
2. Credentials live in `PHP/config.php` (git-ignored), which returns `['host'=>..., 'db'=>'bank24horas', 'user'=>..., 'pass'=>...]`. Copy from `PHP/config.example.php`. Use `host => '127.0.0.1'` so PDO connects over TCP. A throwaway local user like `bank`/`bank` with privileges to CREATE DATABASE works. These are local-only creds, not real secrets.
3. Seed the DB from the CLI: `php PHP/setup.php`. It drops/recreates `bank24horas`, creates tables (`usuarios`, `cartoes`, `historico`) and 4 users. **`setup.php` refuses web execution** unless `SETUP_TOKEN` env is set and passed as `?token=` — so always seed via CLI.
4. Serve from repo root: `php -S localhost:8000` (keep it running in its own shell). Open `http://localhost:8000/index.html`.

Alternatively credentials can come from env vars `DB_HOST`/`DB_NAME`/`DB_USER`/`DB_PASS` (see `config.example.php`).

## Test accounts (seeded, password `123`, stored hashed via `password_hash`)
- `breno` (Admin Breno): Itaú 601767, Nubank 60000, Santander 15000
- `Mariana` (Mariana Nascimento): Nubank 24250, **Itaú 100000**
- `Vinicius`, `Nicolas`: smaller balances

The breno/Mariana pair both having Itaú is useful for testing **same-bank transfer targeting** (transfer from breno's Itaú should credit Mariana's Itaú, not her first card).

## UI gotchas
- Login uses inline `onclick="entrar()"`; type into `#login` and `#senha` then click Entrar. If a "preencha o usuário e a senha" alert appears, the fields didn't receive focus — click each field explicitly before typing.
- Deposit/Saque/Transferência use native `prompt()` dialogs (and `alert()` for results). Handle them as browser dialogs. Transferência asks two prompts: destinatário login, then valor.
- **Ver saldo toggles** (click shows total, click again hides). It shows the account's TOTAL across all cards, not per-card.
- Wallet total balance is hidden as `******` until you hover the pocket area.
- Insufficient-balance check is per-card (the accessed card's `saldo`), so withdraw more than that specific card to trigger "Saldo insuficiente na conta X".

## Verifying results
- Balance changes: use Ver saldo in UI, or query MySQL directly: `sudo mysql -e "SELECT banco,saldo FROM bank24horas.cartoes c JOIN bank24horas.usuarios u ON u.id=c.usuario_id WHERE u.login='Mariana';"`
- Security guard: `curl -s -o /dev/null -w '%{http_code}' http://localhost:8000/PHP/setup.php` should be `403`.
- Login backend: `curl -X POST http://localhost:8000/PHP/auth.php -H 'Content-Type: application/json' -d '{"acao":"login","login":"breno","senha":"123"}'` → `{"sucesso":true,...}`.

## Lint (no CI)
- PHP: `for f in PHP/*.php; do php -l "$f"; done`
- JS: `for f in script/*.js; do node --check "$f"; done`

## Devin Secrets Needed
None. All credentials are local throwaway values created during setup.
