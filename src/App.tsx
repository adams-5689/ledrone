import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Header from "./components/Header";
import Home from "./pages/Home";
import News from "./pages/News";
import Marketplace from "./pages/Marketplace";
import Login from "./pages/Login";
import Registration from "./pages/Registration";

const App: React.FC = () => {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Header />
        <main>
          <Routes>
            < Route path="/" element={<Home />} />
            < Route path="/news" element={<News />} />
            < Route path="/marketplace" element={<Marketplace />} />
            < Route path="/Login" element={<Login />} />
            < Route path="/registration" element={<Registration />} />
            
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;
