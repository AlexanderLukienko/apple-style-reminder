
import React, { useState, useEffect } from 'react';
import { nanoid } from 'nanoid';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { TaskItem } from './components/TaskItem';
import { Stats } from './components/Stats';

interface Task {
  id: string;
  title: string;
  frequency: number;
  lastCompleted: number;
}

interface Completion {
  id: string;
  title: string;
  timestamp: number;
}

const App = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [completions, setCompletions] = useState<Completion[]>([]);
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskFrequency, setNewTaskFrequency] = useState(24);

  useEffect(() => {
    const savedTasks = localStorage.getItem('tasks');
    const savedCompletions = localStorage.getItem('completions');

    if (savedTasks) {
      setTasks(JSON.parse(savedTasks));
    }
    if (savedCompletions) {
      setCompletions(JSON.parse(savedCompletions));
    }

    if ('Notification' in window) {
      Notification.requestPermission();
    }

    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/service-worker.js');
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('completions', JSON.stringify(completions));
  }, [completions]);

  const handleAddTask = () => {
    if (newTaskTitle.trim() && newTaskFrequency > 0) {
      const newTask: Task = {
        id: nanoid(),
        title: newTaskTitle.trim(),
        frequency: newTaskFrequency,
        lastCompleted: Date.now(),
      };
      setTasks([...tasks, newTask]);
      setNewTaskTitle('');
      setNewTaskFrequency(24);
      setIsAddingTask(false);
    }
  };

  const handleComplete = (taskId: string) => {
    setTasks(tasks.map(task => {
      if (task.id === taskId) {
        setCompletions([
          { id: task.id, title: task.title, timestamp: Date.now() },
          ...completions.slice(0, 99)
        ]);
        return { ...task, lastCompleted: Date.now() };
      }
      return task;
    }));
  };

  const handleDelete = (taskId: string) => {
    setTasks(tasks.filter(task => task.id !== taskId));
  };

  const handleEdit = (taskId: string, newTitle: string, newFrequency: number) => {
    setTasks(tasks.map(task => {
      if (task.id === taskId) {
        return { ...task, title: newTitle, frequency: newFrequency };
      }
      return task;
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="max-w-lg mx-auto">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">Задачи</h1>
          <Dialog open={isAddingTask} onOpenChange={setIsAddingTask}>
            <DialogTrigger asChild>
              <Button size="icon">
                <Plus className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Новая задача</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Название</Label>
                  <Input
                    id="title"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="frequency">Частота (часы)</Label>
                  <Input
                    id="frequency"
                    type="number"
                    value={newTaskFrequency}
                    onChange={(e) => setNewTaskFrequency(Number(e.target.value))}
                    className="mt-1"
                  />
                </div>
                <Button onClick={handleAddTask} className="w-full">
                  Добавить
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </header>

        <main>
          <div className="space-y-4">
            {tasks.map((task) => (
              <TaskItem
                key={task.id}
                {...task}
                onComplete={handleComplete}
                onDelete={handleDelete}
                onEdit={handleEdit}
              />
            ))}
          </div>
          <Stats completions={completions} />
        </main>
      </div>
    </div>
  );
};

export default App;
