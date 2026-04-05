import { useRef, useEffect } from "react";
import { ChatMessage } from "./ChatMessage";
import "./ChatMessages.css";

function ChatMessages({ chatMessages, currentUserId }) {
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  return (
    <div className="chat-messages-container">
      {chatMessages.map((msg) => (
        <ChatMessage
          key={msg.id}
          message={msg.message}
          isMine={String(msg.senderId) === String(currentUserId)}
        />
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
}

export default ChatMessages;