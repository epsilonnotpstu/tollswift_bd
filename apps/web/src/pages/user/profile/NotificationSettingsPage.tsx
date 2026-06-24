import { useState } from 'react';
import toast from 'react-hot-toast';
import { AppBar } from '@/components/shared';
import { usePushNotification } from '@/hooks/usePushNotification';

export const NotificationSettingsPage = () => {
  const [payment, setPayment] = useState(true);
  const [vehicle, setVehicle] = useState(true);
  const [maintenance, setMaintenance] = useState(false);
  const push = usePushNotification();

  const save = async () => {
    if (!push.isSubscribed) await push.subscribe();
    toast.success('Notification preferences saved');
  };

  return (
    <main className="min-h-screen bg-bg">
      <AppBar title="Settings" titleBn="নোটিফিকেশন সেটিংস" showBack />
      <section className="space-y-3 px-5 py-5">
        {[
          { label: 'পেমেন্ট আপডেট', value: payment, setter: setPayment },
          { label: 'গাড়ি যাচাই', value: vehicle, setter: setVehicle },
          { label: 'সেতু রক্ষণাবেক্ষণ', value: maintenance, setter: setMaintenance }
        ].map((item) => (
          <label key={item.label} className="flex items-center justify-between rounded-app border border-border bg-surface p-4">
            <span className="font-bengali text-sm font-semibold">{item.label}</span>
            <input type="checkbox" checked={item.value} onChange={(event) => item.setter(event.target.checked)} className="h-5 w-5 accent-primary" />
          </label>
        ))}
        <button onClick={save} className="w-full rounded-app bg-primary py-4 font-bengali font-bold text-white">সেভ করুন</button>
        {push.isSubscribed ? <button onClick={push.unsubscribe} className="w-full rounded-app border border-border py-4 font-bengali font-bold text-text-primary">Unsubscribe</button> : null}
      </section>
    </main>
  );
};
