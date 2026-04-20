import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "Access-Control-Expose-Headers": "X-Tool-Actions",
};

const tools = [
  {
    type: "function",
    function: {
      name: "add_event",
      description: "הוסף אירוע חדש ללוח השנה. אפשר להוסיף לכל תאריך עתידי או עבר, לא רק החודש הנוכחי.",
      parameters: {
        type: "object",
        properties: {
          title: { type: "string", description: "כותרת האירוע" },
          date: { type: "string", description: "תאריך בפורמט YYYY-MM-DD" },
          type: { type: "string", enum: ["מכינה", "גיוס", "חופשה", "תפילה", "אימון", "כללי", "טירונות"], description: "סוג האירוע" },
          description: { type: "string", description: "תיאור האירוע (אופציונלי)" },
          time: { type: "string", description: "שעה בפורמט HH:MM (אופציונלי)" },
          end_time: { type: "string", description: "שעת סיום בפורמט HH:MM (אופציונלי)" },
          location: { type: "string", description: "מיקום (אופציונלי)" },
          event_kind: { type: "string", enum: ["חד פעמי", "פתיחה", "סיום"], description: "סוג: חד פעמי / פתיחה / סיום" },
          end_date: { type: "string", description: "אם זה אירוע פתיחה - תאריך אירוע הסיום. אם זה אירוע סיום - תאריך אירוע הפתיחה. YYYY-MM-DD" },
          route: { type: "string", enum: ["יואב", "מעלות צור", "קודקוד"], description: "מסלול (אופציונלי)" },
          planned_soldiers: { type: "number", description: "מספר חיילים מתוכנן (אופציונלי)" },
          notes: { type: "string", description: "הערות (אופציונלי)" },
        },
        required: ["title", "date", "type"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "add_multiple_events",
      description: "הוסף מספר אירועים בבת אחת. השתמש בכלי הזה כשצריך להוסיף הרבה אירועים.",
      parameters: {
        type: "object",
        properties: {
          events: {
            type: "array",
            description: "רשימת אירועים להוספה",
            items: {
              type: "object",
              properties: {
                title: { type: "string" },
                date: { type: "string", description: "YYYY-MM-DD" },
                type: { type: "string", enum: ["מכינה", "גיוס", "חופשה", "תפילה", "אימון", "כללי", "טירונות"] },
                description: { type: "string" },
                time: { type: "string" },
                end_time: { type: "string" },
                location: { type: "string" },
                event_kind: { type: "string", enum: ["חד פעמי", "פתיחה", "סיום"] },
                end_date: { type: "string" },
                route: { type: "string", enum: ["יואב", "מעלות צור", "קודקוד"] },
                planned_soldiers: { type: "number" },
                notes: { type: "string" },
              },
              required: ["title", "date", "type"],
            },
          },
        },
        required: ["events"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "update_event",
      description: "עדכן אירוע קיים לפי מזהה",
      parameters: {
        type: "object",
        properties: {
          id: { type: "string", description: "מזהה האירוע לעדכון" },
          title: { type: "string" },
          date: { type: "string", description: "YYYY-MM-DD" },
          type: { type: "string", enum: ["מכינה", "גיוס", "חופשה", "תפילה", "אימון", "כללי", "טירונות"] },
          description: { type: "string" },
          time: { type: "string" },
          end_time: { type: "string" },
          location: { type: "string" },
          event_kind: { type: "string", enum: ["חד פעמי", "פתיחה", "סיום"] },
          end_date: { type: "string" },
          route: { type: "string", enum: ["יואב", "מעלות צור", "קודקוד"] },
          planned_soldiers: { type: "number" },
          actual_soldiers: { type: "number" },
          notes: { type: "string" },
        },
        required: ["id"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "delete_event",
      description: "מחק אירוע לפי מזהה",
      parameters: {
        type: "object",
        properties: {
          id: { type: "string", description: "מזהה האירוע למחיקה" },
        },
        required: ["id"],
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

const extractionTool = {
  type: "function",
  function: {
    name: "extract_items",
    description: "חלץ פריטים רלוונטיים מתוכן: אירועים, משימות וחיילים.",
    parameters: {
      type: "object",
      properties: {
        summary: { type: "string" },
        events: {
          type: "array",
          items: {
            type: "object",
            properties: {
              title: { type: "string" },
              date: { type: "string" },
              type: { type: "string", enum: ["מכינה", "גיוס", "חופשה", "תפילה", "אימון", "כללי", "טירונות"] },
              description: { type: "string" },
              time: { type: "string" },
              endTime: { type: "string" },
              location: { type: "string" },
              route: { type: "string", enum: ["יואב", "מעלות צור", "קודקוד"] },
            },
            required: ["title", "date", "type"],
          },
        },
        tasks: {
          type: "array",
          items: {
            type: "object",
            properties: {
              title: { type: "string" },
              dueDate: { type: "string" },
              priority: { type: "string", enum: ["דחוף", "בינוני", "רגיל"] },
            },
            required: ["title", "dueDate", "priority"],
          },
        },
        soldiers: {
          type: "array",
          items: {
            type: "object",
            properties: {
              name: { type: "string" },
              unit: { type: "string" },
              status: { type: "string", enum: ["פעיל", "חופשה", "מילואים"] },
              phone: { type: "string" },
            },
            required: ["name", "unit", "status"],
          },
        },
      },
      required: ["summary", "events", "tasks", "soldiers"],
    },
  },
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // EXTRACTION MODE
    if (body.mode === "extract") {
      const today = new Date().toISOString().split("T")[0];
      const extractionPrompt = `אתה מנתח תוכן צבאי. התאריך של היום: ${today}.
נתח את התוכן וחלץ אירועים, משימות וחיילים.
מסלולים אפשריים: יואב, מעלות צור, קודקוד.
אם לא צוין תאריך, השתמש בתאריך היום.`;

      const messages: any[] = [{ role: "system", content: extractionPrompt }];

      if (body.text) {
        messages.push({ role: "user", content: body.text });
      } else if (body.file_base64 && body.file_mime_type) {
        if (body.file_mime_type.startsWith("image/")) {
          messages.push({ role: "user", content: [
            { type: "text", text: "נתח את התמונה:" },
            { type: "image_url", image_url: { url: `data:${body.file_mime_type};base64,${body.file_base64}` } },
          ]});
        } else if (body.file_mime_type.startsWith("audio/")) {
          messages.push({ role: "user", content: [
            { type: "text", text: "תמלל וחלץ מידע:" },
            { type: "image_url", image_url: { url: `data:${body.file_mime_type};base64,${body.file_base64}` } },
          ]});
        }
      }

      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages,
          tools: [extractionTool],
          tool_choice: { type: "function", function: { name: "extract_items" } },
          stream: false,
        }),
      });

      if (!response.ok) {
        return new Response(JSON.stringify({ error: "שגיאה בניתוח" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      const result = await response.json();
      const toolCall = result.choices?.[0]?.message?.tool_calls?.[0];
      if (toolCall) {
        try {
          const extraction = JSON.parse(toolCall.function.arguments);
          return new Response(JSON.stringify({ extraction }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
        } catch {
          return new Response(JSON.stringify({ content: "לא הצלחתי לנתח." }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
        }
      }
      return new Response(JSON.stringify({ content: "לא נמצא מידע." }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // REGULAR CHAT MODE
    const { messages, context } = body;

    // Build full context string with ALL event details
    let contextStr = "";
    if (context) {
      if (context.events?.length) {
        contextStr += "\n\n📅 כל האירועים במערכת:\n" + context.events.map((e: any) => {
          let line = `[ID:${e.id}] ${e.title} | תאריך: ${e.date}`;
          if (e.time) line += ` ${e.time}`;
          if (e.endTime) line += `-${e.endTime}`;
          line += ` | סוג: ${e.type}`;
          if (e.eventKind && e.eventKind !== "חד פעמי") line += ` | אירוע: ${e.eventKind}`;
          if (e.endDate) line += ` | תאריך קשור: ${e.endDate}`;
          if (e.linkedEventId) line += ` | מקושר ל-ID: ${e.linkedEventId}`;
          if (e.route) line += ` | מסלול: ${e.route}`;
          if (e.location) line += ` | מיקום: ${e.location}`;
          if (e.plannedSoldiers) line += ` | מתוכנן: ${e.plannedSoldiers}`;
          if (e.actualSoldiers) line += ` | מעודכן: ${e.actualSoldiers}`;
          if (e.description) line += ` | פרטים: ${e.description}`;
          if (e.notes) line += ` | הערות: ${e.notes}`;
          if (e.placementTargets) line += ` | יעדי שיבוץ: ${e.placementTargets}`;
          return line;
        }).join("\n");
      }
      if (context.tasks?.length) {
        contextStr += "\n\n✅ משימות:\n" + context.tasks.map((t: any) =>
          `[ID:${t.id}] ${t.title} | יעד: ${t.dueDate} | עדיפות: ${t.priority} | ${t.completed ? "הושלם ✅" : "לא הושלם"}`
        ).join("\n");
      }
      if (context.soldiers?.length) {
        contextStr += "\n\n👥 חיילים:\n" + context.soldiers.map((s: any) =>
          `[ID:${s.id}] ${s.name} | יחידה: ${s.unit} | סטטוס: ${s.status}${s.phone ? " | טל: " + s.phone : ""}`
        ).join("\n");
      }
    }

    const today = new Date().toISOString().split("T")[0];
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    const nextMonthStr = `${nextMonth.getFullYear()}-${String(nextMonth.getMonth() + 1).padStart(2, "0")}`;

    const systemPrompt = `אתה עוזר חכם לניהול אירועים צבאיים. ענה בעברית בצורה ברורה ומפורטת. השתמש באימוג'ים.
התאריך של היום: ${today}
החודש הבא: ${nextMonthStr}

חוקים חשובים:
1. **הצג את כל הפרטים** של כל אירוע - תאריך, שעה, מסלול, מיקום, חיילים, פרטים, הערות - הכל!
2. **אפשר להוסיף אירועים לכל תאריך** - לא רק החודש הנוכחי. אם המשתמש אומר חודש הבא או חודשים קדימה - הוסף לתאריך הנכון.
3. **אירועים קרובים** = רק החודש הנוכחי והחודש הבא.
4. **כשמוסיפים הרבה אירועים** - השתמש ב-add_multiple_events.
5. **מסלולים**: יואב, מעלות צור, קודקוד - ציין תמיד אם יש מסלול.
6. **כשמעדכנים** - עדכן גם את האירוע הקשור אם יש.
7. כשמציגים אירועים - הצג בטבלה מסודרת עם כל הפרטים.

${contextStr ? `נתוני המערכת:${contextStr}` : "(אין נתונים עדיין)"}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [{ role: "system", content: systemPrompt }, ...messages],
        tools,
        stream: false,
      }),
    });

    if (!response.ok) {
      const status = response.status;
      if (status === 429) return new Response(JSON.stringify({ error: "יותר מדי בקשות, נסה שוב." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (status === 402) return new Response(JSON.stringify({ error: "נדרש תשלום." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      return new Response(JSON.stringify({ error: "שגיאה בשירות AI" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const result = await response.json();
    const choice = result.choices?.[0];
    const msg = choice?.message;

    if (msg?.tool_calls?.length) {
      const toolResults: string[] = [];

      for (const tc of msg.tool_calls) {
        const args = JSON.parse(tc.function.arguments);

        if (tc.function.name === "add_event") {
          const eventData: any = {
            title: args.title,
            date: args.date,
            type: args.type,
            description: args.description || null,
            time: args.time || null,
            end_time: args.end_time || null,
            location: args.location || null,
            event_kind: args.event_kind || "חד פעמי",
            end_date: args.end_date || null,
            route: args.route || null,
            planned_soldiers: args.planned_soldiers || null,
            notes: args.notes || null,
          };
          const { data: insertedEvent, error } = await supabase.from("events").insert(eventData).select().single();
          if (!error && insertedEvent && args.event_kind === "פתיחה" && args.end_date) {
            const closing: any = {
              title: args.title,
              date: args.end_date,
              type: args.type,
              event_kind: "סיום",
              end_date: args.date,
              linked_event_id: insertedEvent.id,
              route: args.route || null,
              location: args.location || null,
            };
            const { data: closingData } = await supabase.from("events").insert(closing).select().single();
            if (closingData) {
              await supabase.from("events").update({ linked_event_id: closingData.id }).eq("id", insertedEvent.id);
            }
          }
          toolResults.push(error ? `❌ שגיאה: ${error.message}` : `✅ "${args.title}" נוסף ל-${args.date}`);

        } else if (tc.function.name === "add_multiple_events") {
          let added = 0, failed = 0;
          for (const ev of args.events) {
            const eventData: any = {
              title: ev.title,
              date: ev.date,
              type: ev.type,
              description: ev.description || null,
              time: ev.time || null,
              end_time: ev.end_time || null,
              location: ev.location || null,
              event_kind: ev.event_kind || "חד פעמי",
              end_date: ev.end_date || null,
              route: ev.route || null,
              planned_soldiers: ev.planned_soldiers || null,
              notes: ev.notes || null,
            };
            const { data: insertedEvent, error } = await supabase.from("events").insert(eventData).select().single();
            if (!error) {
              added++;
              if (ev.event_kind === "פתיחה" && ev.end_date && insertedEvent) {
                const closing: any = {
                  title: ev.title,
                  date: ev.end_date,
                  type: ev.type,
                  event_kind: "סיום",
                  end_date: ev.date,
                  linked_event_id: insertedEvent.id,
                  route: ev.route || null,
                };
                const { data: closingData } = await supabase.from("events").insert(closing).select().single();
                if (closingData) {
                  await supabase.from("events").update({ linked_event_id: closingData.id }).eq("id", insertedEvent.id);
                  added++;
                }
              }
            } else {
              failed++;
            }
          }
          toolResults.push(`✅ נוספו ${added} אירועים${failed > 0 ? ` (${failed} נכשלו)` : ""}`);

        } else if (tc.function.name === "update_event") {
          const updateData: any = {};
          if (args.title !== undefined) updateData.title = args.title;
          if (args.date !== undefined) updateData.date = args.date;
          if (args.type !== undefined) updateData.type = args.type;
          if (args.description !== undefined) updateData.description = args.description;
          if (args.time !== undefined) updateData.time = args.time;
          if (args.end_time !== undefined) updateData.end_time = args.end_time;
          if (args.location !== undefined) updateData.location = args.location;
          if (args.event_kind !== undefined) updateData.event_kind = args.event_kind;
          if (args.end_date !== undefined) updateData.end_date = args.end_date;
          if (args.route !== undefined) updateData.route = args.route;
          if (args.planned_soldiers !== undefined) updateData.planned_soldiers = args.planned_soldiers;
          if (args.actual_soldiers !== undefined) updateData.actual_soldiers = args.actual_soldiers;
          if (args.notes !== undefined) updateData.notes = args.notes;

          const { error } = await supabase.from("events").update(updateData).eq("id", args.id);

          if (!error && args.end_date) {
            const { data: evt } = await supabase.from("events").select("linked_event_id").eq("id", args.id).single();
            if (evt?.linked_event_id) {
              await supabase.from("events").update({ end_date: args.date || updateData.date }).eq("id", evt.linked_event_id);
            }
          }
          toolResults.push(error ? `❌ שגיאה: ${error.message}` : `✅ אירוע עודכן`);

        } else if (tc.function.name === "delete_event") {
          const { error } = await supabase.from("events").delete().eq("id", args.id);
          toolResults.push(error ? `❌ שגיאה: ${error.message}` : `✅ אירוע נמחק`);

        } else if (tc.function.name === "add_task") {
          const { error } = await supabase.from("tasks").insert({
            title: args.title, due_date: args.due_date, priority: args.priority, completed: false,
          });
          toolResults.push(error ? `❌ שגיאה: ${error.message}` : `✅ משימה "${args.title}" נוספה`);
        }
      }

      // Follow-up response
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
        headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({ model: "google/gemini-2.5-flash", messages: followUpMessages, stream: true }),
      });

      if (followUp.ok) {
        return new Response(followUp.body, {
          headers: { ...corsHeaders, "Content-Type": "text/event-stream", "X-Tool-Actions": JSON.stringify(msg.tool_calls.map((tc: any) => tc.function.name)) },
        });
      }

      return new Response(JSON.stringify({ content: toolResults.join("\n"), tool_actions: msg.tool_calls.map((tc: any) => tc.function.name) }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Stream direct response
    const streamResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [{ role: "system", content: systemPrompt }, ...messages],
        stream: true,
      }),
    });

    if (!streamResp.ok) {
      return new Response(JSON.stringify({ error: "שגיאה בשירות AI" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(streamResp.body, { headers: { ...corsHeaders, "Content-Type": "text/event-stream" } });

  } catch (e) {
    console.error("chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "שגיאה לא ידועה" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
