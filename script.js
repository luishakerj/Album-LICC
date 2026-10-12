// Estado global de la aplicación
let currentFilter = 'all';
let photos = [];
let tempSelectedFileUrl = null;

// Alternar visibilidad de contraseña en el Login
function togglePassword() {
    const passwordInput = document.getElementById('password');
    const eyeIcon = document.querySelector('.toggle-password');
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        eyeIcon.classList.replace('fa-eye', 'fa-eye-slash');
    } else {
        passwordInput.type = 'password';
        eyeIcon.classList.replace('fa-eye-slash', 'fa-eye');
    }
}

// Simular el inicio de sesión y transición al panel de álbum
function handleLogin(event) {
    event.preventDefault();
    document.getElementById('login-view').classList.remove('active');
    document.getElementById('album-view').classList.add('active');
    renderGallery();
}

// Funciones del Modal de Subida de Fotos
function openUploadModal() {
    document.getElementById('upload-modal').style.display = 'flex';
}

function closeUploadModal() {
    document.getElementById('upload-modal').style.display = 'none';
    document.getElementById('photo-title').value = '';
    tempSelectedFileUrl = null;
}

// Manejar la selección local de archivos para simulación visual
function handleFileSelected(event) {
    const file = event.target.files[0];
    if (file) {
        tempSelectedFileUrl = URL.createObjectURL(file);
        if (!document.getElementById('photo-title').value) {
            document.getElementById('photo-title').value = file.name.substring(0, file.name.lastIndexOf('.')) || 'Nuevo recuerdo';
        }
    }
}

// Confirmar subida y añadir elemento al listado
function confirmUpload() {
    const titleInput = document.getElementById('photo-title').value || 'Recuerdo LICC sin título';
    // Si no seleccionó archivo, asignamos una imagen predeterminada de muestra de investigación/laboratorio
    const imageUrl = tempSelectedFileUrl || 'https://images.unsplash.com/photo-1507668077129-56e32842fceb?auto=format&fit=crop&w=600&q=80';

    const newPhoto = {
        id: Date.now(),
        title: titleInput,
        url: imageUrl,
        date: new Date(),
        favorite: false
    };

    photos.unshift(newPhoto);
    closeUploadModal();
    renderGallery();
}

// Alternar estado de favorito en una tarjeta
function toggleFavorite(id) {
    const photo = photos.find(p => p.id === id);
    if (photo) {
        photo.favorite = !photo.favorite;
        renderGallery();
    }
}

// Gestionar filtros activos
function setFilter(filterType, btnElement) {
    currentFilter = filterType;
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btnElement.classList.add('active');
    renderGallery();
}

// Filtrar en tiempo real desde la barra de búsqueda
function filterPhotos() {
    renderGallery();
}

// Renderizado dinámico de la galería y estados vacíos
function renderGallery() {
    const query = document.getElementById('search-input') ? document.getElementById('search-input').value.toLowerCase() : '';

    // Aplicar filtros de categoría y búsqueda
    let filtered = photos.filter(p => {
        const matchesQuery = p.title.toLowerCase().includes(query);
        if (currentFilter === 'favorites') return matchesQuery && p.favorite;
        if (currentFilter === 'recent') {
            const isRecent = (new Date() - new Date(p.date)) < (24 * 60 * 60 * 1000); // últimas 24 hrs
            return matchesQuery && isRecent;
        }
        return matchesQuery;
    });

    // Actualizar contadores visuales
    document.getElementById('photo-counter').innerText = `${photos.length} recuerdos guardados`;
    document.getElementById('count-all').innerText = photos.length;

    const emptyState = document.getElementById('empty-state');
    const photosGrid = document.getElementById('photos-grid');

    if (photos.length === 0) {
        emptyState.style.display = 'flex';
        photosGrid.style.display = 'none';
    } else {
        emptyState.style.display = 'none';
        photosGrid.style.display = 'grid';

        if (filtered.length === 0) {
            photosGrid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #64748b;">No se encontraron recuerdos con esa búsqueda o filtro.</div>`;
            return;
        }

        photosGrid.innerHTML = filtered.map(p => `
            <div class="photo-card">
                <img src="${p.url}" alt="${p.title}">
                <div class="photo-card-body">
                    <span class="photo-card-title">${p.title}</span>
                    <button class="photo-fav-btn ${p.favorite ? 'favorited' : ''}" onclick="toggleFavorite(${p.id})">
                        <i class="fa-${p.favorite ? 'solid' : 'regular'} fa-heart"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }
}