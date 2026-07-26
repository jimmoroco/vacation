// Fill "Solicitante" and "Aprobador" from the logged-in user's data
// (loggedUser is already declared and loaded by common.js, which runs first)
if (loggedUser) {
  document.getElementById('requesterInput').value = loggedUser.name;
  document.getElementById('approverInput').value = loggedUser.approver || '';
}
