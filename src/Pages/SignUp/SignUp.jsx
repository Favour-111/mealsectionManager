import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const SignUp = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    managerName: "",
    university: "",
  });
  const [universities, setUniversities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Fetch universities on component mount
  useEffect(() => {
    const fetchUniversities = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_REACT_APP_API}/api/universities`
        );
        setUniversities(response.data.universities || []);
      } catch (err) {
        console.error("Error fetching universities:", err);
        setError("Failed to load universities");
      }
    };
    fetchUniversities();
  }, []);

  const handleInput = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const submitForm = async () => {
    if (
      !formData.managerName ||
      !formData.email ||
      !formData.password ||
      !formData.university
    ) {
      setError("All fields are required");
      return;
    }

    try {
      setLoading(true);
      setError("");
      const response = await axios.post(
        `${import.meta.env.VITE_REACT_APP_API}/api/managers/signup`,
        formData
      );

      // Store managerId in localStorage
      if (response.data.manager && response.data.manager._id) {
        localStorage.setItem("managerId", response.data.manager._id);
      }

      setSuccess(response.data.message);
      setTimeout(() => {
        navigate("/order");
      }, 2000);
    } catch (err) {
      console.error("Signup error:", err);
      setError(
        err.response?.data?.message || "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="relative z-10 flex flex-col lg:flex-row min-h-screen">
        {/* Right - SignUp Card */}
        <div className=" w-full flex items-center justify-center p-2 lg:p-12">
          <div className="w-full max-w-md">
            <div className="bg-white rounded-sm shadow-2xl p-8 md:p-10 border border-gray-100">
              <div className="mb-6">
                <h2 className="text-3xl font-bold text-gray-800 mb-2">
                  Create Manager Account
                </h2>
                <p className="text-gray-500">
                  Fill in your details to continue
                </p>
              </div>

              {error && (
                <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                  {error}
                </div>
              )}
              {success && (
                <div className="mb-4 text-sm text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3">
                  {success}
                </div>
              )}

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  submitForm();
                }}
                className="space-y-6"
              >
                {/* Manager Name */}
                <div className="space-y-2">
                  <label
                    htmlFor="managerName"
                    className="block text-sm font-semibold text-gray-700"
                  >
                    Manager Name
                  </label>
                  <div className="relative">
                    <input
                      id="managerName"
                      name="managerName"
                      onChange={handleInput}
                      value={formData.managerName}
                      type="text"
                      placeholder="Enter Manager name"
                      className="w-full px-4 py-3 pl-11 rounded-xl border-2 border-gray-200 bg-gray-50/50 focus:border-[var(--default)] focus:bg-white focus:ring-4 focus:ring-red-50 outline-none transition-all duration-300 placeholder:text-gray-400 placeholder:text-sm"
                      disabled={loading}
                    />
                    <svg
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                      width="18"
                      height="18"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5.121 17.804A13.937 13.937 0 0112 15c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 10-6 0 3 3 0 006 0z"
                      />
                    </svg>
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <label
                    htmlFor="email"
                    className="block text-sm font-semibold text-gray-700"
                  >
                    Email
                  </label>
                  <div className="relative">
                    <input
                      id="email"
                      name="email"
                      onChange={handleInput}
                      value={formData.email}
                      type="email"
                      placeholder="Enter your email"
                      className="w-full px-4 py-3 pl-11 rounded-xl border-2 border-gray-200 bg-gray-50/50 focus:border-[var(--default)] focus:bg-white focus:ring-4 focus:ring-red-50 outline-none transition-all duration-300 placeholder:text-gray-400 placeholder:text-sm"
                      disabled={loading}
                    />
                    <svg
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                      width="18"
                      height="18"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 12H8m8 0l-4 4m4-4l-4-4M4 8l8-4 8 4v8l-8 4-8-4V8z"
                      />
                    </svg>
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <label
                    htmlFor="password"
                    className="block text-sm font-semibold text-gray-700"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      onChange={handleInput}
                      value={formData.password}
                      placeholder="Enter your password"
                      className="w-full px-4 py-3 pl-11 pr-11 rounded-xl border-2 border-gray-200 bg-gray-50/50 focus:border-[var(--default)] focus:bg-white focus:ring-4 focus:ring-red-50 outline-none transition-all duration-300 placeholder:text-gray-400 placeholder:text-sm"
                      disabled={loading}
                    />
                    <svg
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                      width="18"
                      height="18"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPassword ? (
                        <svg
                          width="20"
                          height="20"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                          />
                        </svg>
                      ) : (
                        <svg
                          width="20"
                          height="20"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {/* University */}
                <div className="space-y-2">
                  <label
                    htmlFor="university"
                    className="block text-sm font-semibold text-gray-700"
                  >
                    Your University
                  </label>
                  <div className="relative">
                    <select
                      id="university"
                      name="university"
                      onChange={handleInput}
                      value={formData.university}
                      className="w-full appearance-none px-4 py-3 pl-11 rounded-xl border-2 border-gray-200 bg-gray-50/50 focus:border-[var(--default)] focus:bg-white focus:ring-4 focus:ring-red-50 outline-none transition-all duration-300 text-sm text-gray-700"
                      disabled={loading}
                    >
                      <option value="" disabled>
                        Select your University
                      </option>
                      {universities.map((uni) => (
                        <option key={uni._id} value={uni.name}>
                          {uni.name}
                        </option>
                      ))}
                    </select>
                    <svg
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                      width="18"
                      height="18"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 7h18M3 12h18M3 17h18"
                      />
                    </svg>
                    <svg
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                      width="18"
                      height="18"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </div>

                {/* Terms */}
                <div className="text-[#323232] text-[12px]">
                  *By clicking <span className="font-bold">Sign Up</span>, you
                  agree with the
                  <span className="font-bold underline">
                    {" "}
                    terms and condition.
                  </span>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-[#9e0505] to-[#c91a1a] text-white py-3.5 px-4 rounded-xl font-semibold hover:shadow-2xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-red-200 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98] text-base"
                >
                  {loading ? "Signing Up..." : "Sign Up"}
                </button>

                {/* Login link */}
                <div className="text-center pt-4 border-t border-gray-100">
                  <p className="text-gray-600 text-[13px]">
                    Already have an account?
                    <Link
                      to="/login"
                      className="font-semibold text-[var(--default)] hover:text-[#9e0505] hover:underline transition-colors"
                    >
                      Login
                    </Link>
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
