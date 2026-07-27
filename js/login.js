document.getElementById('loginForm').addEventListener('submit', async (event) => {
  event.preventDefault();
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value;
  const errorMessage = document.getElementById('errorMessage');

  try {
    const response = await fetch('data/users.json');
    const users = await response.json();
    const foundUser = users.find(user => user.username === username && user.password === password);

    if (foundUser) {
      errorMessage.textContent = '';
      sessionStorage.setItem('loggedUser', JSON.stringify(foundUser));

      const menuResponse = await fetch('data/menu.json');
      const menu = await menuResponse.json();
      const roleItems = menu[foundUser.role] || [];
      const defaultItem = roleItems.find(item => item.default) || roleItems[0];
      const defaultPage = (defaultItem && defaultItem.href && defaultItem.href !== '#')
        ? defaultItem.href
        : 'main.html';

      window.location.href = `pages/${defaultPage}`;
    } else {
      errorMessage.textContent = 'Usuario o contraseña incorrectos.';
    }
  } catch (err) {
    errorMessage.textContent = 'No se pudo validar. Verifica que data/users.json esté accesible.';
  }
});
