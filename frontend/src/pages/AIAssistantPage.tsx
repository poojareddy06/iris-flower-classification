import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage } from '../types';
import { api } from '../api/client';
import { useLanguage } from '../context/LanguageContext';
import {
  Bot,
  Send,
  Trash2,
  User,
  Copy,
  Check
} from 'lucide-react';

export const AIAssistantPage: React.FC = () => {
  const { language, t } = useLanguage();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initial welcome message localized
    setMessages([
      {
        role: 'assistant',
        content: `👋 ${t('ai_welcome_greeting')}\n\n${t('ai_welcome_body')}`,
        timestamp: new Date().toISOString(),
      },
    ]);
  }, [language]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || inputMessage;
    if (!text.trim() || isTyping) return;

    const userMsg: ChatMessage = {
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setIsTyping(true);

    try {
      const resp = await api.assistant.chat(text, 'default', language);
      setMessages(prev => [...prev, resp]);
    } catch (err: any) {
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: '⚠️ ' + err.message,
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleCopy = (content: string, idx: number) => {
    navigator.clipboard.writeText(content);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  const handleClearChat = () => {
    if (confirm('Clear chat conversation history?')) {
      setMessages([
        {
          role: 'assistant',
          content: `👋 ${t('ai_welcome_greeting')}\n\n${t('ai_welcome_body')}`,
          timestamp: new Date().toISOString(),
        },
      ]);
    }
  };

  const suggestedQuestions = [
    'What does the Decision Tree do?',
    'Why is Gini used?',
    'Explain my confusion matrix.',
    'Which feature is most important in Iris?',
    'Explain the 80/20 train/test split.'
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto h-[calc(100vh-120px)] flex flex-col justify-between">
      {/* Top Banner */}
      <div className="glass-panel p-4 sm:p-5 rounded-3xl border border-slate-800 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-iris-500/10 text-iris-400 flex items-center justify-center border border-iris-500/20">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-extrabold text-white">{t('ai_assistant_title')}</h2>
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                Active
              </span>
            </div>
            <p className="text-xs text-slate-400">
              {t('ai_assistant_desc')}
            </p>
          </div>
        </div>

        <button
          onClick={handleClearChat}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 text-xs transition"
          title="Clear Conversation"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{t('btn_clear_chat')}</span>
        </button>
      </div>

      {/* Chat Messages Body */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 flex-1 overflow-y-auto space-y-4">
        {messages.map((msg, idx) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={idx}
              className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!isUser && (
                <div className="w-8 h-8 rounded-xl bg-iris-500/20 text-iris-400 flex items-center justify-center shrink-0 border border-iris-500/30">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] sm:max-w-[75%] p-4 rounded-2xl text-xs sm:text-sm leading-relaxed relative group ${
                  isUser
                    ? 'bg-iris-600 text-white rounded-tr-none shadow-md shadow-iris-600/20'
                    : 'bg-slate-900/90 text-slate-200 rounded-tl-none border border-slate-800'
                }`}
              >
                <div className="whitespace-pre-wrap space-y-2">
                  {msg.content}
                </div>

                {!isUser && (
                  <button
                    onClick={() => handleCopy(msg.content, idx)}
                    className="absolute top-2 right-2 p-1 text-slate-500 hover:text-slate-200 opacity-0 group-hover:opacity-100 transition"
                    title="Copy Answer"
                  >
                    {copiedIdx === idx ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                )}
              </div>

              {isUser && (
                <div className="w-8 h-8 rounded-xl bg-slate-800 text-slate-300 flex items-center justify-center shrink-0 border border-slate-700">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}

        {isTyping && (
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 rounded-xl bg-iris-500/20 text-iris-400 flex items-center justify-center shrink-0 border border-iris-500/30">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-3 bg-slate-900/80 rounded-2xl rounded-tl-none border border-slate-800 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-iris-400 animate-bounce" />
              <span
                className="w-2 h-2 rounded-full bg-iris-400 animate-bounce"
                style={{ animationDelay: '0.2s' }}
              />
              <span
                className="w-2 h-2 rounded-full bg-iris-400 animate-bounce"
                style={{ animationDelay: '0.4s' }}
              />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Questions Chips */}
      <div className="space-y-2 shrink-0">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <span className="text-[11px] font-semibold text-slate-400 shrink-0">{t('suggested_questions_title')}:</span>
          {suggestedQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(q)}
              disabled={isTyping}
              className="px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 shrink-0 text-xs transition"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input Form */}
        <form
          onSubmit={e => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2 glass-panel p-2 rounded-2xl border border-slate-800"
        >
          <input
            type="text"
            value={inputMessage}
            onChange={e => setInputMessage(e.target.value)}
            placeholder={t('ai_input_placeholder')}
            disabled={isTyping}
            className="flex-1 bg-transparent px-4 py-2 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none"
          />
          <button
            type="submit"
            disabled={!inputMessage.trim() || isTyping}
            className="p-3 bg-iris-600 hover:bg-iris-500 disabled:opacity-30 disabled:pointer-events-none text-white rounded-xl shadow-md shadow-iris-600/30 transition"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
