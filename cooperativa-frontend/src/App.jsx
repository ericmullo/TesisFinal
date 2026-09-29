import {
  Routes,
  Route,
  Navigate
} from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Clientes from "./pages/Clientes";
import Solicitudes from "./pages/Solicitudes";
import Documentos from "./pages/Documentos";
import EvaluacionRiesgo from "./pages/EvaluacionRiesgo";
import Reportes from "./pages/Reportes";
import Usuarios from "./pages/Usuarios";

import RutaProtegida from "./components/RutaProtegida";


function App() {

  return (

    <Routes>

      {/* LOGIN */}

      <Route
        path="/"
        element={<Login />}
      />


      {/* DASHBOARD */}

      <Route
        path="/dashboard"
        element={
          <RutaProtegida>
            <Dashboard />
          </RutaProtegida>
        }
      />


      {/* CLIENTES */}

      <Route
        path="/clientes"
        element={
          <RutaProtegida>
            <Clientes />
          </RutaProtegida>
        }
      />


      {/* SOLICITUDES */}

      <Route
        path="/solicitudes"
        element={
          <RutaProtegida>
            <Solicitudes />
          </RutaProtegida>
        }
      />


      {/* DOCUMENTOS */}

      <Route
        path="/documentos"
        element={
          <RutaProtegida>
            <Documentos />
          </RutaProtegida>
        }
      />


      {/* EVALUACIÓN DE RIESGO */}

      <Route
        path="/evaluacion-riesgo"
        element={
          <RutaProtegida>
            <EvaluacionRiesgo />
          </RutaProtegida>
        }
      />


      {/* REPORTES */}

      <Route
        path="/reportes"
        element={
          <RutaProtegida>
            <Reportes />
          </RutaProtegida>
        }
      />


      {/* GESTIÓN DE USUARIOS */}

      <Route
  path="/usuarios"
  element={
    <RutaProtegida
      rolesPermitidos={["ADMIN"]}
    >
      <Usuarios />
    </RutaProtegida>
  }

      />


      {/* RUTA NO EXISTENTE */}

      <Route
        path="*"
        element={
          <Navigate
            to="/"
            replace
          />
        }
      />

    </Routes>

  );

}


export default App;