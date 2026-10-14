import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore";

const firebaseConfig = {
  projectId: "album-134c6",
  appId: "1:954529318676:web:e14662553a3d28523aa401",
  storageBucket: "album-134c6.firebasestorage.app",
  apiKey: "AIzaSyBY4rQDIhLWi12Hm2v0KFVSIrdPe-TVC8U",
  authDomain: "album-134c6.firebaseapp.com",
  messagingSenderId: "954529318676",
  projectNumber: "954529318676"
};

const db = getFirestore(initializeApp(firebaseConfig));

// Insertamos un recuerdo de prueba válido (misma forma que usa la app)
const ref = await addDoc(collection(db, "recuerdos"), {
  title: "Recuerdo de prueba (conexión Firebase)",
  url: "https://images.unsplash.com/photo-1507668077129-56e32842fceb?auto=format&fit=crop&w=600&q=80",
  takenAt: "2026-10-13",
  location: "Laboratorio LICC",
  description: "Documento insertado automáticamente para verificar la conexión con Firestore.",
  favorite: false,
  editedAt: null,
  createdAt: serverTimestamp()
});
console.log("SEED_OK", ref.id);
process.exit(0);
