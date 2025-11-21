import React, { useState, useEffect } from "react";
import SideBar from "../../components/SideBar/SideBar";
import axios from "axios";
import {
  IoClose,
  IoMenu,
  IoSearchOutline,
  IoFilterOutline,
} from "react-icons/io5";
import { SlBell } from "react-icons/sl";
import {
  MdPendingActions,
  MdCheckCircle,
  MdCancel,
  MdLocalShipping,
  MdRefresh,
} from "react-icons/md";
import { BiPackage } from "react-icons/bi";

const Orders = () => {
  const [openNav, setOpenNav] = useState(false);
  const [overLay, setOvevrLay] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [managerData, setManagerData] = useState(null);

  // Fetch manager data
  useEffect(() => {
    const fetchManagerData = async () => {
      try {
        const managerId = localStorage.getItem("managerId");
        if (!managerId) {
          setError("Manager not found. Please login again.");
          return;
        }

        const response = await axios.get(
          `${import.meta.env.VITE_REACT_APP_API}/api/managers/${managerId}`
        );
        setManagerData(response.data);
      } catch (err) {
        console.error("Error fetching manager data:", err);
        setError("Failed to load manager data");
      }
    };
    fetchManagerData();
  }, []);

  // Fetch orders
  useEffect(() => {
    const fetchOrders = async () => {
      if (!managerData?.university) return;

      try {
        setLoading(true);
        const response = await axios.get(
          `${import.meta.env.VITE_REACT_APP_API}/api/users/orders`
        );

        // Filter orders by manager's university
        const filteredOrders = response.data.filter(
          (order) => order.university === managerData.university
        );

        setOrders(filteredOrders);
        setError("");
      } catch (err) {
        console.error("Error fetching orders:", err);
        setError("Failed to load orders");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [managerData]);

  // Refresh orders
  const handleRefresh = () => {
    if (managerData) {
      setLoading(true);
      axios
        .get(`${import.meta.env.VITE_REACT_APP_API}/api/users/orders`)
        .then((response) => {
          const filteredOrders = response.data.filter(
            (order) => order.university === managerData.university
          );
          setOrders(filteredOrders);
          setError("");
        })
        .catch((err) => {
          console.error("Error refreshing orders:", err);
          setError("Failed to refresh orders");
        })
        .finally(() => setLoading(false));
    }
  };

  // Filter orders by status and search
  const getFilteredOrders = () => {
    let filtered = orders;

    // Filter by tab
    if (activeTab !== "all") {
      filtered = filtered.filter((order) => {
        if (activeTab === "pending") return order.status === "pending";
        if (activeTab === "transit")
          return order.status === "in-transit" || order.status === "in transit";
        if (activeTab === "completed")
          return order.status === "delivered" || order.status === "completed";
        if (activeTab === "declined")
          return order.status === "cancelled" || order.status === "declined";
        return true;
      });
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (order) =>
          order._id?.toLowerCase().includes(query) ||
          order.orderNumber?.toLowerCase().includes(query) ||
          order.customerName?.toLowerCase().includes(query) ||
          order.vendorName?.toLowerCase().includes(query) ||
          order.riderName?.toLowerCase().includes(query)
      );
    }

    return filtered;
  };

  const filteredOrders = getFilteredOrders();

  // Calculate stats
  const stats = [
    {
      title: "Total Orders",
      value: orders.length.toString(),
      icon: <BiPackage size={24} />,
      color: "bg-blue-500",
      bgLight: "bg-blue-50",
      textColor: "text-blue-600",
    },
    {
      title: "Pending",
      value: orders.filter((o) => o.status === "pending").length.toString(),
      icon: <MdPendingActions size={24} />,
      color: "bg-amber-500",
      bgLight: "bg-amber-50",
      textColor: "text-amber-600",
    },
    {
      title: "In Transit",
      value: orders
        .filter((o) => o.status === "in-transit" || o.status === "in transit")
        .length.toString(),
      icon: <MdLocalShipping size={24} />,
      color: "bg-purple-500",
      bgLight: "bg-purple-50",
      textColor: "text-purple-600",
    },
    {
      title: "Completed",
      value: orders
        .filter((o) => o.status === "delivered" || o.status === "completed")
        .length.toString(),
      icon: <MdCheckCircle size={24} />,
      color: "bg-green-500",
      bgLight: "bg-green-50",
      textColor: "text-green-600",
    },
    {
      title: "Declined",
      value: orders
        .filter((o) => o.status === "cancelled" || o.status === "declined")
        .length.toString(),
      icon: <MdCancel size={24} />,
      color: "bg-red-500",
      bgLight: "bg-red-50",
      textColor: "text-red-600",
    },
  ];

  const tabs = [
    { id: "all", label: "All Orders", count: orders.length },
    {
      id: "pending",
      label: "Pending",
      count: orders.filter((o) => o.status === "pending").length,
    },
    {
      id: "transit",
      label: "In Transit",
      count: orders.filter(
        (o) => o.status === "in-transit" || o.status === "in transit"
      ).length,
    },
    {
      id: "completed",
      label: "Completed",
      count: orders.filter(
        (o) => o.status === "delivered" || o.status === "completed"
      ).length,
    },
    {
      id: "declined",
      label: "Declined",
      count: orders.filter(
        (o) => o.status === "cancelled" || o.status === "declined"
      ).length,
    },
  ];

  // Get status badge
  const getStatusBadge = (status) => {
    const statusLower = status?.toLowerCase() || "";

    if (statusLower === "pending") {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 border border-amber-200">
          <MdPendingActions size={14} />
          Pending
        </span>
      );
    }
    if (statusLower === "in-transit" || statusLower === "in transit") {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-700 border border-purple-200">
          <MdLocalShipping size={14} />
          In Transit
        </span>
      );
    }
    if (statusLower === "delivered" || statusLower === "completed") {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 border border-green-200">
          <MdCheckCircle size={14} />
          Completed
        </span>
      );
    }
    if (statusLower === "cancelled" || statusLower === "declined") {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700 border border-red-200">
          <MdCancel size={14} />
          Cancelled
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-200">
        {status}
      </span>
    );
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins} min${diffMins !== 1 ? "s" : ""} ago`;
    if (diffHours < 24)
      return `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? "s" : ""} ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="flex w-full relative bg-gray-50 min-h-screen">
      {openNav && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={() => setOpenNav(false)}
        />
      )}

      <div
        className={`
          fixed top-0 left-0 h-screen z-50 transform transition-transform duration-300
          ${openNav ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0 w-[270px] md:w-[240px]
        `}
      >
        <SideBar setOpenNav={setOpenNav} />
      </div>

      <div className="flex-1 md:ml-[240px] w-full overflow-y-auto">
        {/* Header Section */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
          <div className="md:px-6 px-5 py-4">
            <div className="flex items-center justify-between">
              <div className="flex gap-4 items-center">
                <div
                  className="md:hidden flex bg-gray-100 rounded-lg p-2.5 cursor-pointer hover:bg-gray-200 transition-colors"
                  onClick={() => setOpenNav(true)}
                >
                  <IoMenu size={20} />
                </div>
                <div>
                  <h1 className="font-bold text-2xl text-gray-800">
                    Order Management
                  </h1>
                  <p className="text-sm text-gray-500 mt-0.5">
                    Track and manage all delivery orders{" "}
                    {managerData?.university && `for ${managerData.university}`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleRefresh}
                  disabled={loading}
                  className="hidden md:flex items-center gap-2 px-4 py-2 bg-[var(--default)] text-white rounded-lg hover:opacity-90 transition-opacity text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <MdRefresh
                    size={18}
                    className={loading ? "animate-spin" : ""}
                  />
                  <span>Refresh</span>
                </button>
                <div className="relative">
                  <div className="bg-gray-100 p-2.5 rounded-lg cursor-pointer hover:bg-gray-200 transition-colors">
                    <SlBell size={20} className="text-gray-700" />
                  </div>
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                    {orders.filter((o) => o.status === "pending").length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="md:p-6 p-5">
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--default)]"></div>
            </div>
          )}

          {!loading && (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
                {stats.map((stat, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-xl p-4 border border-gray-200 hover:shadow-lg transition-all duration-300 cursor-pointer group"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm text-gray-600 font-medium mb-1">
                          {stat.title}
                        </p>
                        <h3 className="text-2xl font-bold text-gray-800 mb-2">
                          {stat.value}
                        </h3>
                      </div>
                      <div
                        className={`${stat.bgLight} ${stat.textColor} p-3 rounded-lg group-hover:scale-110 transition-transform`}
                      >
                        {stat.icon}
                      </div>
                    </div>
                    <div
                      className={`h-1.5 ${stat.color} rounded-full mt-3 opacity-20`}
                    ></div>
                  </div>
                ))}
              </div>

              {/* Search and Filter Bar */}
              <div className="bg-white rounded-xl p-4 border border-gray-200 mb-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 relative">
                    <IoSearchOutline
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                      size={20}
                    />
                    <input
                      type="text"
                      placeholder="Search by Order ID, Customer, Vendor or Rider..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--default)] focus:border-transparent text-sm"
                    />
                  </div>
                  <button className="flex items-center justify-center gap-2 px-5 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700">
                    <IoFilterOutline size={18} />
                    <span className="hidden md:inline">Filters</span>
                  </button>
                </div>
              </div>

              {/* Tabs */}
              <div className="bg-white rounded-xl border border-gray-200 mb-6 overflow-hidden">
                <div className="flex overflow-x-auto scrollbar-hide border-b border-gray-200">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-2 px-6 py-4 font-medium text-sm whitespace-nowrap transition-all border-b-2 ${
                        activeTab === tab.id
                          ? "border-[var(--default)] text-[var(--default)] bg-orange-50"
                          : "border-transparent text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                      }`}
                    >
                      <span>{tab.label}</span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                          activeTab === tab.id
                            ? "bg-[var(--default)] text-white"
                            : "bg-gray-200 text-gray-600"
                        }`}
                      >
                        {tab.count}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                          Order Details
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                          Customer
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                          Vendor
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                          Rider
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                          Amount
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredOrders.length === 0 ? (
                        <tr>
                          <td colSpan="7" className="px-6 py-12 text-center">
                            <div className="flex flex-col items-center gap-3">
                              <BiPackage size={48} className="text-gray-300" />
                              <p className="text-gray-500 font-medium">
                                No orders found
                              </p>
                              <p className="text-sm text-gray-400">
                                {searchQuery
                                  ? "Try adjusting your search"
                                  : `No orders for ${
                                      managerData?.university ||
                                      "your university"
                                    }`}
                              </p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        filteredOrders.map((order) => (
                          <tr
                            key={order._id}
                            className="hover:bg-gray-50 transition-colors"
                          >
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div
                                  className={`p-2 rounded-lg ${
                                    order.status === "delivered" ||
                                    order.status === "completed"
                                      ? "bg-green-100"
                                      : order.status === "in-transit" ||
                                        order.status === "in transit"
                                      ? "bg-purple-100"
                                      : order.status === "pending"
                                      ? "bg-blue-100"
                                      : "bg-gray-100"
                                  }`}
                                >
                                  <BiPackage
                                    className={`${
                                      order.status === "delivered" ||
                                      order.status === "completed"
                                        ? "text-green-600"
                                        : order.status === "in-transit" ||
                                          order.status === "in transit"
                                        ? "text-purple-600"
                                        : order.status === "pending"
                                        ? "text-blue-600"
                                        : "text-gray-600"
                                    }`}
                                    size={20}
                                  />
                                </div>
                                <div>
                                  <div className="text-sm font-bold text-gray-900">
                                    #{order.orderNumber || order._id?.slice(-8)}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {order.createdAt
                                      ? formatDate(order.createdAt)
                                      : "Recently"}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm font-medium text-gray-900">
                                {order.customerName ||
                                  order.userId?.name ||
                                  "N/A"}
                              </div>
                              <div className="text-xs text-gray-500">
                                {order.university || managerData?.university}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-gray-900">
                                {order.vendorName ||
                                  order.vendorId?.storeName ||
                                  "N/A"}
                              </div>
                              <div className="text-xs text-gray-500">
                                {order.vendorCategory || "Vendor"}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              {order.riderName || order.riderId ? (
                                <div className="flex items-center gap-2">
                                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold text-xs">
                                    {(
                                      order.riderName ||
                                      order.riderId?.name ||
                                      "R"
                                    )
                                      ?.charAt(0)
                                      .toUpperCase()}
                                  </div>
                                  <div className="text-sm text-gray-900">
                                    {order.riderName || order.riderId?.name}
                                  </div>
                                </div>
                              ) : (
                                <span className="text-sm text-gray-400">
                                  Not assigned
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm font-semibold text-gray-900">
                                ₦{order.totalAmount || order.total || "0.00"}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              {getStatusBadge(order.status)}
                            </td>
                            <td className="px-6 py-4">
                              {order.status === "pending" ? (
                                <button
                                  onClick={() => setOvevrLay(true)}
                                  className="px-4 py-2 rounded-lg bg-red-500 text-xs text-white font-semibold hover:bg-red-600 transition-colors shadow-sm"
                                >
                                  Reassign
                                </button>
                              ) : order.status === "in-transit" ||
                                order.status === "in transit" ? (
                                <button className="px-4 py-2 rounded-lg bg-blue-500 text-xs text-white font-semibold hover:bg-blue-600 transition-colors shadow-sm">
                                  Track
                                </button>
                              ) : (
                                <button className="px-4 py-2 rounded-lg bg-gray-100 text-xs text-gray-700 font-semibold hover:bg-gray-200 transition-colors">
                                  Details
                                </button>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between bg-gray-50">
                  <div className="text-sm text-gray-600">
                    Showing{" "}
                    <span className="font-semibold">
                      {filteredOrders.length}
                    </span>{" "}
                    of <span className="font-semibold">{orders.length}</span>{" "}
                    orders
                  </div>
                  <div className="flex gap-2">
                    <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                      Previous
                    </button>
                    <button className="px-4 py-2 bg-[var(--default)] text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
                      Next
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Reassign Modal */}
      {overLay && (
        <div className="flex items-center justify-center fixed bg-black/60 backdrop-blur-sm z-50 inset-0">
          <div className="bg-white rounded-2xl shadow-2xl w-[95%] max-w-md p-6 transform transition-all animate-fadeIn">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-3">
                <div className="bg-red-100 p-2 rounded-lg">
                  <MdRefresh className="text-red-600" size={22} />
                </div>
                <h1 className="font-bold text-xl text-gray-800">
                  Reassign Order
                </h1>
              </div>
              <button
                onClick={() => setOvevrLay(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <IoClose size={24} className="text-gray-600" />
              </button>
            </div>

            <p className="text-sm text-gray-600 mb-5 pl-1">
              Select a new rider to handle this delivery order
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Available Riders
                </label>
                <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--default)] focus:border-transparent text-sm bg-white">
                  <option value="">Select a rider...</option>
                  <option value="1">
                    Obaloluwa - {managerData?.university} (5★)
                  </option>
                  <option value="2">
                    Akinola - {managerData?.university} (4.8★)
                  </option>
                  <option value="3">
                    Tunde - {managerData?.university} (4.9★)
                  </option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Reason for Reassignment (Optional)
                </label>
                <textarea
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--default)] focus:border-transparent text-sm resize-none"
                  rows="3"
                  placeholder="Enter reason..."
                ></textarea>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setOvevrLay(false)}
                className="flex-1 px-5 py-3 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button className="flex-1 px-5 py-3 bg-[var(--default)] text-white rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity shadow-md">
                Confirm Reassign
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
