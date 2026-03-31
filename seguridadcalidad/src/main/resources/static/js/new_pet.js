
document.addEventListener('DOMContentLoaded', function() {
const token = localStorage.getItem('jwtToken');

if (!token) {
    window.location.href = '/login';
}});

function updatePhotoPreview() {
    const photoUrl = document.getElementById('photoUrl').value.trim();
    const preview = document.getElementById('photoPreview');
    const empty = document.getElementById('photoPreviewEmpty');

    if (!photoUrl) {
        preview.style.display = 'none';
        preview.removeAttribute('src');
        empty.style.display = 'inline';
        return;
    }

    preview.src = photoUrl;
    preview.style.display = 'inline-block';
    empty.style.display = 'none';
}

document.getElementById('photoUrl').addEventListener('input', updatePhotoPreview);

document.getElementById('petForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    const token = localStorage.getItem('jwtToken');
    if (!token) {
        window.location.href = '/login';
        return;
    }

    const photoUrl = document.getElementById('photoUrl').value.trim();
    const body = {
        name: document.getElementById('name').value.trim(),
        species: document.getElementById('species').value.trim(),
        breed: document.getElementById('breed').value.trim(),
        age: parseInt(document.getElementById('age').value, 10),
        gender: document.getElementById('gender').value,
        location: document.getElementById('location').value.trim(),
        status: document.getElementById('status').value,
        photos: photoUrl ? [photoUrl] : []
    };

    try {
        const response = await fetch('/api/pets', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
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
            document.getElementById('errorPet').textContent = 'Error: ' + err;
            return;
        }

        window.location.href = '/pets';
    } catch (error) {
        document.getElementById('errorPet').textContent = 'Error al registrar mascota.';
    }
});