// MOLECULE: convierte un <select> nativo en un combobox buscable y navegable
// con teclado (escribir para filtrar, flechas + scroll para recorrer opciones).
//
// El <select> original se conserva oculto en el DOM y sigue siendo la unica
// fuente de verdad: el resto de la app (organisms) puede seguir leyendo y
// escribiendo `.value`, `.innerHTML` y `.disabled` sobre el exactamente igual
// que antes. Esta funcion solo agrega una capa visual encima que se mantiene
// sincronizada automaticamente.
function mejorarSelectBuscable(selectId) {
  const select = document.getElementById(selectId);
  if (!select || select.dataset.comboboxListo) return;
  select.dataset.comboboxListo = '1';

  const wrapper = document.createElement('div');
  wrapper.className = 'combobox';

  const input = document.createElement('input');
  input.type = 'text';
  input.className = 'input combobox__input';
  input.id = `${selectId}-buscador`;
  input.autocomplete = 'off';
  input.placeholder = 'Escriba para buscar...';
  input.setAttribute('role', 'combobox');
  input.setAttribute('aria-expanded', 'false');
  input.setAttribute('aria-autocomplete', 'list');
  input.setAttribute('aria-controls', `${selectId}-lista`);
  if (select.required) input.required = true;

  const lista = document.createElement('ul');
  lista.className = 'combobox__list';
  lista.id = `${selectId}-lista`;
  lista.setAttribute('role', 'listbox');
  lista.hidden = true;

  wrapper.appendChild(input);
  wrapper.appendChild(lista);

  select.hidden = true;
  select.setAttribute('aria-hidden', 'true');
  select.tabIndex = -1;
  select.parentNode.insertBefore(wrapper, select);

  // El <label for="..."> debe apuntar ahora al control visible (el input)
  const label = document.querySelector(`label[for="${selectId}"]`);
  if (label) label.setAttribute('for', input.id);

  let indiceActivo = -1;

  function etiquetaSeleccionActual() {
    const opcion = select.options[select.selectedIndex];
    return opcion ? opcion.textContent : '';
  }

  function sincronizarTexto() {
    input.value = etiquetaSeleccionActual();
  }

  function sincronizarDeshabilitado() {
    input.disabled = select.disabled;
    input.classList.toggle('is-disabled', select.disabled);
  }

  function cerrarLista() {
    lista.hidden = true;
    input.setAttribute('aria-expanded', 'false');
    indiceActivo = -1;
  }

  function renderizarLista(filtro) {
    const texto = filtro.trim().toLowerCase();
    const opciones = Array.from(select.options).filter(o => o.textContent.toLowerCase().includes(texto));

    lista.innerHTML = '';
    indiceActivo = -1;

    if (opciones.length === 0) {
      const vacio = document.createElement('li');
      vacio.className = 'combobox__vacio';
      vacio.textContent = 'Sin resultados';
      lista.appendChild(vacio);
    } else {
      opciones.forEach(opcion => {
        const item = document.createElement('li');
        item.className = 'combobox__option';
        item.setAttribute('role', 'option');
        item.dataset.value = opcion.value;
        item.textContent = opcion.textContent;
        if (opcion.value === select.value) item.classList.add('is-selected');

        // mousedown (no click) para que dispare antes del blur del input
        item.addEventListener('mousedown', evento => {
          evento.preventDefault();
          seleccionar(opcion.value);
        });

        lista.appendChild(item);
      });
    }

    lista.hidden = false;
    input.setAttribute('aria-expanded', 'true');
  }

  function seleccionar(valor) {
    select.value = valor;
    cerrarLista();
  }

  function moverActivo(delta) {
    const items = $$('.combobox__option', lista);
    if (items.length === 0) return;

    if (indiceActivo >= 0) items[indiceActivo].classList.remove('is-activo');
    indiceActivo = (indiceActivo + delta + items.length) % items.length;
    items[indiceActivo].classList.add('is-activo');
    items[indiceActivo].scrollIntoView({ block: 'nearest' });
  }

  input.addEventListener('focus', () => {
    if (select.disabled) return;
    input.select();
    renderizarLista('');
  });

  input.addEventListener('input', () => {
    if (select.disabled) return;
    renderizarLista(input.value);
  });

  input.addEventListener('keydown', evento => {
    if (select.disabled) return;

    if (evento.key === 'ArrowDown' || evento.key === 'ArrowUp') {
      evento.preventDefault();
      if (lista.hidden) renderizarLista(input.value === etiquetaSeleccionActual() ? '' : input.value);
      else moverActivo(evento.key === 'ArrowDown' ? 1 : -1);
    } else if (evento.key === 'Enter') {
      if (!lista.hidden) {
        evento.preventDefault();
        const items = $$('.combobox__option', lista);
        const activo = items[indiceActivo] || items[0];
        if (activo && activo.dataset.value !== undefined) seleccionar(activo.dataset.value);
      }
    } else if (evento.key === 'Escape') {
      cerrarLista();
      sincronizarTexto();
    }
  });

  input.addEventListener('blur', () => {
    // Pequeno retraso para permitir que el mousedown sobre una opcion se procese primero
    setTimeout(() => {
      cerrarLista();
      sincronizarTexto();
    }, 150);
  });

  // El resto de la app sigue usando select.value / select.disabled tal cual;
  // se sobrescriben esas propiedades en la instancia para reflejar cualquier
  // cambio en el texto visible del combobox de forma transparente.
  const descriptorValor = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value');
  Object.defineProperty(select, 'value', {
    configurable: true,
    get() {
      return descriptorValor.get.call(select);
    },
    set(valor) {
      descriptorValor.set.call(select, valor);
      sincronizarTexto();
    }
  });

  const descriptorDisabled = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'disabled');
  Object.defineProperty(select, 'disabled', {
    configurable: true,
    get() {
      return descriptorDisabled.get.call(select);
    },
    set(valor) {
      descriptorDisabled.set.call(select, valor);
      sincronizarDeshabilitado();
    }
  });

  // Cambios en las <option> (select.innerHTML = ...) no pasan por el setter
  // de arriba, por lo que se observan directamente para mantener el texto al dia.
  new MutationObserver(sincronizarTexto).observe(select, { childList: true });

  // form.reset() tampoco pasa por el setter de `value` (restaura el estado
  // por defecto internamente), asi que se resincroniza aparte tras el reset.
  if (select.form) {
    select.form.addEventListener('reset', () => {
      setTimeout(() => {
        sincronizarTexto();
        sincronizarDeshabilitado();
      }, 0);
    });
  }

  sincronizarTexto();
  sincronizarDeshabilitado();
}
