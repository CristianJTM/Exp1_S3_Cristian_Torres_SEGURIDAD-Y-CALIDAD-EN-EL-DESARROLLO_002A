
async function loadPatients() {

    const token = localStorage.getItem('jwtToken');
    if (!token) {
        console.warn('No JWT token found, redirecting to login');
        window.location.href = '/login';
        return;
    }

    try {

        const response = await fetch('/api/patients', {
            headers: { 'Authorization': 'Bearer ' + token }
        });


        if (response.status === 401 || response.status === 403) {
            localStorage.removeItem('jwtToken');
            window.location.href = '/login';
            return;
        }

        const patients = await response.json();

        const tbody = document.getElementById('patientsTableBody');
        tbody.innerHTML = '';

        if (!patients.length) {
            tbody.innerHTML = '<tr><td colspan="6">No hay pacientes registrados.</td></tr>';
            return;
        }

        patients.forEach(patient => {
            const row = document.createElement('tr');
            row.innerHTML = `<td>${patient.id}</td><td>${patient.name}</td><td>${patient.species}</td><td>${patient.breed}</td><td>${patient.age}</td><td>${patient.owner}</td>`;
            tbody.appendChild(row);
        });
    } catch (error) {
        console.error('Frontend: GET /api/patients error=', error.message, error.stack);
        document.getElementById('patientsTableBody').innerHTML = '<tr><td colspan="6">Error cargando pacientes.</td></tr>';
    }
}

loadPatients();