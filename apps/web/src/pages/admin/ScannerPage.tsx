import { useCallback, useEffect, useRef, useState } from 'react';
import { AlertCircle, Car, CheckCircle, QrCode, RotateCcw, Scan, Wifi } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { scanQR } from '@/api/admin.api';
import { getBridges } from '@/api/bridge.api';
import { QRScanResponse } from '@/api/qr.api';
import { formatBDT, formatDateTime } from '@/utils/format';

interface GateLog {
  id: string;
  plate: string;
  owner: string;
  amount: number;
  bridge: string;
  time: string;
  success: boolean;
}

export const ScannerPage = () => {
  const [selectedBridge, setSelectedBridge] = useState('');
  const [scanning, setScanning] = useState(false);
  const [lastResult, setLastResult] = useState<QRScanResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [gateLogs, setGateLogs] = useState<GateLog[]>([]);
  const [manualInput, setManualInput] = useState('');
  const scannerRef = useRef<HTMLDivElement>(null);
  const html5QrRef = useRef<unknown>(null);

  const { data: bridges } = useQuery({ queryKey: ['bridges'], queryFn: () => getBridges() });

  const processToken = useCallback(async (tokenData: string) => {
    if (!selectedBridge) { toast.error('Select a bridge first'); return; }
    try {
      const result = await scanQR(tokenData, selectedBridge);
      setLastResult(result);
      setError(null);
      const bridgeName = bridges?.find((b) => b.id === selectedBridge)?.name ?? selectedBridge;
      setGateLogs((prev) => [{
        id: result.transactionId,
        plate: result.vehiclePlate,
        owner: result.ownerName,
        amount: result.amount,
        bridge: bridgeName,
        time: new Date().toISOString(),
        success: true
      }, ...prev.slice(0, 29)]);
    } catch (err: unknown) {
      const msg = (err as { message?: string })?.message ?? 'Scan failed';
      setError(msg);
      setLastResult(null);
      setGateLogs((prev) => [{
        id: Math.random().toString(36).slice(2),
        plate: tokenData.slice(0, 8),
        owner: '—',
        amount: 0,
        bridge: bridges?.find((b) => b.id === selectedBridge)?.name ?? '—',
        time: new Date().toISOString(),
        success: false
      }, ...prev.slice(0, 29)]);
    }
  }, [selectedBridge, bridges]);

  const startScanner = useCallback(async () => {
    if (!selectedBridge) { toast.error('Select a bridge first'); return; }
    try {
      const { Html5Qrcode } = await import('html5-qrcode');
      const qr = new Html5Qrcode('qr-scanner-element');
      html5QrRef.current = qr;
      setScanning(true);
      setLastResult(null);
      setError(null);
      await qr.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => { processToken(decodedText); },
        undefined
      );
    } catch {
      toast.error('Camera access denied or not available');
      setScanning(false);
    }
  }, [selectedBridge, processToken]);

  const stopScanner = useCallback(async () => {
    if (html5QrRef.current) {
      try {
        await (html5QrRef.current as { stop: () => Promise<void>; clear: () => Promise<void> }).stop();
        await (html5QrRef.current as { stop: () => Promise<void>; clear: () => Promise<void> }).clear();
      } catch { /* ignore */ }
      html5QrRef.current = null;
    }
    setScanning(false);
  }, []);

  useEffect(() => () => { stopScanner(); }, [stopScanner]);

  const handleManualScan = () => {
    if (!manualInput.trim()) return;
    processToken(manualInput.trim());
    setManualInput('');
  };

  const bridgeName = bridges?.find((b) => b.id === selectedBridge)?.name ?? 'No bridge selected';

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-5">
      {/* Scanner panel */}
      <div className="xl:col-span-2 space-y-4">
        {/* Bridge selector */}
        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <label className="mb-2 block text-sm font-bold text-gray-700">Select Gate / Bridge</label>
          <select
            value={selectedBridge}
            onChange={(e) => { setSelectedBridge(e.target.value); setLastResult(null); setError(null); }}
            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-primary"
          >
            <option value="">-- Select a bridge --</option>
            {(bridges ?? []).filter((b) => b.status === 'ACTIVE').map((b) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
          {selectedBridge && (
            <div className="mt-2 flex items-center gap-2 text-xs text-emerald-600">
              <Wifi className="h-3.5 w-3.5" />
              <span>Gate active: <strong>{bridgeName}</strong></span>
            </div>
          )}
        </div>

        {/* Camera scanner */}
        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-gray-900">Camera Scanner</h3>
            {scanning && <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600"><span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" /> Live</span>}
          </div>
          <div
            ref={scannerRef}
            id="qr-scanner-element"
            className={`mb-3 overflow-hidden rounded-xl bg-gray-900 ${scanning ? 'h-64' : 'h-0'}`}
          />
          {!scanning ? (
            <button
              onClick={startScanner}
              disabled={!selectedBridge}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 font-bold text-white disabled:opacity-40 hover:bg-primary/90 transition"
            >
              <Scan className="h-4 w-4" /> Start Camera
            </button>
          ) : (
            <button onClick={stopScanner} className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-500 py-3 font-bold text-white hover:bg-red-600 transition">
              <RotateCcw className="h-4 w-4" /> Stop Camera
            </button>
          )}
        </div>

        {/* Manual input */}
        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <h3 className="mb-3 font-bold text-gray-900">Manual Token Entry</h3>
          <div className="flex gap-2">
            <input
              value={manualInput}
              onChange={(e) => setManualInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleManualScan()}
              placeholder="Paste QR token data…"
              className="flex-1 rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-primary"
            />
            <button
              onClick={handleManualScan}
              disabled={!manualInput || !selectedBridge}
              className="rounded-xl bg-primary px-5 font-bold text-white disabled:opacity-40 hover:bg-primary/90 transition"
            >
              Go
            </button>
          </div>
        </div>

        {/* Result */}
        {lastResult && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle className="h-5 w-5 text-emerald-600" />
              <span className="font-bold text-emerald-800">Payment Successful</span>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-emerald-700">Plate</span><strong className="text-emerald-900">{lastResult.vehiclePlate}</strong></div>
              <div className="flex justify-between"><span className="text-emerald-700">Owner</span><strong className="text-emerald-900">{lastResult.ownerName}</strong></div>
              <div className="flex justify-between"><span className="text-emerald-700">Charged</span><strong className="text-2xl text-emerald-900">{formatBDT(lastResult.amount)}</strong></div>
            </div>
          </div>
        )}

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
            <div className="flex items-start gap-2">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
              <div>
                <p className="font-bold text-red-800">Scan Failed</p>
                <p className="mt-0.5 text-sm text-red-600">{error}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Gate log */}
      <div className="xl:col-span-3 rounded-2xl bg-white shadow-sm overflow-hidden">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div>
            <h3 className="font-bold text-gray-900">Gate Log</h3>
            <p className="font-bengali text-xs text-gray-400">গেট লগ</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">{gateLogs.length} scans this session</span>
            {gateLogs.length > 0 && (
              <button onClick={() => setGateLogs([])} className="text-xs font-semibold text-red-500 hover:underline">Clear</button>
            )}
          </div>
        </div>
        {gateLogs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <QrCode className="h-12 w-12 text-gray-200" />
            <p className="mt-3 text-sm text-gray-400">No scans yet this session</p>
            <p className="text-xs text-gray-300">Start scanning QR codes above</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {gateLogs.map((log) => (
              <div key={log.id} className={`flex items-center gap-4 px-6 py-4 ${log.success ? '' : 'bg-red-50/50'}`}>
                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${log.success ? 'bg-emerald-100' : 'bg-red-100'}`}>
                  {log.success ? <Car className="h-4 w-4 text-emerald-600" /> : <AlertCircle className="h-4 w-4 text-red-600" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-gray-900">{log.plate}</span>
                    {log.success ? (
                      <span className="text-xs text-emerald-600 font-semibold">✓ {formatBDT(log.amount)}</span>
                    ) : (
                      <span className="text-xs text-red-600 font-semibold">✗ Failed</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 truncate">{log.owner} · {log.bridge}</p>
                </div>
                <span className="shrink-0 text-xs text-gray-400">{formatDateTime(log.time)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
