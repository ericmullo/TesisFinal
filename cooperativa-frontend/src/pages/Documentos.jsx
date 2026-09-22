import { useState } from "react";
import Layout from "../components/Layout";

export default function Documentos() {
  const [archivos, setArchivos] = useState([]);

  const agregarArchivo = (tipo, file) => {
    if (!file) return;
    setArchivos((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        nombre: file.name,
        tipo,
        formato: file.name.split(".").pop().toUpperCase(),
        fecha: new Date().toLocaleDateString("es-EC"),
        file,
      },
    ]);
  };

  const eliminar = (id) => setArchivos((prev) => prev.filter((a) => a.id !== id));

  return (
    <Layout title="Carga de Documentos">
      <section className="panel">
        <h2 className="section-title">Documentos del solicitante</h2>

        <div className="info-box">
          Solicitud: SOL-2026-001 | Cliente: Juan Pérez | Estado: Documentación pendiente
        </div>

        <div className="upload-grid">
          <UploadCard icon="📄" title="Subir PDF" text="Adjuntar documentos generales en formato PDF." accept=".pdf" label="Seleccionar PDF" onFile={(f) => agregarArchivo("General", f)} />
          <UploadCard icon="🪪" title="Subir cédula" text="Adjuntar imagen o PDF de la cédula del cliente." accept=".pdf,.jpg,.jpeg,.png" label="Seleccionar cédula" onFile={(f) => agregarArchivo("Identificación", f)} />
          <UploadCard icon="💼" title="Certificado laboral" text="Adjuntar certificado laboral o respaldo de ingresos." accept=".pdf,.jpg,.jpeg,.png" label="Seleccionar archivo" onFile={(f) => agregarArchivo("Ingresos", f)} />
        </div>
      </section>

      <section className="panel">
        <h2 className="section-title">Lista de documentos cargados</h2>

        <table className="table">
          <thead>
            <tr><th>Documento</th><th>Tipo</th><th>Formato</th><th>Fecha de carga</th><th>Estado</th><th>Acciones</th></tr>
          </thead>
          <tbody>
            {archivos.map((a) => (
              <tr key={a.id}>
                <td>{a.nombre}</td>
                <td>{a.tipo}</td>
                <td>{a.formato}</td>
                <td>{a.fecha}</td>
                <td><span className="status uploaded">Cargado</span></td>
                <td>
                  <button className="btn-small btn-view" onClick={() => window.open(URL.createObjectURL(a.file), "_blank")}>Ver</button>
                  <button className="btn-small btn-delete" onClick={() => eliminar(a.id)}>Eliminar</button>
                </td>
              </tr>
            ))}

            {archivos.length === 0 && (
              <tr>
                <td>Rol de pagos</td><td>Financiero</td><td>PDF</td><td>--</td>
                <td><span className="status pending">Pendiente</span></td>
                <td><button className="btn-small btn-view">Subir</button></td>
              </tr>
            )}
          </tbody>
        </table>

        <div className="actions">
          <button className="btn btn-cancel">Cancelar</button>
          <button className="btn btn-save">💾 Guardar documentos</button>
        </div>
      </section>
    </Layout>
  );
}

function UploadCard({ icon, title, text, accept, label, onFile }) {
  return (
    <div className="upload-card">
      <div className="upload-icon">{icon}</div>
      <h3>{title}</h3>
      <p>{text}</p>
      <label className="upload-btn">
        {label}
        <input type="file" accept={accept} onChange={(e) => onFile(e.target.files?.[0])} />
      </label>
    </div>
  );
}
