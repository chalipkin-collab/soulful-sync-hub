import { useState } from "react";
import { Sparkles, Send, Bot, User } from "lucide-react";

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

export default function AIView() {
  const [messages, setMessages] = useState<Message[]>([
    { id: "1", sender: "ai", text: "שלום! אני העוזר החכם שלך 🪖\nאני יכול לעזור לך לנהל את לוח הזמנים, המשימות והחיילים. מה תרצה לעשות?" },
  ]);
  const [input, setInput] = useState("");

  const handleSend = (text?: string) => {
    const msg = text || input.trim();
    if (!msg) return;

    setMessages(prev => [...prev, { id: Date.now().toString(), sender: "user", text: msg }]);
    setInput("");

    // Simulated AI response
    setTimeout(() => {
      const responses: Record<string, string> = {
        "מה האירועים של השבוע?": "השבוע יש לכם:\n• תפילת שחרית משותפת - 15/04\n• אימון כושר קרבי - 18/04\n• הרצאה בנושא ביטחון - 20/04",
        "תזכיר לי משימות דחופות": "המשימות הדחופות שלך:\n🔴 לעדכן רשימת חיילים - עד 14/04\n✅ לאשר חופשות פסח - הושלם!",
        "כמה חיילים בחופשה?": "כרגע חייל אחד בחופשה:\n• משה ישראלי - פלוגה ב׳\nוחייל אחד במילואים:\n• יעקב גולדשטיין - פלוגה א׳",
        "תכין סיכום שבועי": "📊 סיכום שבועי:\n• 6 אירועים מתוכננים\n• 3 משימות פתוחות (2 דחופות)\n• 5 חיילים, 3 פעילים\n• אירוע הבא: חופשת פסח 12/04",
      };
      const reply = responses[msg] || "קיבלתי! אני מעבד את הבקשה שלך. בגרסה הבאה אוכל לתת תשובות מדויקות יותר 😊";
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), sender: "ai", text: reply }]);
    }, 800);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center gap-2 justify-end mb-4">
        <h2 className="text-xl font-bold">עוזר חכם</h2>
        <Sparkles className="w-5 h-5 text-primary" />
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto flex flex-col gap-3 pb-4">
        {messages.map((msg, i) => (
          <div
            key={msg.id}
            className={`flex gap-2 animate-fade-in-up ${msg.sender === "user" ? "flex-row-reverse" : ""}`}
            style={{ animationDelay: `${i * 100}ms` }}
          >
            <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
              msg.sender === "ai" ? "bg-primary/20 text-primary" : "bg-muted text-foreground"
            }`}>
              {msg.sender === "ai" ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
            </div>
            <div className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm whitespace-pre-line ${
              msg.sender === "ai"
                ? "glass-card text-right"
                : "bg-primary text-primary-foreground"
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
      </div>

      {/* Suggestions */}
      {messages.length <= 2 && (
        <div className="flex gap-2 flex-wrap justify-end mb-3">
          {SUGGESTIONS.map(s => (
            <button
              key={s}
              onClick={() => handleSend(s)}
              className="px-3 py-1.5 rounded-full bg-muted text-xs text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="flex gap-2 items-center">
        <button
          onClick={() => handleSend()}
          className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors"
        >
          <Send className="w-4 h-4" />
        </button>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleSend()}
          placeholder="שאל אותי משהו..."
          className="flex-1 bg-muted rounded-full px-4 py-2.5 text-sm text-right outline-none focus:ring-1 focus:ring-primary"
        />
      </div>
    </div>
  );
}
