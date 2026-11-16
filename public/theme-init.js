/**
 * NovaStore — modo oscuro automático.
 *
 * Se carga de forma bloqueante desde el <head> (script clásico) para aplicar
 * el tema antes del primer paint y evitar el flash de tema claro.
 *
 * El CSP del servidor (script-src 'self') bloquea scripts inline, por eso
 * esta lógica vive en un archivo externo servido desde el mismo origen.
 */
(function () {
  var root = document.documentElement;

  if (!window.matchMedia) {
    return;
  }

  var query = window.matchMedia('(prefers-color-scheme: dark)');

  function apply(isDark) {
    root.classList.toggle('app-dark', isDark);
  }

  apply(query.matches);

  function onChange(event) {
    apply(event.matches);
  }

  if (query.addEventListener) {
    query.addEventListener('change', onChange);
  } else if (query.addListener) {
    // Navegadores antiguos (Safari < 14).
    query.addListener(onChange);
  }
})();
