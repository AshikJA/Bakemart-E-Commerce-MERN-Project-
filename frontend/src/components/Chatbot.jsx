import { useState, useRef, useEffect } from 'react';
import { FiMessageCircle, FiX, FiSend } from 'react-icons/fi';
import { BsRobot } from 'react-icons/bs';
import api from '../api/client';

const INITIAL_MESSAGE = {
  id: 'welcome',
  from: 'bot',
  text: "👋 Hi! Welcome to BakeMart! 🍫\n\nI'm your assistant. How can I help you today?\n\nI can help with:\n• 📦 Order tracking (share Order ID)\n• 🍫 Product info & recommendations\n• 🚚 Delivery info\n• ↩️ Returns & refunds\n• 💳 Payment options",
  time: new Date(),
};

const QUICK_REPLIES = [
  { id: 1, text: 'Track my order' },
  { id: 2, text: 'Return policy' },
  { id: 3, text: 'Delivery charges' },
  { id: 4, text: 'Payment options' },
  { id: 5, text: 'Best chocolates' },
];

function formatTime(date) {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function BotMessage({ text }) {
  const lines = text.split('\n');
  return (
    <div className="space-y-1">
      {lines.map((line, i) => {
        // Handle bold text
        const parts = line.split(/(\*\*[^*]+\*\*)/g);
        return (
          <p key={i} className="text-sm leading-relaxed">
            {parts.map((part, j) => 
              part.startsWith('**') && part.endsWith('**') 
                ? <strong key={j} className="font-bold">{part.slice(2, -2)}</strong>
                : part
            )}
          </p>
        );
      })}
    </div>
  );
}

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([INITIAL_MESSAGE]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [unread, setUnread] = useState(0);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      setUnread(0);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const getUserId = () => {
    // Try to get userId from token
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.id || payload._id;
      }
    } catch {}
    return null;
  };

  const sendMessage = async (text) => {
    const msg = text || input.trim();
    if (!msg || loading) return;

    if (!text) {
      setInput('');
    }

    // Add user message
    const userMsg = {
      id: Date.now(),
      from: 'user',
      text: msg,
      time: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const userId = getUserId();
      const { data } = await api.post('/chatbot', { message: msg, userId });

      const botMsg = {
        id: Date.now() + 1,
        from: 'bot',
        text: data.reply || "Sorry, I couldn't understand that. Can you try again?",
        time: new Date(),
      };
      setMessages(prev => [...prev, botMsg]);
      
      if (!isOpen) {
        setUnread(prev => prev + 1);
      }
    } catch (error) {
      const errorMsg = {
        id: Date.now() + 1,
        from: 'bot',
        text: "Sorry, I'm having trouble connecting. Please try again! 🙏\n\nYou can also email us at Bakemartsullia123@gmail.com for help.",
        time: new Date(),
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95"
        style={{ background: 'linear-gradient(135deg, #6B3F1F, #A0522D)' }}
      >
        {isOpen ? (
          <FiX className="w-6 h-6 text-[#FDF6EC]" />
        ) : (
          <>
            <FiMessageCircle className="w-6 h-6 text-[#FDF6EC]" />
            {unread > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-bounce">
                {unread}
              </span>
            )}
          </>
        )}
      </button>

      {/* Chatbox Popup */}
      <div
        className={`fixed bottom-24 right-6 z-50 w-80 md:w-96 flex flex-col rounded-3xl shadow-2xl overflow-hidden transition-all duration-300 origin-bottom-right ${
          isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
        style={{ height: '500px', background: '#FFFDF9' }}
      >
        {/* Header */}
        <div 
          className="flex items-center justify-between px-5 py-4 flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #6B3F1F, #A0522D)' }}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: '#D4A96A' }}>
              <BsRobot className="w-5 h-5 text-[#6B3F1F]" />
            </div>
            <div>
              <h3 className="text-white font-bold text-sm"> Assistant</h3>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-white/70 text-[11px]">Online</span>
              </div>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="w-8 h-8 rounded-full flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Messages Area */}
        <div 
          className="flex-1 overflow-y-auto px-4 py-4 space-y-4"
          style={{ background: '#FDF6EC', scrollBehavior: 'smooth' }}
        >
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.from === 'bot' && (
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center mr-2 flex-shrink-0"
                  style={{ background: '#D4A96A' }}
                >
                  <BsRobot className="w-4 h-4 text-[#6B3F1F]" />
                </div>
              )}
              <div className="max-w-[75%] space-y-1">
                <div
                  className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                    msg.from === 'user'
                      ? 'text-white rounded-br-sm'
                      : 'text-[#4a2c10] rounded-bl-sm'
                  }`}
                  style={
                    msg.from === 'user'
                      ? { background: 'linear-gradient(135deg, #6B3F1F, #A0522D)' }
                      : { background: 'white', border: '1px solid #F5E6D3', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }
                  }
                >
                  <BotMessage text={msg.text} />
                </div>
                <p className={`text-[10px] text-gray-400 ${msg.from === 'user' ? 'text-right mr-1' : 'ml-1'}`}>
                  {formatTime(msg.time)}
                </p>
              </div>
            </div>
          ))}

          {/* Loading Animation */}
          {loading && (
            <div className="flex justify-start">
              <div 
                className="w-8 h-8 rounded-full flex items-center justify-center mr-2 flex-shrink-0"
                style={{ background: '#D4A96A' }}
              >
                <BsRobot className="w-4 h-4 text-[#6B3F1F]" />
              </div>
              <div 
                className="px-4 py-3 rounded-2xl rounded-bl-sm flex items-center gap-1"
                style={{ background: 'white', border: '1px solid #F5E6D3' }}
              >
                <span className="w-2 h-2 rounded-full animate-bounce" style={{ background: '#A0522D', animationDelay: '0ms' }} />
                <span className="w-2 h-2 rounded-full animate-bounce" style={{ background: '#A0522D', animationDelay: '150ms' }} />
                <span className="w-2 h-2 rounded-full animate-bounce" style={{ background: '#A0522D', animationDelay: '300ms' }} />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Replies */}
        <div className="px-4 py-2 flex gap-2 overflow-x-auto flex-shrink-0" style={{ background: 'white', borderTop: '1px solid #F5E6D3' }}>
          {QUICK_REPLIES.map((reply) => (
            <button
              key={reply.id}
              onClick={() => sendMessage(reply.text)}
              disabled={loading}
              className="flex-shrink-0 px-3 py-1.5 rounded-full text-[11px] font-medium transition-all hover:scale-105 active:scale-95 whitespace-nowrap"
              style={{ 
                background: '#F5E6D3', 
                color: '#6B3F1F',
                border: '1px solid #D4A96A'
              }}
            >
              {reply.text}
            </button>
          ))}
        </div>

        {/* Input Area */}
        <div 
          className="px-4 py-3 flex gap-2 flex-shrink-0"
          style={{ background: 'white', borderTop: '1px solid #F5E6D3' }}
        >
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            disabled={loading}
            className="flex-1 px-4 py-2.5 rounded-full text-sm outline-none"
            style={{ 
              background: '#FDF6EC', 
              color: '#4a2c10',
              border: '1px solid #F5E6D3'
            }}
          />
          <button
            onClick={() => sendMessage()}
            disabled={!input.trim() || loading}
            className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ background: 'linear-gradient(135deg, #6B3F1F, #A0522D)' }}
          >
            <FiSend className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>
    </>
  );
}
