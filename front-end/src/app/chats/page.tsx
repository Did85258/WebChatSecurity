// pages/chat.tsx
"use client";
import React, { useEffect, useRef, useState } from "react";
import SockJS from "sockjs-client";
import { Client, CompatClient, Stomp } from "@stomp/stompjs";
import { useUser } from "../../components/context/UserContext";
import Swal from "sweetalert2";
import ChoseUser from "@/components/user/ChoseUser";
import InputImageButon from "@/components/button/InputImageButon";
import { PaperClipOutlined, SendOutlined } from "@ant-design/icons";
import Password from "antd/es/input/Password";
import { Image } from "antd";

type ChatMessage = {
  sender?: string;
  receiver?: string;
  content?: string;
  encrypted_content?: string;
  type_content?: string;
  iv?: string;
  encrypted_aes_key_for_sender?: string;
  encrypted_aes_key_for_receiver?: string;
  timestamp?: string;
  img_src?: string;
  id?: string;
};
type User = {
  user_id: string;
  username: string;
  role: string;
  picture?: string;
};

const BASE_URL = "http://localhost:8080";
const ChatPage = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");

  const stompClientRef = useRef<Client | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { user, setUser } = useUser();
  const [usersData, setUsersData] = useState<User[]>([]);

  const [receiverId, setReciverId] = useState("");
  const [receiverName, setReciverName] = useState("");

  const thaiISOString: any = () => {
    const date = new Date();
    const offset = 7 * 60; // ไทย GMT+7 = 7*60 = 420 นาที
    const tzDate = new Date(
      date.getTime() + offset * 60 * 1000 - date.getTimezoneOffset() * 60 * 1000
    );
    return tzDate.toISOString().replace("Z", "+07:00");
  };

  const personalData = async () => {
    try {
      const response = await fetch(`${BASE_URL}/auth/personal`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      // console.log(data);
      setUser({
        user_id: data.user_id,
        username: data.username,
        role: data.role,
      });
      // console.log(user?.user_id)
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const fetchUserAll = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/allUser`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();

      setUsersData([...data]);
      // console.log(usersData.);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const fetchOldMsgData = async (reciverId: string) => {
    setMessages([]);
    try {
      const response = await fetch(
        `${BASE_URL}/api/oldMsg?sender=${user?.user_id}&receiver=${reciverId}`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const data = await response.json();
      // console.log(data);

      if (user) {
        const key = await fetchAndDecryptPrivateKey(user.user_id, "1234");
        await savePrivateKeyToIndexedDB(user.user_id, key);
      }
      await Promise.all(
        data.map(async (item: any) => {
          if (item.type_content == "1") {
            const img_src = await getImages(item);
            item.img_src = img_src;
          } else {
            const decryptMessage = await getMessage(item); // โหลด + ถอดรหัส
            item.content = decryptMessage;
          }
        })
      );
      setMessages([...data]);
      console.log(data);
      // scrollToBottom();

      // loadPrivateKeyFromIndexedDB().then((privateKey) => {
      //   // ใช้ privateKey ที่นี่
      //   console.log("ได้คีย์แล้ว:", privateKey);
      // });
    } catch (error) {
      console.error("Error:", error);
    }
  };
  async function fetchAndDecryptPrivateKey(
    user_id: string,
    password: string
  ): Promise<CryptoKey> {
    const formData = new FormData();
    formData.append("user_id", user_id);
    formData.append("password", password);
    const res = await fetch(`${BASE_URL}/api/private-key`, {
      method: "POST",
      credentials: "include",
      body: formData,
    });
    const data = await res.json();

    const encryptedKey = Uint8Array.from(atob(data.encryptedKey), (c) =>
      c.charCodeAt(0)
    );
    const iv = Uint8Array.from(atob(data.iv), (c) => c.charCodeAt(0));
    const salt = Uint8Array.from(atob(data.salt), (c) => c.charCodeAt(0));

    // สร้าง password key จาก PBKDF2
    const baseKey = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(password),
      "PBKDF2",
      false,
      ["deriveKey"]
    );

    const aesKey = await crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt: salt,
        iterations: 100000,
        hash: "SHA-256",
      },
      baseKey,
      { name: "AES-GCM", length: 256 },
      true,
      ["decrypt"]
    );

    // ถอดรหัส .key
    const decryptedKeyBuffer = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv },
      aesKey,
      encryptedKey
    );

    // console.log(decryptedKeyBuffer)

    // แปลงเป็น CryptoKey
    const privateKey = await crypto.subtle.importKey(
      "pkcs8",
      decryptedKeyBuffer,
      { name: "RSA-OAEP", hash: "SHA-256" },
      true,
      ["decrypt"]
    );
    // console.log(privateKey)

    return privateKey;
  }
  async function savePrivateKeyToIndexedDB(
    userId: string,
    privateKey: CryptoKey
  ) {
    const exported = await crypto.subtle.exportKey("pkcs8", privateKey);

    const request = indexedDB.open("SecureChat", 1);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains("keys")) {
        db.createObjectStore("keys");
      }
    };

    request.onsuccess = () => {
      const db = request.result;
      const tx = db.transaction("keys", "readwrite");
      const store = tx.objectStore("keys");

      store.put(exported, `privateKey:${userId}`);

      tx.oncomplete = () => db.close();
    };

    request.onerror = () => {
      console.error("Failed to open IndexedDB:", request.error);
    };
  }

  async function loadPrivateKeyFromIndexedDB(
    userId: string
  ): Promise<CryptoKey> {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open("SecureChat", 1);

      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains("keys")) {
          db.createObjectStore("keys");
        }
      };

      req.onsuccess = async () => {
        const db = req.result;
        const tx = db.transaction("keys", "readonly");
        const store = tx.objectStore("keys");

        const getReq = store.get(`privateKey:${userId}`);

        getReq.onsuccess = async () => {
          const keyData = getReq.result;
          if (!keyData) {
            reject("ไม่พบ privateKey สำหรับ user นี้");
            return;
          }

          const privateKey = await crypto.subtle.importKey(
            "pkcs8",
            keyData,
            { name: "RSA-OAEP", hash: "SHA-256" },
            false,
            ["decrypt"]
          );
          resolve(privateKey);
        };

        getReq.onerror = () => reject(getReq.error);
      };

      req.onerror = () => {
        reject(req.error);
      };
    });
  }

  useEffect(() => {
    personalData();
    fetchUserAll();
    // ✅ สร้าง client โดยใช้ SockJS
    const client = new Client({
      webSocketFactory: () => new SockJS(`${BASE_URL}/chat`), // ✅ SockJS factory
      reconnectDelay: 5000, // ✅ auto reconnect
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,

      onConnect: () => {
        console.log("Connected to WebSocket");
        // console.log(`/topic/messages/${user?.user_id}`);

        client.subscribe(
          `/topic/messages/${user?.user_id}`,
          async (message) => {
            const msg: ChatMessage = JSON.parse(message.body);
            if (msg.type_content == "1") {
              const imgSrc = await getImages(msg); // โหลด + ถอดรหัส
              msg.img_src = imgSrc;
            } else {
              const decryptMessage = await getMessage(msg); // โหลด + ถอดรหัส
              msg.content = decryptMessage;
            }
            setMessages((prev) => [...prev, msg]);
          }
        );

        // Optional: แจ้ง server ว่า user online
        // client.publish({ destination: "/app/chat.addUser", body: JSON.stringify({ from: user }) });
      },

      onStompError: (frame) => {
        console.error("STOMP error: ", frame);
      },
    });

    stompClientRef.current = client;
    client.activate(); // ✅ ใช้ activate แทน connect()

    return () => {
      client.deactivate(); // ✅ ปิดอย่างปลอดภัย
      console.log("WebSocket disconnected");
    };
  }, [user?.user_id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (messageId?: string) => {
    if (receiverId == "") return;
    if (!stompClientRef.current?.connected) {
      console.warn("WebSocket not connected. Cannot send message.");
      return;
    }
    if (input.trim() === "" && messageId == "") return;

    let msg: ChatMessage = {};
    if (messageId) {
      msg = {
        id: messageId,
        type_content: "1",
        timestamp: thaiISOString(),
      };
    } else {
      msg = await encryptMessage(input);
    }

    // console.log(thaiISOString())
    // console.log(msg);
    try {
      // console.log(msg);
      stompClientRef.current.publish({
        destination: "/app/chat.sent",
        body: JSON.stringify(msg),
      });
      // console.log(messageId)
      // fetchOldMsgData(reciverId);
      if (msg.type_content == "0") {
        msg.content = input
        setMessages((prev) => [...prev, msg]);
      }
      // console.log(messages);
      // scrollToBottom();
      setInput("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  ////encript
  // const [imageBytes, setImageBytes] = useState<Uint8Array | null>(null);

  async function encryptAESKeyWithRSA(
    aesKey: Uint8Array<ArrayBuffer>,
    publicKeyBuf: ArrayBuffer
  ) {
    const publicKey = await crypto.subtle.importKey(
      "spki",
      publicKeyBuf,
      { name: "RSA-OAEP", hash: "SHA-256" },
      false,
      ["encrypt"]
    );

    return crypto.subtle.encrypt({ name: "RSA-OAEP" }, publicKey, aesKey);
  }

  async function fetchPublicKey(receiverId: string): Promise<ArrayBuffer> {
    const response = await fetch(
      `${BASE_URL}/api/public-key?userId=${receiverId}`,
      {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    const publicKeyBuffer = await response.arrayBuffer();
    console.log(publicKeyBuffer);

    return publicKeyBuffer;
  }

  async function encryptText(aesKey: Uint8Array, plainText: string) {
    const iv = crypto.getRandomValues(new Uint8Array(12)); // 96-bit IV
    const aesKeyBuffer = toArrayBuffer(aesKey);
    const key = await crypto.subtle.importKey(
      "raw",
      aesKeyBuffer,
      "AES-GCM",
      false,
      ["encrypt"]
    );
    const encoded = new TextEncoder().encode(plainText);
    const ciphertext = await crypto.subtle.encrypt(
      { name: "AES-GCM", iv },
      key,
      encoded
    );
    return { ciphertext: new Uint8Array(ciphertext), iv };
  }

  const encryptMessage = async (plainText: any) => {
    // ดึง Public Key ของ receiver
    const publicKeyReceiver = await fetchPublicKey(receiverId);

    const publicKeySender = await fetchPublicKey(user!.user_id);

    const receiverPublicKeyBuf = new Uint8Array(publicKeyReceiver).buffer;
    const senderPublicKeyBuf = new Uint8Array(publicKeySender).buffer;

    // สุ่ม AES key
    const aesKey = crypto.getRandomValues(new Uint8Array(16)); // 128-bit

    // เข้ารหัสข้อความด้วย AES key
    const { ciphertext, iv } = await encryptText(aesKey, plainText);

    // เข้ารหัส AES key ด้วย RSA public key
    const encryptedAesKeyForSender = await encryptAESKeyWithRSA(
      aesKey,
      senderPublicKeyBuf
    );
    const encryptedAesKeyForReceiver = await encryptAESKeyWithRSA(
      aesKey,
      receiverPublicKeyBuf
    );

    //ไว้แสดงที่ sender
    const msg: ChatMessage = {
      sender: user!.user_id,
      receiver: receiverId,
      type_content: "0",
      encrypted_content: btoa(
        String.fromCharCode(...new Uint8Array(ciphertext))
      ), // base64
      iv: btoa(String.fromCharCode(...iv)),
      encrypted_aes_key_for_sender: btoa(
        String.fromCharCode(...new Uint8Array(encryptedAesKeyForSender))
      ),
      encrypted_aes_key_for_receiver: btoa(
        String.fromCharCode(...new Uint8Array(encryptedAesKeyForReceiver))
      ),
      timestamp: thaiISOString(),
    };
    return msg;
  };
  const encryptAndSendImage = async (imageBytes: any) => {
    if (!imageBytes) {
      alert("กรุณาเลือกไฟล์ภาพก่อน");
      return;
    }

    // ดึง Public Key ของ receiver
    const publicKeyReceiver = await fetchPublicKey(receiverId);

    const publicKeySender = await fetchPublicKey(user!.user_id);

    const receiverPublicKeyBuf = new Uint8Array(publicKeyReceiver).buffer;
    const senderPublicKeyBuf = new Uint8Array(publicKeySender).buffer;

    // สุ่ม AES key
    const aesKey = crypto.getRandomValues(new Uint8Array(16)); // 128-bit

    // เข้ารหัส AES key ด้วย RSA public key
    const encryptedAesKeyForSender = await encryptAESKeyWithRSA(
      aesKey,
      senderPublicKeyBuf
    );
    const encryptedAesKeyForReceiver = await encryptAESKeyWithRSA(
      aesKey,
      receiverPublicKeyBuf
    );

    //ไว้แสดงที่ sender
    const img_url = displayImage(imageBytes);
    const msg: ChatMessage = {
      sender: user!.user_id,
      receiver: receiverId,
      content: input,
      type_content: "1",
      img_src: img_url,
      timestamp: thaiISOString(),
    };
    setMessages((prev) => [...prev, msg]);
    // console.log(img_url);

    // console.log(encryptedAesKey);

    // เข้ารหัสภาพด้วย AES key
    const encryptedImage = await encryptImage(aesKey, imageBytes);
    // console.log(encryptedImage);

    try {
      const formData = new FormData();
      const encryptedBlob = new Blob([encryptedImage.ciphertext], {
        type: "application/octet-stream",
      });

      formData.append("file", encryptedBlob, "encrypted_image.enc");
      formData.append("messageId", user!.user_id);
      formData.append("sender_id", user!.user_id);
      formData.append("receiver_id", receiverId);
      formData.append("timestamp", thaiISOString());

      // console.log(formData);
      const response = await fetch(`${BASE_URL}/api/sentImg`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      // const messagesId = await response.text()
      if (response.ok) {
        const messagesId = await response.text();
        // console.log(messagesId)
        sendMessage(messagesId);
      }
      // const data = await response;
      // if (data.ok) {
      //   fetchOldMsgData(receiverId);
      // }

      // setMessages([...data]);
      // scrollToBottom();
      // console.log(data);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  async function encryptImage(aesKey: Uint8Array, imageBytes: ArrayBuffer) {
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const aesKeyBuffer = toArrayBuffer(aesKey);
    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      aesKeyBuffer,
      "AES-GCM",
      false,
      ["encrypt"]
    );

    // const safeBuffer = toArrayBuffer(imageBytes);
    console.log("it's ok");
    const encryptedBuffer = await crypto.subtle.encrypt(
      { name: "AES-GCM", iv: iv },
      cryptoKey,
      imageBytes
    );

    return { iv, ciphertext: new Uint8Array(encryptedBuffer) };
  }
  function toArrayBuffer(u8: Uint8Array): ArrayBuffer {
    const copy = new Uint8Array(u8.length);
    for (let i = 0; i < u8.length; i++) {
      copy[i] = u8[i];
    }
    return copy.buffer;
  }
  ////encript

  const handleOpenChat = (reciverId: string, reciverName: string) => {
    fetchOldMsgData(reciverId);
    setReciverId(reciverId);
    setReciverName(reciverName);
  };

  const fileInputRef: any = useRef(null);

  const handleButtonClick = () => {
    if (receiverId == "") return;
    // คลิกที่ input file โดยอัตโนมัติ
    fileInputRef.current.click();
  };

  const handleFileChange = async (e: any) => {
    const file = e.target.files[0];
    // console.log(file);
    // if (!file) {
    //   alert("Please select a file.");
    //   return;
    // }
    const arrayBuffer = await file.arrayBuffer();

    // setImageBytes(new Uint8Array(arrayBuffer));

    encryptAndSendImage(new Uint8Array(arrayBuffer));
    fileInputRef.current.value = "";
  };

  ////decrypt img
  interface EncryptedImageData {
    file: string; // base64 ของ .enc ไฟล์
    iv: string; // base64
    aesKeySenderBase64: string; // base64
    aesKeyReceiverBase64: string; // base64
  }

  async function fetchImage(id: string): Promise<EncryptedImageData> {
    const res = await fetch(`${BASE_URL}/api/getImg?message_id=${id}`, {
      method: "GET",
      credentials: "include",
    });

    return res.json();
  }

  async function decryptAESKey(
    encryptedAESKeyB64: string,
    privateKey: CryptoKey
  ): Promise<Uint8Array> {
    // console.log("encryptedAESKeyB64", encryptedAESKeyB64);
    // console.log(
    //   "Uint8Array:",
    //   Uint8Array.from(atob(encryptedAESKeyB64), (c) => c.charCodeAt(0))
    // );

    const encryptedAESKey = Uint8Array.from(atob(encryptedAESKeyB64), (c) =>
      c.charCodeAt(0)
    );

    const decryptedKeyBuffer = await crypto.subtle.decrypt(
      { name: "RSA-OAEP" },
      privateKey,
      encryptedAESKey
    );

    return new Uint8Array(decryptedKeyBuffer);
  }
  async function decryptData(
    encryptedB64: string,
    aesKey: Uint8Array,
    ivB64: string
  ): Promise<Uint8Array> {
    const encryptedBytes = Uint8Array.from(atob(encryptedB64), (c) =>
      c.charCodeAt(0)
    );
    const iv = Uint8Array.from(atob(ivB64), (c) => c.charCodeAt(0));
    const aesKeyBuffer = toArrayBuffer(aesKey);
    const key = await crypto.subtle.importKey(
      "raw",
      aesKeyBuffer,
      { name: "AES-GCM" },
      false,
      ["decrypt"]
    );

    const decryptedBuffer = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv },
      key,
      encryptedBytes
    );

    return new Uint8Array(decryptedBuffer);
  }
  function displayImage(decryptedBytes: Uint8Array) {
    const decryptedBytesBuffer = toArrayBuffer(decryptedBytes);
    const blob = new Blob([decryptedBytesBuffer], { type: "image/png" }); // หรือ image/jpeg
    const url = URL.createObjectURL(blob);
    return url;
  }

  async function getImages(message: ChatMessage) {
    const { file } = await fetchImage(message.id!);

    const privateKey = await loadPrivateKeyFromIndexedDB(user!.user_id); // ฟังก์ชันของคุณเอง

    // console.log(privateKey);
    let aesKey;
    if (user?.user_id == message.sender) {
      aesKey = await decryptAESKey(
        message.encrypted_aes_key_for_sender!,
        privateKey
      );
      // console.log(aesKeySenderBase64);
    } else {
      aesKey = await decryptAESKey(
        message.encrypted_aes_key_for_receiver!,
        privateKey
      );
      // console.log(aesKeyReceiverBase64);
    }

    const decryptedImage = await decryptData(file, aesKey, message.iv!);
    // console.log(decryptedImage)

    const imageUrl = displayImage(decryptedImage);
    return imageUrl;
  }

  async function getMessage(message: ChatMessage) {
    const privateKey = await loadPrivateKeyFromIndexedDB(user!.user_id); // ฟังก์ชันของคุณเอง

    // console.log(privateKey);
    let aesKey;
    if (user?.user_id == message.sender) {
      aesKey = await decryptAESKey(
        message.encrypted_aes_key_for_sender!,
        privateKey
      );
      // console.log(aesKeySenderBase64);
    } else {
      aesKey = await decryptAESKey(
        message.encrypted_aes_key_for_receiver!,
        privateKey
      );
      // console.log(aesKeyReceiverBase64);
    }
    const decryptedMesssage = await decryptData(
      message.encrypted_content!,
      aesKey,
      message.iv!
    );
    // console.log(decryptedMesssage);

    const decryptedText = decryptedBytesToString(decryptedMesssage);

    return decryptedText;
  }

  function decryptedBytesToString(decryptedBytes: Uint8Array): string {
    const decoder = new TextDecoder(); // ใช้ "utf-8" เป็น default
    return decoder.decode(decryptedBytes);
  }

  ////decrypt img

  return (
    <div className="flex h-[89vh] antialiased text-gray-800">
      {/* {imageSrc && <img src={imageSrc} alt="Decrypted" />} */}
      <div className="flex flex-row h-full w-full overflow-x-hidden">
        <div className="bg-white p-2">
          <div className="flex h-full flex-col py-2 pl-6 pr-2 w-64 bg-zinc-200  flex-shrink-0 overflow-y-auto">
            <div className="flex flex-col mt-8 ">
              <div className="flex flex-row items-center justify-between text-xs ">
                <span className="font-bold">People message</span>
              </div>
              <div className="flex flex-col space-y-1 mt-4 -mx-2 h overflow-y-auto mr-2">
                {usersData
                  .filter((row) => row.user_id !== user?.user_id)
                  .map((row, index) => (
                    <ChoseUser
                      key={index}
                      userName={row.username}
                      onClick={() => handleOpenChat(row.user_id, row.username)}
                    />
                  ))}
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col flex-auto  h-full p-3">
          <div className="flex flex-col flex-auto flex-shrink-0 rounded-2xl bg-gray-100 h-full p-4 ">
            <div className="flex  flex-auto flex-shrink-0 bg-white rounded-xl  p-3 px-7 ">
              <div className="flex text-white items-center justify-center h-12 w-12 rounded-full bg-indigo-500 flex-shrink-0">
                {receiverName.substring(0, 1).toUpperCase()}
              </div>
              <div className="relative  ml-3 text-xl bg-white py-2 px-2 ">
                <div>{receiverName}</div>
              </div>
            </div>
            <div className="flex flex-col h-full overflow-x-auto mb-4 ">
              <div className="flex flex-col h-full">
                <div className="grid grid-cols-12 gap-y-2 ">
                  {/* messageData */}
                  {messages.map((row, index) =>
                    row.sender == user?.user_id ? (
                      <div
                        key={index}
                        className="col-start-6 col-end-13 p-3 rounded-lg"
                      >
                        <div className="flex items-center justify-start flex-row-reverse">
                          <div className="flex text-white items-center justify-center h-10 w-10 rounded-full bg-indigo-500 flex-shrink-0">
                            {user?.username.substring(0, 1).toUpperCase()}
                          </div>
                          <div className="relative mr-3 text-sm bg-indigo-100 py-2 px-4 shadow rounded-xl">
                            <div>
                              {row.content} {/* แสดงรูป */}
                              {row.type_content == "1" && (
                                // <img className="h-48" src={row.img_src} />
                                <Image height={200} src={row.img_src} />
                              )}
                            </div>
                            {/* แสดงข้อความที่ถูกส่ง */}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div
                        key={index}
                        className="col-start-1 col-end-8 p-3 rounded-lg"
                      >
                        <div className="flex flex-row items-center">
                          <div className="flex text-white items-center justify-center h-10 w-10 rounded-full bg-indigo-500 flex-shrink-0">
                            {receiverName.substring(0, 1).toLocaleUpperCase()}
                          </div>
                          <div className="relative ml-3 text-sm bg-white py-2 px-4 shadow rounded-xl">
                            <div>
                              {row.content} {/* แสดงรูป */}
                              {row.type_content == "1" && (
                                <Image height={200} src={row.img_src} />
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </div>
            </div>
            <div className="flex flex-row items-center h-16 rounded-xl bg-white w-full px-3">
              <div>
                {/* Input file ซ่อน */}
                <input
                  type="file"
                  ref={fileInputRef}
                  style={{ display: "none" }} // ซ่อน input
                  onChange={handleFileChange}
                />
                <button
                  className="flex items-center justify-center text-gray-400 hover:text-gray-600 cursor-pointer"
                  onClick={handleButtonClick}
                >
                  <PaperClipOutlined />
                </button>
              </div>
              <div className="flex-grow ml-2">
                <div className=" w-full">
                  <input
                    type="text"
                    className="flex pl-4 w-full border rounded-md h-8  focus:o.imageUrl"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                  />
                </div>
              </div>
              <div className="ml-4">
                <button
                  className="flex items-center h-8 justify-center bg-indigo-500 hover:bg-indigo-600 rounded-md px-4 py-1 flex-shrink-0"
                  onClick={() => sendMessage()}
                >
                  <span className="text-white">Send</span>
                  <span className="ml-2 text-white">
                    <SendOutlined />
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
