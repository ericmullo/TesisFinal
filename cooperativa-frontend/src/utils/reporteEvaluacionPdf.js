import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

const VERDE = [0, 96, 47];
const AMARILLO = [244, 197, 66];
const TEXTO = [37, 58, 46];

const texto = (valor) => valor === null || valor === undefined || String(valor).trim() === ""
  ? "No registrado"
  : String(valor);

const dinero = (valor) => valor === null || valor === undefined || valor === ""
  ? "No registrado"
  : `$${Number(valor).toLocaleString("es-EC", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const porcentaje = (valor) => valor === null || valor === undefined || valor === ""
  ? "No registrado"
  : `${Number(valor).toLocaleString("es-EC", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%`;

const fecha = (valor) => {
  if (!valor) return "No registrada";
  const fechaValida = new Date(valor);
  return Number.isNaN(fechaValida.getTime()) ? "No registrada" : fechaValida.toLocaleString("es-EC");
};

const colorRiesgo = (nivel) => {
  const normalizado = String(nivel || "").trim().toLowerCase();
  if (normalizado === "alto") return [190, 42, 35];
  if (normalizado === "medio") return [171, 116, 0];
  if (normalizado === "bajo") return [0, 130, 69];
  return [90, 105, 97];
};

export function descargarReporteEvaluacionPdf({ solicitud, evaluacion, documentos = [] }) {
  if (!solicitud || !evaluacion) return;

  const pdf = new jsPDF({ unit: "mm", format: "a4" });
  const ancho = pdf.internal.pageSize.getWidth();
  const alto = pdf.internal.pageSize.getHeight();
  const margen = 18;
  const colorNivel = colorRiesgo(evaluacion.nivelRiesgo);
  let y = 62;

  const asegurarEspacio = (espacio) => {
    if (y + espacio > alto - 19) {
      pdf.addPage();
      y = 22;
    }
  };

  const seccion = (titulo, filas) => {
    asegurarEspacio(30);
    pdf.setDrawColor(...AMARILLO);
    pdf.setLineWidth(1.3);
    pdf.line(margen, y - 1, margen, y + 6);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(12);
    pdf.setTextColor(...VERDE);
    pdf.text(titulo, margen + 4, y + 4);
    y += 10;

    autoTable(pdf, {
      startY: y,
      margin: { left: margen, right: margen, bottom: 20 },
      tableWidth: ancho - margen * 2,
      body: filas.map(([etiqueta, valor]) => [etiqueta, texto(valor)]),
      theme: "plain",
      styles: {
        font: "helvetica",
        fontSize: 9,
        textColor: TEXTO,
        cellPadding: { top: 3.2, bottom: 3.2, left: 3, right: 3 },
        valign: "top",
        lineColor: [221, 232, 224],
        lineWidth: { bottom: 0.15 },
        overflow: "linebreak"
      },
      columnStyles: {
        0: { cellWidth: 64, fontStyle: "bold", textColor: VERDE },
        1: { cellWidth: ancho - margen * 2 - 64 }
      },
      alternateRowStyles: { fillColor: [247, 250, 247] },
      didDrawPage: (data) => {
        if (data.pageNumber > 1) y = 22;
      }
    });
    y = pdf.lastAutoTable.finalY + 12;
  };

  pdf.setFillColor(...VERDE);
  pdf.rect(0, 0, ancho, 46, "F");
  pdf.setFillColor(...AMARILLO);
  pdf.rect(0, 46, ancho, 3, "F");
  pdf.setTextColor(255, 255, 255);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(20);
  pdf.text("Informe de evaluación crediticia", margen, 21);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(10);
  pdf.text(`Solicitud ${texto(solicitud.codigoSolicitud)}  |  Generado: ${fecha(new Date())}`, margen, 32);

  pdf.setFillColor(246, 249, 246);
  pdf.roundedRect(margen, y, ancho - margen * 2, 33, 3, 3, "F");
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(9);
  pdf.setTextColor(...TEXTO);
  pdf.text("SCORE IA", margen + 8, y + 10);
  pdf.text("PROBABILIDAD DE MORA", margen + 60, y + 10);
  pdf.text("NIVEL DE RIESGO", margen + 123, y + 10);
  pdf.setFontSize(17);
  pdf.setTextColor(...VERDE);
  pdf.text(evaluacion.scoreIa == null ? "Pendiente" : `${evaluacion.scoreIa}/100`, margen + 8, y + 22);
  pdf.text(porcentaje(evaluacion.probabilidadMora), margen + 60, y + 22);
  pdf.setTextColor(...colorNivel);
  pdf.text(texto(evaluacion.nivelRiesgo), margen + 123, y + 22);
  y += 46;

  const cliente = solicitud.cliente || {};
  seccion("Solicitante y solicitud", [
    ["Cliente", `${cliente.nombres || ""} ${cliente.apellidos || ""}`.trim() || "No registrado"],
    ["Cédula", cliente.cedula],
    ["Correo", cliente.correo],
    ["Teléfono", cliente.telefono],
    ["Código de solicitud", solicitud.codigoSolicitud],
    ["Fecha de solicitud", fecha(solicitud.fechaSolicitud)],
    ["Estado de la solicitud", solicitud.estado],
    ["Estado civil", solicitud.estadoCivil],
    ["Ocupación", solicitud.ocupacion],
    ["Empresa o lugar de trabajo", solicitud.empresa],
    ["Actividad económica", solicitud.actividadEconomica],
    ["Dirección", solicitud.direccion],
    ["Destino del crédito", solicitud.destinoCredito]
  ]);

  seccion("Variables analizadas por la IA", [
    ["Ingresos mensuales", dinero(solicitud.ingresosMensuales)],
    ["Egresos mensuales", dinero(solicitud.egresosMensuales)],
    ["Nivel de endeudamiento", porcentaje(solicitud.nivelEndeudamiento)],
    ["Capacidad de pago", dinero(solicitud.capacidadPago)],
    ["Tipo de crédito", solicitud.tipoCredito],
    ["Subsegmento", solicitud.subsegmentoCredito],
    ["Producto de crédito", solicitud.productoCredito],
    ["Monto solicitado", dinero(solicitud.monto)],
    ["Plazo", solicitud.plazoMeses == null ? "No registrado" : `${solicitud.plazoMeses} meses`],
    ["Ventas anuales", dinero(solicitud.ventasAnuales)],
    ["Fuente de pago", solicitud.fuentePago],
    ["Antigüedad laboral", solicitud.antiguedadLaboral]
  ]);

  seccion("Resultado y explicación de la IA", [
    ["Modelo utilizado", evaluacion.modeloUtilizado],
    ["Estado de evaluación", evaluacion.estado],
    ["Fecha de evaluación", fecha(evaluacion.fechaEvaluacion)],
    ["Score IA", evaluacion.scoreIa == null ? "Pendiente" : `${evaluacion.scoreIa}/100`],
    ["Probabilidad de mora", porcentaje(evaluacion.probabilidadMora)],
    ["Confianza del modelo", porcentaje(evaluacion.confianzaModelo)],
    ["Clasificación", evaluacion.nivelRiesgo ? `Riesgo ${evaluacion.nivelRiesgo}` : "Pendiente"],
    ["Recomendación IA", evaluacion.recomendacion],
    ["Explicación del modelo", evaluacion.explicacion]
  ]);

  seccion("Documentación registrada", documentos.length
    ? documentos.map((documento) => [
      documento.tipoDocumento || "Documento",
      `${texto(documento.nombreArchivo)} | ${texto(documento.estado)}`
    ])
    : [["Documentos", "No se encontraron documentos asociados a la solicitud."]]);

  seccion("Decisión del analista", [
    ["Estado", solicitud.fechaDecision ? solicitud.estado : "Pendiente de decisión formal"],
    ["Fecha de decisión", fecha(solicitud.fechaDecision)],
    ["Justificación", solicitud.observacionDecision || "No registrada"]
  ]);

  asegurarEspacio(28);
  pdf.setFont("helvetica", "italic");
  pdf.setFontSize(9);
  pdf.setTextColor(91, 104, 96);
  const nota = pdf.splitTextToSize(
    "La evaluación de IA es un apoyo para el análisis crediticio. La aprobación o rechazo corresponde al personal autorizado de la cooperativa.",
    ancho - margen * 2
  );
  pdf.text(nota, margen, y);

  const paginas = pdf.internal.getNumberOfPages();
  for (let pagina = 1; pagina <= paginas; pagina += 1) {
    pdf.setPage(pagina);
    pdf.setDrawColor(221, 232, 224);
    pdf.line(margen, alto - 15, ancho - margen, alto - 15);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8);
    pdf.setTextColor(98, 111, 101);
    pdf.text("Sistema de evaluación crediticia · Informe de solicitud", margen, alto - 10);
    pdf.text(`Página ${pagina} de ${paginas}`, ancho - margen, alto - 10, { align: "right" });
  }

  const codigoSeguro = String(solicitud.codigoSolicitud || solicitud.id || "solicitud")
    .replace(/[^a-zA-Z0-9_-]/g, "_");
  pdf.save(`evaluacion_crediticia_${codigoSeguro}.pdf`);
}
