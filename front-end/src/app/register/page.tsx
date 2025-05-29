'use client'

import { SetStateAction, useState } from "react";
import Swal from "sweetalert2";
import { useRouter } from 'next/navigation';

const BASE_URL = "http://127.0.0.1:8000";

export default function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useRouter().push;

  const CreateEmployee = async (e:any) => {
    console.log("call CreateEmployee");
    e.preventDefault();
    try {

      const responseCreate = await fetch(`${BASE_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_name: username,
          password: password,
        }),
      });
      // console.log(responseCreate);
      // const data = await responseCreate.json()
      // console.log(data);
      if (responseCreate.ok) {
        Swal.fire({
          title: "Create Success!",
          text: "Create Employee Success!",
          icon: "success",
          confirmButtonText: "OK",
          confirmButtonColor: "#28a745",
        }).then((result) => {
          if (result.isConfirmed) {
            navigate("/");
          }
        });
      } else {
        const data = await responseCreate.json()
        Swal.fire({
          title: "Error!",
          text: data.detail,
          icon: "error",
          confirmButtonText: "OK",
          confirmButtonColor: "#d33"
        });
      }
    } catch (error) {
      console.error("Error:", error);
      Swal.fire({
        title: "Error!",
        text: "Failed to Create.",
        icon: "error",
        confirmButtonText: "OK",
        confirmButtonColor: "#d33"
      });
    }
  };

  const handleUsernameChange = (event: any) => {
    setUsername(event.target.value);
  };

  const handlePasswordChange = (event:any) => {
    setPassword(event.target.value);
  };
  return (
    <>
      <section className="bg-slate-700 w-screen h-screen">
        <div className="min-h-screen flex items-center justify-center w-full dark:bg-gray-950">
          <div className="bg-white dark:bg-gray-900 shadow-md rounded-lg px-8 py-6 w-96">
            <h1 className="text-2xl font-bold text-center mb-4 dark:text-gray-200">
              Sign up your account
            </h1>
            <form action="#" onSubmit={CreateEmployee}>
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

              <button
                //   onClick="alert('hello')"
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Sign up
              </button>
            </form>
          </div>
        </div>
      </section>
    </>
  );
}
