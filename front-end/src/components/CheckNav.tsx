// components/ClientNavbar.tsx
'use client';

import { useEffect, useState } from 'react';
import Navbars from './Navbars';


export default function CheckNav() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

//   useEffect(() => {
//     const token = localStorage.getItem('token');
//     setIsAuthenticated(!!token);
//   }, []);

//   if (!isAuthenticated) return null;

  return <Navbars />;
}
