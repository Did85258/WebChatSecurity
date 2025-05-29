'use client';

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("Token");
    if (token) {
      router.push("/chat");
    } else {
      router.push("/login");
    }
  }, [router]);

  return null; // หรือใส่ spinner ก็ได้
}
