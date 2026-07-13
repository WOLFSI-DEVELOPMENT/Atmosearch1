import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  Sparkles, 
  Brain, 
  MapPin, 
  Smile, 
  Briefcase, 
  User, 
  MessageSquare, 
  Globe, 
  Compass, 
  Loader2 
} from 'lucide-react';

interface OnboardingFlowProps {
  onComplete: (user: any) => void;
}

export default function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [step, setStep] = useState(1);
  const totalSteps = 6;

  // Form States
  const [nickname, setNickname] = useState('');
  const [tone, setTone] = useState<'More' | 'Default' | 'Less'>('Default');
  const [chars, setChars] = useState<Record<string, string>>({
    'Warm': 'Default',
    'Enthusiastic': 'Default',
    'Headers & Lists': 'Default',
    'Emoji': 'Default'
  });
  const [occupation, setOccupation] = useState('');
  const [moreAboutYou, setMoreAboutYou] = useState('');
  const [personalIntelligenceEnabled, setPersonalIntelligenceEnabled] = useState(false);
  const [userLocation, setUserLocation] = useState('');
  const [userCoordinates, setUserCoordinates] = useState('');
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [memoryEnabled, setMemoryEnabled] = useState(true);
  const [customInstructions, setCustomInstructions] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pre-populate if values already exist in localStorage
  useEffect(() => {
    try {
      const savedAbout = localStorage.getItem('atmos_aboutYou');
      if (savedAbout) {
        const parsed = JSON.parse(savedAbout);
        if (parsed.nickname) setNickname(parsed.nickname);
        if (parsed.occupation) setOccupation(parsed.occupation);
        if (parsed.more) setMoreAboutYou(parsed.more);
      }

      const savedTone = localStorage.getItem('atmos_tone');
      if (savedTone) setTone(savedTone as any);

      const savedChars = localStorage.getItem('atmos_chars');
      if (savedChars) setChars(JSON.parse(savedChars));

      const savedMemory = localStorage.getItem('atmos_memory');
      if (savedMemory) setMemoryEnabled(savedMemory !== 'false');

      const savedPI = localStorage.getItem('atmos_personal_intel');
      if (savedPI) setPersonalIntelligenceEnabled(savedPI === 'true');

      const savedLoc = localStorage.getItem('atmos_location');
      if (savedLoc) setUserLocation(savedLoc);

      const savedCoords = localStorage.getItem('atmos_coordinates');
      if (savedCoords) setUserCoordinates(savedCoords);

      const savedInstructions = localStorage.getItem('atmos_customInstructions');
      if (savedInstructions) setCustomInstructions(savedInstructions);
    } catch (e) {
      console.error('Error pre-populating onboarding state:', e);
    }
  }, []);

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setIsDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setUserCoordinates(`${latitude},${longitude}`);
        try {
          const res = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
          );
          const data = await res.json();
          if (data && data.city && data.principalSubdivision) {
            setUserLocation(`${data.city}, ${data.principalSubdivision}`);
          } else if (data.locality) {
            setUserLocation(data.locality);
          }
        } catch (error) {
          console.error('Failed to reverse geocode:', error);
        } finally {
          setIsDetectingLocation(false);
        }
      },
      (error) => {
        console.error('Geolocation error:', error);
        setIsDetectingLocation(false);
        alert('Could not determine your location. Please type it manually.');
      }
    );
  };

  const handleNext = () => {
    if (step === 1 && !nickname.trim()) {
      alert('Please enter your name or nickname to continue.');
      return;
    }
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      handleFinish();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleFinish = async () => {
    setIsSubmitting(true);
    try {
      const userData = {
        id: localStorage.getItem('atmos_user_id') || undefined,
        nickname: nickname.trim(),
        occupation: occupation.trim(),
        more_about_you: moreAboutYou.trim(),
        tone,
        chars,
        memory_enabled: memoryEnabled,
        location_enabled: personalIntelligenceEnabled,
        user_location: userLocation.trim(),
        user_coordinates: userCoordinates,
        custom_instructions: customInstructions.trim(),
        onboarding_completed: true
      };

      const response = await fetch('/api/user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });

      if (response.ok) {
        const createdUser = await response.json();
        onComplete(createdUser);
      } else {
        alert('Failed to save your profile. Please try again.');
      }
    } catch (error) {
      console.error('Error completing onboarding:', error);
      alert('An error occurred. Please check your connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleChar = (charKey: string, val: string) => {
    setChars(prev => ({
      ...prev,
      [charKey]: val
    }));
  };

  // Content for steps
  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-8 text-left"
          >
            <div className="space-y-3">
              <div className="inline-flex p-3 bg-gray-100 text-gray-900 rounded-2xl">
                <User className="w-6 h-6" />
              </div>
              <h2 className="text-3xl font-semibold text-gray-900 tracking-tight">
                Let's get started.
              </h2>
              <p className="text-gray-500 text-lg">
                First, what should Atmos call you? Your name will be used to customize your greetings and dashboard experience.
              </p>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Your Name / Nickname
              </label>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="Enter your name (e.g., Emanuel)"
                className="w-full px-5 py-4 text-lg border-2 border-gray-100 rounded-2xl outline-none focus:border-gray-900 hover:border-gray-200 transition-all"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleNext();
                }}
              />
            </div>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-8 text-left"
          >
            <div className="space-y-3">
              <div className="inline-flex p-3 bg-gray-100 text-gray-900 rounded-2xl">
                <Sparkles className="w-6 h-6" />
              </div>
              <h2 className="text-3xl font-semibold text-gray-900 tracking-tight">
                Choose your companion's voice.
              </h2>
              <p className="text-gray-500 text-lg">
                Configure the baseline style and conversational tone that fits your working preference.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                {
                  id: 'More',
                  title: 'Warm & Expressive',
                  desc: 'Friendlier, more conversational, and highly engaging.',
                  icon: <Smile className="w-5 h-5 text-purple-500" />
                },
                {
                  id: 'Default',
                  title: 'Balanced',
                  desc: 'Clear, direct, and conversational with natural feedback.',
                  icon: <MessageSquare className="w-5 h-5 text-blue-500" />
                },
                {
                  id: 'Less',
                  title: 'Concise & Factual',
                  desc: 'Professional, highly structured, and to-the-point.',
                  icon: <Globe className="w-5 h-5 text-emerald-500" />
                }
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setTone(opt.id as any)}
                  className={`p-5 rounded-2xl border-2 text-left transition-all flex flex-col justify-between h-44 cursor-pointer hover:border-gray-900 ${
                    tone === opt.id 
                      ? 'border-gray-900 bg-gray-50' 
                      : 'border-gray-100 bg-white'
                  }`}
                >
                  <div className="p-2 bg-gray-50 rounded-xl inline-block">
                    {opt.icon}
                  </div>
                  <div className="space-y-1 mt-auto">
                    <h3 className="font-semibold text-gray-900 text-base">{opt.title}</h3>
                    <p className="text-xs text-gray-500 leading-relaxed">{opt.desc}</p>
                  </div>
                </button>
              ))}
            </div>

            {/* Quick Adjustments */}
            <div className="pt-4 border-t border-gray-100">
              <h3 className="text-sm font-semibold text-gray-700 mb-4">Additional Style Modifiers</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {['Warm', 'Enthusiastic', 'Headers & Lists', 'Emoji'].map((charKey) => {
                  const isEnabled = chars[charKey] === 'More';
                  return (
                    <button
                      key={charKey}
                      type="button"
                      onClick={() => toggleChar(charKey, isEnabled ? 'Default' : 'More')}
                      className={`py-3 px-4 rounded-xl border text-sm font-medium transition-all flex items-center justify-between cursor-pointer ${
                        isEnabled 
                          ? 'border-gray-900 bg-gray-100 text-gray-900 font-semibold' 
                          : 'border-gray-200 text-gray-600 bg-white hover:bg-gray-50'
                      }`}
                    >
                      <span>{charKey}</span>
                      {isEnabled && <Check className="w-4 h-4 shrink-0 text-gray-900" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-8 text-left"
          >
            <div className="space-y-3">
              <div className="inline-flex p-3 bg-gray-100 text-gray-900 rounded-2xl">
                <Briefcase className="w-6 h-6" />
              </div>
              <h2 className="text-3xl font-semibold text-gray-900 tracking-tight">
                Tell us about yourself.
              </h2>
              <p className="text-gray-500 text-lg">
                Providing some high-level professional and personal context allows Atmos to format responses to match your field or hobbies.
              </p>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  What do you do? (Occupation / Role)
                </label>
                <input
                  type="text"
                  value={occupation}
                  onChange={(e) => setOccupation(e.target.value)}
                  placeholder="e.g. Software Engineer, Student, Designer"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-blue-500 hover:border-gray-300 transition-colors text-base"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Interests, Hobbies, or Guidelines (Optional)
                </label>
                <textarea
                  value={moreAboutYou}
                  onChange={(e) => setMoreAboutYou(e.target.value)}
                  placeholder="e.g. I work mostly in React and TypeScript. I love hiking, minimalist design, and reading sci-fi."
                  className="w-full h-32 px-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-blue-500 hover:border-gray-300 transition-colors text-base resize-none"
                />
              </div>
            </div>
          </motion.div>
        );

      case 4:
        return (
          <motion.div
            key="step4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-8 text-left"
          >
            <div className="space-y-3">
              <div className="inline-flex p-3 bg-gray-100 text-gray-900 rounded-2xl">
                <MapPin className="w-6 h-6" />
              </div>
              <h2 className="text-3xl font-semibold text-gray-900 tracking-tight">
                Enable local personalization.
              </h2>
              <p className="text-gray-500 text-lg">
                Enabling local context and Personal Intelligence allows Atmos to answer local queries like weather, events, and routes with high precision.
              </p>
            </div>

            <div className="space-y-6">
              {/* Feature Toggle */}
              <div className="flex items-start justify-between p-5 bg-gray-50/50 rounded-2xl border border-gray-100">
                <div className="space-y-1 pr-4">
                  <h3 className="font-semibold text-gray-900 text-base">Enable Personal Intelligence</h3>
                  <p className="text-sm text-gray-500">
                    Allow local integrations to fetch regional suggestions, restaurants, and contextual search results based on your location.
                  </p>
                </div>
                <button 
                  type="button"
                  onClick={() => {
                    const nextPI = !personalIntelligenceEnabled;
                    setPersonalIntelligenceEnabled(nextPI);
                    if (nextPI && !userLocation) {
                      handleDetectLocation();
                    }
                  }}
                  className={`w-12 h-7 rounded-full flex items-center transition-colors px-1 shrink-0 cursor-pointer ${
                    personalIntelligenceEnabled ? 'bg-gray-900' : 'bg-gray-300'
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${
                    personalIntelligenceEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`} />
                </button>
              </div>

              {/* Location Input */}
              {personalIntelligenceEnabled && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-3"
                >
                  <label className="block text-sm font-semibold text-gray-700">
                    Where do you live?
                  </label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        value={userLocation}
                        onChange={(e) => setUserLocation(e.target.value)}
                        placeholder="e.g. San Francisco, CA"
                        className="w-full pl-4 pr-10 py-3.5 border border-gray-200 rounded-xl outline-none focus:border-blue-500 text-base"
                      />
                      <MapPin className="absolute right-3.5 top-4 text-gray-400 w-5 h-5" />
                    </div>
                    <button
                      type="button"
                      onClick={handleDetectLocation}
                      disabled={isDetectingLocation}
                      className="px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 text-sm font-medium transition-all flex items-center gap-1.5 shrink-0"
                    >
                      {isDetectingLocation ? (
                        <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
                      ) : (
                        <Compass className="w-4 h-4 text-gray-600" />
                      )}
                      Detect
                    </button>
                  </div>
                  <p className="text-xs text-gray-400">
                    Provides lightning fast response customization for time, weather, and nearby services.
                  </p>
                </motion.div>
              )}
            </div>
          </motion.div>
        );

      case 5:
        return (
          <motion.div
            key="step5"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-8 text-left"
          >
            <div className="space-y-3">
              <div className="inline-flex p-3 bg-gray-100 text-gray-900 rounded-2xl">
                <Brain className="w-6 h-6" />
              </div>
              <h2 className="text-3xl font-semibold text-gray-900 tracking-tight">
                Memory & Custom Guidelines.
              </h2>
              <p className="text-gray-500 text-lg">
                Make your Atmos uniquely yours by toggling continuous companion memory or writing bespoke system prompts.
              </p>
            </div>

            <div className="space-y-6">
              {/* Memory Toggle */}
              <div className="flex items-start justify-between p-5 bg-gray-50/50 rounded-2xl border border-gray-100">
                <div className="space-y-1 pr-4">
                  <h3 className="font-semibold text-gray-900 text-base">Enable Companion Memory</h3>
                  <p className="text-sm text-gray-500">
                    Let Atmos remember details across different search sessions to create a highly personalized, contextual experience.
                  </p>
                </div>
                <button 
                  type="button"
                  onClick={() => setMemoryEnabled(!memoryEnabled)}
                  className={`w-12 h-7 rounded-full flex items-center transition-colors px-1 shrink-0 cursor-pointer ${
                    memoryEnabled ? 'bg-gray-900' : 'bg-gray-300'
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${
                    memoryEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`} />
                </button>
              </div>

              {/* Custom Instructions */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Custom Instructions (e.g. System Prompt overrides)
                </label>
                <textarea
                  value={customInstructions}
                  onChange={(e) => setCustomInstructions(e.target.value)}
                  placeholder="e.g. Always format complex lists with clear bullet points. When writing code snippets, prefer TypeScript over JavaScript."
                  className="w-full h-32 px-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-blue-500 hover:border-gray-300 transition-colors text-base resize-none"
                />
                <p className="text-xs text-gray-400">
                  Add custom requests regarding formatting, styles, guidelines, or logic.
                </p>
              </div>
            </div>
          </motion.div>
        );

      case 6:
        return (
          <motion.div
            key="step6"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="space-y-8 text-center py-6"
          >
            <div className="space-y-4">
              <div className="inline-flex p-5 bg-gray-100 text-gray-900 rounded-full animate-bounce">
                <Check className="w-10 h-10 stroke-[2.5]" />
              </div>
              <h2 className="text-3xl font-semibold text-gray-900 tracking-tight">
                You are all set, {nickname}!
              </h2>
              <p className="text-gray-500 text-lg max-w-md mx-auto">
                We've configured your personal space, style defaults, and companion settings. You're ready to unlock Atmos.
              </p>
            </div>

            <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6 text-left max-w-md mx-auto space-y-3.5">
              <h3 className="font-semibold text-gray-900 text-sm uppercase tracking-wider">Configuration Summary</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Nickname:</span>
                  <span className="font-semibold text-gray-900">{nickname}</span>
                </div>
                <div className="flex justify-between">
                  <span>Voice & Style:</span>
                  <span className="font-semibold text-gray-900">
                    {tone === 'More' ? 'Warm' : tone === 'Less' ? 'Concise' : 'Balanced'}
                  </span>
                </div>
                {occupation && (
                  <div className="flex justify-between">
                    <span>Occupation:</span>
                    <span className="font-semibold text-gray-900 truncate max-w-[200px]">{occupation}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Location Context:</span>
                  <span className="font-semibold text-gray-900">
                    {personalIntelligenceEnabled && userLocation ? userLocation : 'Disabled'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Memory:</span>
                  <span className="font-semibold text-gray-900">{memoryEnabled ? 'Enabled' : 'Disabled'}</span>
                </div>
              </div>
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div id="onboarding-flow-container" className="fixed inset-0 z-50 bg-white flex flex-col justify-between p-6 sm:p-12 overflow-y-auto font-sans h-screen">
      {/* Top Navigation / Progress */}
      <div className="flex items-center justify-between max-w-4xl w-full mx-auto">
        <div className="flex items-center gap-2">
          <img 
            src="https://res.cloudinary.com/dwthgcx5j/image/upload/v1783888198/square-crop_tlegc3.png" 
            alt="Atmos Logo" 
            className="w-8 h-8 rounded-lg object-cover" 
          />
          <span className="font-semibold text-gray-800 text-lg">Atmos</span>
        </div>
        
        {/* Progress Bar & Counter */}
        <div className="flex items-center gap-4">
          <span className="text-xs font-semibold text-gray-400">
            Step {step} of {totalSteps}
          </span>
          <div className="w-24 bg-gray-100 h-1.5 rounded-full overflow-hidden">
            <div 
              className="bg-gray-900 h-full transition-all duration-300"
              style={{ width: `${(step / totalSteps) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Form Center Panel */}
      <div className="max-w-3xl w-full mx-auto flex-1 flex flex-col justify-center py-10">
        <AnimatePresence mode="wait">
          {renderStepContent()}
        </AnimatePresence>
      </div>

      {/* Bottom Actions Row */}
      <div className="border-t border-gray-100 pt-6 max-w-4xl w-full mx-auto flex items-center justify-between">
        {step > 1 ? (
          <button
            type="button"
            onClick={handleBack}
            className="flex items-center gap-1.5 px-5 py-3 text-sm font-semibold text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
        ) : (
          <div /> // empty space-holder for alignment
        )}

        <button
          type="button"
          onClick={handleNext}
          disabled={(step === 1 && !nickname.trim()) || isSubmitting}
          className="flex items-center gap-1.5 bg-gray-900 text-white hover:bg-gray-800 px-6 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              {step === totalSteps ? 'Complete Setup' : 'Continue'}
              {step < totalSteps && <ArrowRight className="w-4 h-4" />}
            </>
          )}
        </button>
      </div>
    </div>
  );
}
