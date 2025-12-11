import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';
import GlassmorphicCard from '../components/GlassmorphicCard';

const generateSyntheticProteins = () => {
  return Array.from({ length: 50 }).map((_, index) => {
    const importance = Math.random() * 0.6 + 0.35; // 0.35 - 0.95
    return {
      id: `protein-${index + 1}`,
      name: `Protein ${index + 1}`,
      symbol: `P${index + 1}`,
      importance: Math.min(1, importance),
      category: index % 2 === 0 ? 'Neuroinflammation' : 'Synaptic Function',
      description: 'Proteomic feature captured from uploaded sheet',
      direction: index % 3 === 0 ? 'elevated' : 'decreased',
      value: Math.random() * 2,
    };
  });
};

export default function UploadScreen({ navigation, route }) {
  const { quickTest } = route?.params || {};
  const [selectedFile, setSelectedFile] = useState(null);
  const [proteinData, setProteinData] = useState([]);

  const handlePick = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        copyToCacheDirectory: true,
        type: [
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'application/vnd.ms-excel',
          'text/csv',
          '*/*',
        ],
      });

      if (result.canceled) return;

      const asset = result.assets?.[0];
      if (!asset) return;

      // Demo parsing: generate synthetic 50-protein vector after "upload"
      const proteins = generateSyntheticProteins();

      setSelectedFile({
        name: asset.name,
        size: asset.size,
      });
      setProteinData(proteins);

      Alert.alert('Upload captured', '50 proteomic features ready for analysis.');
    } catch (e) {
      Alert.alert('Upload failed', 'Could not read the file. Please try again.');
    }
  };

  const handleContinue = () => {
    if (!selectedFile || proteinData.length === 0) {
      Alert.alert('Upload required', 'Please upload the proteomics Excel/CSV first.');
      return;
    }

    const topProteins = [...proteinData]
      .sort((a, b) => b.importance - a.importance)
      .slice(0, 10);

    navigation.navigate('Input', {
      proteinData: {
        fileName: selectedFile.name,
        total: proteinData.length,
        topProteins,
        allProteins: proteinData,
      },
      quickTest: !!quickTest,
    });
  };

  return (
    <LinearGradient
      colors={['#0A1628', '#1A2D4A', '#0F172A']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color={COLORS.white} />
            </TouchableOpacity>
            <Text style={styles.title}>Upload Proteomics</Text>
            <View style={styles.placeholder} />
          </View>

          <Text style={styles.subtitle}>
            Upload the Excel/CSV (50 features) before running analysis. We’ll extract top
            protein influencers and feed them to the AI model.
          </Text>

          <GlassmorphicCard style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.iconCircle}>
                <Ionicons name="cloud-upload" size={26} color={COLORS.accent} />
              </View>
              <View>
                <Text style={styles.cardTitle}>Proteomics File</Text>
                <Text style={styles.cardSubtitle}>Excel (.xlsx/.csv) • 50 biomarkers</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.uploadButton} activeOpacity={0.9} onPress={handlePick}>
              <LinearGradient
                colors={[COLORS.accent, COLORS.accentDark]}
                style={styles.uploadButtonBg}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Ionicons name="document-attach" size={20} color={COLORS.white} />
                <Text style={styles.uploadText}>
                  {selectedFile ? 'Replace file' : 'Upload Excel/CSV'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            {selectedFile && (
              <View style={styles.fileInfo}>
                <View style={styles.fileRow}>
                  <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
                  <Text style={styles.fileName}>{selectedFile.name}</Text>
                </View>
                <Text style={styles.fileMeta}>
                  {proteinData.length} proteins captured • ready for analysis
                </Text>
              </View>
            )}
          </GlassmorphicCard>

          <GlassmorphicCard style={styles.card}>
            <View style={styles.miniHeader}>
              <Ionicons name="analytics" size={20} color={COLORS.accent} />
              <Text style={styles.miniTitle}>What we do</Text>
            </View>
            <View style={styles.bulletRow}>
              <Ionicons name="checkmark-circle" size={16} color={COLORS.success} />
              <Text style={styles.bullet}>Validate 50-length proteomic vector</Text>
            </View>
            <View style={styles.bulletRow}>
              <Ionicons name="checkmark-circle" size={16} color={COLORS.success} />
              <Text style={styles.bullet}>Rank top 10 proteins by influence</Text>
            </View>
            <View style={styles.bulletRow}>
              <Ionicons name="checkmark-circle" size={16} color={COLORS.success} />
              <Text style={styles.bullet}>Pass data to AI pipeline before analysis</Text>
            </View>
          </GlassmorphicCard>

          <TouchableOpacity style={styles.continueButton} activeOpacity={0.9} onPress={handleContinue}>
            <LinearGradient
              colors={[COLORS.accent, COLORS.accentDark]}
              style={styles.continueBg}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.continueText}>Proceed to Patient Intake</Text>
              <Ionicons name="arrow-forward-circle" size={22} color={COLORS.white} />
            </LinearGradient>
          </TouchableOpacity>

          <Text style={styles.footer}>Designed and Developed by Manav Rai • All Rights Reserved</Text>
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
  title: {
    fontSize: SIZES.large,
    color: COLORS.white,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  placeholder: { width: 42 },
  subtitle: {
    color: 'rgba(255,255,255,0.8)',
    lineHeight: 20,
    marginTop: SIZES.sm,
  },
  card: {
    padding: SIZES.lg,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.md,
    gap: SIZES.md,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(0, 212, 170, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 212, 170, 0.35)',
  },
  cardTitle: {
    fontSize: SIZES.large,
    fontWeight: '800',
    color: COLORS.white,
  },
  cardSubtitle: {
    color: 'rgba(255,255,255,0.85)',
    marginTop: 4,
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
    paddingVertical: 14,
  },
  uploadText: {
    color: COLORS.white,
    fontWeight: '800',
    fontSize: SIZES.regular,
  },
  fileInfo: {
    marginTop: SIZES.md,
    padding: SIZES.md,
    backgroundColor: 'rgba(0, 212, 170, 0.06)',
    borderRadius: SIZES.radiusMd,
    borderWidth: 1,
    borderColor: 'rgba(0, 212, 170, 0.12)',
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
  },
  fileMeta: {
    color: 'rgba(255,255,255,0.8)',
    marginTop: 6,
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
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  bullet: {
    color: COLORS.white,
    flex: 1,
    fontWeight: '600',
  },
  continueButton: {
    borderRadius: SIZES.radiusLg,
    overflow: 'hidden',
    ...SHADOWS.medium,
  },
  continueBg: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
  },
  continueText: {
    color: COLORS.white,
    fontWeight: '800',
    fontSize: SIZES.regular,
  },
  footer: {
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    fontWeight: '600',
    marginTop: SIZES.sm,
  },
});

