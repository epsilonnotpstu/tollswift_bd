import { ReactNode } from 'react';

interface PhoneFrameProps {
  children: ReactNode;
}

export function PhoneFrame({ children }: PhoneFrameProps) {
  return (
    <div
      className="min-h-screen flex items-center justify-center relative"
      style={{ background: 'linear-gradient(135deg, #0a0a1a 0%, #1a1a2e 50%, #0d1b0d 100%)' }}
    >
      {/* Ambient glow */}
      <div
        className="absolute w-96 h-96 rounded-full opacity-25 blur-3xl pointer-events-none"
        style={{
          background: 'radial-gradient(circle, #006A4E 0%, transparent 70%)',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        }}
      />
      <div
        className="absolute w-60 h-60 rounded-full opacity-15 blur-3xl pointer-events-none"
        style={{
          background: 'radial-gradient(circle, #F42A41 0%, transparent 70%)',
          top: '30%',
          right: '30%',
        }}
      />

      {/* Phone shell */}
      <div
        style={{
          width: '390px',
          height: '844px',
          borderRadius: '50px',
          background: '#111827',
          boxShadow: '0 0 0 2px #1F2937, 0 0 0 4px #111827, 0 60px 100px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.05)',
          padding: '14px',
          position: 'relative',
          flexShrink: 0,
        }}
      >
        {/* Dynamic Island / Notch */}
        <div
          style={{
            position: 'absolute',
            top: '14px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '126px',
            height: '34px',
            background: '#111827',
            borderRadius: '0 0 22px 22px',
            zIndex: 50,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
          }}
        >
          {/* Camera dot */}
          <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#1F2937' }} />
          {/* Speaker */}
          <div style={{ width: '50px', height: '6px', borderRadius: '3px', background: '#1F2937' }} />
        </div>

        {/* Screen */}
        <div
          style={{
            width: '100%',
            height: '100%',
            borderRadius: '38px',
            background: '#F7F8FA',
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          {children}
        </div>

        {/* Home indicator */}
        <div
          style={{
            position: 'absolute',
            bottom: '8px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '134px',
            height: '5px',
            background: '#1F2937',
            borderRadius: '2.5px',
          }}
        />
      </div>

      {/* Side buttons - power */}
      <div
        style={{
          position: 'absolute',
          width: '3px',
          height: '80px',
          background: '#1F2937',
          borderRadius: '2px',
          top: '50%',
          left: 'calc(50% + 196px)',
          transform: 'translateY(-60px)',
        }}
      />
      {/* Side buttons - volume */}
      <div
        style={{
          position: 'absolute',
          width: '3px',
          height: '50px',
          background: '#1F2937',
          borderRadius: '2px',
          top: '50%',
          right: 'calc(50% + 196px)',
          transform: 'translateY(-80px)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          width: '3px',
          height: '50px',
          background: '#1F2937',
          borderRadius: '2px',
          top: '50%',
          right: 'calc(50% + 196px)',
          transform: 'translateY(-20px)',
        }}
      />

      {/* Brand label */}
      <div
        className="absolute"
        style={{
          bottom: '30px',
          left: '50%',
          transform: 'translateX(-50%)',
          fontFamily: 'Inter, sans-serif',
          fontSize: '11px',
          color: 'rgba(255,255,255,0.2)',
          letterSpacing: '2px',
          textTransform: 'uppercase',
          whiteSpace: 'nowrap',
        }}
      >
        TollBD · Bangladesh Digital Toll System
      </div>
    </div>
  );
}
