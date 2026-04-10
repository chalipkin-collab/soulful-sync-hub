import type { SoldierEvent } from "./store";

export function generateICS(event: SoldierEvent): string {
  const [year, month, day] = event.date.split("-");
  
  let dtStart: string;
  let dtEnd: string;
  
  if (event.time) {
    const [hours, minutes] = event.time.split(":");
    dtStart = `${year}${month}${day}T${hours}${minutes}00`;
    // 1 hour duration
    const endHour = String(Number(hours) + 1).padStart(2, "0");
    dtEnd = `${year}${month}${day}T${endHour}${minutes}00`;
  } else {
    // All day event
    dtStart = `${year}${month}${day}`;
    const nextDay = new Date(Number(year), Number(month) - 1, Number(day) + 1);
    dtEnd = `${nextDay.getFullYear()}${String(nextDay.getMonth() + 1).padStart(2, "0")}${String(nextDay.getDate()).padStart(2, "0")}`;
  }

  // Reminder: day before at 17:00
  // Calculate minutes before the event for the alarm
  const eventDate = new Date(Number(year), Number(month) - 1, Number(day));
  if (event.time) {
    const [h, m] = event.time.split(":");
    eventDate.setHours(Number(h), Number(m));
  } else {
    eventDate.setHours(0, 0);
  }
  const reminderDate = new Date(Number(year), Number(month) - 1, Number(day) - 1, 17, 0);
  const diffMinutes = Math.round((eventDate.getTime() - reminderDate.getTime()) / 60000);

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//LuzHayalim//NONSGML v1.0//HE",
    "BEGIN:VEVENT",
    event.time ? `DTSTART:${dtStart}` : `DTSTART;VALUE=DATE:${dtStart}`,
    event.time ? `DTEND:${dtEnd}` : `DTEND;VALUE=DATE:${dtEnd}`,
    `SUMMARY:${event.title}`,
    `DESCRIPTION:${event.type}${event.description ? " - " + event.description : ""}`,
    "BEGIN:VALARM",
    "TRIGGER:-PT" + diffMinutes + "M",
    "ACTION:DISPLAY",
    `DESCRIPTION:תזכורת: ${event.title}`,
    "END:VALARM",
    `UID:${event.id}@luzhayalim`,
    "END:VEVENT",
    "END:VCALENDAR",
  ];

  return lines.join("\r\n");
}

export function downloadICS(event: SoldierEvent) {
  const ics = generateICS(event);
  const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${event.title.replace(/\s+/g, "_")}.ics`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
