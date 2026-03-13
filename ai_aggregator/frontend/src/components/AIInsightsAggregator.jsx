import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCcw, ExternalLink, MessageSquare, Newspaper, Cpu, X, Calendar, Share2, ArrowRight } from 'lucide-react';

const API_BASE_URL = "http://localhost:8000/api/insights/";

const AIInsightsAggregator = () => {
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isSyncing, setIsSyncing] = useState(false);
    const [selectedArticle, setSelectedArticle] = useState(null);

    const fetchNews = async () => {
        setLoading(true);
        try {
            const cacheBuster = `?t=${new Date().getTime()}`;
            const staticRes = await fetch(`data.json${cacheBuster}`);
            
            if (staticRes.ok) {
                const staticData = await staticRes.json();
                setNews(staticData);
                setLoading(false);
                return;
            }

            const res = await fetch(`${API_BASE_URL}${cacheBuster}`);
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
        if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
            alert("Live Sync is for local development. Snapshot pulled from data.json.");
            return;
        }

        setIsSyncing(true);
        try {
            await fetch(`${API_BASE_URL}sync/`, { method: 'POST' });
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
        <div className="min-h-screen bg-[#020410] text-gray-100 p-4 md:p-8 font-sans transition-colors duration-700 noise-bg">
            <div className="max-w-7xl mx-auto relative z-10">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-16 gap-8">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-violet-400 to-fuchsia-400 neon-text-indigo mb-3">
                            Neural_Aggregator V2.0
                        </h2>
                        <div className="inline-block">
                             <p className="text-violet-400/80 font-mono text-sm typewriter">
                                Exploring the frontier of Autonomous Agents and Neural Networks.
                            </p>
                        </div>
                    </motion.div>

                    <button 
                        onClick={triggerSync}
                        disabled={isSyncing}
                        className="flex items-center gap-3 px-8 py-3.5 bg-indigo-600/10 border border-indigo-500/20 rounded-2xl hover:bg-indigo-600/20 transition-all active:scale-95 disabled:opacity-50 group font-mono text-xs font-bold tracking-widest text-indigo-300"
                    >
                        <RefreshCcw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-700'}`} />
                        {isSyncing ? 'SYNCING_NODES' : 'INITIATE_SYNC'}
                    </button>
                </div>

                {/* News Grid */}
                {loading && news.length === 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="h-72 rounded-3xl bg-white/5 animate-pulse border border-white/5" />
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-start">
                        <AnimatePresence>
                            {news.map((item, idx) => (
                                <NewsCard 
                                    key={item.unique_id} 
                                    item={item} 
                                    idx={idx} 
                                    onReadMore={() => setSelectedArticle(item)}
                                />
                            ))}
                        </AnimatePresence>
                    </div>
                )}
                
                {!loading && news.length === 0 && (
                    <div className="text-center py-20 bg-white/5 rounded-3xl border border-white/5 backdrop-blur-3xl">
                        <p className="text-gray-500 font-mono tracking-tighter uppercase">No payloads detected in current stream sector.</p>
                    </div>
                )}
            </div>

            {/* Modal Reader View */}
            <AnimatePresence>
                {selectedArticle && (
                    <ArticleModal 
                        article={selectedArticle} 
                        onClose={() => setSelectedArticle(null)} 
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

const NewsCard = ({ item, idx, onReadMore }) => {
    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05, duration: 0.5 }}
            className="group p-1 rounded-[2rem] bg-gradient-to-b from-white/10 to-transparent hover:from-indigo-500/20 transition-all duration-500 overflow-hidden"
        >
            <div className="p-7 rounded-[1.8rem] bg-[#0b0e1a]/80 backdrop-blur-3xl border border-white/5 h-full flex flex-col relative group-hover:bg-[#0b0e1a]/40 transition-colors">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl ${item.source_name === 'Hacker News' ? 'bg-orange-500/10 text-orange-400' : 'bg-indigo-500/10 text-indigo-400'}`}>
                            {item.source_name === 'Hacker News' ? <Cpu size={16} /> : <Newspaper size={16} />}
                        </div>
                        <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-gray-500">{item.source_name}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] font-mono text-gray-500 font-semibold bg-white/5 py-1 px-2.5 rounded-lg">
                        <Calendar size={10} /> {formatDate(item.published_at)}
                    </div>
                </div>

                <h3 className="text-xl font-bold mb-4 leading-snug group-hover:text-white transition-colors">
                    {item.title}
                </h3>

                <p className="text-gray-400 text-sm mb-8 leading-relaxed line-clamp-3">
                    {item.content_preview}
                </p>

                <div className="mt-auto flex items-center justify-between">
                    <button 
                        onClick={onReadMore}
                        className="flex items-center gap-2 text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-all group/btn"
                    >
                        READ_DOSSIER <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                </div>
            </div>
        </motion.div>
    );
};

const ArticleModal = ({ article, onClose }) => (
    <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 bg-black/80 backdrop-blur-md"
        onClick={onClose}
    >
        <motion.div
            initial={{ scale: 0.9, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 20, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-4xl max-h-[90vh] overflow-y-auto glass-morphism rounded-[2.5rem] border border-indigo-500/30 shadow-2xl relative p-8 md:p-12 scrollbar-hide"
        >
            <button 
                onClick={onClose}
                className="absolute top-6 right-6 p-3 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 transition-colors"
            >
                <X size={20} className="text-gray-400" />
            </button>

            <div className="flex items-center gap-3 mb-8">
                <span className="text-xs uppercase font-black tracking-widest text-indigo-400 bg-indigo-400/10 py-1.5 px-4 rounded-full border border-indigo-400/20">
                    {article.source_name}
                </span>
                <span className="text-gray-500 font-mono text-xs">/ REFRENCED_PAYLOAD_{article.unique_id}</span>
            </div>

            <h2 className="text-3xl md:text-5xl font-black mb-8 leading-tight tracking-tight">
                {article.title}
            </h2>

            <div className="flex flex-wrap gap-6 mb-12 py-6 border-y border-white/5 font-mono text-xs text-gray-400">
                <div className="flex items-center gap-2"><Calendar size={14} /> PUBLISHED: {new Date(article.published_at).toLocaleString()}</div>
                <div className="flex items-center gap-2"><RefreshCcw size={14} /> STATUS: VERIFIED</div>
            </div>

            <div className="space-y-8 mb-12">
                <div className="p-6 rounded-3xl bg-indigo-500/5 border border-indigo-500/10">
                    <div className="flex items-center gap-3 mb-4">
                        <Cpu size={18} className="text-indigo-400" />
                        <h4 className="text-sm font-black uppercase tracking-widest text-indigo-400">Synthetic Summary</h4>
                    </div>
                    <p className="text-lg text-gray-200 leading-relaxed italic">
                        "{article.ai_summary || "Automated analysis in progress for this satellite node. Neural patterns suggest high relevance to current AI deployment trends."}"
                    </p>
                </div>

                <div className="prose prose-invert max-w-none px-2">
                    <p className="text-xl text-gray-400 leading-relaxed font-light">
                        {article.content_preview}
                    </p>
                    <p className="text-gray-500 text-sm mt-8 border-t border-white/5 pt-8">
                        The full technical breakdown and community discourse for this neural update are hosted on the primary node. ACCESS_PAYLOAD protocol recommended for deep-dive diagnostics.
                    </p>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
                <a 
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-3 px-8 py-5 bg-indigo-600 rounded-2xl hover:bg-indigo-700 transition-all font-bold text-sm tracking-widest group shadow-[0_10px_20px_rgba(79,70,229,0.3)] shadow-indigo-600/40"
                >
                    LAUNCH PRIMARY SOURCE <ExternalLink size={18} />
                </a>
                <button className="flex items-center justify-center gap-3 px-8 py-5 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all font-bold text-sm tracking-widest">
                    SHARE_LINK <Share2 size={18} />
                </button>
            </div>
        </motion.div>
    </motion.div>
);

export default AIInsightsAggregator;
