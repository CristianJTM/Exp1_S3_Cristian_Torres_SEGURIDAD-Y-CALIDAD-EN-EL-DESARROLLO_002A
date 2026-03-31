
document.addEventListener('DOMContentLoaded', function() {
const token = localStorage.getItem('jwtToken');

if (token) {
    document.getElementById('btnRegistrarMascotas').style.display = 'inline-block';
    document.getElementById('columnAcciones').style.display = 'table-cell';
}});

let currentPets = [];

function getToken() {
    return localStorage.getItem('jwtToken');
}

function escapeHtml(value) {
    return String(value ?? '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;');
}

function showMessage(text, isError) {
    const message = document.getElementById('petsMessage');
    message.textContent = text;
    message.style.color = isError ? 'red' : '#333';
}

function getPetById(id) {
    return currentPets.find(p => Number(p.id) === Number(id));
}

function getPrimaryPhoto(pet) {
    if (!pet || !pet.photos) {
        return '';
    }

    if (Array.isArray(pet.photos) && pet.photos.length > 0) {
        return String(pet.photos[0] || '').trim();
    }

    if (typeof pet.photos === 'string') {
        return pet.photos.trim();
    }

    return '';
}

function isLogged() {
    return !!localStorage.getItem('jwtToken');
}


function renderPets(pets) {
    const tbody = document.getElementById('petsTableBody');
    tbody.innerHTML = '';

    if (!pets.length) {
        tbody.innerHTML = '<tr><td colspan="10">No hay mascotas para mostrar.</td></tr>';
        return;
    }

    pets.forEach(pet => {
        const photo = getPrimaryPhoto(pet);
        const isUnavailable = pet.status === 'unavailable';
        const isAdopted = pet.status === 'adopted';
        const cannotAdopt = isAdopted || isUnavailable;
        const cannotSetUnavailable = isUnavailable || isAdopted;
        let accionesColumn = '';

        if (isLogged()) {
            accionesColumn =
                '<td>' +
                    '<button class="btn btn-primary" type="button" ' +
                        'onclick="markAsAdopted(' + pet.id + ')" ' +
                        (cannotAdopt ? 'disabled' : '') +
                    '>Adoptar</button> ' +
                    '<button class="btn btn-secondary" type="button" ' +
                        'onclick="markAsUnavailable(' + pet.id + ')" ' +
                        (cannotSetUnavailable ? 'disabled' : '') +
                    '>No disponible</button> ' +
                    '<button class="btn btn-secondary" type="button" onclick="deletePet(' + pet.id + ')">Eliminar</button>' +
                '</td>';
        }

        const row = document.createElement('tr');
        row.innerHTML =
            '<td>' + escapeHtml(pet.id) + '</td>' +
            '<td>' +
                (photo
                    ? '<img class="pet-photo" src="' + escapeHtml(photo) + '" alt="Foto de ' + escapeHtml(pet.name || 'mascota') + '" loading="lazy" />'
                    : '<span class="pet-photo-empty">Sin foto</span>') +
            '</td>' +
            '<td>' + escapeHtml(pet.name) + '</td>' +
            '<td>' + escapeHtml(pet.species) + '</td>' +
            '<td>' + escapeHtml(pet.breed) + '</td>' +
            '<td>' + escapeHtml(pet.age) + '</td>' +
            '<td>' + escapeHtml(pet.gender) + '</td>' +
            '<td>' + escapeHtml(pet.location || '-') + '</td>' +
            '<td>' + escapeHtml(pet.status || 'available') + '</td>' +
accionesColumn;

        tbody.appendChild(row);
    });
}

async function fetchPets(endpoint) {
    showMessage('Cargando mascotas...', false);
    const response = await fetch(endpoint);
    if (!response.ok) {
        throw new Error('No se pudieron obtener mascotas (' + response.status + ')');
    }

    const pets = await response.json();
    currentPets = Array.isArray(pets) ? pets : [];
    renderPets(currentPets);
    showMessage('Se encontraron ' + currentPets.length + ' mascotas.', false);
}

async function loadAvailablePets() {
    try {
        await fetchPets('/api/pets/available');
    } catch (error) {
        showMessage(error.message, true);
        document.getElementById('petsTableBody').innerHTML = '<tr><td colspan="10">Error cargando mascotas.</td></tr>';
    }
}

async function searchPets(event) {
    event.preventDefault();
    const params = new URLSearchParams();
    const species = document.getElementById('species').value.trim();
    const gender = document.getElementById('gender').value;
    const location = document.getElementById('location').value.trim();
    const age = document.getElementById('age').value;
    const status = document.getElementById('status').value;

    if (species) params.append('species', species);
    if (gender) params.append('gender', gender);
    if (location) params.append('location', location);
    if (age) params.append('age', age);
    if (status) params.append('status', status);

    const endpoint = '/api/pets/search' + (params.toString() ? ('?' + params.toString()) : '');
    try {
        await fetchPets(endpoint);
    } catch (error) {
        showMessage(error.message, true);
        document.getElementById('petsTableBody').innerHTML = '<tr><td colspan="10">Error en busqueda de mascotas.</td></tr>';
    }
}

async function markAsAdopted(id) {
    const token = getToken();
    if (!token) {
        window.location.href = '/login';
        return;
    }

    const selectedPet = getPetById(id);
    if (!selectedPet) {
        showMessage('No se encontro la mascota seleccionada.', true);
        return;
    }

    const payload = { ...selectedPet, status: 'adopted' };

    try {
        const response = await fetch('/api/pets/' + id, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            },
            body: JSON.stringify(payload)
        });

        if (response.status === 401 || response.status === 403) {
            localStorage.removeItem('jwtToken');
            window.location.href = '/login';
            return;
        }

        if (!response.ok) {
            const errText = await response.text();
            throw new Error('No se pudo actualizar mascota: ' + errText);
        }

        await loadAvailablePets();
        showMessage('Mascota marcada como adoptada.', false);
    } catch (error) {
        showMessage(error.message, true);
    }
}

async function markAsUnavailable(id) {
    const token = getToken();
    if (!token) {
        window.location.href = '/login';
        return;
    }

    const selectedPet = getPetById(id);
    if (!selectedPet) {
        showMessage('No se encontro la mascota seleccionada.', true);
        return;
    }

    const payload = { ...selectedPet, status: 'unavailable' };

    try {
        const response = await fetch('/api/pets/' + id, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            },
            body: JSON.stringify(payload)
        });

        if (response.status === 401 || response.status === 403) {
            localStorage.removeItem('jwtToken');
            window.location.href = '/login';
            return;
        }

        if (!response.ok) {
            const errText = await response.text();
            throw new Error('No se pudo actualizar mascota: ' + errText);
        }

        await loadAvailablePets();
        showMessage('Mascota marcada como no disponible.', false);
    } catch (error) {
        showMessage(error.message, true);
    }
}

async function deletePet(id) {
    const token = getToken();
    if (!token) {
        window.location.href = '/login';
        return;
    }

    if (!window.confirm('Deseas eliminar esta mascota?')) {
        return;
    }

    try {
        const response = await fetch('/api/pets/' + id, {
            method: 'DELETE',
            headers: {
                'Authorization': 'Bearer ' + token
            }
        });

        if (response.status === 401 || response.status === 403) {
            localStorage.removeItem('jwtToken');
            window.location.href = '/login';
            return;
        }

        if (!response.ok) {
            const errText = await response.text();
            throw new Error('No se pudo eliminar mascota: ' + errText);
        }

        currentPets = currentPets.filter(pet => Number(pet.id) !== Number(id));
        renderPets(currentPets);
        showMessage('Mascota eliminada correctamente.', false);
    } catch (error) {
        showMessage(error.message, true);
    }
}

document.getElementById('searchForm').addEventListener('submit', searchPets);
document.getElementById('btnLoadAll').addEventListener('click', async () => {
    try {
        await fetchPets('/api/pets');
    } catch (error) {
        showMessage(error.message, true);
    }
});

document.getElementById('btnReset').addEventListener('click', async () => {
    document.getElementById('searchForm').reset();
    document.getElementById('status').value = 'available';
    await loadAvailablePets();
});

loadAvailablePets();
