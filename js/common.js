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
  updateVacationBalanceText();
}

// Available vacation balance = users.json balance minus days already requested (in localStorage) for this user
function getAvailableVacationBalance(user) {
  if (!user || user.vacationBalance === undefined) return 0;

  const requests = JSON.parse(localStorage.getItem('vacationRequests')) || [];
  const usedDays = requests
    .filter(request => request.username === user.username)
    .reduce((total, request) => total + request.days, 0);

  return user.vacationBalance - usedDays;
}

// Update the "Saldo de Vacaciones" banner shown in Principal, if present on this page
function updateVacationBalanceText() {
  const vacationBalanceText = document.getElementById('vacationBalanceText');
  if (!vacationBalanceText) return;

  const balance = getAvailableVacationBalance(loggedUser);
  vacationBalanceText.textContent = `${balance} días calendario`;
}

// Log out: clear the session and go back to the login page
document.getElementById('logoutBtn').addEventListener('click', () => {
  sessionStorage.removeItem('loggedUser');
  window.location.href = '../index.html';
});

// Show a small notification that fades out on its own after a few seconds
function showToast(message) {
  let container = document.getElementById('toastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  container.appendChild(toast);

  requestAnimationFrame(() => toast.classList.add('show'));

  setTimeout(() => {
    toast.classList.remove('show');
    toast.addEventListener('transitionend', () => toast.remove());
  }, 3000);
}

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
