"use client";
import React, { ReactNode, useEffect, useState } from "react";
import { Button, Dropdown, Menu, Popover, Space, type MenuProps } from "antd";
import { Header } from "antd/es/layout/layout";
import { LogoutOutlined } from "@ant-design/icons";
import { useUser } from "../context/UserContext";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";

const BASE_URL = "http://localhost:8080";
const items1: MenuProps["items"] = ["1", "2", "3"].map((key) => ({
  key,
  label: `nav ${key}`,
}));

export default function Navbar() {
  const { user, setUser } = useUser();
  const router = useRouter();
  const [username, setUsername] = useState<any | null>(null);

  useEffect(() => {
    setUsername(user);
  }, [user]);

  const [open, setOpen] = useState(false);

  const toggleMenu = () => setOpen(!open);
  // const navigate = useRouter();

  const Logout = async (e: any) => {
    e.preventDefault();
    try {
      const response = await fetch(`${BASE_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        // const data = await response.json();
        Swal.fire({
          title: "Error!",
          text: "Network response was not ok",
          icon: "error",
          confirmButtonText: "OK",
          confirmButtonColor: "#d33",
        });
      } else {
        setUser(null);
        router.push("/login");
      }
    } catch (error) {
      console.error("Error:", error);
      Swal.fire({
        title: "Error!",
        text: "Network response was not ok",
        icon: "error",
        confirmButtonText: "OK",
        confirmButtonColor: "#d33",
      });
    }
  };

  const items: MenuProps["items"] = [
    {
      label: (
        <div className="flex flex-col justify-center items-center cursor-default">
          <div>
            <img className="w-16 h-16 rounded-full" src="gps.png" />
          </div>
          <div className="mt-1"> Username: {username} </div>
        </div>
      ),
      key: "0",
    },
    {
      type: "divider",
    },
    {
      label: (
        <div className="flex justify-center items-center" onClick={Logout}>
          <LogoutOutlined />
          <div className="pl-2">Logout</div>
        </div>
      ),
      key: "1",
    },
  ];

  if (!user) {
    if (open == true) {
      toggleMenu();
    }
    return;
  }

  return (
    <>
      <Header style={{ display: "flex", alignItems: "center" }}>
        <div className="flex justify-between items-center w-full h-full">
          <div className="flex items-center">
            <div className="text-2xl font-semibold text-white">WebChat</div>
          </div>

          <div className="bg-white rounded-full w-10 h-10 items-center justify-center relative inline-block">
            <Dropdown  overlayClassName="w-40" menu={{ items }} trigger={["click"]}>
              <a   onClick={(e) => e.preventDefault()}>
                <Space>
                  <img className="w-10 h-10 rounded-full" src="gps.png" />
                </Space>
              </a>
            </Dropdown>
          
          </div>

          {/* <Popover placement="bottomRight" title={text} content={content} arrow={mergedArrow}>
            <Button>BR</Button>
          </Popover> */}
        </div>
      </Header>
      <div style={{ padding: "0 48px" }}></div>
    </>
  );
}
