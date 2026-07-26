// Mobile menu toggle
const menuToggleButton = document.getElementById('menuToggle');
const sidebar = document.getElementById('sidebar');
const overlay = document.getElementById('overlay');

function closeMenu() {
  sidebar.classList.remove('open');
  overlay.classList.remove('show');
}

menuToggleButton.addEventListener('click', () => {
  sidebar.classList.toggle('open');
  overlay.classList.toggle('show');
});

overlay.addEventListener('click', closeMenu);

// Welcome message and role label from the logged-in user
const welcomeMessage = document.querySelector('.welcome-message');
const roleLabel = document.querySelector('.role-label');
const loggedUser = JSON.parse(sessionStorage.getItem('loggedUser'));

if (!loggedUser) {
  window.location.href = '../index.html';
} else {
  welcomeMessage.textContent = `BIENVENIDO, ${loggedUser.name}`;
  roleLabel.textContent = loggedUser.role;
  loadNavMenu(loggedUser.role);
}

// Log out: clear the session and go back to the login page
document.getElementById('logoutBtn').addEventListener('click', () => {
  sessionStorage.removeItem('loggedUser');
  window.location.href = '../index.html';
});

// Load sidebar nav items from menu.json, filtered by user role
async function loadNavMenu(role) {
  const nav = document.getElementById('sidebarNav');
  const currentPage = location.pathname.split('/').pop();

  try {
    const response = await fetch('../data/menu.json');
    const menu = await response.json();
    const items = menu[role] || [];

    nav.innerHTML = items
      .map(item => `<a href="${item.href}"${item.href === currentPage ? ' class="active"' : ''}>${item.icon} ${item.label}</a>`)
      .join('');
  } catch (err) {
    nav.innerHTML = '<a href="#">Error al cargar el menú</a>';
  }
}
