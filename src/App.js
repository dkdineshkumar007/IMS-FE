import { Route, Routes, useLocation } from "react-router-dom";
import Navbar from "./Main/Navbar";
import Homepage from "./Main/pages/Homepage";
import Products from "./Main/pages/Products";
import Inventory from "./Main/pages/Inventory";
import Po from "./Main/pages/PurchaseOrders";
import Orders from "./Main/pages/Orders";
import Profile from "./Main/pages/settings/Profile";
import Users from "./Main/pages/settings/Users";
import Login from "./Main/pages/settings/Login";
import Query from "./Main/pages/Query";

function App() {
  const location = useLocation();

  const showNavbar = location.pathname !== "/login";
  return (
    <div className="App h-[100vh] relative">
      {showNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/homepage" element={<Homepage />} />
        <Route path="/product" element={<Products />} />
        <Route path="/inventory" element={<Inventory />} />
        <Route path="/purchase-orders" element={<Po />} />
        <Route path="/online-orders" element={<Orders />} />
        <Route path="/users" element={<Users />} />
        <Route path="/login" element={<Login />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/query" element={<Query/>}/>
      </Routes>
    </div>
  );
}

export default App;
