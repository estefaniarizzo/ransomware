const darkModeToggle = document.getElementById('darkModeToggle');
const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');

if (localStorage.getItem('darkMode') === 'true' || 
    (!localStorage.getItem('darkMode') && prefersDarkScheme.matches)) {
  document.documentElement.classList.add('dark');
}

darkModeToggle.addEventListener('click', () => {
  const isDark = document.documentElement.classList.toggle('dark');
  localStorage.setItem('darkMode', isDark);
  darkModeToggle.textContent = isDark ? '☀️' : '🌓';
});
