import { Route, Routes } from "react-router-dom";
import Navbar from "./Main/Navbar";
import Homepage from "./Main/pages/Homepage";
import Products from "./Main/pages/Products";
import Inventory from "./Main/pages/Inventory";
import Po from "./Main/pages/PurchaseOrders";

function App() {
  return (
    <div className="App h-[100vh]">
      <Navbar />
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/homepage" element={<Homepage />} />
        <Route path="/product" element={<Products />} />
        <Route path="/inventory" element={<Inventory />} />
        <Route path="/purchase-orders" element={<Po />} />
      </Routes>
    </div>
  );
}

export default App;
