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
import { predictCSV } from '../services/modelService';
import { getRequiredFeatures } from '../services/apiClient';

export default function UploadScreen({ navigation, route }) {
  const { quickTest } = route?.params || {};
  const [selectedFile, setSelectedFile] = useState(null);
  const [proteinData, setProteinData] = useState([]);
  const [uploading, setUploading] = useState(false);

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

      setUploading(true);
      setSelectedFile({
        name: asset.name,
        size: asset.size,
        uri: asset.uri,
        mimeType: asset.mimeType || 'text/csv',
      });

      // Upload to backend
      try {
        // First, get required features from model
        let requiredFeatures = [];
        try {
          const featuresResponse = await getRequiredFeatures();
          requiredFeatures = featuresResponse?.features || [];
        } catch (err) {
          console.warn('Could not fetch required features:', err);
        }

        const response = await predictCSV({
          uri: asset.uri,
          name: asset.name,
          mimeType: asset.mimeType || 'text/csv',
        });

        // Validate: Check if response indicates successful validation
        if (response?.error) {
          Alert.alert('Validation Error', response.error);
          setSelectedFile(null);
          setUploading(false);
          return;
        }

        // Extract protein data from response
        // Backend returns predictions for CSV - use first patient's data
        if (response?.patients && response.patients.length > 0) {
          // Use actual patient prediction data from CSV
          const firstPatient = response.patients[0];
          
          // Extract features from patient data
          const patientFeatures = firstPatient.features || {};
          const usedFeatures = response.used_features || Object.keys(patientFeatures);
          
          // Create proteins from actual feature values
          const proteins = response.top_biomarkers?.map((bio, index) => ({
            id: `protein-${index + 1}`,
            name: bio.protein_name || bio.name || bio.feature,
            symbol: bio.feature || `P${index + 1}`,
            importance: (bio.importance_pct || bio.importance || 0) / 100,
            category: 'Proteomic Feature',
            description: `Feature importance: ${(bio.importance_pct || 0).toFixed(1)}%`,
            direction: 'elevated',
            value: patientFeatures[bio.feature] || bio.importance || 0,
          })) || [];

          // Create allProteins from used features with actual values
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

          // Validate features were actually detected
          const detectedFeatures = response.used_features || response.summary?.used_features || [];
          const featureCount = detectedFeatures.length || requiredFeatures.length;
          
          if (featureCount < 50 && requiredFeatures.length > 0) {
            const missingFeatures = requiredFeatures.filter(f => !detectedFeatures.includes(f));
            Alert.alert(
              'Missing Features', 
              `Only ${featureCount} of 50 required features detected.\n\nMissing: ${missingFeatures.slice(0, 5).join(', ')}${missingFeatures.length > 5 ? '...' : ''}\n\nPlease ensure your CSV has all 50 seq_* columns.`,
              [{ text: 'OK' }]
            );
            setSelectedFile(null);
            setUploading(false);
            return;
          }

          const proteinDataObj = {
            fileName: asset.name,
            total: response.summary?.total_patients || 1,
            featureCount: featureCount,
            topProteins: proteins.slice(0, 10),
            allProteins: allProteins,
            backendResponse: response,
            usedFeatures: detectedFeatures,
          };

          setProteinData(proteinDataObj);

          // Directly navigate to Analysis - no patient intake form
          navigation.navigate('Analysis', {
            formData: {},
            proteinData: proteinDataObj,
          });
        } else {
          // No valid response - validation failed
          Alert.alert(
            'Validation Failed', 
            'The uploaded file does not contain the required 50 protein features. Please check your CSV format.'
          );
          setSelectedFile(null);
        }
      } catch (error) {
        console.error('Upload error:', error);
        const errorMsg = error.message || 'Could not process the file.';
        if (errorMsg.includes('Expected 50') || errorMsg.includes('features') || errorMsg.includes('biomarkers')) {
          Alert.alert(
            'Invalid File Format', 
            'Your CSV file must contain exactly 50 protein features (seq_* columns).\n\nPlease check:\n- Column names start with "seq_"\n- All 50 required features are present\n- Values are numeric'
          );
        } else {
          Alert.alert('Upload failed', errorMsg);
        }
        setSelectedFile(null);
      } finally {
        setUploading(false);
      }
    } catch (e) {
      Alert.alert('Upload failed', 'Could not read the file. Please try again.');
      setUploading(false);
    }
  };

  // Removed handleContinue - CSV upload directly goes to Analysis

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

            <TouchableOpacity 
              style={styles.uploadButton} 
              activeOpacity={0.9} 
              onPress={handlePick}
              disabled={uploading}
            >
              <LinearGradient
                colors={[COLORS.accent, COLORS.accentDark]}
                style={styles.uploadButtonBg}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Ionicons name="document-attach" size={20} color={COLORS.white} />
                <Text style={styles.uploadText}>
                  {uploading ? 'Uploading...' : selectedFile ? 'Replace file' : 'Upload Excel/CSV'}
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
                  {Array.isArray(proteinData) 
                    ? `${proteinData.length} proteins captured`
                    : proteinData.total 
                      ? `${proteinData.total} features detected`
                      : 'Ready for analysis'} • ready for analysis
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

          {/* Removed - CSV upload directly goes to Analysis */}

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

