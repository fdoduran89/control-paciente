import * as Print from "expo-print";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import { Platform } from "react-native";
import { Registro } from "../models/types";
import { formatFecha, formatHora, formatFechaHora } from "../utils/dateTime";

interface PDFData {
  pacienteNombre: string;
  fechaInicio: string;
  fechaFin: string;
  registros: Registro[];
  fechaGeneracion: string;
}

// Obtener el valor mostrado para cada tipo de registro
const getValorMostrado = (registro: Registro): string => {
  switch (registro.tipo) {
    case "GLUCOMETRIA":
      return registro.valor || "N/A";
    case "TENSION_ARTERIAL":
      if (registro.sistolica && registro.diastolica) {
        return `${registro.sistolica}/${registro.diastolica}`;
      }
      return registro.valor || "N/A";
    case "INSULINA":
      return "Aplicada";
    default:
      return "N/A";
  }
};

// Obtener el nombre del tipo en español
const getTipoTexto = (tipo: string): string => {
  const tipos: Record<string, string> = {
    GLUCOMETRIA: "Glucometría",
    TENSION_ARTERIAL: "Tensión Arterial",
    INSULINA: "Insulina",
  };
  return tipos[tipo] || tipo;
};

// Obtener el ícono para cada tipo
const getTipoIcono = (tipo: string): string => {
  const iconos: Record<string, string> = {
    GLUCOMETRIA: "📊",
    TENSION_ARTERIAL: "❤️",
    INSULINA: "💉",
  };
  return iconos[tipo] || "📋";
};

// Generar tabla HTML para un tipo específico
const generarTablaTipo = (tipo: string, registros: Registro[]): string => {
  if (registros.length === 0) {
    return `
      <div style="text-align: center; padding: 10px; color: #999; font-style: italic;">
        No hay registros de ${getTipoTexto(tipo)}
      </div>
    `;
  }

  let filas = "";
  registros.forEach((registro) => {
    const fecha = formatFecha(registro.fecha_hora);
    const hora = formatHora(registro.fecha_hora);
    const valor = getValorMostrado(registro);

    filas += `
      <tr>
        <td style="padding: 8px 12px; border-bottom: 1px solid #eee;">${fecha}</td>
        <td style="padding: 8px 12px; border-bottom: 1px solid #eee;">${hora}</td>
        <td style="padding: 8px 12px; border-bottom: 1px solid #eee; font-weight: bold; text-align: center;">${valor}</td>
      </tr>
    `;
  });

  const color =
    tipo === "GLUCOMETRIA"
      ? "#2196F3"
      : tipo === "TENSION_ARTERIAL"
        ? "#F44336"
        : "#FF9800";

  return `
    <div style="margin-bottom: 30px; page-break-inside: avoid;">
      <div style="background: ${color}; color: white; padding: 10px 15px; border-radius: 8px 8px 0 0; display: flex; align-items: center; gap: 10px;">
        <span style="font-size: 20px;">${getTipoIcono(tipo)}</span>
        <span style="font-size: 16px; font-weight: bold;">${getTipoTexto(tipo)}</span>
        <span style="margin-left: auto; font-size: 14px; background: rgba(255,255,255,0.2); padding: 2px 10px; border-radius: 12px;">
          ${registros.length} registros
        </span>
      </div>
      <table style="width: 100%; border-collapse: collapse; border: 1px solid #ddd; border-top: none; border-radius: 0 0 8px 8px; overflow: hidden;">
        <thead style="background: #f5f5f5;">
          <tr>
            <th style="padding: 8px 12px; text-align: left; font-size: 12px; color: #666; border-bottom: 1px solid #ddd;">Fecha</th>
            <th style="padding: 8px 12px; text-align: left; font-size: 12px; color: #666; border-bottom: 1px solid #ddd;">Hora</th>
            <th style="padding: 8px 12px; text-align: center; font-size: 12px; color: #666; border-bottom: 1px solid #ddd;">Valor</th>
          </tr>
        </thead>
        <tbody>
          ${filas}
        </tbody>
      </table>
    </div>
  `;
};

// Generar HTML completo del PDF
const generarHTML = (data: PDFData): string => {
  const { pacienteNombre, fechaInicio, fechaFin, registros, fechaGeneracion } =
    data;

  // Separar registros por tipo
  const glucometrias = registros.filter((r) => r.tipo === "GLUCOMETRIA");
  const tensiones = registros.filter((r) => r.tipo === "TENSION_ARTERIAL");
  const insulinas = registros.filter((r) => r.tipo === "INSULINA");

  // Generar tablas por tipo
  const tablaGlucometrias = generarTablaTipo("GLUCOMETRIA", glucometrias);
  const tablaTensiones = generarTablaTipo("TENSION_ARTERIAL", tensiones);
  const tablaInsulinas = generarTablaTipo("INSULINA", insulinas);

  const totalRegistros = registros.length;

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Registro de Control - ${pacienteNombre}</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: 'Helvetica', 'Arial', sans-serif;
            padding: 30px;
            background: #fff;
            color: #333;
          }
          .header {
            text-align: center;
            border-bottom: 3px solid #2196F3;
            padding-bottom: 20px;
            margin-bottom: 25px;
          }
          .header h1 {
            font-size: 24px;
            color: #2196F3;
            margin-bottom: 5px;
          }
          .header .subtitle {
            font-size: 14px;
            color: #666;
          }
          .info {
            display: flex;
            justify-content: space-between;
            flex-wrap: wrap;
            gap: 10px;
            margin-bottom: 25px;
            padding: 15px 20px;
            background: #f5f5f5;
            border-radius: 8px;
          }
          .info-item {
            font-size: 14px;
          }
          .info-item strong {
            display: block;
            font-size: 11px;
            color: #888;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 2px;
          }
          .info-item .value {
            font-weight: bold;
            color: #333;
          }
          .resumen {
            display: flex;
            justify-content: space-around;
            flex-wrap: wrap;
            gap: 10px;
            margin-bottom: 25px;
            padding: 15px;
            background: white;
            border-radius: 8px;
            border: 1px solid #e0e0e0;
          }
          .resumen-item {
            text-align: center;
            padding: 5px 15px;
          }
          .resumen-item .numero {
            font-size: 22px;
            font-weight: bold;
          }
          .resumen-item .label {
            font-size: 11px;
            color: #888;
            margin-top: 2px;
          }
          .resumen-item .numero.glucometria { color: #2196F3; }
          .resumen-item .numero.tension { color: #F44336; }
          .resumen-item .numero.insulina { color: #FF9800; }
          .resumen-item .numero.total { color: #333; }
          .section-title {
            font-size: 18px;
            font-weight: bold;
            margin: 20px 0 10px 0;
            color: #333;
          }
          .no-data {
            text-align: center;
            padding: 20px;
            color: #999;
            font-style: italic;
            border: 1px dashed #ddd;
            border-radius: 8px;
            margin-bottom: 20px;
          }
          .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #eee;
            text-align: center;
            font-size: 11px;
            color: #999;
          }
          .footer .generado {
            margin-top: 5px;
            font-size: 10px;
          }
          @media print {
            body { padding: 20px; }
            .info { background: #f5f5f5; }
            .resumen { border: 1px solid #ddd; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>📋 REGISTRO DE CONTROL</h1>
          <div class="subtitle">Reporte de seguimiento médico por tipo de evento</div>
        </div>

        <div class="info">
          <div class="info-item">
            <strong>Paciente</strong>
            <span class="value">${pacienteNombre}</span>
          </div>
          <div class="info-item">
            <strong>Período</strong>
            <span class="value">${fechaInicio} - ${fechaFin}</span>
          </div>
          <div class="info-item">
            <strong>Generado</strong>
            <span class="value">${fechaGeneracion}</span>
          </div>
        </div>

        <div class="resumen">
          <div class="resumen-item">
            <div class="numero total">${totalRegistros}</div>
            <div class="label">Total Registros</div>
          </div>
          <div class="resumen-item">
            <div class="numero glucometria">${glucometrias.length}</div>
            <div class="label">📊 Glucometrías</div>
          </div>
          <div class="resumen-item">
            <div class="numero tension">${tensiones.length}</div>
            <div class="label">❤️ Tensiones</div>
          </div>
          <div class="resumen-item">
            <div class="numero insulina">${insulinas.length}</div>
            <div class="label">💉 Insulinas</div>
          </div>
        </div>

        <h2 class="section-title">📊 Glucometrías</h2>
        ${glucometrias.length > 0 ? tablaGlucometrias : '<div class="no-data">No hay registros de glucometrías en este período</div>'}

        <h2 class="section-title">❤️ Tensión Arterial</h2>
        ${tensiones.length > 0 ? tablaTensiones : '<div class="no-data">No hay registros de tensión arterial en este período</div>'}

        <h2 class="section-title">💉 Insulina</h2>
        ${insulinas.length > 0 ? tablaInsulinas : '<div class="no-data">No hay registros de insulina en este período</div>'}

        <div class="footer">
          <div>Reporte generado automáticamente por la aplicación de Control de Paciente</div>
          <div class="generado">Generado el ${fechaGeneracion}</div>
        </div>
      </body>
    </html>
  `;
};

// Generar PDF y guardar/compartir
export const generarPDF = async (
  pacienteNombre: string,
  fechaInicio: string,
  fechaFin: string,
  registros: Registro[],
): Promise<void> => {
  try {
    const fechaGeneracion = formatFechaHora(new Date().toISOString());

    const html = generarHTML({
      pacienteNombre,
      fechaInicio,
      fechaFin,
      registros,
      fechaGeneracion,
    });

    // Generar PDF
    const { uri } = await Print.printToFileAsync({
      html,
      base64: false,
    });

    console.log("✅ PDF generado en:", uri);

    // Verificar si se puede compartir
    const puedeCompartir = await Sharing.isAvailableAsync();

    if (puedeCompartir) {
      await Sharing.shareAsync(uri, {
        mimeType: "application/pdf",
        dialogTitle: "Guardar o compartir PDF",
        UTI: "com.adobe.pdf",
      });
      console.log("✅ PDF compartido correctamente");
    } else {
      console.log("ℹ️ No se puede compartir, archivo guardado en:", uri);
      alert(`PDF guardado en: ${uri}`);
    }
  } catch (error) {
    console.error("❌ Error al generar PDF:", error);
    throw error;
  }
};

// Guardar PDF sin compartir (para uso interno)
export const guardarPDF = async (
  pacienteNombre: string,
  fechaInicio: string,
  fechaFin: string,
  registros: Registro[],
): Promise<string> => {
  const fechaGeneracion = formatFechaHora(new Date().toISOString());

  const html = generarHTML({
    pacienteNombre,
    fechaInicio,
    fechaFin,
    registros,
    fechaGeneracion,
  });

  const { uri } = await Print.printToFileAsync({
    html,
    base64: false,
  });

  return uri;
};
