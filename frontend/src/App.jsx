import { Routes, Route } from "react-router-dom";

import Sidebar from "./components/Sidebar";

import Dashboard from "./pages/Dashboard";
import CLV from "./pages/CLV";
import Segments from "./pages/Segments";
import Recommendations from "./pages/Recommendations";
import Forecast from "./pages/Forecast";
import Ask from "./pages/Ask";
import DataUpload from "./pages/DataUpload";

export default function App() {
  return (
    <div className="app-shell">

      <Sidebar />

      <main className="content">

        <Routes>

          <Route
            path="/"
            element={<Dashboard />}
          />

          <Route
            path="/clv"
            element={<CLV />}
          />

          <Route
            path="/segments"
            element={<Segments />}
          />

          <Route
            path="/recommendations"
            element={<Recommendations />}
          />

          <Route
            path="/forecast"
            element={<Forecast />}
          />

          <Route
            path="/ask"
            element={<Ask />}
          />

          <Route
            path="/data-center"
            element={<DataUpload />}
          />

        </Routes>

      </main>

    </div>
  );
}