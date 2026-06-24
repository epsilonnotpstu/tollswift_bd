import { FormEvent, useEffect, useRef, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { scanQR } from '@/api/qr.api';
import { AppBar, BottomSheet } from '@/components/shared';

export const ScanPage = () => {
  const [tokenData, setTokenData] = useState('');
  const [bridgeId, setBridgeId] = useState('');
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [resultOpen, setResultOpen] = useState(false);
  const latestBridgeId = useRef('');
  const mutation = useMutation({
    mutationFn: ({ token, bridge }: { token: string; bridge: string }) => scanQR(token, bridge),
    onSuccess: () => setResultOpen(true),
    onError: (error) => toast.error(error instanceof Error ? error.message : 'Scan failed')
  });

  useEffect(() => {
    latestBridgeId.current = bridgeId;
  }, [bridgeId]);

  useEffect(() => {
    if (!cameraEnabled) return;

    const scanner = new Html5QrcodeScanner(
      'qr-reader',
      { fps: 10, qrbox: { width: 240, height: 240 }, rememberLastUsedCamera: true },
      false
    );

    scanner.render(
      (decodedText) => {
        setTokenData(decodedText);
        if (latestBridgeId.current) {
          mutation.mutate({ token: decodedText, bridge: latestBridgeId.current });
        } else {
          toast.error('Bridge ID আগে দিন');
        }
      },
      () => undefined
    );

    return () => {
      scanner.clear().catch(() => undefined);
    };
  }, [cameraEnabled]);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    mutation.mutate({ token: tokenData, bridge: bridgeId });
  };

  return (
    <main className="min-h-screen bg-bg">
      <AppBar title="Scan QR" titleBn="QR স্ক্যান" showBack />
      <form onSubmit={submit} className="space-y-4 px-5 py-5">
        <div className="overflow-hidden rounded-[24px] bg-text-primary p-3 text-white">
          {cameraEnabled ? (
            <div id="qr-reader" className="rounded-app bg-surface text-text-primary" />
          ) : (
            <div className="relative flex aspect-square items-center justify-center">
              <div className="absolute h-48 w-48 rounded-app border-4 border-white" />
              <div className="absolute h-0.5 w-52 animate-pulse bg-secondary" />
              <p className="px-10 text-center font-bengali text-sm text-white/70">Camera চালু করে QR স্ক্যান করুন অথবা নিচে token paste করুন</p>
            </div>
          )}
        </div>
        <textarea value={tokenData} onChange={(event) => setTokenData(event.target.value)} placeholder="QR tokenData" className="min-h-28 w-full rounded-app border border-border bg-surface p-3 text-sm" />
        <input value={bridgeId} onChange={(event) => setBridgeId(event.target.value)} placeholder="Bridge ID" className="w-full rounded-app border border-border bg-surface p-3 text-sm" />
        <button type="button" onClick={() => setCameraEnabled((value) => !value)} className="w-full rounded-app border border-primary bg-primary-50 py-4 font-bengali font-bold text-primary">
          {cameraEnabled ? 'Camera বন্ধ করুন' : 'Camera চালু করুন'}
        </button>
        <button className="w-full rounded-app bg-primary py-4 font-bengali font-bold text-white">চার্জ করুন</button>
      </form>
      <BottomSheet isOpen={resultOpen} onClose={() => setResultOpen(false)} title="স্ক্যান সফল">
        <pre className="overflow-auto rounded-app bg-bg p-3 text-xs">{JSON.stringify(mutation.data, null, 2)}</pre>
      </BottomSheet>
    </main>
  );
};
