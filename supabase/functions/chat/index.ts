import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const tools = [
  {
    type: "function",
    function: {
      name: "add_event",
      description: "הוסף אירוע חדש ללוח השנה",
      parameters: {
        type: "object",
        properties: {
          title: { type: "string", description: "כותרת האירוע" },
          date: { type: "string", description: "תאריך בפורמט YYYY-MM-DD" },
          type: { type: "string", enum: ["מכינה", "גיוס", "חופשה", "תפילה", "אימון", "כללי"], description: "סוג האירוע" },
          description: { type: "string", description: "תיאור האירוע (אופציונלי)" },
          time: { type: "string", description: "שעה בפורמט HH:MM (אופציונלי)" },
        },
        required: ["title", "date", "type"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "add_task",
      description: "הוסף משימה חדשה",
      parameters: {
        type: "object",
        properties: {
          title: { type: "string", description: "כותרת המשימה" },
          due_date: { type: "string", description: "תאריך יעד בפורמט YYYY-MM-DD" },
          priority: { type: "string", enum: ["דחוף", "בינוני", "רגיל"], description: "עדיפות" },
        },
        required: ["title", "due_date", "priority"],
      },
    },
  },
];

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, context } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Build context string from app data
    let contextStr = "";
    if (context) {
      if (context.events?.length) {
        contextStr += "\n\nאירועים במערכת:\n" + context.events.map((e: any) =>
          `- ${e.title} (${e.date}${e.time ? " " + e.time : ""}, סוג: ${e.type}${e.description ? ", " + e.description : ""})`
        ).join("\n");
      }
      if (context.tasks?.length) {
        contextStr += "\n\nמשימות במערכת:\n" + context.tasks.map((t: any) =>
          `- ${t.title} (יעד: ${t.dueDate}, עדיפות: ${t.priority}, ${t.completed ? "הושלם ✅" : "לא הושלם"})`
        ).join("\n");
      }
      if (context.soldiers?.length) {
        contextStr += "\n\nחיילים במערכת:\n" + context.soldiers.map((s: any) =>
          `- ${s.name} (יחידה: ${s.unit}, סטטוס: ${s.status}${s.phone ? ", טל: " + s.phone : ""})`
        ).join("\n");
      }
    }

    const today = new Date().toISOString().split("T")[0];
    const systemPrompt = `אתה עוזר חכם לניהול צבאי. אתה עוזר למפקדים לנהל לוחות זמנים, משימות וחיילים.
ענה בעברית בצורה ברורה וקצרה. השתמש באימוג'ים כשמתאים.
התאריך של היום הוא: ${today}

יש לך גישה לנתונים האמיתיים של המערכת:${contextStr || "\n(אין נתונים במערכת כרגע)"}

אם המשתמש מבקש להוסיף אירוע או משימה, השתמש בכלים הזמינים לך (add_event, add_task) כדי להוסיף אותם.
אם המשתמש שואל על אירועים, משימות או חיילים - ענה על בסיס הנתונים שלמעלה.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        tools,
        stream: false, // First call non-streaming to handle tool calls
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "יותר מדי בקשות, נסה שוב בעוד רגע." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "נדרש תשלום, יש להוסיף קרדיטים." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "שגיאה בשירות AI" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const result = await response.json();
    const choice = result.choices?.[0];
    const msg = choice?.message;

    // Handle tool calls
    if (msg?.tool_calls?.length) {
      const toolResults: string[] = [];

      for (const tc of msg.tool_calls) {
        const args = JSON.parse(tc.function.arguments);
        
        if (tc.function.name === "add_event") {
          const { error } = await supabase.from("events").insert({
            title: args.title,
            date: args.date,
            type: args.type,
            description: args.description || null,
            time: args.time || null,
          });
          if (error) {
            toolResults.push(`שגיאה בהוספת אירוע: ${error.message}`);
          } else {
            toolResults.push(`✅ האירוע "${args.title}" נוסף בהצלחה לתאריך ${args.date}`);
          }
        } else if (tc.function.name === "add_task") {
          const { error } = await supabase.from("tasks").insert({
            title: args.title,
            due_date: args.due_date,
            priority: args.priority,
            completed: false,
          });
          if (error) {
            toolResults.push(`שגיאה בהוספת משימה: ${error.message}`);
          } else {
            toolResults.push(`✅ המשימה "${args.title}" נוספה בהצלחה`);
          }
        }
      }

      // Make a follow-up call to get a natural response
      const followUpMessages = [
        { role: "system", content: systemPrompt },
        ...messages,
        msg,
        ...msg.tool_calls.map((tc: any, i: number) => ({
          role: "tool",
          tool_call_id: tc.id,
          content: toolResults[i],
        })),
      ];

      const followUp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: followUpMessages,
          stream: true,
        }),
      });

      if (followUp.ok) {
        return new Response(followUp.body, {
          headers: { ...corsHeaders, "Content-Type": "text/event-stream", "X-Tool-Actions": JSON.stringify(msg.tool_calls.map((tc: any) => tc.function.name)) },
        });
      }

      // Fallback: return tool results directly
      return new Response(JSON.stringify({ 
        content: toolResults.join("\n"),
        tool_actions: msg.tool_calls.map((tc: any) => tc.function.name),
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // No tool calls - stream the response
    // Re-do as streaming
    const streamResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!streamResp.ok) {
      return new Response(JSON.stringify({ error: "שגיאה בשירות AI" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(streamResp.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });

  } catch (e) {
    console.error("chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "שגיאה לא ידועה" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
