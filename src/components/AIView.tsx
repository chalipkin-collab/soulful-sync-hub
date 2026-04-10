import { useState, useRef, useEffect } from "react";
import { Sparkles, Send, Bot, User, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface Message {
  id: string;
  text: string;
  sender: "user" | "ai";
}

const SUGGESTIONS = [
  "מה האירועים של השבוע?",
  "תזכיר לי משימות דחופות",
  "כמה חיילים בחופשה?",
  "תכין סיכום שבועי",
];

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;

export default function AIView() {
  const [messages, setMessages] = useState<Message[]>([
    { id: "1", sender: "ai", text: "שלום! אני העוזר החכם שלך 🪖\nאני יכול לעזור לך לנהל את לוח הזמנים, המשימות והחיילים. מה תרצה לעשות?" },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (text?: string) => {
    const msg = text || input.trim();
    if (!msg || isLoading) return;

    const userMsg: Message = { id: Date.now().toString(), sender: "user", text: msg };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    // Build conversation history for context
    const history = messages
      .filter(m => m.id !== "1") // skip initial greeting
      .map(m => ({ role: m.sender === "user" ? "user" as const : "assistant" as const, content: m.text }));
    history.push({ role: "user", content: msg });

    let assistantText = "";
    const assistantId = (Date.now() + 1).toString();

    try {
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: history }),
      });

      if (!resp.ok || !resp.body) {
        const errData = await resp.json().catch(() => null);
        throw new Error(errData?.error || "שגיאה בשירות AI");
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              assistantText += content;
              setMessages(prev => {
                const last = prev[prev.length - 1];
                if (last?.sender === "ai" && last.id === assistantId) {
                  return prev.map((m, i) => i === prev.length - 1 ? { ...m, text: assistantText } : m);
                }
                return [...prev, { id: assistantId, sender: "ai", text: assistantText }];
              });
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      // If no response came through
      if (!assistantText) {
        setMessages(prev => [...prev, { id: assistantId, sender: "ai", text: "לא הצלחתי לעבד את הבקשה, נסה שוב 😊" }]);
      }
    } catch (e) {
      console.error("AI chat error:", e);
      setMessages(prev => [...prev, {
        id: assistantId, sender: "ai",
        text: e instanceof Error ? e.message : "שגיאה בחיבור לשירות AI, נסה שוב."
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] animate-fade-in-up">
      <div className="flex items-center gap-2 justify-end mb-4">
        <h2 className="text-xl font-bold">עוזר חכם</h2>
        <Sparkles className="w-5 h-5 text-primary" />
      </div>

      <div className="flex-1 overflow-y-auto flex flex-col gap-3 pb-4">
        {messages.map((msg, i) => (
          <div
            key={msg.id}
            className={`flex gap-2 animate-fade-in-up ${msg.sender === "user" ? "flex-row-reverse" : ""}`}
            style={{ animationDelay: `${Math.min(i, 3) * 100}ms` }}
          >
            <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
              msg.sender === "ai" ? "bg-primary/20 text-primary" : "bg-muted text-foreground"
            }`}>
              {msg.sender === "ai" ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
            </div>
            <div className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${
              msg.sender === "ai"
                ? "glass-card text-right"
                : "bg-primary text-primary-foreground"
            }`}>
              {msg.sender === "ai" ? (
                <div className="prose prose-sm dark:prose-invert max-w-none text-right [direction:rtl]">
                  <ReactMarkdown>{msg.text}</ReactMarkdown>
                </div>
              ) : (
                <span className="whitespace-pre-line">{msg.text}</span>
              )}
            </div>
          </div>
        ))}
        {isLoading && messages[messages.length - 1]?.sender === "user" && (
          <div className="flex gap-2">
            <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 bg-primary/20 text-primary">
              <Bot className="w-4 h-4" />
            </div>
            <div className="glass-card rounded-2xl px-3 py-2">
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {messages.length <= 2 && (
        <div className="flex gap-2 flex-wrap justify-end mb-3">
          {SUGGESTIONS.map(s => (
            <button
              key={s}
              onClick={() => handleSend(s)}
              disabled={isLoading}
              className="px-3 py-1.5 rounded-full bg-muted text-xs text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors disabled:opacity-50"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      <div className="flex gap-2 items-center">
        <button
          onClick={() => handleSend()}
          disabled={isLoading || !input.trim()}
          className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          <Send className="w-4 h-4" />
        </button>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleSend()}
          placeholder="שאל אותי משהו..."
          disabled={isLoading}
          className="flex-1 bg-muted rounded-full px-4 py-2.5 text-sm text-right outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
        />
      </div>
    </div>
  );
}
