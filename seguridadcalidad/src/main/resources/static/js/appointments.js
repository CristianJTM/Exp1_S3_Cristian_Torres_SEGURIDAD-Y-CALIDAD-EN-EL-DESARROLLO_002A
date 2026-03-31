
async function loadAppointments() {
    const token = localStorage.getItem('jwtToken');
    if (!token) {
        window.location.href = '/login';
        return;
    }


    try {
        const response = await fetch('/api/appointments', {
            headers: { 'Authorization': 'Bearer ' + token }
        });

        if (response.status === 401 || response.status === 403) {
            localStorage.removeItem('jwtToken');
            window.location.href = '/login';
            return;
        }

        const appointments = await response.json();
        const tbody = document.getElementById('appointmentsTableBody');
        tbody.innerHTML = '';

        if (!appointments.length) {
            tbody.innerHTML = '<tr><td colspan="6">No hay citas agendadas.</td></tr>';
            return;
        }

        appointments.forEach(appointment => {
            const row = document.createElement('tr');
            row.innerHTML = `<td>${appointment.id}</td><td>${appointment.patientId}</td><td>${appointment.date}</td><td>${appointment.time}</td><td>${appointment.reason}</td><td>${appointment.veterinarian}</td>`;
            tbody.appendChild(row);
        });
    } catch (error) {
        console.error('Frontend: GET /api/appointments error=', error.message, error.stack);
        document.getElementById('appointmentsTableBody').innerHTML = '<tr><td colspan="6">Error cargando citas.</td></tr>';
    }
}

loadAppointments();