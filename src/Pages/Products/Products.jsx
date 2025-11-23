import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import {
  MdEdit,
  MdAdd,
  MdClose,
  MdSearch,
  MdStore,
  MdCategory,
} from "react-icons/md";
import { IoMenu } from "react-icons/io5";
import SideBar from "../../components/SideBar/SideBar";

function Products() {
  const managerId = localStorage.getItem("managerId");
  const [openNav, setOpenNav] = useState(false);
  const [manager, setManager] = useState(null);
  const [vendors, setVendors] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [vendorFilter, setVendorFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [editTarget, setEditTarget] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form state for add/edit
  const [form, setForm] = useState({
    vendorId: "",
    title: "",
    price: "",
    category: "Carbohydrate",
    image: "",
  });

  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        // Fetch manager
        if (managerId) {
          const mRes = await axios.get(
            `${import.meta.env.VITE_REACT_APP_API}/api/managers/${managerId}`
          );
          setManager(mRes.data);
        }
        // Fetch vendors
        const vRes = await axios.get(
          `${import.meta.env.VITE_REACT_APP_API}/api/vendors/all`
        );
        setVendors(vRes.data || []);
        // Fetch products
        const pRes = await axios.get(
          `${import.meta.env.VITE_REACT_APP_API}/api/vendors/allProduct`
        );
        setProducts(
          Array.isArray(pRes.data) ? pRes.data : pRes.data?.products || []
        );
      } catch (e) {
        console.error("Failed to load products data", e);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [managerId]);

  // Vendors filtered by manager university
  const scopedVendors = useMemo(() => {
    if (!manager?.university) return [];
    return vendors.filter(
      (v) =>
        (v.university || "").toLowerCase() === manager.university.toLowerCase()
    );
  }, [vendors, manager]);

  // Map products joined with vendor info, scoped by university
  const scopedProducts = useMemo(() => {
    if (!manager?.university) return [];
    const uni = manager.university.toLowerCase();
    return products.filter((p) => {
      const v = vendors.find((vd) => String(vd._id) === String(p.vendorId));
      if (!v) return false;
      return (v.university || "").toLowerCase() === uni;
    });
  }, [products, vendors, manager]);

  // Apply vendor + search filters
  const visibleProducts = useMemo(() => {
    let list = scopedProducts;
    if (vendorFilter !== "all") {
      list = list.filter((p) => String(p.vendorId) === String(vendorFilter));
    }
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter((p) => p.title?.toLowerCase().includes(q));
    }
    return list;
  }, [scopedProducts, vendorFilter, search]);

  const openEdit = (product) => {
    setEditTarget(product);
    setForm({
      vendorId: product.vendorId,
      title: product.title,
      price: String(product.price),
      category: product.category,
      image: product.image,
    });
  };

  const openAdd = () => {
    setShowAdd(true);
    setEditTarget(null);
    setForm({
      vendorId: scopedVendors[0]?._id || "",
      title: "",
      price: "",
      category: "Carbohydrate",
      image: "",
    });
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (
      !form.vendorId ||
      !form.title ||
      !form.price ||
      !form.category ||
      !form.image
    ) {
      alert("All fields required");
      return;
    }
    try {
      setSaving(true);
      if (editTarget) {
        // edit
        const res = await axios.put(
          `${import.meta.env.VITE_REACT_APP_API}/api/vendors/edit/${
            editTarget._id
          }`,
          {
            vendorId: form.vendorId,
            title: form.title,
            price: Number(form.price),
            category: form.category,
            image: form.image,
          }
        );
        // Update local list
        setProducts((prev) =>
          prev.map((p) =>
            p._id === editTarget._id ? { ...p, ...res.data.updatedProduct } : p
          )
        );
        setEditTarget(null);
      } else {
        // add
        const res = await axios.post(
          `${import.meta.env.VITE_REACT_APP_API}/api/vendors/add`,
          {
            vendorId: form.vendorId,
            title: form.title,
            price: Number(form.price),
            category: form.category,
            image: form.image,
          }
        );
        const newProd = res.data.newProduct || res.data.product;
        if (newProd) setProducts((prev) => [newProd, ...prev]);
        setShowAdd(false);
      }
    } catch (e) {
      console.error("Save failed", e);
      alert(e.response?.data?.message || "Failed to save product");
    } finally {
      setSaving(false);
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
        {/* Top Bar */}
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
                    Product Management
                  </h1>
                  <p className="text-sm text-gray-500 mt-0.5">
                    Manage vendor products
                    {manager?.university ? ` for ${manager.university}` : ""}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={openAdd}
                  className="hidden md:inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--default)] text-white text-sm font-semibold hover:opacity-90"
                >
                  <MdAdd size={18} /> New Product
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Page Body */}
        <div className="md:p-6 p-5">
          {/* Filters */}
          <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm space-y-4">
            <div className="flex flex-col md:flex-row md:items-center md:gap-4 gap-3">
              <div className="flex-1 relative">
                <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by product title"
                  className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none"
                />
              </div>
              <div className="flex-1 flex items-center gap-2">
                <MdStore className="text-gray-500" />
                <select
                  value={vendorFilter}
                  onChange={(e) => setVendorFilter(e.target.value)}
                  className="flex-1 text-sm rounded-xl border border-gray-200 px-3 py-2 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none"
                >
                  <option value="all">All Vendors</option>
                  {scopedVendors.map((v) => (
                    <option key={v._id} value={v._id}>
                      {v.storeName}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="text-xs text-gray-500">
              Showing {visibleProducts.length} product(s)
              {vendorFilter !== "all" && ` for selected vendor`}.
            </div>
            {/* Mobile New Product button */}
            <div className="md:hidden">
              <button
                onClick={openAdd}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-[var(--default)] text-white text-sm font-semibold hover:opacity-90"
              >
                <MdAdd size={18} /> New Product
              </button>
            </div>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
            {loading ? (
              [...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="h-40 bg-gray-100 animate-pulse rounded-xl"
                />
              ))
            ) : visibleProducts.length === 0 ? (
              <div className="col-span-full flex flex-col items-center justify-center py-16 text-center border border-dashed border-gray-300 rounded-2xl">
                <p className="text-gray-600 font-semibold">No products found</p>
                <p className="text-xs text-gray-400 mt-1">
                  Try adjusting filters or add a new product.
                </p>
              </div>
            ) : (
              visibleProducts.map((p) => {
                const vendor = vendors.find(
                  (v) => String(v._id) === String(p.vendorId)
                );
                return (
                  <div
                    key={p._id}
                    className="group relative bg-white border border-gray-200 rounded-2xl p-4 flex flex-col shadow-sm hover:shadow-md transition"
                  >
                    <div className="flex items-start gap-3">
                      <img
                        src={p.image}
                        alt={p.title}
                        className="w-16 h-16 rounded-xl object-cover border"
                      />
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-gray-800 text-sm truncate">
                          {p.title}
                        </h3>
                        <p className="text-xs text-gray-500 truncate">
                          {vendor?.storeName} • {p.category}
                        </p>
                        <p className="text-sm font-bold text-orange-600 mt-1">
                          ₦{Number(p.price).toLocaleString()}
                        </p>
                        <span
                          className={`inline-flex mt-1 items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            p.available
                              ? "bg-green-100 text-green-600"
                              : "bg-red-100 text-red-600"
                          }`}
                        >
                          {p.available ? "Available" : "Unavailable"}
                        </span>
                      </div>
                    </div>
                    <div className="mt-3 flex justify-end">
                      <button
                        onClick={() => openEdit(p)}
                        className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg bg-gray-900 text-white hover:bg-black"
                      >
                        <MdEdit size={14} /> Edit
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Modal (Add/Edit) */}
      {(showAdd || editTarget) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => {
              setShowAdd(false);
              setEditTarget(null);
            }}
          />
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-gray-800 text-lg">
                {editTarget ? "Edit Product" : "Add Product"}
              </h2>
              <button
                onClick={() => {
                  setShowAdd(false);
                  setEditTarget(null);
                }}
                className="p-2 rounded-lg hover:bg-gray-100"
              >
                <MdClose size={18} />
              </button>
            </div>
            <div className="space-y-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-600 flex items-center gap-1">
                  <MdStore /> Vendor
                </label>
                <select
                  name="vendorId"
                  value={form.vendorId}
                  onChange={handleFormChange}
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none"
                >
                  <option value="">Select vendor</option>
                  {scopedVendors.map((v) => (
                    <option key={v._id} value={v._id}>
                      {v.storeName}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-600">
                  Title
                </label>
                <input
                  name="title"
                  value={form.title}
                  onChange={handleFormChange}
                  placeholder="e.g. Fried Rice"
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-600">
                  Price (₦)
                </label>
                <input
                  name="price"
                  type="number"
                  value={form.price}
                  onChange={handleFormChange}
                  placeholder="e.g. 1500"
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-600 flex items-center gap-1">
                  <MdCategory /> Category
                </label>
                <select
                  name="category"
                  value={form.category}
                  onChange={handleFormChange}
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none"
                >
                  <option value="Carbohydrate">Carbohydrate</option>
                  <option value="Protein">Protein</option>
                  <option value="Pastries">Pastries</option>
                  <option value="Drinks">Drinks</option>
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-600">
                  Image URL
                </label>
                <input
                  name="image"
                  value={form.image}
                  onChange={handleFormChange}
                  placeholder="https://..."
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none"
                />
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => {
                  setShowAdd(false);
                  setEditTarget(null);
                }}
                className="flex-1 px-4 py-2 rounded-lg border border-gray-300 text-sm font-semibold hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-orange-500 to-red-500 text-white text-sm font-semibold shadow hover:shadow-lg disabled:opacity-50"
              >
                {saving ? "Saving..." : editTarget ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Products;
