# ClienteDesk

Aplicación web para registrar y dar seguimiento a las solicitudes de clientes: captura de la solicitud, respuesta elaborada, estatus y agente responsable, con un reporte ejecutivo para consultar y exportar.

Demo en vivo: https://owensanchezz.github.io/clientedesk/

## Funciones

- Registro de solicitudes con folio, fecha, cliente, tipo, descripción, respuesta, estatus y agente.
- Historial en tabla con búsqueda en tiempo real y eliminación de registros.
- Reporte ejecutivo con estadísticas: total, resueltas, pendientes, en proceso y tipo de solicitud más frecuente.
- Exportación del reporte mediante impresión del navegador.
- Datos guardados en el navegador con `localStorage`, sin necesidad de servidor.
- Escape de HTML al mostrar datos para evitar XSS.

## Tecnologías

HTML5, CSS3 y JavaScript (sin librerías externas).

## Cómo ejecutarlo

1. Descarga o clona el repositorio.
2. Abre `index.html` en el navegador.

## Estructura

| Archivo | Contenido |
|---|---|
| `index.html` | Estructura de las dos vistas: solicitudes y reporte |
| `styles.css` | Estilos |
| `app.js` | Lógica: registro, eliminación, filtro, reporte y persistencia |

## Mejoras pendientes

- Editar solicitudes existentes.
- Backend con API REST y base de datos en lugar de `localStorage`.

## Autor

Owen Yamil Campuzano Sanchez ([@owensanchezz](https://github.com/owensanchezz))
