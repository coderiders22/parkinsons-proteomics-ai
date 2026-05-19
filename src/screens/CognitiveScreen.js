import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';
import GlassmorphicCard from '../components/GlassmorphicCard';
import { predictCSV } from '../services/modelService';
import { getRequiredFeatures } from '../services/apiClient';

const CSV_SLOTS = [
  {
    id: 0,
    label: 'Proteomics Biomarkers',
    subtitle: 'CSV with 50 seq_* protein features',
    icon: 'flask',
    color: '#00D4AA',
    required: true,
  },
  {
    id: 1,
    label: 'Cognitive Assessment',
    subtitle: 'MoCA / MMSE scores CSV',
    icon: 'brain',
    color: '#667EEA',
    required: false,
  },
  {
    id: 2,
    label: 'Clinical Biomarkers',
    subtitle: 'Blood & CSF clinical markers CSV',
    icon: 'pulse',
    color: '#F093FB',
    required: false,
  },
];

export default function CognitiveScreen({ navigation }) {
  const [files, setFiles] = useState([null, null, null]);
  const [isPredicting, setIsPredicting] = useState(false);

  const pickFile = async (slotIndex) => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        copyToCacheDirectory: true,
        type: ['text/csv', 'application/vnd.ms-excel',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', '*/*'],
      });

      if (result.canceled) return;
      const asset = result.assets?.[0];
      if (!asset) return;

      const updated = [...files];
      updated[slotIndex] = {
        name: asset.name,
        size: asset.size,
        uri: asset.uri,
        mimeType: asset.mimeType || 'text/csv',
      };
      setFiles(updated);
    } catch {
      Alert.alert('Error', 'Could not pick file. Please try again.');
    }
  };

  const removeFile = (slotIndex) => {
    const updated = [...files];
    updated[slotIndex] = null;
    setFiles(updated);
  };

  const handlePredict = async () => {
    if (!files[0]) {
      Alert.alert(
        'Missing File',
        'Please upload the Proteomics Biomarkers CSV (required) to run prediction.'
      );
      return;
    }

    setIsPredicting(true);

    try {
      let requiredFeatures = [];
      try {
        const featRes = await getRequiredFeatures();
        requiredFeatures = featRes?.features || [];
      } catch {
        // non-fatal
      }

      const response = await predictCSV({
        uri: files[0].uri,
        name: files[0].name,
        mimeType: files[0].mimeType || 'text/csv',
      });

      if (response?.error) {
        Alert.alert('Validation Error', response.error);
        return;
      }

      if (response?.patients && response.patients.length > 0) {
        const firstPatient = response.patients[0];
        const patientFeatures = firstPatient.features || {};
        const usedFeatures = response.used_features || Object.keys(patientFeatures);

        const featureCount = usedFeatures.length || requiredFeatures.length;

        if (featureCount < 50 && requiredFeatures.length > 0) {
          const missing = requiredFeatures.filter((f) => !usedFeatures.includes(f));
          Alert.alert(
            'Missing Features',
            `Only ${featureCount} of 50 required features detected.\n\nMissing: ${missing
              .slice(0, 5)
              .join(', ')}${missing.length > 5 ? '...' : ''}\n\nEnsure CSV has all 50 seq_* columns.`
          );
          return;
        }

        const proteins = (response.top_biomarkers || []).map((bio, i) => ({
          id: `protein-${i + 1}`,
          name: bio.protein_name || bio.name || bio.feature,
          symbol: bio.feature || `P${i + 1}`,
          importance: (bio.importance_pct || bio.importance || 0) / 100,
          category: 'Proteomic Feature',
          description: `Feature importance: ${(bio.importance_pct || 0).toFixed(1)}%`,
          direction: 'elevated',
          value: patientFeatures[bio.feature] || bio.importance || 0,
        }));

        const allProteins = usedFeatures.map((seq, idx) => ({
          id: `protein-all-${idx}`,
          name: response.feature_protein_map?.[seq] || seq,
          symbol: seq,
          importance: 0.5,
          category: 'Proteomic Feature',
          description: 'Proteomic feature from uploaded data',
          direction: 'elevated',
          value: patientFeatures[seq] || 1.0,
        }));

        const proteinDataObj = {
          fileName: files[0].name,
          total: response.summary?.total_patients || 1,
          featureCount,
          topProteins: proteins.slice(0, 10),
          allProteins,
          backendResponse: response,
          usedFeatures,
          sourceLabel: 'Cognitive Impairment Analysis',
          additionalFiles: files.slice(1).filter(Boolean).map((f) => f.name),
        };

        navigation.navigate('Analysis', {
          formData: {},
          proteinData: proteinDataObj,
        });
      } else {
        Alert.alert(
          'Validation Failed',
          'The Proteomics CSV does not contain the required 50 protein features. Please check the file format.'
        );
      }
    } catch (err) {
      const msg = err.message || 'Could not process the file.';
      if (msg.includes('Expected 50') || msg.includes('features') || msg.includes('biomarkers')) {
        Alert.alert(
          'Invalid File Format',
          'Your CSV must contain exactly 50 protein features (seq_* columns).\n\nCheck:\n- Column names start with "seq_"\n- All 50 features present\n- Values are numeric'
        );
      } else {
        Alert.alert('Prediction Failed', msg);
      }
    } finally {
      setIsPredicting(false);
    }
  };

  return (
    <LinearGradient colors={['#0A1628', '#1A2D4A', '#0F172A']} style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color={COLORS.white} />
            </TouchableOpacity>
            <View style={styles.headerTitleBlock}>
              <Text style={styles.title}>Cognitive Impairment</Text>
              <Text style={styles.titleAccent}>PD Detection</Text>
            </View>
            <View style={styles.placeholder} />
          </View>

          <Text style={styles.subtitle}>
            Upload up to 3 CSV datasets for a comprehensive Parkinson's cognitive impairment
            analysis. The Proteomics file is required; Clinical and Cognitive CSVs are optional
            for enriched reporting.
          </Text>

          {/* File Slots */}
          {CSV_SLOTS.map((slot) => {
            const file = files[slot.id];
            return (
              <GlassmorphicCard key={slot.id} style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={[styles.iconCircle, { borderColor: slot.color + '60', backgroundColor: slot.color + '15' }]}>
                    <Ionicons name={slot.icon} size={22} color={slot.color} />
                  </View>
                  <View style={styles.cardHeaderText}>
                    <View style={styles.labelRow}>
                      <Text style={styles.cardTitle}>{slot.label}</Text>
                      {slot.required && (
                        <View style={[styles.badge, { backgroundColor: slot.color + '25' }]}>
                          <Text style={[styles.badgeText, { color: slot.color }]}>Required</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.cardSubtitle}>{slot.subtitle}</Text>
                  </View>
                </View>

                {file ? (
                  <View style={[styles.fileInfo, { borderColor: slot.color + '30', backgroundColor: slot.color + '08' }]}>
                    <View style={styles.fileRow}>
                      <Ionicons name="checkmark-circle" size={18} color={COLORS.success} />
                      <Text style={styles.fileName} numberOfLines={1}>{file.name}</Text>
                      <TouchableOpacity onPress={() => removeFile(slot.id)} style={styles.removeBtn}>
                        <Ionicons name="close-circle" size={18} color={COLORS.gray} />
                      </TouchableOpacity>
                    </View>
                    <TouchableOpacity
                      style={[styles.replaceBtn, { borderColor: slot.color + '50' }]}
                      onPress={() => pickFile(slot.id)}
                    >
                      <Ionicons name="refresh" size={14} color={slot.color} />
                      <Text style={[styles.replaceBtnText, { color: slot.color }]}>Replace file</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={styles.uploadButton}
                    activeOpacity={0.85}
                    onPress={() => pickFile(slot.id)}
                  >
                    <LinearGradient
                      colors={[slot.color, slot.color + 'BB']}
                      style={styles.uploadButtonBg}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    >
                      <Ionicons name="document-attach" size={18} color={COLORS.white} />
                      <Text style={styles.uploadText}>Upload CSV</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                )}
              </GlassmorphicCard>
            );
          })}

          {/* Info card */}
          <GlassmorphicCard style={styles.card}>
            <View style={styles.miniHeader}>
              <Ionicons name="information-circle" size={20} color={COLORS.accent} />
              <Text style={styles.miniTitle}>How it works</Text>
            </View>
            {[
              'Proteomics CSV is validated for 50 seq_* features',
              "AI model predicts Parkinson's risk from protein data",
              'Cognitive & Clinical CSVs enrich the analysis report',
              'Results shown on the Analysis & Result screens',
            ].map((line, i) => (
              <View key={i} style={styles.bulletRow}>
                <Ionicons name="checkmark-circle" size={14} color={COLORS.success} />
                <Text style={styles.bullet}>{line}</Text>
              </View>
            ))}
          </GlassmorphicCard>

          {/* Predict Button */}
          <TouchableOpacity
            style={[styles.predictButton, !files[0] && styles.predictButtonDisabled]}
            activeOpacity={0.85}
            onPress={handlePredict}
            disabled={isPredicting || !files[0]}
          >
            <LinearGradient
              colors={files[0] ? ['#667EEA', '#764BA2'] : ['#334155', '#475569']}
              style={styles.predictBg}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              {isPredicting ? (
                <>
                  <ActivityIndicator color={COLORS.white} size="small" />
                  <Text style={styles.predictText}>Analysing...</Text>
                </>
              ) : (
                <>
                  <Ionicons name="analytics" size={22} color={COLORS.white} />
                  <Text style={styles.predictText}>Predict</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>

          <Text style={styles.footer}>
            Designed and Developed by Manav Rai • All Rights Reserved
          </Text>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1, paddingTop: SIZES.lg },
  content: {
    padding: SIZES.lg,
    paddingTop: SIZES.xl * 1.2,
    gap: SIZES.lg,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleBlock: {
    alignItems: 'center',
  },
  title: {
    fontSize: SIZES.large,
    color: COLORS.white,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  titleAccent: {
    fontSize: SIZES.regular,
    color: '#A78BFA',
    fontWeight: '600',
    marginTop: 2,
  },
  placeholder: { width: 42 },
  subtitle: {
    color: 'rgba(255,255,255,0.75)',
    lineHeight: 20,
    fontSize: SIZES.regular,
  },
  card: {
    padding: SIZES.lg,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SIZES.md,
    gap: SIZES.md,
  },
  cardHeaderText: {
    flex: 1,
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    marginTop: 2,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.sm,
    flexWrap: 'wrap',
  },
  cardTitle: {
    fontSize: SIZES.medium,
    fontWeight: '800',
    color: COLORS.white,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: SIZES.tiny,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  cardSubtitle: {
    color: 'rgba(255,255,255,0.6)',
    marginTop: 3,
    fontSize: SIZES.small,
  },
  uploadButton: {
    borderRadius: SIZES.radiusMd,
    overflow: 'hidden',
  },
  uploadButtonBg: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 13,
  },
  uploadText: {
    color: COLORS.white,
    fontWeight: '800',
    fontSize: SIZES.regular,
  },
  fileInfo: {
    borderRadius: SIZES.radiusMd,
    borderWidth: 1,
    padding: SIZES.md,
    gap: SIZES.sm,
  },
  fileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  fileName: {
    fontWeight: '700',
    color: COLORS.white,
    flex: 1,
    fontSize: SIZES.regular,
  },
  removeBtn: {
    padding: 2,
  },
  replaceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  replaceBtnText: {
    fontSize: SIZES.small,
    fontWeight: '700',
  },
  miniHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: SIZES.sm,
  },
  miniTitle: {
    fontWeight: '800',
    color: COLORS.white,
    fontSize: SIZES.regular,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 6,
  },
  bullet: {
    color: 'rgba(255,255,255,0.85)',
    flex: 1,
    fontWeight: '500',
    lineHeight: 19,
    fontSize: SIZES.small,
  },
  predictButton: {
    borderRadius: SIZES.radiusLg,
    overflow: 'hidden',
    ...SHADOWS.large,
  },
  predictButtonDisabled: {
    opacity: 0.55,
  },
  predictBg: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 18,
  },
  predictText: {
    color: COLORS.white,
    fontWeight: '800',
    fontSize: SIZES.medium,
    letterSpacing: -0.3,
  },
  footer: {
    color: 'rgba(255,255,255,0.5)',
    textAlign: 'center',
    fontWeight: '600',
    marginTop: SIZES.sm,
    fontSize: SIZES.small,
  },
});
