import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { useApp } from '../context/AppContext';
import { Check } from 'lucide-react';

export function LanguageSelect() {
  const navigate = useNavigate();
  const { language, setLanguage } = useApp();

  const languages = [
    {
      code: 'bn' as const,
      name: 'বাংলা',
      subtitle: 'Bengali',
      flag: '🇧🇩',
      desc: 'বাংলাদেশের জাতীয় ভাষা',
    },
    {
      code: 'en' as const,
      name: 'English',
      subtitle: 'ইংরেজি',
      flag: '🌐',
      desc: 'International language',
    },
  ];

  return (
    <div className="w-full h-full flex flex-col" style={{ background: '#F7F8FA' }}>
      {/* Top bar */}
      <div className="pt-16 px-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 mb-8"
        >
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center"
            style={{ background: '#006A4E' }}
          >
            <svg viewBox="0 0 80 80" width="24" height="24" fill="none">
              <path d="M10 70 L35 30 L40 30 L45 30 L70 70 Z" fill="white" opacity="0.9" />
              <circle cx="40" cy="20" r="10" fill="#F42A41" />
              <text x="40" y="24" textAnchor="middle" fontSize="10" fontWeight="bold" fill="white">T</text>
            </svg>
          </div>
          <span style={{ fontFamily: 'Hind Siliguri, sans-serif', fontSize: '22px', fontWeight: 700, color: '#1A1A2E' }}>
            TollBD
          </span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <h1
            style={{
              fontFamily: 'Hind Siliguri, sans-serif',
              fontSize: '26px',
              fontWeight: 700,
              color: '#1A1A2E',
              lineHeight: 1.3,
            }}
          >
            আপনার ভাষা বেছে নিন
          </h1>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: '#6B7280', marginTop: '6px' }}>
            Choose your preferred language
          </p>
        </motion.div>
      </div>

      {/* Language options */}
      <div className="flex-1 px-6 mt-8 flex flex-col gap-4">
        {languages.map((lang, i) => {
          const isSelected = language === lang.code;
          return (
            <motion.button
              key={lang.code}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25 + i * 0.1 }}
              onClick={() => setLanguage(lang.code)}
              className="w-full flex items-center gap-4 p-4 rounded-2xl text-left transition-all"
              style={{
                background: isSelected ? '#E8F5F1' : 'white',
                border: `2px solid ${isSelected ? '#006A4E' : '#E5E7EB'}`,
                boxShadow: isSelected ? '0 4px 16px rgba(0,106,78,0.15)' : '0 2px 8px rgba(0,0,0,0.04)',
              }}
            >
              <span style={{ fontSize: '32px' }}>{lang.flag}</span>
              <div className="flex-1">
                <div
                  style={{
                    fontFamily: 'Hind Siliguri, sans-serif',
                    fontSize: '18px',
                    fontWeight: 700,
                    color: '#1A1A2E',
                  }}
                >
                  {lang.name}
                </div>
                <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#6B7280', marginTop: '2px' }}>
                  {lang.subtitle} · {lang.desc}
                </div>
              </div>
              {isSelected && (
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center"
                  style={{ background: '#006A4E' }}
                >
                  <Check size={14} color="white" strokeWidth={3} />
                </div>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Continue button */}
      <div className="px-6 pb-10">
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate('/otp')}
          className="w-full py-4 rounded-2xl flex items-center justify-center gap-2"
          style={{
            background: 'linear-gradient(135deg, #006A4E, #004D38)',
            boxShadow: '0 8px 24px rgba(0,106,78,0.35)',
          }}
        >
          <span
            style={{
              fontFamily: 'Hind Siliguri, sans-serif',
              fontSize: '17px',
              fontWeight: 700,
              color: 'white',
            }}
          >
            {language === 'bn' ? 'পরবর্তী' : 'Continue'}
          </span>
        </motion.button>
      </div>
    </div>
  );
}
