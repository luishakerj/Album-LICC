// Estado global de la aplicación
import { suscribirRecuerdos, crearRecuerdo, actualizarRecuerdo, eliminarRecuerdo } from './firestore-data.js';
import { comprimirImagen } from './image-utils.js';

let currentFilter = 'all';
let photos = [];
let tempSelectedFileUrl = null;
let selectedFileObj = null;
let editingPhotoId = null;
let deletingPhotoId = null;
let detailsPhotoId = null;

// Exponer las funciones usadas en atributos onclick del HTML
window.handleLogin = handleLogin;
window.togglePassword = togglePassword;
window.openUploadModal = openUploadModal;
window.closeUploadModal = closeUploadModal;
window.handleFileSelected = handleFileSelected;
window.confirmUpload = confirmUpload;
window.filterPhotos = filterPhotos;
window.setFilter = setFilter;
window.toggleFavorite = toggleFavorite;
window.openEditModal = openEditModal;
window.closeEditModal = closeEditModal;
window.saveEdit = saveEdit;
window.openDetailsModal = openDetailsModal;
window.closeDetailsModal = closeDetailsModal;
window.openDeleteModal = openDeleteModal;
window.closeDeleteModal = closeDeleteModal;
window.confirmDelete = confirmDelete;

// Utilidades de formato
const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

function formatDateLong(value) {
    if (!value) return 'Sin fecha';
    // Acepta 'YYYY-MM-DD' (input date) o Date/Timestamp
    const parts = String(value).split('-');
    const d = parts.length === 3
        ? new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]))
        : aFecha(value);
    if (!d || isNaN(d)) return 'Sin fecha';
    return `${d.getDate()} de ${MESES[d.getMonth()]} de ${d.getFullYear()}`;
}

function formatDateTime(value) {
    const d = aFecha(value);
    if (!d || isNaN(d)) return '—';
    const hora = d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    return `${formatDateLong(d)} · ${hora}`;
}

function toInputDate(value) {
    const d = aFecha(value);
    if (!d || isNaN(d)) return '';
    const mes = String(d.getMonth() + 1).padStart(2, '0');
    const dia = String(d.getDate()).padStart(2, '0');
    return `${d.getFullYear()}-${mes}-${dia}`;
}

// Las fechas de Firestore (Timestamp) llegan como objetos con toDate()
function aFecha(value) {
    if (!value) return null;
    if (typeof value.toDate === 'function') return value.toDate();
    return new Date(value);
}

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
    cargarRecuerdos();
}

// Funciones del Modal de Subida de Fotos
function openUploadModal() {
    document.getElementById('upload-modal').style.display = 'flex';
}

function closeUploadModal() {
    document.getElementById('upload-modal').style.display = 'none';
    document.getElementById('photo-title').value = '';
    document.getElementById('photo-location').value = '';
    document.getElementById('photo-date').value = '';
    document.getElementById('photo-description').value = '';

    const fileInput = document.getElementById('file-input');
    if (fileInput) fileInput.value = '';

    const defaultDropzone = document.getElementById('dropzone-default');
    const previewDropzone = document.getElementById('dropzone-preview');
    if (defaultDropzone) defaultDropzone.style.display = 'block';
    if (previewDropzone) previewDropzone.style.display = 'none';

    const confirmBtn = document.querySelector('#upload-modal .btn-confirm');
    if (confirmBtn) {
        confirmBtn.disabled = false;
        confirmBtn.innerHTML = 'Guardar en Álbum';
    }

    if (tempSelectedFileUrl) {
        URL.revokeObjectURL(tempSelectedFileUrl);
        tempSelectedFileUrl = null;
    }
    selectedFileObj = null;
}

// Manejar la selección local de archivos para previsualización
function handleFileSelected(event) {
    const file = event.target.files[0];
    if (file) {
        selectedFileObj = file;
        if (tempSelectedFileUrl) URL.revokeObjectURL(tempSelectedFileUrl);
        tempSelectedFileUrl = URL.createObjectURL(file);

        // Mostrar vista previa en la dropzone
        const defaultDropzone = document.getElementById('dropzone-default');
        const previewDropzone = document.getElementById('dropzone-preview');
        const previewImg = document.getElementById('upload-preview-img');
        const previewFilename = document.getElementById('upload-preview-filename');

        if (defaultDropzone) defaultDropzone.style.display = 'none';
        if (previewDropzone) previewDropzone.style.display = 'flex';
        if (previewImg) previewImg.src = tempSelectedFileUrl;
        if (previewFilename) {
            const sizeMb = (file.size / (1024 * 1024)).toFixed(2);
            previewFilename.textContent = `${file.name} (${sizeMb} MB)`;
        }

        if (!document.getElementById('photo-title').value) {
            document.getElementById('photo-title').value = file.name.substring(0, file.name.lastIndexOf('.')) || 'Nuevo recuerdo';
        }
    }
}

// Confirmar subida: procesa y comprime la imagen localmente y guarda el recuerdo en Firestore
async function confirmUpload() {
    const titleInput = document.getElementById('photo-title').value || 'Recuerdo LICC sin título';
    const locationInput = document.getElementById('photo-location').value.trim();
    const dateInput = document.getElementById('photo-date').value;
    const descriptionInput = document.getElementById('photo-description').value.trim();
    const confirmBtn = document.querySelector('#upload-modal .btn-confirm');

    // Estado visual de carga
    if (confirmBtn) {
        confirmBtn.disabled = true;
        confirmBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Procesando...';
    }

    try {
        let imageUrl = 'https://images.unsplash.com/photo-1507668077129-56e32842fceb?auto=format&fit=crop&w=600&q=80';

        // Si se seleccionó un archivo físico, comprimirlo a Base64 optimizado
        if (selectedFileObj) {
            if (confirmBtn) {
                confirmBtn.innerHTML = '<i class="fa-solid fa-wand-magic-sparkles fa-bounce"></i> Optimizando foto...';
            }
            imageUrl = await comprimirImagen(selectedFileObj, {
                maxWidth: 1000,
                maxHeight: 1000,
                quality: 0.75
            });
        }

        const datos = {
            title: titleInput,
            url: imageUrl,
            takenAt: dateInput || toInputDate(new Date()),
            location: locationInput || 'Sin ubicación',
            description: descriptionInput || 'Sin descripción.'
        };

        if (confirmBtn) {
            confirmBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Guardando en Firestore...';
        }

        // Firestore notifica el alta a través de la suscripción en tiempo real
        await crearRecuerdo(datos);

        closeUploadModal();
    } catch (error) {
        console.error('Error al guardar el recuerdo:', error);
        if (confirmBtn) {
            confirmBtn.disabled = false;
            confirmBtn.innerHTML = 'Guardar en Álbum';
        }

        const errMsg = error?.message || 'Error desconocido';
        alert('No se pudo guardar el recuerdo en la base de datos: ' + errMsg);
    }
}

// Alternar estado de favorito en una tarjeta
async function toggleFavorite(id) {
    const photo = photos.find(p => p.id === id);
    if (!photo) return;
    try {
        await actualizarRecuerdo(id, { favorite: !photo.favorite });
    } catch (error) {
        console.error('Error al actualizar el favorito:', error);
    }
}

// ================= EDITAR (UPDATE) =================
function openEditModal(id) {
    const photo = photos.find(p => p.id === id);
    if (!photo) return;

    editingPhotoId = id;
    document.getElementById('edit-photo-title').value = photo.title;
    document.getElementById('edit-photo-location').value = photo.location === 'Sin ubicación' ? '' : (photo.location || '');
    document.getElementById('edit-photo-date').value = photo.takenAt || '';
    document.getElementById('edit-photo-description').value = photo.description === 'Sin descripción.' ? '' : (photo.description || '');
    document.getElementById('edit-preview-img').src = photo.url;
    document.getElementById('edit-modal').style.display = 'flex';
    document.getElementById('edit-photo-title').focus();
}

function closeEditModal() {
    document.getElementById('edit-modal').style.display = 'none';
    document.getElementById('edit-photo-title').value = '';
    document.getElementById('edit-photo-location').value = '';
    document.getElementById('edit-photo-date').value = '';
    document.getElementById('edit-photo-description').value = '';
    document.getElementById('edit-preview-img').src = '';
    editingPhotoId = null;
}

async function saveEdit() {
    const photo = photos.find(p => p.id === editingPhotoId);
    if (!photo) return;

    const newTitle = document.getElementById('edit-photo-title').value.trim();
    if (!newTitle) {
        alert('El título no puede estar vacío.');
        return;
    }

    const cambios = {
        title: newTitle,
        location: document.getElementById('edit-photo-location').value.trim() || 'Sin ubicación',
        takenAt: document.getElementById('edit-photo-date').value || photo.takenAt,
        description: document.getElementById('edit-photo-description').value.trim() || 'Sin descripción.',
        editedAt: new Date()
    };

    const id = editingPhotoId;
    closeEditModal();
    try {
        await actualizarRecuerdo(id, cambios);
    } catch (error) {
        console.error('Error al guardar los cambios:', error);
        alert('No se pudieron guardar los cambios en la base de datos.');
    }
}

// ================= VER DETALLES (READ) =================
function openDetailsModal(id) {
    const photo = photos.find(p => p.id === id);
    if (!photo) return;

    detailsPhotoId = id;
    document.getElementById('details-img').src = photo.url;
    document.getElementById('details-title').textContent = photo.title;
    document.getElementById('details-description').textContent = photo.description || 'Sin descripción.';
    document.getElementById('details-location').textContent = photo.location || 'Sin ubicación';
    document.getElementById('details-date').textContent = formatDateLong(photo.takenAt);
    document.getElementById('details-created').textContent = formatDateTime(photo.createdAt);
    document.getElementById('details-edited').textContent = photo.editedAt ? formatDateTime(photo.editedAt) : 'Nunca editado';
    document.getElementById('details-status').textContent = photo.favorite ? 'Marcado como favorito' : 'En el álbum';
    document.getElementById('details-id').textContent = photo.id;

    const statusRow = document.getElementById('details-status');
    statusRow.classList.toggle('is-favorite', !!photo.favorite);

    // El botón Editar del modal abre el editor de este mismo recuerdo
    document.getElementById('details-edit-btn').onclick = () => {
        closeDetailsModal();
        openEditModal(id);
    };

    document.getElementById('details-modal').style.display = 'flex';
}

function closeDetailsModal() {
    document.getElementById('details-modal').style.display = 'none';
    document.getElementById('details-img').src = '';
    detailsPhotoId = null;
}

// ================= ELIMINAR (DELETE) =================
function openDeleteModal(id) {
    const photo = photos.find(p => p.id === id);
    if (!photo) return;

    deletingPhotoId = id;
    document.getElementById('delete-photo-name').textContent = `"${photo.title}"`;
    document.getElementById('delete-modal').style.display = 'flex';
}

function closeDeleteModal() {
    document.getElementById('delete-modal').style.display = 'none';
    document.getElementById('delete-photo-name').textContent = '';
    deletingPhotoId = null;
}

async function confirmDelete() {
    if (deletingPhotoId === null) return;
    const id = deletingPhotoId;
    closeDeleteModal();
    try {
        await eliminarRecuerdo(id);
    } catch (error) {
        console.error('Error al eliminar el recuerdo:', error);
        alert('No se pudo eliminar el recuerdo de la base de datos.');
    }
}

// ================= CARGA DESDE FIRESTORE =================
let suscripcionActiva = false;

function cargarRecuerdos() {
    if (suscripcionActiva) return;
    suscripcionActiva = true;
    suscribirRecuerdos(
        (recuerdos) => {
            photos = recuerdos;
            renderGallery();
        },
        (error) => {
            console.error('Error al leer de Firestore:', error);
            mostrarAvisoConexion(error);
        }
    );
}

// Aviso visible si la base de datos no responde o las reglas la bloquean
function mostrarAvisoConexion(error) {
    const contenedor = document.getElementById('gallery-container');
    if (!contenedor || document.getElementById('db-warning')) return;
    const aviso = document.createElement('div');
    aviso.id = 'db-warning';
    aviso.className = 'db-warning';
    aviso.innerHTML = `<i class="fa-solid fa-database"></i>
        <div><strong>No se pudo conectar con Firestore.</strong>
        <span>Revisa que la base de datos esté creada y que las reglas permitan leer la colección "recuerdos".</span></div>`;
    contenedor.prepend(aviso);
    console.error('Detalle:', error && error.message);
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
        const matchesQuery = (p.title || '').toLowerCase().includes(query);
        if (currentFilter === 'favorites') return matchesQuery && p.favorite;
        if (currentFilter === 'recent') {
            const creado = aFecha(p.createdAt);
            const isRecent = creado && (new Date() - creado) < (24 * 60 * 60 * 1000); // últimas 24 hrs
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
                <div class="photo-card-media">
                    <img src="${p.url}" alt="${p.title}" onclick="openDetailsModal('${p.id}')">
                    <div class="photo-card-actions">
                        <button class="photo-action-btn view-btn" title="Ver detalles" onclick="openDetailsModal('${p.id}')">
                            <i class="fa-solid fa-expand"></i>
                        </button>
                        <button class="photo-action-btn edit-btn" title="Editar" onclick="openEditModal('${p.id}')">
                            <i class="fa-solid fa-pen"></i>
                        </button>
                        <button class="photo-action-btn delete-btn" title="Eliminar" onclick="openDeleteModal('${p.id}')">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </div>
                    ${p.favorite ? '<span class="photo-card-fav-badge"><i class="fa-solid fa-heart"></i></span>' : ''}
                </div>
                <div class="photo-card-body">
                    <div class="photo-card-texts">
                        <span class="photo-card-title">${p.title}</span>
                        <span class="photo-card-meta">
                            <i class="fa-solid fa-location-dot"></i> ${p.location || 'Sin ubicación'}
                        </span>
                    </div>
                    <button class="photo-fav-btn ${p.favorite ? 'favorited' : ''}" title="Favorito" onclick="toggleFavorite('${p.id}')">
                        <i class="fa-${p.favorite ? 'solid' : 'regular'} fa-heart"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }
}