import React from "react";
import ScheduleDashboard from "~/components/ScheduleDashboard";

// Example mock data
const tasks = [
  {
    id: "1",
    title: "Finish project report",
    completed: false,
    priority: "high",
    dueDate: new Date(),
    category: "Work"
  },
  {
    id: "2",
    title: "Buy groceries",
    completed: true,
    priority: "low",
    dueDate: new Date(),
    category: "Personal"
  }
];

const events = [
  {
    id: "1",
    title: "Team Meeting",
    date: new Date(),
    time: "10:00 AM"
  },
  {
    id: "2",
    title: "Doctor Appointment",
    date: new Date(),
    time: "3:00 PM"
  }
];

export default function DashboardRoute() {
  // Get user from localStorage (client-side only)
  let user = undefined;
  if (typeof window !== "undefined") {
    try {
      user = JSON.parse(localStorage.getItem("user") || "{}");
    } catch {}
  }
  return <ScheduleDashboard user={user} tasks={tasks} />;
}
