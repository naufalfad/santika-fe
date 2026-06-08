import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { CHART_DATA } from '../../mock/dashboardData';
import { Card } from '../ui/Card';

export const MainChart = () => {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-bold mb-6 text-slate-800">Grafik Arus Kas (Juta Rp)</h3>
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={CHART_DATA}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" axisLine={false} tickLine={false} />
            <YAxis axisLine={false} tickLine={false} />
            <Tooltip 
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            />
            <Legend verticalAlign="top" align="right" iconType="circle" height={36} />
            <Bar dataKey="masuk" fill="#0284c7" radius={[4, 4, 0, 0]} name="Kas Masuk" />
            <Bar dataKey="keluar" fill="#e11d48" radius={[4, 4, 0, 0]} name="Kas Keluar" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};