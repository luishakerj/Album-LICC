// Configuración de Firebase del proyecto "album-134c6".
// Estos valores son públicos por diseño (identifican el proyecto, no autorizan nada):
// la seguridad real la define firestore.rules.
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";

export const firebaseConfig = {
  projectId: "album-134c6",
  appId: "1:954529318676:web:e14662553a3d28523aa401",
  storageBucket: "album-134c6.firebasestorage.app",
  apiKey: "AIzaSyBY4rQDIhLWi12Hm2v0KFVSIrdPe-TVC8U",
  authDomain: "album-134c6.firebaseapp.com",
  messagingSenderId: "954529318676",
  measurementId: "G-SGNW0QX10Z",
  projectNumber: "954529318676"
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
