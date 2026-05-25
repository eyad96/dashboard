"use client";

import React, { useEffect, useState } from "react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";

interface InvoiceStatusChartProps {
  paidAmount: number;
  unpaidAmount: number;
}

export function InvoiceStatusChart({ paidAmount, unpaidAmount }: InvoiceStatusChartProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  if (!mounted) {
    return (
      <div className="h-[200px] w-full flex items-center justify-center text-muted-foreground text-sm">
        Loading Invoicing Chart...
      </div>
    );
  }

  const data = [
    { name: "Paid", value: paidAmount, color: "#10b981" },
    { name: "Unpaid", value: unpaidAmount, color: "#f59e0b" },
  ];

  const total = paidAmount + unpaidAmount;

  return (
    <div className="h-[200px] w-full flex flex-col justify-between">
      <div className="h-[155px] w-full relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={45}
              outerRadius={60}
              paddingAngle={4}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--background))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
              }}
              itemStyle={{ fontSize: "11px", color: "hsl(var(--foreground))" }}
            />
          </PieChart>
        </ResponsiveContainer>
        {/* Absolute center layout inside pie */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-[9px] uppercase tracking-wider font-semibold text-muted-foreground">Total Billed</span>
          <span className="text-sm font-bold text-foreground">${total.toLocaleString()}</span>
        </div>
      </div>

      {/* Legend list */}
      <div className="flex justify-center gap-5 text-[11px] border-t pt-2 mt-1">
        {data.map((item, idx) => (
          <div key={idx} className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
            <span className="text-muted-foreground">{item.name}:</span>
            <span className="font-semibold text-foreground">${item.value.toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
