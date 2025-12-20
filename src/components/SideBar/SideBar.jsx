import React, { useEffect, useMemo, useState, useCallback } from "react";
import axios from "axios";
import { GrAppsRounded } from "react-icons/gr";
import { LuNewspaper } from "react-icons/lu";
import { GrHistory } from "react-icons/gr";
import { AiOutlineClose } from "react-icons/ai";
import { useNavigate, useLocation } from "react-router-dom";
import { CiLogout } from "react-icons/ci";
import {
  MdDashboard,
  MdShoppingCart,
  MdPeople,
  MdSettings,
  MdNotifications,
  MdHelp,
} from "react-icons/md";
import { BiPackage } from "react-icons/bi";
import { useSocket } from "../../context/SocketContext.jsx";

const SideBar = ({ setOpenNav }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const pathToItem = {
    "/order": "order",
    "/products": "products",
    "/customers": "customers",
    "/approvals": "approvals",
    "/settings": "settings",
  };

  const selectedItem =
    pathToItem[location.pathname] ||
    (location.pathname.startsWith("/products") ? "products" : "order");
  const [managerName, setManagerName] = useState("Manager");
  const [managerData, setManagerData] = useState(null);
  const [ordersCountTotal, setOrdersCountTotal] = useState(0);
  const [ordersCountPending, setOrdersCountPending] = useState(0);
  const { socket } = useSocket?.() || {};

  // Fetch manager details
  useEffect(() => {
    const fetchManager = async () => {
      try {
        const managerId = localStorage.getItem("managerId");
        if (!managerId) return;
        const res = await axios.get(
          `${import.meta.env.VITE_REACT_APP_API}/api/managers/${managerId}`
        );
        setManagerData(res.data);
        if (res.data?.managerName) setManagerName(res.data.managerName);
      } catch (e) {
        // fail silent in sidebar
        console.error("Sidebar: failed to fetch manager", e);
      }
    };
    fetchManager();
  }, []);

  // Load orders counts scoped by selected university
  const loadOrdersCounts = useCallback(async () => {
    const selectedUniversity = localStorage.getItem("selectedUniversity");
    if (!selectedUniversity) return;
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_REACT_APP_API}/api/users/orders`
      );
      const raw = res.data?.orders || res.data || [];
      const uniOrders = raw.filter(
        (o) =>
          (o.university || "").toLowerCase() ===
          selectedUniversity.toLowerCase()
      );
      setOrdersCountTotal(uniOrders.length);
      const pending = uniOrders.filter(
        (o) => (o.status || o.currentStatus || "").toLowerCase() === "pending"
      ).length;
      setOrdersCountPending(pending);
    } catch (e) {
      console.error("Sidebar: failed to fetch orders", e);
    }
  }, []);

  // Initial + on university change
  useEffect(() => {
    loadOrdersCounts();
  }, [loadOrdersCounts]);

  // Realtime updates via socket
  useEffect(() => {
    if (!socket) return;
    const handler = () => loadOrdersCounts();
    socket.on("orders:new", handler);
    socket.on("orders:status", handler);
    socket.on("orders:assignRider", handler);
    socket.on("vendors:packsUpdated", handler);
    return () => {
      socket.off("orders:new", handler);
      socket.off("orders:status", handler);
      socket.off("orders:assignRider", handler);
      socket.off("vendors:packsUpdated", handler);
    };
  }, [socket, loadOrdersCounts]);

  const menuItems = useMemo(
    () => [
      {
        id: "order",
        label: "Orders",
        icon: <BiPackage size={20} />,
        path: "/order",
        badge:
          ordersCountPending > 0
            ? String(ordersCountPending)
            : ordersCountTotal > 0
            ? String(ordersCountTotal)
            : undefined,
      },
      {
        id: "products",
        label: "Products",
        icon: <MdShoppingCart size={20} />,
        path: "/products",
      },
      {
        id: "approvals",
        label: "Approvals",
        icon: <MdPeople size={20} />,
        path: "/approvals",
      },
    ],
    [ordersCountPending, ordersCountTotal]
  );

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to sign out?")) {
      localStorage.clear();
      window.location.replace("/");
    }
  };

  // Add a button to go back to university select
  const handleUniversityChange = () => {
    // Remove selected university from localStorage and redirect
    localStorage.removeItem("selectedUniversity");
    localStorage.removeItem("selectedUniversityId");
    navigate("/select-uni");
    if (setOpenNav) setOpenNav(false);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}

      {/* User Profile Section */}
      <div className="p-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-orange-600 font-bold text-lg shadow-md">
            {managerName?.charAt(0) || "M"}
          </div>
          <div>
            <h3 className="font-bold text-sm">Welcome Back!</h3>
            <p className="text-xs opacity-90">{managerName}</p>
            <p className="text-xs opacity-90">
              {localStorage.getItem("selectedUniversity")}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-3 mt-2">
        <div className="space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                if (!item.disabled) {
                  navigate(item.path);
                  setOpenNav?.(false);
                }
              }}
              disabled={item.disabled}
              className={`
                w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group
                ${
                  selectedItem === item.id
                    ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/30 scale-[1.02]"
                    : item.disabled
                    ? "text-gray-400 cursor-not-allowed opacity-60"
                    : "text-gray-700 hover:bg-orange-50 hover:text-orange-600"
                }
              `}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`
                  ${
                    selectedItem === item.id
                      ? "text-white"
                      : item.disabled
                      ? "text-gray-400"
                      : "text-gray-600 group-hover:text-orange-600"
                  }
                `}
                >
                  {item.icon}
                </div>
                <span className="font-medium text-sm">{item.label}</span>
              </div>
              {item.badge && !item.disabled && (
                <span
                  className={`
                  px-2 py-0.5 rounded-full text-xs font-bold
                  ${
                    selectedItem === item.id
                      ? "bg-white text-orange-600"
                      : "bg-orange-100 text-orange-600"
                  }
                `}
                >
                  {item.badge}
                </span>
              )}
              {item.disabled && (
                <span className="text-xs bg-gray-200 text-gray-500 px-2 py-0.5 rounded-full font-medium">
                  Soon
                </span>
              )}
            </button>
          ))}
        </div>
      </nav>

      {/* Footer - Logout */}
      <div className="p-3 border-t border-gray-200 bg-white">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl text-red-600 bg-red-50 hover:bg-red-100 transition-all duration-200 group hover:shadow-md"
        >
          <CiLogout
            size={22}
            className="group-hover:scale-110 transition-transform"
          />
          <span className="font-semibold text-sm">Sign Out</span>
        </button>

        {/* Version Info */}
        <div className="text-center mt-3">
          <p className="text-xs text-gray-400">Manager Portal v1.0</p>
        </div>
      </div>

      {/* Change University Button - Moved to bottom */}
      <div className="p-4 border-t border-gray-200 bg-white mt-auto">
        <button
          onClick={handleUniversityChange}
          className="w-full px-4 cursor-pointer py-2 rounded bg-blue-100 text-blue-700 text-sm font-semibold hover:bg-blue-200 transition-colors"
          title="Change University"
        >
          Change University
        </button>
      </div>
    </div>
  );
};

export default SideBar;
