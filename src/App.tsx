import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Calculator from "./components/Calculator";
import LoginForm from "./components/LoginForm";
import RegisterForm from "./components/RegisterForm";
import HomePage from "./components/HomePage.tsx";
import Dashboard from "./components/Dashboard";
import './App.css'
import { AuthProvider } from "./components/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import ImcHistorial from "./components/ImcHistorial";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginForm />} />
          <Route path="/register" element={<RegisterForm />} />
          {/* Rutas protegidas */}
          <Route element={<ProtectedRoute />}>
            <Route path="/calculator" element={<Calculator />} />
            <Route path="/historial" element={<ImcHistorial />} />
            <Route path="/estadisticas" element={<Dashboard />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App
