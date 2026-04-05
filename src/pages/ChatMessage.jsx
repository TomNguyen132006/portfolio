import HR from '../assets/HR.png';
import user from '../assets/user.png';
import './ChatMessage.css';

export function ChatMessage({ message, isMine }) {
  return (
    <div className={isMine ? 'chat-message-user' : 'chat-message-other'}>
      {!isMine && (
        <img
          src={HR}
          className="chat-message-profile"
          alt="other user"
        />
      )}

      <div className="chat-message-text">
        {message}
      </div>

      {isMine && (
        <img
          src={user}
          className="chat-message-profile"
          alt="current user"
        />
      )}
    </div>
  );
}