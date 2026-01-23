// app/page.tsx
import TaskManager from "./components/TaskManager";

export default function HomePage() {
  return (
    <main className="min-h-screen p-6">
      <TaskManager />
    </main>
  );
}
