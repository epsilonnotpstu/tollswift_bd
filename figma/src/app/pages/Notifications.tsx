import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { ArrowLeft, Bell, CheckCheck } from 'lucide-react';
import { StatusBar } from '../components/StatusBar';
import { useApp } from '../context/AppContext';
import { mockNotifications } from '../data/mockData';

const notifConfig = {
  payment: { emoji: '✅', bg: '#ECFDF5', border: '#10B98120' },
  deposit: { emoji: '💰', bg: '#EFF6FF', border: '#3B82F620' },
  warning: { emoji: '⚠️', bg: '#FFFBEB', border: '#F59E0B20' },
  system: { emoji: '🔔', bg: '#F5F3FF', border: '#8B5CF620' },
  promo: { emoji: '🎁', bg: '#FFF1F2', border: '#F42A4120' },
};

const groupNotifications = (notifs: typeof mockNotifications) => {
  const today: typeof mockNotifications = [];
  const week: typeof mockNotifications = [];
  const now = new Date();

  notifs.forEach(n => {
    const d = new Date(n.timestamp);
    const diffHours = (now.getTime() - d.getTime()) / 1000 / 3600;
    if (diffHours < 24) today.push(n);
    else week.push(n);
  });

  return { today, week };
};

export function Notifications() {
  const navigate = useNavigate();
  const { language } = useApp();
  const { today, week } = groupNotifications(mockNotifications);

  const renderNotif = (notif: typeof mockNotifications[0], i: number) => {
    const config = notifConfig[notif.type];
    const timeStr = new Date(notif.timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
    const dateStr = new Date(notif.timestamp).toLocaleDateString('en-BD', {
      month: 'short',
      day: 'numeric',
    });

    return (
      <motion.div
        key={notif.id}
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: i * 0.06 }}
        className="flex items-start gap-3 p-4 rounded-2xl relative"
        style={{
          background: notif.read ? 'white' : config.bg,
          border: `1.5px solid ${notif.read ? '#F3F4F6' : config.border}`,
          boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
        }}
      >
        {/* Unread dot */}
        {!notif.read && (
          <div
            className="absolute top-3 right-3 w-2 h-2 rounded-full"
            style={{ background: '#006A4E' }}
          />
        )}
        <div
          className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
          style={{ background: config.bg, fontSize: '20px' }}
        >
          {config.emoji}
        </div>
        <div className="flex-1">
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', fontWeight: 700, color: '#1A1A2E', paddingRight: '16px' }}>
            {language === 'bn' ? notif.titlebn : notif.title}
          </p>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#6B7280', marginTop: '2px', lineHeight: 1.4 }}>
            {notif.body}
          </p>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '10px', color: '#9CA3AF', marginTop: '4px' }}>
            {dateStr} · {timeStr}
          </p>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="w-full h-full flex flex-col" style={{ background: '#F7F8FA' }}>
      <div style={{ background: 'linear-gradient(160deg, #006A4E 0%, #004D38 100%)', paddingBottom: '24px' }}>
        <StatusBar dark />
        <div className="px-6 pt-1 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/home')}
              className="w-9 h-9 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(255,255,255,0.15)' }}
            >
              <ArrowLeft size={18} color="white" />
            </button>
            <h1 style={{ fontFamily: 'Hind Siliguri, sans-serif', fontSize: '20px', fontWeight: 700, color: 'white' }}>
              {language === 'bn' ? 'বিজ্ঞপ্তি' : 'Notifications'}
            </h1>
          </div>
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.15)' }}>
            <CheckCheck size={14} color="white" />
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: 'white', fontWeight: 600 }}>
              Mark all read
            </span>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pt-5 pb-10">
        {today.length > 0 && (
          <div className="mb-5">
            <div className="flex items-center gap-3 mb-3">
              <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Today
              </span>
              <div className="flex-1 h-px bg-gray-100" />
              <span
                className="px-2 py-0.5 rounded-full"
                style={{ background: '#006A4E', color: 'white', fontSize: '10px', fontWeight: 700 }}
              >
                {today.filter(n => !n.read).length} new
              </span>
            </div>
            <div className="flex flex-col gap-2">
              {today.map((n, i) => renderNotif(n, i))}
            </div>
          </div>
        )}

        {week.length > 0 && (
          <div className="mb-5">
            <div className="flex items-center gap-3 mb-3">
              <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                This Week
              </span>
              <div className="flex-1 h-px bg-gray-100" />
            </div>
            <div className="flex flex-col gap-2">
              {week.map((n, i) => renderNotif(n, today.length + i))}
            </div>
          </div>
        )}

        {today.length === 0 && week.length === 0 && (
          <div className="flex flex-col items-center py-20 gap-4">
            <div className="w-20 h-20 rounded-3xl flex items-center justify-center" style={{ background: '#E8F5F1' }}>
              <Bell size={36} color="#006A4E" />
            </div>
            <p style={{ fontFamily: 'Hind Siliguri, sans-serif', fontSize: '18px', fontWeight: 700, color: '#1A1A2E' }}>
              All caught up!
            </p>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#6B7280' }}>
              No new notifications
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
