import { useState } from "react";
import Layout from "../components/Layout";

const initialForm = {
  cedula: "", nombres: "", correo: "", telefono: "", estadoCivil: "Soltero/a",
  ocupacion: "", direccion: "", ingresos: "", egresos: "", endeudamiento: "",
  empresa: "", antiguedad: "", capacidadPago: "", tipoCredito: "Consumo",
  monto: "", plazo: "6 meses", estado: "Pendiente", destino: ""
};

export default function Solicitudes() {
  const [form, setForm] = useState(initialForm);

  const update = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const limpiar = () => setForm(initialForm);

  const guardar = (e) => {
    e.preventDefault();
    console.log("Solicitud lista para enviar a Spring Boot:", form);
    alert("Solicitud preparada. Luego aquí conectaremos el POST de Spring Boot.");
  };

  return (
    <Layout title="Registro de Solicitud de Crédito">
      <section className="summary-cards three">
        <div className="summary-card"><h3>Nueva solicitud</h3><strong>En registro</strong></div>
        <div className="summary-card yellow"><h3>Estado inicial</h3><strong>Pendiente</strong></div>
        <div className="summary-card orange"><h3>Validación</h3><strong>Requerida</strong></div>
      </section>

      <form onSubmit={guardar}>
        <section className="panel">
          <h2 className="section-title">Datos personales</h2>
          <div className="form-grid">
            <div className="form-group"><label>Cédula</label><input name="cedula" value={form.cedula} onChange={update} placeholder="Ej. 1300000000" /></div>
            <div className="form-group"><label>Nombres completos</label><input name="nombres" value={form.nombres} onChange={update} placeholder="Nombre del solicitante" /></div>
            <div className="form-group"><label>Correo electrónico</label><input name="correo" value={form.correo} onChange={update} type="email" placeholder="correo@ejemplo.com" /></div>
            <div className="form-group"><label>Teléfono</label><input name="telefono" value={form.telefono} onChange={update} placeholder="0999999999" /></div>
            <div className="form-group"><label>Estado civil</label><select name="estadoCivil" value={form.estadoCivil} onChange={update}><option>Soltero/a</option><option>Casado/a</option><option>Unión libre</option><option>Divorciado/a</option></select></div>
            <div className="form-group"><label>Ocupación</label><input name="ocupacion" value={form.ocupacion} onChange={update} placeholder="Ej. Comerciante" /></div>
            <div className="form-group full"><label>Dirección domiciliaria</label><input name="direccion" value={form.direccion} onChange={update} placeholder="Ingrese la dirección del cliente" /></div>
          </div>
        </section>

        <section className="panel">
          <h2 className="section-title">Información financiera</h2>
          <div className="form-grid">
            <div className="form-group"><label>Ingresos mensuales</label><input name="ingresos" value={form.ingresos} onChange={update} type="number" placeholder="Ej. 850.00" /></div>
            <div className="form-group"><label>Egresos mensuales</label><input name="egresos" value={form.egresos} onChange={update} type="number" placeholder="Ej. 420.00" /></div>
            <div className="form-group"><label>Nivel de endeudamiento</label><input name="endeudamiento" value={form.endeudamiento} onChange={update} type="number" placeholder="Ej. 30" /></div>
            <div className="form-group"><label>Empresa / Actividad</label><input name="empresa" value={form.empresa} onChange={update} placeholder="Lugar de trabajo o actividad" /></div>
            <div className="form-group"><label>Antigüedad laboral</label><input name="antiguedad" value={form.antiguedad} onChange={update} placeholder="Ej. 2 años" /></div>
            <div className="form-group"><label>Capacidad de pago estimada</label><input name="capacidadPago" value={form.capacidadPago} onChange={update} type="number" placeholder="Ej. 250.00" /></div>
          </div>
        </section>

        <section className="panel">
          <h2 className="section-title">Información del crédito</h2>
          <div className="form-grid">
            <div className="form-group"><label>Tipo de crédito</label><select name="tipoCredito" value={form.tipoCredito} onChange={update}><option>Consumo</option><option>Microcrédito</option><option>Vivienda</option><option>Comercial</option></select></div>
            <div className="form-group"><label>Monto solicitado</label><input name="monto" value={form.monto} onChange={update} type="number" placeholder="Ej. 5000.00" /></div>
            <div className="form-group"><label>Plazo</label><select name="plazo" value={form.plazo} onChange={update}><option>6 meses</option><option>12 meses</option><option>24 meses</option><option>36 meses</option><option>48 meses</option></select></div>
            <div className="form-group"><label>Estado de la solicitud</label><select name="estado" value={form.estado} onChange={update}><option>Pendiente</option><option>En evaluación</option><option>Aprobado</option><option>Rechazado</option></select></div>
            <div className="form-group full"><label>Destino del crédito</label><textarea name="destino" value={form.destino} onChange={update} placeholder="Describa para qué será utilizado el crédito solicitado..." /></div>
          </div>

          <div className="actions">
            <button type="button" className="btn btn-cancel">Cancelar</button>
            <button type="button" className="btn btn-clean" onClick={limpiar}>Limpiar</button>
            <button type="submit" className="btn btn-save">💾 Guardar solicitud</button>
          </div>
        </section>
      </form>
    </Layout>
  );
}
