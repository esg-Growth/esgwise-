'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, Loader2, Sparkles, HelpCircle } from 'lucide-react';
import styles from './chat.module.css';
import { useI18n } from '@/lib/i18n';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export function AiAssistant() {
  const { locale } = useI18n();
  const isAr = locale === 'ar';
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: isAr ? 'مرحباً! أنا مساعدك الذكي في ESGwise. كيف يمكنني مساعدتك اليوم؟' : "Hello! I'm your ESGwise AI assistant. How can I help you with your ESG assessment today?" }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg, history: messages })
      });
      
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: isAr ? 'عذراً، حدث خطأ ما.' : 'Sorry, something went wrong.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.wrapper}>
      {/* Floating Button */}
      <button 
        className={`${styles.toggleBtn} ${isOpen ? styles.active : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Open AI Assistant"
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
        {!isOpen && <span className={styles.badge}><Sparkles size={12} /></span>}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className={styles.chatWindow}>
          <div className={styles.header}>
            <div className={styles.headerTitle}>
              <div className={styles.botIcon}><Bot size={18} /></div>
              <div>
                <h3>ESGwise Assistant</h3>
                <span className={styles.onlineStatus}>{isAr ? 'متصل' : 'Online'}</span>
              </div>
            </div>
            <button className={styles.closeBtn} onClick={() => setIsOpen(false)}><X size={18} /></button>
          </div>

          <div className={styles.messages} ref={scrollRef}>
            {messages.map((m, i) => (
              <div key={i} className={`${styles.message} ${m.role === 'user' ? styles.userMsg : styles.assistantMsg}`}>
                <div className={styles.msgAvatar}>
                  {m.role === 'assistant' ? <Bot size={14} /> : <User size={14} />}
                </div>
                <div className={styles.msgBubble}>
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className={`${styles.message} ${styles.assistantMsg}`}>
                <div className={styles.msgAvatar}><Bot size={14} /></div>
                <div className={styles.msgBubble}>
                  <Loader2 className="animate-spin" size={16} />
                </div>
              </div>
            )}
          </div>

          <div className={styles.footer}>
            <div className={styles.inputArea}>
              <input 
                type="text" 
                placeholder={isAr ? 'اسأل أي شيء...' : 'Ask anything...'}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              />
              <button className={styles.sendBtn} onClick={handleSend} disabled={!input.trim() || loading}>
                <Send size={18} />
              </button>
            </div>
            <div className={styles.suggestions}>
              <button onClick={() => setInput(isAr ? 'ما هي معايير GRI؟' : 'What are GRI standards?')}>
                <HelpCircle size={12} /> {isAr ? 'GRI ما هي' : 'What is GRI?'}
              </button>
              <button onClick={() => setInput(isAr ? 'كيف أحسن درجة البيئة؟' : 'How to improve Env score?')}>
                <Sparkles size={12} /> {isAr ? 'تحسين درجة البيئة' : 'Improve Env'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
