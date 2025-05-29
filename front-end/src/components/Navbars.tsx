'use client'
import Swal from "sweetalert2";
import { useRouter } from 'next/navigation';
import { useEffect, useState } from "react";

export default function Navbars() {
  const router = useRouter();
  const [userName, setUserName] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("userToken");
    if (token) {
      setIsAuthenticated(true);
      setUserName(localStorage.getItem("userName") || "Guest");
    }
  }, []);

  const handleLogout = () => {
    Swal.fire({
      title: "Are you sure?",
      text: "You will be logged out.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, log out",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33"
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem("userToken");
        localStorage.removeItem("userId");
        localStorage.removeItem("userName");
        router.push("/login");
      }
    });
  };

  if (!isAuthenticated) return null; // ไม่แสดง navbar

  return (
    <nav className="w-screen border-gray-200 bg-gray-900">
      <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-5">
        <span className="self-center text-2xl font-semibold whitespace-nowrap text-white">
          Web Chat
        </span>
        <div className="flex items-center space-x-3">
          <button
            type="button"
            className="flex text-sm bg-gray-800 rounded-full focus:ring-4 focus:ring-gray-600"
          >
            <span className="sr-only">Open user menu</span>
            <img
              className="w-8 h-8 rounded-full"
              src="/default-avatar.png"
              alt="user"
            />
          </button>
          <div className="z-50 hidden my-4 text-base list-none rounded-lg shadow bg-gray-700">
            <div className="px-4 py-3">
              <span className="block text-sm text-white">Username: {userName}</span>
            </div>
            <ul className="py-2">
              <li
                className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-600 hover:text-white cursor-pointer"
                onClick={handleLogout}
              >
                Logout
              </li>
            </ul>
          </div>
        </div>
      </div>
    </nav>
  );
}
