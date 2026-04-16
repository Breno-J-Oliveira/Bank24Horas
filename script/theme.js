// script/theme.js

function aplicarTema() {
    const htmlElement = document.documentElement;
    const savedTheme = localStorage.getItem('theme') || 'dark';
    
    if (savedTheme === 'dark') {
        htmlElement.classList.add('dark-theme');
    } else {
        htmlElement.classList.remove('dark-theme');
    }
}

// Aplica o tema imediatamente para evitar tela branca/piscando
aplicarTema();

function inicializarTema() {
    const themeToggle = document.getElementById('theme-toggle');
    if (!themeToggle) return;

    const savedTheme = localStorage.getItem('theme') || 'dark';
    themeToggle.checked = (savedTheme === 'light');

    themeToggle.addEventListener('change', () => {
        if (themeToggle.checked) {
            document.documentElement.classList.remove('dark-theme');
            localStorage.setItem('theme', 'light');
        } else {
            document.documentElement.classList.add('dark-theme');
            localStorage.setItem('theme', 'dark');
        }
    });
}

document.addEventListener('DOMContentLoaded', inicializarTema);