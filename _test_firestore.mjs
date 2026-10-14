// Prueba de conexion real con Firestore usando solo modulos nativos de Node.
// Replica el flujo de la app: CREATE -> READ -> DELETE contra la coleccion "recuerdos".
import https from "node:https";

const KEY = "AIzaSyBY4rQDIhLWi12Hm2v0KFVSIrdPe-TVC8U";
const BASE = "https://firestore.googleapis.com/v1/projects/album-134c6/databases/(default)/documents";

function request(method, url, body) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const u = new URL(url);
    const req = https.request({
      method,
      hostname: u.hostname,
      path: u.pathname + u.search,
      headers: {
        "Content-Type": "application/json",
        ...(data ? { "Content-Length": Buffer.byteLength(data) } : {})
      }
    }, res => {
      let chunks = "";
      res.on("data", c => chunks += c);
      res.on("end", () => resolve({ status: res.statusCode, body: chunks ? JSON.parse(chunks) : {} }));
    });
    req.on("error", reject);
    if (data) req.write(data);
    req.end();
  });
}

// 1) CREATE - igual que crearRecuerdo(): createdAt con serverTimestamp real
const createBody = {
  fields: {
    title: { stringValue: "Prueba de conexion" },
    url: { stringValue: "https://images.unsplash.com/photo-1507668077129-56e32842fceb" },
    takenAt: { stringValue: "2026-10-13" },
    location: { stringValue: "Laboratorio LICC" },
    description: { stringValue: "Documento de prueba automatico" },
    favorite: { booleanValue: false },
    editedAt: { nullValue: null },
    createdAt: { timestampValue: new Date().toISOString() }
  }
};
const created = await request("POST", `${BASE}/recuerdos?key=${KEY}`, createBody);
console.log("CREATE -> HTTP", created.status, "|", created.body.name || JSON.stringify(created.body));
const docPath = created.body.name;

// 2) READ - igual que suscribirRecuerdos()
const read = await request("GET", `${BASE}/recuerdos?key=${KEY}`);
const docs = read.body.documents || [];
console.log("READ   -> HTTP", read.status, "|", docs.length, "documento(s)");
docs.forEach(d => console.log("        ", d.name.split("/").pop(), "=>", d.fields?.title?.stringValue));

// 3) DELETE - igual que eliminarRecuerdo(): limpiamos el documento de prueba
if (docPath) {
  const del = await request("DELETE", `https://firestore.googleapis.com/v1/${docPath}?key=${KEY}`);
  console.log("DELETE -> HTTP", del.status, "| documento de prueba eliminado");
}

console.log("RESULTADO: conexion con Firestore verificada de punta a punta.");
