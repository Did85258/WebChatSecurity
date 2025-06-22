"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { Button } from "antd";
import { DownloadOutlined } from "@ant-design/icons";

// const BASE_URL = "http://127.0.0.1:8000";
const BASE_URL = "http://localhost:8080";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useRouter();

  const Login = async (e: any) => {
    e.preventDefault();
    try {
      const response = await fetch(`${BASE_URL}/auth/login`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username: username, password: password }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.message || "Login failed");
        Swal.fire({
          title: "Error!",
          text: "Network response was not ok",
          icon: "error",
          confirmButtonText: "OK",
          // confirmButtonColor: "#d33",
        });
      } else {
        navigate.push("/chats");
      }
    } catch (error) {
      console.error("Error:", error);
      setError("Failed to login");
      Swal.fire({
        title: "Error!",
        text: "Failed to login.",
        icon: "error",
        confirmButtonText: "OK",
        // confirmButtonColor: "#d33",
      });
    }
  };

  const handleUsernameChange = (event: any) => {
    setUsername(event.target.value.trim());
  };

  const handlePasswordChange = (event: any) => {
    setPassword(event.target.value.trim());
  };

  const handleRegisterClick = () => {
    navigate.push("/register"); // ไปที่ path /register
  };
  return (
    <>
      <section className="bg-slate-700 w-screen h-screen">
        <div className="min-h-screen flex items-center justify-center w-full ">
          <div className="bg-white dark:bg-gray-900 shadow-md rounded-lg px-8 py-6 w-96">
            <h1 className="text-2xl font-bold text-center mb-4 0">
              Login
            </h1>
            <form action="#" onSubmit={Login}>
              <div className="mb-4">
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Username
                </label>
                <input
                  type="text"
                  id="username"
                  className="shadow-sm rounded-md w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="your@email.com"
                  required
                  onChange={handleUsernameChange}
                />
              </div>
              <div className="mb-4">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  className="shadow-sm rounded-md w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Enter your password"
                  required
                  onChange={handlePasswordChange}
                />
              </div>
              <div className="flex items-center justify-between mb-4">
                <a
                  href="./register"
                  className="text-xs text-indigo-500 hover:text-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Create Account
                </a>
              </div>

              <button

                type="submit"
                className="cursor-pointer w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <div className="text-white">Login</div>
                
                
              </button>
            </form>
          </div>
        </div>
      </section>
    </>
  );
}
