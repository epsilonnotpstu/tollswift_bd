interface LicensePlateProps {
  plate: string;
  size?: 'sm' | 'md' | 'lg';
}

export function LicensePlate({ plate, size = 'md' }: LicensePlateProps) {
  const sizes = {
    sm: { padding: '2px 8px', fontSize: '10px', borderRadius: '4px', borderWidth: '1.5px' },
    md: { padding: '4px 12px', fontSize: '12px', borderRadius: '6px', borderWidth: '2px' },
    lg: { padding: '6px 16px', fontSize: '14px', borderRadius: '8px', borderWidth: '2.5px' },
  };
  const s = sizes[size];

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: s.padding,
        background: '#F5C518',
        border: `${s.borderWidth} solid #1a1a1a`,
        borderRadius: s.borderRadius,
        fontFamily: 'Roboto Mono, monospace',
        fontSize: s.fontSize,
        fontWeight: 700,
        color: '#1a1a1a',
        letterSpacing: '0.05em',
        textTransform: 'uppercase',
        userSelect: 'none',
      }}
    >
      <span
        style={{
          display: 'inline-block',
          width: '4px',
          height: '100%',
          minHeight: '14px',
          background: '#006A4E',
          borderRadius: '2px',
          marginRight: '6px',
        }}
      />
      {plate}
    </div>
  );
}
