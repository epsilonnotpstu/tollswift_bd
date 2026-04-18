import { Wifi, Battery, Signal } from 'lucide-react';

interface StatusBarProps {
  dark?: boolean;
}

export function StatusBar({ dark = false }: StatusBarProps) {
  const now = new Date();
  const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
  const textColor = dark ? 'text-white' : 'text-[#1A1A2E]';

  return (
    <div className={`flex items-center justify-between px-6 pt-12 pb-1 ${textColor}`} style={{ fontSize: '12px' }}>
      <span className="font-semibold" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>
        {timeStr}
      </span>
      <div className="flex items-center gap-1">
        <Signal size={12} strokeWidth={2.5} />
        <Wifi size={12} strokeWidth={2.5} />
        <Battery size={14} strokeWidth={2.5} />
      </div>
    </div>
  );
}
