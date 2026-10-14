// QA de la conexion Firebase desde la app real.
export default async function run(page, ui) {
  // Espera a que cargue el login
  await page.waitForSelector("#login-view", { timeout: 15000 });

  const snap = await ui.snapshot();

  // Hace login (form simulado) y entra al album -> dispara cargarRecuerdos() -> Firestore
  await page.evaluate(() => {
    const form = document.querySelector("#login-view form") || document.querySelector("form");
    if (form) form.requestSubmit ? form.requestSubmit() : form.submit();
  });

  // Espera a que se active la vista del album
  await page.waitForSelector("#album-view.active", { timeout: 15000 });
  await page.waitForTimeout(4000); // deja tiempo a que responda Firestore

  const result = await page.evaluate(() => {
    const warning = document.getElementById("db-warning");
    const grid = document.getElementById("photos-grid");
    return {
      albumActive: document.getElementById("album-view").classList.contains("active"),
      dbWarningShown: !!warning,
      dbWarningText: warning ? warning.innerText : null,
      photosGridHtmlLen: grid ? grid.innerHTML.length : null,
      counter: document.getElementById("photo-counter") ? document.getElementById("photo-counter").innerText : null,
    };
  });

  return { snap, ...result };
}
