/**
 * app.js — Sistema de Respuesta a Solicitudes de Clientes
 * Autor  : Owen Yamil Campuzano Sanchez (@owensanchezz)
 * Versión: 1.0.0
 */

'use strict';

// ─────────────────────────────────────────────
// ESTADO GLOBAL
// ─────────────────────────────────────────────

/** @type {Array<Solicitud>} */
let solicitudes = JSON.parse(localStorage.getItem('solicitudes') || '[]');

/**
 * @typedef {Object} Solicitud
 * @property {string} folio
 * @property {string} fecha
 * @property {string} cliente
 * @property {string} tipo
 * @property {string} descripcion
 * @property {string} respuesta
 * @property {string} estatus
 * @property {string} agente
 * @property {string} id
 */

// ─────────────────────────────────────────────
// INICIALIZACIÓN
// ─────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  // Fecha de hoy por defecto
  const inputFecha = document.getElementById('fecha');
  if (inputFecha) inputFecha.value = hoy();

  renderTabla();
  actualizarBadge();
});

// ─────────────────────────────────────────────
// NAVEGACIÓN
// ─────────────────────────────────────────────

/**
 * Muestra la sección indicada y actualiza botones de navegación.
 * @param {string} nombre - 'solicitudes' | 'reporte'
 */
function showSection(nombre) {
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));

  document.getElementById(`section-${nombre}`).classList.add('active');

  const btns = document.querySelectorAll('.nav-btn');
  btns.forEach(b => {
    if (b.textContent.toLowerCase().includes(nombre === 'solicitudes' ? 'solicitud' : 'reporte')) {
      b.classList.add('active');
    }
  });

  if (nombre === 'reporte') renderReporte();
}

// ─────────────────────────────────────────────
// CRUD: REGISTRO
// ─────────────────────────────────────────────

/**
 * Registra una nueva solicitud desde el formulario.
 * @param {Event} e
 */
function registrarSolicitud(e) {
  e.preventDefault();

  const nueva = {
    id:          generarId(),
    folio:       obtenerValor('folio'),
    fecha:       obtenerValor('fecha'),
    cliente:     obtenerValor('cliente'),
    tipo:        obtenerValor('tipo'),
    descripcion: obtenerValor('descripcion'),
    respuesta:   obtenerValor('respuesta'),
    estatus:     obtenerValor('estatus'),
    agente:      obtenerValor('agente'),
  };

  solicitudes.unshift(nueva);
  guardar();
  renderTabla();
  actualizarBadge();

  e.target.reset();
  document.getElementById('fecha').value = hoy();
  mostrarToast('✓ Solicitud registrada correctamente');
}

// ─────────────────────────────────────────────
// CRUD: ELIMINACIÓN
// ─────────────────────────────────────────────

/**
 * Elimina una solicitud por su ID.
 * @param {string} id
 */
function eliminarSolicitud(id) {
  if (!confirm('¿Eliminar esta solicitud?')) return;
  solicitudes = solicitudes.filter(s => s.id !== id);
  guardar();
  renderTabla();
  actualizarBadge();
  mostrarToast('Solicitud eliminada');
}

// ─────────────────────────────────────────────
// RENDER: TABLA PRINCIPAL
// ─────────────────────────────────────────────

/**
 * Renderiza la tabla de solicitudes con filtro opcional.
 * @param {string} [filtro='']
 */
function renderTabla(filtro = '') {
  const tbody = document.getElementById('cuerpoTabla');
  const termino = filtro.toLowerCase();

  const datos = termino
    ? solicitudes.filter(s =>
        Object.values(s).some(v => v.toLowerCase().includes(termino))
      )
    : solicitudes;

  if (datos.length === 0) {
    tbody.innerHTML = `<tr class="empty-row">
      <td colspan="7">No hay solicitudes${termino ? ' que coincidan' : ' registradas'}.</td>
    </tr>`;
    return;
  }

  tbody.innerHTML = datos.map(s => `
    <tr>
      <td><strong>${esc(s.folio)}</strong></td>
      <td>${formatearFecha(s.fecha)}</td>
      <td>${esc(s.cliente)}</td>
      <td>${esc(s.tipo)}</td>
      <td>${badgeEstatus(s.estatus)}</td>
      <td>${esc(s.agente)}</td>
      <td>
        <button class="btn-danger" onclick="eliminarSolicitud('${s.id}')">Eliminar</button>
      </td>
    </tr>
  `).join('');
}

// ─────────────────────────────────────────────
// RENDER: REPORTE
// ─────────────────────────────────────────────

/** Renderiza el reporte ejecutivo con estadísticas y tabla completa. */
function renderReporte() {
  renderEstadisticas();
  renderTablaReporte();
}

/** Renderiza las tarjetas de estadísticas. */
function renderEstadisticas() {
  const grid = document.getElementById('statsGrid');

  const total     = solicitudes.length;
  const resueltas = solicitudes.filter(s => s.estatus === 'Resuelto').length;
  const pendientes= solicitudes.filter(s => s.estatus === 'Pendiente').length;
  const proceso   = solicitudes.filter(s => s.estatus === 'En proceso').length;

  const tipoConteo = {};
  solicitudes.forEach(s => {
    tipoConteo[s.tipo] = (tipoConteo[s.tipo] || 0) + 1;
  });
  const tipoTop = Object.entries(tipoConteo).sort((a, b) => b[1] - a[1])[0];

  const stats = [
    { label: 'Total solicitudes', value: total,      sub: 'registradas en el sistema' },
    { label: 'Resueltas',         value: resueltas,  sub: `${porcentaje(resueltas, total)}% del total` },
    { label: 'Pendientes',        value: pendientes, sub: 'sin atender' },
    { label: 'En proceso',        value: proceso,    sub: 'en atención' },
    { label: 'Tipo más frecuente',value: tipoTop ? tipoTop[1] : 0, sub: tipoTop ? tipoTop[0] : '—' },
  ];

  grid.innerHTML = stats.map(s => `
    <div class="stat-card">
      <span class="stat-label">${s.label}</span>
      <span class="stat-value">${s.value}</span>
      <span class="stat-sub">${s.sub}</span>
    </div>
  `).join('');
}

/** Renderiza la tabla completa en el reporte. */
function renderTablaReporte() {
  const tbody = document.getElementById('cuerpoReporte');

  if (solicitudes.length === 0) {
    tbody.innerHTML = `<tr class="empty-row"><td colspan="8">Sin datos para mostrar.</td></tr>`;
    return;
  }

  tbody.innerHTML = solicitudes.map(s => `
    <tr>
      <td>${esc(s.folio)}</td>
      <td>${formatearFecha(s.fecha)}</td>
      <td>${esc(s.cliente)}</td>
      <td>${esc(s.tipo)}</td>
      <td style="white-space:normal;max-width:200px">${esc(s.descripcion)}</td>
      <td style="white-space:normal;max-width:200px">${esc(s.respuesta)}</td>
      <td>${badgeEstatus(s.estatus)}</td>
      <td>${esc(s.agente)}</td>
    </tr>
  `).join('');
}

// ─────────────────────────────────────────────
// FILTRO DE BÚSQUEDA
// ─────────────────────────────────────────────

/** Lee el buscador y actualiza la tabla. */
function filtrarTabla() {
  const termino = document.getElementById('buscador').value;
  renderTabla(termino);
}

// ─────────────────────────────────────────────
// IMPRESIÓN / EXPORTACIÓN
// ─────────────────────────────────────────────

/** Abre el diálogo de impresión del navegador. */
function imprimirReporte() {
  window.print();
}

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

/** Guarda en localStorage. */
function guardar() {
  localStorage.setItem('solicitudes', JSON.stringify(solicitudes));
}

/** Actualiza el badge de contador. */
function actualizarBadge() {
  const el = document.getElementById('badge-contador');
  if (el) el.textContent = `${solicitudes.length} registro${solicitudes.length !== 1 ? 's' : ''}`;
}

/**
 * Genera un ID único simple.
 * @returns {string}
 */
function generarId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

/**
 * Retorna la fecha de hoy en formato YYYY-MM-DD.
 * @returns {string}
 */
function hoy() {
  return new Date().toISOString().split('T')[0];
}

/**
 * Escapa HTML para evitar XSS.
 * @param {string} texto
 * @returns {string}
 */
function esc(texto) {
  const d = document.createElement('div');
  d.textContent = texto;
  return d.innerHTML;
}

/**
 * Formatea una fecha YYYY-MM-DD a formato legible.
 * @param {string} fecha
 * @returns {string}
 */
function formatearFecha(fecha) {
  if (!fecha) return '—';
  const [a, m, d] = fecha.split('-');
  const meses = ['', 'ene', 'feb', 'mar', 'abr', 'may', 'jun',
                      'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  return `${parseInt(d)} ${meses[parseInt(m)]} ${a}`;
}

/**
 * Genera un badge HTML según el estatus.
 * @param {string} estatus
 * @returns {string}
 */
function badgeEstatus(estatus) {
  const clases = {
    'Pendiente':  'tag-pendiente',
    'En proceso': 'tag-proceso',
    'Resuelto':   'tag-resuelto',
    'Cerrado':    'tag-cerrado',
  };
  const cls = clases[estatus] || 'tag-cerrado';
  return `<span class="tag ${cls}">${esc(estatus)}</span>`;
}

/**
 * Calcula porcentaje redondeado.
 * @param {number} parte
 * @param {number} total
 * @returns {number}
 */
function porcentaje(parte, total) {
  if (total === 0) return 0;
  return Math.round((parte / total) * 100);
}

/**
 * Obtiene el valor de un campo del formulario.
 * @param {string} id
 * @returns {string}
 */
function obtenerValor(id) {
  return (document.getElementById(id)?.value || '').trim();
}

/**
 * Muestra un mensaje toast temporal.
 * @param {string} mensaje
 * @param {number} [ms=3000]
 */
function mostrarToast(mensaje, ms = 3000) {
  const toast = document.getElementById('toast');
  toast.textContent = mensaje;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), ms);
}
