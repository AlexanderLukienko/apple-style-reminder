
import React from 'react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

interface Completion {
  id: string;
  title: string;
  timestamp: number;
}

interface StatsProps {
  completions: Completion[];
}

export const Stats = ({ completions }: StatsProps) => {
  return (
    <div className="mt-8">
      <h2 className="text-2xl font-semibold mb-4">История выполнения</h2>
      <div className="space-y-2">
        {completions.map((completion, index) => (
          <div
            key={`${completion.id}-${index}`}
            className="bg-white rounded-lg p-3 shadow-sm"
          >
            <div className="flex justify-between items-center">
              <span className="font-medium">{completion.title}</span>
              <span className="text-sm text-gray-500">
                {format(completion.timestamp, 'dd MMMM, HH:mm', { locale: ru })}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
