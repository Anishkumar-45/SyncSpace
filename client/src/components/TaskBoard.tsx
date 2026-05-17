import { CheckCircle2, Circle, Timer } from "lucide-react";

const tasks = [
  { id: "1", title: "Define workspace schema", status: "done" },
  { id: "2", title: "Connect Yjs sync room", status: "done" },
  { id: "3", title: "Add peer-to-peer provider", status: "next" },
  { id: "4", title: "Encrypt document payloads", status: "next" }
];

export function TaskBoard() {
  return (
    <section className="task-strip">
      {tasks.map((task) => (
        <article className="task-item" key={task.id}>
          {task.status === "done" ? <CheckCircle2 size={17} /> : <Circle size={17} />}
          <span>{task.title}</span>
          {task.status === "next" && <Timer size={15} />}
        </article>
      ))}
    </section>
  );
}
