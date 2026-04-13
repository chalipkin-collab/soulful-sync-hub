import { useState, useRef, useEffect, useCallback } from "react";
import { Sparkles, Send, Bot, User, Loader2, Trash2, Mic, MicOff, Paperclip, FileText, Image as ImageIcon } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { supabase } from "@/integrations/supabase/client";
import ExtractionConfirmDialog, { ExtractionResult } from "./ExtractionConfirmDialog";

interface Message {
  id: string;
  text: string;
  sender: "user" | "ai";
}

interface AIViewProps {
  context?: {
    events: any[];
    tasks: any[];
    soldiers: any[];
  };
  onDataChanged?: () => void;
}

const SUGGESTIONS = [
  "מה האירועים של השבוע?",
  "תזכיר לי משימות דחופות",
  "כמה חיילים בחופשה?",
  "תוסיף אירוע אימון ביום ראשון הקרוב",
];

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;

const GREETING: Message = {
  id: "greeting",
  sender: "ai",
  text: "שלום! אני העוזר החכם שלך 🪖\nאני מכיר את כל האירועים, המשימות והחיילים שלך. אני גם יכול להוסיף אירועים ומשימות חדשים!\n\n🎤 אפשר לדבר אליי בקול\n📎 אפשר להעלות קובץ טקסט או תמונה\n\nמה תרצה לעשות?",
};

function formatExtractionForHistory(data: ExtractionResult): string {
  const parts: string[] = [];
  if (data.summary) parts.push(data.summary);
  if (data.events.length) {
    parts.push(`**אירועים (${data.events.length}):**`);
    data.events.forEach(e => parts.push(`• ${e.title} - ${e.date}${e.time ? ` ${e.time}` : ""} (${e.type})`));
  }
  if (data.tasks.length) {
    parts.push(`**משימות (${data.tasks.length}):**`);
    data.tasks.forEach(t => parts.push(`• ${t.title} - יעד: ${t.dueDate} (${t.priority})`));
  }
  if (data.soldiers.length) {
    parts.push(`**חיילים (${data.soldiers.length}):**`);
    data.soldiers.forEach(s => parts.push(`• ${s.name} - ${s.unit} (${s.status})`));
  }
  return parts.join("\n");
}

export default function AIView({ context, onDataChanged }: AIViewProps) {
  const [messages, setMessages] = useState<Message[]>([GREETING]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [pendingExtraction, setPendingExtraction] = useState<ExtractionResult | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("chat_messages")
        .select("*")
        .order("created_at", { ascending: true });
      if (data && data.length > 0) {
        const loaded: Message[] = [GREETING, ...data.map(m => ({
          id: m.id,
          text: m.content,
          sender: (m.role === "user" ? "user" : "ai") as "user" | "ai",
        }))];
        setMessages(loaded);
      }
      setHistoryLoaded(true);
    })();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const persistMessage = useCallback(async (role: string, content: string) => {
    await supabase.from("chat_messages").insert({ role, content });
  }, []);

  const clearHistory = useCallback(async () => {
    await supabase.from("chat_messages").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    setMessages([GREETING]);
  }, []);

  // Voice recording via Web Speech API
  const toggleRecording = useCallback(() => {
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("הדפדפן שלך לא תומך בזיהוי קולי. נסה Chrome.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "he-IL";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.continuous = false;

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      if (transcript) {
        handleSend(transcript);
      }
      setIsRecording(false);
    };

    recognition.onerror = () => {
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsRecording(true);
  }, [isRecording]);

  // File upload handler
  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";

    const isImage = file.type.startsWith("image/");
    const isText = file.type.startsWith("text/") || file.name.endsWith(".txt") || file.name.endsWith(".csv") || file.name.endsWith(".json") || file.name.endsWith(".md");
    const isAudio = file.type.startsWith("audio/");

    if (!isImage && !isText && !isAudio) {
      alert("פורמט לא נתמך. אפשר להעלות תמונה, טקסט או קובץ אודיו.");
      return;
    }

    setIsLoading(true);
    const userMsg: Message = {
      id: Date.now().toString(),
      sender: "user",
      text: `📎 קובץ: ${file.name}`,
    };
    setMessages(prev => [...prev, userMsg]);

    try {
      if (isText) {
        const text = await file.text();
        await processExtraction(text, `תוכן מקובץ "${file.name}":\n${text}`);
      } else if (isImage) {
        const base64 = await fileToBase64(file);
        await processExtraction(`[תמונה: ${file.name}]`, undefined, base64, file.type);
      } else if (isAudio) {
        // Audio file - transcribe via edge function
        const base64 = await fileToBase64(file);
        await processExtraction(`[הקלטה: ${file.name}]`, undefined, base64, file.type);
      }
    } catch (err) {
      console.error("File processing error:", err);
      const errMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: "ai",
        text: "שגיאה בעיבוד הקובץ, נסה שוב.",
      };
      setMessages(prev => [...prev, errMsg]);
    } finally {
      setIsLoading(false);
    }
  }, [context]);

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result.split(",")[1]); // Remove data:...;base64, prefix
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // Process content through extraction endpoint
  const processExtraction = async (displayText: string, textContent?: string, base64?: string, mimeType?: string) => {
    try {
      const body: any = { context, mode: "extract" };
      if (textContent) body.text = textContent;
      if (base64) {
        body.file_base64 = base64;
        body.file_mime_type = mimeType;
      }

      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify(body),
      });

      if (!resp.ok) throw new Error("Extraction failed");

      const result = await resp.json();
      
      if (result.extraction) {
        setPendingExtraction(result.extraction);
        const extractionText = formatExtractionForHistory(result.extraction);
        const aiMsg: Message = {
          id: (Date.now() + 1).toString(),
          sender: "ai",
          text: "📋 ניתחתי את התוכן. בדוק את הפריטים למטה ואשר מה לשמור:",
        };
        setMessages(prev => [...prev, aiMsg]);
        persistMessage("assistant", `📋 ניתוח תוכן:\n${extractionText}`);
      } else {
        const aiMsg: Message = {
          id: (Date.now() + 1).toString(),
          sender: "ai",
          text: result.content || "לא הצלחתי לחלץ מידע רלוונטי מהתוכן.",
        };
        setMessages(prev => [...prev, aiMsg]);
      }
    } catch (err) {
      console.error("Extraction error:", err);
      const errMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: "ai",
        text: "שגיאה בניתוח התוכן, נסה שוב.",
      };
      setMessages(prev => [...prev, errMsg]);
    }
  };

  // Handle extraction confirmation
  const handleConfirmExtraction = useCallback(async (data: ExtractionResult) => {
    // Save extraction summary to chat history before confirming
    const extractionSummary = formatExtractionForHistory(data);
    persistMessage("assistant", extractionSummary);

    setPendingExtraction(null);
    setIsLoading(true);

    const results: string[] = [];

    for (const event of data.events) {
      const { error } = await supabase.from("events").insert({
        title: event.title,
        date: event.date,
        type: event.type,
        description: event.description || null,
        time: event.time || null,
        end_time: event.endTime || null,
        location: event.location || null,
      });
      if (!error) results.push(`✅ אירוע: ${event.title}`);
      else results.push(`❌ שגיאה באירוע: ${event.title}`);
    }

    for (const task of data.tasks) {
      const { error } = await supabase.from("tasks").insert({
        title: task.title,
        due_date: task.dueDate,
        priority: task.priority,
        completed: false,
      });
      if (!error) results.push(`✅ משימה: ${task.title}`);
      else results.push(`❌ שגיאה במשימה: ${task.title}`);
    }

    for (const soldier of data.soldiers) {
      const { error } = await supabase.from("soldiers").insert({
        name: soldier.name,
        unit: soldier.unit,
        status: soldier.status,
        phone: soldier.phone || null,
      });
      if (!error) results.push(`✅ חייל: ${soldier.name}`);
      else results.push(`❌ שגיאה בחייל: ${soldier.name}`);
    }

    const resultMsg: Message = {
      id: Date.now().toString(),
      sender: "ai",
      text: results.length > 0 ? results.join("\n") : "לא נשמרו פריטים.",
    };
    setMessages(prev => [...prev, resultMsg]);
    persistMessage("assistant", resultMsg.text);

    if (results.some(r => r.startsWith("✅"))) {
      onDataChanged?.();
    }

    setIsLoading(false);
  }, [onDataChanged, persistMessage]);

  const handleSend = async (text?: string) => {
    const msg = text || input.trim();
    if (!msg || isLoading) return;

    const userMsg: Message = { id: Date.now().toString(), sender: "user", text: msg };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    persistMessage("user", msg);

    const history = messages
      .filter(m => m.id !== "greeting")
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
        body: JSON.stringify({ messages: history, context }),
      });

      if (!resp.ok || !resp.body) {
        const errData = await resp.json().catch(() => null);
        throw new Error(errData?.error || "שגיאה בשירות AI");
      }

      const toolActions = resp.headers.get("X-Tool-Actions");
      const hadToolActions = !!toolActions;

      const contentType = resp.headers.get("Content-Type") || "";
      
      if (contentType.includes("application/json")) {
        const data = await resp.json();
        assistantText = data.content || "לא הצלחתי לעבד את הבקשה";
        setMessages(prev => [...prev, { id: assistantId, sender: "ai", text: assistantText }]);
        if (data.tool_actions?.length) onDataChanged?.();
      } else {
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

        if (hadToolActions) onDataChanged?.();
      }

      if (!assistantText) {
        assistantText = "לא הצלחתי לעבד את הבקשה, נסה שוב 😊";
        setMessages(prev => [...prev, { id: assistantId, sender: "ai", text: assistantText }]);
      }

      persistMessage("assistant", assistantText);
    } catch (e) {
      console.error("AI chat error:", e);
      const errText = e instanceof Error ? e.message : "שגיאה בחיבור לשירות AI, נסה שוב.";
      setMessages(prev => [...prev, { id: assistantId, sender: "ai", text: errText }]);
      persistMessage("assistant", errText);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] animate-fade-in-up">
      <div className="flex items-center gap-2 justify-between mb-4">
        <button onClick={clearHistory} className="text-muted-foreground hover:text-destructive transition-colors p-2" title="נקה היסטוריה">
          <Trash2 className="w-4 h-4" />
        </button>
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold">עוזר חכם</h2>
          <Sparkles className="w-5 h-5 text-primary" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto flex flex-col gap-3 pb-4">
        {messages.map((msg, i) => (
          <div key={msg.id} className={`flex gap-2 animate-fade-in-up ${msg.sender === "user" ? "flex-row-reverse" : ""}`} style={{ animationDelay: `${Math.min(i, 3) * 100}ms` }}>
            <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${msg.sender === "ai" ? "bg-primary/20 text-primary" : "bg-muted text-foreground"}`}>
              {msg.sender === "ai" ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
            </div>
            <div className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${msg.sender === "ai" ? "glass-card text-right" : "bg-primary text-primary-foreground"}`}>
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

        {pendingExtraction && (
          <ExtractionConfirmDialog
            data={pendingExtraction}
            onConfirm={handleConfirmExtraction}
            onCancel={() => setPendingExtraction(null)}
          />
        )}

        {isLoading && messages[messages.length - 1]?.sender === "user" && !pendingExtraction && (
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

      {messages.length <= 2 && historyLoaded && (
        <div className="flex gap-2 flex-wrap justify-end mb-3">
          {SUGGESTIONS.map(s => (
            <button key={s} onClick={() => handleSend(s)} disabled={isLoading} className="px-3 py-1.5 rounded-full bg-muted text-xs text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors disabled:opacity-50">
              {s}
            </button>
          ))}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,.txt,.csv,.json,.md,audio/*"
        className="hidden"
        onChange={handleFileUpload}
      />

      <div className="flex gap-2 items-center">
        <button onClick={() => handleSend()} disabled={isLoading || !input.trim()} className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors disabled:opacity-50">
          <Send className="w-4 h-4" />
        </button>
        <button
          onClick={toggleRecording}
          disabled={isLoading}
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors disabled:opacity-50 ${
            isRecording
              ? "bg-destructive text-destructive-foreground animate-pulse"
              : "bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80"
          }`}
          title={isRecording ? "עצור הקלטה" : "הקלט קול"}
        >
          {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
        </button>
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isLoading}
          className="w-10 h-10 rounded-full bg-muted text-muted-foreground flex items-center justify-center hover:text-foreground hover:bg-muted/80 transition-colors disabled:opacity-50"
          title="העלה קובץ"
        >
          <Paperclip className="w-4 h-4" />
        </button>
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSend()} placeholder="שאל אותי משהו..." disabled={isLoading} className="flex-1 bg-muted rounded-full px-4 py-2.5 text-sm text-right outline-none focus:ring-1 focus:ring-primary disabled:opacity-50" />
      </div>
    </div>
  );
}
