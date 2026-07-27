// Fill "Solicitante" and "Aprobador" from the logged-in user's data
// (loggedUser and getAvailableVacationBalance are declared in common.js, which runs first)
if (loggedUser) {
  document.getElementById('requesterInput').value = loggedUser.name;
  document.getElementById('approverInput').value = loggedUser.approver || '';
}

const startDateInput = document.getElementById('startDateInput');
const endDateInput = document.getElementById('endDateInput');
const daysInput = document.getElementById('daysInput');
const balanceInput = document.getElementById('balanceInput');
const commentsInput = document.getElementById('commentsInput');
const vacationError = document.getElementById('vacationError');
const saveButton = document.getElementById('saveButton');

const availableBalance = getAvailableVacationBalance(loggedUser);
balanceInput.value = availableBalance;

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

// Recalculates "Días" and enables "Guardar" only when both dates are filled and valid.
// "Coordinaciones / Comentarios" is optional and doesn't affect this check.
function updateDays() {
  vacationError.textContent = '';
  daysInput.value = '';
  saveButton.disabled = true;

  if (!startDateInput.value || !endDateInput.value) return;

  const startDate = new Date(startDateInput.value);
  const endDate = new Date(endDateInput.value);
  const days = daysBetween(startDate, endDate);

  if (days <= 0) {
    vacationError.textContent = 'La fecha de retorno debe ser posterior a la fecha de salida.';
    return;
  }

  if (days > availableBalance) {
    vacationError.textContent = `Los días solicitados (${days}) exceden tu saldo de vacaciones (${availableBalance}).`;
    return;
  }

  daysInput.value = days;
  saveButton.disabled = false;
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
  // Safety net in case the button state gets out of sync
  if (!startDateInput.value || !endDateInput.value || !daysInput.value) {
    vacationError.textContent = 'Debes completar la fecha de salida y la fecha de retorno.';
    return;
  }

  const request = {
    id: `REQ-${Date.now()}`,
    username: loggedUser.username,
    startDate: startDateInput.value,
    endDate: endDateInput.value,
    days: Number(daysInput.value),
    comments: commentsInput.value,
    status: 'PENDIENTE',
    requestDate: new Date().toISOString().slice(0, 10)
  };

  const requests = JSON.parse(localStorage.getItem('vacationRequests')) || [];
  requests.push(request);
  localStorage.setItem('vacationRequests', JSON.stringify(requests));

  window.location.href = 'main.html';
});
