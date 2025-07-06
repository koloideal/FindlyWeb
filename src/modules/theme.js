export class ThemeSwitcher {
  #toggleBtn;

  constructor() {
    this.#toggleBtn = document.querySelector('.theme-toggle');
    this.#initTheme();
    this.#bindEvents();
  }

  #initTheme() {
    const savedTheme = localStorage.getItem('theme') ||
      (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', savedTheme);
  }

  #bindEvents() {
    this.#toggleBtn?.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme');
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', newTheme);
      localStorage.setItem('theme', newTheme);
    });
  }
} 