import { useEffect, useMemo, useState } from "react";
import ChatMessages from "./ChatMessages";

const buildChatKey = (id1, id2) => {
  const [a, b] = [String(id1), String(id2)].sort();
  return `chat_${a}_${b}`;
};

function ChatPopup({
  currentUser,
  users = [],
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [input, setInput] = useState("");
  const [chatMessages, setChatMessages] = useState([]);

  const otherUsers = useMemo(() => {
    return users.filter((user) => String(user.id) !== String(currentUser?.id));
  }, [users, currentUser]);

  const chatKey = useMemo(() => {
    if (!currentUser?.id || !selectedUser?.id) return "";
    return buildChatKey(currentUser.id, selectedUser.id);
  }, [currentUser, selectedUser]);

  useEffect(() => {
    if (!chatKey) {
      setChatMessages([]);
      return;
    }

    const saved = JSON.parse(localStorage.getItem(chatKey)) || [];
    setChatMessages(saved);
  }, [chatKey, isOpen]);

  const sendMessage = () => {
    if (!input.trim() || !chatKey || !currentUser) return;

    const newMessage = {
      id: Date.now(),
      senderId: currentUser.id,
      senderName: currentUser.name || "Unknown User",
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
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        style={{
          position: "fixed",
          right: "20px",
          bottom: "20px",
          width: "60px",
          height: "60px",
          borderRadius: "50%",
          border: "none",
          cursor: "pointer",
          fontSize: "24px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
          zIndex: 9999,
        }}
      >
        💬
      </button>

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
              otherUsers.map((user) => (
                <button
                  key={user.id}
                  onClick={() => setSelectedUser(user)}
                  style={{
                    display: "block",
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
                  {user.name || user.email || "No name"}
                </button>
              ))
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
              }}
            >
              <span>
                {selectedUser
                  ? `Chat with ${selectedUser.name || selectedUser.email || "User"}`
                  : "Select a user"}
              </span>

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
                    e.preventDefault(); // prevent new line
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