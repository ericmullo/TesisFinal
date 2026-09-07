import { Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Clientes from "./pages/Clientes";
import Solicitudes from "./pages/Solicitudes";
import Documentos from "./pages/Documentos";
import EvaluacionRiesgo from "./pages/EvaluacionRiesgo";
import Reportes from "./pages/Reportes";

function App() {
  return (
    <Routes>
      {/* La página inicial siempre será Login */}
      <Route path="/" element={<Login />} />

      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/clientes" element={<Clientes />} />
      <Route path="/solicitudes" element={<Solicitudes />} />
      <Route path="/documentos" element={<Documentos />} />
      <Route
        path="/evaluacion-riesgo"
        element={<EvaluacionRiesgo />}
      />
      <Route path="/reportes" element={<Reportes />} />

      {/* Si escriben una ruta que no existe, vuelve al login */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;