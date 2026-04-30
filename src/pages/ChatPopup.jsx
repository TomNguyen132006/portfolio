import { useEffect, useMemo, useState } from "react";
import ChatMessages from "./ChatMessages";

const buildChatKey = (id1, id2) => {
  const [a, b] = [String(id1), String(id2)].sort();
  return `chat_${a}_${b}`;
};

function ChatPopup({ currentUser, users = [] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [input, setInput] = useState("");
  const [chatMessages, setChatMessages] = useState([]);
  const [unreadCounts, setUnreadCounts] = useState({});

  const otherUsers = useMemo(() => {
    return users.filter((user) => String(user.id) !== String(currentUser?.id));
  }, [users, currentUser]);

  const chatKey = useMemo(() => {
    if (!currentUser?.id || !selectedUser?.id) return "";
    return buildChatKey(currentUser.id, selectedUser.id);
  }, [currentUser, selectedUser]);

  const totalUnread = Object.values(unreadCounts).reduce(
    (sum, count) => sum + count,
    0
  );

  function openChat(user) {
    setSelectedUser(user);

    if (!currentUser?.id || !user?.id) return;

    const key = buildChatKey(currentUser.id, user.id);
    localStorage.setItem(`unread_${key}`, "0");

    setUnreadCounts((prev) => ({
      ...prev,
      [key]: 0,
    }));
  }

  function deleteConversation() {
    if (!chatKey) return;

    localStorage.removeItem(chatKey);
    localStorage.setItem(`unread_${chatKey}`, "0");
    setChatMessages([]);

    setUnreadCounts((prev) => ({
      ...prev,
      [chatKey]: 0,
    }));
  }

  function receiveMessage(newMessage) {
    if (!newMessage?.senderId || !currentUser?.id) return;

    const senderChatKey = buildChatKey(currentUser.id, newMessage.senderId);

    const isViewingThisChat =
      isOpen &&
      selectedUser &&
      String(selectedUser.id) === String(newMessage.senderId);

    if (senderChatKey === chatKey) {
      const saved = JSON.parse(localStorage.getItem(senderChatKey)) || [];
      setChatMessages(saved);
    }

    if (!isViewingThisChat) {
      const currentUnread =
        Number(localStorage.getItem(`unread_${senderChatKey}`)) || 0;
      const newUnread = currentUnread + 1;

      localStorage.setItem(`unread_${senderChatKey}`, String(newUnread));

      setUnreadCounts((prev) => ({
        ...prev,
        [senderChatKey]: newUnread,
      }));
    }
  }

  useEffect(() => {
    if (!currentUser?.id) return;

    const counts = {};

    otherUsers.forEach((user) => {
      const key = buildChatKey(currentUser.id, user.id);
      counts[key] = Number(localStorage.getItem(`unread_${key}`)) || 0;
    });

    setUnreadCounts(counts);
  }, [otherUsers, currentUser]);

  useEffect(() => {
  const interval = setInterval(() => {
    if (!currentUser?.id) return;

    otherUsers.forEach((user) => {
      const key = buildChatKey(currentUser.id, user.id);
      const saved = JSON.parse(localStorage.getItem(key)) || [];

      const lastMessage = saved[saved.length - 1];
      if (!lastMessage) return;

      if (String(lastMessage.senderId) === String(currentUser.id)) return;

      const lastSeenKey = `lastSeen_${key}`;
      const lastSeenId = localStorage.getItem(lastSeenKey);

      if (String(lastSeenId) === String(lastMessage.id)) return;

      localStorage.setItem(lastSeenKey, lastMessage.id);

      const isViewing =
        isOpen &&
        selectedUser &&
        String(selectedUser.id) === String(user.id);

      if (!isViewing) {
        const currentUnread =
          Number(localStorage.getItem(`unread_${key}`)) || 0;

        const newUnread = currentUnread + 1;

        localStorage.setItem(`unread_${key}`, newUnread);

        setUnreadCounts((prev) => ({
          ...prev,
          [key]: newUnread,
        }));
      }
    });
  }, 1000);

  return () => clearInterval(interval);
}, [currentUser, otherUsers, selectedUser, isOpen]);

  useEffect(() => {
    if (!chatKey) {
      setChatMessages([]);
      return;
    }

    const saved = JSON.parse(localStorage.getItem(chatKey)) || [];
    setChatMessages(saved);
  }, [chatKey, isOpen]);

  useEffect(() => {
    const handleStorageChange = (event) => {
      if (!event.key || !currentUser?.id) return;

      if (event.key.startsWith("chat_")) {
        const saved = JSON.parse(localStorage.getItem(event.key)) || [];
        const lastMessage = saved[saved.length - 1];

        if (!lastMessage) return;

        const incomingChatKey = buildChatKey(currentUser.id, lastMessage.senderId);

        if (event.key !== incomingChatKey) return;

        if (event.key === chatKey) {
          setChatMessages(saved);
        }

        if (String(lastMessage.senderId) !== String(currentUser.id)) {
          receiveMessage(lastMessage);
        }
      }

      if (event.key.startsWith("unread_")) {
        const key = event.key.replace("unread_", "");
        const value = Number(localStorage.getItem(event.key)) || 0;

        setUnreadCounts((prev) => ({
          ...prev,
          [key]: value,
        }));
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [chatKey, currentUser, selectedUser, isOpen]);

  const sendMessage = () => {
    if (!input.trim() || !chatKey || !currentUser) return;

    const newMessage = {
      id: Date.now(),
      senderId: currentUser.id,
      senderName: currentUser.name || currentUser.email || "Unknown User",
      message: input.trim(),
      time: new Date().toLocaleString(),
    };

    const updated = [...chatMessages, newMessage];
    setChatMessages(updated);
    localStorage.setItem(chatKey, JSON.stringify(updated));
    setInput("");
  };

  return (
    <>
      <div
        style={{
          position: "fixed",
          right: "20px",
          bottom: "20px",
          zIndex: 9999,
        }}
      >
        <button
          onClick={() => setIsOpen((prev) => !prev)}
          style={{
            width: "60px",
            height: "60px",
            borderRadius: "50%",
            border: "none",
            cursor: "pointer",
            fontSize: "24px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
            position: "relative",
          }}
        >
          💬

          {totalUnread > 0 && (
            <span
              style={{
                position: "absolute",
                top: "-5px",
                right: "-5px",
                minWidth: "22px",
                height: "22px",
                padding: "0 6px",
                background: "red",
                color: "white",
                borderRadius: "999px",
                fontSize: "12px",
                fontWeight: "bold",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "2px solid white",
              }}
            >
              {totalUnread}
            </span>
          )}
        </button>
      </div>

      {isOpen && (
        <div
          style={{
            position: "fixed",
            right: "20px",
            bottom: "90px",
            width: "420px",
            height: "500px",
            background: "#fff",
            border: "1px solid #ccc",
            borderRadius: "16px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
            display: "flex",
            overflow: "hidden",
            zIndex: 9999,
          }}
        >
          <div
            style={{
              color: "#000",
              width: "150px",
              borderRight: "1px solid #eee",
              padding: "10px",
              overflowY: "auto",
              background: "#f8f8f8",
            }}
          >
            <h4 style={{ marginTop: 0 }}>Users</h4>

            {otherUsers.length === 0 ? (
              <p style={{ fontSize: "14px" }}>No users</p>
            ) : (
              otherUsers.map((user) => {
                const key = buildChatKey(currentUser.id, user.id);
                const unread = unreadCounts[key] || 0;

                return (
                  <button
                    key={user.id}
                    onClick={() => openChat(user)}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      width: "100%",
                      textAlign: "left",
                      padding: "8px",
                      marginBottom: "6px",
                      borderRadius: "8px",
                      border:
                        selectedUser?.id === user.id
                          ? "2px solid #999"
                          : "1px solid #ddd",
                      background:
                        selectedUser?.id === user.id ? "#e9ecef" : "#fff",
                      cursor: "pointer",
                      color: "#000",
                    }}
                  >
                    <span
                      style={{
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        marginRight: "8px",
                        flex: 1,
                      }}
                    >
                      {user.name || user.email || "No name"}
                    </span>

                    {unread > 0 && (
                      <span
                        style={{
                          background: "red",
                          color: "white",
                          borderRadius: "999px",
                          minWidth: "20px",
                          height: "20px",
                          padding: "0 6px",
                          fontSize: "12px",
                          fontWeight: "bold",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {unread}
                      </span>
                    )}
                  </button>
                );
              })
            )}
          </div>

          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                padding: "14px 16px",
                borderBottom: "1px solid #eee",
                fontWeight: "bold",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <span
                style={{
                  flex: 1,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {selectedUser
                  ? `Chat with ${selectedUser.name || selectedUser.email || "User"}`
                  : "Select a user"}
              </span>

              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <button
                  onClick={deleteConversation}
                  disabled={!chatKey}
                  style={{
                    border: "none",
                    background: "#dc3545",
                    color: "#fff",
                    padding: "6px 10px",
                    borderRadius: "8px",
                    cursor: chatKey ? "pointer" : "not-allowed",
                    opacity: chatKey ? 1 : 0.6,
                    fontSize: "12px",
                  }}
                >
                  Delete
                </button>

                <button
                  onClick={() => setIsOpen(false)}
                  style={{
                    border: "none",
                    background: "transparent",
                    fontSize: "18px",
                    cursor: "pointer",
                  }}
                >
                  ✕
                </button>
              </div>
            </div>

            <div
              style={{
                flex: 1,
                padding: "10px",
                minHeight: 0,
                overflow: "hidden",
              }}
            >
              <ChatMessages
                chatMessages={chatMessages}
                currentUserId={currentUser?.id}
              />
            </div>

            <div
              style={{
                borderTop: "1px solid #eee",
                padding: "10px",
                display: "flex",
                gap: "8px",
              }}
            >
              <textarea
                placeholder="Type a message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                rows={1}
                style={{
                  flex: 1,
                  padding: "10px",
                  borderRadius: "10px",
                  border: "1px solid #ccc",
                  resize: "none",
                  overflowY: "auto",
                  maxHeight: "100px",
                }}
              />

              <button
                onClick={sendMessage}
                disabled={!chatKey}
                style={{
                  padding: "10px 14px",
                  borderRadius: "10px",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default ChatPopup;