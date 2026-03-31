async function loadPatientsOptions() {
    const token = localStorage.getItem('jwtToken');
    if (!token) {
        window.location.href = '/login';
        return;
    }

    try {
        const response = await fetch('/api/patients', {
            headers: { 'Authorization': 'Bearer ' + token }
        });
;

        if (!response.ok) {
            localStorage.removeItem('jwtToken');
            window.location.href = '/login';
            return;
        }

        const patients = await response.json();
        const select = document.getElementById('patientId');
        patients.forEach(patient => {
            const option = document.createElement('option');
            option.value = patient.id;
            option.textContent = patient.name;
            select.appendChild(option);
        });
    } catch (err) {
        console.error('Frontend: GET /api/patients (for options) error=', err.message, err.stack);
        document.getElementById('errorAppointment').textContent = 'Error cargando lista de pacientes.';
    }
}

document.getElementById('appointmentForm').addEventListener('submit', async function(event) {
    event.preventDefault();
    const token = localStorage.getItem('jwtToken');
    if (!token) { window.location.href = '/login'; return; }

    const body = {
        patientId: parseInt(document.getElementById('patientId').value, 10),
        date: document.getElementById('date').value,
        time: document.getElementById('time').value,
        reason: document.getElementById('reason').value,
        veterinarian: document.getElementById('veterinarian').value
    };

    try {
        const response = await fetch('/api/appointments', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token,
            },
            body: JSON.stringify(body)
        });

        if (response.status === 401 || response.status === 403) {
            localStorage.removeItem('jwtToken');
            window.location.href = '/login';
            return;
        }

        if (!response.ok) {
            const err = await response.text();
            console.error('Frontend: POST /api/appointments error response=', err);
            document.getElementById('errorAppointment').textContent = 'Error: ' + err;
            return;
        }

        window.location.href = '/appointments';
    } catch (err) {
        console.error('Frontend: POST /api/appointments error=', err);
        document.getElementById('errorAppointment').textContent = 'Error al agendar cita.';
    }
});

loadPatientsOptions();