import { Outlet } from 'react-router';
import { BottomNav } from '../components/BottomNav';

export function AppLayout() {
  return (
    <div
      className="w-full h-full flex flex-col"
      style={{ background: '#F7F8FA', fontFamily: 'Inter, sans-serif' }}
    >
      <div
        className="flex-1 relative"
        style={{ overflow: 'hidden' }}
      >
        <div className="absolute inset-0 overflow-y-auto">
          <Outlet />
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
