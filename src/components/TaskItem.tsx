import React, { useState, useEffect } from 'react';
import { Check, Trash, Edit2, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface TaskItemProps {
  id: string;
  title: string;
  frequency: number;
  timeUnit: 'minute' | 'hour' | 'day';
  lastCompleted: number;
  onComplete: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string, title: string, frequency: number, timeUnit: 'minute' | 'hour' | 'day') => void;
}

export const TaskItem = ({
  id,
  title,
  frequency,
  timeUnit,
  lastCompleted,
  onComplete,
  onDelete,
  onEdit,
}: TaskItemProps) => {
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(title);
  const [editFrequency, setEditFrequency] = useState(frequency);
  const [editTimeUnit, setEditTimeUnit] = useState(timeUnit);
  const [isOverdue, setIsOverdue] = useState(false);
  const [lastNotificationTime, setLastNotificationTime] = useState<number>(0);
  const [showNotificationDialog, setShowNotificationDialog] = useState(false);

  const showNotification = async () => {
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications');
      return;
    }

    console.log('Attempting to show notification');
    console.log('Current permission:', Notification.permission);

    const now = Date.now();
    // Only show notification if we haven't shown one in the last minute
    if (now - lastNotificationTime > 60000) {
      try {
        // Create audio context for notification sound
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        oscillator.connect(audioContext.destination);
        oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.1);

        // Show system notification
        if (Notification.permission === 'granted') {
          const notification = new Notification('Напоминание', {
            body: `Пора выполнить задачу: ${title}`,
            icon: '/icon-192.png',
            tag: `task-${id}`,
            requireInteraction: true,
            silent: true,
          });

          notification.onclick = () => {
            window.focus();
            notification.close();
          };
        }

        // Show custom notification dialog
        setShowNotificationDialog(true);

        setLastNotificationTime(now);
        console.log('Notification shown successfully');
      } catch (error) {
        console.error('Error showing notification:', error);
      }
    } else {
      console.log('Skipping notification - too soon since last one');
    }
  };

  useEffect(() => {
    const updateTime = () => {
      const now = Date.now();
      let milliseconds: number;
      
      switch (timeUnit) {
        case 'minute':
          milliseconds = frequency * 60 * 1000;
          break;
        case 'hour':
          milliseconds = frequency * 60 * 60 * 1000;
          break;
        case 'day':
          milliseconds = frequency * 24 * 60 * 60 * 1000;
          break;
        default:
          milliseconds = frequency * 60 * 60 * 1000;
      }

      const nextDue = lastCompleted + milliseconds;
      const diff = nextDue - now;

      if (diff <= 0) {
        if (!isOverdue) { // Only show notification when first becoming overdue
          console.log('Task becoming overdue, showing notification');
          showNotification();
        }
        setTimeLeft('Просрочено');
        setIsOverdue(true);
      } else {
        setIsOverdue(false);
        const totalSeconds = Math.floor(diff / 1000);
        const days = Math.floor(totalSeconds / (24 * 3600));
        const hours = Math.floor((totalSeconds % (24 * 3600)) / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        let formattedTime = '';
        if (days > 0) formattedTime += `${days}д `;
        if (hours > 0 || days > 0) formattedTime += `${hours.toString().padStart(2, '0')}:`;
        formattedTime += `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

        setTimeLeft(formattedTime);
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [lastCompleted, frequency, timeUnit, title, id, isOverdue]);

  const handleEdit = () => {
    onEdit(id, editTitle, editFrequency, editTimeUnit);
    setIsEditing(false);
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm p-4 mb-4 transition-all">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h3 className="font-medium text-lg">{title}</h3>
            <div className="flex items-center gap-2">
              <p className={`font-mono text-sm ${isOverdue ? 'text-red-500' : 'text-gray-500'}`}>
                {timeLeft}
              </p>
              <span className="animate-pulse w-1.5 h-1.5 rounded-full bg-green-500"></span>
            </div>
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
                    <Label htmlFor="edit-title">Название</Label>
                    <Input
                      id="edit-title"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <Label htmlFor="edit-frequency">Частота</Label>
                      <Input
                        id="edit-frequency"
                        type="number"
                        min="1"
                        value={editFrequency}
                        onChange={(e) => setEditFrequency(Number(e.target.value))}
                        className="mt-1"
                      />
                    </div>
                    <div className="flex-1">
                      <Label htmlFor="edit-timeUnit">Единица времени</Label>
                      <select
                        id="edit-timeUnit"
                        value={editTimeUnit}
                        onChange={(e) => setEditTimeUnit(e.target.value as 'minute' | 'hour' | 'day')}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1"
                      >
                        <option value="minute">Минуты</option>
                        <option value="hour">Часы</option>
                        <option value="day">Дни</option>
                      </select>
                    </div>
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

      <Dialog open={showNotificationDialog} onOpenChange={setShowNotificationDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-red-500" />
              <span>Напоминание</span>
            </DialogTitle>
          </DialogHeader>
          <div className="p-6">
            <p className="text-lg font-medium">Пора выполнить задачу:</p>
            <p className="text-xl font-bold mt-2">{title}</p>
          </div>
          <DialogFooter className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setShowNotificationDialog(false)}
            >
              Закрыть
            </Button>
            <Button
              onClick={() => {
                onComplete(id);
                setShowNotificationDialog(false);
              }}
            >
              Выполнить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
