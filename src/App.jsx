import { useState, useEffect } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import { Route, Routes, Navigate } from "react-router-dom";
import Login from "./Pages/Login/Login";
import SignUp from "./Pages/SignUp/SignUp";
import Orders from "./Pages/Orders/Orders";
import Products from "./Pages/Products/Products";
import Approvals from "./Pages/Approvals/Approvals";
import UniversitySelect from "./Pages/UniversitySelect";

function App() {
  const managerId = localStorage.getItem("managerId");

  return (
    <Routes>
      {managerId ? (
        <Route path="/" element={<Orders />} />
      ) : (
        <Route path="/" element={<Login />} />
      )}
      <Route path="/" />
      <Route path="/login" element={<Login />} />
      <Route path="/select-uni" element={<UniversitySelect />} />
      <Route path="/sign-up" element={<SignUp />} />
      <Route path="/approvals" element={<Approvals />} />
      <Route path="/order" element={<Orders />} />
      <Route path="/products" element={<Products />} />
    </Routes>
  );
}

export default App;
