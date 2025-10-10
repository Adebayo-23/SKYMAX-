import React, { useState } from "react";

interface Task {
	id: string;
	title: string;
	completed: boolean;
	priority: "low" | "medium" | "high";
	dueDate: Date;
	category: string;
}

interface ScheduleDashboardProps {
	tasks: Task[];
}

const ScheduleDashboard: React.FC<ScheduleDashboardProps> = ({ tasks }) => {
	const [newTask, setNewTask] = useState({
		title: "",
		priority: "medium" as const,
		dueDate: "",
		category: "General"
	});
	const [taskList, setTaskList] = useState<Task[]>(tasks);

	const handleAddTask = () => {
		if (!newTask.title.trim()) return;
		setTaskList([
			...taskList,
			{
				id: Math.random().toString(),
				title: newTask.title,
				completed: false,
				priority: newTask.priority,
				dueDate: newTask.dueDate ? new Date(newTask.dueDate) : new Date(),
				category: newTask.category
			}
		]);
		setNewTask({ title: "", priority: "medium", dueDate: "", category: "General" });
	};

	const handleToggleTask = (id: string) => {
		setTaskList(taskList.map(task => task.id === id ? { ...task, completed: !task.completed } : task));
	};

	const totalTasks = taskList.length;
	const completedTasks = taskList.filter(task => task.completed).length;
	const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

	return (
		<div style={{ padding: "2rem", background: "linear-gradient(to bottom, #4B0082, #000000, #ffffff)", minHeight: "100vh" }}>
			<h1 style={{ color: "#fff", fontSize: "3rem", fontWeight: "bold" }}>Schedule Dashboard</h1>
			{/* summary header only - username handled by parent dashboard */}

				{/* Connected card container */}
				<div style={{ margin: "2rem 0", background: "#fff", borderRadius: "1rem", padding: 0, overflow: 'hidden' }}>
					{/* Progress section */}
					<div style={{ padding: '1rem' }}>
						<h2 style={{ color: "#4B0082" }}>Progress</h2>
						<p style={{ color: "#4B0082" }}>Completed: {completedTasks}/{totalTasks} ({Math.round(completionRate)}%)</p>
						<div style={{ background: "#eee", borderRadius: "8px", height: "16px", width: "100%", margin: "8px 0" }}>
							<div style={{ background: "#4B0082", height: "100%", borderRadius: "8px", width: `${completionRate}%` }} />
						</div>
					</div>

					{/* separator */}
					<div style={{ height: 1, background: '#eee' }} />

					{/* Ongoing section (pink header) */}
					<div style={{ padding: '1rem' }}>
						<h2 style={{ display: 'inline-block', background: '#9b2b60', color: '#fff', padding: '0.5rem 0.75rem', borderRadius: 6 }}>Ongoing & Pending Tasks</h2>
						<div style={{ marginTop: 12 }}>
							{taskList.length === 0 ? (
								<p style={{ color: "#888" }}>No tasks available.</p>
							) : (
								<ul>
									{taskList.map(task => (
										<li key={task.id} style={{ display: "flex", alignItems: "center", marginBottom: "1rem" }}>
											<input type="checkbox" checked={task.completed} onChange={() => handleToggleTask(task.id)} />
											<span style={{ marginLeft: "1rem", textDecoration: task.completed ? "line-through" : "none", color: task.completed ? "#888" : "#4B0082" }}>
												{task.title} ({task.category})
											</span>
											<span style={{ marginLeft: "auto", color: task.completed ? "green" : "orange" }}>
												{task.completed ? "Done" : "Pending"}
											</span>
										</li>
									))}
								</ul>
							)}
						</div>
					</div>

					{/* separator */}
					<div style={{ height: 1, background: '#eee' }} />

					{/* Add task section */}
					<div style={{ padding: '1rem' }}>
						<h2 style={{ color: "#4B0082" }}>Add New Task</h2>
						<div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
							<input
								type="text"
								placeholder="Task title"
								value={newTask.title}
								onChange={e => setNewTask({ ...newTask, title: e.target.value })}
								style={{ padding: "0.5rem", borderRadius: "5px", border: "1px solid #ccc" }}
							/>
							<select
								value={newTask.priority}
								onChange={e => setNewTask({ ...newTask, priority: e.target.value as "low" | "medium" | "high" })}
								style={{ padding: "0.5rem", borderRadius: "5px", border: "1px solid #ccc" }}
							>
								<option value="high">High</option>
								<option value="medium">Medium</option>
								<option value="low">Low</option>
							</select>
							<input
								type="date"
								value={newTask.dueDate}
								onChange={e => setNewTask({ ...newTask, dueDate: e.target.value })}
								style={{ padding: "0.5rem", borderRadius: "5px", border: "1px solid #ccc" }}
							/>
							<input
								type="text"
								placeholder="Category"
								value={newTask.category}
								onChange={e => setNewTask({ ...newTask, category: e.target.value })}
								style={{ padding: "0.5rem", borderRadius: "5px", border: "1px solid #ccc" }}
							/>
							<button
								onClick={handleAddTask}
								style={{ padding: "0.5rem 1rem", borderRadius: "5px", background: "#4B0082", color: "#fff", border: "none" }}
							>
								Add Task
							</button>
						</div>
					</div>
				</div>
		</div>
	);
};

export default ScheduleDashboard;
