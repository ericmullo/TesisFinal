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

import RutaProtegida from "./components/RutaProtegida";


function App() {

  return (

    <Routes>

      {/* ================================================= */}
      {/* LOGIN - RUTA PÚBLICA */}
      {/* ================================================= */}

      <Route
        path="/"
        element={<Login />}
      />


      {/* ================================================= */}
      {/* DASHBOARD - PROTEGIDO */}
      {/* ================================================= */}

      <Route
        path="/dashboard"
        element={
          <RutaProtegida>
            <Dashboard />
          </RutaProtegida>
        }
      />


      {/* ================================================= */}
      {/* CLIENTES - PROTEGIDO */}
      {/* ================================================= */}

      <Route
        path="/clientes"
        element={
          <RutaProtegida>
            <Clientes />
          </RutaProtegida>
        }
      />


      {/* ================================================= */}
      {/* SOLICITUDES - PROTEGIDO */}
      {/* ================================================= */}

      <Route
        path="/solicitudes"
        element={
          <RutaProtegida>
            <Solicitudes />
          </RutaProtegida>
        }
      />


      {/* ================================================= */}
      {/* DOCUMENTOS - PROTEGIDO */}
      {/* ================================================= */}

      <Route
        path="/documentos"
        element={
          <RutaProtegida>
            <Documentos />
          </RutaProtegida>
        }
      />


      {/* ================================================= */}
      {/* EVALUACIÓN DE RIESGO - PROTEGIDO */}
      {/* ================================================= */}

      <Route
        path="/evaluacion-riesgo"
        element={
          <RutaProtegida>
            <EvaluacionRiesgo />
          </RutaProtegida>
        }
      />


      {/* ================================================= */}
      {/* REPORTES - PROTEGIDO */}
      {/* ================================================= */}

      <Route
        path="/reportes"
        element={
          <RutaProtegida>
            <Reportes />
          </RutaProtegida>
        }
      />


      {/* ================================================= */}
      {/* RUTA NO EXISTENTE */}
      {/* ================================================= */}

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