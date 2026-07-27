const reportState = {
  requests: [],
  users: [],
  filtered: [],
  page: 1,
  pageSize: 10,
  searchTerm: ''
};

async function loadReportsData() {
  try {
    const response = await fetch('../data/users.json');
    reportState.users = await response.json();
  } catch (err) {
    reportState.users = [];
  }

  reportState.requests = JSON.parse(localStorage.getItem('vacationRequests')) || [];
  applyReportFilters();
}

function getRequesterName(username) {
  const user = reportState.users.find(u => u.username === username);
  return user ? user.name : username;
}

function applyReportFilters() {
  const term = reportState.searchTerm.trim().toLowerCase();

  reportState.filtered = reportState.requests.filter(request => {
    if (!term) return true;
    const name = getRequesterName(request.username).toLowerCase();
    return (
      request.id.toLowerCase().includes(term) ||
      name.includes(term) ||
      request.username.toLowerCase().includes(term) ||
      request.startDate.includes(term) ||
      request.endDate.includes(term) ||
      String(request.days).includes(term) ||
      request.status.toLowerCase().includes(term) ||
      request.requestDate.includes(term)
    );
  });

  reportState.page = 1;
  renderReportsTable();
}

function renderReportsTable() {
  const tbody = document.getElementById('reportsTableBody');
  const pageSize = reportState.pageSize === 'all' ? reportState.filtered.length : Number(reportState.pageSize);
  const totalPages = Math.max(1, Math.ceil(reportState.filtered.length / (pageSize || 1)) || 1);
  reportState.page = Math.min(reportState.page, totalPages);

  const start = pageSize ? (reportState.page - 1) * pageSize : 0;
  const pageItems = pageSize ? reportState.filtered.slice(start, start + pageSize) : reportState.filtered;

  if (pageItems.length === 0) {
    tbody.innerHTML = '<tr><td colspan="8" class="empty-row">No hay solicitudes registradas.</td></tr>';
  } else {
    tbody.innerHTML = pageItems.map(request => `
      <tr>
        <td>${request.id}</td>
        <td>${getRequesterName(request.username)}</td>
        <td>${request.username}</td>
        <td>${request.startDate}</td>
        <td>${request.endDate}</td>
        <td>${request.days}</td>
        <td>${request.status}</td>
        <td>${request.requestDate}</td>
      </tr>
    `).join('');
  }

  renderReportsPagination(totalPages);
}

function renderReportsPagination(totalPages) {
  const info = document.getElementById('paginationInfo');
  const controls = document.getElementById('paginationControls');
  const totalItems = reportState.filtered.length;
  const pageSize = reportState.pageSize === 'all' ? totalItems : Number(reportState.pageSize);
  const start = totalItems === 0 ? 0 : (reportState.page - 1) * pageSize + 1;
  const end = Math.min(reportState.page * (pageSize || totalItems), totalItems);

  info.textContent = `Mostrando ${start} a ${end} de ${totalItems} Entradas`;

  let buttons = `<button type="button" data-page="prev" ${reportState.page === 1 ? 'disabled' : ''}>Anterior</button>`;
  for (let i = 1; i <= totalPages; i++) {
    buttons += `<button type="button" data-page="${i}" class="${i === reportState.page ? 'active' : ''}">${i}</button>`;
  }
  buttons += `<button type="button" data-page="next" ${reportState.page === totalPages ? 'disabled' : ''}>Siguiente</button>`;
  controls.innerHTML = buttons;

  controls.querySelectorAll('button').forEach(btn => {
    btn.addEventListener('click', () => {
      const value = btn.dataset.page;
      if (value === 'prev') reportState.page -= 1;
      else if (value === 'next') reportState.page += 1;
      else reportState.page = Number(value);
      renderReportsTable();
    });
  });
}

document.getElementById('searchInput').addEventListener('input', (event) => {
  reportState.searchTerm = event.target.value;
  applyReportFilters();
});

document.getElementById('pageSizeSelect').addEventListener('change', (event) => {
  reportState.pageSize = event.target.value;
  reportState.page = 1;
  renderReportsTable();
});

document.getElementById('exportBtn').addEventListener('click', () => {
  const headers = ['N Solicitud', 'Apellidos y Nombres', 'N Documento de Identidad', 'Fecha Inicio', 'Fecha Retorno', 'Dias', 'Estado Solicitud', 'Fecha Solicitud'];
  const rows = reportState.filtered.map(request => [
    request.id,
    getRequesterName(request.username),
    request.username,
    request.startDate,
    request.endDate,
    request.days,
    request.status,
    request.requestDate
  ]);

  const csvContent = [headers, ...rows]
    .map(row => row.map(value => `"${String(value).replace(/"/g, '""')}"`).join(','))
    .join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'reporte-vacaciones.csv';
  link.click();
});

loadReportsData();
