import React, { useState } from 'react';
import { Bot, Send, Sparkles, TrendingUp, AlertTriangle, PieChart, BarChart2 } from 'lucide-react';
import { AIChatMessage } from '../types';
import { apiFetch } from '../api/client';

export const AIInsightsPage: React.FC = () => {
  const [messages, setMessages] = useState<AIChatMessage[]>([
    {
      id: 'msg-init',
      sender: 'assistant',
      text: "👋 Hello! I am your **AI Business Assistant**. I actively monitor your POS sales, inventory stock levels, register shifts, and profit margins.\n\nClick any prompt chip below or type a query!",
      timestamp: 'Just now',
      metricsData: [
        { label: 'Catalog Health', value: '100%', change: 'Normal', trend: 'up' },
        { label: 'Low Stock Alerts', value: '1 Alert', change: 'Whole Wheat Bread', trend: 'down' }
      ]
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async (promptQuery?: string) => {
    const textToSend = promptQuery || inputText;
    if (!textToSend.trim()) return;

    const userMsg: AIChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!promptQuery) setInputText('');
    setLoading(true);

    try {
      const response = await apiFetch<AIChatMessage>('/ai/query', {
        method: 'POST',
        body: JSON.stringify({ prompt: textToSend })
      });

      setMessages((prev) => [...prev, response]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'assistant',
          text: `Sorry, I encountered an issue retrieving insights: ${err.message}`,
          timestamp: 'Just now'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, height: 'calc(100vh - 120px)' }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>AI Business Intelligence Assistant</h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: 4 }}>
          Real-time conversational analytics powered by live POS sales, inventory movements, and financial ledgers.
        </p>
      </div>

      {/* Action Chips */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <button onClick={() => handleSend('Top 3 selling items today?')} className="btn btn-secondary btn-sm">
          <TrendingUp size={14} color="var(--accent)" /> Top 3 selling items today?
        </button>
        <button onClick={() => handleSend('Low stock inventory alert?')} className="btn btn-secondary btn-sm">
          <AlertTriangle size={14} color="#f59e0b" /> Low stock inventory alert?
        </button>
        <button onClick={() => handleSend('Weekly profit margin summary?')} className="btn btn-secondary btn-sm">
          <PieChart size={14} color="#10b981" /> Weekly profit margin summary?
        </button>
      </div>

      {/* Chat Messages Log */}
      <div className="glass-panel" style={{ flex: 1, padding: 20, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {messages.map((m) => (
          <div
            key={m.id}
            style={{
              display: 'flex',
              gap: 12,
              alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start',
              maxWidth: '80%'
            }}
          >
            {m.sender === 'assistant' && (
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff' }}>
                <Bot size={20} />
              </div>
            )}

            <div
              className="glass-card"
              style={{
                padding: 16,
                background: m.sender === 'user' ? 'rgba(59, 130, 246, 0.2)' : 'var(--bg-card)',
                borderColor: m.sender === 'user' ? 'rgba(59, 130, 246, 0.4)' : 'var(--border-color)'
              }}
            >
              <div style={{ fontSize: '0.92rem', lineHeight: '1.5', whiteSpace: 'pre-line' }}>{m.text}</div>

              {/* Render Metrics Cards */}
              {m.metricsData && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10, marginTop: 14 }}>
                  {m.metricsData.map((card, idx) => (
                    <div key={idx} style={{ background: 'rgba(15, 23, 42, 0.6)', padding: 10, borderRadius: 8, border: '1px solid var(--border-color)' }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{card.label}</div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: 2 }}>{card.value}</div>
                      {card.change && <div style={{ fontSize: '0.7rem', color: card.trend === 'up' ? '#34d399' : '#f87171', marginTop: 2 }}>{card.change}</div>}
                    </div>
                  ))}
                </div>
              )}

              {/* Render Chart Representation */}
              {m.chartData && (() => {
                const chart = m.chartData;
                const maxVal = Math.max(...chart.values, 1);
                return (
                  <div style={{ marginTop: 14, background: 'rgba(15, 23, 42, 0.6)', padding: 12, borderRadius: 10, border: '1px solid var(--border-color)' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <BarChart2 size={16} /> {chart.title}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, height: 80, paddingTop: 10 }}>
                      {chart.labels.map((lbl: string, i: number) => {
                        const val = chart.values[i];
                        const pct = Math.round((val / maxVal) * 100);
                        return (
                          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                            <div style={{ width: '100%', height: `${pct}%`, background: 'linear-gradient(180deg, #06b6d4 0%, #3b82f6 100%)', borderRadius: '4px 4px 0 0' }} />
                            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: 4 }}>{lbl}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}

              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 8, textAlign: 'right' }}>{m.timestamp}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Input Box */}
      <div style={{ display: 'flex', gap: 10 }}>
        <input
          type="text"
          placeholder="Ask AI Assistant about stock, sales performance, or profit margins..."
          className="input-field"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
        />
        <button disabled={loading} onClick={() => handleSend()} className="btn btn-accent">
          <Send size={18} /> {loading ? 'Analyzing...' : 'Send'}
        </button>
      </div>

    </div>
  );
};
