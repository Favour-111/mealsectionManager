import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { HiOutlineAcademicCap } from "react-icons/hi2";
import { MdOutlineArrowForwardIos } from "react-icons/md";

const UniversitySelect = () => {
  const [universities, setUniversities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUniversities = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_REACT_APP_API}/api/universities`
        );
        setUniversities(res.data.universities || []);
      } catch (err) {
        setError("Failed to load universities. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchUniversities();
  }, []);

  const handleSelect = (uni) => {
    localStorage.setItem("selectedUniversity", uni.name);
    localStorage.setItem("selectedUniversityId", uni._id);
    navigate("/order");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#fff7f2] to-[#f3e5e5] px-4">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl p-8 md:p-12 border border-gray-100">
        <div className="flex flex-col items-center mb-8">
          <HiOutlineAcademicCap
            className="text-[var(--default)] mb-2"
            size={48}
          />
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800 mb-2 text-center">
            Choose Your University
          </h1>
          <p className="text-gray-500 text-center max-w-xs">
            Welcome! Please select the university you want to manage. This helps
            us show you the right data and orders.
          </p>
        </div>
        {loading ? (
          <div className="flex flex-col items-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[var(--default)] mb-4"></div>
            <span className="text-gray-400 font-medium">
              Loading universities...
            </span>
          </div>
        ) : error ? (
          <div className="text-center text-red-500 font-semibold py-8">
            {error}
          </div>
        ) : (
          <ul className="space-y-4">
            {universities.map((uni) => (
              <li key={uni._id}>
                <button
                  className="w-full cursor-pointer flex items-center justify-between px-6 py-4 bg-gradient-to-r from-[#fff7f2] to-[#f3e5e5] hover:from-[#f3e5e5] hover:to-[#fff7f2] border border-gray-200 rounded-2xl shadow group transition-all duration-200"
                  onClick={() => handleSelect(uni)}
                >
                  <span className="flex items-center gap-3 text-sm font-semibold text-gray-800 group-hover:text-[var(--default)]">
                    <HiOutlineAcademicCap
                      className="text-[var(--default)]"
                      size={22}
                    />
                    {uni.name}
                  </span>
                  <MdOutlineArrowForwardIos
                    className="text-gray-400 group-hover:text-[var(--default)]"
                    size={20}
                  />
                </button>
              </li>
            ))}
          </ul>
        )}
        <div className="mt-10 text-center text-xs text-gray-400">
          &copy; {new Date().getFullYear()} MealSection. All rights reserved.
        </div>
      </div>
    </div>
  );
};

export default UniversitySelect;
