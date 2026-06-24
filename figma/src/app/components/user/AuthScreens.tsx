import { useState } from "react";
import { ArrowRight, Eye, EyeOff, Phone, Mail, Lock, ChevronLeft } from "lucide-react";

interface SplashScreenProps {
  onFinish: () => void;
}
export function SplashScreen({ onFinish }: SplashScreenProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full bg-[#1B4FDB] relative overflow-hidden">
      {/* Background decorative circles */}
      <div className="absolute top-[-80px] right-[-80px] w-64 h-64 rounded-full bg-white/5" />
      <div className="absolute bottom-[-60px] left-[-60px] w-48 h-48 rounded-full bg-white/5" />
      <div className="absolute top-1/3 right-[-40px] w-32 h-32 rounded-full bg-white/5" />

      <div className="flex flex-col items-center z-10">
        {/* Logo */}
        <div className="w-20 h-20 bg-white/15 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
          <span className="text-4xl">🌉</span>
        </div>
        <div className="text-white text-3xl font-bold tracking-tight">TollBD</div>
        <div className="text-white/70 text-base mt-1">টোলবিডি</div>
        <div className="text-white/70 text-sm mt-2">Smart Toll. Faster Bangladesh.</div>
        <div className="text-white/50 text-xs mt-1 font-['Hind_Siliguri']">স্মার্ট টোল। দ্রুত বাংলাদেশ।</div>

        {/* Loading dots */}
        <div className="flex gap-2 mt-12">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 bg-white rounded-full animate-pulse"
              style={{ animationDelay: `${i * 200}ms` }}
            />
          ))}
        </div>
      </div>

      <button
        onClick={onFinish}
        className="absolute bottom-12 text-white/60 text-xs underline z-10"
      >
        Tap to continue
      </button>

      <div className="absolute bottom-6 text-white/30 text-xs">v1.0.0</div>
    </div>
  );
}

// Onboarding
interface OnboardingScreenProps {
  onFinish: () => void;
}
const slides = [
  {
    icon: "📱",
    badge: "STEP 1 OF 3",
    title: "নিবন্ধন করুন",
    titleEn: "Register Easily",
    body: "আপনার ফোন নম্বর দিয়ে সহজেই নিবন্ধন করুন এবং স্মার্ট টোল সেবা উপভোগ করুন।",
    color: "from-[#EEF2FF] to-[#C7D4FF]",
    illustrationBg: "#EEF2FF",
  },
  {
    icon: "💳",
    badge: "STEP 2 OF 3",
    title: "ওয়ালেট ব্যবহার করুন",
    titleEn: "Digital Wallet",
    body: "bKash, Nagad বা কার্ড দিয়ে ওয়ালেটে টাকা রাখুন এবং যেকোনো সেতুতে টোল দিন।",
    color: "from-[#E6FBF2] to-[#A8EDD4]",
    illustrationBg: "#E6FBF2",
  },
  {
    icon: "🌉",
    badge: "STEP 3 OF 3",
    title: "QR দিয়ে দ্রুত পার হন",
    titleEn: "Fast Lane Access",
    body: "টোল গেটে QR কোড দেখান এবং মাত্র কয়েক সেকেন্ডে পার হয়ে যান।",
    color: "from-[#FFF8E8] to-[#F5A623]/30",
    illustrationBg: "#FFF8E8",
  },
];

export function OnboardingScreen({ onFinish }: OnboardingScreenProps) {
  const [current, setCurrent] = useState(0);
  const slide = slides[current];

  const next = () => {
    if (current < slides.length - 1) setCurrent(current + 1);
    else onFinish();
  };
  const skip = () => onFinish();

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Illustration area */}
      <div className={`flex-1 bg-gradient-to-br ${slide.color} flex items-center justify-center relative overflow-hidden`}>
        <div className="absolute inset-0 opacity-10">
          {/* Decorative background pattern */}
          <div className="absolute top-8 left-8 w-32 h-32 rounded-full border-4 border-current opacity-30" />
          <div className="absolute bottom-8 right-8 w-24 h-24 rounded-full border-4 border-current opacity-20" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full border-4 border-current opacity-10" />
        </div>
        <div className="text-center z-10">
          <div className="text-[120px] mb-4 filter drop-shadow-lg">{slide.icon}</div>
          <div className="text-6xl opacity-20">🇧🇩</div>
        </div>
      </div>

      {/* Content card */}
      <div className="bg-white rounded-t-[32px] -mt-8 pt-6 pb-10 px-6 shadow-2xl">
        {/* Progress */}
        <div className="flex justify-center gap-2 mb-4">
          {slides.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${i === current ? "w-8 bg-[#1B4FDB]" : "w-2 bg-[#C9D3E8]"}`}
            />
          ))}
        </div>

        <span className="inline-block text-xs font-semibold tracking-widest text-[#1B4FDB] bg-[#EEF2FF] px-3 py-1 rounded-full">
          {slide.badge}
        </span>

        <h2 className="text-2xl font-bold text-[#0F1729] mt-3 font-['Hind_Siliguri']">{slide.title}</h2>
        <p className="text-sm text-[#5C6B8A] mt-2 leading-relaxed">{slide.body}</p>

        {current < slides.length - 1 ? (
          <div className="flex items-center justify-between mt-6">
            <button onClick={skip} className="text-[#8A97B5] text-sm font-medium px-4 py-2">
              এড়িয়ে যান
            </button>
            <button
              onClick={next}
              className="bg-[#1B4FDB] text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 text-sm active:scale-95 transition-transform"
            >
              পরবর্তী <ArrowRight size={16} />
            </button>
          </div>
        ) : (
          <button
            onClick={onFinish}
            className="w-full bg-[#1B4FDB] text-white py-4 rounded-xl font-semibold mt-6 text-base active:scale-95 transition-transform font-['Hind_Siliguri']"
          >
            শুরু করুন
          </button>
        )}
      </div>
    </div>
  );
}

// Login Screen
interface LoginScreenProps {
  onLogin: () => void;
  onRegister: () => void;
  onAdminLogin: () => void;
}
export function LoginScreen({ onLogin, onRegister, onAdminLogin }: LoginScreenProps) {
  const [tab, setTab] = useState<"phone" | "email">("phone");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);

  return (
    <div className="flex flex-col h-full bg-white overflow-y-auto">
      {/* Hero top */}
      <div className="bg-[#1B4FDB] pt-12 pb-16 px-6 relative overflow-hidden" style={{ borderRadius: "0 0 40px 40px" }}>
        <div className="absolute top-[-40px] right-[-40px] w-32 h-32 rounded-full bg-white/5" />
        <div className="absolute bottom-[-20px] left-[-20px] w-24 h-24 rounded-full bg-white/5" />
        <div className="flex justify-center mb-4">
          <div className="w-12 h-12 bg-white/15 rounded-xl flex items-center justify-center text-2xl">🌉</div>
        </div>
        <h2 className="text-white text-xl font-bold text-center font-['Hind_Siliguri']">আবার স্বাগতম</h2>
        <p className="text-white/70 text-sm text-center mt-1">Sign in to continue</p>
      </div>

      <div className="flex-1 px-6 pt-6 pb-8">
        {/* Tab switcher */}
        <div className="flex border-b border-[#E4E9F5] mb-6">
          {(["phone", "email"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 pb-3 text-sm font-medium transition-colors ${tab === t ? "border-b-2 border-[#1B4FDB] text-[#1B4FDB]" : "text-[#8A97B5]"}`}
            >
              {t === "phone" ? "📱 ফোন নম্বর" : "✉️ ইমেইল"}
            </button>
          ))}
        </div>

        {tab === "phone" ? (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-[#5C6B8A] mb-1.5 block">ফোন নম্বর</label>
              <div className="flex items-center bg-[#F0F3FA] rounded-xl border border-[#E4E9F5] overflow-hidden focus-within:border-[#1B4FDB] focus-within:ring-2 focus-within:ring-[#1B4FDB]/10">
                <div className="flex items-center gap-2 px-3 border-r border-[#E4E9F5] py-3.5">
                  <span>🇧🇩</span>
                  <span className="text-sm text-[#0F1729]">+880</span>
                </div>
                <input
                  type="tel"
                  placeholder="01XXXXXXXXX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="flex-1 bg-transparent px-3 py-3.5 text-sm text-[#0F1729] outline-none placeholder:text-[#8A97B5]"
                />
              </div>
            </div>
            <button onClick={onLogin} className="w-full bg-[#1B4FDB] text-white py-3.5 rounded-xl font-semibold text-sm active:scale-95 transition-transform flex items-center justify-center gap-2">
              <Phone size={16} /> OTP পাঠান
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-[#5C6B8A] mb-1.5 block">ইমেইল</label>
              <div className="flex items-center bg-[#F0F3FA] rounded-xl border border-[#E4E9F5] overflow-hidden focus-within:border-[#1B4FDB] focus-within:ring-2 focus-within:ring-[#1B4FDB]/10">
                <div className="px-3 py-3.5"><Mail size={18} className="text-[#8A97B5]" /></div>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 bg-transparent pr-3 py-3.5 text-sm text-[#0F1729] outline-none placeholder:text-[#8A97B5]"
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1.5">
                <label className="text-xs font-medium text-[#5C6B8A]">পাসওয়ার্ড</label>
                <button className="text-xs text-[#1B4FDB]">মনে নেই?</button>
              </div>
              <div className="flex items-center bg-[#F0F3FA] rounded-xl border border-[#E4E9F5] overflow-hidden focus-within:border-[#1B4FDB] focus-within:ring-2 focus-within:ring-[#1B4FDB]/10">
                <div className="px-3 py-3.5"><Lock size={18} className="text-[#8A97B5]" /></div>
                <input
                  type={showPass ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="flex-1 bg-transparent py-3.5 text-sm text-[#0F1729] outline-none placeholder:text-[#8A97B5]"
                />
                <button onClick={() => setShowPass(!showPass)} className="px-3 py-3.5">
                  {showPass ? <EyeOff size={18} className="text-[#8A97B5]" /> : <Eye size={18} className="text-[#8A97B5]" />}
                </button>
              </div>
            </div>
            <button onClick={onLogin} className="w-full bg-[#1B4FDB] text-white py-3.5 rounded-xl font-semibold text-sm active:scale-95 transition-transform flex items-center justify-center gap-2">
              <Lock size={16} /> লগ ইন করুন
            </button>
          </div>
        )}

        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px bg-[#E4E9F5]" />
          <span className="text-xs text-[#8A97B5]">অথবা</span>
          <div className="flex-1 h-px bg-[#E4E9F5]" />
        </div>

        <button className="w-full border border-[#E4E9F5] bg-white text-[#0F1729] py-3.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-3 hover:bg-[#F8F9FD] transition-colors">
          <span className="text-lg">G</span> Google দিয়ে লগ ইন করুন
        </button>

        <div className="text-center mt-5">
          <button onClick={onRegister} className="text-sm text-[#5C6B8A]">
            নতুন ব্যবহারকারী?{" "}
            <span className="text-[#1B4FDB] font-semibold">নিবন্ধন করুন →</span>
          </button>
        </div>

        <div className="text-center mt-3">
          <button onClick={onAdminLogin} className="text-xs text-[#8A97B5] underline">Admin Login</button>
        </div>
      </div>
    </div>
  );
}

// OTP Screen
interface OTPScreenProps {
  onVerify: () => void;
  onBack: () => void;
}
export function OTPScreen({ onVerify, onBack }: OTPScreenProps) {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);

  const handleChange = (val: string, idx: number) => {
    if (!/^\d*$/.test(val)) return;
    const newOtp = [...otp];
    newOtp[idx] = val.slice(-1);
    setOtp(newOtp);
    if (val && idx < 5) {
      const next = document.getElementById(`otp-${idx + 1}`);
      next?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, idx: number) => {
    if (e.key === "Backspace" && !otp[idx] && idx > 0) {
      const prev = document.getElementById(`otp-${idx - 1}`);
      prev?.focus();
    }
  };

  const filled = otp.every((d) => d !== "");

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex items-center px-4 pt-12 pb-4">
        <button onClick={onBack} className="w-10 h-10 rounded-full bg-[#F0F3FA] flex items-center justify-center">
          <ChevronLeft size={20} className="text-[#0F1729]" />
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center px-6 pt-6">
        <div className="w-16 h-16 bg-[#EEF2FF] rounded-full flex items-center justify-center text-3xl mb-4">📱</div>
        <h2 className="text-2xl font-bold text-[#0F1729] font-['Hind_Siliguri']">যাচাইকরণ</h2>
        <p className="text-sm text-[#5C6B8A] text-center mt-2">আপনার ইমেইলে কোড পাঠানো হয়েছে</p>
        <p className="text-sm text-[#1B4FDB] font-semibold mt-1">a***@gmail.com</p>

        {/* OTP boxes */}
        <div className="flex gap-2 mt-8">
          {otp.map((digit, i) => (
            <input
              key={i}
              id={`otp-${i}`}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(e.target.value, i)}
              onKeyDown={(e) => handleKeyDown(e, i)}
              className={`w-11 h-14 text-center text-lg font-bold rounded-xl border-2 outline-none transition-all font-mono ${
                digit ? "border-[#1B4FDB] bg-[#EEF2FF] text-[#1B4FDB]" : "border-[#E4E9F5] bg-[#F0F3FA] text-[#0F1729]"
              } focus:border-[#1B4FDB] focus:bg-white focus:ring-2 focus:ring-[#1B4FDB]/10`}
            />
          ))}
        </div>

        <p className="text-sm text-[#5C6B8A] mt-6">পুনরায় পাঠান (৪২ সেকেন্ড)</p>

        <button
          onClick={onVerify}
          disabled={!filled}
          className={`w-full py-4 rounded-xl font-semibold text-sm mt-6 transition-all ${filled ? "bg-[#1B4FDB] text-white active:scale-95" : "bg-[#E4E9F5] text-[#8A97B5] cursor-not-allowed"}`}
        >
          যাচাই করুন
        </button>
      </div>
    </div>
  );
}

// Register Screen
interface RegisterScreenProps {
  onComplete: () => void;
  onBack: () => void;
}
export function RegisterScreen({ onComplete, onBack }: RegisterScreenProps) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [division, setDivision] = useState("");
  const [agreed, setAgreed] = useState(false);

  return (
    <div className="flex flex-col h-full bg-white overflow-y-auto">
      <div className="flex items-center justify-between px-4 pt-12 pb-4">
        <button onClick={onBack} className="w-10 h-10 rounded-full bg-[#F0F3FA] flex items-center justify-center">
          <ChevronLeft size={20} className="text-[#0F1729]" />
        </button>
        <h1 className="font-bold text-[#0F1729]">নিবন্ধন</h1>
        <span className="text-xs text-[#8A97B5]">{step}/2</span>
      </div>

      {/* Step indicator */}
      <div className="flex mx-6 gap-2 mb-6">
        {[1, 2].map((s) => (
          <div key={s} className={`flex-1 h-1 rounded-full ${s <= step ? "bg-[#1B4FDB]" : "bg-[#E4E9F5]"}`} />
        ))}
      </div>

      <div className="flex-1 px-6 pb-6 space-y-5 overflow-y-auto">
        {step === 1 ? (
          <>
            {/* Avatar upload */}
            <div className="flex justify-center">
              <div className="w-20 h-20 rounded-full border-2 border-dashed border-[#C9D3E8] bg-[#F0F3FA] flex flex-col items-center justify-center cursor-pointer hover:border-[#1B4FDB] transition-colors">
                <span className="text-2xl">📷</span>
                <span className="text-[10px] text-[#8A97B5] mt-1">ছবি যোগ করুন</span>
              </div>
            </div>

            {[
              { label: "পূর্ণ নাম *", placeholder: "আপনার নাম লিখুন", value: name, onChange: setName, type: "text" },
              { label: "ইমেইল *", placeholder: "you@example.com", value: email, onChange: setEmail, type: "email" },
            ].map((field) => (
              <div key={field.label}>
                <label className="text-xs font-medium text-[#5C6B8A] mb-1.5 block">{field.label}</label>
                <input
                  type={field.type}
                  placeholder={field.placeholder}
                  value={field.value}
                  onChange={(e) => field.onChange(e.target.value)}
                  className="w-full bg-[#F0F3FA] rounded-xl border border-[#E4E9F5] px-4 py-3.5 text-sm text-[#0F1729] outline-none focus:border-[#1B4FDB] focus:ring-2 focus:ring-[#1B4FDB]/10 placeholder:text-[#8A97B5]"
                />
              </div>
            ))}

            <div>
              <label className="text-xs font-medium text-[#5C6B8A] mb-1.5 block">বিভাগ</label>
              <select
                value={division}
                onChange={(e) => setDivision(e.target.value)}
                className="w-full bg-[#F0F3FA] rounded-xl border border-[#E4E9F5] px-4 py-3.5 text-sm text-[#0F1729] outline-none focus:border-[#1B4FDB] appearance-none"
              >
                <option value="">বিভাগ নির্বাচন করুন</option>
                {["ঢাকা", "চট্টগ্রাম", "রাজশাহী", "খুলনা", "বরিশাল", "সিলেট", "রংপুর", "ময়মনসিংহ"].map((d) => (
                  <option key={d}>{d}</option>
                ))}
              </select>
            </div>

            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-0.5" />
              <span className="text-sm text-[#5C6B8A]">
                আমি{" "}
                <span className="text-[#1B4FDB]">শর্তাবলী</span> এবং{" "}
                <span className="text-[#1B4FDB]">গোপনীয়তা নীতি</span> মেনে নিচ্ছি
              </span>
            </label>

            <button
              onClick={() => setStep(2)}
              disabled={!name || !email || !agreed}
              className={`w-full py-4 rounded-xl font-semibold text-sm transition-all ${name && email && agreed ? "bg-[#1B4FDB] text-white active:scale-95" : "bg-[#E4E9F5] text-[#8A97B5] cursor-not-allowed"}`}
            >
              পরবর্তী →
            </button>
          </>
        ) : (
          <>
            <div className="bg-[#FFF8E1] border border-[#F9A825]/30 rounded-xl p-4 text-sm text-[#4E3200] flex gap-3">
              <span className="text-lg flex-shrink-0">⚠️</span>
              <div>আপনার তথ্য সরকারি ডাটাবেজের সাথে যাচাই করা হবে। সঠিক তথ্য প্রদান করুন।</div>
            </div>

            <div>
              <label className="text-xs font-medium text-[#5C6B8A] mb-1.5 block">NID নম্বর (ঐচ্ছিক)</label>
              <input
                type="text"
                placeholder="আপনার NID নম্বর"
                className="w-full bg-[#F0F3FA] rounded-xl border border-[#E4E9F5] px-4 py-3.5 text-sm text-[#0F1729] outline-none focus:border-[#1B4FDB] focus:ring-2 focus:ring-[#1B4FDB]/10 placeholder:text-[#8A97B5] font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-[#5C6B8A] mb-1.5 block">জরুরি যোগাযোগ (ঐচ্ছিক)</label>
              <input
                type="tel"
                placeholder="01XXXXXXXXX"
                className="w-full bg-[#F0F3FA] rounded-xl border border-[#E4E9F5] px-4 py-3.5 text-sm text-[#0F1729] outline-none focus:border-[#1B4FDB] focus:ring-2 focus:ring-[#1B4FDB]/10 placeholder:text-[#8A97B5]"
              />
            </div>

            <button
              onClick={onComplete}
              className="w-full bg-[#1B4FDB] text-white py-4 rounded-xl font-semibold text-sm active:scale-95 transition-transform font-['Hind_Siliguri']"
            >
              নিবন্ধন সম্পন্ন করুন
            </button>
          </>
        )}
      </div>
    </div>
  );
}
