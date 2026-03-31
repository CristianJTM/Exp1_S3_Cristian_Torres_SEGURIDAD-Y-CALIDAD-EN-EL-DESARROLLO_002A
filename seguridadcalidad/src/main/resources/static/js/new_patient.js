
document.getElementById('patientForm').addEventListener('submit', async function(event) {
    event.preventDefault();
    const token = localStorage.getItem('jwtToken');
    if (!token) { window.location.href = '/login'; return; }

    const body = {
        name: document.getElementById('name').value,
        species: document.getElementById('species').value,
        breed: document.getElementById('breed').value,
        age: parseInt(document.getElementById('age').value, 10),
        owner: document.getElementById('owner').value
    };

    try {
        const response = await fetch('/api/patients', {
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
            console.error('Frontend: POST /api/patients error response=', err);
            document.getElementById('errorPatient').textContent = 'Error: ' + err;
            return;
        }

        window.location.href = '/patients';
    } catch (err) {
        console.error('Frontend: POST /api/patients error=', err);
        document.getElementById('errorPatient').textContent = 'Error al guardar paciente.';
    }
});