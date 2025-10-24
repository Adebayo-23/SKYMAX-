import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { Checkbox } from './ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Plus, Calculator, TrendingUp, Target } from 'lucide-react';

interface Task {
  id: string;
  title: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  dueDate: Date;
  category: string;
}

interface TaskManagerProps {
  tasks: Task[];
  onAddTask: (task: Omit<Task, 'id'>) => void;
  onToggleTask: (taskId: string) => void;
}

export function TaskManager({ tasks, onAddTask, onToggleTask }: TaskManagerProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    priority: 'medium' as 'high' | 'medium' | 'low',
    dueDate: '',
    category: 'General'
  });

  const handleAddTask = () => {
    if (!newTask.title.trim()) return;
    
    onAddTask({
      title: newTask.title,
      completed: false,
      priority: newTask.priority,
      dueDate: new Date(newTask.dueDate),
      category: newTask.category
    });

    setNewTask({
      title: '',
      priority: 'medium',
      dueDate: '',
      category: 'General'
    });
    setIsAddDialogOpen(false);
  };

  // Calculate statistics
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.completed).length;
  const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  // Category-based statistics
  const categories = [...new Set(tasks.map(task => task.category))];
  const categoryStats = categories.map(category => {
    const categoryTasks = tasks.filter(task => task.category === category);
    const completedInCategory = categoryTasks.filter(task => task.completed).length;
    const categoryRate = categoryTasks.length > 0 ? (completedInCategory / categoryTasks.length) * 100 : 0;
    
    return {
      category,
      total: categoryTasks.length,
      completed: completedInCategory,
      rate: categoryRate
    };
  });

  // Priority-based statistics
  const priorityStats = ['high', 'medium', 'low'].map(priority => {
    const priorityTasks = tasks.filter(task => task.priority === priority);
    const completedInPriority = priorityTasks.filter(task => task.completed).length;
    const priorityRate = priorityTasks.length > 0 ? (completedInPriority / priorityTasks.length) * 100 : 0;
    
    return {
      priority,
      total: priorityTasks.length,
      completed: completedInPriority,
      rate: priorityRate
    };
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1>Task Management</h1>
          <p className="text-muted-foreground">
            Manage your tasks and track completion rates
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Task
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Task</DialogTitle>
              <DialogDescription>
                Create a new task to track your progress.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Task Title</Label>
                <Input
                  id="title"
                  value={newTask.title}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewTask({ ...newTask, title: e.target.value })}
                  placeholder="Enter task title..."
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="priority">Priority</Label>
                <Select value={newTask.priority} onValueChange={(value: string) => setNewTask({ ...newTask, priority: value as 'high' | 'medium' | 'low' })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  value={newTask.category}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewTask({ ...newTask, category: e.target.value })}
                  placeholder="Enter category..."
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="dueDate">Due Date</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={newTask.dueDate}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewTask({ ...newTask, dueDate: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleAddTask}>Add Task</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Task Calculator - Overall Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calculator className="h-5 w-5 mr-2" />
            Task Calculator - Overall Progress
          </CardTitle>
          <CardDescription>Real-time completion rate analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl">{Math.round(completionRate)}%</p>
                <p className="text-sm text-muted-foreground">Overall Completion Rate</p>
              </div>
              <div className="text-right">
                <p className="text-lg">{completedTasks}/{totalTasks}</p>
                <p className="text-sm text-muted-foreground">Tasks Completed</p>
              </div>
            </div>
            <Progress value={completionRate} className="h-3" />
          </div>
        </CardContent>
      </Card>

      {/* Category Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Target className="h-5 w-5 mr-2" />
            Progress by Category
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {categoryStats.map((stat) => (
              <div key={stat.category} className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">{stat.category}</span>
                  <span className="text-sm">{Math.round(stat.rate)}% ({stat.completed}/{stat.total})</span>
                </div>
                <Progress value={stat.rate} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Priority Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="h-5 w-5 mr-2" />
            Progress by Priority
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {priorityStats.map((stat) => (
              <div key={stat.priority} className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${getPriorityColor(stat.priority)}`} />
                    <span className="text-sm capitalize">{stat.priority} Priority</span>
                  </div>
                  <span className="text-sm">{Math.round(stat.rate)}% ({stat.completed}/{stat.total})</span>
                </div>
                <Progress value={stat.rate} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Task List */}
      <Card>
        <CardHeader>
          <CardTitle>All Tasks</CardTitle>
          <CardDescription>Manage and track your tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {tasks.map((task) => (
              <div key={task.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                <Checkbox
                  checked={task.completed}
                  onCheckedChange={() => onToggleTask(task.id)}
                />
                <div className="flex-1 min-w-0">
                  <p className={`text-sm ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                    {task.title}
                  </p>
                  <div className="flex items-center space-x-2 mt-1">
                    <Badge variant="outline" className="text-xs">
                      {task.category}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      Due: {task.dueDate.toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${getPriorityColor(task.priority)}`} />
                  <Badge variant={task.completed ? 'secondary' : 'default'}>
                    {task.completed ? 'Done' : task.priority}
                  </Badge>
                </div>
              </div>
            ))}
            {tasks.length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                No tasks yet. Add your first task to get started!
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
