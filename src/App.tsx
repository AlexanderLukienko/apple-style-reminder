import React, { useState, useEffect } from 'react';
import { nanoid } from 'nanoid';
import { Plus, Trash2 } from 'lucide-react';
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
  timeUnit: 'minute' | 'hour' | 'day';
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
  const [newTaskFrequency, setNewTaskFrequency] = useState(1);
  const [newTaskTimeUnit, setNewTaskTimeUnit] = useState<'minute' | 'hour' | 'day'>('hour');
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    const savedTasks = localStorage.getItem('tasks');
    const savedCompletions = localStorage.getItem('completions');

    if (savedTasks) {
      setTasks(JSON.parse(savedTasks));
    }
    if (savedCompletions) {
      setCompletions(JSON.parse(savedCompletions));
    }

    // Request notification permission and handle the response
    const setupNotifications = async () => {
      if (!('Notification' in window)) {
        console.log('Notifications not supported in this browser');
        return;
      }

      console.log('Current notification permission:', Notification.permission);

      if (Notification.permission === 'default') {
        const permission = await Notification.requestPermission();
        console.log('Permission request result:', permission);
        setNotificationPermission(permission);
        
        if (permission === 'granted') {
          // Test notification
          try {
            const notification = new Notification('Тест уведомлений', {
              body: 'Уведомления работают корректно',
              icon: '/icon-192.png'
            });
            console.log('Test notification sent successfully');
          } catch (error) {
            console.error('Error sending test notification:', error);
          }
        }
      } else {
        setNotificationPermission(Notification.permission);
      }
    };

    setupNotifications();

    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/service-worker.js')
        .then(registration => {
          console.log('Service Worker registered successfully:', registration);
        })
        .catch(error => {
          console.error('Service Worker registration failed:', error);
        });
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
        timeUnit: newTaskTimeUnit,
        lastCompleted: Date.now(),
      };
      setTasks([...tasks, newTask]);
      setNewTaskTitle('');
      setNewTaskFrequency(1);
      setNewTaskTimeUnit('hour');
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

  const handleEdit = (taskId: string, newTitle: string, newFrequency: number, newTimeUnit: 'minute' | 'hour' | 'day') => {
    setTasks(tasks.map(task => {
      if (task.id === taskId) {
        return { ...task, title: newTitle, frequency: newFrequency, timeUnit: newTimeUnit };
      }
      return task;
    }));
  };

  const handleClearHistory = () => {
    setCompletions([]);
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
                <div className="flex gap-4">
                  <div className="flex-1">
                    <Label htmlFor="frequency">Частота</Label>
                    <Input
                      id="frequency"
                      type="number"
                      min="1"
                      value={newTaskFrequency}
                      onChange={(e) => setNewTaskFrequency(Number(e.target.value))}
                      className="mt-1"
                    />
                  </div>
                  <div className="flex-1">
                    <Label htmlFor="timeUnit">Единица времени</Label>
                    <select
                      id="timeUnit"
                      value={newTaskTimeUnit}
                      onChange={(e) => setNewTaskTimeUnit(e.target.value as 'minute' | 'hour' | 'day')}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1"
                    >
                      <option value="minute">Минуты</option>
                      <option value="hour">Часы</option>
                      <option value="day">Дни</option>
                    </select>
                  </div>
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
          
          <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">История</h2>
              {completions.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearHistory}
                  className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                  Очистить историю
                </Button>
              )}
            </div>
            <Stats completions={completions} />
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
