import QRCode from 'react-qr-code';

interface QRDisplayProps {
  data: string;
  size?: number;
}

export const QRDisplay = ({ data, size = 200 }: QRDisplayProps) => (
  <div className="inline-flex rounded-app border border-border bg-white p-4 shadow-sm">
    <QRCode value={data} size={size} fgColor="var(--color-primary)" bgColor="var(--color-surface)" />
  </div>
);
