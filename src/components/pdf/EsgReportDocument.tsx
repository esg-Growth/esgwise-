import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import { ScoreBreakdown } from '@/lib/esg-scoring';
import { ASSESSMENT_SECTIONS } from '@/lib/questionnaire';

// Register fonts if needed, default is Helvetica
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 30,
  },
  section: {
    margin: 10,
    padding: 10,
  },
  header: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  title: {
    fontSize: 18,
    marginBottom: 10,
    marginTop: 15,
    fontWeight: 'bold',
    backgroundColor: '#f3f4f6',
    padding: 5,
  },
  text: {
    fontSize: 12,
    marginBottom: 5,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingVertical: 5,
  },
  label: {
    fontSize: 10,
    width: '60%',
  },
  value: {
    fontSize: 10,
    width: '40%',
    textAlign: 'right',
    fontWeight: 'bold',
  },
  scoreBox: {
    padding: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 10,
  },
  scoreTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  scoreValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0ea5e9',
  }
});

interface EsgReportDocumentProps {
  company: any;
  score: ScoreBreakdown;
  responses: Record<string, string>;
  isAr?: boolean;
}

export const EsgReportDocument = ({ company, score, responses, isAr }: EsgReportDocumentProps) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.section}>
        <Text style={styles.header}>Sustainability Performance Report</Text>
        <Text style={{ fontSize: 16, textAlign: 'center', marginBottom: 20 }}>{company?.name || 'Company'}</Text>
        
        <View style={styles.scoreBox}>
          <Text style={styles.scoreTitle}>Overall ESG Rating: {score.rating}</Text>
          <Text style={styles.scoreValue}>{Math.round(score.overall)} / 100</Text>
        </View>

        <Text style={styles.title}>Pillar Scores</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Environmental</Text>
          <Text style={styles.value}>{Math.round(score.env)}%</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Social</Text>
          <Text style={styles.value}>{Math.round(score.soc)}%</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Governance</Text>
          <Text style={styles.value}>{Math.round(score.gov)}%</Text>
        </View>
        
        {ASSESSMENT_SECTIONS.map(section => {
          const answeredQuestions = section.questions.filter(q => responses[q.id]);
          if (answeredQuestions.length === 0) return null;
          
          return (
            <View key={section.id} wrap={false}>
              <Text style={styles.title}>{section.title}</Text>
              {answeredQuestions.map(q => {
                let displayValue = responses[q.id];
                if (q.type === 'yes_no') {
                  displayValue = displayValue === 'yes' ? 'Yes' : 'No';
                } else if (q.unit) {
                  displayValue = `${displayValue} ${q.unit}`;
                } else if (q.type === 'percentage') {
                  displayValue = `${displayValue}%`;
                }
                
                return (
                  <View style={styles.row} key={q.id}>
                    <Text style={styles.label}>{q.label}</Text>
                    <Text style={styles.value}>{displayValue}</Text>
                  </View>
                );
              })}
            </View>
          );
        })}
      </View>
    </Page>
  </Document>
);
