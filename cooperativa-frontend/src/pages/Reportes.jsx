import { useEffect, useMemo, useState } from "react";
import Layout from "../components/Layout";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import {
  obtenerEvaluaciones,
} from "../services/api";

export default function Reportes() {

  // =========================================================
  // DATOS
  // =========================================================

  const [evaluaciones, setEvaluaciones] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");


  // =========================================================
  // FILTROS
  // =========================================================

  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [tipoCredito, setTipoCredito] = useState("Todos");
  const [nivelRiesgo, setNivelRiesgo] = useState("Todos");


  // Estos son los filtros que realmente están aplicados.
  const [filtrosAplicados, setFiltrosAplicados] = useState({
    fechaInicio: "",
    fechaFin: "",
    tipoCredito: "Todos",
    nivelRiesgo: "Todos",
  });


  // =========================================================
  // CARGAR EVALUACIONES
  // =========================================================

  useEffect(() => {
    cargarDatos();
  }, []);


  const cargarDatos = async () => {

    try {

      setCargando(true);
      setError("");

      const datos = await obtenerEvaluaciones();

      setEvaluaciones(datos || []);

    } catch (error) {

      console.error(
        "Error cargando reportes:",
        error
      );

      setError(
        "No se pudo cargar la información de los reportes."
      );

    } finally {

      setCargando(false);

    }

  };


  // =========================================================
  // APLICAR FILTROS
  // =========================================================

  const aplicarFiltros = () => {

    if (
      fechaInicio &&
      fechaFin &&
      fechaInicio > fechaFin
    ) {

      alert(
        "La fecha de inicio no puede ser posterior a la fecha final."
      );

      return;
    }


    setFiltrosAplicados({
      fechaInicio,
      fechaFin,
      tipoCredito,
      nivelRiesgo,
    });

  };


  // =========================================================
  // LIMPIAR FILTROS
  // =========================================================

  const limpiarFiltros = () => {

    setFechaInicio("");
    setFechaFin("");
    setTipoCredito("Todos");
    setNivelRiesgo("Todos");

    setFiltrosAplicados({
      fechaInicio: "",
      fechaFin: "",
      tipoCredito: "Todos",
      nivelRiesgo: "Todos",
    });

  };


  // =========================================================
  // EVALUACIONES FILTRADAS
  // =========================================================

  const evaluacionesFiltradas = useMemo(() => {

    return evaluaciones.filter((evaluacion) => {

      const solicitud = evaluacion.solicitud;

      if (!solicitud) {
        return false;
      }


      // -----------------------------------------------------
      // FECHA
      // -----------------------------------------------------

      if (filtrosAplicados.fechaInicio) {

        if (!evaluacion.fechaEvaluacion) {
          return false;
        }

        const fecha = new Date(
          evaluacion.fechaEvaluacion
        );

        const inicio = new Date(
          `${filtrosAplicados.fechaInicio}T00:00:00`
        );

        if (fecha < inicio) {
          return false;
        }

      }


      if (filtrosAplicados.fechaFin) {

        if (!evaluacion.fechaEvaluacion) {
          return false;
        }

        const fecha = new Date(
          evaluacion.fechaEvaluacion
        );

        const fin = new Date(
          `${filtrosAplicados.fechaFin}T23:59:59`
        );

        if (fecha > fin) {
          return false;
        }

      }


      // -----------------------------------------------------
      // TIPO DE CRÉDITO
      // -----------------------------------------------------

      if (
        filtrosAplicados.tipoCredito !== "Todos" &&
        solicitud.tipoCredito !==
          filtrosAplicados.tipoCredito
      ) {

        return false;

      }


      // -----------------------------------------------------
      // NIVEL DE RIESGO
      // -----------------------------------------------------

      if (
        filtrosAplicados.nivelRiesgo !== "Todos" &&
        String(
          evaluacion.nivelRiesgo || ""
        ).toLowerCase() !==
          filtrosAplicados.nivelRiesgo.toLowerCase()
      ) {

        return false;

      }


      return true;

    });

  }, [
    evaluaciones,
    filtrosAplicados,
  ]);


  // =========================================================
  // INDICADORES
  // =========================================================

  const totalEvaluaciones =
    evaluacionesFiltradas.length;


  const riesgoAlto =
    evaluacionesFiltradas.filter(
      (evaluacion) =>
        String(
          evaluacion.nivelRiesgo || ""
        ).toLowerCase() === "alto"
    ).length;


  const riesgoMedio =
    evaluacionesFiltradas.filter(
      (evaluacion) =>
        String(
          evaluacion.nivelRiesgo || ""
        ).toLowerCase() === "medio"
    ).length;


  const riesgoBajo =
    evaluacionesFiltradas.filter(
      (evaluacion) =>
        String(
          evaluacion.nivelRiesgo || ""
        ).toLowerCase() === "bajo"
    ).length;


  // =========================================================
  // PROMEDIO DE PROBABILIDAD DE MORA ESTIMADA
  // =========================================================

  const probabilidadMoraPromedio = useMemo(() => {

    const valores = evaluacionesFiltradas
      .map(
        (evaluacion) =>
          Number(
            evaluacion.probabilidadMora
          )
      )
      .filter(
        (valor) =>
          Number.isFinite(valor)
      );


    if (valores.length === 0) {
      return 0;
    }


    const suma = valores.reduce(
      (acumulado, valor) =>
        acumulado + valor,
      0
    );


    return suma / valores.length;

  }, [evaluacionesFiltradas]);


  // =========================================================
  // SCORE PROMEDIO
  // =========================================================

  const scorePromedio = useMemo(() => {

    const scores = evaluacionesFiltradas
      .map(
        (evaluacion) =>
          Number(evaluacion.scoreIa)
      )
      .filter(
        (valor) =>
          Number.isFinite(valor)
      );


    if (scores.length === 0) {
      return 0;
    }


    const suma = scores.reduce(
      (acumulado, valor) =>
        acumulado + valor,
      0
    );


    return suma / scores.length;

  }, [evaluacionesFiltradas]);


  // =========================================================
  // RIESGO PREDOMINANTE
  // =========================================================

  const obtenerRiesgoPredominante = () => {

    if (totalEvaluaciones === 0) {
      return "-";
    }


    const cantidades = [
      {
        riesgo: "Alto",
        cantidad: riesgoAlto,
      },
      {
        riesgo: "Medio",
        cantidad: riesgoMedio,
      },
      {
        riesgo: "Bajo",
        cantidad: riesgoBajo,
      },
    ];


    cantidades.sort(
      (a, b) =>
        b.cantidad - a.cantidad
    );


    /*
      Si existe empate entre los valores máximos,
      mostramos "Mixto".
    */

    if (
      cantidades.length > 1 &&
      cantidades[0].cantidad ===
        cantidades[1].cantidad
    ) {

      return "Mixto";

    }


    return cantidades[0].riesgo;

  };


  const riesgoPredominante =
    obtenerRiesgoPredominante();


  // =========================================================
  // EVALUACIONES POR MES
  // =========================================================

  const datosMensuales = useMemo(() => {

    const meses = [
      "Ene",
      "Feb",
      "Mar",
      "Abr",
      "May",
      "Jun",
      "Jul",
      "Ago",
      "Sep",
      "Oct",
      "Nov",
      "Dic",
    ];


    const datos = meses.map(
      (mes) => ({
        mes,
        probabilidades: [],
      })
    );


    evaluacionesFiltradas.forEach(
      (evaluacion) => {

        if (
          !evaluacion.fechaEvaluacion
        ) {
          return;
        }


        const fecha = new Date(
          evaluacion.fechaEvaluacion
        );


        if (
          Number.isNaN(
            fecha.getTime()
          )
        ) {
          return;
        }


        const mes =
          fecha.getMonth();


        const probabilidad =
          Number(
            evaluacion.probabilidadMora
          );


        if (
          Number.isFinite(
            probabilidad
          )
        ) {

          datos[
            mes
          ].probabilidades.push(
            probabilidad
          );

        }

      }
    );


    return datos.map(
      (item) => {

        if (
          item.probabilidades.length === 0
        ) {

          return {
            mes: item.mes,
            promedio: 0,
          };

        }


        const suma =
          item.probabilidades.reduce(
            (acumulado, valor) =>
              acumulado + valor,
            0
          );


        return {
          mes: item.mes,

          promedio:
            suma /
            item.probabilidades.length,
        };

      }
    );

  }, [evaluacionesFiltradas]);


  // =========================================================
  // ALTURA DEL GRÁFICO
  // =========================================================

  const calcularAltura = (
    porcentaje
  ) => {

    if (porcentaje <= 0) {
      return "8px";
    }


    /*
      Como la probabilidad está entre
      0 y 100, usamos una altura máxima
      visual de 220px.
    */

    const altura =
      (porcentaje / 100) * 220;


    return `${Math.max(
      altura,
      25
    )}px`;

  };


  // =========================================================
  // FORMATEADORES
  // =========================================================

  const formatearPorcentaje = (
    valor
  ) => {

    return `${Number(
      valor || 0
    ).toLocaleString(
      "es-EC",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    )}%`;

  };


  const formatearDinero = (
    valor
  ) => {

    if (
      valor === null ||
      valor === undefined
    ) {
      return "-";
    }


    return Number(
      valor
    ).toLocaleString(
      "es-EC",
      {
        style: "currency",
        currency: "USD",
      }
    );

  };


  const formatearFecha = (
    fecha
  ) => {

    if (!fecha) {
      return "-";
    }


    return new Date(
      fecha
    ).toLocaleDateString(
      "es-EC",
      {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }
    );

  };


  // =========================================================
  // BADGE
  // =========================================================

  const obtenerClaseRiesgo = (
    riesgo
  ) => {

    const valor = String(
      riesgo || ""
    ).toLowerCase();


    if (valor === "bajo") {
      return "badge bajo";
    }


    if (valor === "medio") {
      return "badge medio";
    }


    if (valor === "alto") {
      return "badge alto";
    }


    return "badge";

  };


  // =========================================================
  // EXPORTACIONES
  // POR AHORA LAS CONECTAMOS EN EL SIGUIENTE PASO
  // =========================================================

  const exportarPDF = () => {

  // =========================================================
  // VALIDAR DATOS
  // =========================================================

  if (evaluacionesFiltradas.length === 0) {

    alert(
      "No existen evaluaciones para exportar con los filtros seleccionados."
    );

    return;
  }


  // =========================================================
  // CREAR PDF
  // =========================================================

  const pdf = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  });


  const anchoPagina =
    pdf.internal.pageSize.getWidth();


  // =========================================================
  // ENCABEZADO
  // =========================================================

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(18);

  pdf.text(
    "COOPERATIVA 15 DE ABRIL",
    anchoPagina / 2,
    16,
    {
      align: "center",
    }
  );


  pdf.setFontSize(14);

  pdf.text(
    "Reporte de Evaluacion de Riesgo Crediticio",
    anchoPagina / 2,
    24,
    {
      align: "center",
    }
  );


  pdf.setFont(
    "helvetica",
    "normal"
  );

  pdf.setFontSize(9);

  pdf.text(
    `Fecha de generacion: ${new Date().toLocaleString("es-EC")}`,
    14,
    33
  );


  // =========================================================
  // FILTROS UTILIZADOS
  // =========================================================

  pdf.setFont(
    "helvetica",
    "bold"
  );

  pdf.setFontSize(11);

  pdf.text(
    "Filtros aplicados",
    14,
    42
  );


  pdf.setFont(
    "helvetica",
    "normal"
  );

  pdf.setFontSize(9);


  const inicio =
    filtrosAplicados.fechaInicio ||
    "Sin limite";


  const fin =
    filtrosAplicados.fechaFin ||
    "Sin limite";


  pdf.text(
    `Periodo: ${inicio} - ${fin}`,
    14,
    49
  );


  pdf.text(
    `Tipo de credito: ${filtrosAplicados.tipoCredito}`,
    90,
    49
  );


  pdf.text(
    `Nivel de riesgo: ${filtrosAplicados.nivelRiesgo}`,
    180,
    49
  );


  // =========================================================
  // RESUMEN
  // =========================================================

  pdf.setFont(
    "helvetica",
    "bold"
  );

  pdf.setFontSize(11);

  pdf.text(
    "Resumen del periodo",
    14,
    60
  );


  autoTable(pdf, {

    startY: 65,

    head: [[
      "Evaluaciones",
      "Score IA promedio",
      "Prob. mora promedio",
      "Riesgo alto",
      "Riesgo medio",
      "Riesgo bajo",
      "Predominante",
    ]],

    body: [[

      totalEvaluaciones,

      totalEvaluaciones > 0
        ? `${scorePromedio.toFixed(1)}/100`
        : "-",

      formatearPorcentaje(
        probabilidadMoraPromedio
      ),

      riesgoAlto,

      riesgoMedio,

      riesgoBajo,

      riesgoPredominante,

    ]],

    theme: "grid",

    styles: {
      fontSize: 8,
      halign: "center",
      valign: "middle",
    },

    headStyles: {
      fillColor: [0, 100, 55],
      textColor: [255, 255, 255],
      fontStyle: "bold",
    },

  });


  // =========================================================
  // DETALLE DE EVALUACIONES
  // =========================================================

  const finalResumen =
    pdf.lastAutoTable?.finalY || 80;


  pdf.setFont(
    "helvetica",
    "bold"
  );

  pdf.setFontSize(11);

  pdf.text(
    "Detalle de evaluaciones",
    14,
    finalResumen + 12
  );


  // =========================================================
  // CONSTRUIR FILAS
  // =========================================================

  const filas =
    evaluacionesFiltradas.map(
      (evaluacion) => {

        const solicitud =
          evaluacion.solicitud;

        const cliente =
          solicitud?.cliente;


        const nombreCliente =
          cliente
            ? `${cliente.nombres || ""} ${cliente.apellidos || ""}`.trim()
            : "-";


        return [

          formatearFecha(
            evaluacion.fechaEvaluacion
          ),

          `#${solicitud?.id || "-"}`,

          nombreCliente,

          solicitud?.tipoCredito ||
            "-",

          formatearDinero(
            solicitud?.monto
          ),

          evaluacion.scoreIa != null
            ? `${evaluacion.scoreIa}/100`
            : "-",

          formatearPorcentaje(
            evaluacion.probabilidadMora
          ),

          evaluacion.nivelRiesgo ||
            "-",

          evaluacion.estado ||
            "-",

        ];

      }
    );


  // =========================================================
  // TABLA PRINCIPAL
  // =========================================================

  autoTable(pdf, {

    startY:
      finalResumen + 17,

    head: [[

      "Fecha",
      "Solicitud",
      "Cliente",
      "Tipo credito",
      "Monto",
      "Score IA",
      "Mora estimada",
      "Riesgo",
      "Estado",

    ]],

    body: filas,

    theme: "striped",

    styles: {
      fontSize: 7.5,
      cellPadding: 2.5,
      valign: "middle",
    },

    headStyles: {
      fillColor: [0, 100, 55],
      textColor: [255, 255, 255],
      fontStyle: "bold",
    },

    columnStyles: {

      0: {
        cellWidth: 23
      },

      1: {
        cellWidth: 18,
        halign: "center"
      },

      2: {
        cellWidth: 42
      },

      3: {
        cellWidth: 30
      },

      4: {
        cellWidth: 25,
        halign: "right"
      },

      5: {
        cellWidth: 22,
        halign: "center"
      },

      6: {
        cellWidth: 28,
        halign: "center"
      },

      7: {
        cellWidth: 22,
        halign: "center"
      },

      8: {
        cellWidth: 25,
        halign: "center"
      },

    },


    // =======================================================
    // PIE DE PÁGINA
    // =======================================================

    didDrawPage: (data) => {

      const numeroPagina =
        pdf.internal.getNumberOfPages();


      pdf.setFont(
        "helvetica",
        "normal"
      );

      pdf.setFontSize(8);


      pdf.text(
        `Pagina ${numeroPagina}`,
        anchoPagina - 14,
        pdf.internal.pageSize.getHeight() - 8,
        {
          align: "right"
        }
      );


      pdf.text(
        "Sistema interno de evaluacion de riesgo crediticio",
        14,
        pdf.internal.pageSize.getHeight() - 8
      );

    },

  });


  // =========================================================
  // NOTA METODOLÓGICA
  // =========================================================

  let posicionNota =
    pdf.lastAutoTable?.finalY + 12;


  const altoPagina =
    pdf.internal.pageSize.getHeight();


  if (
    posicionNota >
    altoPagina - 25
  ) {

    pdf.addPage();

    posicionNota = 20;

  }


  pdf.setFont(
    "helvetica",
    "bold"
  );

  pdf.setFontSize(9);

  pdf.text(
    "Nota:",
    14,
    posicionNota
  );


  pdf.setFont(
    "helvetica",
    "normal"
  );


  const nota =
    "La probabilidad de mora corresponde a una estimacion generada por el modelo de inteligencia artificial para cada solicitud. " +
    "No representa morosidad real observada ni constituye por si sola una decision definitiva de aprobacion o rechazo.";


  const textoNota =
    pdf.splitTextToSize(
      nota,
      anchoPagina - 28
    );


  pdf.text(
    textoNota,
    14,
    posicionNota + 5
  );


  // =========================================================
  // NOMBRE DEL ARCHIVO
  // =========================================================

  const hoy =
    new Date();


  const fechaArchivo =
    `${hoy.getFullYear()}-${String(
      hoy.getMonth() + 1
    ).padStart(2, "0")}-${String(
      hoy.getDate()
    ).padStart(2, "0")}`;


  const nombreArchivo =
    `reporte_riesgo_crediticio_${fechaArchivo}.pdf`;


  // =========================================================
  // DESCARGAR PDF
  // =========================================================

  pdf.save(
    nombreArchivo
  );

};


  const exportarExcel = () => {

  // =========================================================
  // VALIDAR QUE EXISTAN DATOS
  // =========================================================

  if (evaluacionesFiltradas.length === 0) {

    alert(
      "No existen evaluaciones para exportar con los filtros seleccionados."
    );

    return;
  }


  // =========================================================
  // INFORMACIÓN GENERAL DEL REPORTE
  // =========================================================

  const fechaGeneracion =
    new Date().toLocaleString(
      "es-EC"
    );


  const periodoInicio =
    filtrosAplicados.fechaInicio ||
    "Sin límite";


  const periodoFin =
    filtrosAplicados.fechaFin ||
    "Sin límite";


  // =========================================================
  // HOJA 1: RESUMEN GERENCIAL
  // =========================================================

  const datosResumen = [

    [
      "REPORTE DE EVALUACIÓN DE RIESGO CREDITICIO"
    ],

    [],

    [
      "Fecha de generación",
      fechaGeneracion
    ],

    [
      "Fecha inicio",
      periodoInicio
    ],

    [
      "Fecha fin",
      periodoFin
    ],

    [
      "Tipo de crédito",
      filtrosAplicados.tipoCredito
    ],

    [
      "Nivel de riesgo",
      filtrosAplicados.nivelRiesgo
    ],

    [],

    [
      "INDICADORES DEL PERIODO"
    ],

    [],

    [
      "Indicador",
      "Valor"
    ],

    [
      "Evaluaciones realizadas",
      totalEvaluaciones
    ],

    [
      "Score IA promedio",
      Number(
        scorePromedio.toFixed(2)
      )
    ],

    [
      "Probabilidad de mora promedio",
      Number(
        probabilidadMoraPromedio.toFixed(2)
      ) / 100
    ],

    [
      "Riesgo alto",
      riesgoAlto
    ],

    [
      "Riesgo medio",
      riesgoMedio
    ],

    [
      "Riesgo bajo",
      riesgoBajo
    ],

    [
      "Riesgo predominante",
      riesgoPredominante
    ],

  ];


  const hojaResumen =
    XLSX.utils.aoa_to_sheet(
      datosResumen
    );


  // Formato porcentaje para la probabilidad promedio.
  // La fila 14 del Excel corresponde a este indicador.

  if (hojaResumen["B14"]) {
    hojaResumen["B14"].z = "0.00%";
  }


  // Ancho de columnas

  hojaResumen["!cols"] = [

    {
      wch: 35
    },

    {
      wch: 25
    },

  ];


  // =========================================================
  // HOJA 2: DETALLE DE EVALUACIONES
  // =========================================================

  const datosDetalle =
    evaluacionesFiltradas.map(
      (evaluacion) => {

        const solicitud =
          evaluacion.solicitud;

        const cliente =
          solicitud?.cliente;


        return {

          "ID Evaluación":
            evaluacion.id,

          "Fecha evaluación":
            formatearFecha(
              evaluacion.fechaEvaluacion
            ),

          "ID Solicitud":
            solicitud?.id || "",

          "Cédula":
            cliente?.cedula || "",

          "Cliente":
            cliente
              ? `${cliente.nombres || ""} ${cliente.apellidos || ""}`.trim()
              : "",

          "Tipo de crédito":
            solicitud?.tipoCredito || "",

          "Monto solicitado":
            Number(
              solicitud?.monto || 0
            ),

          "Plazo (meses)":
            solicitud?.plazoMeses || "",

          "Ingresos mensuales":
            Number(
              solicitud?.ingresosMensuales || 0
            ),

          "Egresos mensuales":
            Number(
              solicitud?.egresosMensuales || 0
            ),

          "Nivel de endeudamiento":
            Number(
              solicitud?.nivelEndeudamiento || 0
            ),

          "Capacidad de pago":
            Number(
              solicitud?.capacidadPago || 0
            ),

          "Score IA":
            evaluacion.scoreIa ?? "",

          "Probabilidad de mora":
            evaluacion.probabilidadMora != null
              ? Number(
                  evaluacion.probabilidadMora
                ) / 100
              : "",

          "Nivel de riesgo":
            evaluacion.nivelRiesgo || "",

          "Recomendación":
            evaluacion.recomendacion || "",

          "Modelo utilizado":
            evaluacion.modeloUtilizado || "",

          "Estado":
            evaluacion.estado || "",

        };

      }
    );


  const hojaDetalle =
    XLSX.utils.json_to_sheet(
      datosDetalle
    );


  // =========================================================
  // ANCHOS DE COLUMNAS
  // =========================================================

  hojaDetalle["!cols"] = [

    { wch: 14 }, // Evaluación
    { wch: 18 }, // Fecha
    { wch: 14 }, // Solicitud
    { wch: 16 }, // Cédula
    { wch: 30 }, // Cliente
    { wch: 20 }, // Tipo crédito
    { wch: 18 }, // Monto
    { wch: 15 }, // Plazo
    { wch: 20 }, // Ingresos
    { wch: 20 }, // Egresos
    { wch: 23 }, // Endeudamiento
    { wch: 20 }, // Capacidad
    { wch: 12 }, // Score
    { wch: 22 }, // Mora
    { wch: 18 }, // Riesgo
    { wch: 55 }, // Recomendación
    { wch: 30 }, // Modelo
    { wch: 18 }, // Estado

  ];


  // =========================================================
  // FORMATOS DE CELDAS
  // =========================================================

  const rango =
    XLSX.utils.decode_range(
      hojaDetalle["!ref"]
    );


  /*
    Recorremos desde la segunda fila porque
    la primera contiene los encabezados.
  */

  for (
    let fila = 1;
    fila <= rango.e.r;
    fila++
  ) {

    // Monto solicitado - columna G

    const celdaMonto =
      hojaDetalle[
        XLSX.utils.encode_cell({
          r: fila,
          c: 6
        })
      ];


    if (celdaMonto) {
      celdaMonto.z =
        '$#,##0.00';
    }


    // Ingresos - columna I

    const celdaIngresos =
      hojaDetalle[
        XLSX.utils.encode_cell({
          r: fila,
          c: 8
        })
      ];


    if (celdaIngresos) {
      celdaIngresos.z =
        '$#,##0.00';
    }


    // Egresos - columna J

    const celdaEgresos =
      hojaDetalle[
        XLSX.utils.encode_cell({
          r: fila,
          c: 9
        })
      ];


    if (celdaEgresos) {
      celdaEgresos.z =
        '$#,##0.00';
    }


    // Capacidad de pago - columna L

    const celdaCapacidad =
      hojaDetalle[
        XLSX.utils.encode_cell({
          r: fila,
          c: 11
        })
      ];


    if (celdaCapacidad) {
      celdaCapacidad.z =
        '$#,##0.00';
    }


    // Probabilidad de mora - columna N

    const celdaMora =
      hojaDetalle[
        XLSX.utils.encode_cell({
          r: fila,
          c: 13
        })
      ];


    if (celdaMora) {
      celdaMora.z =
        "0.00%";
    }

  }


  // =========================================================
  // CREAR LIBRO DE EXCEL
  // =========================================================

  const libro =
    XLSX.utils.book_new();


  XLSX.utils.book_append_sheet(
    libro,
    hojaResumen,
    "Resumen"
  );


  XLSX.utils.book_append_sheet(
    libro,
    hojaDetalle,
    "Evaluaciones"
  );


  // =========================================================
  // NOMBRE DEL ARCHIVO
  // =========================================================

  const hoy =
    new Date();


  const fechaArchivo =
    `${hoy.getFullYear()}-${String(
      hoy.getMonth() + 1
    ).padStart(2, "0")}-${String(
      hoy.getDate()
    ).padStart(2, "0")}`;


  const nombreArchivo =
    `reporte_riesgo_crediticio_${fechaArchivo}.xlsx`;


  // =========================================================
  // DESCARGAR
  // =========================================================

  XLSX.writeFile(
    libro,
    nombreArchivo
  );

};


  // =========================================================
  // CARGANDO
  // =========================================================

  if (cargando) {

    return (

      <Layout
        title="Reportes y Dashboard Gerencial"
        user="Gerencia"
      >

        <section className="panel">

          <p
            style={{
              textAlign: "center",
              padding: "40px",
            }}
          >
            ⏳ Cargando información de reportes...
          </p>

        </section>

      </Layout>

    );

  }


  // =========================================================
  // RETURN
  // =========================================================

  return (

    <Layout
      title="Reportes y Dashboard Gerencial"
      user="Gerencia"
    >

      {/* =====================================================
          ERROR
      ===================================================== */}

      {error && (

        <section
          className="panel"
          style={{
            marginBottom: "20px",
          }}
        >

          <strong>
            ⚠️ {error}
          </strong>

        </section>

      )}


      {/* =====================================================
          FILTROS
      ===================================================== */}

      <section className="panel">

        <h2 className="section-title">
          Filtros de consulta
        </h2>


        <div className="filters">

          {/* FECHA INICIO */}

          <div className="form-group">

            <label>
              Fecha inicio
            </label>

            <input
              type="date"
              value={fechaInicio}
              onChange={
                (event) =>
                  setFechaInicio(
                    event.target.value
                  )
              }
            />

          </div>


          {/* FECHA FIN */}

          <div className="form-group">

            <label>
              Fecha fin
            </label>

            <input
              type="date"
              value={fechaFin}
              onChange={
                (event) =>
                  setFechaFin(
                    event.target.value
                  )
              }
            />

          </div>


          {/* TIPO CRÉDITO */}

          <div className="form-group">

            <label>
              Tipo de crédito
            </label>

            <select
              value={tipoCredito}
              onChange={
                (event) =>
                  setTipoCredito(
                    event.target.value
                  )
              }
            >

              <option>
                Todos
              </option>

              <option>
                Consumo
              </option>

              <option>
                Microcrédito
              </option>

              <option>
                Vivienda
              </option>

              <option>
                Comercial
              </option>

            </select>

          </div>


          {/* RIESGO */}

          <div className="form-group">

            <label>
              Nivel de riesgo
            </label>

            <select
              value={nivelRiesgo}
              onChange={
                (event) =>
                  setNivelRiesgo(
                    event.target.value
                  )
              }
            >

              <option>
                Todos
              </option>

              <option>
                Bajo
              </option>

              <option>
                Medio
              </option>

              <option>
                Alto
              </option>

            </select>

          </div>


          <button
            className="btn btn-green"
            onClick={aplicarFiltros}
          >
            🔎 Aplicar filtros
          </button>

        </div>


        {/* EXPORTACIONES */}

        <div className="export-buttons">

          <button
            className="btn btn-yellow"
            onClick={exportarPDF}
          >
            📄 Exportar PDF
          </button>


          <button
            className="btn btn-green"
            onClick={exportarExcel}
          >
            📊 Exportar Excel
          </button>


          <button
            className="btn btn-gray"
            onClick={limpiarFiltros}
          >
            Limpiar filtros
          </button>

        </div>

      </section>


      {/* =====================================================
          RESUMEN
      ===================================================== */}

      <section className="summary-cards four">

        <div className="card">

          <h3>
            Solicitudes evaluadas
          </h3>

          <div className="number">
            {totalEvaluaciones}
          </div>

          <p>
            Total según los filtros seleccionados.
          </p>

        </div>


        <div className="card red">

          <h3>
            Probabilidad de mora promedio
          </h3>

          <div className="number">

            {formatearPorcentaje(
              probabilidadMoraPromedio
            )}

          </div>

          <p>
            Promedio estimado por el modelo de IA.
          </p>

        </div>


        <div className="card orange">

          <h3>
            Riesgo medio
          </h3>

          <div className="number">
            {riesgoMedio}
          </div>

          <p>
            Evaluaciones clasificadas como riesgo medio.
          </p>

        </div>


        <div className="card yellow">

          <h3>
            Riesgo bajo
          </h3>

          <div className="number">
            {riesgoBajo}
          </div>

          <p>
            Evaluaciones clasificadas como riesgo bajo.
          </p>

        </div>

      </section>


      {/* =====================================================
          GRÁFICO + RESUMEN
      ===================================================== */}

      <section className="report-grid">

        {/* GRÁFICO */}

        <div className="panel">

          <h2 className="section-title">
            Probabilidad de mora estimada por mes
          </h2>

          <p
            style={{
              color: "#777",
              marginBottom: "25px",
            }}
          >
            Promedio mensual de las probabilidades
            generadas por el modelo.
          </p>


          <div className="chart-box">

            {datosMensuales.map(
              (item) => (

                <div
                  className="bar"
                  key={item.mes}
                  style={{
                    height:
                      calcularAltura(
                        item.promedio
                      ),
                  }}
                  title={
                    `${item.mes}: ${formatearPorcentaje(
                      item.promedio
                    )}`
                  }
                >

                  <small>

                    {formatearPorcentaje(
                      item.promedio
                    )}

                  </small>

                  <span>
                    {item.mes}
                  </span>

                </div>

              )
            )}

          </div>

        </div>


        {/* INDICADORES */}

        <div className="panel">

          <h2 className="section-title">
            Resumen del periodo
          </h2>


          <div className="report-list">

            <div className="report-item">

              <strong>
                Evaluaciones realizadas
              </strong>

              <p>
                {totalEvaluaciones}
              </p>

            </div>


            <div className="report-item">

              <strong>
                Score IA promedio
              </strong>

              <p>
                {totalEvaluaciones > 0
                  ? `${scorePromedio.toFixed(
                      1
                    )}/100`
                  : "-"
                }
              </p>

            </div>


            <div className="report-item">

              <strong>
                Riesgo alto
              </strong>

              <p>
                {riesgoAlto}
              </p>

            </div>


            <div className="report-item">

              <strong>
                Riesgo medio
              </strong>

              <p>
                {riesgoMedio}
              </p>

            </div>


            <div className="report-item">

              <strong>
                Riesgo bajo
              </strong>

              <p>
                {riesgoBajo}
              </p>

            </div>


            <div className="report-item">

              <strong>
                Riesgo predominante
              </strong>

              <p>
                {riesgoPredominante}
              </p>

            </div>

          </div>

        </div>

      </section>


      {/* =====================================================
          DETALLE DE EVALUACIONES
      ===================================================== */}

      <section className="panel">

        <h2 className="section-title">
          Detalle de evaluaciones
        </h2>


        <div
          style={{
            overflowX: "auto",
          }}
        >

          <table className="table">

            <thead>

              <tr>

                <th>
                  Fecha
                </th>

                <th>
                  Solicitud
                </th>

                <th>
                  Cliente
                </th>

                <th>
                  Tipo crédito
                </th>

                <th>
                  Monto
                </th>

                <th>
                  Score IA
                </th>

                <th>
                  Mora estimada
                </th>

                <th>
                  Riesgo
                </th>

                <th>
                  Estado
                </th>

              </tr>

            </thead>


            <tbody>

              {evaluacionesFiltradas.map(
                (evaluacion) => {

                  const solicitud =
                    evaluacion.solicitud;

                  const cliente =
                    solicitud?.cliente;


                  return (

                    <tr
                      key={
                        evaluacion.id
                      }
                    >

                      <td>

                        {formatearFecha(
                          evaluacion.fechaEvaluacion
                        )}

                      </td>


                      <td>

                        #{solicitud?.id || "-"}

                      </td>


                      <td>

                        {cliente
                          ? `${cliente.nombres || ""} ${cliente.apellidos || ""}`
                          : "-"
                        }

                      </td>


                      <td>

                        {solicitud?.tipoCredito ||
                          "-"}

                      </td>


                      <td>

                        {formatearDinero(
                          solicitud?.monto
                        )}

                      </td>


                      <td>

                        <strong>

                          {evaluacion.scoreIa != null
                            ? `${evaluacion.scoreIa}/100`
                            : "-"
                          }

                        </strong>

                      </td>


                      <td>

                        {formatearPorcentaje(
                          evaluacion.probabilidadMora
                        )}

                      </td>


                      <td>

                        <span
                          className={
                            obtenerClaseRiesgo(
                              evaluacion.nivelRiesgo
                            )
                          }
                        >

                          {evaluacion.nivelRiesgo ||
                            "-"
                          }

                        </span>

                      </td>


                      <td>

                        {evaluacion.estado ||
                          "-"
                        }

                      </td>

                    </tr>

                  );

                }
              )}

            </tbody>

          </table>

        </div>


        {evaluacionesFiltradas.length === 0 && (

          <div
            style={{
              textAlign: "center",
              padding: "40px",
              color: "#777",
            }}
          >

            <div
              style={{
                fontSize: "35px",
                marginBottom: "10px",
              }}
            >
              📊
            </div>

            <strong>
              No existen evaluaciones para los filtros seleccionados.
            </strong>

          </div>

        )}

      </section>

    </Layout>

  );

}