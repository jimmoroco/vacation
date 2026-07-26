// Fill "Solicitante" and "Aprobador" from the logged-in user's data
// (loggedUser is already declared and loaded by common.js, which runs first)
if (loggedUser) {
  document.getElementById('requesterInput').value = loggedUser.name;
  document.getElementById('approverInput').value = loggedUser.approver || '';
  document.getElementById('balanceInput').value = loggedUser.vacationBalance ?? '';
}

const startDateInput = document.getElementById('startDateInput');
const endDateInput = document.getElementById('endDateInput');
const daysInput = document.getElementById('daysInput');
const commentsInput = document.getElementById('commentsInput');
const vacationError = document.getElementById('vacationError');
const saveButton = document.getElementById('saveButton');

// "Fecha de Salida" must be greater than today
const today = new Date();
today.setHours(0, 0, 0, 0);
const minStartDate = new Date(today);
minStartDate.setDate(minStartDate.getDate() + 1);
startDateInput.min = minStartDate.toISOString().slice(0, 10);

function daysBetween(start, end) {
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.round((end - start) / msPerDay);
}

function updateDays() {
  vacationError.textContent = '';
  daysInput.value = '';

  if (!startDateInput.value || !endDateInput.value) return;

  const startDate = new Date(startDateInput.value);
  const endDate = new Date(endDateInput.value);
  const days = daysBetween(startDate, endDate);

  if (days <= 0) {
    vacationError.textContent = 'La fecha de retorno debe ser posterior a la fecha de salida.';
    return;
  }

  const balance = loggedUser.vacationBalance ?? 0;
  if (days > balance) {
    vacationError.textContent = `Los días solicitados (${days}) exceden tu saldo de vacaciones (${balance}).`;
    return;
  }

  daysInput.value = days;
}

// "Fecha de Retorno" must always be after the selected "Fecha de Salida"
startDateInput.addEventListener('change', () => {
  const startDate = new Date(startDateInput.value);
  const minEndDate = new Date(startDate);
  minEndDate.setDate(minEndDate.getDate() + 1);
  endDateInput.min = minEndDate.toISOString().slice(0, 10);
  updateDays();
});

endDateInput.addEventListener('change', updateDays);

saveButton.addEventListener('click', () => {
  vacationError.textContent = '';

  if (!startDateInput.value || !endDateInput.value) {
    vacationError.textContent = 'Debes completar la fecha de salida y la fecha de retorno.';
    return;
  }

  const startDate = new Date(startDateInput.value);
  const endDate = new Date(endDateInput.value);
  const days = daysBetween(startDate, endDate);
  const balance = loggedUser.vacationBalance ?? 0;

  if (startDate <= today) {
    vacationError.textContent = 'La fecha de salida debe ser mayor a la fecha de hoy.';
    return;
  }

  if (days <= 0) {
    vacationError.textContent = 'La fecha de retorno debe ser posterior a la fecha de salida.';
    return;
  }

  if (days > balance) {
    vacationError.textContent = `Los días solicitados (${days}) exceden tu saldo de vacaciones (${balance}).`;
    return;
  }

  const request = {
    id: `REQ-${Date.now()}`,
    username: loggedUser.username,
    startDate: startDateInput.value,
    endDate: endDateInput.value,
    days: days,
    comments: commentsInput.value,
    status: 'PENDIENTE',
    requestDate: new Date().toISOString().slice(0, 10)
  };

  const requests = JSON.parse(localStorage.getItem('vacationRequests')) || [];
  requests.push(request);
  localStorage.setItem('vacationRequests', JSON.stringify(requests));

  alert('Solicitud registrada correctamente.');
});
