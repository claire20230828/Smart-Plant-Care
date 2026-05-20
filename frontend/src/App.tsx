import { BrowserRouter, Routes, Route } from "react-router-dom";
import DashboardPage from "./pages/DashboardPage";
import MyPlantsPage from "./pages/MyPlantsPage";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/plants" element={<MyPlantsPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;