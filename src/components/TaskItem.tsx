
import React, { useState, useEffect } from 'react';
import { Check, Trash, Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface TaskItemProps {
  id: string;
  title: string;
  frequency: number;
  lastCompleted: number;
  onComplete: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string, title: string, frequency: number) => void;
}

export const TaskItem = ({
  id,
  title,
  frequency,
  lastCompleted,
  onComplete,
  onDelete,
  onEdit,
}: TaskItemProps) => {
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(title);
  const [editFrequency, setEditFrequency] = useState(frequency);

  useEffect(() => {
    const updateTime = () => {
      const now = Date.now();
      const nextDue = lastCompleted + frequency * 60 * 60 * 1000;
      const diff = nextDue - now;

      if (diff <= 0) {
        setTimeLeft('Просрочено');
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('Напоминание', {
            body: `Пора выполнить задачу: ${title}`,
            icon: '/icon-192.png'
          });
        }
      } else {
        const hours = Math.floor(diff / (60 * 60 * 1000));
        const minutes = Math.floor((diff % (60 * 60 * 1000)) / (60 * 1000));
        setTimeLeft(`${hours}ч ${minutes}м`);
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, [lastCompleted, frequency, title]);

  const handleEdit = () => {
    onEdit(id, editTitle, editFrequency);
    setIsEditing(false);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-4 mb-4 transition-all">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h3 className="font-medium text-lg">{title}</h3>
          <p className="text-sm text-gray-500">{timeLeft}</p>
        </div>
        <div className="flex items-center gap-2">
          <Dialog open={isEditing} onOpenChange={setIsEditing}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon">
                <Edit2 className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Редактировать задачу</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Название</Label>
                  <Input
                    id="title"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="frequency">Частота (часы)</Label>
                  <Input
                    id="frequency"
                    type="number"
                    value={editFrequency}
                    onChange={(e) => setEditFrequency(Number(e.target.value))}
                    className="mt-1"
                  />
                </div>
                <Button onClick={handleEdit} className="w-full">
                  Сохранить
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onComplete(id)}
          >
            <Check className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(id)}
          >
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
