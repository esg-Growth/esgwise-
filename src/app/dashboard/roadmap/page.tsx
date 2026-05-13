'use client';

import { useState, useEffect } from 'react';
import { useI18n } from '@/lib/i18n';
import { Map, Calendar, ArrowRight, CheckCircle, Clock, Target, RefreshCw, AlertCircle } from 'lucide-react';
import { ScoreBreakdown } from '@/lib/esg-scoring';
import styles from './roadmap.module.css';

interface RoadmapItem {
  id: string;
  pillar: string;
  title: string;
  title_ar: string;
  description: string;
  description_ar: string;
  impact: 'high' | 'medium' | 'low';
  effort: 'high' | 'medium' | 'low';
  timeframe: string;
  status: 'todo' | 'in_progress' | 'done';
}

export default function RoadmapPage() {
  const { locale } = useI18n();
  const isAr = locale === 'ar';
  
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<RoadmapItem[]>([]);
  const [score, setScore] = useState<ScoreBreakdown | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/analysis', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'calculate' }) });
        const data = await res.json();
        
        if (data.score) {
          setScore(data.score);
          generateRoadmap(data.score);
        }
      } catch (e) { console.error(e); }
      setLoading(false);
    })();
  }, []);

  // For MVP, we auto-generate roadmap items based on the AI's identified weaknesses
  const generateRoadmap = (scoreData: ScoreBreakdown) => {
    const generatedItems: RoadmapItem[] = scoreData.weaknesses.map((w: any, idx: number) => {
      // Determine impact/effort heuristically based on pillar and type
      let impact: 'high'|'medium'|'low' = 'medium';
      let effort: 'high'|'medium'|'low' = 'medium';
      let timeframe = '3-6 months';
      
      if (w.label.toLowerCase().includes('policy') || w.label.toLowerCase().includes('framework')) {
        effort = 'low'; impact = 'high'; timeframe = '1-3 months';
      } else if (w.label.toLowerCase().includes('energy') || w.label.toLowerCase().includes('emissions')) {
        effort = 'high'; impact = 'high'; timeframe = '6-12 months';
      }

      return {
        id: `rm_${idx}`,
        pillar: w.pillar,
        title: `Improve: ${w.label}`,
        title_ar: `تحسين: ${w.label_ar}`,
        description: `Implement measures to address the gap identified in ${w.label}. This will improve your overall ESG score and compliance with GRI standards.`,
        description_ar: `تنفيذ تدابير لمعالجة الفجوة المحددة في ${w.label_ar}. سيؤدي ذلك إلى تحسين درجة ESG الإجمالية والامتثال لمعايير GRI.`,
        impact,
        effort,
        timeframe,
        status: 'todo'
      };
    });
    
    setItems(generatedItems);
  };

  const handleStatusChange = (id: string, newStatus: RoadmapItem['status']) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, status: newStatus } : item));
    // In a real app, we would persist this to the DB.
  };

  if (loading) return <div className="flex flex-center" style={{ height: '60vh' }}><RefreshCw className="spin" /></div>;

  if (items.length === 0) {
    return (
      <div className={styles.emptyState}>
        <CheckCircle size={48} className="text-success" />
        <h2>{isAr ? 'لا توجد فجوات!' : 'No Gaps Identified!'}</h2>
        <p>{isAr ? 'لم يتم العثور على أي مجالات ضعف في تقييمك.' : 'No areas of weakness were found in your assessment.'}</p>
      </div>
    );
  }

  const getPillarColor = (p: string) => p === 'E' ? 'var(--color-env)' : p === 'S' ? 'var(--color-soc)' : 'var(--color-gov)';
  const getPillarName = (p: string) => {
    if (isAr) return p === 'E' ? 'بيئة' : p === 'S' ? 'مجتمع' : 'حوكمة';
    return p === 'E' ? 'Environmental' : p === 'S' ? 'Social' : 'Governance';
  };

  const completedCount = items.filter(i => i.status === 'done').length;
  const progress = Math.round((completedCount / items.length) * 100) || 0;

  return (
    <div className={styles.roadmapPage}>
      <div className={styles.header}>
        <div>
          <h1>{isAr ? 'خريطة طريق الاستدامة' : 'Sustainability Roadmap'}</h1>
          <p className="text-secondary">{isAr ? 'خطوات عملية مبنية على الفجوات المحددة' : 'Actionable steps based on your identified gaps'}</p>
        </div>
        
        <div className={styles.progressCard}>
          <div className={styles.progressText}>
            <span>{isAr ? 'التقدم الإجمالي' : 'Overall Progress'}</span>
            <strong>{progress}%</strong>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%`, background: 'var(--color-primary)' }} />
          </div>
        </div>
      </div>

      <div className={styles.kanbanBoard}>
        {['todo', 'in_progress', 'done'].map((columnStatus) => (
          <div key={columnStatus} className={styles.kanbanColumn}>
            <div className={styles.columnHeader}>
              <h3>
                {columnStatus === 'todo' && (isAr ? 'للتنفيذ' : 'To Do')}
                {columnStatus === 'in_progress' && (isAr ? 'قيد التنفيذ' : 'In Progress')}
                {columnStatus === 'done' && (isAr ? 'مكتمل' : 'Done')}
              </h3>
              <span className={styles.itemCount}>{items.filter(i => i.status === columnStatus).length}</span>
            </div>

            <div className={styles.columnBody}>
              {items.filter(i => i.status === columnStatus).map(item => (
                <div key={item.id} className={styles.taskCard} style={{ borderTopColor: getPillarColor(item.pillar) }}>
                  <div className={styles.taskPillar} style={{ color: getPillarColor(item.pillar), backgroundColor: `${getPillarColor(item.pillar)}15` }}>
                    {getPillarName(item.pillar)}
                  </div>
                  
                  <h4>{isAr ? item.title_ar : item.title}</h4>
                  <p>{isAr ? item.description_ar : item.description}</p>
                  
                  <div className={styles.taskMeta}>
                    <span className={styles.metaBadge}>
                      <Target size={12} /> {isAr ? 'التأثير:' : 'Impact:'} {item.impact}
                    </span>
                    <span className={styles.metaBadge}>
                      <Clock size={12} /> {item.timeframe}
                    </span>
                  </div>

                  <div className={styles.taskActions}>
                    {columnStatus !== 'todo' && (
                      <button className="btn btn-ghost btn-sm" onClick={() => handleStatusChange(item.id, columnStatus === 'done' ? 'in_progress' : 'todo')}>
                        {isAr ? 'السابق' : 'Prev'}
                      </button>
                    )}
                    <div style={{ flex: 1 }} />
                    {columnStatus !== 'done' && (
                      <button className="btn btn-primary btn-sm" onClick={() => handleStatusChange(item.id, columnStatus === 'todo' ? 'in_progress' : 'done')}>
                        {isAr ? 'التالي' : 'Next'} <ArrowRight size={14} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
