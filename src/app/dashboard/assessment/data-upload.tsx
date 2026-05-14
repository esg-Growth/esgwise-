'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useI18n } from '@/lib/i18n';
import { DATA_SOURCES, DataSource } from '@/lib/data-sources';
import { ExtractedKpi } from '@/lib/extraction-engine';
import { Upload, FileUp, CheckCircle, AlertTriangle, Clock, X, Sparkles, FileText, Eye, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import styles from './upload.module.css';

interface Props {
  assessmentId: string;
  responses: Record<string, string>;
  onKpisAccepted: (newResponses: Record<string, string>) => void;
}

interface UploadedDoc {
  id: string;
  category: string;
  original_name: string;
  status: string;
  extraction_result?: string;
  raw_summary?: string;
  raw_summary_ar?: string;
  created_at: string;
}

export function DataUploadPanel({ assessmentId, responses, onKpisAccepted }: Props) {
  const { locale } = useI18n();
  const isAr = locale === 'ar';

  const [documents, setDocuments] = useState<UploadedDoc[]>([]);
  const [uploading, setUploading] = useState<string | null>(null);
  const [extracting, setExtracting] = useState<string | null>(null);
  const [reviewDoc, setReviewDoc] = useState<UploadedDoc | null>(null);
  const [dragOver, setDragOver] = useState<string | null>(null);

  // Load existing documents
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/upload');
        const data = await res.json();
        setDocuments(data.documents || []);
      } catch {}
    })();
  }, []);

  const handleUpload = async (files: File[], category: string) => {
    setUploading(category);
    try {
      const formData = new FormData();
      files.forEach(file => formData.append('files', file));
      formData.append('category', category);
      formData.append('assessmentId', assessmentId);

      const uploadRes = await fetch('/api/upload', { method: 'POST', body: formData });
      const uploadData = await uploadRes.json();
      if (!uploadRes.ok) throw new Error(uploadData.error);

      // Refresh docs list
      const newDocs: UploadedDoc[] = uploadData.documents.map((d: any) => ({
        id: d.documentId,
        category,
        original_name: d.filename,
        status: 'pending',
        created_at: new Date().toISOString()
      }));
      setDocuments(prev => [...newDocs, ...prev]);
      setUploading(null);

      // Start extraction for all files
      for (const newDoc of newDocs) {
        setExtracting(newDoc.id);
        const extractRes = await fetch('/api/extract', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ documentId: newDoc.id }),
        });
        const extractData = await extractRes.json();

        if (extractRes.ok && extractData.result) {
          setDocuments(prev => prev.map(d => d.id === newDoc.id ? {
            ...d,
            status: 'completed',
            extraction_result: JSON.stringify(extractData.result),
            raw_summary: extractData.result.summary,
            raw_summary_ar: extractData.result.summary_ar,
          } : d));

          // Auto-open review for the last document if multiple, or just the one
          if (newDoc === newDocs[newDocs.length - 1]) {
            setReviewDoc({
              ...newDoc,
              status: 'completed',
              extraction_result: JSON.stringify(extractData.result),
              raw_summary: extractData.result.summary,
              raw_summary_ar: extractData.result.summary_ar,
            });
          }
        } else {
          setDocuments(prev => prev.map(d => d.id === newDoc.id ? { ...d, status: 'failed' } : d));
        }
      }
    } catch (err: any) {
      console.error(err);
    }
    setUploading(null);
    setExtracting(null);
  };

  const handleDrop = (e: React.DragEvent, category: string) => {
    e.preventDefault();
    setDragOver(null);
    const files = Array.from(e.dataTransfer.files || []);
    if (files.length > 0) handleUpload(files, category);
  };

  const handleAcceptAll = async (doc: UploadedDoc) => {
    if (!doc.extraction_result) return;
    const result = JSON.parse(doc.extraction_result);
    const kpis = result.extractedKpis || [];

    const actions = kpis.filter((k: ExtractedKpi) => k.questionId).map((k: ExtractedKpi) => ({
      provenanceId: null,
      questionId: k.questionId,
      value: k.value,
      action: 'accept',
    }));

    await fetch('/api/extract/accept', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ assessmentId, actions }),
    });

    const newResponses: Record<string, string> = {};
    kpis.forEach((k: ExtractedKpi) => { if (k.questionId) newResponses[k.questionId] = k.value; });
    onKpisAccepted(newResponses);
    setReviewDoc(null);
  };

  const handleAcceptSelected = async (kpis: { questionId: string; value: string; accepted: boolean }[]) => {
    const accepted = kpis.filter(k => k.accepted);
    if (accepted.length === 0) return;

    const actions = accepted.map(k => ({
      provenanceId: null,
      questionId: k.questionId,
      value: k.value,
      action: 'accept' as const,
    }));

    await fetch('/api/extract/accept', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ assessmentId, actions }),
    });

    const newResponses: Record<string, string> = {};
    accepted.forEach(k => { newResponses[k.questionId] = k.value; });
    onKpisAccepted(newResponses);
    setReviewDoc(null);
  };

  const getDocsForCategory = (cat: string) => documents.filter(d => d.category === cat);

  return (
    <div className={styles.uploadPanel}>
      {/* Intro Banner */}
      <div className={styles.introBanner}>
        <Sparkles size={20} />
        <div>
          <strong>{isAr ? 'ارفع بياناتك، نحن نتكفل بالباقي' : 'Upload your data, we handle the rest'}</strong>
          <p>{isAr
            ? 'ارفع فواتيرك وملفات الموظفين وتقاريرك — الذكاء الاصطناعي سيستخرج مؤشرات ESG تلقائياً'
            : 'Upload your invoices, employee files, and reports — AI will extract ESG indicators automatically'}</p>
        </div>
      </div>

      {/* Category Cards */}
      <div className={styles.categoryGrid}>
        {DATA_SOURCES.map(source => {
          const catDocs = getDocsForCategory(source.id);
          const isUploading = uploading === source.id;
          const hasCompleted = catDocs.some(d => d.status === 'completed');
          const isExtracting = catDocs.some(d => extracting === d.id);

          return (
            <div key={source.id} className={`${styles.categoryCard} ${hasCompleted ? styles.categoryDone : ''} ${dragOver === source.id ? styles.categoryDragOver : ''}`}
              onDragOver={e => { e.preventDefault(); setDragOver(source.id); }}
              onDragLeave={() => setDragOver(null)}
              onDrop={e => handleDrop(e, source.id)}>

              <div className={styles.categoryHeader}>
                <span className={styles.categoryIcon}>{source.icon}</span>
                <div className={styles.categoryInfo}>
                  <h3>{isAr ? source.title_ar : source.title}</h3>
                  <p>{isAr ? source.description_ar : source.description}</p>
                </div>
                {hasCompleted && <CheckCircle size={20} className={styles.checkIcon} />}
              </div>

              {/* Drop Zone */}
              <div className={styles.dropZone}>
                {isUploading || isExtracting ? (
                  <div className={styles.processing}>
                    <Loader2 size={24} className={styles.spinIcon} />
                    <span>{isExtracting ? (isAr ? 'الذكاء الاصطناعي يحلل البيانات...' : 'AI is analyzing your data...') : (isAr ? 'جاري الرفع...' : 'Uploading...')}</span>
                  </div>
                ) : (
                  <>
                    <FileUp size={20} />
                    <span>{isAr ? 'اسحب الملف هنا أو' : 'Drag files here or'}</span>
                    <label className={styles.browseBtn}>
                      {isAr ? 'تصفح' : 'Browse'}
                      <input type="file" hidden multiple accept={source.acceptedFormats.join(',')} onChange={e => { const files = Array.from(e.target.files || []); if (files.length > 0) handleUpload(files, source.id); e.target.value = ''; }} />
                    </label>
                  </>
                )}
              </div>

              {/* Accepted formats */}
              <div className={styles.formatsHint}>
                {source.acceptedFormats.map(f => <span key={f} className={styles.formatTag}>{f}</span>)}
              </div>

              {/* Uploaded files list */}
              {catDocs.length > 0 && (
                <div className={styles.docList}>
                  {catDocs.map(doc => (
                    <div key={doc.id} className={styles.docItem}>
                      <FileText size={14} />
                      <span className={styles.docName}>{doc.original_name}</span>
                      <span className={`${styles.docStatus} ${styles[`status_${doc.status}`]}`}>
                        {doc.status === 'completed' ? <CheckCircle size={12} /> : doc.status === 'processing' ? <Loader2 size={12} className={styles.spinIcon} /> : doc.status === 'failed' ? <AlertTriangle size={12} /> : <Clock size={12} />}
                        {doc.status}
                      </span>
                      {doc.status === 'completed' && (
                        <button className={styles.reviewBtn} onClick={() => setReviewDoc(doc)}>
                          <Eye size={12} /> {isAr ? 'مراجعة' : 'Review'}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Example hint */}
              <div className={styles.exampleHint}>
                💡 {isAr ? source.exampleFiles_ar : source.exampleFiles}
              </div>
            </div>
          );
        })}
      </div>

      {/* Review Modal */}
      {reviewDoc && <ExtractionReviewModal doc={reviewDoc} responses={responses} onClose={() => setReviewDoc(null)} onAcceptAll={() => handleAcceptAll(reviewDoc)} onAcceptSelected={handleAcceptSelected} isAr={isAr} />}
    </div>
  );
}

// ─── Extraction Review Modal ───

function ExtractionReviewModal({ doc, responses, onClose, onAcceptAll, onAcceptSelected, isAr }: {
  doc: UploadedDoc;
  responses: Record<string, string>;
  onClose: () => void;
  onAcceptAll: () => void;
  onAcceptSelected: (kpis: { questionId: string; value: string; accepted: boolean }[]) => void;
  isAr: boolean;
}) {
  const result = doc.extraction_result ? JSON.parse(doc.extraction_result) : null;
  const kpis = result?.extractedKpis || [];

  const [selections, setSelections] = useState<Record<string, boolean>>(() => {
    const s: Record<string, boolean> = {};
    kpis.forEach((k: ExtractedKpi) => { if (k.questionId) s[k.questionId] = true; });
    return s;
  });

  const [editValues, setEditValues] = useState<Record<string, string>>(() => {
    const v: Record<string, string> = {};
    kpis.forEach((k: ExtractedKpi) => { if (k.questionId) v[k.questionId] = k.value; });
    return v;
  });

  const handleSubmit = () => {
    const items = kpis
      .filter((k: ExtractedKpi) => k.questionId)
      .map((k: ExtractedKpi) => ({
        questionId: k.questionId,
        value: editValues[k.questionId] ?? k.value,
        accepted: selections[k.questionId] ?? false,
      }));
    onAcceptSelected(items);
  };

  const acceptedCount = Object.values(selections).filter(Boolean).length;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <div>
            <h2><Sparkles size={20} /> {isAr ? 'نتائج الاستخراج بالذكاء الاصطناعي' : 'AI Extraction Results'}</h2>
            <p className="text-secondary">{doc.original_name}</p>
          </div>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={18} /></button>
        </div>

        {/* Summary */}
        <div className={styles.summaryBanner}>
          <p>{isAr ? doc.raw_summary_ar : doc.raw_summary}</p>
        </div>

        {/* KPI List */}
        <div className={styles.kpiList}>
          {kpis.length === 0 ? (
            <div className={styles.noKpis}>
              <AlertTriangle size={24} />
              <p>{isAr ? 'لم يتم استخراج مؤشرات' : 'No KPIs could be extracted from this document'}</p>
            </div>
          ) : (
            kpis.map((kpi: ExtractedKpi, i: number) => {
              if (!kpi.questionId) return null;
              const isSelected = selections[kpi.questionId] ?? true;
              const existingVal = responses[kpi.questionId];
              const isLowConfidence = kpi.confidence < 0.8;
              const confidenceColor = kpi.confidence >= 0.8 ? 'var(--color-success)' : kpi.confidence >= 0.5 ? 'var(--color-warning)' : 'var(--color-danger)';

              return (
                <div key={i} className={`${styles.kpiItem} ${isSelected ? '' : styles.kpiItemDeselected} ${isLowConfidence ? styles.lowConfidence : ''}`}>
                  <div className={styles.kpiCheckbox}>
                    <input type="checkbox" checked={isSelected} onChange={e => setSelections(prev => ({ ...prev, [kpi.questionId]: e.target.checked }))} />
                  </div>

                  <div className={styles.kpiContent}>
                    <div className={styles.kpiLabel}>
                      {kpi.label}
                      {isLowConfidence && <span title={isAr ? 'يتطلب المراجعة البشرية' : 'Requires human review'}><AlertTriangle size={14} style={{ color: 'var(--color-warning)', display: 'inline-block', marginInlineStart: 6, verticalAlign: 'middle' }} /></span>}
                    </div>
                    <div className={styles.kpiMeta}>
                      <span className={styles.kpiQuestionId}>{kpi.questionId}</span>
                      <span className={styles.confidenceBadge} style={{ background: `${confidenceColor}15`, color: confidenceColor }}>
                        {Math.round(kpi.confidence * 100)}% {isAr ? 'ثقة' : 'confidence'}
                      </span>
                      {existingVal && <span className={styles.overwriteWarn}>⚠️ {isAr ? 'سيحل محل' : 'Will overwrite'}: {existingVal}</span>}
                    </div>
                    {kpi.evidence && <div className={styles.evidence}>📄 "{kpi.evidence}"</div>}
                  </div>

                  <div className={styles.kpiValue}>
                    <input type="text" className="form-input" value={editValues[kpi.questionId] ?? kpi.value} onChange={e => setEditValues(prev => ({ ...prev, [kpi.questionId]: e.target.value }))} style={{ width: 120, textAlign: 'center' }} />
                    {kpi.unit && <span className={styles.kpiUnit}>{kpi.unit}</span>}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Actions */}
        <div className={styles.modalFooter}>
          <button className="btn btn-secondary" onClick={onClose}>{isAr ? 'إلغاء' : 'Cancel'}</button>
          <div className={styles.acceptActions}>
            <button className="btn btn-primary" onClick={handleSubmit} disabled={acceptedCount === 0}>
              <CheckCircle size={16} />
              {isAr ? `قبول ${acceptedCount} مؤشر` : `Accept ${acceptedCount} KPIs`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
