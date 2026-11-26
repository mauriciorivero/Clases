// Punto de entrada del frontend: configura la navegacion por pestañas
// e inicializa cada modulo (organism) en el orden correcto de dependencias.

// Activa la pestaña seleccionada: resalta el boton y muestra solo su panel
function configurarNavegacionTabs() {
  const botones = $$('.tab-nav__item');

  botones.forEach(boton => {
    boton.addEventListener('click', () => {
      const idTab = boton.dataset.tab;

      botones.forEach(b => b.classList.remove('is-active'));
      boton.classList.add('is-active');

      $$('.tab-panel').forEach(panel => panel.classList.remove('is-active'));
      $(`#tab-${idTab}`).classList.add('is-active');
    });
  });
}

// Inicializa todos los modulos de la aplicacion respetando sus dependencias:
// Telefonos y Perfiles Sociales necesitan las listas de Usuarios y Redes Sociales
// para poder llenar sus <select>, por eso se espera (await) a que esas terminen primero.
async function iniciarAplicacion() {
  configurarNavegacionTabs();

  // Convierte los selects de usuario/red social en combobox buscables
  // (escribir para filtrar, flechas o scroll para recorrer las opciones)
  mejorarSelectBuscable('telefono-usuario');
  mejorarSelectBuscable('perfil-usuario');
  mejorarSelectBuscable('perfil-red-social');

  await Promise.all([UsuariosOrganism.init(), RedesSocialesOrganism.init()]);

  await Promise.all([TelefonosOrganism.init(), PerfilesSocialesOrganism.init()]);
}

document.addEventListener('DOMContentLoaded', iniciarAplicacion);
