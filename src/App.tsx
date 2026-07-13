import { useState, useRef, useEffect } from 'react';
import { Search, Loader2, Sparkles, FileText, CornerDownLeft, Plus, Mic, ArrowUp, Edit, PanelLeftClose, X, Check, Brain, Calendar, StickyNote, ImageIcon, MapPin, Grid, ChevronRight, MoreHorizontal, MessageSquare, Trash2, Paperclip, Github, ArrowRight, User, Mail } from 'lucide-react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { motion, AnimatePresence } from 'motion/react';
import { Routes, Route, useNavigate, useSearchParams, Link } from 'react-router-dom';
import { SearchResponse, SearchSource } from './types';
import DeveloperConsole from './DeveloperConsole';
import OnboardingFlow from './components/OnboardingFlow';
import AuthFlow from './components/AuthFlow';
import GreetingScreen from './components/GreetingScreen';
import { CanvasIcon, GitHubIcon } from './components/SocialLinks';

function CustomMicIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" {...props}>
      <path d="M6 10.5V13.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9 8V16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 5V19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M15 8V16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M18 10.5V13.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function VoiceTabIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" {...props}>
      <g clipPath="url(#clip0_4418_9229)">
        <path d="M6 9.86035V14.1504" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M9 8.42969V15.5697" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12 7V17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M15 8.42969V15.5697" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M18 9.86035V14.1504" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </g>
      <defs>
        <clipPath id="clip0_4418_9229">
          <rect width="24" height="24" fill="white"/>
        </clipPath>
      </defs>
    </svg>
  );
}

function CustomSettingsIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" {...props}>
      <g clipPath="url(#clip0_4418_9935)">
        <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M2 12.8794V11.1194C2 10.0794 2.85 9.21945 3.9 9.21945C5.71 9.21945 6.45 7.93945 5.54 6.36945C5.02 5.46945 5.33 4.29945 6.24 3.77945L7.97 2.78945C8.76 2.31945 9.78 2.59945 10.25 3.38945L10.36 3.57945C11.26 5.14945 12.74 5.14945 13.65 3.57945L13.76 3.38945C14.23 2.59945 15.25 2.31945 16.04 2.78945L17.77 3.77945C18.68 4.29945 18.99 5.46945 18.47 6.36945C17.56 7.93945 18.3 9.21945 20.11 9.21945C21.15 9.21945 22.01 10.0694 22.01 11.1194V12.8794C22.01 13.9194 21.16 14.7794 20.11 14.7794C18.3 14.7794 17.56 16.0594 18.47 17.6294C18.99 18.5394 18.68 19.6994 17.77 20.2194L16.04 21.2094C15.25 21.6794 14.23 21.3994 13.76 20.6094L13.65 20.4194C12.75 18.8494 11.27 18.8494 10.36 20.4194L10.25 20.6094C9.78 21.3994 8.76 21.6794 7.97 21.2094L6.24 20.2194C5.33 19.6994 5.02 18.5294 5.54 17.6294C6.45 16.0594 5.71 14.7794 3.9 14.7794C2.85 14.7794 2 13.9194 2 12.8794Z" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
      </g>
      <defs>
        <clipPath id="clip0_4418_9935">
          <rect width="24" height="24" fill="white"/>
        </clipPath>
      </defs>
    </svg>
  );
}

function SettingsModal({ isOpen, onClose, userId, onLogout }: { isOpen: boolean; onClose: () => void; userId: string | null; onLogout: () => void }) {
  const [activeTab, setActiveTab] = useState('Personalization');
  const tabs = ['General', 'Personalization', 'Personal Intelligence', 'Voice', 'Data controls', 'Account'];

  const [tone, setTone] = useState(() => {
    try { return localStorage.getItem('atmos_tone') || 'Default'; } catch(e) { return 'Default'; }
  });
  const [chars, setChars] = useState(() => {
    try { return JSON.parse(localStorage.getItem('atmos_chars') || '{}') || {}; } catch(e) { return {}; }
  });
  const [aboutYou, setAboutYou] = useState(() => {
    try { return JSON.parse(localStorage.getItem('atmos_aboutYou') || '{}') || {}; } catch(e) { return {}; }
  });
  const [memoryEnabled, setMemoryEnabled] = useState(() => {
    try { return localStorage.getItem('atmos_memory') !== 'false'; } catch(e) { return true; }
  });
  const [customInstructions, setCustomInstructions] = useState(() => {
    try { return localStorage.getItem('atmos_customInstructions') || ''; } catch(e) { return ''; }
  });
  const [personalIntelligenceEnabled, setPersonalIntelligenceEnabled] = useState(() => {
    try { return localStorage.getItem('atmos_personal_intel') === 'true'; } catch(e) { return false; }
  });
  const [userLocation, setUserLocation] = useState(() => {
    try { return localStorage.getItem('atmos_location') || ''; } catch(e) { return ''; }
  });
  const [userCoordinates, setUserCoordinates] = useState(() => {
    try { return localStorage.getItem('atmos_coordinates') || ''; } catch(e) { return ''; }
  });

  const [isNotionInstalled, setIsNotionInstalled] = useState(() => !!localStorage.getItem('atmos_notion_token'));
  const [isGithubInstalled, setIsGithubInstalled] = useState(() => !!localStorage.getItem('atmos_github_token'));
  const [isCanvaInstalled, setIsCanvaInstalled] = useState(() => !!localStorage.getItem('atmos_canva_token'));

  useEffect(() => {
    if (isOpen) {
      setIsNotionInstalled(!!localStorage.getItem('atmos_notion_token'));
      setIsGithubInstalled(!!localStorage.getItem('atmos_github_token'));
      setIsCanvaInstalled(!!localStorage.getItem('atmos_canva_token'));
    }
  }, [isOpen]);

  useEffect(() => {
    localStorage.setItem('atmos_tone', tone);
    localStorage.setItem('atmos_chars', JSON.stringify(chars));
    localStorage.setItem('atmos_aboutYou', JSON.stringify(aboutYou));
    localStorage.setItem('atmos_memory', String(memoryEnabled));
    localStorage.setItem('atmos_customInstructions', customInstructions);
    localStorage.setItem('atmos_personal_intel', String(personalIntelligenceEnabled));
    localStorage.setItem('atmos_location', userLocation);
    localStorage.setItem('atmos_coordinates', userCoordinates);
    window.dispatchEvent(new Event('atmos_settings_updated'));
  }, [tone, chars, aboutYou, memoryEnabled, customInstructions, personalIntelligenceEnabled, userLocation, userCoordinates]);

  const handleTogglePA = () => {
    const newState = !personalIntelligenceEnabled;
    setPersonalIntelligenceEnabled(newState);
    
    if (newState && !userLocation) {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            setUserCoordinates(`${latitude},${longitude}`);
            try {
              const res = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`);
              const data = await res.json();
              if (data && data.city && data.principalSubdivision) {
                setUserLocation(`${data.city}, ${data.principalSubdivision}`);
              } else if (data.locality) {
                setUserLocation(data.locality);
              }
            } catch (error) {
              console.error("Failed to reverse geocode:", error);
            }
          },
          (error) => {
            console.error("Geolocation error:", error);
          }
        );
      }
    }
  };

  const updateChar = (key: string, value: string) => setChars((prev: any) => ({ ...prev, [key]: value }));
  const updateAbout = (key: string, value: string) => setAboutYou((prev: any) => ({ ...prev, [key]: value }));

  const handleExport = () => {
    const dataToExport: Record<string, string> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('atmos_') && !key.startsWith('atmos_cache_')) {
        dataToExport[key] = localStorage.getItem(key) || '';
      }
    }
    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `atmos-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const data = JSON.parse(event.target?.result as string);
            for (const key in data) {
              if (key.startsWith('atmos_')) {
                localStorage.setItem(key, data[key]);
              }
            }
            alert('Data imported successfully. The app will now reload to apply settings.');
            window.location.reload();
          } catch (error) {
            alert('Invalid file format. Please upload a valid JSON exported from Atmos.');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const defaultOptions = [
    { value: 'More', label: 'More', description: 'Friendlier and more personable' },
    { value: 'Default', label: 'Default' },
    { value: 'Less', label: 'Less', description: 'More professional and factual' }
  ];

  const Dropdown = ({ value, onChange }: { value: string; onChange: (v: string) => void }) => {
    const [open, setOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
          setOpen(false);
        }
      };
      if (open) {
        document.addEventListener('mousedown', handleClickOutside);
      }
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [open]);

    return (
      <div className="relative" ref={containerRef}>
        <button 
          type="button"
          onClick={() => setOpen(!open)}
          className="flex items-center gap-1.5 bg-transparent text-sm font-medium text-gray-700 outline-none hover:text-gray-900 transition-colors py-1 pl-2 pr-0 rounded-md"
        >
          {value || 'Default'}
          <svg xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 292.4 292.4" className="opacity-60">
            <path fill="currentColor" d="M287 69.4a17.6 17.6 0 0 0-13-5.4H18.4c-5 0-9.3 1.8-12.9 5.4A17.6 17.6 0 0 0 0 82.2c0 5 1.8 9.3 5.4 12.9l128 127.9c3.6 3.6 7.8 5.4 12.8 5.4s9.2-1.8 12.8-5.4L287 95c3.5-3.5 5.4-7.8 5.4-12.8 0-5-1.9-9.2-5.5-12.8z"/>
          </svg>
        </button>
        
        <AnimatePresence>
          {open && (
            <motion.div 
              initial={{ opacity: 0, y: -5, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -5, scale: 0.95 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="absolute right-0 top-full mt-1 w-64 bg-white rounded-[18px] shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100 z-50 p-1.5 flex flex-col gap-0.5"
            >
              {defaultOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => {
                    onChange(opt.value);
                    setOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2.5 transition-colors flex items-center justify-between rounded-xl group ${
                    (value || 'Default') === opt.value 
                      ? 'bg-gray-100/80' 
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex flex-col">
                    <span className="text-[14px] text-gray-800">{opt.label}</span>
                    {opt.description && (
                      <span className="text-[12px] text-gray-400 mt-0.5 leading-snug">{opt.description}</span>
                    )}
                  </div>
                  {(value || 'Default') === opt.value && (
                    <Check className="w-4 h-4 text-gray-800 shrink-0 ml-3" />
                  )}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/20 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative w-full max-w-4xl max-h-[85vh] h-[650px] bg-white rounded-xl shadow-2xl flex overflow-hidden z-10"
          >
            {/* Sidebar */}
            <div className="w-52 flex-shrink-0 bg-gray-50/50 border-r border-gray-100 flex flex-col">
              <div className="p-4 flex items-center">
                <button onClick={onClose} className="p-1.5 text-gray-500 hover:text-gray-800 hover:bg-gray-200 rounded-md transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto no-scrollbar py-2 px-3 flex flex-col gap-1">
                {tabs.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left ${
                      activeTab === tab ? 'bg-gray-200/70 text-gray-900' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    {tab === 'General' && <CustomSettingsIcon className="w-4 h-4" />}
                    {tab === 'Personalization' && <Sparkles className="w-4 h-4" />}
                    {tab === 'Personal Intelligence' && <Brain className="w-4 h-4" />}
                    {tab === 'Voice' && <VoiceTabIcon className="w-4 h-4" />}
                    {tab === 'Data controls' && <FileText className="w-4 h-4" />}
                    {tab === 'Account' && <div className="w-4 h-4 rounded-full border-2 border-current" />}
                    {tab}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Content */}
            <div className="flex-1 overflow-y-auto no-scrollbar p-6 md:p-8 bg-white text-left">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">{activeTab}</h2>
              
              {activeTab === 'General' ? (
                <div className="space-y-10 max-w-2xl">
                  {/* Active Settings */}
                  <div>
                    <h3 className="text-[15px] font-medium text-gray-900 mb-4 border-b border-gray-100 pb-2">Workspace</h3>
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm font-medium text-gray-700 mb-1">Sidebar position</div>
                          <div className="text-sm text-gray-500">Choose which side the navigation menu appears on.</div>
                        </div>
                        <div className="flex bg-gray-100 p-1 rounded-lg">
                          {['Left', 'Right'].map((p) => (
                            <button
                              key={p}
                              onClick={() => {
                                localStorage.setItem('atmos_sidebar_pos', p.toLowerCase());
                                window.location.reload();
                              }}
                              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                                (localStorage.getItem('atmos_sidebar_pos') || 'left') === p.toLowerCase()
                                  ? 'bg-white text-gray-900 shadow-sm'
                                  : 'text-gray-500 hover:text-gray-700'
                              }`}
                            >
                              {p}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm font-medium text-gray-700 mb-1">Compact mode</div>
                          <div className="text-sm text-gray-500">Reduce spacing and font sizes for a more dense interface.</div>
                        </div>
                        <button 
                          onClick={() => {
                            const current = localStorage.getItem('atmos_compact') === 'true';
                            localStorage.setItem('atmos_compact', (!current).toString());
                            window.location.reload();
                          }} 
                          className={`w-11 h-6 rounded-full flex items-center transition-colors px-0.5 shrink-0 ${localStorage.getItem('atmos_compact') === 'true' ? 'bg-blue-600' : 'bg-gray-300'}`}
                        >
                          <div className={`w-5 h-5 bg-white rounded-full shadow-sm transform transition-transform ${localStorage.getItem('atmos_compact') === 'true' ? 'translate-x-5' : 'translate-x-0'}`} />
                        </button>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm font-medium text-gray-700 mb-1">Enable sound effects</div>
                          <div className="text-sm text-gray-500">Play subtle auditory cues for UI interactions.</div>
                        </div>
                        <button 
                          onClick={() => {
                            const current = localStorage.getItem('atmos_sounds') === 'true';
                            localStorage.setItem('atmos_sounds', (!current).toString());
                            window.location.reload();
                          }} 
                          className={`w-11 h-6 rounded-full flex items-center transition-colors px-0.5 shrink-0 ${localStorage.getItem('atmos_sounds') === 'true' ? 'bg-blue-600' : 'bg-gray-300'}`}
                        >
                          <div className={`w-5 h-5 bg-white rounded-full shadow-sm transform transition-transform ${localStorage.getItem('atmos_sounds') === 'true' ? 'translate-x-5' : 'translate-x-0'}`} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Coming Soon Section */}
                  <div className="opacity-60 grayscale-[0.5]">
                    <div className="flex items-center gap-2 mb-4 border-b border-gray-100 pb-2">
                      <h3 className="text-[15px] font-medium text-gray-900">Advanced</h3>
                      <span className="text-[10px] font-bold bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded uppercase tracking-wider">Coming Soon</span>
                    </div>
                    <div className="space-y-6">
                      <div className="flex items-center justify-between pointer-events-none">
                        <div>
                          <div className="text-sm font-medium text-gray-700 mb-1">Theme selection</div>
                          <div className="text-sm text-gray-500">Deep customization of interface colors and accents.</div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pointer-events-none">
                        <div>
                          <div className="text-sm font-medium text-gray-700 mb-1">Localization</div>
                          <div className="text-sm text-gray-500">Support for over 50+ languages and regional formats.</div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pointer-events-none">
                        <div>
                          <div className="text-sm font-medium text-gray-700 mb-1">Multi-device sync</div>
                          <div className="text-sm text-gray-500">Real-time synchronization across all your platforms.</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : activeTab === 'Personalization' ? (
                <div className="space-y-10 max-w-2xl">
                  {/* Style and Tone */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-[15px] font-medium text-gray-900">Base style and tone</h3>
                      <Dropdown value={tone} onChange={setTone} />
                    </div>
                    <p className="text-sm text-gray-500">Set the style and tone of how Atmos responds to you.</p>
                  </div>

                  {/* Characteristics */}
                  <div>
                    <h3 className="text-[15px] font-medium text-gray-900 mb-1">Characteristics</h3>
                    <p className="text-sm text-gray-500 mb-4">Choose additional customizations on top of your base style and tone.</p>
                    <div className="space-y-4">
                      {['Warm', 'Enthusiastic', 'Headers & Lists', 'Emoji'].map(c => (
                        <div key={c} className="flex items-center justify-between">
                          <span className="text-sm text-gray-700 font-medium">{c}</span>
                          <Dropdown value={chars[c]} onChange={(v) => updateChar(c, v)} />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* About You */}
                  <div>
                    <h3 className="text-[15px] font-medium text-gray-900 mb-4 border-b border-gray-100 pb-2">About you</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Nickname</label>
                        <input type="text" placeholder="What should Atmos call you?" value={aboutYou.nickname || ''} onChange={e => updateAbout('nickname', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none focus:border-gray-300 text-sm" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Occupation</label>
                        <input type="text" placeholder="e.g. Professional cat herder" value={aboutYou.occupation || ''} onChange={e => updateAbout('occupation', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none focus:border-gray-300 text-sm" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">More about you</label>
                        <input type="text" placeholder="Interests, values, or preferences to keep in mind" value={aboutYou.more || ''} onChange={e => updateAbout('more', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none focus:border-gray-300 text-sm" />
                      </div>
                    </div>
                  </div>

                  {/* Memory */}
                  <div>
                     <h3 className="text-[15px] font-medium text-gray-900 mb-4 border-b border-gray-100 pb-2 flex items-center gap-1">Memory <span className="text-gray-400 text-xs border rounded-full w-4 h-4 flex items-center justify-center">?</span></h3>
                     <div className="flex items-start justify-between">
                        <div>
                          <div className="text-sm font-medium text-gray-700 mb-1">Enable memory</div>
                          <div className="text-sm text-gray-500">Let Atmos personalize your experience based on your chats, files, and connected apps.</div>
                        </div>
                        <button onClick={() => setMemoryEnabled(!memoryEnabled)} className={`w-11 h-6 rounded-full flex items-center transition-colors px-0.5 shrink-0 ${memoryEnabled ? 'bg-blue-600' : 'bg-gray-300'}`}>
                          <div className={`w-5 h-5 bg-white rounded-full shadow-sm transform transition-transform ${memoryEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
                        </button>
                     </div>
                  </div>

                  {/* Custom Instructions */}
                  <div>
                    <h3 className="text-[15px] font-medium text-gray-900 mb-2">Custom instructions</h3>
                    <p className="text-sm text-gray-500 mb-2">What would you like Atmos to know about you to provide better responses?</p>
                    <textarea 
                      value={customInstructions} 
                      onChange={e => setCustomInstructions(e.target.value)} 
                      className="w-full h-32 px-3 py-2 border border-gray-200 rounded-lg outline-none focus:border-gray-300 resize-none text-sm"
                      placeholder="Enter custom instructions here..."
                    />
                  </div>
                </div>
              ) : activeTab === 'Personal Intelligence' ? (
                <div className="space-y-10 max-w-2xl">
                  {/* General Toggle */}
                  <div>
                    <h3 className="text-[15px] font-medium text-gray-900 mb-4 border-b border-gray-100 pb-2">Core Features</h3>
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="text-sm font-medium text-gray-700 mb-1">Enable Personal Intelligence</div>
                        <div className="text-sm text-gray-500 max-w-lg">Allow Atmos to use context like your location and connected apps to provide highly personalized search results and insights.</div>
                      </div>
                      <button 
                        onClick={handleTogglePA}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors ease-in-out duration-200 focus:outline-none ${personalIntelligenceEnabled ? 'bg-[#0B57D0]' : 'bg-gray-300'}`}
                        role="switch"
                        aria-checked={personalIntelligenceEnabled}
                      >
                        <span className="sr-only">Use personal intelligence</span>
                        <span 
                          aria-hidden="true" 
                          className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white transition duration-200 ease-in-out mt-1 ml-1 ${personalIntelligenceEnabled ? 'translate-x-5' : 'translate-x-0'}`}
                        />
                      </button>
                    </div>
                  </div>

                  {/* Location Setting */}
                  <div className={`transition-opacity ${personalIntelligenceEnabled ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
                    <h3 className="text-[15px] font-medium text-gray-900 mb-4 border-b border-gray-100 pb-2">Location Context</h3>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Where do you live?</label>
                      <p className="text-sm text-gray-500 mb-3">Used for local queries like weather, nearby restaurants, and local events.</p>
                      <input 
                        type="text"
                        value={userLocation}
                        onChange={(e) => setUserLocation(e.target.value)}
                        placeholder="e.g. San Francisco, CA"
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none focus:border-gray-300 text-sm max-w-md"
                      />
                    </div>
                  </div>

                  {/* Connected Apps */}
                  <div>
                    <h3 className="text-xl font-medium text-gray-900 mb-2">Connected Content Apps</h3>
                    <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                      Connect your Google content apps to get more personalized experiences across Search services, which include Search, Maps, Shopping, Flights, Hotels, Translate, and News. <a href="#" className="text-blue-600 hover:underline">Learn more</a>
                    </p>
                    
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-2xl">
                          <div className="w-5 h-5 flex items-center justify-center">
                            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192" fill="none"><path fill="url(#gmail_a)" d="M146 44h38v110c0 6.627-5.373 12-12 12h-20a6 6 0 0 1-6-6z"/><path fill="#fc413d" d="M46 44H8v110c0 6.627 5.373 12 12 12h20a6 6 0 0 0 6-6z"/><path fill="url(#gmail_b)" d="M39.226 30.456c-8.033-6.752-20.018-5.714-26.77 2.319-6.752 8.032-5.714 20.017 2.319 26.77l76.078 63.949a8 8 0 0 0 10.295 0l76.078-63.95c8.032-6.752 9.07-18.737 2.318-26.77-6.752-8.032-18.737-9.07-26.769-2.318L96 78.18z"/><defs><linearGradient id="gmail_a" x1="165" x2="165" y1="44" y2="166" gradientUnits="userSpaceOnUse"><stop stopColor="#60d673"/><stop offset=".17" stopColor="#42c868"/><stop offset=".39" stopColor="#0ebc5f"/><stop offset=".62" stopColor="#00a9bb"/><stop offset=".86" stopColor="#3c90ff"/><stop offset="1" stopColor="#3186ff"/></linearGradient><linearGradient id="gmail_b" x1="8" x2="184" y1="46.13" y2="46.13" gradientUnits="userSpaceOnUse"><stop offset=".08" stopColor="#ff63a0"/><stop offset=".3" stopColor="#fc413d"/><stop offset=".5" stopColor="#fc413d"/><stop offset=".65" stopColor="#fc413d"/><stop offset=".72" stopColor="#fc5c30"/><stop offset=".86" stopColor="#feb10c"/><stop offset=".91" stopColor="#fec700"/><stop offset=".96" stopColor="#ffdb0f"/></linearGradient></defs></svg>
                          </div>
                          <div className="w-5 h-5 flex items-center justify-center">
                            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192" fill="none"><path fill="#bbe2ff" d="M32 36.8C32 20.894 44.894 8 60.8 8h70.4C147.106 8 160 20.894 160 36.8v30.4c0 15.906-12.894 28.8-28.8 28.8H60.8C44.894 96 32 83.106 32 67.2z"/><path fill="#3c90ff" d="M19.867 49.392C17.818 33.82 29.94 20 45.645 20h100.71c15.706 0 27.827 13.82 25.778 29.392L166 96l6.133 46.608C174.182 158.18 162.061 172 146.355 172H45.645c-15.706 0-27.827-13.82-25.778-29.392L26 96z"/><mask id="mask_cal_a" width="154" height="152" x="19" y="20" maskUnits="userSpaceOnUse" style={{maskType:"alpha"}}><path fill="#3c90ff" d="M19.867 49.392C17.818 33.82 29.94 20 45.645 20h100.71c15.706 0 27.827 13.82 25.778 29.392L166 96l6.133 46.608C174.182 158.18 162.061 172 146.355 172H45.645c-15.706 0-27.827-13.82-25.778-29.392L26 96z"/></mask><g mask="url(#mask_cal_a)"><path fill="url(#cal_b)" d="M0 0h166v76H0z" transform="matrix(1 0 0 -1 13 172)"/></g><mask id="mask_cal_c" width="154" height="152" x="19" y="20" maskUnits="userSpaceOnUse" style={{maskType:"alpha"}}><path fill="#3186ff" d="M19.867 49.392C17.818 33.82 29.94 20 45.645 20h100.71c15.706 0 27.827 13.82 25.778 29.392L166 96l6.133 46.608C174.182 158.18 162.061 172 146.355 172H45.645c-15.706 0-27.827-13.82-25.778-29.392L26 96z"/></mask><g mask="url(#mask_cal_c)"><path fill="url(#cal_d)" d="M32 27.2C32 16.596 40.596 8 51.2 8h89.6c10.604 0 19.2 8.596 19.2 19.2V96H32z" filter="url(#cal_e)"/></g><path fill="#fff" d="M75.353 133.336q-6.282 0-10.777-2.043t-7.61-5.465q-3.065-3.474-4.342-6.793T51.603 115a2.07 2.07 0 0 1 1.021-1.124l5.67-2.247q.714-.357 1.43-.102.714.204 1.685 2.349 1.022 2.145 2.86 4.546a14.3 14.3 0 0 0 4.495 3.728q2.606 1.328 6.435 1.328 6.18 0 9.807-3.575 3.677-3.575 3.677-9.091 0-5.976-3.882-9.194-3.881-3.269-10.266-3.269h-5.362a1.9 1.9 0 0 1-1.328-.51q-.51-.562-.511-1.277v-5.465q0-.767.51-1.277a1.82 1.82 0 0 1 1.329-.562h4.647q5.721 0 9.194-3.116t3.473-8.07q0-4.902-3.116-7.916t-8.58-3.014q-3.065 0-5.312 1.022a11.5 11.5 0 0 0-3.882 2.86 22.7 22.7 0 0 0-2.809 3.78q-1.174 1.941-1.89 2.145-.714.153-1.379-.255l-5.363-2.605q-.664-.358-.868-1.124t1.226-3.575q1.481-2.86 4.494-5.823a21 21 0 0 1 7.049-4.597q4.035-1.635 9.398-1.634 9.96 0 15.782 5.26 5.823 5.21 5.823 13.791 0 5.925-2.86 10.266-2.81 4.34-7.968 6.13v.204q6.231 1.838 9.806 6.741 3.627 4.853 3.626 11.594 0 9.654-6.742 15.834-6.74 6.18-17.57 6.18zm51.25-1.175q-.868 0-1.533-.664a2.25 2.25 0 0 1-.612-1.583V73.118l-11.492 8.274q-.614.46-1.431.307a1.96 1.96 0 0 1-1.225-.766l-3.32-4.7a1.98 1.98 0 0 1-.358-1.43q.153-.816.817-1.276l20.379-14.557q.256-.204.562-.306.307-.153.715-.153h4.291q.868 0 1.379.613.562.56.562 1.43v69.36q0 .92-.664 1.583a2 2 0 0 1-1.533.664z"/><defs><linearGradient id="cal_b" x1="83" x2="83" y1="76" gradientUnits="userSpaceOnUse"><stop stopColor="#4fa0ff"/><stop offset="1" stopColor="#3186ff"/></linearGradient><linearGradient id="cal_d" x1="89.06" x2="89.06" y1="21.75" y2="96.39" gradientUnits="userSpaceOnUse"><stop stopColor="#a9a8ff"/><stop offset=".8" stopColor="#3c90ff"/></linearGradient><filter id="cal_e" width="152" height="112" x="20" y="-4" colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse"><feFlood floodOpacity="0" result="BackgroundImageFix"/><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur result="effect1_foregroundBlur_37330_7673" stdDeviation="6"/></filter></defs></svg>
                          </div>
                          <div className="w-5 h-5 flex items-center justify-center">
                            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192" fill="none"><mask id="mask_drive_a" width="168" height="154" x="12" y="18" maskUnits="userSpaceOnUse" style={{maskType:"alpha"}}><path fill="#b43333" d="M63.09 37c14.626-25.333 51.193-25.334 65.819 0l45.033 78c14.626 25.334-3.657 57.001-32.91 57.001H50.967c-29.253 0-47.536-31.667-32.91-57.001z"/></mask><g mask="url(#mask_drive_a)"><path fill="url(#drive_b)" d="M206.905 172.02h-91.888l-19.015-32.934 45.944-79.578z"/><path fill="url(#drive_c)" d="M-14.919 172.006 50.04 59.494v.002L31.032 92.422h38.02L115 172.004l-129.918.001z"/><path fill="url(#drive_d)" d="M96.007-20.085 141.954 59.5l-19.011 32.928H31.048z"/></g><defs><linearGradient id="drive_b" x1="193.6" x2="103.09" y1="165.6" y2="111.21" gradientUnits="userSpaceOnUse"><stop offset=".09" stopColor="#ffe921"/><stop offset="1" stopColor="#fec700"/></linearGradient><linearGradient id="drive_c" x1="114.4" x2="15.53" y1="181.61" y2="121.8" gradientUnits="userSpaceOnUse"><stop offset=".15" stopColor="#a9a8ff"/><stop offset=".33" stopColor="#6d97ff"/><stop offset=".48" stopColor="#3186ff"/></linearGradient><linearGradient id="drive_d" x1="128.88" x2="28.7" y1="37.88" y2="84.64" gradientUnits="userSpaceOnUse"><stop offset=".55" stopColor="#0ebc5f"/><stop offset=".85" stopColor="#78c9ff"/></linearGradient></defs></svg>
                          </div>
                          <div className="flex gap-0.5 ml-1">
                            <div className="w-1 h-1 rounded-full bg-gray-400"></div>
                            <div className="w-1 h-1 rounded-full bg-gray-400"></div>
                            <div className="w-1 h-1 rounded-full bg-gray-400"></div>
                          </div>
                        </div>
                        
                        <button className="flex items-center gap-2 bg-gray-100 text-gray-600 px-4 py-2 rounded-full text-sm font-medium cursor-not-allowed">
                          Coming Soon
                        </button>
                      </div>
                      
                      <div>
                        <h4 className="text-base font-medium text-gray-900 mb-1">Google Workspace</h4>
                        <p className="text-sm text-gray-600">
                          Includes things like emails, docs, events, and associated insights and locations from apps like Gmail, Calendar, and Drive.
                        </p>
                      </div>
                    </div>

                    {isNotionInstalled && (
                      <div className="flex flex-col gap-3 mt-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-2xl">
                            <div className="w-5 h-5 flex items-center justify-center">
                              <img src="https://upload.wikimedia.org/wikipedia/commons/4/45/Notion_app_logo.png" alt="Notion" className="w-full h-full object-contain" />
                            </div>
                            <span className="text-sm font-medium text-gray-700">Notion</span>
                          </div>
                          
                          <button className="flex items-center gap-2 bg-[#D3E3FD] text-[#041E49] px-4 py-2 rounded-full text-sm font-medium hover:bg-[#C2D7FA] transition-colors">
                            <div className="w-4 h-4 rounded-full bg-[#0B57D0] text-white flex items-center justify-center">
                              <Check className="w-3 h-3" strokeWidth={3} />
                            </div>
                            Connected
                          </button>
                        </div>
                        
                        <div>
                          <h4 className="text-base font-medium text-gray-900 mb-1">Notion</h4>
                          <p className="text-sm text-gray-600">
                            Search and read Notion workspace content, create pages, and organize tasks.
                          </p>
                        </div>
                      </div>
                    )}

                    {isGithubInstalled && (
                      <div className="flex flex-col gap-3 mt-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-2xl">
                            <div className="w-5 h-5 flex items-center justify-center text-gray-700">
                              <Github className="w-full h-full" />
                            </div>
                            <span className="text-sm font-medium text-gray-700">GitHub</span>
                          </div>
                          
                          <button className="flex items-center gap-2 bg-[#D3E3FD] text-[#041E49] px-4 py-2 rounded-full text-sm font-medium hover:bg-[#C2D7FA] transition-colors">
                            <div className="w-4 h-4 rounded-full bg-[#0B57D0] text-white flex items-center justify-center">
                              <Check className="w-3 h-3" strokeWidth={3} />
                            </div>
                            Connected
                          </button>
                        </div>
                        
                        <div>
                          <h4 className="text-base font-medium text-gray-900 mb-1">GitHub</h4>
                          <p className="text-sm text-gray-600">
                            Search repositories, read code, and review issues.
                          </p>
                        </div>
                      </div>
                    )}

                    {isCanvaInstalled && (
                      <div className="flex flex-col gap-3 mt-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-2xl">
                            <div className="w-5 h-5 flex items-center justify-center text-[#00c4cc]">
                              <img src="https://upload.wikimedia.org/wikipedia/commons/0/08/Canva_icon_2021.svg" className="w-full h-full object-contain" alt="Canva" />
                            </div>
                            <span className="text-sm font-medium text-gray-700">Canva</span>
                          </div>
                          
                          <button className="flex items-center gap-2 bg-[#D3E3FD] text-[#041E49] px-4 py-2 rounded-full text-sm font-medium hover:bg-[#C2D7FA] transition-colors">
                            <div className="w-4 h-4 rounded-full bg-[#0B57D0] text-white flex items-center justify-center">
                              <Check className="w-3 h-3" strokeWidth={3} />
                            </div>
                            Connected
                          </button>
                        </div>
                        
                        <div>
                          <h4 className="text-base font-medium text-gray-900 mb-1">Canva</h4>
                          <p className="text-sm text-gray-600">
                            Search and view your Canva designs.
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="flex flex-col gap-3 mt-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-2xl">
                          <div className="w-5 h-5 flex items-center justify-center text-blue-600">
                            <Calendar className="w-4 h-4" />
                          </div>
                          <div className="w-5 h-5 flex items-center justify-center text-yellow-500">
                            <StickyNote className="w-4 h-4" />
                          </div>
                          <div className="w-5 h-5 flex items-center justify-center text-green-500">
                            <ImageIcon className="w-4 h-4" />
                          </div>
                          <div className="flex gap-0.5 ml-1">
                            <div className="w-1 h-1 rounded-full bg-gray-400"></div>
                            <div className="w-1 h-1 rounded-full bg-gray-400"></div>
                            <div className="w-1 h-1 rounded-full bg-gray-400"></div>
                          </div>
                        </div>
                        
                        <button className="flex items-center gap-2 bg-gray-100 text-gray-600 px-4 py-2 rounded-full text-sm font-medium cursor-not-allowed">
                          Coming Soon
                        </button>
                      </div>
                      
                      <div>
                        <h4 className="text-base font-medium text-gray-900 mb-1">Atmos Workspace</h4>
                        <p className="text-sm text-gray-600">
                          Includes your native personal data stored in Atmos, like Calendar events, Notes, and Photos.
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col gap-3 mt-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-2xl">
                          <div className="w-5 h-5 flex items-center justify-center text-[#F94877]">
                            <img src="https://favicon.im/foursquare.com?larger=true" alt="foursquare.com favicon (large)" loading="lazy" className="w-full h-full object-contain" />
                          </div>
                          <span className="text-sm font-medium text-gray-700">Foursquare</span>
                        </div>
                        
                        <button className="flex items-center gap-2 bg-[#D3E3FD] text-[#041E49] px-4 py-2 rounded-full text-sm font-medium hover:bg-[#C2D7FA] transition-colors">
                          <div className="w-4 h-4 rounded-full bg-[#0B57D0] text-white flex items-center justify-center">
                            <Check className="w-3 h-3" strokeWidth={3} />
                          </div>
                          Connected
                        </button>
                      </div>
                      
                      <div>
                        <h4 className="text-base font-medium text-gray-900 mb-1">Foursquare Places API</h4>
                        <p className="text-sm text-gray-600">
                          Allows Atmos to find local places, businesses, and photos securely via Foursquare.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : activeTab === 'Data controls' ? (
                <div className="space-y-10 max-w-2xl">
                  {/* Data Management */}
                  <div>
                    <h3 className="text-[15px] font-medium text-gray-900 mb-4 border-b border-gray-100 pb-2">Your Data</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm font-medium text-gray-700 mb-1">Export Data</div>
                          <div className="text-sm text-gray-500">Download a copy of your settings, history, and custom instructions.</div>
                        </div>
                        <button onClick={handleExport} className="px-4 py-1.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">Export</button>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm font-medium text-gray-700 mb-1">Import Data</div>
                          <div className="text-sm text-gray-500">Upload your previously exported data to restore your settings.</div>
                        </div>
                        <button onClick={handleImport} className="px-4 py-1.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">Import</button>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm font-medium text-gray-700 mb-1">Onboarding Flow</div>
                          <div className="text-sm text-gray-500">Launch the fullscreen onboarding flow again to re-configure your workspace.</div>
                        </div>
                        <button 
                          onClick={() => {
                            localStorage.removeItem('atmos_onboarding_completed');
                            window.location.reload();
                          }} 
                          className="px-4 py-1.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          Restart
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : activeTab === 'Account' ? (
                <div className="space-y-10 max-w-2xl">
                  {/* Profile Section */}
                  <div>
                    <h3 className="text-[15px] font-medium text-gray-900 mb-4 border-b border-gray-100 pb-2">Profile</h3>
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Email address</label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input 
                            type="email" 
                            disabled 
                            value={localStorage.getItem('atmos_user_email') || ''} 
                            className="w-full pl-10 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-500 cursor-not-allowed" 
                          />
                        </div>
                        <p className="text-[12px] text-gray-400 mt-1.5">Email cannot be changed currently.</p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Display name</label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input 
                            type="text" 
                            value={aboutYou.nickname || ''} 
                            onChange={e => updateAbout('nickname', e.target.value)}
                            placeholder="What should Atmos call you?"
                            className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg outline-none focus:border-gray-900 text-sm" 
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Auth Info */}
                  <div>
                    <h3 className="text-[15px] font-medium text-gray-900 mb-4 border-b border-gray-100 pb-2">Authentication</h3>
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white rounded-full border border-gray-100 flex items-center justify-center shadow-sm">
                          {localStorage.getItem('atmos_user_email')?.includes('@gmail.com') ? (
                            <svg width="20" height="20" viewBox="0 0 24 24">
                              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                            </svg>
                          ) : (
                            <Mail className="w-5 h-5 text-gray-400" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {localStorage.getItem('atmos_user_email')?.includes('@gmail.com') ? 'Google account' : 'Email account'}
                          </p>
                          <p className="text-[12px] text-gray-500">You are securely signed in via {localStorage.getItem('atmos_user_email')?.includes('@gmail.com') ? 'Google OAuth' : 'Email & Password'}</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => {
                          onLogout();
                          onClose();
                        }}
                        className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 hover:border-red-100 transition-colors"
                      >
                        Sign out
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-gray-500 text-sm">
                  Coming soon...
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export const SidebarIcon = ({ isOpen = false, size = 24, className = "" }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <line 
        x1={isOpen ? "15" : "8"} 
        y1="7" 
        x2={isOpen ? "15" : "8"} 
        y2="17" 
        style={{ transition: 'all 0.2s ease-in-out' }} 
      />
    </svg>
  );
};

function ResultBlock({ title, content, type, plugin }: { title: string; content: string; type: string; plugin?: string }) {
  const isGithub = plugin === 'github';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="mb-8"
    >
      <h3 className="text-xl font-semibold mb-3 tracking-tight text-gray-900">{title}</h3>
      <div className="prose prose-sm md:prose-base max-w-none text-gray-700">
        {type === 'code' ? (
          <pre className="bg-[#f7f7f5] p-4 rounded-lg overflow-x-auto text-sm font-mono border border-[#eaeaeb]">
            <code>{content}</code>
          </pre>
        ) : (
          <div className="leading-relaxed">
            <Markdown 
              remarkPlugins={[remarkGfm]}
              components={isGithub ? {
                a: ({ node, ...props }) => {
                  const isGithubLink = typeof props.href === 'string' && props.href.includes('github.com');
                  if (isGithubLink) {
                    return (
                      <a {...props} className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 no-underline bg-blue-50 px-1.5 py-0.5 rounded-md font-medium transition-colors">
                        <Github className="w-3.5 h-3.5" />
                        {props.children}
                      </a>
                    );
                  }
                  return <a {...props} className="text-blue-600 hover:underline" />;
                },
                code: ({ node, inline, className, children, ...props }: any) => {
                  if (inline) {
                    return <code {...props} className="bg-gray-100 px-1.5 py-0.5 rounded text-sm font-mono text-gray-800">{children}</code>;
                  }
                  return (
                    <pre className="bg-gray-900 text-gray-100 p-4 rounded-xl overflow-x-auto text-sm font-mono my-4 shadow-sm">
                      <code {...props}>{children}</code>
                    </pre>
                  );
                },
                blockquote: ({ node, ...props }) => (
                  <blockquote {...props} className="border-l-4 border-gray-300 pl-4 py-1 my-4 text-gray-600 italic bg-gray-50 rounded-r-lg" />
                )
              } : undefined}
            >
              {content}
            </Markdown>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function SourcesList({ sources, images }: { sources: SearchSource[], images?: string[] }) {
  const hasSources = sources && sources.length > 0;
  const hasImages = images && images.length > 0;
  
  if (!hasSources && !hasImages) return null;
  
  const uniqueSources = hasSources ? sources.filter((source, index, self) =>
    index === self.findIndex((t) => t.uri === source.uri)
  ).slice(0, 4) : [];

  return (
    <div className="mb-10 space-y-6">
      {hasImages && (
        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
          {images.slice(0, 4).map((imgUrl, i) => {
            let domain = '';
            try { domain = new URL(imgUrl).hostname.replace('www.', ''); } catch (e) {}
            return (
              <div key={i} className="flex flex-col gap-2 w-[160px] flex-shrink-0 cursor-pointer group">
                <div className="w-full h-[160px] rounded-2xl overflow-hidden bg-gray-100 relative">
                  <img src={imgUrl} alt="Result" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" onError={(e) => (e.target as HTMLImageElement).style.display = 'none'} />
                  <div className="absolute inset-0 ring-1 ring-inset ring-black/10 rounded-2xl pointer-events-none" />
                </div>
                {domain && (
                  <div className="flex flex-col">
                    <span className="text-[13px] text-gray-500 font-medium truncate">{domain}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {hasSources && (
        <div>
          <h3 className="text-[13px] font-semibold text-gray-400 mb-3 flex items-center gap-1.5 tracking-wider">
            <FileText className="w-4 h-4" /> SOURCES
          </h3>
          <div className="flex flex-wrap gap-2">
            {uniqueSources.map((source, i) => {
              const domain = new URL(source.uri).hostname.replace('www.', '');
              const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
              return (
                <a
                  key={i}
                  href={source.uri}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 hover:bg-gray-100 rounded-full px-2 py-1 transition-colors text-gray-700"
                >
                  <div className="relative w-3.5 h-3.5 flex items-center justify-center overflow-hidden rounded-sm">
                    <img 
                      src={faviconUrl} 
                      alt={domain}
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                        (e.target as HTMLImageElement).parentElement?.classList.add('bg-gray-200');
                        const fallback = document.createElement('span');
                        fallback.className = 'text-[8px] font-bold text-gray-500';
                        fallback.innerText = `${i + 1}`;
                        (e.target as HTMLImageElement).parentElement?.appendChild(fallback);
                      }}
                    />
                  </div>
                  <span className="truncate max-w-[150px] text-[13px] font-medium">{domain}</span>
                </a>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function Home() {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  const [nickname, setNickname] = useState(() => {
    try {
      const savedAbout = localStorage.getItem('atmos_aboutYou');
      if (savedAbout) {
        return JSON.parse(savedAbout).nickname || 'Emanuel';
      }
    } catch (e) {}
    return 'Emanuel';
  });

  useEffect(() => {
    const handleUpdate = () => {
      try {
        const savedAbout = localStorage.getItem('atmos_aboutYou');
        if (savedAbout) {
          setNickname(JSON.parse(savedAbout).nickname || 'Emanuel');
        }
      } catch (e) {}
    };
    window.addEventListener('atmos_settings_updated', handleUpdate);
    return () => window.removeEventListener('atmos_settings_updated', handleUpdate);
  }, []);

  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceText, setVoiceText] = useState('');
  const [isProcessingVoice, setIsProcessingVoice] = useState(false);
  const recognitionRef = useRef<any>(null);

  const [showPlusMenu, setShowPlusMenu] = useState(false);
  const [selectedPlugin, setSelectedPlugin] = useState<{ id: string, name: string, icon: React.ReactNode } | null>(() => {
    const saved = localStorage.getItem('atmos_selected_plugin');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.id === 'notion') {
          return {
            id: 'notion',
            name: 'Notion',
            icon: <img src="https://upload.wikimedia.org/wikipedia/commons/4/45/Notion_app_logo.png" className="w-5 h-5 object-contain" alt="Notion" />
          };
        }
        if (parsed.id === 'github') {
          return {
            id: 'github',
            name: 'GitHub',
            icon: <Github className="w-5 h-5" />
          };
        }
        if (parsed.id === 'canva') {
          return {
            id: 'canva',
            name: 'Canva',
            icon: <img src="https://upload.wikimedia.org/wikipedia/commons/0/08/Canva_icon_2021.svg" className="w-5 h-5 object-contain" alt="Canva" />
          };
        }
      } catch (e) {}
    }
    return null;
  });
  const [isNotionInstalled, setIsNotionInstalled] = useState(() => !!localStorage.getItem('atmos_notion_token'));
  const [isGithubInstalled, setIsGithubInstalled] = useState(() => !!localStorage.getItem('atmos_github_token'));
  const [isCanvaInstalled, setIsCanvaInstalled] = useState(() => !!localStorage.getItem('atmos_canva_token'));
  const plusMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedPlugin) {
      localStorage.setItem('atmos_selected_plugin', JSON.stringify({ id: selectedPlugin.id, name: selectedPlugin.name }));
    } else {
      localStorage.removeItem('atmos_selected_plugin');
    }
  }, [selectedPlugin]);

  useEffect(() => {
    inputRef.current?.focus();

    const handleNotionInstalled = () => {
      setIsNotionInstalled(true);
    };
    window.addEventListener('notion_installed', handleNotionInstalled);
    
    const handleGithubInstalled = () => {
      setIsGithubInstalled(true);
    };
    window.addEventListener('github_installed', handleGithubInstalled);
    
    const handleClickOutside = (event: MouseEvent) => {
      if (plusMenuRef.current && !plusMenuRef.current.contains(event.target as Node)) {
        setShowPlusMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      window.removeEventListener('notion_installed', handleNotionInstalled);
      window.removeEventListener('github_installed', handleGithubInstalled);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      const pluginParam = selectedPlugin ? `&plugin=${selectedPlugin.id}` : '';
      navigate(`/search?q=${encodeURIComponent(query.trim())}${pluginParam}`);
    }
  };

  const startListening = () => {
    setIsVoiceMode(true);
    setVoiceText('');
    setIsListening(true);
    
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.continuous = false;
      recognition.interimResults = true;
      
      let finalTranscript = '';
      recognition.onresult = (event: any) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          currentTranscript += event.results[i][0].transcript;
        }
        finalTranscript = currentTranscript;
        setVoiceText(currentTranscript);
      };
      
      recognition.onend = () => {
        setIsListening(false);
        if (finalTranscript) {
           fixSpeechWithModel(finalTranscript);
        }
      };
      
      recognition.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
      };
      
      recognition.start();
    } else {
      alert("Speech recognition not supported in this browser.");
      setIsVoiceMode(false);
    }
  };

  const fixSpeechWithModel = async (textToFix: string) => {
      setIsProcessingVoice(true);
      try {
          const res = await fetch('/api/fix-speech', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ text: textToFix })
          });
          const data = await res.json();
          if (data.fixedText) {
              setVoiceText(data.fixedText);
          }
      } catch (err) {
          console.error(err);
      } finally {
          setIsProcessingVoice(false);
      }
  };

  const cancelVoice = () => {
     if (recognitionRef.current) {
         recognitionRef.current.abort();
     }
     setIsVoiceMode(false);
     setVoiceText('');
     setIsListening(false);
  };

  const confirmVoice = () => {
     if (voiceText.trim()) {
       navigate(`/search?q=${encodeURIComponent(voiceText.trim())}`);
     }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 w-full max-w-3xl mx-auto pb-32">
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 text-center"
      >
        <h1 className="text-3xl md:text-4xl font-light tracking-wide text-gray-800">Hi {nickname}, what's on your mind?</h1>
      </motion.div>

      <div className="w-full max-w-3xl relative z-20">
        {isVoiceMode ? (
          <div className="relative flex items-center justify-between bg-white border border-gray-200 rounded-full p-2 h-[68px] transition-all shadow-sm">
            <div className="flex-1 flex items-center overflow-hidden px-6">
              {isListening ? (
                <div className="flex items-center justify-start gap-1 h-8 w-full overflow-hidden">
                   {[...Array(50)].map((_, i) => (
                      <div key={i} className="w-1.5 bg-gray-800 rounded-full animate-pulse" style={{ height: `${Math.random() * 60 + 20}%`, animationDelay: `${i * 0.05}s` }} />
                   ))}
                </div>
              ) : isProcessingVoice ? (
                <span className="text-gray-500 animate-pulse text-lg">Fixing speech...</span>
              ) : (
                <span className="text-gray-800 font-medium text-lg truncate">{voiceText || "Listening..."}</span>
              )}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button 
                type="button" 
                onClick={cancelVoice} 
                className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-200 text-gray-800 hover:bg-gray-300 transition-colors relative group"
              >
                <div className="w-3.5 h-3.5 bg-current rounded-sm" />
                <div className="absolute -top-10 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                  Stop
                </div>
              </button>
              <button 
                type="button"
                onClick={confirmVoice}
                disabled={isListening || isProcessingVoice || !voiceText}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:bg-gray-200 disabled:text-gray-400"
              >
                <ArrowUp className="w-5 h-5 stroke-[2.5px]" />
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="relative group flex flex-col bg-white border border-gray-200 hover:border-gray-300 focus-within:border-gray-300 rounded-3xl p-3 transition-all">
            <div className="flex w-full items-start">
              {selectedPlugin && (
                <div className="shrink-0 flex items-center gap-1.5 ml-2 mt-2.5 text-[#3b82f6]">
                  {selectedPlugin.icon}
                  <span className="font-medium text-[17px] mr-1">{selectedPlugin.name}</span>
                </div>
              )}
              <textarea
                ref={inputRef as any}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    onSubmit(e as any);
                  }
                  if (e.key === 'Backspace' && query === '' && selectedPlugin) {
                    setSelectedPlugin(null);
                  }
                }}
                placeholder=""
                className="flex-1 bg-transparent resize-none p-2 text-lg outline-none text-gray-800 w-full"
                rows={1}
                style={{ minHeight: '50px' }}
              />
            </div>
            
            <div className="flex items-center justify-between mt-2">
              <div className="relative" ref={plusMenuRef}>
                <button 
                  type="button" 
                  onClick={() => setShowPlusMenu(!showPlusMenu)}
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                </button>
                
                <AnimatePresence>
                  {showPlusMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute top-14 left-0 w-[420px] bg-white rounded-2xl border border-gray-200 overflow-hidden z-50 flex flex-col max-h-[300px]"
                    >
                      <div className="p-2 border-b border-gray-100/60">
                        <button className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 rounded-xl transition-colors text-left group">
                          <div className="text-gray-500 group-hover:text-gray-700">
                            <Paperclip className="w-5 h-5" />
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="text-[15px] text-gray-900">Add photos & files</div>
                            <div className="text-[13px] text-gray-400">Upload from computer</div>
                          </div>
                        </button>
                      </div>
                      
                      <div className="p-2 overflow-y-auto no-scrollbar flex-1 space-y-0.5">
                        {isNotionInstalled && (
                          <button 
                            type="button"
                            onClick={() => {
                              setSelectedPlugin({
                                id: 'notion',
                                name: 'Notion',
                                icon: <img src="https://upload.wikimedia.org/wikipedia/commons/4/45/Notion_app_logo.png" className="w-5 h-5 object-contain" alt="Notion" />
                              });
                              setShowPlusMenu(false);
                              inputRef.current?.focus();
                            }}
                            className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 rounded-xl transition-colors text-left group"
                          >
                            <div className="w-5 h-5 flex items-center justify-center shrink-0">
                               <img src="https://upload.wikimedia.org/wikipedia/commons/4/45/Notion_app_logo.png" className="w-5 h-5 object-contain" alt="Notion" />
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="text-[15px] text-gray-900">Notion</div>
                              <div className="text-[13px] text-gray-400">Search and read Notion workspace content</div>
                            </div>
                          </button>
                        )}
                        {isGithubInstalled && (
                          <button 
                            type="button"
                            onClick={() => {
                              setSelectedPlugin({
                                id: 'github',
                                name: 'GitHub',
                                icon: <Github className="w-5 h-5" />
                              });
                              setShowPlusMenu(false);
                              inputRef.current?.focus();
                            }}
                            className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 rounded-xl transition-colors text-left group"
                          >
                            <div className="w-5 h-5 flex items-center justify-center shrink-0 text-gray-700">
                               <Github className="w-5 h-5" />
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="text-[15px] text-gray-900">GitHub</div>
                              <div className="text-[13px] text-gray-400">Search repositories and issues</div>
                            </div>
                          </button>
                        )}
                        {!isNotionInstalled && !isGithubInstalled && (
                          <div className="px-4 py-3 text-[13px] text-gray-400">
                            Type to search plugins, files & skills
                          </div>
                        )}
                        {(isNotionInstalled || isGithubInstalled) && (
                          <div className="px-3 pt-4 pb-2 text-[13px] text-gray-400">
                            Type to search plugins, files & skills
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="flex items-center gap-3">
                <button type="button" onClick={startListening} className="p-2 text-gray-500 hover:text-gray-700 transition-colors">
                  <CustomMicIcon className="w-7 h-7" />
                </button>
                <button 
                  type="submit"
                  disabled={!query.trim()}
                  className={`w-10 h-10 flex items-center justify-center rounded-full transition-colors ${
                    query.trim() 
                      ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                      : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  <ArrowUp className="w-5 h-5 stroke-[2.5px]" />
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}


interface FeedItem {
  id: string;
  query: string;
  plugin: string;
  response: SearchResponse | null;
  isSearching: boolean;
  error: string;
}

function SearchResults({ addSearch }: { addSearch: (q: string) => void }) {
  const [searchParams] = useSearchParams();
  const q = searchParams.get('q') || '';
  const plugin = searchParams.get('plugin') || '';
  const navigate = useNavigate();
  
  const [queryInput, setQueryInput] = useState('');
  
  const [feed, setFeed] = useState<FeedItem[]>([]);

  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceText, setVoiceText] = useState('');
  const [isProcessingVoice, setIsProcessingVoice] = useState(false);
  const recognitionRef = useRef<any>(null);
  
  const feedContainerRef = useRef<HTMLDivElement>(null);

  const getPluginBadge = () => {
    if (!plugin) return null;
    if (plugin === 'github') {
      return (
        <div className="shrink-0 flex items-center gap-1.5 ml-2 text-[#3b82f6]">
          <Github className="w-4 h-4" />
          <span className="font-semibold text-[15px] mr-1">GitHub</span>
        </div>
      );
    }
    if (plugin === 'notion') {
      return (
        <div className="shrink-0 flex items-center gap-1.5 ml-2 text-[#3b82f6]">
          <img src="https://upload.wikimedia.org/wikipedia/commons/4/45/Notion_app_logo.png" className="w-4 h-4 object-contain" alt="Notion" />
          <span className="font-semibold text-[15px] mr-1">Notion</span>
        </div>
      );
    }
    if (plugin === 'canva') {
      return (
        <div className="shrink-0 flex items-center gap-1.5 ml-2 text-[#3b82f6]">
          <img src="https://upload.wikimedia.org/wikipedia/commons/0/08/Canva_icon_2021.svg" className="w-4 h-4 object-contain" alt="Canva" />
          <span className="font-semibold text-[15px] mr-1">Canva</span>
        </div>
      );
    }
    return null;
  };

  const updateFeedItem = (id: string, updates: Partial<FeedItem>) => {
    setFeed(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
  };

  const handleSearch = async (feedId: string, searchQuery: string, activePlugin: string) => {
    const cacheKey = `atmos_cache_${searchQuery.toLowerCase().trim()}_${activePlugin}`;
    const cachedData = localStorage.getItem(cacheKey);
    if (cachedData) {
      try {
        const parsedData = JSON.parse(cachedData);
        updateFeedItem(feedId, { response: parsedData, isSearching: false });
        return;
      } catch (e) {
        console.error("Failed to parse cached data");
      }
    }

    let personalization = {};
    let history = [];
    try {
      personalization = {
        tone: localStorage.getItem('atmos_tone') || 'Default',
        characteristics: JSON.parse(localStorage.getItem('atmos_chars') || '{}'),
        aboutYou: JSON.parse(localStorage.getItem('atmos_aboutYou') || '{}'),
        memoryEnabled: localStorage.getItem('atmos_memory') !== 'false',
        customInstructions: localStorage.getItem('atmos_customInstructions') || '',
        personalIntelligenceEnabled: localStorage.getItem('atmos_personal_intel') === 'true',
        userLocation: localStorage.getItem('atmos_location') || '',
        userCoordinates: localStorage.getItem('atmos_coordinates') || '',
        notionToken: localStorage.getItem('atmos_notion_token') || '',
      };
      // Send the conversation history from the feed!
      history = feed
          .filter(f => f.id !== feedId && f.response)
          .map(f => ({ query: f.query, response: f.response?.result?.summary || '' }));
    } catch(e) {}

    try {
      const res = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          query: searchQuery, 
          history, 
          personalization,
          plugin: activePlugin,
          notionToken: localStorage.getItem('atmos_notion_token'),
          githubToken: localStorage.getItem('atmos_github_token'),
          canvaToken: localStorage.getItem('atmos_canva_token')
        })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to search');
      }

      const data: SearchResponse = await res.json();
      localStorage.setItem(cacheKey, JSON.stringify(data));
      updateFeedItem(feedId, { response: data, isSearching: false });
    } catch (err: any) {
      updateFeedItem(feedId, { error: err.message, isSearching: false });
    }
  };

  useEffect(() => {
    if (q) {
      setFeed(prev => {
        if (prev.length > 0 && prev[prev.length - 1].query === q) {
          return prev;
        }
        const newId = Date.now().toString();
        const newItem = { id: newId, query: q, plugin, response: null, isSearching: true, error: '' };
        
        // Schedule search execution
        setTimeout(() => {
            handleSearch(newId, q, plugin);
            addSearch(q);
        }, 0);
        
        return [...prev, newItem];
      });
      setQueryInput('');
    }
  }, [q, plugin]);

  useEffect(() => {
      // scroll to bottom of the window when feed changes
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
      // or scroll the scroll-container in App
      const mainScroll = document.getElementById('main-scroll');
      if (mainScroll) {
          setTimeout(() => {
             mainScroll.scrollTo({ top: mainScroll.scrollHeight, behavior: 'smooth' });
          }, 100);
      }
  }, [feed.length]);

  const startListening = () => {
    setIsVoiceMode(true);
    setVoiceText('');
    setIsListening(true);
    
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.continuous = false;
      recognition.interimResults = true;
      
      let finalTranscript = '';
      recognition.onresult = (event: any) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          currentTranscript += event.results[i][0].transcript;
        }
        finalTranscript = currentTranscript;
        setVoiceText(currentTranscript);
      };
      
      recognition.onend = () => {
        setIsListening(false);
        if (finalTranscript) {
           fixSpeechWithModel(finalTranscript);
        }
      };
      
      recognition.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
      };
      
      recognition.start();
    } else {
      alert("Speech recognition not supported in this browser.");
      setIsVoiceMode(false);
    }
  };

  const fixSpeechWithModel = async (textToFix: string) => {
      setIsProcessingVoice(true);
      try {
          const res = await fetch('/api/fix-speech', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ text: textToFix })
          });
          const data = await res.json();
          if (data.fixedText) {
              setVoiceText(data.fixedText);
          }
      } catch (err) {
          console.error(err);
      } finally {
          setIsProcessingVoice(false);
      }
  };

  const cancelVoice = () => {
     if (recognitionRef.current) {
         recognitionRef.current.abort();
     }
     setIsVoiceMode(false);
     setVoiceText('');
     setIsListening(false);
  };

  const confirmVoice = () => {
     if (voiceText.trim()) {
       setQueryInput(voiceText);
       setIsVoiceMode(false);
       if (voiceText.trim() !== q) {
         navigate(`/search?q=${encodeURIComponent(voiceText.trim())}`);
       }
     }
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (queryInput.trim() && (queryInput.trim() !== q || plugin)) {
      navigate(`/search?q=${encodeURIComponent(queryInput.trim())}${plugin ? `&plugin=${plugin}` : ''}`);
    }
  };

  return (
    <div className="flex-1 w-full flex flex-col relative" ref={feedContainerRef}>
      <div className="flex-1 w-full flex flex-col pb-32">
        {feed.map((item, index) => (
          <div key={item.id} className="w-full max-w-4xl mx-auto px-4 pt-10 min-h-[calc(100vh-140px)] snap-start flex flex-col justify-start">
             <div className="flex justify-end mb-6">
                <div className="bg-gray-100 text-gray-800 px-5 py-3 rounded-2xl rounded-tr-sm text-[17px] max-w-[80%] inline-block">
                    {item.query}
                </div>
             </div>
             
             {item.isSearching && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="w-full flex flex-col space-y-6 flex-1"
              >
                <div className="flex items-center gap-3 text-gray-500 font-medium mb-4">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Analyzing sources and generating response...</span>
                </div>
                <div className="w-full space-y-4">
                  <div className="h-6 bg-gray-100 rounded-md w-3/4 animate-pulse" />
                  <div className="h-4 bg-gray-100 rounded-md w-full animate-pulse" />
                  <div className="h-4 bg-gray-100 rounded-md w-5/6 animate-pulse" />
                  <div className="h-4 bg-gray-100 rounded-md w-full animate-pulse" />
                </div>
                <div className="w-full space-y-4 pt-4">
                  <div className="h-6 bg-gray-100 rounded-md w-1/2 animate-pulse" />
                  <div className="h-4 bg-gray-100 rounded-md w-full animate-pulse" />
                  <div className="h-4 bg-gray-100 rounded-md w-4/5 animate-pulse" />
                </div>
              </motion.div>
            )}

            {item.error && !item.isSearching && (
              <div className="w-full p-4 bg-red-50 text-red-700 border border-red-200 rounded-xl flex-1">
                <p className="font-medium">Error performing search</p>
                <p className="text-sm mt-1">{item.error}</p>
              </div>
            )}

            {item.response && !item.isSearching && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full pb-10 flex-1"
              >
                <div className="mb-8">
                  <div className="flex items-center gap-2.5 mb-3 font-medium text-gray-800">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" className="w-7 h-7">
                      <g clipPath="url(#clip0_655_9444)">
                        <path d="M18.0841 11.612C18.4509 11.6649 18.4509 12.3351 18.0841 12.388C14.1035 12.9624 12.9624 14.1035 12.388 18.0841C12.3351 18.4509 11.6649 18.4509 11.612 18.0841C11.0376 14.1035 9.89647 12.9624 5.91594 12.388C5.5491 12.3351 5.5491 11.6649 5.91594 11.612C9.89647 11.0376 11.0376 9.89647 11.612 5.91594C11.6649 5.5491 12.3351 5.5491 12.388 5.91594C12.9624 9.89647 14.1035 11.0376 18.0841 11.612Z" fill="#3b82f6"/>
                      </g>
                      <defs>
                        <clipPath id="clip0_655_9444">
                          <rect width="24" height="24" fill="white"/>
                        </clipPath>
                      </defs>
                    </svg>
                    <span className="text-[15px]">AI Overview</span>
                  </div>
                  <p className="text-[17px] leading-relaxed text-gray-900 font-medium">
                    {item.response.result.summary}
                  </p>
                </div>

                <SourcesList sources={item.response.sources} images={item.response.images} />

                <div className="space-y-2">
                  {item.response.result.sections.map((section, idx) => (
                    <ResultBlock 
                      key={idx} 
                      title={section.title} 
                      content={section.content} 
                      type={section.type} 
                      plugin={item.plugin}
                    />
                  ))}
                </div>

                {item.response.result.relatedQueries && item.response.result.relatedQueries.length > 0 && (
                  <div className="mt-12 pt-8 border-t border-gray-100">
                    <h3 className="text-sm font-medium text-gray-500 mb-4 uppercase tracking-wider">Related</h3>
                    <div className="flex flex-col gap-2">
                      {item.response.result.relatedQueries.map((q, idx) => (
                        <button
                          key={idx}
                          onClick={() => navigate(`/search?q=${encodeURIComponent(q)}`)}
                          className="text-left py-3 px-4 rounded-xl hover:bg-[#f7f7f5] flex items-center justify-between group transition-colors border border-transparent hover:border-[#eaeaeb]"
                        >
                          <span className="text-gray-700 group-hover:text-black font-medium">{q}</span>
                          <Search className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </div>
        ))}
      </div>

      {/* Sticky Search Bar at the bottom */}
      <div className="sticky bottom-8 w-full pointer-events-none z-40 mt-auto flex justify-center pb-4 px-4">
        <div className={`transition-all duration-300 w-full ${isVoiceMode ? 'max-w-md' : 'max-w-3xl'}`}>
          {isVoiceMode ? (
            <div className="relative flex items-center justify-between bg-white border border-gray-200 rounded-full p-1.5 transition-all shadow-md pointer-events-auto min-h-[52px]">
              <button type="button" onClick={cancelVoice} className="w-10 h-10 shrink-0 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors">
                <X className="w-5 h-5" />
              </button>
              
              <div className="flex-1 flex items-center justify-center overflow-hidden px-4">
                {isListening ? (
                  <div className="flex items-center gap-1 h-6">
                     {[1,2,3,4,5,6,7].map(i => (
                        <div key={i} className="w-1.5 bg-gray-800 rounded-full animate-pulse" style={{ height: `${Math.random() * 40 + 40}%`, animationDelay: `${i * 0.1}s` }} />
                     ))}
                  </div>
                ) : isProcessingVoice ? (
                  <span className="text-gray-500 animate-pulse text-sm">Fixing speech...</span>
                ) : (
                  <span className="text-gray-800 font-medium truncate text-sm">{voiceText}</span>
                )}
              </div>

              <button 
                type="button"
                onClick={confirmVoice}
                disabled={isListening || isProcessingVoice || !voiceText}
                className="w-10 h-10 shrink-0 flex items-center justify-center rounded-full bg-green-500 text-white hover:bg-green-600 transition-colors disabled:opacity-50 disabled:bg-gray-200 disabled:text-gray-400"
              >
                <Check className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="relative flex items-center bg-white border border-gray-200 focus-within:border-gray-300 rounded-3xl p-1.5 transition-all shadow-sm pointer-events-auto">
              <button type="button" className="w-10 h-10 shrink-0 flex items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 transition-colors">
                <Plus className="w-5 h-5" />
              </button>
              {getPluginBadge()}
              <input
                type="text"
                value={queryInput}
                onChange={(e) => setQueryInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Backspace' && queryInput === '' && plugin) {
                    navigate(`/search?q=${encodeURIComponent(q)}`);
                  }
                }}
                placeholder={plugin ? `Ask follow-up in ${plugin.charAt(0).toUpperCase() + plugin.slice(1)}...` : "Ask follow-up..."}
                className="flex-1 bg-transparent px-2 text-base outline-none text-gray-800"
              />
              <div className="flex items-center gap-1 shrink-0">
                <button type="button" onClick={startListening} className="p-2 text-gray-500 hover:text-gray-700 transition-colors">
                  <CustomMicIcon className="w-7 h-7" />
                </button>
                <button 
                  type="submit"
                  disabled={!queryInput.trim()}
                  className={`w-9 h-9 flex items-center justify-center rounded-full transition-colors ${
                    queryInput.trim()
                      ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                      : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  <ArrowUp className="w-5 h-5 stroke-[2.5px]" />
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
function Plugins() {
  const [activeTab, setActiveTab] = useState<'plugins' | 'sources'>('plugins');
  const [showNotionPopup, setShowNotionPopup] = useState(false);
  const [showGithubPopup, setShowGithubPopup] = useState(false);
  const [showCanvaPopup, setShowCanvaPopup] = useState(false);
  const [isNotionInstalled, setIsNotionInstalled] = useState(() => !!localStorage.getItem('atmos_notion_token'));
  const [isGithubInstalled, setIsGithubInstalled] = useState(() => !!localStorage.getItem('atmos_github_token'));
  const [isCanvaInstalled, setIsCanvaInstalled] = useState(() => !!localStorage.getItem('atmos_canva_token'));
  const [showNotionMenu, setShowNotionMenu] = useState(false);
  const [showGithubMenu, setShowGithubMenu] = useState(false);
  const [showCanvaMenu, setShowCanvaMenu] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleNotionInstalled = () => {
      setIsNotionInstalled(true);
      setShowNotionPopup(false);
    };
    window.addEventListener('notion_installed', handleNotionInstalled);
    
    const handleGithubInstalled = () => {
      setIsGithubInstalled(true);
      setShowGithubPopup(false);
    };
    window.addEventListener('github_installed', handleGithubInstalled);

    const handleCanvaInstalled = () => {
      setIsCanvaInstalled(true);
      setShowCanvaPopup(false);
    };
    window.addEventListener('canva_installed', handleCanvaInstalled);
    
    return () => {
      window.removeEventListener('notion_installed', handleNotionInstalled);
      window.removeEventListener('github_installed', handleGithubInstalled);
      window.removeEventListener('canva_installed', handleCanvaInstalled);
    };
  }, []);

  const handleUninstall = (e: React.MouseEvent) => {
    e.stopPropagation();
    localStorage.removeItem('atmos_notion_token');
    localStorage.removeItem('atmos_selected_plugin');
    setIsNotionInstalled(false);
    setShowNotionMenu(false);
  };
  
  const handleGithubUninstall = (e: React.MouseEvent) => {
    e.stopPropagation();
    localStorage.removeItem('atmos_github_token');
    localStorage.removeItem('atmos_selected_plugin');
    setIsGithubInstalled(false);
    setShowGithubMenu(false);
  };

  const handleCanvaUninstall = (e: React.MouseEvent) => {
    e.stopPropagation();
    localStorage.removeItem('atmos_canva_token');
    localStorage.removeItem('atmos_selected_plugin');
    setIsCanvaInstalled(false);
    setShowCanvaMenu(false);
  };

  const handleChat = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate('/');
  };

  return (
    <div className="flex-1 flex flex-col items-center px-4 w-full max-w-4xl mx-auto pt-6 pb-32">
      <div className="flex justify-center w-full mb-10">
        <div className="bg-gray-100 rounded-full flex items-center h-8 px-[2px]">
          <button 
            onClick={() => setActiveTab('plugins')}
            className={`px-4 flex items-center justify-center rounded-full text-sm font-medium transition-all duration-200 ${
              activeTab === 'plugins' 
                ? 'bg-white text-gray-900 h-[32px] scale-[1.06] z-10 shadow-[0_0_0_0.5px_rgba(0,0,0,0.15),0_2px_4px_rgba(0,0,0,0.05)]' 
                : 'text-gray-500 hover:text-gray-700 h-[28px]'
            }`}
          >
            Plugins
          </button>
          <button 
            onClick={() => setActiveTab('sources')}
            className={`px-4 flex items-center justify-center rounded-full text-sm font-medium transition-all duration-200 ${
              activeTab === 'sources' 
                ? 'bg-white text-gray-900 h-[32px] scale-[1.06] z-10 shadow-[0_0_0_0.5px_rgba(0,0,0,0.15),0_2px_4px_rgba(0,0,0,0.05)]' 
                : 'text-gray-500 hover:text-gray-700 h-[28px]'
            }`}
          >
            Sources
          </button>
        </div>
      </div>

      <div className="w-full max-w-3xl">
        {activeTab === 'plugins' ? (
          <>
            <h1 className="text-3xl font-semibold text-gray-900 mb-2">Plugins</h1>
            <p className="text-gray-500 mb-10 text-lg">Work with Atmos across your favorite tools.</p>

            {(isNotionInstalled || isGithubInstalled || isCanvaInstalled) && (
          <div className="mb-10">
            <h2 className="text-lg font-medium text-gray-500 flex items-center gap-1 mb-4">
              Installed <ChevronRight className="w-4 h-4" />
            </h2>
            <div className="flex items-center gap-3">
              {isNotionInstalled && (
                <div className="w-14 h-14 bg-white rounded-[18px] border border-gray-100 flex items-center justify-center p-2.5 cursor-pointer hover:bg-gray-50 transition-all relative">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/4/45/Notion_app_logo.png" alt="Notion" className="w-full h-full object-contain" />
                </div>
              )}
              {isGithubInstalled && (
                <div className="w-14 h-14 bg-white rounded-[18px] border border-gray-100 flex items-center justify-center p-2.5 cursor-pointer hover:bg-gray-50 transition-all relative text-gray-700">
                  <Github className="w-7 h-7" />
                </div>
              )}
              {isCanvaInstalled && (
                <div className="w-14 h-14 bg-white rounded-[18px] border border-gray-100 flex items-center justify-center p-2.5 cursor-pointer hover:bg-gray-50 transition-all relative text-[#00c4cc]">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/0/08/Canva_icon_2021.svg" className="w-full h-full object-contain" alt="Canva" />
                </div>
              )}
            </div>
          </div>
        )}

        <div className="mb-8">
          <h2 className="text-lg font-medium text-gray-500 flex items-center gap-1 mb-4">
            Productivity <ChevronRight className="w-4 h-4" />
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div 
              className="flex items-center justify-between p-3 rounded-2xl border border-transparent hover:bg-gray-100 transition-all cursor-pointer group relative" 
              onClick={() => {
                if (!isNotionInstalled) setShowNotionPopup(true);
              }}
            >
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-white rounded-[14px] border border-gray-100 flex items-center justify-center shrink-0 p-2">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/4/45/Notion_app_logo.png" alt="Notion" className="w-full h-full object-contain" />
                </div>
                <div className="flex flex-col">
                  <h3 className="font-medium text-gray-900 text-base leading-tight">Notion</h3>
                  <p className="text-sm text-gray-500 line-clamp-1 max-w-[200px] mt-0.5">
                    Search and read Notion workspace content, create pages, and organize tasks.
                  </p>
                </div>
              </div>

              {!isNotionInstalled ? (
                <button className="w-9 h-9 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-gray-500 group-hover:text-gray-900 transition-colors shrink-0">
                  <Plus className="w-5 h-5" strokeWidth={1.5} />
                </button>
              ) : (
                <div className="relative shrink-0">
                  <button 
                    onClick={(e) => { e.stopPropagation(); setShowNotionMenu(!showNotionMenu); }}
                    className="w-9 h-9 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-gray-500 group-hover:text-gray-900 transition-colors"
                  >
                    <MoreHorizontal className="w-5 h-5" strokeWidth={1.5} />
                  </button>
                  
                  {showNotionMenu && (
                    <>
                      <div 
                        className="fixed inset-0 z-10" 
                        onClick={(e) => { e.stopPropagation(); setShowNotionMenu(false); }} 
                      />
                      <div className="absolute right-0 mt-1 w-32 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-20 flex flex-col overflow-hidden">
                        <button 
                          onClick={handleChat}
                          className="flex items-center gap-2 px-3 py-2.5 hover:bg-gray-50 text-gray-700 text-sm w-full text-left transition-colors"
                        >
                          <MessageSquare className="w-4 h-4" strokeWidth={1.5} />
                          Chat
                        </button>
                        <div className="h-px bg-gray-100 w-full my-0.5" />
                        <button 
                          onClick={handleUninstall}
                          className="flex items-center gap-2 px-3 py-2.5 hover:bg-red-50 text-red-600 text-sm w-full text-left transition-colors"
                        >
                          <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                          Uninstall
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            <div 
              className="flex items-center justify-between p-3 rounded-2xl border border-transparent hover:bg-gray-100 transition-all cursor-pointer group relative" 
              onClick={() => {
                if (!isGithubInstalled) setShowGithubPopup(true);
              }}
            >
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-white rounded-[14px] border border-gray-100 flex items-center justify-center shrink-0 p-2 text-gray-700">
                  <Github className="w-full h-full" strokeWidth={1.5} />
                </div>
                <div className="flex flex-col">
                  <h3 className="font-medium text-gray-900 text-base leading-tight">GitHub</h3>
                  <p className="text-sm text-gray-500 line-clamp-1 max-w-[200px] mt-0.5">
                    Search repositories, read code, and review issues.
                  </p>
                </div>
              </div>

              {!isGithubInstalled ? (
                <button className="w-9 h-9 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-gray-500 group-hover:text-gray-900 transition-colors shrink-0">
                  <Plus className="w-5 h-5" strokeWidth={1.5} />
                </button>
              ) : (
                <div className="relative shrink-0">
                  <button 
                    onClick={(e) => { e.stopPropagation(); setShowGithubMenu(!showGithubMenu); }}
                    className="w-9 h-9 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-gray-500 group-hover:text-gray-900 transition-colors"
                  >
                    <MoreHorizontal className="w-5 h-5" strokeWidth={1.5} />
                  </button>
                  
                  {showGithubMenu && (
                    <>
                      <div 
                        className="fixed inset-0 z-10" 
                        onClick={(e) => { e.stopPropagation(); setShowGithubMenu(false); }} 
                      />
                      <div className="absolute right-0 mt-1 w-32 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-20 flex flex-col overflow-hidden">
                        <button 
                          onClick={handleChat}
                          className="flex items-center gap-2 px-3 py-2.5 hover:bg-gray-50 text-gray-700 text-sm w-full text-left transition-colors"
                        >
                          <MessageSquare className="w-4 h-4" strokeWidth={1.5} />
                          Chat
                        </button>
                        <div className="h-px bg-gray-100 w-full my-0.5" />
                        <button 
                          onClick={handleGithubUninstall}
                          className="flex items-center gap-2 px-3 py-2.5 hover:bg-red-50 text-red-600 text-sm w-full text-left transition-colors"
                        >
                          <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                          Uninstall
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
            
            <div 
              className="flex items-center justify-between p-3 rounded-2xl border border-transparent hover:bg-gray-100 transition-all cursor-pointer group relative" 
              onClick={() => {
                if (!isCanvaInstalled) setShowCanvaPopup(true);
              }}
            >
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-white rounded-[14px] border border-gray-100 flex items-center justify-center shrink-0 p-2 text-[#00c4cc]">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/0/08/Canva_icon_2021.svg" className="w-full h-full object-contain" alt="Canva" />
                </div>
                <div className="flex flex-col">
                  <h3 className="font-medium text-gray-900 text-base leading-tight">Canva</h3>
                  <p className="text-sm text-gray-500 line-clamp-1 max-w-[200px] mt-0.5">
                    Search and view your Canva designs.
                  </p>
                </div>
              </div>

              {!isCanvaInstalled ? (
                <button className="w-9 h-9 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-gray-500 group-hover:text-gray-900 transition-colors shrink-0">
                  <Plus className="w-5 h-5" strokeWidth={1.5} />
                </button>
              ) : (
                <div className="relative shrink-0">
                  <button 
                    onClick={(e) => { e.stopPropagation(); setShowCanvaMenu(!showCanvaMenu); }}
                    className="w-9 h-9 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-gray-500 group-hover:text-gray-900 transition-colors"
                  >
                    <MoreHorizontal className="w-5 h-5" strokeWidth={1.5} />
                  </button>
                  
                  {showCanvaMenu && (
                    <>
                      <div 
                        className="fixed inset-0 z-10" 
                        onClick={(e) => { e.stopPropagation(); setShowCanvaMenu(false); }} 
                      />
                      <div className="absolute right-0 mt-1 w-32 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-20 flex flex-col overflow-hidden">
                        <button 
                          onClick={handleChat}
                          className="flex items-center gap-2 px-3 py-2.5 hover:bg-gray-50 text-gray-700 text-sm w-full text-left transition-colors"
                        >
                          <MessageSquare className="w-4 h-4" strokeWidth={1.5} />
                          Chat
                        </button>
                        <div className="h-px bg-gray-100 w-full my-0.5" />
                        <button 
                          onClick={handleCanvaUninstall}
                          className="flex items-center gap-2 px-3 py-2.5 hover:bg-red-50 text-red-600 text-sm w-full text-left transition-colors"
                        >
                          <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                          Uninstall
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
          </>
        ) : (
          <>
            <h1 className="text-3xl font-semibold text-gray-900 mb-2">Sources</h1>
            <p className="text-gray-500 mb-10 text-lg">Connect Atmos to your favorite knowledge bases.</p>

            <div className="mb-8">
              <h2 className="text-lg font-medium text-gray-500 flex items-center gap-1 mb-4">
                Coming Soon <ChevronRight className="w-4 h-4" />
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { name: 'YouTube', domain: 'youtube.com', desc: 'Search and watch videos directly in Atmos.' },
                  { name: 'Apple Music', domain: 'music.apple.com', desc: 'Listen to your favorite music and podcasts.' },
                  { name: 'Product Hunt', domain: 'producthunt.com', desc: 'Discover the latest tech products.' },
                  { name: 'Wikipedia', domain: 'wikipedia.org', desc: 'Access the free encyclopedia.' },
                  { name: 'arXiv', domain: 'arxiv.org', desc: 'Read research papers and preprints.' },
                  { name: 'PubMed', domain: 'pubmed.ncbi.nlm.nih.gov', desc: 'Search biomedical literature.' },
                ].map((source, i) => (
                  <div 
                    key={i}
                    className="flex items-center justify-between p-3 rounded-2xl border border-transparent hover:bg-gray-100 transition-all cursor-default group relative" 
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 bg-white rounded-[14px] border border-gray-100 flex items-center justify-center shrink-0 p-2 overflow-hidden">
                        <img src={`https://www.google.com/s2/favicons?domain=${source.domain}&sz=128`} alt={source.name} className="w-full h-full object-contain" />
                      </div>
                      <div className="flex flex-col">
                        <h3 className="font-medium text-gray-900 text-base leading-tight">{source.name}</h3>
                        <p className="text-sm text-gray-500 line-clamp-1 max-w-[200px] mt-0.5">
                          {source.desc}
                        </p>
                      </div>
                    </div>

                    <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider bg-gray-100/50 px-2.5 py-1 rounded-md whitespace-nowrap">Coming soon</div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
      
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 text-center z-10 pointer-events-none">
        <p className="text-[13px] text-gray-500 pointer-events-auto flex items-center gap-1.5 font-medium">
          Create and manage your custom plugins on the <Link to="/developer" className="text-gray-700 hover:text-gray-900 underline underline-offset-4 decoration-gray-300 hover:decoration-gray-900 transition-all inline-flex items-center gap-0.5">Atmos Developer platform <ArrowRight className="w-3.5 h-3.5" /></Link>
        </p>
      </div>

      <AnimatePresence>
        {showNotionPopup && <NotionPopup onClose={() => setShowNotionPopup(false)} />}
        {showGithubPopup && <GithubPopup onClose={() => setShowGithubPopup(false)} />}
        {showCanvaPopup && <CanvaPopup onClose={() => setShowCanvaPopup(false)} />}
      </AnimatePresence>
    </div>
  );
}

function CanvaPopup({ onClose }: { onClose: () => void }) {
  const handleAuth = async () => {
    try {
      const res = await fetch('/api/auth/canva/url');
      const { url } = await res.json();
      window.open(
        url,
        "CanvaAuth",
        "width=600,height=800,left=200,top=100"
      );
    } catch (err) {
      console.error("Failed to get Canva auth URL:", err);
    }
  };

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'CANVA_AUTH_SUCCESS') {
        localStorage.setItem('atmos_canva_token', event.data.token);
        onClose();
        window.location.reload();
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-xl bg-white shadow-2xl overflow-hidden z-10 flex flex-col apple-style-icon"
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-white/80 hover:text-white z-20 mix-blend-difference">
          <X className="w-6 h-6" />
        </button>
        
        <div 
          className="p-10 flex flex-col items-center text-center relative bg-cover bg-center"
          style={{
            backgroundImage: 'url("https://res.cloudinary.com/dwthgcx5j/image/upload/v1781562733/Abstract_minimalist_background_for_a_202606151629_qygxvt.jpg")'
          }}
        >
          <div className="flex items-center gap-4 mb-6 relative z-10">
            <div className="w-14 h-14 bg-white rounded-2xl border border-gray-100 flex items-center justify-center p-2.5">
              <img src="https://upload.wikimedia.org/wikipedia/commons/0/08/Canva_icon_2021.svg" className="w-full h-full object-contain" alt="Canva" />
            </div>
            <div className="w-px h-8 bg-gray-300" />
            <div className="w-14 h-14 bg-white rounded-[14px] flex items-center justify-center overflow-hidden">
              <img src="https://res.cloudinary.com/dwthgcx5j/image/upload/v1783888198/square-crop_tlegc3.png" alt="Atmos" className="w-full h-full object-cover" />
            </div>
          </div>
          
          <h2 className="text-3xl font-bold text-gray-900 mb-4 relative z-10">Add Canva to Atmos</h2>
          <p className="text-gray-700 font-medium text-sm leading-relaxed max-w-md relative z-10">
            Search and view — Allow Atmos to search your Canva designs, bringing your visual ideas directly into your workflow.
          </p>
          
          <button 
            onClick={handleAuth}
            className="mt-8 bg-[#00c4cc] hover:bg-[#00b0b8] text-white font-semibold px-6 py-3 rounded-full shadow-md hover:shadow-lg transition-all flex items-center gap-2 relative z-10"
          >
            Connect Canva
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17L17 7"/><path d="M7 7h10v10"/></svg>
          </button>
        </div>

        <div className="p-6 bg-white text-xs text-gray-500 space-y-4">
          <p>
            <strong className="text-gray-900">You're in control.</strong> Atmos always respects your training data preferences, and is limited to permissions you've explicitly set.
          </p>
          <p>
            <strong className="text-gray-900">Apps may introduce elevated risk.</strong> Atmos is built to protect your data, but attackers may attempt to use Atmos to access your data in the app.
          </p>
          <p>
            <strong className="text-gray-900">Data shared with this app.</strong> By adding this app, you allow it to access: (1) basic information typically shared when you visit a website, and (2) a summary of your recent context and intent within Atmos.
          </p>
        </div>
      </motion.div>
    </div>
  );
}

function GithubPopup({ onClose }: { onClose: () => void }) {
  const handleAuth = async () => {
    try {
      const res = await fetch('/api/auth/github/url');
      const { url } = await res.json();
      window.open(
        url,
        "GithubAuth",
        "width=600,height=800,left=200,top=100"
      );
    } catch (err) {
      console.error("Failed to get GitHub auth URL:", err);
    }
  };

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'GITHUB_AUTH_SUCCESS') {
        localStorage.setItem('atmos_github_token', event.data.token);
        onClose();
        window.location.reload();
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-xl bg-white shadow-2xl overflow-hidden z-10 flex flex-col apple-style-icon"
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-white/80 hover:text-white z-20 mix-blend-difference">
          <X className="w-6 h-6" />
        </button>
        
        <div 
          className="p-10 flex flex-col items-center text-center relative bg-cover bg-center"
          style={{
            backgroundImage: 'url("https://res.cloudinary.com/dwthgcx5j/image/upload/v1781562733/Abstract_minimalist_background_for_a_202606151629_qygxvt.jpg")'
          }}
        >
          <div className="flex items-center gap-4 mb-6 relative z-10">
            <div className="w-14 h-14 bg-white rounded-2xl border border-gray-100 flex items-center justify-center p-2.5 text-gray-800">
              <Github className="w-full h-full" strokeWidth={1.5} />
            </div>
            <div className="w-px h-8 bg-gray-300" />
            <div className="w-14 h-14 bg-white rounded-[14px] flex items-center justify-center overflow-hidden">
              <img src="https://res.cloudinary.com/dwthgcx5j/image/upload/v1783888198/square-crop_tlegc3.png" alt="Atmos" className="w-full h-full object-cover" />
            </div>
          </div>
          
          <h2 className="text-3xl font-bold text-gray-900 mb-4 relative z-10">Add GitHub to Atmos</h2>
          <p className="text-gray-700 font-medium text-sm leading-relaxed max-w-md relative z-10">
            Search repositories — Read code, review issues, and get contextual answers across your public and private repositories.
          </p>
          
          <button 
            onClick={handleAuth}
            className="mt-8 bg-gray-900 text-white font-semibold px-6 py-3 rounded-full shadow-md hover:shadow-lg transition-all flex items-center gap-2 relative z-10"
          >
            Connect GitHub
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17L17 7"/><path d="M7 7h10v10"/></svg>
          </button>
        </div>

        <div className="p-6 bg-white text-xs text-gray-500 space-y-4">
          <p>
            <strong className="text-gray-900">You're in control.</strong> Atmos always respects your training data preferences, and is limited to permissions you've explicitly set.
          </p>
          <p>
            <strong className="text-gray-900">Apps may introduce elevated risk.</strong> Atmos is built to protect your data, but attackers may attempt to use Atmos to access your data in the app.
          </p>
          <p>
            <strong className="text-gray-900">Data shared with this app.</strong> By adding this app, you allow it to access: (1) basic information typically shared when you visit a website, and (2) a summary of your recent context and intent within Atmos.
          </p>
        </div>
      </motion.div>
    </div>
  );
}

function NotionPopup({ onClose }: { onClose: () => void }) {
  const handleAuth = async () => {
    try {
      // In a real app we'd fetch from server, but Notion was already doing something similar.
      // Let's standardise it to fetch URL from server as well if we had one, 
      // but let's just fix the hardcoded client ID in the existing flow if it's there.
      // Wait, let's see if there is an /api/auth/notion/url
      const redirectUri = `${window.location.origin}/api/auth/notion/callback`;
      // Actually, let's just fix the client ID to use env if possible.
      // But server.ts doesn't have /api/auth/notion/url yet.
      
      // I'll add /api/auth/notion/url to server.ts in a bit.
      const res = await fetch('/api/auth/notion/url').catch(() => null);
      if (res && res.ok) {
        const { url } = await res.json();
        window.open(url, "NotionAuth", "width=600,height=800,left=200,top=100");
      } else {
        // Fallback to what was there but with env
        const clientId = (import.meta as any).env.VITE_NOTION_CLIENT_ID || '39bd872b-594c-81b3-b6de-00372123600f';
        window.open(
          `https://api.notion.com/v1/oauth/authorize?client_id=${clientId}&response_type=code&owner=user&redirect_uri=${encodeURIComponent(redirectUri)}`,
          "NotionAuth",
          "width=600,height=800,left=200,top=100"
        );
      }
    } catch (err) {
      console.error("Failed to auth with Notion:", err);
    }
  };

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'NOTION_AUTH_SUCCESS') {
        localStorage.setItem('atmos_notion_token', event.data.token);
        onClose();
        window.location.reload();
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-xl bg-white shadow-2xl overflow-hidden z-10 flex flex-col apple-style-icon"
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-white/80 hover:text-white z-20 mix-blend-difference">
          <X className="w-6 h-6" />
        </button>
        
        <div 
          className="p-10 flex flex-col items-center text-center relative bg-cover bg-center"
          style={{
            backgroundImage: 'url("https://res.cloudinary.com/dwthgcx5j/image/upload/v1781562733/Abstract_minimalist_background_for_a_202606151629_qygxvt.jpg")'
          }}
        >
          <div className="flex items-center gap-4 mb-6 relative z-10">
            <div className="w-14 h-14 bg-white rounded-2xl border border-gray-100 flex items-center justify-center p-2.5">
              <img src="https://upload.wikimedia.org/wikipedia/commons/4/45/Notion_app_logo.png" alt="Notion" className="w-full h-full object-contain" />
            </div>
            <div className="w-px h-8 bg-gray-300" />
            <div className="w-14 h-14 bg-white rounded-[14px] flex items-center justify-center overflow-hidden">
              <img src="https://res.cloudinary.com/dwthgcx5j/image/upload/v1783888198/square-crop_tlegc3.png" alt="Atmos" className="w-full h-full object-cover" />
            </div>
          </div>
          
          <h2 className="text-3xl font-bold text-gray-900 mb-4 relative z-10">Add Notion to Atmos</h2>
          <p className="text-gray-700 font-medium text-sm leading-relaxed max-w-md relative z-10">
            Create documentation — Generate PRDs, tech specs, and architecture docs from your research and project data. 
            Search and find answers — Let AI search across all your Notion and connected workspace content.
          </p>
          
          <button 
            onClick={handleAuth}
            className="mt-8 bg-gray-900 text-white font-semibold px-6 py-3 rounded-full shadow-md hover:shadow-lg transition-all flex items-center gap-2 relative z-10"
          >
            Sign in with Notion
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17L17 7"/><path d="M7 7h10v10"/></svg>
          </button>
        </div>
        
        <div className="p-6 bg-white text-xs text-gray-500 space-y-4">
          <p>
            <strong className="text-gray-900">You're in control.</strong> Atmos always respects your training data preferences, and is limited to permissions you've explicitly set.
          </p>
          <p>
            <strong className="text-gray-900">Apps may introduce elevated risk.</strong> Atmos is built to protect your data, but attackers may attempt to use Atmos to access your data in the app.
          </p>
          <p>
            <strong className="text-gray-900">Data shared with this app.</strong> By adding this app, you allow it to access: (1) basic information typically shared when you visit a website, and (2) a summary of your recent context and intent within Atmos.
          </p>
        </div>
      </motion.div>
    </div>
  );
}

export default function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [view, setView] = useState<'search' | 'account'>('search');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [onboardingCompleted, setOnboardingCompleted] = useState(true);
  const [userId, setUserId] = useState<string | null>(localStorage.getItem('atmos_user_id'));
  const [showGreeting, setShowGreeting] = useState(!localStorage.getItem('atmos_greeting_shown') && !localStorage.getItem('atmos_user_id'));
  const [isLoading, setIsLoading] = useState(true);

  const handleLogout = () => {
    localStorage.removeItem('atmos_user_id');
    setUserId(null);
    setOnboardingCompleted(false);
    setView('search');
  };

  useEffect(() => {
    const initUser = async () => {
      if (!userId) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/user/${userId}`);
        if (response.ok) {
          const userData = await response.json();
          setOnboardingCompleted(userData.onboarding_completed);
          
          const historyRes = await fetch(`/api/search-history/${userId}`);
          if (historyRes.ok) {
            const historyData = await historyRes.json();
            setRecentSearches(historyData.map((h: any) => h.query));
          }
        } else {
          handleLogout();
        }
      } catch (error) {
        console.error("Failed to fetch user:", error);
      } finally {
        setIsLoading(false);
      }
    };
    initUser();
  }, [userId]);
  
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'NOTION_AUTH_SUCCESS' && event.data?.token) {
        localStorage.setItem('atmos_notion_token', event.data.token);
        window.dispatchEvent(new Event('notion_installed'));
      } else if (event.data?.type === 'GITHUB_AUTH_SUCCESS' && event.data?.token) {
        localStorage.setItem('atmos_github_token', event.data.token);
        window.dispatchEvent(new Event('github_installed'));
      } else if (event.data?.type === 'CANVA_AUTH_SUCCESS' && event.data?.token) {
        localStorage.setItem('atmos_canva_token', event.data.token);
        window.dispatchEvent(new Event('canva_installed'));
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-white"><div className="w-8 h-8 border-4 border-gray-900 border-t-transparent rounded-full animate-spin"></div></div>;
  }

  if (showGreeting) {
    return <GreetingScreen onFinish={() => {
      setShowGreeting(false);
      localStorage.setItem('atmos_greeting_shown', 'true');
    }} />;
  }

  if (!userId) {
    return <AuthFlow onSuccess={(user) => {
      setUserId(user.id);
      localStorage.setItem('atmos_user_id', user.id);
      setOnboardingCompleted(user.onboarding_completed);
    }} />;
  }

  if (!onboardingCompleted) {
    return <OnboardingFlow onComplete={(user) => {
      setUserId(user.id);
      localStorage.setItem('atmos_user_id', user.id);
      setOnboardingCompleted(true);
    }} />;
  }

  const addSearch = async (q: string) => {
    if (!q.trim()) return;
    setRecentSearches(prev => [q, ...prev.filter(s => s !== q)].slice(0, 50));
    
    if (userId) {
      try {
        await fetch('/api/search-history', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, query: q })
        });
      } catch (e) {
        console.error("Failed to save search:", e);
      }
    }
  };

  return (
    <div className={`flex h-screen overflow-hidden font-sans selection:bg-blue-100 selection:text-blue-900 bg-white ${localStorage.getItem('atmos_compact') === 'true' ? 'text-[13px]' : ''}`}>
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        userId={userId}
        onLogout={handleLogout}
      />
      
      {/* Sidebar - Positioned based on setting */}
      {(localStorage.getItem('atmos_sidebar_pos') || 'left') === 'left' && (
        <div 
          className={`flex-shrink-0 bg-[#f7f8fa] transition-all duration-300 ease-in-out ${isSidebarOpen ? (localStorage.getItem('atmos_compact') === 'true' ? 'w-56' : 'w-64') : 'w-0 overflow-hidden'}`}
        >
          <div className={`flex flex-col h-full ${localStorage.getItem('atmos_compact') === 'true' ? 'p-2 w-56' : 'p-3 w-64'}`}>
             <div className="flex items-center justify-between mb-4 mt-1 px-2">
               <Link to="/" className="font-semibold text-lg flex items-center gap-2 hover:opacity-80 text-gray-800">
                 <img src="https://res.cloudinary.com/dwthgcx5j/image/upload/v1783888198/square-crop_tlegc3.png" alt="Atmos Icon" className="w-6 h-6 rounded-md object-cover" />
                 Atmos
               </Link>
               <button 
                 onClick={() => setIsSidebarOpen(false)}
                 className="p-1.5 text-gray-600 hover:bg-[#e6e8ed] hover:text-gray-900 rounded-md transition-colors group"
                 title="Close sidebar"
               >
                  <SidebarIcon isOpen={true} size={24} className="text-current" />
               </button>
             </div>
             
             <Link 
               to="/" 
               onClick={() => { if(window.innerWidth < 768) setIsSidebarOpen(false); }}
               className="flex items-center gap-2 w-full hover:bg-[#e6e8ed] text-gray-800 p-2.5 rounded-lg transition-colors group"
             >
               <Edit className="w-4 h-4 text-gray-600 group-hover:text-gray-900" />
               <span className="font-medium text-sm">New search</span>
             </Link>

             <div className="mt-6 flex-1 overflow-y-auto no-scrollbar">
               {recentSearches.length > 0 && (
                 <>
                   <div className="text-xs font-semibold text-gray-500 mb-2 px-2">Recents</div>
                   <div className="flex flex-col gap-0.5">
                      {recentSearches.map((s, i) => (
                         <Link 
                           to={`/search?q=${encodeURIComponent(s)}`} 
                           key={i} 
                           onClick={() => { if(window.innerWidth < 768) setIsSidebarOpen(false); }}
                           className="px-2 py-2 hover:bg-[#e6e8ed] text-gray-700 hover:text-gray-900 rounded-lg truncate text-sm transition-colors"
                         >
                           {s}
                         </Link>
                      ))}
                   </div>
                 </>
               )}
             </div>
             
             {/* Bottom Actions */}
             <div className="mt-auto pt-2 pb-1 flex flex-col gap-1">
               <Link
                 to="/plugins"
                 onClick={() => { if(window.innerWidth < 768) setIsSidebarOpen(false); }}
                 className="flex items-center gap-2 w-full hover:bg-[#e6e8ed] text-gray-800 p-2.5 rounded-lg transition-colors group"
               >
                 <Grid className="w-4 h-4 text-gray-600 group-hover:text-gray-900" />
                 <span className="font-medium text-sm">Plugins</span>
               </Link>
               <button
                 onClick={() => setIsSettingsOpen(true)}
                 className="flex items-center gap-2 w-full hover:bg-[#e6e8ed] text-gray-800 p-2.5 rounded-lg transition-colors group"
               >
                 <CustomSettingsIcon className="w-4 h-4 text-gray-600 group-hover:text-gray-900" />
                 <span className="font-medium text-sm">Settings</span>
               </button>
             </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div id="main-scroll" className={`flex-1 flex flex-col h-full overflow-y-auto no-scrollbar relative snap-y snap-mandatory scroll-smooth ${localStorage.getItem('atmos_compact') === 'true' ? 'gap-0' : ''}`}>
        <header className="px-4 py-4 flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur-md z-30 border-transparent transition-all">
          <div className="flex items-center gap-2">
            {!isSidebarOpen && (localStorage.getItem('atmos_sidebar_pos') || 'left') === 'left' && (
              <button 
                onClick={() => setIsSidebarOpen(true)}
                className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                title="Open sidebar"
              >
                 <SidebarIcon isOpen={false} size={24} className="text-gray-600" />
              </button>
            )}
            
            {(localStorage.getItem('atmos_sidebar_pos') || 'left') === 'right' && (
               <div className="flex-1" />
            )}
          </div>
          
          {(localStorage.getItem('atmos_sidebar_pos') || 'left') === 'right' && !isSidebarOpen && (
             <button 
               onClick={() => setIsSidebarOpen(true)}
               className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
               title="Open sidebar"
             >
                <SidebarIcon isOpen={false} size={24} className="text-gray-600" />
             </button>
          )}
        </header>

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<SearchResults addSearch={addSearch} />} />
          <Route path="/plugins" element={<Plugins />} />
          <Route path="/developer" element={<DeveloperConsole />} />
        </Routes>
      </div>

      {/* Sidebar - Positioned Right */}
      {(localStorage.getItem('atmos_sidebar_pos') || 'left') === 'right' && (
        <div 
          className={`flex-shrink-0 bg-[#f7f8fa] transition-all duration-300 ease-in-out border-l border-gray-100 ${isSidebarOpen ? (localStorage.getItem('atmos_compact') === 'true' ? 'w-56' : 'w-64') : 'w-0 overflow-hidden'}`}
        >
          <div className={`flex flex-col h-full ${localStorage.getItem('atmos_compact') === 'true' ? 'p-2 w-56' : 'p-3 w-64'}`}>
             <div className="flex items-center justify-between mb-4 mt-1 px-2">
               <button 
                 onClick={() => setIsSidebarOpen(false)}
                 className="p-1.5 text-gray-600 hover:bg-[#e6e8ed] hover:text-gray-900 rounded-md transition-colors group"
                 title="Close sidebar"
               >
                  <SidebarIcon isOpen={true} size={24} className="text-current" />
               </button>
               <Link to="/" className="font-semibold text-lg flex items-center gap-2 hover:opacity-80 text-gray-800">
                 Atmos
                 <img src="https://res.cloudinary.com/dwthgcx5j/image/upload/v1783888198/square-crop_tlegc3.png" alt="Atmos Icon" className="w-6 h-6 rounded-md object-cover" />
               </Link>
             </div>
             
             <Link 
               to="/" 
               onClick={() => { if(window.innerWidth < 768) setIsSidebarOpen(false); }}
               className="flex items-center gap-2 w-full hover:bg-[#e6e8ed] text-gray-800 p-2.5 rounded-lg transition-colors group"
             >
               <Edit className="w-4 h-4 text-gray-600 group-hover:text-gray-900" />
               <span className="font-medium text-sm">New search</span>
             </Link>

             <div className="mt-6 flex-1 overflow-y-auto no-scrollbar text-right">
               {recentSearches.length > 0 && (
                 <>
                   <div className="text-xs font-semibold text-gray-500 mb-2 px-2">Recents</div>
                   <div className="flex flex-col gap-0.5">
                      {recentSearches.map((s, i) => (
                         <Link 
                           to={`/search?q=${encodeURIComponent(s)}`} 
                           key={i} 
                           onClick={() => { if(window.innerWidth < 768) setIsSidebarOpen(false); }}
                           className="px-2 py-2 hover:bg-[#e6e8ed] text-gray-700 hover:text-gray-900 rounded-lg truncate text-sm transition-colors"
                         >
                           {s}
                         </Link>
                      ))}
                   </div>
                 </>
               )}
             </div>
             
             {/* Bottom Actions */}
             <div className="mt-auto pt-2 pb-1 flex flex-col gap-1">
               <Link
                 to="/plugins"
                 onClick={() => { if(window.innerWidth < 768) setIsSidebarOpen(false); }}
                 className="flex items-center gap-2 w-full hover:bg-[#e6e8ed] text-gray-800 p-2.5 rounded-lg transition-colors group justify-end"
               >
                 <span className="font-medium text-sm">Plugins</span>
                 <Grid className="w-4 h-4 text-gray-600 group-hover:text-gray-900" />
               </Link>
               <button
                 onClick={() => setIsSettingsOpen(true)}
                 className="flex items-center gap-2 w-full hover:bg-[#e6e8ed] text-gray-800 p-2.5 rounded-lg transition-colors group justify-end"
               >
                 <span className="font-medium text-sm">Settings</span>
                 <CustomSettingsIcon className="w-4 h-4 text-gray-600 group-hover:text-gray-900" />
               </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}
