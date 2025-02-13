import React, { useEffect, useRef } from 'react';
import { ChatMessagesProps, Message } from '../types';

const ChatMessages: React.FC<ChatMessagesProps> = ({ messages = [] }) => {

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="chat-container">
      <div className="messages-container">
        <div className="messages-wrapper">
          {messages.map((message: Message) => {
            const isUser: boolean = message.role === 'user';
            const messageText: string = message.content[0]?.transcript || '';

            return (
              <div key={message.id} className={`message ${isUser ? 'user-message' : 'assistant-message'}`}>
                <div className="message-content">
                  {/* Avatar */}
                  <div className="avatar">
                    {isUser ? 'U' : 'A'}
                  </div>

                  {/* Message bubble */}
                  <div className="bubble">
                    <div className="sender-name">
                      {isUser ? 'User' : 'Assistant'}
                    </div>
                    <p className="text">{messageText}</p>
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
      </div>
    </div>
  );
};

export default ChatMessages;