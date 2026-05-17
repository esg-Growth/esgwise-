'use client';

import Link from 'next/link';
import { useI18n } from '@/lib/i18n';
import { Session } from '@/lib/session';
import { motion } from 'framer-motion';
import {
  Users, TrendingUp, Building2, Target, ArrowRight,
  Award, CheckCircle
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import styles from './dashboard.module.css';

interface Props {
  session: Session;
  clients: any[];
}

export function ReporterAnalytics({ session, clients }: Props) {
  const { locale } = useI18n();
  const isAr = locale === 'ar';

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } }
  };

  // Calculate aggregates
  const totalClients = clients.length;
  const scoredClients = clients.filter(c => c.score?.overall_score != null);
  const averageScore = scoredClients.length > 0
    ? Math.round(scoredClients.reduce((acc, c) => acc + (c.score?.overall_score || 0), 0) / scoredClients.length)
    : 0;

  const assessmentsInProgress = clients.filter(c => c.assessment?.status === 'in_progress' || c.assessment?.status === 'draft').length;
  const assessmentsCompleted = clients.filter(c => c.assessment?.status === 'completed' || c.assessment?.status === 'certified').length;

  // Chart data
  const chartData = scoredClients.map(c => ({
    name: c.name,
    Score: c.score?.overall_score || 0
  })).sort((a, b) => b.Score - a.Score).slice(0, 5); // Top 5 clients

  return (
    <motion.div 
      className={styles.dashboard}
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      <motion.div variants={itemVariants} className={styles.welcome}>
        <div>
          <h1>{isAr ? `مرحباً، ${session.name}` : `Welcome, ${session.name}`} 👋</h1>
          <p className="text-secondary">
            {isAr ? 'نظرة عامة على محفظة عملائك' : 'Your Client Portfolio Overview'}
          </p>
        </div>
        <Link href="/dashboard/clients" className="btn btn-primary">
          <Users size={20} />
          {isAr ? 'إدارة العملاء' : 'Manage Clients'}
        </Link>
      </motion.div>

      <motion.div variants={itemVariants} className={styles.statsGrid}>
        <div className={`card ${styles.statCard} ${styles.statOverall}`}>
          <div className={styles.statIcon}><Building2 size={24} /></div>
          <div className={styles.statLabel}>{isAr ? 'إجمالي العملاء' : 'Total Clients'}</div>
          <div className={styles.statValue}>{totalClients}</div>
        </div>
        <div className={`card ${styles.statCard} ${styles.statEnv}`}>
          <div className={styles.statIcon}><TrendingUp size={24} /></div>
          <div className={styles.statLabel}>{isAr ? 'متوسط درجة ESG' : 'Average ESG Score'}</div>
          <div className={styles.statValue}>{averageScore ? `${averageScore}%` : '—'}</div>
        </div>
        <div className={`card ${styles.statCard} ${styles.statGov}`}>
          <div className={styles.statIcon}><CheckCircle size={24} /></div>
          <div className={styles.statLabel}>{isAr ? 'تقييمات مكتملة' : 'Completed Assessments'}</div>
          <div className={styles.statValue}>{assessmentsCompleted}</div>
        </div>
        <div className={`card ${styles.statCard} ${styles.statSoc}`}>
          <div className={styles.statIcon}><Target size={24} /></div>
          <div className={styles.statLabel}>{isAr ? 'تقييمات قيد التنفيذ' : 'Assessments in Progress'}</div>
          <div className={styles.statValue}>{assessmentsInProgress}</div>
        </div>
      </motion.div>

      {chartData.length > 0 && (
        <motion.div variants={itemVariants} className="card" style={{ marginTop: '2rem' }}>
          <div className="card-header">
            <h3 className="card-title">{isAr ? 'أفضل العملاء أداءً' : 'Top Performing Clients'}</h3>
          </div>
          <div style={{ width: '100%', height: 300, marginTop: '1.5rem' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis dataKey="name" stroke="var(--color-text-muted)" />
                <YAxis stroke="var(--color-text-muted)" />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '8px' }}
                  itemStyle={{ color: 'var(--color-text)' }}
                />
                <Bar dataKey="Score" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      )}

      <motion.h2 variants={itemVariants} className={styles.sectionTitle} style={{ marginTop: '2.5rem' }}>
        {isAr ? 'ملخص العملاء' : 'Client Summary'}
      </motion.h2>

      <motion.div variants={itemVariants} className={styles.actionsGrid}>
        {clients.slice(0, 6).map((client) => {
          const progress = client.assessment?.progress || 0;
          const status = client.assessment?.status || 'not_started';
          
          return (
            <div key={client.id} className={`card ${styles.actionCard}`}>
              <div>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  {client.name}
                  {status === 'certified' && <Award size={16} color="var(--color-accent)" />}
                </h3>
                <p className="text-sm text-secondary mb-3">{client.sector}</p>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                  <span>{isAr ? 'التقدم' : 'Progress'}</span>
                  <span>{progress}%</span>
                </div>
                <div className="progress-bar mb-3">
                  <div className="progress-fill" style={{ width: `${progress}%`, background: 'var(--color-primary)' }} />
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className={`badge ${status === 'completed' || status === 'certified' ? 'badge-success' : 'badge-neutral'}`}>
                    {status.replace('_', ' ')}
                  </span>
                  {client.score?.overall_score && (
                    <span style={{ fontWeight: 'bold', color: 'var(--color-success)' }}>
                      {client.score.overall_score}%
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </motion.div>
      
      {clients.length > 6 && (
        <motion.div variants={itemVariants} style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <Link href="/dashboard/clients" className="btn btn-ghost">
            {isAr ? 'عرض كل العملاء' : 'View All Clients'} <ArrowRight size={16} />
          </Link>
        </motion.div>
      )}
    </motion.div>
  );
}
