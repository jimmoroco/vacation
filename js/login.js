document.getElementById('loginForm').addEventListener('submit', async (event) => {
  event.preventDefault();
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value;
  const errorMessage = document.getElementById('errorMessage');

  try {
    const response = await fetch('users.json');
    const users = await response.json();
    const foundUser = users.find(user => user.username === username && user.password === password);

    if (foundUser) {
      errorMessage.textContent = '';
      sessionStorage.setItem('loggedUser', JSON.stringify(foundUser));
      window.location.href = 'pages/main.html';
    } else {
      errorMessage.textContent = 'Usuario o contraseña incorrectos.';
    }
  } catch (err) {
    errorMessage.textContent = 'No se pudo validar. Verifica que users.json esté accesible.';
  }
});
