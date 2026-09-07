import Layout from "../components/Layout";

function Clientes() {

  return (

    <Layout title="Gestión de Clientes">

      <section className="summary-cards three">

        <div className="small-card">

          <h3>
            Total clientes
          </h3>

          <strong>
            356
          </strong>

        </div>

        <div className="small-card yellow">

          <h3>
            Clientes en revisión
          </h3>

          <strong>
            42
          </strong>

        </div>

        <div className="small-card red">

          <h3>
            Clientes con alerta
          </h3>

          <strong>
            18
          </strong>

        </div>

      </section>

      <section className="panel">

        <div className="search-actions">

          <input
            className="search-box"
            type="text"
            placeholder="Buscar cliente por nombre, cédula o correo..."
          />

          <button className="btn btn-green">
            ➕ Crear cliente
          </button>

        </div>

        <div className="form-grid four">

          <div className="form-group">

            <label>
              Cédula
            </label>

            <input
              type="text"
              placeholder="Ej. 1300000000"
            />

          </div>

          <div className="form-group">

            <label>
              Nombres
            </label>

            <input
              type="text"
              placeholder="Nombres del cliente"
            />

          </div>

          <div className="form-group">

            <label>
              Correo
            </label>

            <input
              type="email"
              placeholder="correo@ejemplo.com"
            />

          </div>

          <div className="form-group">

            <label>
              Estado
            </label>

            <select>

              <option>
                Activo
              </option>

              <option>
                En revisión
              </option>

              <option>
                Inactivo
              </option>

            </select>

          </div>

        </div>

      </section>

      <section className="panel">

        <h2 className="section-title">
          Tabla de clientes registrados
        </h2>

        <table className="table">

          <thead>

            <tr>

              <th>
                Cédula
              </th>

              <th>
                Cliente
              </th>

              <th>
                Correo
              </th>

              <th>
                Teléfono
              </th>

              <th>
                Estado
              </th>

              <th>
                Acciones
              </th>

            </tr>

          </thead>

          <tbody>

            <tr>

              <td>
                1302456789
              </td>

              <td>
                Juan Pérez
              </td>

              <td>
                juan.perez@email.com
              </td>

              <td>
                0987654321
              </td>

              <td>

                <span className="status active-status">
                  Activo
                </span>

              </td>

              <td>

                <button className="btn-small btn-view">
                  Ver
                </button>

                <button className="btn-small btn-yellow">
                  Editar
                </button>

              </td>

            </tr>

            <tr>

              <td>
                0912345678
              </td>

              <td>
                María López
              </td>

              <td>
                maria.lopez@email.com
              </td>

              <td>
                0991122334
              </td>

              <td>

                <span className="status review">
                  En revisión
                </span>

              </td>

              <td>

                <button className="btn-small btn-view">
                  Ver
                </button>

                <button className="btn-small btn-yellow">
                  Editar
                </button>

              </td>

            </tr>

            <tr>

              <td>
                1709876543
              </td>

              <td>
                Carlos Zambrano
              </td>

              <td>
                carlos.z@email.com
              </td>

              <td>
                0974567890
              </td>

              <td>

                <span className="status inactive">
                  Alerta
                </span>

              </td>

              <td>

                <button className="btn-small btn-view">
                  Ver
                </button>

                <button className="btn-small btn-yellow">
                  Editar
                </button>

              </td>

            </tr>

          </tbody>

        </table>

      </section>

    </Layout>
  );
}

export default Clientes;