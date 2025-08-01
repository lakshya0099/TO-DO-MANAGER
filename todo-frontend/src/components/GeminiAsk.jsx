import { useState, useRef, useEffect } from "react";
import {
  Send,
  Sparkles,
  MessageCircle,
  Copy,
  RefreshCw,
  AlertCircle,
  Check,
} from "lucide-react";

export default function GeminiAsk() {
  const [question, setQuestion] = useState("");
  const [conversation, setConversation] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const textareaRef = useRef(null);
  const conversationEndRef = useRef(null);

  useEffect(() => {
    conversationEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
    }
  }, [question]);

  const handleAsk = async () => {
    if (!question.trim() || isLoading) return;

    const userMessage = {
      id: Date.now() + Math.random(),
      type: "user",
      content: question.trim(),
      timestamp: new Date(),
    };

    setConversation((prev) => [...prev, userMessage]);
    setQuestion("");
    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/gemini/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: userMessage.content }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Unknown error");

      const aiMessage = {
        id: Date.now() + Math.random(),
        type: "ai",
        content: data.answer,
        timestamp: new Date(),
      };

      setConversation((prev) => [...prev, aiMessage]);
    } catch (err) {
      console.error("Gemini error:", err);
      setError("Failed to get a response from AI. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleAsk();
    }
  };

  const copyToClipboard = async (text, index) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      console.error("Copy failed:", err);
    }
  };

  const formatTime = (date) =>
    new Date(date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const clearConversation = () => {
    setConversation([]);
    setError(null);
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden mt-10">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
              <Sparkles size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">AI Assistant</h2>
              <p className="text-purple-100 text-sm">Ask me anything about productivity</p>
            </div>
          </div>
          {conversation.length > 0 && (
            <button
              onClick={clearConversation}
              className="p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-lg"
              title="Clear conversation"
            >
              <RefreshCw size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="h-96 overflow-y-auto p-4 bg-gray-50 space-y-4">
        {conversation.length === 0 && (
          <div className="text-center text-sm text-gray-600 mt-20">
            <MessageCircle className="mx-auto mb-4 text-purple-400" size={40} />
            <p>Start by asking a question about productivity, tasks, or planning.</p>
          </div>
        )}

        {conversation.map((msg, index) => (
          <div key={msg.id} className={`flex ${msg.type === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[80%] px-4 py-3 rounded-2xl ${
                msg.type === "user"
                  ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white"
                  : "bg-white border border-gray-200 text-gray-900"
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
              <div className="flex items-center justify-between mt-2 text-xs">
                <span className={`${msg.type === "user" ? "text-purple-200" : "text-gray-500"}`}>
                  {formatTime(msg.timestamp)}
                </span>
                {msg.type === "ai" && (
                  <button
                    onClick={() => copyToClipboard(msg.content, index)}
                    className="text-gray-400 hover:text-gray-600"
                    title="Copy"
                  >
                    {copiedIndex === index ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="text-left text-gray-500 text-sm px-4 py-2 animate-pulse">Typing...</div>
        )}

        <div ref={conversationEndRef} />
      </div>

    
      {error && (
        <div className="px-4 py-3 bg-red-50 border-t border-red-200 text-sm text-red-700 flex items-center gap-2">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      <div className="border-t border-gray-200 p-4 bg-white">
        <div className="flex gap-3">
          <textarea
            ref={textareaRef}
            rows={1}
            maxLength={300}
            className="w-full resize-none px-4 py-3 pr-12 border border-gray-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="Ask me something..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={handleKeyPress}
            disabled={isLoading}
          />
          <button
            onClick={handleAsk}
            disabled={!question.trim() || isLoading}
            className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-xl text-sm hover:from-purple-700 hover:to-blue-700 disabled:opacity-50"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
