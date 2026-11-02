export default function ResumenBuroSimulado({ resultado, formatearDinero }) {
  if (!resultado) return null;

  if (resultado.sinHistorial) {
    return (
      <p className="buro-sin-historial" role="status">
        Sin historial crediticio simulado. Registre los datos financieros
        declarados por el solicitante para continuar la evaluación.
      </p>
    );
  }

  const perfiles = {
    SIN_ALERTAS_SIMULADAS: "Sin alertas simuladas",
    ATRASO_OCASIONAL_SIMULADO: "Atraso ocasional simulado",
    ALTO_ENDEUDAMIENTO_SIMULADO: "Alto endeudamiento simulado",
    MORA_SIMULADA: "Mora simulada"
  };

  return (
    <div className="bureau-grid" aria-live="polite">
      <div className="bureau-item"><strong>Score simulado</strong><span>{resultado.scoreBuro} / {resultado.escalaMaxima}</span></div>
      <div className="bureau-item"><strong>Deuda total simulada</strong><span>{formatearDinero(resultado.deudaTotal)}</span></div>
      <div className="bureau-item"><strong>Cuotas mensuales simuladas</strong><span>{formatearDinero(resultado.cuotaMensualTotal)}</span></div>
      <div className="bureau-item"><strong>Créditos activos</strong><span>{resultado.creditosActivos}</span></div>
      <div className="bureau-item"><strong>Días máximos de mora</strong><span>{resultado.diasMoraMaximos}</span></div>
      <div className="bureau-item"><strong>Perfil ficticio</strong><span>{perfiles[resultado.estadoReferencial] || "No determinado"}</span></div>
    </div>
  );
}
