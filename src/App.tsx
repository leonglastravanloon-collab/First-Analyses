/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion, AnimatePresence } from 'motion/react';
import { Layout, Search, TrendingUp, TrendingDown, Activity, Settings, Cpu, Building2, Zap, Link, ExternalLink, RefreshCw, ChevronRight, AlertTriangle, ShieldCheck, PieChart, Info, CheckCircle2, Globe, BarChart3, Bell } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { GeminiService } from './services/geminiService';
import { StockService } from './services/stockService';
import { EuronextService } from './services/euronextService';
import { Stock, Company, ViewMode, DataSource, FundamentalAnalysis, SentimentAnalysis } from './types';

export default function App() {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);
  const [lastTick, setLastTick] = useState<string>(new Date().toLocaleTimeString());
  const [dataSource, setDataSource] = useState<DataSource>('simulated');
  const [ibkrUrl, setIbkrUrl] = useState<string>('');
  const [isConnected, setIsConnected] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('markets');
  const [companySearch, setCompanySearch] = useState('');
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);

  // Analysis State
  const [analyses, setAnalyses] = useState<Record<string, FundamentalAnalysis>>({});
  const [sentimentAnalyses, setSentimentAnalyses] = useState<Record<string, SentimentAnalysis>>({});
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [isSentimentScanning, setIsSentimentScanning] = useState(false);
  const [sentimentScanProgress, setSentimentScanProgress] = useState(0);
  const [analysisModuleView, setAnalysisModuleView] = useState<'fundamental' | 'sentiment'>('fundamental');

  const filteredCompanies = useMemo(() => {
    return EuronextService.searchCompanies(companySearch);
  }, [companySearch]);

  useEffect(() => {
    setStocks(StockService.getStocks());
    const interval = setInterval(async () => {
      try {
        const updated = await StockService.update();
        setStocks(updated);
        setLastTick(new Date().toLocaleTimeString());
        setIsConnected(true);
        setErrorMessage(null);
        
        if (selectedStock) {
          const found = updated.find(s => s.symbol === selectedStock.symbol);
          if (found) setSelectedStock(found);
        }
      } catch (err: any) {
        setIsConnected(false);
        setErrorMessage(err.message || "Verbinding verbroken");
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [selectedStock, dataSource]);

  const handleSourceChange = (source: DataSource) => {
    setDataSource(source);
    setErrorMessage(null);
    StockService.setSource(source, ibkrUrl);
  };

  const handlePerformScan = async () => {
    if (!selectedCompany || isScanning) return;

    setIsScanning(true);
    setErrorMessage(null);
    setScanProgress(10);

    try {
      const progressInterval = setInterval(() => {
        setScanProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + Math.random() * 5;
        });
      }, 500);

      const result = await GeminiService.performFundamentalScan(selectedCompany);
      
      clearInterval(progressInterval);
      setScanProgress(100);
      
      setAnalyses(prev => ({
        ...prev,
        [selectedCompany.isin]: result
      }));
    } catch (error) {
      console.error("Scan failed:", error);
      setErrorMessage(error instanceof Error ? error.message : 'Unknown scan error');
    } finally {
      setTimeout(() => {
        setIsScanning(false);
        setScanProgress(0);
      }, 500);
    }
  };

  const handlePerformSentimentScan = async () => {
    if (!selectedCompany || isSentimentScanning) return;

    setIsSentimentScanning(true);
    setErrorMessage(null);
    setSentimentScanProgress(10);

    try {
      const progressInterval = setInterval(() => {
        setSentimentScanProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + Math.random() * 5;
        });
      }, 500);

      const result = await GeminiService.performSentimentAnalysis(selectedCompany);
      
      clearInterval(progressInterval);
      setSentimentScanProgress(100);
      
      setSentimentAnalyses(prev => ({
        ...prev,
        [selectedCompany.isin]: result
      }));
      setAnalysisModuleView('sentiment');
    } catch (error) {
      console.error("Sentiment scan failed:", error);
      setErrorMessage(error instanceof Error ? error.message : 'Unknown sentiment scan error');
    } finally {
      setTimeout(() => {
        setIsSentimentScanning(false);
        setSentimentScanProgress(0);
      }, 500);
    }
  };

  const currentAnalysis = selectedCompany ? analyses[selectedCompany.isin] : null;
  const currentSentiment = selectedCompany ? sentimentAnalyses[selectedCompany.isin] : null;

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-brand-bg text-brand-accent font-sans select-none">
      {/* Header: Architectural & Clean */}
      <header className="h-16 border-b border-brand-border px-8 flex items-center justify-between bg-brand-bg/50 backdrop-blur-xl z-50">
        <div className="flex items-center gap-6">
          <div className="flex flex-col">
            <span className="text-[10px] tracking-[0.3em] text-brand-muted uppercase font-semibold">Intelligentie Node</span>
            <h1 className="text-xl font-serif italic tracking-tight">Alpha Terminal v1.1</h1>
          </div>
          <div className="h-6 w-[1px] bg-brand-border"></div>
          <div className="flex gap-4">
            <div className={`flex items-center gap-2 px-3 py-1 bg-brand-section border border-brand-border rounded-full`}>
              <div className={`w-1.5 h-1.5 rounded-full shadow-[0_0_8px] ${isConnected ? 'bg-emerald-500 shadow-emerald-500/40' : 'bg-rose-500 shadow-rose-500/40'}`}></div>
              <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400">
                {dataSource === 'simulated' ? 'AEX Live Stroom (SIM)' : 'TWS Interface'}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-8">
          <div className="text-right">
            <div className="text-[10px] uppercase tracking-widest text-brand-muted">Amsterdamse Markt</div>
            <div className="text-sm font-mono text-zinc-300">{lastTick}</div>
          </div>
          <div className="flex items-center gap-2">
             <button className="w-10 h-10 flex items-center justify-center border border-brand-border rounded-lg hover:bg-brand-section transition-colors text-zinc-400 hover:text-white">
                <Search className="w-4 h-4" />
             </button>
             <button className="w-10 h-10 flex items-center justify-center border border-brand-border rounded-lg hover:bg-brand-section transition-colors text-zinc-400 hover:text-white">
                <Bell className="w-4 h-4" />
             </button>
          </div>
        </div>
      </header>

      {/* Main Modular Interface */}
      <main className="flex-1 flex overflow-hidden p-6 gap-6">
        
        {/* Sidebar: Modular Navigation */}
        <nav className="w-16 flex flex-col gap-4 flex-shrink-0">
          <div 
            onClick={() => setViewMode('markets')}
            className={`w-16 h-16 border rounded-xl flex items-center justify-center transition-all cursor-pointer ${viewMode === 'markets' ? 'bg-brand-section border-brand-border text-emerald-500 shadow-xl' : 'border-transparent text-brand-dim hover:text-brand-muted'}`}
          >
            <BarChart3 className="w-7 h-7" />
          </div>
          <div 
            onClick={() => setViewMode('analysis')}
            className={`w-16 h-16 border rounded-xl flex items-center justify-center transition-all cursor-pointer group relative ${viewMode === 'analysis' ? 'bg-brand-section border-brand-border text-emerald-500 shadow-xl' : 'border-transparent text-brand-dim hover:text-brand-muted'}`}
          >
            <Layout className="w-7 h-7" />
            <span className="absolute left-20 bg-black text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap z-50 border border-brand-border text-brand-muted">Analyse Modules</span>
          </div>
          <div className="w-16 h-16 border border-transparent rounded-xl flex items-center justify-center text-brand-dim hover:text-brand-muted transition-colors cursor-pointer group relative">
            <Zap className="w-7 h-7" />
            <span className="absolute left-20 bg-black text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap z-50 border border-brand-border text-brand-muted">Agent Triggers</span>
          </div>
          <div className="mt-auto">
            <div className="w-16 h-16 border border-transparent rounded-xl flex items-center justify-center text-brand-dim hover:text-brand-muted transition-colors cursor-pointer">
              <Settings className="w-6 h-6" />
            </div>
          </div>
        </nav>

        {/* Primary Content Area */}
        <div className="flex-1 flex flex-col gap-6 overflow-hidden min-w-0">
          <AnimatePresence mode="wait">
            {viewMode === 'markets' ? (
              <motion.section 
                key="markets"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex-1 bg-brand-panel border border-brand-border rounded-2xl p-8 shadow-2xl flex flex-col overflow-hidden"
              >
                <div className="flex justify-between items-end mb-10 flex-shrink-0">
                  <div>
                    <h2 className="text-4xl font-serif italic mb-1 text-white">Amsterdamse Beurs</h2>
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-2xl text-emerald-400">894.20</span>
                      <div className="flex items-center gap-1 text-emerald-500 font-mono text-xs">
                        <Activity className="w-3 h-3" />
                        <span>+4.12 (0.47%)</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <span className="px-3 py-1 bg-white text-black text-[10px] font-bold uppercase tracking-tighter rounded">Live Gegevens</span>
                    <span className="px-3 py-1 border border-brand-border text-brand-muted text-[10px] uppercase tracking-tighter rounded">INDEX: AEX</span>
                  </div>
                </div>

                <div className="flex-1 flex flex-col min-h-0 bg-brand-section border border-brand-border rounded-xl overflow-hidden">
                  <div className="grid grid-cols-12 bg-brand-section/80 border-b border-brand-border p-4 text-[11px] uppercase tracking-widest text-brand-muted font-bold">
                    <div className="col-span-1">Pos</div>
                    <div className="col-span-5">Instrument</div>
                    <div className="col-span-2 text-right">Prijs</div>
                    <div className="col-span-2 text-right">Momentum</div>
                    <div className="col-span-2 text-right">Volatiliteit</div>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto overflow-x-hidden divide-y divide-brand-border scrollbar-hide">
                    {stocks.map((stock, idx) => (
                      <motion.div 
                        key={stock.symbol}
                        onClick={() => setSelectedStock(stock)}
                        className={`grid grid-cols-12 p-4 items-center hover:bg-brand-section transition-all cursor-pointer border-brand-border ${selectedStock?.symbol === stock.symbol ? 'bg-brand-bg border-l-2 border-l-emerald-500' : ''}`}
                      >
                        <div className="col-span-1 font-mono text-xs text-brand-dim">{(idx + 1).toString().padStart(2, '0')}</div>
                        <div className="col-span-5 flex flex-col">
                          <span className="font-bold text-white text-sm">{stock.name}</span>
                          <span className="text-[10px] text-brand-dim uppercase tracking-wider font-mono">{stock.symbol}</span>
                        </div>
                        <div className="col-span-2 text-right font-mono text-sm tracking-tight">€{stock.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                        <div className={`col-span-2 text-right font-mono text-xs ${stock.change >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {stock.change >= 0 ? '+' : ''}{stock.changePercent}%
                        </div>
                        <div className="col-span-2 flex justify-end gap-1 px-2">
                           <div className="flex items-center gap-0.5">
                             {stock.history.slice(-8).map((h, i) => (
                               <div key={i} className={`w-1 h-3 rounded-full opacity-30 ${stock.change >= 0 ? 'bg-emerald-500' : 'bg-rose-500'}`} style={{ height: `${20 + (i * 10)}%` }} />
                             ))}
                           </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                <div className="mt-6 p-5 border border-dashed border-brand-border rounded-xl flex items-center justify-between text-brand-dim italic text-xs bg-brand-bg/30">
                  <div className="flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-brand-dim/50" />
                    <span>Toekomstige uitbreiding: Implementeer onafhankelijke handelsagenten</span>
                  </div>
                  <div className="flex gap-4 not-italic font-mono uppercase tracking-widest opacity-30 text-[10px]">
                    <span>Node: AMS-01</span>
                    <span>Thread: 004</span>
                  </div>
                </div>
              </motion.section>
            ) : (
              <motion.section 
                key="analysis"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex-1 bg-brand-panel border border-brand-border rounded-2xl p-8 shadow-2xl flex flex-col overflow-hidden"
              >
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <h2 className="text-3xl font-serif italic mb-1 text-white">Bedrijfsanalyse Module</h2>
                    <p className="text-brand-muted text-xs uppercase tracking-widest font-mono">Selecteer een Nederlands bedrijf op Euronext Amsterdam om een diepe analyse te starten.</p>
                  </div>
                  <div className="relative group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-dim group-focus-within:text-emerald-500 transition-colors" />
                    <input 
                      type="text" 
                      placeholder="Zoek bedrijf op naam of ISIN..." 
                      value={companySearch}
                      onChange={(e) => setCompanySearch(e.target.value)}
                      className="bg-brand-bg border border-brand-border py-2.5 pl-10 pr-4 rounded-xl text-xs focus:outline-none focus:border-brand-muted focus:ring-1 focus:ring-brand-border transition-all w-80 text-white"
                    />
                  </div>
                </div>

                <div className="flex-1 grid grid-cols-12 gap-6 min-h-0 overflow-hidden">
                  {/* List View */}
                  <div className="col-span-5 flex flex-col bg-brand-section border border-brand-border rounded-2xl overflow-hidden shadow-xl">
                    <div className="p-4 bg-brand-section/50 border-b border-brand-border flex justify-between items-center">
                      <span className="text-[10px] font-bold text-brand-muted uppercase tracking-widest">Euronext Lijst ({filteredCompanies.length})</span>
                      <Globe className="w-3 h-3 text-brand-dim" />
                    </div>
                    <div className="flex-1 overflow-y-auto divide-y divide-brand-border/50 scrollbar-hide">
                      {filteredCompanies.map((company) => (
                        <div 
                          key={`${company.symbol}-${company.isin}`}
                          onClick={() => setSelectedCompany(company)}
                          className={`p-4 hover:bg-brand-bg transition-colors cursor-pointer flex justify-between items-center group ${selectedCompany?.isin === company.isin ? 'bg-brand-bg border-r-2 border-r-emerald-500 shadow-inner' : ''}`}
                        >
                          <div className="flex flex-col">
                            <span className="text-[11px] font-bold text-white group-hover:text-emerald-400 transition-colors">{company.name}</span>
                            <span className="text-[9px] font-mono text-brand-dim uppercase">{company.symbol} • {company.isin}</span>
                          </div>
                          <div className="text-[9px] font-mono text-brand-dim bg-brand-panel px-2 py-0.5 rounded border border-brand-border group-hover:border-brand-muted">
                            {company.sector}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Detail/Analysis View */}
                  <div className="col-span-7 flex flex-col min-h-0">
                    {selectedCompany ? (
                      <div className="flex-1 flex flex-col gap-6 overflow-y-auto scrollbar-hide pr-1">
                        <div className="bg-brand-bg/50 border border-brand-border rounded-2xl p-8 flex flex-col gap-6">
                          <header className="flex justify-between items-start">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center">
                                <Building2 className="w-6 h-6 text-black" />
                              </div>
                              <div>
                                <h3 className="text-2xl font-serif italic text-white">{selectedCompany.name}</h3>
                                <p className="text-brand-muted text-xs font-mono uppercase tracking-wider">{selectedCompany.isin} • {selectedCompany.market}</p>
                              </div>
                            </div>
                            <button className="p-2 border border-brand-border rounded-lg hover:bg-brand-section text-brand-muted hover:text-white transition-colors">
                              <ExternalLink className="w-4 h-4" />
                            </button>
                          </header>

                          <div className="grid grid-cols-3 gap-4">
                            <div className="p-4 bg-brand-section border border-brand-border rounded-xl">
                              <span className="text-[9px] text-brand-dim uppercase block mb-1">Sector</span>
                              <span className="text-xs font-medium text-white">{selectedCompany.sector || 'N.v.t.'}</span>
                            </div>
                            <div className="p-4 bg-brand-section border border-brand-border rounded-xl">
                              <span className="text-[9px] text-brand-dim uppercase block mb-1">Activaklasse</span>
                              <span className="text-xs font-medium text-white">Aandelen</span>
                            </div>
                            <div className="p-4 bg-brand-section border border-brand-border rounded-xl">
                              <span className="text-[9px] text-brand-dim uppercase block mb-1">Handelsvaluta</span>
                              <span className="text-xs font-medium text-white">EUR</span>
                            </div>
                          </div>

                          <div className="h-[2px] w-full bg-brand-border"></div>

                          <div className="space-y-4">
                            <h4 className="text-[10px] font-bold text-brand-muted uppercase tracking-widest">Beschikbare Analyse Engines</h4>
                            <div className="grid grid-cols-2 gap-4">
                              <button 
                                onClick={handlePerformScan}
                                disabled={isScanning}
                                className={`p-6 border border-dashed rounded-2xl flex flex-col items-center justify-center gap-3 transition-all cursor-pointer group ${isScanning ? 'border-emerald-500/50 bg-emerald-500/5' : analysisModuleView === 'fundamental' && currentAnalysis ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-brand-border hover:border-brand-muted bg-transparent'}`}
                              >
                                {isScanning ? (
                                  <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin" />
                                ) : (
                                  <Activity className={`w-8 h-8 ${currentAnalysis ? 'text-emerald-400' : 'text-brand-muted group-hover:text-white'} transition-colors`} />
                                )}
                                <div className="flex flex-col items-center">
                                  <span className={`text-[10px] uppercase tracking-widest font-bold ${isScanning ? 'text-emerald-400' : 'text-brand-muted'}`}>
                                    {isScanning ? `Scan in uitvoering... ${Math.round(scanProgress)}%` : 'Fundamentele Scan'}
                                  </span>
                                  {currentAnalysis && !isScanning && (
                                    <span className="text-[10px] text-emerald-500 font-mono mt-1 italic font-bold">RAPPORT GEREED ✓</span>
                                  )}
                                </div>
                              </button>
                              <button 
                                onClick={handlePerformSentimentScan}
                                disabled={isSentimentScanning}
                                className={`p-6 border border-dashed rounded-2xl flex flex-col items-center justify-center gap-3 transition-all cursor-pointer group ${isSentimentScanning ? 'border-emerald-500/50 bg-emerald-500/5' : analysisModuleView === 'sentiment' && currentSentiment ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-brand-border hover:border-brand-muted bg-transparent'}`}
                              >
                                {isSentimentScanning ? (
                                  <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin" />
                                ) : (
                                  <Zap className={`w-8 h-8 ${currentSentiment ? 'text-emerald-400' : 'text-brand-muted group-hover:text-white'} transition-colors`} />
                                )}
                                <div className="flex flex-col items-center">
                                  <span className={`text-[10px] uppercase tracking-widest font-bold ${isSentimentScanning ? 'text-emerald-400' : 'text-brand-muted'}`}>
                                    {isSentimentScanning ? `Analyseert... ${Math.round(sentimentScanProgress)}%` : 'Sentiment Analyse'}
                                  </span>
                                  {currentSentiment && !isSentimentScanning && (
                                    <span className="text-[10px] text-emerald-500 font-mono mt-1 italic font-bold">SENTIMENT OK ✓</span>
                                  )}
                                </div>
                              </button>
                            </div>
                          </div>

                          {(currentAnalysis || currentSentiment) && (
                            <div className="flex bg-brand-section p-1 rounded-xl border border-brand-border h-10">
                              <button 
                                onClick={() => setAnalysisModuleView('fundamental')}
                                className={`flex-1 text-[9px] uppercase tracking-[0.2em] font-bold rounded-lg transition-all ${analysisModuleView === 'fundamental' ? 'bg-brand-bg text-emerald-400 shadow-lg' : 'text-brand-muted hover:text-brand-accent'}`}
                              >
                                Fundamenten
                              </button>
                              <button 
                                onClick={() => setAnalysisModuleView('sentiment')}
                                className={`flex-1 text-[9px] uppercase tracking-[0.2em] font-bold rounded-lg transition-all ${analysisModuleView === 'sentiment' ? 'bg-brand-bg text-emerald-400 shadow-lg' : 'text-brand-muted hover:text-brand-accent'}`}
                              >
                                Sentiment
                              </button>
                            </div>
                          )}

                          {/* Analysis Results Display */}
                          <AnimatePresence mode="wait">
                            {analysisModuleView === 'fundamental' && (
                              currentAnalysis && !isScanning ? (
                                <motion.div 
                                  key="fundamental-report"
                                  initial={{ opacity: 0, x: -20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  exit={{ opacity: 0, x: 20 }}
                                  className="space-y-8"
                                >
                                  <div className="h-[2px] w-full bg-brand-border"></div>
                                  
                                  <div className="grid grid-cols-12 gap-8">
                                    <div className="col-span-8 space-y-8">
                                      <section>
                                        <h5 className="flex items-center gap-2 text-[10px] font-bold text-emerald-500 uppercase tracking-widest mb-3">
                                          <Info className="w-3 h-3" />
                                          Management Samenvatting
                                        </h5>
                                        <p className="text-sm font-serif italic text-white leading-relaxed bg-brand-section/50 p-6 rounded-2xl border border-brand-border shadow-inner">
                                          {currentAnalysis.summary}
                                        </p>
                                      </section>

                                      <div className="grid grid-cols-2 gap-8">
                                        <section className="bg-brand-section/30 p-5 rounded-2xl border border-brand-border">
                                          <h5 className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                            <TrendingUp className="w-3 h-3" />
                                            Sterktes
                                          </h5>
                                          <ul className="space-y-3">
                                            {currentAnalysis.swotAnalysis.strengths.map((s, i) => (
                                              <li key={i} className="text-[11px] text-brand-accent flex gap-3">
                                                <span className="text-emerald-500/50 mt-1 flex-shrink-0">●</span> {s}
                                              </li>
                                            ))}
                                          </ul>
                                        </section>
                                        <section className="bg-brand-section/30 p-5 rounded-2xl border border-brand-border">
                                          <h5 className="text-[10px] font-bold text-rose-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                            <AlertTriangle className="w-3 h-3" />
                                            Risico's
                                          </h5>
                                          <ul className="space-y-3">
                                            {currentAnalysis.swotAnalysis.threats.map((t, i) => (
                                              <li key={i} className="text-[11px] text-brand-accent flex gap-3">
                                                <span className="text-rose-500/50 mt-1 flex-shrink-0">●</span> {t}
                                              </li>
                                            ))}
                                          </ul>
                                        </section>
                                      </div>

                                      <div className="grid grid-cols-2 gap-8">
                                        <section className="space-y-2">
                                          <h5 className="text-[10px] font-bold text-brand-muted uppercase tracking-widest mb-3">Business Model</h5>
                                          <p className="text-[11px] text-brand-accent leading-relaxed">{currentAnalysis.businessModel}</p>
                                        </section>
                                        <section className="space-y-2">
                                          <h5 className="text-[10px] font-bold text-brand-muted uppercase tracking-widest mb-3">Market Position</h5>
                                          <p className="text-[11px] text-brand-accent leading-relaxed">{currentAnalysis.marketPosition}</p>
                                        </section>
                                      </div>
                                    </div>

                                    <div className="col-span-4 space-y-6">
                                      <div className="p-6 bg-brand-section border border-brand-border rounded-2xl flex flex-col items-center text-center shadow-lg">
                                        <span className="text-[9px] text-brand-dim uppercase tracking-widest mb-4 font-bold">Gezondheidsscore</span>
                                        <div className="relative w-24 h-24 flex items-center justify-center">
                                          <svg className="w-full h-full -rotate-90">
                                            <circle cx="48" cy="48" r="44" fill="none" stroke="currentColor" strokeWidth="6" className="text-brand-border" />
                                            <circle 
                                              cx="48" 
                                              cy="48" 
                                              r="44" 
                                              fill="none" 
                                              stroke="currentColor" 
                                              strokeWidth="6" 
                                              strokeDasharray={`${currentAnalysis.financialHealth.score * 2.76} 276`} 
                                              className="text-emerald-500 transition-all duration-1000 ease-out" 
                                            />
                                          </svg>
                                          <span className="absolute text-2xl font-mono text-white font-bold">{currentAnalysis.financialHealth.score}</span>
                                        </div>
                                        <span className="text-[11px] text-brand-muted mt-4 font-serif italic italic font-medium">Operationele Heuristische Graad</span>
                                      </div>

                                      <div className="p-6 bg-brand-section border border-brand-border rounded-2xl">
                                        <span className="text-[9px] text-brand-dim uppercase tracking-widest mb-4 block font-bold">Marktoordeel</span>
                                        <div className={`p-4 rounded-xl border flex items-center justify-center gap-3 ${
                                          currentAnalysis.recommendation.toLowerCase().includes('buy') || currentAnalysis.recommendation.toLowerCase().includes('koop') ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' :
                                          currentAnalysis.recommendation.toLowerCase().includes('sell') || currentAnalysis.recommendation.toLowerCase().includes('verkoop') ? 'bg-rose-500/10 border-rose-500/30 text-rose-400' :
                                          'bg-zinc-500/10 border-zinc-500/30 text-zinc-400'
                                        }`}>
                                          <ShieldCheck className="w-5 h-5 flex-shrink-0" />
                                          <span className="text-[11px] font-bold uppercase tracking-widest">{currentAnalysis.recommendation}</span>
                                        </div>
                                      </div>

                                      <div className="p-6 bg-brand-section border border-brand-border rounded-2xl">
                                        <span className="text-[9px] text-brand-dim uppercase tracking-widest mb-4 block font-bold">Risicoprotocol</span>
                                        <div className={`text-center py-3 rounded-xl text-[11px] font-bold tracking-[0.2em] uppercase border ${
                                          currentAnalysis.riskRating === 'Low' || currentAnalysis.riskRating === 'Laag' ? 'text-emerald-400 bg-emerald-500/5 border-emerald-500/20' :
                                          currentAnalysis.riskRating === 'Medium' || currentAnalysis.riskRating === 'Gemiddeld' ? 'text-orange-400 bg-orange-500/5 border-orange-500/20' :
                                          'text-rose-400 bg-rose-500/5 border-orange-500/20'
                                        }`}>
                                          {currentAnalysis.riskRating}
                                        </div>
                                      </div>

                                      <div className="p-6 bg-brand-section border border-brand-border rounded-2xl">
                                        <span className="text-[9px] text-brand-dim uppercase tracking-widest mb-3 block font-bold">Moat Type</span>
                                        <span className="text-xs text-white font-serif italic">{currentAnalysis.moatType}</span>
                                      </div>
                                    </div>
                                  </div>

                                  <section className="p-8 bg-brand-section border border-brand-border rounded-3xl shadow-inner">
                                    <h5 className="text-[10px] font-bold text-brand-muted uppercase tracking-widest mb-6 flex items-center gap-2">
                                      <PieChart className="w-4 h-4" />
                                      Kwantitatieve Gezondheidscijfers
                                    </h5>
                                    <div className="grid grid-cols-4 gap-8">
                                      {currentAnalysis.financialHealth.keyMetrics.map((m, i) => (
                                        <div key={i} className="space-y-1">
                                          <span className="text-[9px] text-brand-dim block uppercase tracking-wider">{m.label}</span>
                                          <span className="text-sm font-mono text-white font-medium">{m.value}</span>
                                        </div>
                                      ))}
                                    </div>
                                  </section>

                                  <div className="p-4 flex justify-center">
                                    <span className="text-[9px] font-mono text-brand-dim uppercase tracking-[0.3em]">Analyse Node: {currentAnalysis.lastUpdated}</span>
                                  </div>
                                </motion.div>
                              ) : !isScanning ? (
                                <motion.div 
                                  key="fundamental-placeholder"
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  className="py-20 flex flex-col items-center justify-center text-center gap-4 border border-dashed border-brand-border rounded-2xl mt-8"
                                >
                                  <div className="w-16 h-16 rounded-full bg-brand-section flex items-center justify-center border border-brand-border">
                                    <Activity className="w-8 h-8 text-brand-dim" />
                                  </div>
                                  <div>
                                    <h5 className="text-[11px] font-bold uppercase tracking-widest text-brand-muted">Geen Fundamentele Analyse</h5>
                                    <p className="text-xs text-brand-dim mt-2">Start een fundamentele scan via de knop hierboven om data te genereren.</p>
                                  </div>
                                </motion.div>
                              ) : null
                            )}

                            {analysisModuleView === 'sentiment' && (
                              currentSentiment && !isSentimentScanning ? (
                                <motion.div 
                                  key="sentiment-report"
                                  initial={{ opacity: 0, x: 20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  exit={{ opacity: 0, x: -20 }}
                                  className="space-y-8"
                                >
                                  <div className="h-[2px] w-full bg-brand-border"></div>

                                  <div className="grid grid-cols-12 gap-8">
                                    <div className="col-span-8 space-y-8">
                                      <section>
                                        <h5 className="flex items-center gap-2 text-[10px] font-bold text-emerald-500 uppercase tracking-widest mb-3">
                                          <Info className="w-3 h-3" />
                                          Sentiment Samenvatting
                                        </h5>
                                        <p className="text-sm font-serif italic text-white leading-relaxed bg-brand-section/50 p-6 rounded-2xl border border-brand-border shadow-inner">
                                          {currentSentiment.summary}
                                        </p>
                                      </section>

                                      <section>
                                        <h5 className="text-[10px] font-bold text-brand-muted uppercase tracking-widest mb-6 flex items-center gap-2">
                                          <Globe className="w-4 h-4" />
                                          Recent Nieuws & Impact
                                        </h5>
                                        <div className="space-y-4">
                                          {currentSentiment.recentNews.map((news, i) => (
                                            <div key={i} className="p-4 bg-brand-section/30 rounded-xl border border-brand-border hover:border-brand-muted transition-colors">
                                              <div className="flex justify-between items-start mb-2">
                                                <span className="text-[10px] font-mono text-emerald-500/70">{news.source} • {news.date}</span>
                                                <span className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase tracking-wider ${
                                                  news.sentiment === 'Positive' ? 'bg-emerald-500/10 text-emerald-400' :
                                                  news.sentiment === 'Negative' ? 'bg-rose-500/10 text-rose-400' :
                                                  'bg-zinc-500/10 text-zinc-400'
                                                }`}>
                                                  {news.sentiment === 'Positive' ? 'Positief' : news.sentiment === 'Negative' ? 'Negatief' : 'Neutraal'}
                                                </span>
                                              </div>
                                              <h6 className="text-[13px] font-bold text-white mb-2">{news.title}</h6>
                                              <p className="text-[11px] text-brand-muted italic leading-relaxed">
                                                <span className="text-brand-dim not-italic">Impact:</span> {news.impact}
                                              </p>
                                            </div>
                                          ))}
                                        </div>
                                      </section>
                                    </div>

                                    <div className="col-span-4 space-y-6">
                                      <div className="p-6 bg-brand-section border border-brand-border rounded-2xl flex flex-col items-center text-center shadow-lg">
                                        <span className="text-[9px] text-brand-dim uppercase tracking-widest mb-4 font-bold">Sentimentscore</span>
                                        <div className="relative w-24 h-24 flex items-center justify-center">
                                          <svg className="w-full h-full -rotate-90">
                                            <circle cx="48" cy="48" r="44" fill="none" stroke="currentColor" strokeWidth="6" className="text-brand-border" />
                                            <circle 
                                              cx="48" 
                                              cy="48" 
                                              r="44" 
                                              fill="none" 
                                              stroke="currentColor" 
                                              strokeWidth="6" 
                                              strokeDasharray={`${((currentSentiment.score + 100) / 200) * 276} 276`} 
                                              className={`${currentSentiment.score > 0 ? 'text-emerald-500' : 'text-rose-500'} transition-all duration-1000 ease-out`} 
                                            />
                                          </svg>
                                          <span className="absolute text-2xl font-mono text-white font-bold">{currentSentiment.score}</span>
                                        </div>
                                        <span className={`text-[11px] mt-4 font-bold uppercase tracking-widest ${
                                          currentSentiment.score > 20 ? 'text-emerald-400' :
                                          currentSentiment.score < -20 ? 'text-rose-400' :
                                          'text-zinc-400'
                                        }`}>
                                          {currentSentiment.label}
                                        </span>
                                      </div>

                                      <div className="p-6 bg-brand-section border border-brand-border rounded-2xl">
                                        <span className="text-[9px] text-brand-dim uppercase tracking-widest mb-4 block font-bold">Social Media Dynamiek</span>
                                        <div className="space-y-4">
                                          {currentSentiment.socialMediaBuzz.map((buzz, i) => (
                                            <div key={i} className="flex flex-col gap-1">
                                              <div className="flex justify-between items-center text-[10px]">
                                                <span className="text-brand-muted font-bold uppercase">{buzz.platform}</span>
                                                <span className={`font-mono ${
                                                  buzz.trend === 'Rising' ? 'text-emerald-400' :
                                                  buzz.trend === 'Falling' ? 'text-rose-400' :
                                                  'text-zinc-400'
                                                }`}>
                                                  {buzz.trend === 'Rising' ? '↑' : buzz.trend === 'Falling' ? '↓' : '→'}
                                                </span>
                                              </div>
                                              <div className="h-1 bg-brand-border rounded-full overflow-hidden">
                                                <div className="h-full bg-emerald-500/30 w-full" />
                                              </div>
                                              <span className="text-[9px] text-brand-dim uppercase tracking-tighter self-end">{buzz.volume} Vermeldingen</span>
                                            </div>
                                          ))}
                                        </div>
                                      </div>

                                      <div className="p-6 bg-brand-section border border-brand-border rounded-2xl">
                                        <span className="text-[9px] text-brand-dim uppercase tracking-widest mb-3 block font-bold"> Laatste Update</span>
                                        <span className="text-xs text-white font-mono">{new Date(currentSentiment.lastUpdated).toLocaleTimeString()}</span>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  <div className="p-4 flex justify-center">
                                    <span className="text-[9px] font-mono text-brand-dim uppercase tracking-[0.3em]">Sentiment Node: {currentSentiment.lastUpdated}</span>
                                  </div>
                                </motion.div>
                              ) : !isSentimentScanning ? (
                                <motion.div 
                                  key="sentiment-placeholder"
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  className="py-20 flex flex-col items-center justify-center text-center gap-4 border border-dashed border-brand-border rounded-2xl mt-8"
                                >
                                  <div className="w-16 h-16 rounded-full bg-brand-section flex items-center justify-center border border-brand-border">
                                    <Zap className="w-8 h-8 text-brand-dim" />
                                  </div>
                                  <div>
                                    <h5 className="text-[11px] font-bold uppercase tracking-widest text-brand-muted">Geen Sentiment Analyse</h5>
                                    <p className="text-xs text-brand-dim mt-2">Start een sentiment-analyse via de knop hierboven om data te genereren.</p>
                                  </div>
                                </motion.div>
                              ) : null
                            )}
                          </AnimatePresence>
                        </div>

                        <div className="mt-auto p-6 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                              <Cpu className="w-5 h-5 text-emerald-400" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-white italic">Gereed voor Agent Toewijzing</p>
                              <p className="text-[10px] text-brand-dim">Wijs een specifieke logische agent toe om {selectedCompany.symbol} te monitoren.</p>
                            </div>
                          </div>
                          <button className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-[10px] uppercase tracking-widest rounded-lg transition-colors shadow-lg shadow-emerald-500/20">
                            Bouw Agent
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex-1 flex flex-col items-center justify-center border border-dashed border-brand-border rounded-2xl bg-brand-bg/20 text-center p-12">
                         <div className="w-16 h-16 border border-brand-border rounded-2xl flex items-center justify-center text-brand-dim/50 mb-6 bg-brand-section shadow-inner">
                            <Layout className="w-8 h-8" />
                         </div>
                         <h3 className="text-lg font-serif italic text-brand-muted">Selecteer een bedrijf om te analyseren</h3>
                         <p className="text-[11px] text-brand-dim max-w-xs mt-3 leading-relaxed underline underline-offset-4 decoration-brand-border decoration-dashed">
                           Kies een instrument uit de Euronext Amsterdam lijst om diepgaande data-analyse en agent-configuratie te starten.
                         </p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.section>
            )}
          </AnimatePresence>
        </div>

        {/* Right Panel: Agent Triggers Preview */}
        <aside className="w-80 flex flex-col gap-6 flex-shrink-0">
          <div className="h-[45%] bg-brand-panel border border-brand-border rounded-2xl p-6 flex flex-col">
            <h3 className="text-[11px] uppercase tracking-[0.2em] text-brand-muted mb-6 font-bold flex justify-between items-center">
              Agent Protocol & Configuratie
              <div className={`w-1.5 h-1.5 rounded-full animate-pulse shadow-[0_0_8px] ${isConnected ? 'bg-emerald-500 shadow-emerald-500/40' : 'bg-rose-500 shadow-rose-500/40'}`} />
            </h3>

            <div className="mb-6 space-y-4">
              <div className="flex bg-brand-bg p-1 rounded-lg border border-brand-border">
                <button 
                  onClick={() => handleSourceChange('simulated')}
                  className={`flex-1 py-1.5 text-[10px] uppercase tracking-widest font-bold rounded transition-all ${dataSource === 'simulated' ? 'bg-brand-section text-white' : 'text-brand-dim hover:text-brand-muted'}`}
                >
                  Simuleer
                </button>
                <button 
                  onClick={() => handleSourceChange('ibkr')}
                  className={`flex-1 py-1.5 text-[10px] uppercase tracking-widest font-bold rounded transition-all ${dataSource === 'ibkr' ? 'bg-brand-section text-white' : 'text-brand-dim hover:text-brand-muted'}`}
                >
                  IBKR TWS
                </button>
              </div>
              
              {dataSource === 'ibkr' && (
                <div className="space-y-3">
                  <div className="space-y-1">
                    <span className="text-[9px] text-brand-dim uppercase tracking-widest mb-1 block italic font-mono">TWS Bridge Endpoint</span>
                    <div className="relative">
                      <Link className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-brand-dim" />
                      <input 
                        type="text" 
                        value={ibkrUrl}
                        onChange={(e) => {
                          setIbkrUrl(e.target.value);
                          StockService.setSource('ibkr', e.target.value);
                        }}
                        placeholder="http://localhost:8080" 
                        className="w-full bg-brand-bg border border-brand-border py-2 pl-8 pr-3 rounded text-[11px] font-mono focus:outline-none focus:border-emerald-500/50 transition-all text-emerald-400 placeholder:text-brand-dim/50"
                      />
                    </div>
                  </div>

                  {errorMessage && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg"
                    >
                      <div className="flex items-center gap-2 text-rose-400 mb-1">
                        <Zap className="w-3 h-3" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Connection Error</span>
                      </div>
                      <p className="text-[10px] text-rose-300 leading-tight italic">
                        {errorMessage}. Controleer of je TWS Bridge (bijv. Node-IBKR) draait en CORS toestaat.
                      </p>
                    </motion.div>
                  )}

                  {!errorMessage && isConnected && (
                    <div className="p-3 bg-brand-bg border border-brand-border rounded-lg text-[10px] text-brand-muted leading-tight">
                      <span className="text-emerald-500 font-bold block mb-1">Protocol: READY</span>
                      Gebruik een tunnel (ngrok) of lokale proxy voor directe TWS toegang vanuit de cloud.
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <AnimatePresence mode="wait">
              {selectedStock ? (
                <motion.div 
                  key="detail"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6 flex-1 flex flex-col"
                >
                   <div className="flex justify-between items-start">
                     <div>
                       <span className="text-[10px] text-brand-dim uppercase block mb-1">Geïnspecteerde Identiteit</span>
                       <h4 className="text-lg font-serif italic text-white">{selectedStock.name}</h4>
                     </div>
                     <div className={`text-right font-mono text-sm ${selectedStock.change >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {selectedStock.changePercent}%
                     </div>
                   </div>

                   <div className="grid grid-cols-2 gap-2">
                     <div className="p-3 bg-brand-section border border-brand-border rounded-lg">
                       <span className="text-[9px] text-brand-dim uppercase block mb-1">Hoogste</span>
                       <span className="text-xs font-mono">€{selectedStock.high}</span>
                     </div>
                     <div className="p-3 bg-brand-section border border-brand-border rounded-xl">
                       <span className="text-[9px] text-brand-dim uppercase block mb-1">Laagste</span>
                       <span className="text-xs font-mono">€{selectedStock.low}</span>
                     </div>
                   </div>

                   <div className="mt-auto pt-4 border-t border-brand-border space-y-3">
                     <p className="text-[9px] text-brand-dim uppercase tracking-wider font-bold">Heuristische Controle</p>
                     <button className="w-full py-3 bg-brand-section hover:bg-brand-border border border-brand-border text-[10px] font-bold tracking-widest uppercase rounded-lg transition-colors flex items-center justify-center gap-2">
                       <Cpu className="w-3 h-3" />
                       Agent Toewijzen
                     </button>
                   </div>
                </motion.div>
              ) : (
                <motion.div 
                  key="idle"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-4 flex-1 flex flex-col justify-center"
                >
                  <div className="flex items-center gap-4 text-brand-dim">
                    <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></div>
                    <span className="text-[11px] font-mono">Heuristische Engine Stand-by...</span>
                  </div>
                  <div className="h-[1px] w-full bg-brand-border"></div>
                  <div className="flex flex-col gap-2">
                    <span className="text-[10px] text-brand-dim uppercase tracking-wider">Actieve Triggers</span>
                    <div className="p-3 bg-brand-bg border border-brand-border rounded flex justify-between">
                      <span className="text-[11px] font-mono text-brand-muted italic">VOL_SPIKE_AEX</span>
                      <span className="text-[10px] text-brand-dim uppercase">Stand-by</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex-1 bg-gradient-to-br from-brand-section to-brand-panel border border-brand-border rounded-2xl p-8 flex flex-col justify-end group shadow-inner">
            <div className="mb-auto">
              <div className="w-12 h-12 border border-brand-border rounded-xl mb-6 flex items-center justify-center text-emerald-400/50 group-hover:text-emerald-400 group-hover:border-emerald-500/30 transition-all">
                 <Activity className="w-6 h-6" />
              </div>
              <h4 className="text-2xl font-serif italic text-white leading-tight">Modulaire Evolutie</h4>
              <p className="text-xs text-brand-muted mt-3 leading-relaxed">
                Platformarchitectuur maakt real-time heuristische triggers en autonome analyse-agenten mogelijk.
              </p>
            </div>
            <button className="w-full py-4 bg-brand-border hover:bg-zinc-800 text-xs font-bold tracking-[0.2em] uppercase rounded-xl transition-all border border-transparent hover:border-brand-muted">
              Configureer Node
            </button>
          </div>
        </aside>
      </main>

      {/* Footer Bar */}
      <footer className="h-10 bg-brand-section border-t border-brand-border px-8 flex items-center justify-between text-[10px] font-mono text-brand-dim z-50">
        <div className="flex gap-8">
          <div className="flex items-center gap-2">
            <span className="text-brand-muted">SYSTEEMSTATUS:</span>
            <span className="text-emerald-500 font-bold uppercase">Operationeel</span>
          </div>
          <div>NETWERKVERTRAGING: <span className="text-brand-muted font-bold">14ms</span></div>
          <div>CORE CLUSTER: <span className="text-brand-muted font-bold">AMS-01-TER</span></div>
        </div>
        <div className="uppercase tracking-widest text-[9px] font-bold text-brand-muted/50">&copy; 2026 NEURON SCALABLE SYSTEMS</div>
      </footer>
    </div>
  );
}
