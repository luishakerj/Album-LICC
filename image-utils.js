// Utilidades para procesamiento, compresión y conversión de imágenes en el cliente.
// Permite guardar imágenes en Cloud Firestore de forma 100% gratuita sin requerir Storage ni Blaze.

/**
 * Comprime y redimensiona una imagen File a una cadena Data URL (Base64) optimizada.
 * @param {File} file - Archivo de imagen seleccionado
 * @param {Object} [options]
 * @param {number} [options.maxWidth=1000] - Ancho máximo en píxeles
 * @param {number} [options.maxHeight=1000] - Alto máximo en píxeles
 * @param {number} [options.quality=0.75] - Calidad JPEG (0.1 a 1.0)
 * @returns {Promise<string>} Cadena Data URL base64 ('data:image/jpeg;base64,...')
 */
export function comprimirImagen(file, options = {}) {
    const {
        maxWidth = 1000,
        maxHeight = 1000,
        quality = 0.75
    } = options;

    return new Promise((resolve, reject) => {
        if (!file) {
            return reject(new Error("No se ha seleccionado ningún archivo."));
        }

        if (!file.type.startsWith("image/")) {
            return reject(new Error("El archivo seleccionado debe ser una imagen válida."));
        }

        const reader = new FileReader();
        reader.onerror = () => reject(new Error("Error al leer el archivo de imagen."));
        reader.onload = (e) => {
            const img = new Image();
            img.onerror = () => reject(new Error("No se pudo procesar el formato de la imagen."));
            img.onload = () => {
                let width = img.width;
                let height = img.height;

                // Redimensionar manteniendo proporciones
                if (width > height) {
                    if (width > maxWidth) {
                        height = Math.round((height * maxWidth) / width);
                        width = maxWidth;
                    }
                } else {
                    if (height > maxHeight) {
                        width = Math.round((width * maxHeight) / height);
                        height = maxHeight;
                    }
                }

                const canvas = document.createElement("canvas");
                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext("2d");
                // Fondo blanco para imágenes transparentes que se conviertan a JPEG
                ctx.fillStyle = "#FFFFFF";
                ctx.fillRect(0, 0, width, height);
                ctx.drawImage(img, 0, 0, width, height);

                // Convertir a JPEG optimizado
                const dataUrl = canvas.toDataURL("image/jpeg", quality);
                resolve(dataUrl);
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    });
}
