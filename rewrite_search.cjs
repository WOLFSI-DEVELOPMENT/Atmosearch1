const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

const searchResultsStart = content.indexOf('function SearchResults({');
const searchResultsEnd = content.indexOf('function Plugins() {');

if (searchResultsStart === -1 || searchResultsEnd === -1) {
  console.error("Could not find boundaries");
  process.exit(1);
}

const newSearchResults = `
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

  const updateFeedItem = (id: string, updates: Partial<FeedItem>) => {
    setFeed(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
  };

  const handleSearch = async (feedId: string, searchQuery: string, activePlugin: string) => {
    const cacheKey = \`atmos_cache_\${searchQuery.toLowerCase().trim()}_\${activePlugin}\`;
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
      setFeed(currentFeed => {
          history = currentFeed
              .filter(f => f.id !== feedId && f.response)
              .map(f => ({ query: f.query }));
          return currentFeed;
      });
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
         navigate(\`/search?q=\${encodeURIComponent(voiceText.trim())}\`);
       }
     }
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (queryInput.trim() && (queryInput.trim() !== q || plugin)) {
      navigate(\`/search?q=\${encodeURIComponent(queryInput.trim())}\${plugin ? \`&plugin=\${plugin}\` : ''}\`);
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
                          onClick={() => navigate(\`/search?q=\${encodeURIComponent(q)}\`)}
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
        <div className={\`transition-all duration-300 w-full \${isVoiceMode ? 'max-w-md' : 'max-w-3xl'}\`}>
          {isVoiceMode ? (
            <div className="relative flex items-center justify-between bg-white border border-gray-200 rounded-full p-1.5 transition-all shadow-md pointer-events-auto min-h-[52px]">
              <button type="button" onClick={cancelVoice} className="w-10 h-10 shrink-0 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors">
                <X className="w-5 h-5" />
              </button>
              
              <div className="flex-1 flex items-center justify-center overflow-hidden px-4">
                {isListening ? (
                  <div className="flex items-center gap-1 h-6">
                     {[1,2,3,4,5,6,7].map(i => (
                        <div key={i} className="w-1.5 bg-gray-800 rounded-full animate-pulse" style={{ height: \`\${Math.random() * 40 + 40}%\`, animationDelay: \`\${i * 0.1}s\` }} />
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
              <input
                type="text"
                value={queryInput}
                onChange={(e) => setQueryInput(e.target.value)}
                placeholder="Ask follow-up..."
                className="flex-1 bg-transparent px-2 text-base outline-none text-gray-800"
              />
              <div className="flex items-center gap-1 shrink-0">
                <button type="button" onClick={startListening} className="p-2 text-gray-500 hover:text-gray-700 transition-colors">
                  <CustomMicIcon className="w-7 h-7" />
                </button>
                <button 
                  type="submit"
                  disabled={!queryInput.trim()}
                  className={\`w-9 h-9 flex items-center justify-center rounded-full transition-colors \${
                    queryInput.trim()
                      ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                      : 'bg-gray-100 text-gray-400'
                  }\`}
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
`

const newContent = content.substring(0, searchResultsStart) + newSearchResults + content.substring(searchResultsEnd);

fs.writeFileSync('src/App.tsx', newContent);
console.log("Rewrite complete");

