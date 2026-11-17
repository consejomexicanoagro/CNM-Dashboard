/**
 * Utilidades para generar y descargar archivos CSV compatibles con Excel.
 *
 * @module utils/csv
 */

/**
 * Escapa un valor para incluirlo en una celda CSV.
 *
 * - Encierra el valor entre comillas dobles.
 * - Duplica las comillas internas, según RFC 4180.
 *
 * @param {unknown} value - Valor de la celda.
 * @returns {string} Celda escapada, siempre entre comillas.
 */
export function escapeCsv(value) {
  return `"${String(value ?? "").replace(/"/g, '""')}"`;
}

/**
 * Convierte encabezados y filas en una cadena CSV con saltos `CRLF`.
 *
 * @param {string[]} headers - Nombres de las columnas.
 * @param {Array<Array<unknown>>} rows - Filas de datos.
 * @returns {string} Contenido CSV listo para descargar.
 */
export function toCsv(headers, rows) {
  return [headers, ...rows]
    .map((row) => row.map(escapeCsv).join(","))
    .join("\r\n");
}

/**
 * Descarga una tabla como archivo CSV con BOM UTF-8.
 *
 * El BOM permite que Excel reconozca correctamente los acentos y la `ñ`.
 *
 * @param {string} filename - Nombre del archivo (se agrega `.csv` si falta).
 * @param {string[]} headers - Nombres de las columnas.
 * @param {Array<Array<unknown>>} rows - Filas de datos.
 * @returns {void}
 */
export function downloadCsv(filename, headers, rows) {
  const content = toCsv(headers, rows);
  const blob = new Blob(["\ufeff", content], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const safeName = filename.toLowerCase().endsWith(".csv")
    ? filename
    : `${filename}.csv`;

  link.href = url;
  link.download = safeName;
  link.style.display = "none";

  document.body.appendChild(link);
  link.click();
  link.remove();

  // Se libera la URL después del clic para no cortar la descarga en curso.
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}
