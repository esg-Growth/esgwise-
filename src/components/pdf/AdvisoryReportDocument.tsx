import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image, Svg, Rect, Circle, Line } from '@react-pdf/renderer';

/* ────────────────────────────────────────────────────────────── */
/*  Professional Advisory Report PDF – designed for consultants   */
/*  to send to client companies after ESG assessment.            */
/* ────────────────────────────────────────────────────────────── */

// ─── Color Palette ──────────────────────────────────────────────
const C = {
  primary:  '#0f766e',
  primaryLight: '#ccfbf1',
  env:      '#10b981',
  envBg:    '#ecfdf5',
  soc:      '#3b82f6',
  socBg:    '#eff6ff',
  gov:      '#8b5cf6',
  govBg:    '#f5f3ff',
  accent:   '#0ea5e9',
  danger:   '#ef4444',
  warning:  '#f59e0b',
  success:  '#10b981',
  grey50:   '#f9fafb',
  grey100:  '#f3f4f6',
  grey200:  '#e5e7eb',
  grey400:  '#9ca3af',
  grey600:  '#4b5563',
  grey800:  '#1f2937',
  grey900:  '#111827',
  white:    '#ffffff',
};

function ratingColor(rating: string) {
  if (rating === 'AAA' || rating === 'AA') return C.success;
  if (rating === 'A' || rating === 'BBB') return C.accent;
  if (rating === 'BB' || rating === 'B') return C.warning;
  return C.danger;
}

// ─── Styles ─────────────────────────────────────────────────────
const s = StyleSheet.create({
  page:           { padding: 40, fontSize: 10, fontFamily: 'Helvetica', color: C.grey800 },
  /* Cover */
  coverPage:      { padding: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', backgroundColor: C.grey900 },
  coverTitle:     { fontSize: 36, fontWeight: 'bold', color: C.white, marginBottom: 10, fontFamily: 'Helvetica-Bold' },
  coverSubtitle:  { fontSize: 16, color: C.grey400, marginBottom: 30 },
  coverCompany:   { fontSize: 22, color: C.accent, fontFamily: 'Helvetica-Bold', marginBottom: 8 },
  coverSector:    { fontSize: 14, color: C.grey400, marginBottom: 40 },
  coverDate:      { fontSize: 11, color: C.grey400, position: 'absolute', bottom: 40 },
  coverBrand:     { fontSize: 12, color: C.primary, position: 'absolute', bottom: 60 },
  /* Header */
  header:         { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 2, borderBottomColor: C.primary, paddingBottom: 8, marginBottom: 20 },
  headerTitle:    { fontSize: 14, fontFamily: 'Helvetica-Bold', color: C.primary },
  headerDate:     { fontSize: 9, color: C.grey400 },
  /* Footer */
  footer:         { position: 'absolute', bottom: 20, left: 40, right: 40, flexDirection: 'row', justifyContent: 'space-between', fontSize: 8, color: C.grey400, borderTopWidth: 1, borderTopColor: C.grey200, paddingTop: 6 },
  /* Section headers */
  sectionTitle:   { fontSize: 16, fontFamily: 'Helvetica-Bold', color: C.grey900, marginBottom: 12, marginTop: 6 },
  sectionSub:     { fontSize: 12, fontFamily: 'Helvetica-Bold', color: C.grey800, marginBottom: 8, marginTop: 10 },
  /* Score boxes */
  scoreRow:       { flexDirection: 'row', gap: 10, marginBottom: 16 },
  scoreCard:      { flex: 1, padding: 14, borderRadius: 6, alignItems: 'center', justifyContent: 'center' },
  scoreLabel:     { fontSize: 9, color: C.grey600, marginBottom: 4, textTransform: 'uppercase' as any },
  scoreValue:     { fontSize: 22, fontFamily: 'Helvetica-Bold' },
  scoreUnit:      { fontSize: 10, color: C.grey400 },
  /* Rating badge */
  ratingBadge:    { padding: '8 18', borderRadius: 20, alignSelf: 'center', marginBottom: 12 },
  ratingText:     { fontSize: 18, fontFamily: 'Helvetica-Bold', color: C.white, textAlign: 'center' },
  /* Table */
  tableHead:      { flexDirection: 'row', backgroundColor: C.grey100, borderBottomWidth: 1, borderBottomColor: C.grey200, paddingVertical: 6, paddingHorizontal: 8 },
  tableRow:       { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: C.grey200, paddingVertical: 6, paddingHorizontal: 8 },
  tableCell:      { fontSize: 9 },
  /* Bullet */
  bullet:         { flexDirection: 'row', marginBottom: 5, paddingLeft: 4 },
  bulletDot:      { width: 6, fontSize: 10, color: C.primary },
  bulletText:     { flex: 1, fontSize: 10, color: C.grey800, lineHeight: 1.5 },
  /* Advisory card */
  advisoryCard:   { padding: 14, borderWidth: 1, borderRadius: 6, marginBottom: 10, borderLeftWidth: 4 },
  advisoryTitle:  { fontSize: 11, fontFamily: 'Helvetica-Bold', marginBottom: 4 },
  advisoryBody:   { fontSize: 10, color: C.grey600, lineHeight: 1.6 },
  /* Divider */
  divider:        { borderBottomWidth: 1, borderBottomColor: C.grey200, marginVertical: 12 },
  /* Body text */
  body:           { fontSize: 10, color: C.grey600, lineHeight: 1.6, marginBottom: 8 },
  /* Inline mini-bar */
  barTrack:       { height: 8, backgroundColor: C.grey200, borderRadius: 4, marginTop: 4, marginBottom: 8 },
  barFill:        { height: 8, borderRadius: 4 },
});

// ─── Props ──────────────────────────────────────────────────────
export interface AdvisoryReportData {
  company: { name: string; sector: string; size: string; country: string };
  score: { overall: number; env: number; soc: number; gov: number; rating: string; dataCompleteness?: number };
  strengths: string[];
  weaknesses: string[];
  gaps: string[];
  recommendations: string[];
  assessmentDate: string;
  consultantName?: string;
  brandName?: string;
  primaryColor?: string;
  logoUrl?: string;
  introText?: string;
  closingText?: string;
  footerText?: string;
  footerDisclaimer?: string;
  headerTagline?: string;
}

// ─── Inline mini-bar ────────────────────────────────────────────
function MiniBar({ value, color }: { value: number; color: string }) {
  return (
    <View style={s.barTrack}>
      <View style={[s.barFill, { width: `${Math.min(100, value)}%`, backgroundColor: color }]} />
    </View>
  );
}

// ─── Recommendation priority tag ────────────────────────────────
function PriorityTag({ idx }: { idx: number }) {
  const colors = [C.danger, C.danger, C.warning, C.warning, C.accent, C.accent];
  const labels = ['Critical', 'Critical', 'High', 'High', 'Medium', 'Medium'];
  const color = colors[Math.min(idx, colors.length - 1)];
  const label = labels[Math.min(idx, labels.length - 1)];
  return (
    <View style={{ backgroundColor: color, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4, alignSelf: 'flex-start', marginBottom: 4 }}>
      <Text style={{ fontSize: 7, color: C.white, fontFamily: 'Helvetica-Bold' }}>{label}</Text>
    </View>
  );
}

// ─── Main Document ──────────────────────────────────────────────
export function AdvisoryReportDocument({ data }: { data: AdvisoryReportData }) {
  const d = data;
  const brand = d.brandName || 'ESGwise';
  const primaryColor = d.primaryColor || C.primary;
  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const rColor = ratingColor(d.score.rating);

  const Header = () => (
    <View style={[s.header, { borderBottomColor: primaryColor }]}>
      <Text style={[s.headerTitle, { color: primaryColor }]}>ESG Advisory Report · {d.company.name}</Text>
      <Text style={s.headerDate}>{today}</Text>
    </View>
  );

  const Footer = ({ page }: { page: number }) => (
    <View style={s.footer}>
      <Text>{d.footerText || `Confidential – ${brand} Advisory`}</Text>
      <Text>Page {page}</Text>
    </View>
  );

  return (
    <Document title={`ESG Advisory Report – ${d.company.name}`} author={d.consultantName || 'ESGwise'}>
      {/* ───── COVER PAGE ───── */}
      <Page size="A4" style={s.coverPage}>
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 8, backgroundColor: primaryColor }} />
        {d.logoUrl && (
          <Image src={d.logoUrl} style={{ width: 100, height: 100, objectFit: 'contain', marginBottom: 20 }} />
        )}
        <Text style={s.coverTitle}>ESG Advisory Report</Text>
        <Text style={s.coverSubtitle}>{d.headerTagline || 'Strategic Sustainability Assessment & Action Plan'}</Text>
        <View style={[s.ratingBadge, { backgroundColor: rColor, marginBottom: 30 }]}>
          <Text style={s.ratingText}>Rating: {d.score.rating}</Text>
        </View>
        <Text style={s.coverCompany}>{d.company.name}</Text>
        <Text style={s.coverSector}>{d.company.sector} · {d.company.size} · {d.company.country}</Text>
        <Text style={[s.coverBrand, { color: primaryColor }]}>Prepared by {brand} Consulting</Text>
        <Text style={s.coverDate}>Report Date: {today}</Text>
      </Page>

      {/* ───── EXECUTIVE SUMMARY ───── */}
      <Page size="A4" style={s.page}>
        <Header />

        <Text style={s.sectionTitle}>1. Executive Summary</Text>
        <Text style={s.body}>
          {d.introText || `This advisory report presents the findings of a comprehensive ESG (Environmental, Social, Governance) assessment conducted for ${d.company.name}. Operating in the ${d.company.sector} sector as a ${d.company.size}-sized enterprise in ${d.company.country}, the company received an overall ESG score of ${d.score.overall}% with a rating of ${d.score.rating}.`}
        </Text>

        {/* Score Overview */}
        <Text style={s.sectionTitle}>2. Performance Overview</Text>
        <View style={s.scoreRow}>
          <View style={[s.scoreCard, { backgroundColor: C.grey100 }]}>
            <Text style={s.scoreLabel}>Overall</Text>
            <Text style={[s.scoreValue, { color: rColor }]}>{d.score.overall}%</Text>
            <Text style={s.scoreUnit}>{d.score.rating}</Text>
          </View>
          <View style={[s.scoreCard, { backgroundColor: C.envBg }]}>
            <Text style={s.scoreLabel}>Environment</Text>
            <Text style={[s.scoreValue, { color: C.env }]}>{d.score.env}%</Text>
          </View>
          <View style={[s.scoreCard, { backgroundColor: C.socBg }]}>
            <Text style={s.scoreLabel}>Social</Text>
            <Text style={[s.scoreValue, { color: C.soc }]}>{d.score.soc}%</Text>
          </View>
          <View style={[s.scoreCard, { backgroundColor: C.govBg }]}>
            <Text style={s.scoreLabel}>Governance</Text>
            <Text style={[s.scoreValue, { color: C.gov }]}>{d.score.gov}%</Text>
          </View>
        </View>

        {/* Pillar Bars */}
        <Text style={s.sectionSub}>Pillar Performance</Text>
        <Text style={{ fontSize: 9, color: C.grey600, marginBottom: 2 }}>Environmental ({d.score.env}%)</Text>
        <MiniBar value={d.score.env} color={C.env} />
        <Text style={{ fontSize: 9, color: C.grey600, marginBottom: 2 }}>Social ({d.score.soc}%)</Text>
        <MiniBar value={d.score.soc} color={C.soc} />
        <Text style={{ fontSize: 9, color: C.grey600, marginBottom: 2 }}>Governance ({d.score.gov}%)</Text>
        <MiniBar value={d.score.gov} color={C.gov} />

        <Footer page={2} />
      </Page>

      {/* ───── STRENGTHS, WEAKNESSES, GAPS ───── */}
      <Page size="A4" style={s.page}>
        <Header />

        <Text style={s.sectionTitle}>3. Detailed Analysis</Text>

        {/* Strengths */}
        <View style={[s.advisoryCard, { borderColor: C.success, backgroundColor: '#f0fdf4', borderLeftColor: C.success }]}>
          <Text style={[s.advisoryTitle, { color: C.success }]}>✓ Strengths</Text>
          {d.strengths.length > 0 ? (
            d.strengths.map((st, i) => (
              <View key={i} style={s.bullet}>
                <Text style={[s.bulletDot, { color: C.success }]}>•</Text>
                <Text style={s.bulletText}>{st}</Text>
              </View>
            ))
          ) : (
            <Text style={s.advisoryBody}>No significant strengths identified yet – this represents an opportunity for targeted improvement.</Text>
          )}
        </View>

        {/* Weaknesses */}
        <View style={[s.advisoryCard, { borderColor: C.warning, backgroundColor: '#fffbeb', borderLeftColor: C.warning }]}>
          <Text style={[s.advisoryTitle, { color: C.warning }]}>⚠ Areas for Improvement</Text>
          {d.weaknesses.length > 0 ? (
            d.weaknesses.map((w, i) => (
              <View key={i} style={s.bullet}>
                <Text style={[s.bulletDot, { color: C.warning }]}>•</Text>
                <Text style={s.bulletText}>{w}</Text>
              </View>
            ))
          ) : (
            <Text style={s.advisoryBody}>No critical weaknesses identified.</Text>
          )}
        </View>

        {/* Gaps */}
        <View style={[s.advisoryCard, { borderColor: C.danger, backgroundColor: '#fef2f2', borderLeftColor: C.danger }]}>
          <Text style={[s.advisoryTitle, { color: C.danger }]}>✗ Data & Policy Gaps</Text>
          {d.gaps.length > 0 ? (
            d.gaps.map((g, i) => (
              <View key={i} style={s.bullet}>
                <Text style={[s.bulletDot, { color: C.danger }]}>•</Text>
                <Text style={s.bulletText}>{g}</Text>
              </View>
            ))
          ) : (
            <Text style={s.advisoryBody}>No major data gaps identified – excellent data completeness.</Text>
          )}
        </View>

        <Footer page={3} />
      </Page>

      {/* ───── RECOMMENDATIONS (ACTION PLAN) ───── */}
      <Page size="A4" style={s.page}>
        <Header />

        <Text style={s.sectionTitle}>4. Strategic Recommendations & Action Plan</Text>
        <Text style={s.body}>
          The following recommendations are prioritized by potential impact and urgency. We advise addressing critical items within the next quarter and high-priority items within six months.
        </Text>

        {d.recommendations.map((rec, i) => (
          <View key={i} style={[s.advisoryCard, { borderColor: primaryColor, borderLeftColor: primaryColor, backgroundColor: i % 2 === 0 ? C.grey50 : C.white }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <Text style={[s.advisoryTitle, { color: primaryColor }]}>Recommendation {i + 1}</Text>
              <PriorityTag idx={i} />
            </View>
            <Text style={s.advisoryBody}>{rec}</Text>
          </View>
        ))}

        <View style={s.divider} />

        <Text style={s.sectionSub}>Next Steps</Text>
        {d.closingText ? (
          <Text style={s.body}>{d.closingText}</Text>
        ) : (
          <>
            <View style={s.bullet}>
              <Text style={s.bulletDot}>1.</Text>
              <Text style={s.bulletText}>Schedule a follow-up consultation to develop a detailed implementation timeline for each recommendation.</Text>
            </View>
            <View style={s.bullet}>
              <Text style={s.bulletDot}>2.</Text>
              <Text style={s.bulletText}>Assign internal owners for each action item and establish quarterly ESG review cadence.</Text>
            </View>
            <View style={s.bullet}>
              <Text style={s.bulletDot}>3.</Text>
              <Text style={s.bulletText}>Re-assess in 6 months to measure progress and update the ESG rating.</Text>
            </View>
          </>
        )}

        <View style={s.divider} />

        <Text style={{ fontSize: 9, color: C.grey400, textAlign: 'center', marginTop: 10 }}>
          {d.footerDisclaimer || `This report has been prepared by ${brand} Consulting based on data provided during the assessment process. It is intended for internal use only.\n© ${new Date().getFullYear()} ${brand}. All rights reserved.`}
        </Text>

        <Footer page={4} />
      </Page>
    </Document>
  );
}
