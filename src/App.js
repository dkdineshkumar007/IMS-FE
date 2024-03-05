import { Route, Routes } from "react-router-dom";
import Navbar from "./Main/Navbar";
import Homepage from "./Main/pages/Homepage";
import Products from "./Main/pages/Products";
import Inventory from "./Main/pages/Inventory";

function App() {
  return (
    <div className="App h-[100vh]">
      <Navbar />
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/homepage" element={<Homepage />} />
        <Route path="/product" element={<Products />} />
        <Route path="/inventory" element={<Inventory />} />
      </Routes>
    </div>
  );
}

export default App;
