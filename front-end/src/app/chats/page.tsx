// pages/chat.tsx
'use client';
import React, { useEffect, useRef, useState } from 'react';
import SockJS from 'sockjs-client';
import { CompatClient, Stomp } from '@stomp/stompjs';
import { useUser } from '../../components/context/UserContext';
import Swal from 'sweetalert2';
import 'sweetalert2/src/sweetalert2.scss';

type ChatMessage = {
  sender: string;
  receiver: string;
  content: string;
  timestamp?: string;
};
const BASE_URL = "http://localhost:8080";
const ChatPage = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [username, setUsername] = useState('user' + Math.floor(Math.random() * 1000));
  const stompClientRef = useRef<CompatClient | null>(null);
  // const { user } = useUser();


  // const navigate = useRouter();
  const personalData = async () => {
    try {
      const response  = await fetch(`${BASE_URL}/auth/personal`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      console.log(data)
      setUser(data.username)

    } catch (error) {
      // console.error("Error:", error);
      Swal.fire({
        title: "Error!",
        text: "Failed to login.",
        icon: "error",
        confirmButtonText: "OK",
        // confirmButtonColor: "#d33",
      });
    }
  };

  const { user, setUser } = useUser();

  // useEffect(() => {
  //   personalData().then((data) => {
  //     console.log("📦 Data from personalData():", data);
  //     console.log("👤 Context user:", user); // <== ใช้ได้ตรงนี้
  //   });
  // }, [user]); // หรือ [] ถ้าไม่ต้องการ rerun

  useEffect(() => {
    // console.log("asdwda:"+user)
    personalData()
    // setUser()
    const socket = new SockJS('http://localhost:8080/ws');
    const stompClient = Stomp.over(socket);
    stompClientRef.current = stompClient;

    

    stompClient.connect({}, () => {
      stompClient.subscribe('/topic/messages/' + 'test', (message) => {
        const msg: ChatMessage = JSON.parse(message.body);
        setMessages((prev) => [...prev, msg]);
      });

      // ส่งชื่อผู้ใช้ไปแจ้งระบบ (optional)
      // stompClient.send('/app/chat.addUser', {}, JSON.stringify({ from: username }));
    });

    return () => {
      stompClient.disconnect(() => {
        console.log('Disconnected');
      });
    };
  }, [username]);

  const sendMessage = () => {
    if (stompClientRef.current && input.trim() !== '') {
      const msg: ChatMessage = {
        sender: "test",
        receiver: "string",
        content: input,
        timestamp: new Date().toISOString(),
      };
      stompClientRef.current.send('/app/chat', {}, JSON.stringify(msg));
      setInput('');
    }
  };

  return (
    <div className="min-h-screen p-4 bg-gray-100">
      <h1 className="text-xl font-bold mb-4">💬 Real-time Chat</h1>
      <div className="bg-white p-4 rounded shadow mb-4 h-96 overflow-y-auto">
        {messages.map((msg, index) => (
          <div key={index} className="mb-2">
            <strong>{msg.sender}:</strong> {msg.content}
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          className="flex-1 border rounded px-2 py-1"
          placeholder="Type message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
        />
        <button
          onClick={sendMessage}
          className="bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatPage;
