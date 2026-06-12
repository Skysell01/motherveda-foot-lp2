import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { submitLead } from "@/lib/actions";
import logo from "@/assets/motherveda-logo.svg";
import heroImg from "@/assets/hero-transformation.jpg";
import detoxDemoImg from "@/assets/detox-patch-demo.jpg";
import productBoxImg from "@/assets/product-box.png";
import gymImg from "@/assets/gym-frustration.jpg";
import dietImg from "@/assets/dieting-frustration.jpg";
import nightImg from "@/assets/night-routine.png";
import doctorAvatar from "@/assets/doctor-avatar.png";
import beforeAfterImg from "@/assets/before-after.gif";
import productImg from "@/assets/product-shot.png";
import review1Img from "@/assets/review-1.png";
import review2Img from "@/assets/review-2.png";
import review3Img from "@/assets/review-3.png";
import review4Img from "@/assets/review-4.png";
import review5Img from "@/assets/review-5.png";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Jeevan Tatva Wellness – Free Expert Health Consultation" },
      {
        name: "description",
        content:
          "Take control of your health. Get personalized guidance from wellness experts on Diabetes support, weight management, and metabolism improvement.",
      },
      { property: "og:title", content: "Jeevan Tatva Medical Wellness Consultation" },
      {
        property: "og:description",
        content:
          "Get personalized guidance from health experts based on your lifestyle and concerns. Free Ayurvedic Consultation.",
      },
      { property: "og:image", content: heroImg },
    ],
    links: [
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,700;9..144,900&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap",
      },
    ],
  }),
});

const OPEN_CONSULTATION_EVENT = "jeevantatva:open-consultation";

function openConsultation(e?: React.MouseEvent) {
  if (e) e.preventDefault();
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(OPEN_CONSULTATION_EVENT));
  }
}

function useCountdown(minutes: number) {
  const [secs, setSecs] = useState(minutes * 60);
  useEffect(() => {
    const id = setInterval(() => setSecs((s) => (s > 0 ? s - 1 : minutes * 60)), 1000);
    return () => clearInterval(id);
  }, [minutes]);
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

function SectionTitle({ kicker, children }: { kicker?: string; children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-3xl text-center">
      {kicker && (
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-gold">{kicker}</p>
      )}
      <h2 className="text-3xl font-bold leading-tight text-foreground sm:text-4xl md:text-5xl">
        {children}
      </h2>
    </div>
  );
}

// Symptom options for Step 1
const SYMPTOMS = [
  { id: "sugar", label: "High Blood Sugar", icon: "🩸", desc: "Diabetes risk, insulin fluctuations" },
  { id: "weight", label: "Weight Gain / Belly Fat", icon: "⚖️", desc: "Stubborn body fat, heavy feeling" },
  { id: "metabolism", label: "Slow Metabolism", icon: "⚡", desc: "Sluggish energy, poor calorie burn" },
  { id: "fatigue", label: "Fatigue & Low Energy", icon: "🔋", desc: "Tired all day, weak morning starts" },
  { id: "digestion", label: "Digestive Problems", icon: "🍃", desc: "Bloating, gas, irregular gut health" },
  { id: "lifestyle", label: "Lifestyle Related Problems", icon: "🩺", desc: "Stress, sleep issues, toxicity" },
];

function MultiStepForm({ onSubmitted, className = "" }: { onSubmitted: () => void; className?: string }) {
  const [step, setStep] = useState(1);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [form, setForm] = useState({ name: "", phone: "", city: "" });
  const [errors, setErrors] = useState<{ symptoms?: string; name?: string; phone?: string; city?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const toggleSymptom = (label: string) => {
    if (selectedSymptoms.includes(label)) {
      setSelectedSymptoms(selectedSymptoms.filter((s) => s !== label));
    } else {
      setSelectedSymptoms([...selectedSymptoms, label]);
    }
    setErrors({ ...errors, symptoms: undefined });
  };

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedSymptoms.length === 0) {
      setErrors({ symptoms: "Please select at least one symptom to continue" });
      return;
    }
    setStep(2);
  };

  const validateStep2 = () => {
    const errs: typeof errors = {};
    if (!form.name.trim() || form.name.trim().length < 2) {
      errs.name = "Please enter your full name";
    }
    if (!/^[6-9]\d{9}$/.test(form.phone.trim())) {
      errs.phone = "Please enter a valid 10-digit mobile number";
    }
    if (!form.city.trim() || form.city.trim().length < 2) {
      errs.city = "Please enter your city";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep2()) return;
    setIsSubmitting(true);
    setErrorMsg(null);

    // Client-side 24hr check via localStorage
    const STORAGE_KEY = "jeevantatva_wellness_lead";
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const { phone: storedPhone, timestamp } = JSON.parse(stored);
        const elapsed = Date.now() - timestamp;
        const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;
        if (storedPhone === form.phone.trim() && elapsed < TWENTY_FOUR_HOURS) {
          setErrorMsg("You have already requested a consultation. Our expert will call you shortly.");
          setIsSubmitting(false);
          return;
        }
      } catch { /* ignore storage errors */ }
    }

    try {
      const result = await submitLead({
        data: {
          name: form.name.trim(),
          phone: form.phone.trim(),
          city: form.city.trim(),
          selectedSymptoms: selectedSymptoms,
          submittedAt: new Date().toLocaleString(),
          source: typeof window !== "undefined" ? window.location.href : "Landing Page",
        },
      });

      if (result.duplicate) {
        setErrorMsg(result.message);
        setIsSubmitting(false);
        return;
      }

      // Success
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        phone: form.phone.trim(),
        timestamp: Date.now(),
      }));

      // Fire Meta Pixel Lead event if available
      if (typeof window !== "undefined" && (window as any).fbq) {
        (window as any).fbq("track", "Lead");
      }

      onSubmitted();
      setForm({ name: "", phone: "", city: "" });
      setSelectedSymptoms([]);
      setStep(1);
    } catch (err) {
      console.error("Submission failed", err);
      setErrorMsg("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`rounded-3xl bg-card p-6 shadow-soft ring-1 ring-herb-deep/10 ${className}`}>
      {step === 1 ? (
        <form onSubmit={handleStep1Submit} className="space-y-4">
          <div className="text-center md:text-left">
            <span className="inline-block rounded-full bg-herb/10 px-3 py-1 text-xs font-bold text-herb">
              Step 1 of 2
            </span>
            <h3 className="mt-2 text-xl font-bold text-foreground sm:text-2xl">
              Select Your Health Concern(s)
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              Select all that apply to help us prepare your custom wellness plan
            </p>
          </div>

          <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
            {SYMPTOMS.map((sym) => {
              const isSelected = selectedSymptoms.includes(sym.label);
              return (
                <button
                  key={sym.id}
                  type="button"
                  onClick={() => toggleSymptom(sym.label)}
                  className={`flex items-start gap-3 rounded-2xl border p-3 text-left transition-all ${
                    isSelected
                      ? "border-herb bg-herb/5 ring-1 ring-herb"
                      : "border-border bg-beige/10 hover:bg-beige/30"
                  }`}
                >
                  <span className="text-2xl">{sym.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-foreground leading-tight">{sym.label}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">{sym.desc}</p>
                  </div>
                  <div className={`mt-0.5 flex h-4 w-4 flex-none items-center justify-center rounded-full border ${
                    isSelected ? "border-herb bg-herb text-white" : "border-muted-foreground/30"
                  }`}>
                    {isSelected && <span className="text-[9px] font-bold">✓</span>}
                  </div>
                </button>
              );
            })}
          </div>

          {errors.symptoms && (
            <p className="text-xs font-semibold text-destructive text-center">{errors.symptoms}</p>
          )}

          <button
            type="submit"
            className="w-full rounded-full bg-gradient-herb py-3 text-sm font-bold text-primary-foreground shadow-soft hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            Continue
          </button>
        </form>
      ) : (
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div className="text-center md:text-left">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="text-xs font-bold text-herb hover:underline flex items-center gap-1 mx-auto md:mx-0"
            >
              ← Back to Symptoms
            </button>
            <h3 className="mt-2 text-xl font-bold text-foreground sm:text-2xl">
              Get Free Consultation
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              Enter your details. A certified health expert will contact you.
            </p>
          </div>

          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-xs font-semibold text-foreground">Full Name (पूरा नाम)</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Enter your name"
                className="w-full rounded-2xl border border-input bg-cream/35 px-4 py-3 text-sm outline-none transition focus:border-herb focus:ring-2 focus:ring-herb/10"
              />
              {errors.name && <p className="mt-1 text-[11px] font-medium text-destructive">{errors.name}</p>}
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-foreground">Phone Number (मोबाइल नंबर)</label>
              <div className="flex items-stretch overflow-hidden rounded-2xl border border-input bg-cream/35 focus-within:border-herb focus-within:ring-2 focus-within:ring-herb/10">
                <span className="flex items-center bg-beige/40 px-3.5 text-xs font-bold text-herb border-r border-input">+91</span>
                <input
                  type="tel"
                  inputMode="numeric"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, "").slice(0, 10) })}
                  placeholder="10-digit mobile number"
                  className="w-full px-4 py-3 text-sm outline-none bg-transparent"
                />
              </div>
              {errors.phone && <p className="mt-1 text-[11px] font-medium text-destructive">{errors.phone}</p>}
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-foreground">City (शहर)</label>
              <input
                type="text"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                placeholder="Enter your city name"
                className="w-full rounded-2xl border border-input bg-cream/35 px-4 py-3 text-sm outline-none transition focus:border-herb focus:ring-2 focus:ring-herb/10"
              />
              {errors.city && <p className="mt-1 text-[11px] font-medium text-destructive">{errors.city}</p>}
            </div>
          </div>

          {errorMsg && (
            <p className="text-xs font-semibold text-destructive text-center">{errorMsg}</p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-full bg-gradient-herb py-3.5 text-sm font-bold text-primary-foreground shadow-soft hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {isSubmitting ? "Submitting..." : "Get Free Consultation"}
          </button>
          <p className="text-center text-[10px] text-muted-foreground">
            🔒 Your data is 100% safe & will only be used for this free health advice call.
          </p>
        </form>
      )}
    </div>
  );
}

function Index() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [submitted, setSubmitted] = useState(false);
  const [consultationModalOpen, setConsultationModalOpen] = useState(false);
  const timer = useCountdown(30);

  useEffect(() => {
    const handler = () => setConsultationModalOpen(true);
    window.addEventListener(OPEN_CONSULTATION_EVENT, handler);
    return () => window.removeEventListener(OPEN_CONSULTATION_EVENT, handler);
  }, []);

  useEffect(() => {
    if (consultationModalOpen || submitted) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [consultationModalOpen, submitted]);

  const testimonials = [
    {
      n: "Sunita Verma",
      city: "Delhi",
      usage: "Ayurvedic Diabetes Support",
      rating: 5,
      proof: review1Img,
      q: "Mera blood sugar level maintain nahi ho raha tha aur subah uthte hi body me bohot heavy feeling rehti thi. Jeevan Tatva ki health advisor se consultation ke baad unhone mujhe ek holistic detox routine bataya. 2 weeks pads use karne aur batayi gayi lifestyle tips follow karne ke baad sugar levels and energy me clear improvements hain.",
    },
    {
      n: "Rajesh Sharma",
      city: "Pune",
      usage: "Weight Management & Metabolism",
      rating: 5,
      proof: review4Img,
      q: "Stuck weight and slow metabolism se pareshan tha. Gym and dieting ke baad bhi bloating rehti thi. Consultation call pe expert ne samjhaya ki root cause toxic accumulation aur poor lifestyle habit hai. Personalized guidance and overnight foot patch routine se fatigue bilkul gayab ho gaya hai, aur weight manage karna aasan lag raha hai.",
    },
    {
      n: "Manpreet Kaur",
      city: "Chandigarh",
      usage: "Fatigue & Low Energy",
      rating: 4.8,
      proof: review2Img,
      q: "Office stress and bad diet habits ki wajah se low energy and chronic digestion issues the. The consultant suggested some diet changes and Ayurvedic support. Foot patches ne body detox me bohot support kiya. Lighter mornings standard ban gayi hain. Very professional team!",
    },
    {
      n: "Dr. Anirudh Mehta",
      city: "Jaipur",
      usage: "Lifestyle Health Issues",
      rating: 5,
      proof: review5Img,
      q: "As a doctor myself, I appreciate their scientific yet natural approach. High blood sugar patients need natural lifestyle modifications rather than just high dosage pills. The Ayurvedic guidance Jeevan Tatva expert provides is highly customized and safe.",
    },
    {
      n: "Vikram Reddy",
      city: "Bengaluru",
      usage: "Metabolism Improvement",
      rating: 4.9,
      proof: review3Img,
      q: "Water retention, swollen feet and low energy were dragging me down. Post submitting the form, their Ayurvedic practitioner explained my body constitution (Prakriti) and recommended detoxification. The daily routine modifications worked wonders for my sluggish metabolism.",
    },
  ];

  const faqs = [
    {
      q: "Is the health consultation really 100% free?",
      a: "Yes. The initial phone consultation is completely free. Our goal is to understand your symptoms, analyze your lifestyle/symptoms, and guide you towards natural, customized wellness recovery.",
    },
    {
      q: "How will this help with diabetes, high blood sugar, or slow metabolism?",
      a: "Our certified wellness advisors use Ayurvedic principles to target the root cause of these issues—which is often poor digestion, toxic buildup (Ama), and slow metabolism. We guide you on dietary changes, light activity, and recommend natural support products (like Ayurvedic detox patches) that promote circulation and stress relief.",
    },
    {
      q: "What products or solutions do you recommend?",
      a: "We recommend a holistic package: customized dietary modifications, light yoga/movement routines, and our Jeevan Tatva Premium Detox Foot Patches, which work overnight to draw out impurities, soothe tired feet, and support metabolic recovery naturally.",
    },
    {
      q: "How long does the consultation take?",
      a: "The call usually takes about 10-15 minutes. Our health expert will ask you about your daily habits, dietary preferences, and current medical history to design a personalized guidance plan.",
    },
    {
      q: "Are your remedies and advices safe?",
      a: "Absolutely. Everything we recommend is 100% natural, chemical-free, and based on age-old Ayurvedic wisdom. They are safe to use alongside your regular medications.",
    },
  ];

  const problemCards = [
    {
      title: "Blood Sugar Imbalance",
      symptom: "Spikes after meals, constant sweet cravings, risk of diabetic complications.",
      harm: "Ignoring this can lead to nerve damage, kidney issues, and persistent fatigue.",
      icon: "🩸",
    },
    {
      title: "Weight Gain & Belly Fat",
      symptom: "Fat deposition around midsection, difficulty losing weight despite working out.",
      harm: "Visceral fat releases inflammatory markers, putting strain on your heart and joints.",
      icon: "⚖️",
    },
    {
      title: "Poor Lifestyle & Toxicity",
      symptom: "Chronic bloating, acidic stomach, waking up with swollen feet or heavy body.",
      harm: "Unreleased metabolic waste (Ama) acts as low-grade poison, blocking natural cellular recovery.",
      icon: "🩺",
    },
  ];

  const benefitCards = [
    {
      title: "Personalized Guidance",
      desc: "Get a customized daily routine and diet plan tailored specifically to your body constitution (Vata-Pitta-Kapha) and specific health complaints.",
      icon: "📋",
    },
    {
      title: "Expert Consultation",
      desc: "Speak directly with certified Ayurvedic practitioners and holistic wellness advisors. No automated bots, real human health experts dedicated to your care.",
      icon: "👨‍⚕️",
    },
    {
      title: "Sustainable Lifestyle Improvement",
      desc: "No crash diets or extreme physical strain. We provide small, easy, and sustainable habits that naturally heal your body from within.",
      icon: "🌱",
    },
    {
      title: "Overnight Natural Detox",
      desc: "Learn how to use Jeevan Tatva foot patches to naturally stimulate reflexology points, absorb waste, and jumpstart your metabolism while you sleep.",
      icon: "🌙",
    },
  ];

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* HEADER */}
      <header className="sticky top-0 z-40 border-b border-border/60 bg-cream/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <img src={logo} alt="Jeevan Tatva Logo" className="h-12 sm:h-16 w-auto" />
          <nav className="hidden items-center gap-7 text-sm font-semibold text-foreground/80 lg:flex">
            <a href="#problems" className="hover:text-herb transition-colors">Health Concerns</a>
            <a href="#benefits" className="hover:text-herb transition-colors">Our Approach</a>
            <a href="#how-it-works" className="hover:text-herb transition-colors">How It Works</a>
            <a href="#testimonials" className="hover:text-herb transition-colors">Success Stories</a>
            <a href="#faq" className="hover:text-herb transition-colors">FAQ</a>
          </nav>
          <button
            type="button"
            onClick={() => setConsultationModalOpen(true)}
            className="inline-flex rounded-full bg-gradient-herb px-4 py-2 text-xs font-bold text-primary-foreground shadow-soft animate-cta-shake hover:scale-[1.03] transition-all sm:px-5 sm:py-2.5 sm:text-sm"
          >
            Talk to Expert
          </button>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-cream py-8 sm:py-12 md:py-16">
        <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-herb-deep/5 blur-3xl" />
        <div className="absolute -bottom-32 -left-24 h-96 w-96 rounded-full bg-gold/10 blur-3xl" />
        
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-12 items-center">
            
            {/* HERO TEXT */}
            <div className="text-center lg:text-left lg:col-span-7 space-y-6">
              <div className="flex flex-wrap justify-center lg:justify-start gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-herb/20 bg-cream px-3 py-1 text-xs font-bold text-herb">
                  🩺 Ayurvedic Medical Wellness Campaign
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-gold/25 px-3 py-1 text-xs font-bold text-ink">
                  🌿 100% Safe & Natural Support
                </span>
              </div>
              
              <h1 className="text-4xl font-black leading-[1.1] text-foreground sm:text-5xl md:text-6xl">
                Take Control Of Your Health Before <span className="text-herb">Small Symptoms</span> Become Bigger Problems
              </h1>
              
              <p className="text-lg text-muted-foreground leading-relaxed">
                Get personalized guidance from health experts based on your lifestyle and concerns. Learn how to manage blood sugar, control weight, boost sluggish metabolism, and flush toxins naturally.
              </p>

              {/* Mobile hero image */}
              <div className="mt-5 overflow-hidden rounded-3xl shadow-soft ring-1 ring-herb-deep/10 max-w-lg mx-auto lg:hidden">
                <img src={heroImg} alt="Ayurvedic Wellness Support" className="w-full h-auto" />
              </div>

              {/* Desktop hero image */}
              <div className="hidden lg:block overflow-hidden rounded-3xl shadow-soft ring-1 ring-herb-deep/10 max-w-lg">
                <img src={heroImg} alt="Ayurvedic Wellness Support" className="w-full h-48 object-cover" />
              </div>

              <div className="grid gap-3 grid-cols-2 max-w-md mx-auto lg:mx-0 text-left text-xs sm:text-sm font-semibold">
                {["✓ Diabetes Support", "✓ Metabolism Boost", "✓ Weight & Fat Loss", "✓ Better Gut Health", "✓ Sleep & Stress Relief", "✓ Toxic Waste Removal"].map((point) => (
                  <div key={point} className="flex items-center gap-2 text-foreground">
                    <span className="h-2 w-2 rounded-full bg-herb" />
                    {point}
                  </div>
                ))}
              </div>
            </div>

            {/* HERO FORM */}
            <div className="lg:col-span-5 w-full max-w-lg mx-auto">
              <MultiStepForm onSubmitted={() => setSubmitted(true)} />
            </div>

          </div>
        </div>
      </section>

      {/* PRODUCT BOX IMAGE */}
      <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="mx-auto max-w-3xl overflow-hidden rounded-3xl shadow-soft ring-1 ring-herb-deep/10">
          <img src={productBoxImg} alt="Jeevan Tatva Foot Detox Patch product box with 30 pads" className="w-full h-auto" loading="lazy" />
        </div>
      </div>

      {/* EXPERT ADVISOR CREDIBILITIES CARD */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="mx-auto max-w-4xl rounded-3xl bg-card p-6 shadow-card ring-1 ring-herb-deep/10 sm:p-8">
          <p className="text-center text-xs font-bold uppercase tracking-wider text-herb sm:text-left">
            👨‍⚕️ Speak to a Certified Wellness Practitioner
          </p>
          <div className="mt-4 flex flex-col items-center gap-4 sm:flex-row sm:items-start sm:gap-5">
            <div className="relative flex-none">
              <img
                src={doctorAvatar}
                alt="Dr. Rakesh K. (BAMS)"
                className="h-24 w-24 rounded-full object-cover ring-4 ring-herb/20 shadow-soft"
              />
              <span className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-herb text-xs text-primary-foreground shadow-sm">
                ✓
              </span>
            </div>
            <div className="text-center sm:text-left">
              <h3 className="font-display text-2xl font-bold text-foreground">
                Dr. Rakesh K. <span className="text-herb">(BAMS)</span>
              </h3>
              <p className="text-xs text-muted-foreground font-semibold">
                Senior Wellness Advisor • Holistic Foot Care & Ayurvedic Specialist
              </p>
              <p className="mt-2 text-sm text-muted-foreground max-w-xl">
                With over 15+ years of clinical practice, Dr. Rakesh helps individuals identify metabolic blocks, toxic accumulations, and poor lifestyle habits using safe, holistic principles.
              </p>
            </div>
          </div>
          <div className="mt-6 grid gap-3 grid-cols-2 md:grid-cols-4 text-xs font-semibold">
            {[
              { i: "🩺", t: "15+ Years Experience" },
              { i: "🌿", t: "100% Natural Wisdom" },
              { i: "🗣️", t: "Hinglish, English, தமிழ்" },
              { i: "🛡️", t: "Zero Side Effects" },
            ].map((b) => (
              <div key={b.t} className="flex items-center gap-2 justify-center sm:justify-start rounded-xl bg-beige/40 p-2.5">
                <span>{b.i}</span>
                <span className="text-foreground">{b.t}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PROBLEM AWARENESS SECTION */}
      <section id="problems" className="py-12 sm:py-16 bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <SectionTitle kicker="Understanding The Root Cause">
            Are You Ignoring These Silent Body Warnings?
          </SectionTitle>
          <p className="mx-auto mt-4 max-w-2xl text-center text-muted-foreground">
            Modern lifestyles, toxic chemical exposures, and stress clog our body's natural elimination pathways. This build-up of metabolic waste (Ama) often leads to larger health complications.
          </p>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {problemCards.map((p) => (
              <div key={p.title} className="rounded-3xl border border-border bg-card p-7 shadow-card transition-all hover:-translate-y-1">
                <span className="text-4xl">{p.icon}</span>
                <h3 className="mt-4 text-xl font-bold text-foreground">{p.title}</h3>
                <div className="mt-4 space-y-3 text-sm">
                  <div>
                    <span className="font-bold text-destructive text-xs uppercase block">How it starts:</span>
                    <p className="text-muted-foreground mt-0.5">{p.symptom}</p>
                  </div>
                  <div className="border-t border-border/60 pt-3">
                    <span className="font-bold text-herb text-xs uppercase block">The Danger:</span>
                    <p className="text-muted-foreground mt-0.5">{p.harm}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 text-center">
            <button
              onClick={() => setConsultationModalOpen(true)}
              className="inline-flex items-center justify-center rounded-full bg-gold px-8 py-3.5 text-sm font-bold text-ink shadow-soft animate-cta-shake hover:scale-[1.03] transition-all"
            >
              Analyze Your Symptoms Now →
            </button>
          </div>
        </div>
      </section>

      {/* BENEFITS SECTION */}
      <section id="benefits" className="py-12 sm:py-16 bg-beige/40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <SectionTitle kicker="Why Choose Us">
            A Medically Trustworthy Approach To Health Recovery
          </SectionTitle>
          <p className="mx-auto mt-4 max-w-2xl text-center text-muted-foreground">
            We don't believe in temporary band-aid fixes. We help you reboot your natural metabolism and cleanse toxic reserves for lasting wellness.
          </p>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {benefitCards.map((b) => (
              <div key={b.title} className="rounded-3xl bg-card p-6 shadow-card text-center sm:text-left space-y-3">
                <span className="text-3xl inline-block p-2 rounded-2xl bg-cream">{b.icon}</span>
                <h3 className="text-lg font-bold text-foreground leading-tight">{b.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section id="how-it-works" className="py-12 sm:py-16 bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <SectionTitle kicker="Simplified Process">
            3-Step Night Routine for Refreshed Mornings
          </SectionTitle>
          
          <div className="mt-12 grid gap-12 md:grid-cols-2 items-center">
            {/* Left Column: Image */}
            <div className="overflow-hidden rounded-3xl shadow-soft ring-1 ring-herb-deep/10">
              <img src={nightImg} alt="Night routine — applying detox foot pads" loading="lazy" className="w-full h-auto object-cover" />
            </div>

            {/* Right Column: Steps */}
            <div className="space-y-6">
              {[
                {
                  step: "01",
                  title: "Foot patch that apply on the foot (फ़ुट पैच लगाएँ)",
                  desc: "Sone se pehle foot patch ko dono feet ke center par clean aur dry karke stick karein.",
                },
                {
                  step: "02",
                  title: "Stay overnight (रात भर रहने दें)",
                  desc: "6-8 ghante sleep ke dauraan patches ko biological reflex points stimulate karne dein.",
                },
                {
                  step: "03",
                  title: "Remove in the morning (सुबह हटाएँ)",
                  desc: "Subah patches ko remove karein aur waste build-up (Ama) clear karke energy feel karein.",
                },
              ].map((item, idx) => (
                <div key={idx} className="flex gap-4 rounded-3xl border border-border bg-card p-6 shadow-card">
                  <span className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-gradient-herb text-sm font-bold text-primary-foreground shadow-soft">
                    {item.step}
                  </span>
                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-foreground">{item.title}</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* DETOX FOOT PATCH SOLUTION HIGHLIGHT */}
      <section className="py-12 sm:py-16 bg-cream/80">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid gap-12 md:grid-cols-2 items-center">
            
            <div className="relative">
              <div className="overflow-hidden rounded-3xl shadow-soft ring-1 ring-herb-deep/15">
                <img src={detoxDemoImg} alt="Detox patch demo" className="w-full h-auto object-cover" />
              </div>
              <div className="absolute -bottom-5 left-4 right-4 mx-auto flex max-w-xs items-center justify-between rounded-2xl bg-card px-4 py-3 shadow-card">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Premium Detox Support</p>
                  <p className="text-xl font-bold text-herb">Natural & Organic</p>
                </div>
                <span className="rounded-full bg-herb/10 px-3 py-1 text-xs font-bold text-herb">30 Pads Pack</span>
              </div>
            </div>

            <div className="space-y-6 text-center md:text-left">
              <span className="inline-block rounded-full bg-herb/10 px-3 py-1 text-xs font-bold text-herb">
                Overnight Reflexology Support
              </span>
              <h2 className="text-3xl font-bold leading-tight text-foreground sm:text-4xl">
                Jeevan Tatva Premium Detox Foot Patches
              </h2>
              <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
                As part of our custom wellness plans, we often advise using Jeevan Tatva Foot Patches. Infused with natural ingredients like bamboo vinegar, wood vinegar, and tourmaline, they stimulate acupuncture points on the soles of your feet to draw out toxins, relieve bloating, improve metabolic flow, and assist in weight management overnight.
              </p>
              
              <ul className="space-y-2.5 text-xs sm:text-sm font-semibold text-left inline-block md:block">
                <li className="flex items-center gap-2"><span className="text-herb font-bold">✓</span> Draws out toxic metabolic waste (Ama) overnight</li>
                <li className="flex items-center gap-2"><span className="text-herb font-bold">✓</span> Alleviates foot swelling, heaviness & leg cramps</li>
                <li className="flex items-center gap-2"><span className="text-herb font-bold">✓</span> Supports sound sleep & relieves anxiety/stress</li>
                <li className="flex items-center gap-2"><span className="text-herb font-bold">✓</span> Promotes overall energy levels & speeds up metabolism</li>
              </ul>

              <div>
                <button
                  onClick={() => setConsultationModalOpen(true)}
                  className="rounded-full bg-gradient-herb px-8 py-4 text-sm font-bold text-primary-foreground shadow-soft hover:scale-[1.03] transition-all"
                >
                  Consult Expert For Details
                </button>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* BEFORE / AFTER FEELING */}
      <section id="feeling" className="bg-background py-6 sm:py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <SectionTitle kicker="From → To · Wellness Transformation">
            From <span className="text-muted-foreground">Heavy Body Feeling</span> To <span className="text-herb">Lighter Starts</span>
          </SectionTitle>
          <div className="mt-10 overflow-hidden rounded-3xl shadow-soft ring-1 ring-border">
            <img src={beforeAfterImg} alt="Before and after lighter morning feeling" loading="lazy" width={1920} height={1080} className="h-full w-full object-cover" />
          </div>
          <div className="mt-8 grid gap-5 md:grid-cols-2">
            <div className="rounded-3xl border border-border bg-card p-7 text-center sm:text-left">
              <p className="mb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">Before</p>
              <h3 className="font-display text-2xl font-bold text-foreground">Heavy & stuck</h3>
              <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground">
                {["Gym ke baad bhi tired", "Diet ke baad bhi bloated", "Subah body heavy", "Low motivation", "Pet puffy appearance"].map((t) => (
                  <li key={t} className="flex justify-center gap-2 sm:justify-start"><span className="text-destructive">✕</span>{t}</li>
                ))}
              </ul>
            </div>
            <div className="rounded-3xl bg-gradient-herb p-7 text-center text-primary-foreground shadow-soft sm:text-left">
              <p className="mb-3 text-xs font-bold uppercase tracking-wider text-gold">After</p>
              <h3 className="font-display text-2xl font-bold">Lighter & active</h3>
              <ul className="mt-4 space-y-2.5 text-sm">
                {["Fresh morning feeling", "Less bloated appearance", "Lighter body feel", "More active start", "Ready for movement"].map((t) => (
                  <li key={t} className="flex justify-center gap-2 sm:justify-start"><span className="text-gold">✓</span>{t}</li>
                ))}
              </ul>
            </div>
          </div>
          <div className="mt-10 text-center">
            <button
              onClick={() => setConsultationModalOpen(true)}
              className="inline-flex items-center justify-center rounded-full bg-gold px-8 py-3.5 text-sm font-bold text-ink shadow-soft animate-cta-shake hover:scale-[1.03] transition-all"
            >
              Get Free Consultation Now →
            </button>
          </div>
        </div>
      </section>

      {/* TRUST SECTION */}
      <section className="py-12 sm:py-16 bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <SectionTitle kicker="Medically Trustworthy">
            Committed to Safe, Ayurvedic Health Guidelines
          </SectionTitle>
          <p className="mx-auto mt-4 max-w-2xl text-center text-muted-foreground">
            Our wellness consultations follow clinical standards, blending modern physiological understanding with traditional Ayurvedic herbology.
          </p>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              {
                title: "Certified Practitioners",
                desc: "All health suggestions are cross-verified by licensed Ayurvedic practitioners and nutritionists who specialize in diabetic & lifestyle wellness.",
                icon: "🎓",
              },
              {
                title: "100% Safe Formulations",
                desc: "Any organic supplement or detox patch recommended is completely free of chemical binders, heavy metals, or habit-forming substances.",
                icon: "🌿",
              },
              {
                title: "Data Confidentiality",
                desc: "We respect your privacy. Your medical history, phone number, and symptom sheets are encrypted and never shared with external marketers.",
                icon: "🔒",
              },
            ].map((item) => (
              <div key={item.title} className="rounded-3xl border border-border bg-card p-6 shadow-card text-center md:text-left space-y-3">
                <span className="text-3xl inline-block">{item.icon}</span>
                <h3 className="text-lg font-bold text-foreground">{item.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS SECTION */}
      <section id="testimonials" className="py-12 sm:py-16 bg-beige/40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <SectionTitle kicker="Real Results">
            Real Stories of Health Restored
          </SectionTitle>
          <p className="mx-auto mt-4 max-w-2xl text-center text-muted-foreground">
            See how our free consultation and natural detox recommendations helped individuals take control of their symptoms.
          </p>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {testimonials.map((t, idx) => {
              const initials = t.n.split(" ").map((w) => w[0]).join("");
              return (
                <div key={idx} className="flex flex-col rounded-3xl bg-card p-6 shadow-card justify-between ring-1 ring-border/60">
                  <div>
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-gradient-herb text-xs font-bold text-primary-foreground shadow-soft">
                        {initials}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <p className="text-sm font-bold text-foreground">{t.n}</p>
                          <span className="inline-flex items-center gap-0.5 rounded-full bg-herb/10 px-1.5 py-0.5 text-[9px] font-semibold text-herb">
                            ✓ Verified
                          </span>
                        </div>
                        <p className="text-[10px] text-muted-foreground">📍 {t.city}</p>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center gap-1 text-gold text-xs">
                      <span>★★★★★</span>
                      <span className="text-foreground font-semibold ml-1">{t.rating}</span>
                    </div>

                    <p className="mt-3 text-xs leading-relaxed text-foreground/90 italic">
                      "{t.q}"
                    </p>

                    {t.proof && (
                      <div className="mt-4 overflow-hidden rounded-2xl border border-border">
                        <img
                          src={t.proof}
                          alt={`${t.n} proof`}
                          loading="lazy"
                          className="h-40 w-full object-cover"
                        />
                      </div>
                    )}
                  </div>

                  <div className="mt-4 border-t border-border/60 pt-3 flex items-center justify-between text-[11px] text-muted-foreground font-medium">
                    <span className="text-herb">{t.usage}</span>
                    <span>Consultation Client</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section id="faq" className="py-12 sm:py-16 bg-background">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <SectionTitle kicker="Frequently Asked Questions">
            Aapke Sawaal, Honest Jawaab
          </SectionTitle>
          <div className="mt-10 space-y-3">
            {faqs.map((f, i) => {
              const open = openFaq === i;
              return (
                <div key={f.q} className="overflow-hidden rounded-2xl border border-border bg-card">
                  <button
                    onClick={() => setOpenFaq(open ? null : i)}
                    className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left font-bold text-sm sm:text-base text-foreground"
                  >
                    <span>{f.q}</span>
                    <span className={`flex h-6 w-6 flex-none items-center justify-center rounded-full bg-herb text-primary-foreground transition-transform ${open ? "rotate-45" : ""}`}>+</span>
                  </button>
                  {open && <div className="px-5 pb-5 text-xs sm:text-sm leading-relaxed text-muted-foreground border-t border-border/40 pt-3 bg-beige/10">{f.a}</div>}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FINAL CTA SECTION */}
      <section className="bg-herb relative overflow-hidden py-12 text-primary-foreground sm:py-16">
        <div className="absolute inset-0 opacity-10 animate-pulse" style={{ backgroundImage: "radial-gradient(circle at 80% 20%, white 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
        <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 space-y-6">
          <img src={logo} alt="Jeevan Tatva Logo" className="mx-auto h-12" />
          <h2 className="text-3xl font-black leading-tight sm:text-4xl md:text-5xl">
            Start Your Path To Health & Vitality Today
          </h2>
          <p className="mx-auto max-w-2xl text-sm sm:text-base opacity-95">
            Don't let small daily symptoms (like blood sugar variations, sluggish weight gain, and fatigue) grow into chronic health issues. Get advice now.
          </p>
          <button
            type="button"
            onClick={() => setConsultationModalOpen(true)}
            className="inline-flex items-center justify-center rounded-full bg-gold px-10 py-4.5 text-base font-bold text-ink shadow-soft animate-cta-shake hover:scale-[1.03] transition-all"
          >
            Start Your Health Journey
          </button>
          <div className="flex justify-center gap-4 text-xs font-semibold">
            <span>✓ 100% Free Consultation</span>
            <span>✓ No Obligations</span>
            <span>✓ Certified Advisors</span>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-ink py-10 text-cream/70 text-xs sm:text-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex flex-col items-center gap-6 md:flex-row md:justify-between border-b border-white/10 pb-8">
            <img src={logo} alt="Jeevan Tatva Logo" className="h-10" />
            <nav className="flex flex-wrap justify-center gap-5">
              <a href="#problems" className="hover:text-white">Health Concerns</a>
              <a href="#benefits" className="hover:text-white">Approach</a>
              <a href="#how-it-works" className="hover:text-white">How It Works</a>
              <a href="#testimonials" className="hover:text-white">Testimonials</a>
              <a href="#faq" className="hover:text-white">FAQ</a>
            </nav>
          </div>
          <div className="mt-8 text-center space-y-2">
            <p className="text-[10px] text-cream/40 leading-relaxed max-w-3xl mx-auto">
              Disclaimer: The free health advice and wellness plans offered are for informational purposes only and do not substitute professional medical advice, diagnosis, or treatment. Jeevan Tatva foot patches are natural wellness supports and are not intended to cure or prevent any disease.
            </p>
            <p className="text-[10px] text-cream/40">© {new Date().getFullYear()} Jeevan Tatva. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* STICKY BOTTOM BAR */}
      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-herb-deep/20 bg-cream/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2.5 sm:px-6">
          <div className="hidden sm:flex flex-col">
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-destructive">
              <span className="h-1.5 w-1.5 animate-ping rounded-full bg-destructive" /> Free Consultation Slots
            </span>
            <span className="text-[11px] text-muted-foreground font-semibold">Book before the campaign ends</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-herb px-2.5 py-1 text-primary-foreground">
              <p className="text-[8px] uppercase tracking-wider opacity-80 leading-none">Timer</p>
              <p className="font-mono text-sm font-bold tabular-nums leading-tight">{timer}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setConsultationModalOpen(true)}
            className="flex-1 sm:flex-none rounded-full bg-gradient-herb px-6 py-2.5 text-center text-xs sm:text-sm font-bold text-primary-foreground shadow-soft animate-cta-shake sm:px-8 ml-4"
          >
            Get Free Consultation Now →
          </button>
        </div>
      </div>

      {/* CONSULTATION MODAL FLOW */}
      {consultationModalOpen && (
        <div className="fixed inset-0 z-[70] flex items-end justify-center bg-ink/65 px-3 py-6 backdrop-blur-sm sm:items-center sm:p-6" onClick={() => setConsultationModalOpen(false)}>
          <div
            className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-card shadow-soft ring-1 ring-herb-deep/10 animate-in fade-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              aria-label="Close"
              onClick={() => setConsultationModalOpen(false)}
              className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-cream text-foreground hover:bg-beige"
            >
              ✕
            </button>
            <div className="bg-gradient-herb px-6 py-5 text-primary-foreground">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gold">Jeevan Tatva Wellness</p>
              <h3 className="mt-1 font-display text-xl font-bold">Ayurvedic Health Consultation</h3>
              <p className="text-xs opacity-90 mt-1">Get custom lifestyle guidance from certified advisors</p>
            </div>
            
            <div className="max-h-[75vh] overflow-y-auto p-4 sm:p-6">
              <MultiStepForm onSubmitted={() => {
                setConsultationModalOpen(false);
                setSubmitted(true);
              }} />
            </div>
          </div>
        </div>
      )}

      {/* THANK YOU MODAL */}
      {submitted && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-ink/65 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-card p-8 text-center shadow-soft animate-in fade-in zoom-in-95">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-herb text-3xl text-primary-foreground shadow-soft">
              ✓
            </div>
            <h3 className="font-display text-2xl font-bold text-foreground">Thank You!</h3>
            <p className="mt-3 text-sm leading-relaxed text-foreground font-semibold">
              Our health representative will call you shortly to understand your concern and guide you.
            </p>
            <p className="mt-2 text-xs font-semibold text-herb bg-herb/5 rounded-full py-1 px-3 inline-block">
              📞 Stay Available For The Call
            </p>
            <button
              onClick={() => setSubmitted(false)}
              className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-gradient-herb py-3 text-sm font-bold text-primary-foreground shadow-soft"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
