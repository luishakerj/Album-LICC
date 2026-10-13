// Capa de acceso a datos: todas las operaciones del CRUD contra Cloud Firestore.
// Colección: "recuerdos" (una foto por documento).
import {
    collection, doc, addDoc, updateDoc, deleteDoc,
    onSnapshot, query, orderBy, serverTimestamp
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";
import { db } from "./firebase-config.js";

const COLECCION = "recuerdos";
export const recuerdosRef = collection(db, COLECCION);

/**
 * Escucha la colección en tiempo real.
 * @param {(recuerdos: Array) => void} onData
 * @param {(error: Error) => void} onError
 * @returns {() => void} función para cancelar la suscripción
 */
export function suscribirRecuerdos(onData, onError) {
    const q = query(recuerdosRef, orderBy("createdAt", "desc"));
    return onSnapshot(q, (snapshot) => {
        const recuerdos = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        onData(recuerdos);
    }, onError);
}

/** Crea un recuerdo. Devuelve el id del documento nuevo. */
export async function crearRecuerdo(datos) {
    const ref = await addDoc(recuerdosRef, {
        ...datos,
        favorite: false,
        editedAt: null,
        createdAt: serverTimestamp()
    });
    return ref.id;
}

/** Actualiza campos de un recuerdo existente. */
export async function actualizarRecuerdo(id, cambios) {
    await updateDoc(doc(db, COLECCION, id), cambios);
}

/** Elimina un recuerdo por su id. */
export async function eliminarRecuerdo(id) {
    await deleteDoc(doc(db, COLECCION, id));
}
