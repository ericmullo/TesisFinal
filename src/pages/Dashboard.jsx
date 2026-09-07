import Layout from "../components/Layout";

function Dashboard() {

  return (

    <Layout title="Dashboard Principal">

      <section className="cards five">

        <div className="card">

          <h3>
            Total solicitudes
          </h3>

          <div className="number">
            128
          </div>

          <p>
            Solicitudes registradas
          </p>

        </div>

        <div className="card red">

          <h3>
            Riesgo alto
          </h3>

          <div className="number">
            24
          </div>

          <p>
            Clientes con alto riesgo
          </p>

        </div>

        <div className="card orange">

          <h3>
            Riesgo medio
          </h3>

          <div className="number">
            51
          </div>

          <p>
            Clientes en revisión
          </p>

        </div>

        <div className="card yellow">

          <h3>
            Riesgo bajo
          </h3>

          <div className="number">
            53
          </div>

          <p>
            Clientes viables
          </p>

        </div>

        <div className="card gray">

          <h3>
            Aprobadas / Rechazadas
          </h3>

          <div className="number">
            76 / 28
          </div>

          <p>
            Resultado de solicitudes
          </p>

        </div>

      </section>

      <section className="dashboard-grid">

        <div className="panel">

          <h2>
            Solicitudes por mes
          </h2>

          <div className="bar-chart">

            <div
              className="bar"
              style={{ height: "120px" }}
            >
              <small>34</small>
              <span>Ene</span>
            </div>

            <div
              className="bar"
              style={{ height: "170px" }}
            >
              <small>48</small>
              <span>Feb</span>
            </div>

            <div
              className="bar"
              style={{ height: "210px" }}
            >
              <small>61</small>
              <span>Mar</span>
            </div>

            <div
              className="bar"
              style={{ height: "150px" }}
            >
              <small>42</small>
              <span>Abr</span>
            </div>

            <div
              className="bar"
              style={{ height: "230px" }}
            >
              <small>70</small>
              <span>May</span>
            </div>

          </div>

        </div>

        <div className="panel">

          <h2>
            Resumen de riesgo
          </h2>

          <div className="risk-list">

            <div className="risk-item high">

              <strong>
                Riesgo alto
              </strong>

              Requiere revisión detallada del analista.

            </div>

            <div className="risk-item medium">

              <strong>
                Riesgo medio
              </strong>

              Solicitudes con condiciones por validar.

            </div>

            <div className="risk-item low">

              <strong>
                Riesgo bajo
              </strong>

              Solicitudes con perfil favorable.

            </div>

          </div>

        </div>

      </section>

      <section className="panel footer-panel">

        <h2>
          Últimas solicitudes evaluadas
        </h2>

        <table className="table">

          <thead>

            <tr>

              <th>
                Cliente
              </th>

              <th>
                Tipo de crédito
              </th>

              <th>
                Score
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

            <tr>

              <td>
                Juan Pérez
              </td>

              <td>
                Microcrédito
              </td>

              <td>
                780
              </td>

              <td>
                <span className="badge bajo">
                  Bajo
                </span>
              </td>

              <td>
                Aprobación sugerida
              </td>

            </tr>

            <tr>

              <td>
                María López
              </td>

              <td>
                Consumo
              </td>

              <td>
                620
              </td>

              <td>
                <span className="badge medio">
                  Medio
                </span>
              </td>

              <td>
                En revisión
              </td>

            </tr>

            <tr>

              <td>
                Carlos Zambrano
              </td>

              <td>
                Comercial
              </td>

              <td>
                480
              </td>

              <td>
                <span className="badge alto">
                  Alto
                </span>
              </td>

              <td>
                Revisión crítica
              </td>

            </tr>

          </tbody>

        </table>

      </section>

    </Layout>
  );
}

export default Dashboard;