import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, Plus, Settings, Activity, ExternalLink, Shield, Server, Box, Search, Play, ArrowRight, X, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { MCPPlugin } from './types';

export default function DeveloperConsole() {
  const navigate = useNavigate();
  const [plugins, setPlugins] = useState<MCPPlugin[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [iconUrl, setIconUrl] = useState('');
  const [mcpServerUrl, setMcpServerUrl] = useState('');
  const [requiresAuth, setRequiresAuth] = useState(false);
  const [authType, setAuthType] = useState('oauth');
  const [clientId, setClientId] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [error, setError] = useState('');

  const fetchPlugins = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/developer/plugins');
      const data = await res.json();
      if (res.ok) {
        setPlugins(data.plugins || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPlugins();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/developer/plugins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name, description, iconUrl, mcpServerUrl, requiresAuth, authType, clientId, clientSecret
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create plugin');
      
      setPlugins([data.plugin, ...plugins]);
      setShowCreateModal(false);
      
      // Reset form
      setName('');
      setDescription('');
      setIconUrl('');
      setMcpServerUrl('');
      setRequiresAuth(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/')} className="p-2 -ml-2 text-gray-500 hover:text-gray-900 rounded-full hover:bg-gray-100 transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
                <Box className="w-4 h-4 text-white" />
              </div>
              <h1 className="text-lg font-semibold text-gray-900">Atmos Developer</h1>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <a href="#" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">Documentation</a>
            <div className="w-px h-4 bg-gray-200" />
            <button 
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              New Plugin
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-12">
        <div className="mb-10">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Your Plugins</h2>
          <p className="text-gray-500 text-lg">Manage your custom Model Context Protocol (MCP) servers and tools.</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        ) : plugins.length === 0 ? (
          <div className="bg-white border border-gray-200 border-dashed rounded-2xl p-12 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-4">
              <Server className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">No plugins yet</h3>
            <p className="text-gray-500 mb-6 max-w-sm">Create your first MCP plugin to connect external data sources and tools to Atmos.</p>
            <button 
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-colors"
            >
              Create Plugin
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plugins.map((plugin) => (
              <div key={plugin.id} className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all group">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-center overflow-hidden shrink-0">
                    {plugin.iconUrl ? (
                      <img src={plugin.iconUrl} alt={plugin.name} className="w-full h-full object-cover" />
                    ) : (
                      <Box className="w-6 h-6 text-gray-400" />
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 px-2.5 py-1 bg-green-50 text-green-700 rounded-full text-xs font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                    Active
                  </div>
                </div>
                
                <h3 className="text-lg font-medium text-gray-900 mb-1">{plugin.name}</h3>
                <p className="text-sm text-gray-500 line-clamp-2 mb-6 min-h-[40px]">
                  {plugin.description}
                </p>
                
                <div className="flex items-center gap-4 border-t border-gray-100 pt-4 mt-auto">
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 font-mono bg-gray-50 px-2 py-1 rounded truncate">
                    <Server className="w-3 h-3 shrink-0" />
                    <span className="truncate">{new URL(plugin.mcpServerUrl).hostname}</span>
                  </div>
                  {plugin.requiresAuth && (
                    <div className="flex items-center gap-1.5 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded shrink-0">
                      <Shield className="w-3 h-3" />
                      Auth
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setShowCreateModal(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-white shadow-2xl rounded-2xl overflow-hidden z-10 max-h-[90vh] flex flex-col"
            >
              <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Register MCP Plugin</h2>
                  <p className="text-sm text-gray-500 mt-1">Connect your Model Context Protocol server.</p>
                </div>
                <button onClick={() => setShowCreateModal(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200 text-gray-500 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="overflow-y-auto p-6 custom-scrollbar">
                {error && (
                  <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100 flex items-start gap-2">
                    <Shield className="w-4 h-4 mt-0.5 shrink-0" />
                    <p>{error}</p>
                  </div>
                )}
                
                <form id="plugin-form" onSubmit={handleCreate} className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Basic Details</h3>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Plugin Name</label>
                      <input 
                        type="text" 
                        required
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="e.g. Jira Tracker"
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 transition-all text-sm"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                      <textarea 
                        required
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        placeholder="What does this plugin do? How should the AI use it?"
                        rows={3}
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 transition-all text-sm resize-none"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Icon URL (optional)</label>
                      <input 
                        type="url" 
                        value={iconUrl}
                        onChange={e => setIconUrl(e.target.value)}
                        placeholder="https://example.com/icon.png"
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 transition-all text-sm"
                      />
                    </div>
                  </div>

                  <div className="w-full h-px bg-gray-100" />

                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Server Configuration</h3>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">MCP Server URL</label>
                      <input 
                        type="url" 
                        required
                        value={mcpServerUrl}
                        onChange={e => setMcpServerUrl(e.target.value)}
                        placeholder="https://api.example.com/mcp"
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 transition-all text-sm font-mono"
                      />
                      <p className="text-xs text-gray-500 mt-2">The endpoint that implements the standard MCP SSE/HTTP transport.</p>
                    </div>
                  </div>

                  <div className="w-full h-px bg-gray-100" />

                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Authentication</h3>
                    
                    <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                      <input 
                        type="checkbox" 
                        checked={requiresAuth}
                        onChange={e => setRequiresAuth(e.target.checked)}
                        className="w-4 h-4 text-gray-900 border-gray-300 rounded focus:ring-gray-900"
                      />
                      <div>
                        <div className="text-sm font-medium text-gray-900">Requires User Authentication</div>
                        <div className="text-xs text-gray-500 mt-0.5">Prompt users to connect their account before using this plugin.</div>
                      </div>
                    </label>

                    {requiresAuth && (
                      <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Auth Type</label>
                          <select 
                            value={authType}
                            onChange={e => setAuthType(e.target.value)}
                            className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 transition-all text-sm"
                          >
                            <option value="oauth">OAuth 2.0</option>
                            <option value="api_key">User API Key</option>
                          </select>
                        </div>
                        
                        {authType === 'oauth' && (
                          <>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Client ID</label>
                              <input 
                                type="text" 
                                value={clientId}
                                onChange={e => setClientId(e.target.value)}
                                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 transition-all text-sm font-mono"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Client Secret</label>
                              <input 
                                type="password" 
                                value={clientSecret}
                                onChange={e => setClientSecret(e.target.value)}
                                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 transition-all text-sm font-mono"
                              />
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </form>
              </div>

              <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-3 shrink-0">
                <button 
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  form="plugin-form"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                  Register Plugin
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
