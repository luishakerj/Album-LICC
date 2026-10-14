// Servicio de almacenamiento en Cloud Storage para Firebase.
// Gestiona la subida de fotos binarias y devuelve su URL de descarga pública.
import {
    ref,
    uploadBytesResumable,
    getDownloadURL
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-storage.js";
import { storage } from "./firebase-config.js";

/**
 * Sube un archivo de imagen a Firebase Storage y retorna su URL HTTPS pública.
 * @param {File} file - Objeto File obtenido del input[type=file]
 * @param {(progress: number) => void} [onProgress] - Callback opcional con el porcentaje de 0 a 100
 * @returns {Promise<string>} URL de descarga https://
 */
export async function subirImagenStorage(file, onProgress) {
    if (!file) {
        throw new Error("No se ha seleccionado ningún archivo para subir.");
    }

    // Validar tipo MIME
    if (!file.type.startsWith("image/")) {
        throw new Error("El archivo seleccionado debe ser una imagen (PNG, JPG, WebP, etc.).");
    }

    // Nombre de archivo sanitizado y con timestamp único
    const timestamp = Date.now();
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const ruta = `recuerdos/${timestamp}_${safeName}`;
    const storageRef = ref(storage, ruta);

    const metadata = {
        contentType: file.type,
        customMetadata: {
            originalName: file.name,
            uploadedAt: new Date().toISOString()
        }
    };

    return new Promise((resolve, reject) => {
        const uploadTask = uploadBytesResumable(storageRef, file, metadata);

        uploadTask.on(
            "state_changed",
            (snapshot) => {
                if (snapshot.totalBytes > 0 && typeof onProgress === "function") {
                    const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
                    onProgress(progress);
                }
            },
            (error) => {
                console.error("Error durante la subida a Firebase Storage:", error);
                reject(error);
            },
            async () => {
                try {
                    const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
                    resolve(downloadUrl);
                } catch (urlError) {
                    reject(urlError);
                }
            }
        );
    });
}
