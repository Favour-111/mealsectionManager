import React, { useEffect, useState } from "react";
import axios from "axios";
import SideBar from "../../components/SideBar/SideBar";
import { IoMenu } from "react-icons/io5";

const Approvals = () => {
  const [vendors, setVendors] = useState([]);
  const [riders, setRiders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refresh, setRefresh] = useState(false);
  const [openNav, setOpenNav] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [vendorRes, riderRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_REACT_APP_API}/api/vendors/all`),
          axios.get(
            `${import.meta.env.VITE_REACT_APP_API}/api/riders/allRiders`
          ),
        ]);
        const selectedUniversity = localStorage.getItem("selectedUniversity");
        setVendors(
          (vendorRes.data || []).filter(
            (v) =>
              (v.university || "").toLowerCase() ===
              (selectedUniversity || "").toLowerCase()
          )
        );
        setRiders(
          (riderRes.data || []).filter(
            (r) =>
              (r.university || "").toLowerCase() ===
              (selectedUniversity || "").toLowerCase()
          )
        );
        setError("");
      } catch (e) {
        setError("Failed to fetch approvals list");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [refresh]);

  const handleApprove = async (type, id, approve) => {
    try {
      setLoading(true);
      await axios.patch(
        `${import.meta.env.VITE_REACT_APP_API}/api/${
          type === "vendor" ? "vendors" : "riders"
        }/${id}/approve`,
        { valid: approve }
      );
      setRefresh((r) => !r);
    } catch {
      setError("Failed to update status");
      setLoading(false);
    }
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
                    Pending Approvals
                  </h1>
                  <p className="text-sm text-gray-500 mt-0.5">
                    Approve or reject new vendors and riders
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="md:p-6 p-5">
          {error && (
            <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
              {error}
            </div>
          )}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--default)]"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h2 className="text-lg font-bold mb-4 text-gray-700">
                  Vendors
                </h2>
                <ul className="space-y-3">
                  {vendors.length === 0 && (
                    <li className="text-gray-400 text-sm bg-white border border-gray-100 rounded-lg p-4 text-center">
                      No vendors found
                    </li>
                  )}
                  {vendors.map((v) => (
                    <li
                      key={v._id}
                      className="bg-white rounded-xl border border-gray-200 p-5 flex items-center justify-between group hover:shadow-lg transition-all duration-300"
                    >
                      <div>
                        <div
                          className="font-semibold text-gray-900 text-base mb-0.5 truncate max-w-[180px]"
                          title={v.storeName}
                        >
                          {v.storeName}
                        </div>
                        <div className="text-gray-500 text-xs mb-0.5">
                          {v.email}
                        </div>
                        <div className="text-gray-400 text-xs">
                          {v.university}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2 min-w-[110px]">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold border 
                          ${
                            v.valid === true
                              ? "bg-green-100 text-green-700 border-green-200"
                              : v.valid === false
                              ? "bg-red-100 text-red-700 border-red-200"
                              : "bg-yellow-100 text-yellow-700 border-yellow-200"
                          }
                        `}
                        >
                          {v.valid === true
                            ? "Approved"
                            : v.valid === false
                            ? "Rejected"
                            : "Pending"}
                        </span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleApprove("vendor", v._id, true)}
                            className="px-4 py-2 rounded-lg bg-green-500 text-white text-xs font-semibold shadow-sm hover:bg-green-600 focus:ring-2 focus:ring-green-300 focus:outline-none transition-all"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() =>
                              handleApprove("vendor", v._id, false)
                            }
                            className="px-4 py-2 rounded-lg bg-red-500 text-white text-xs font-semibold shadow-sm hover:bg-red-600 focus:ring-2 focus:ring-red-300 focus:outline-none transition-all"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h2 className="text-lg font-bold mb-4 text-gray-700">Riders</h2>
                <ul className="space-y-3">
                  {riders.length === 0 && (
                    <li className="text-gray-400 text-sm bg-white border border-gray-100 rounded-lg p-4 text-center">
                      No riders found
                    </li>
                  )}
                  {riders.map((r) => (
                    <li
                      key={r._id}
                      className="bg-white rounded-xl border border-gray-200 p-5 flex items-center justify-between group hover:shadow-lg transition-all duration-300"
                    >
                      <div>
                        <div
                          className="font-semibold text-gray-900 text-base mb-0.5 truncate max-w-[180px]"
                          title={r.userName}
                        >
                          {r.userName}
                        </div>
                        <div className="text-gray-500 text-xs mb-0.5">
                          {r.email}
                        </div>
                        <div className="text-gray-400 text-xs">
                          {r.university}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2 min-w-[110px]">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold border 
                          ${
                            r.valid === true
                              ? "bg-green-100 text-green-700 border-green-200"
                              : r.valid === false
                              ? "bg-red-100 text-red-700 border-red-200"
                              : "bg-yellow-100 text-yellow-700 border-yellow-200"
                          }
                        `}
                        >
                          {r.valid === true
                            ? "Approved"
                            : r.valid === false
                            ? "Rejected"
                            : "Pending"}
                        </span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleApprove("rider", r._id, true)}
                            className="px-4 py-2 rounded-lg bg-green-500 text-white text-xs font-semibold shadow-sm hover:bg-green-600 focus:ring-2 focus:ring-green-300 focus:outline-none transition-all"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleApprove("rider", r._id, false)}
                            className="px-4 py-2 rounded-lg bg-red-500 text-white text-xs font-semibold shadow-sm hover:bg-red-600 focus:ring-2 focus:ring-red-300 focus:outline-none transition-all"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Approvals;
