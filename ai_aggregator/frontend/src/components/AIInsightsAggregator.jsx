import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCcw, ExternalLink, MessageSquare, Newspaper, Cpu } from 'lucide-react';

const API_BASE_URL = "http://localhost:8000/api/insights/";

const AIInsightsAggregator = () => {
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isSyncing, setIsSyncing] = useState(false);

    const fetchNews = async () => {
        setLoading(true);
        try {
            // Priority 1: Check for local data.json (Production/Static Fallback)
            const staticRes = await fetch("/ai-insights/data.json");
            if (staticRes.ok) {
                const staticData = await staticRes.json();
                setNews(staticData);
                setLoading(false);
                return;
            }

            // Priority 2: Fallback to Live API (for Local Development)
            const res = await fetch(API_BASE_URL);
            if (!res.ok) throw new Error("Failed to fetch news");
            const data = await res.json();
            setNews(data);
        } catch (error) {
            console.error("Fetch Error:", error);
        } finally {
            setLoading(false);
        }
    };

    const triggerSync = async () => {
        setIsSyncing(true);
        try {
            const res = await fetch(`${API_BASE_URL}sync/`, { method: 'POST' });
            if (!res.ok) throw new Error("Sync failed");
            await fetchNews();
        } catch (error) {
            console.error("Sync Error:", error);
        } finally {
            setIsSyncing(false);
        }
    };

    useEffect(() => {
        fetchNews();
    }, []);

    return (
        <div className="min-h-screen bg-[#020205] text-white p-4 md:p-8 font-sans">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
                    <div>
                        <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">
                            Neural_Aggregator V2.0
                        </h2>
                        <p className="text-gray-500 font-mono text-sm mt-2">
                            Automated Intelligence Syncing :: Live Stream
                        </p>
                    </div>

                    <button 
                        onClick={triggerSync}
                        disabled={isSyncing}
                        className="flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all active:scale-95 disabled:opacity-50 group font-mono text-sm"
                    >
                        <RefreshCcw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
                        {isSyncing ? 'SYNCING_NODES...' : 'INITIATE_SYNC'}
                    </button>
                </div>

                {/* News Grid */}
                {loading && news.length === 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="h-64 rounded-2xl bg-white/5 animate-pulse border border-white/5" />
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
                        <AnimatePresence>
                            {news.map((item, idx) => (
                                <NewsCard key={item.unique_id} item={item} idx={idx} />
                            ))}
                        </AnimatePresence>
                    </div>
                )}
                
                {!loading && news.length === 0 && (
                    <div className="text-center py-20 bg-white/5 rounded-3xl border border-white/5">
                        <p className="text-gray-500 font-mono">NO_DATA_FOUND. INITIATE SYNC TO FETCH RECENT PAYLOADS.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

const NewsCard = ({ item, idx }) => {
    const timeSince = (date) => {
        const seconds = Math.floor((new Date() - new Date(date)) / 1000);
        if (seconds < 3600) return Math.floor(seconds / 60) + "M AGO";
        if (seconds < 86400) return Math.floor(seconds / 3600) + "H AGO";
        return Math.floor(seconds / 86400) + "D AGO";
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.05 }}
            className="group p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-indigo-500/50 transition-all duration-300 glass-morphism overflow-hidden relative"
        >
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded-lg ${item.source_name === 'Hacker News' ? 'bg-orange-500/10 text-orange-400' : 'bg-blue-500/10 text-blue-400'}`}>
                        {item.source_name === 'Hacker News' ? <Cpu size={14} /> : <Newspaper size={14} />}
                    </div>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-gray-400">{item.source_name}</span>
                </div>
                <span className="text-[10px] font-mono text-gray-500">{timeSince(item.published_at)}</span>
            </div>

            <h3 className="text-xl font-semibold mb-4 leading-tight group-hover:text-indigo-400 transition-colors">
                {item.title}
            </h3>

            <p className="text-gray-400 text-sm mb-6 leading-relaxed line-clamp-3">
                {item.content_preview}
            </p>

            {item.ai_summary && (
                <div className="p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/10 mb-6">
                    <div className="flex items-center gap-2 mb-2">
                        <MessageSquare size={12} className="text-indigo-400" />
                        <span className="text-[9px] uppercase font-black text-indigo-400">Why it matters</span>
                    </div>
                    <p className="text-[11px] text-gray-300 italic leading-relaxed">
                        "{item.ai_summary}"
                    </p>
                </div>
            )}

            <a 
                href={item.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-xs font-mono text-cyan-400 hover:text-cyan-300 transition-colors"
            >
                ACCESS_PAYLOAD <ExternalLink size={14} />
            </a>
        </motion.div>
    );
};

export default AIInsightsAggregator;
