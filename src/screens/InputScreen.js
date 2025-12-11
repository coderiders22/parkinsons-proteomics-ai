import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Animated,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';
import { CLINICAL_FEATURES } from '../constants/data';

const { width } = Dimensions.get('window');

export default function InputScreen({ navigation, route }) {
  const { proteinData } = route.params || {};
  const [formData, setFormData] = useState({});
  const [currentStep, setCurrentStep] = useState(0);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  const categories = [
    { id: 'demographics', label: 'Demographics', icon: 'person', color: '#667EEA' },
    { id: 'vitals', label: 'Vitals', icon: 'pulse', color: '#00D4AA' },
    { id: 'clinical', label: 'Clinical', icon: 'medkit', color: '#F5576C' },
    { id: 'lifestyle', label: 'Lifestyle', icon: 'fitness', color: '#FFB800' },
  ];

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, [currentStep]);

  const currentCategory = categories[currentStep];
  const currentFields = CLINICAL_FEATURES.filter(f => f.category === currentCategory.id);

  const updateField = (id, value) => {
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleNext = () => {
    if (currentStep < categories.length - 1) {
      fadeAnim.setValue(0);
      slideAnim.setValue(30);
      setCurrentStep(currentStep + 1);
    } else {
      // Guard: ensure proteomics uploaded before analysis
      if (!proteinData || !proteinData.allProteins) {
        Alert.alert('Upload required', 'Please upload the proteomics file first.', [
          { text: 'Go to Upload', onPress: () => navigation.navigate('Upload') },
        ]);
        return;
      }
      // Navigate to analysis with form data + proteomics upload
      navigation.navigate('Analysis', { formData, proteinData });
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      fadeAnim.setValue(0);
      slideAnim.setValue(-30);
      setCurrentStep(currentStep - 1);
    } else {
      navigation.goBack();
    }
  };

  const renderSelectField = (field) => (
    <View style={styles.selectContainer}>
      {field.options.map((option, index) => (
        <TouchableOpacity
          key={option}
          style={[
            styles.selectOption,
            formData[field.id] === option && styles.selectOptionActive,
            { borderColor: formData[field.id] === option ? currentCategory.color : COLORS.lightGray },
          ]}
          onPress={() => updateField(field.id, option)}
        >
          <Text
            style={[
              styles.selectOptionText,
              formData[field.id] === option && { color: currentCategory.color },
            ]}
          >
            {option}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderNumberField = (field) => (
    <View style={styles.inputContainer}>
      <TextInput
        style={styles.input}
        placeholder={field.placeholder}
        placeholderTextColor={COLORS.gray}
        keyboardType="numeric"
        value={formData[field.id]?.toString() || ''}
        onChangeText={(text) => updateField(field.id, text)}
      />
      {field.unit && (
        <View style={styles.unitContainer}>
          <Text style={styles.unitText}>{field.unit}</Text>
        </View>
      )}
    </View>
  );

  const progress = ((currentStep + 1) / categories.length) * 100;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#0A1628', '#1A2D4A']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={COLORS.white} />
          </TouchableOpacity>
          
          <View style={styles.headerTitle}>
            <Text style={styles.headerTitleText}>Patient Assessment</Text>
            <Text style={styles.headerSubtitle}>Step {currentStep + 1} of {categories.length}</Text>
          </View>
          
          <View style={styles.placeholder} />
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { 
                  transform: [{ scaleX: progress / 100 }],
                  backgroundColor: currentCategory.color,
                },
              ]}
            />
          </View>
          <View style={styles.progressSteps}>
            {categories.map((cat, index) => (
              <View
                key={cat.id}
                style={[
                  styles.progressStep,
                  index <= currentStep && { backgroundColor: cat.color },
                ]}
              >
                <Ionicons
                  name={cat.icon}
                  size={14}
                  color={index <= currentStep ? COLORS.white : COLORS.gray}
                />
              </View>
            ))}
          </View>
        </View>
      </LinearGradient>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
        {proteinData && (
          <View style={styles.uploadBanner}>
            <Ionicons name="flask" size={20} color={COLORS.accent} />
            <View style={{ flex: 1 }}>
              <Text style={styles.uploadTitle}>Proteomics attached</Text>
              <Text style={styles.uploadSubtitle}>
                {proteinData?.fileName || 'Excel/CSV'} • {proteinData?.total || 50} features detected
              </Text>
            </View>
            <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
          </View>
        )}

          {/* Category Header */}
          <Animated.View
            style={[
              styles.categoryHeader,
              {
                opacity: fadeAnim,
                transform: [{ translateX: slideAnim }],
              },
            ]}
          >
            <View style={[styles.categoryIcon, { backgroundColor: currentCategory.color + '20' }]}>
              <Ionicons name={currentCategory.icon} size={32} color={currentCategory.color} />
            </View>
            <Text style={styles.categoryTitle}>{currentCategory.label}</Text>
            <Text style={styles.categoryDescription}>
              {currentCategory.id === 'demographics' && 'Basic patient information for demographic analysis'}
              {currentCategory.id === 'vitals' && 'Physical measurements and vital signs'}
              {currentCategory.id === 'clinical' && 'Clinical assessments and medical history'}
              {currentCategory.id === 'lifestyle' && 'Lifestyle factors and behavioral history'}
            </Text>
            {currentCategory.id === 'demographics' && (
              <Text style={styles.optionalNote}>Optional — main prediction uses the proteomics upload.</Text>
            )}
          </Animated.View>

          {/* Form Fields */}
          <Animated.View
            style={[
              styles.formContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            {currentFields.map((field, index) => (
              <View key={field.id} style={styles.fieldContainer}>
                <Text style={styles.fieldLabel}>{field.label}</Text>
                {field.type === 'select' ? renderSelectField(field) : renderNumberField(field)}
              </View>
            ))}
          </Animated.View>

          {/* Quick Fill Button (for demo) */}
          <TouchableOpacity
            style={styles.quickFillButton}
            onPress={() => {
              // Fill with sample data for demo
              const sampleData = {
                age: '65',
                sex: 'Male',
                bmi: '24.5',
                systolic_bp: '130',
                diastolic_bp: '85',
                resting_pulse: '72',
                cognitive_score: '26',
                years_education: '16',
                smoking_history: 'Former',
                family_history_pd: 'No',
              };
              setFormData(sampleData);
            }}
          >
            <Ionicons name="flash" size={18} color={COLORS.accent} />
            <Text style={styles.quickFillText}>Quick Fill (Demo Data)</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Bottom Action */}
        <View style={styles.bottomAction}>
          <TouchableOpacity
            style={styles.nextButton}
            onPress={handleNext}
          >
            <LinearGradient
              colors={[currentCategory.color, currentCategory.color + 'CC']}
              style={styles.nextButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.nextButtonText}>
                {currentStep === categories.length - 1 ? 'Analyze' : 'Continue'}
              </Text>
              <Ionicons
                name={currentStep === categories.length - 1 ? 'analytics' : 'arrow-forward'}
                size={20}
                color={COLORS.white}
              />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.offWhite,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.offWhite,
  },
  header: {
    paddingTop: 60,
    paddingBottom: SIZES.lg,
    paddingHorizontal: SIZES.lg,
    borderBottomLeftRadius: SIZES.radiusXl,
    borderBottomRightRadius: SIZES.radiusXl,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SIZES.lg,
  },
  backButton: {
    padding: SIZES.sm,
    marginLeft: -SIZES.sm,
  },
  headerTitle: {
    alignItems: 'center',
  },
  headerTitleText: {
    fontSize: SIZES.large,
    fontWeight: '700',
    color: COLORS.white,
  },
  headerSubtitle: {
    fontSize: SIZES.small,
    color: COLORS.gray,
    marginTop: SIZES.xs,
  },
  placeholder: {
    width: 40,
  },
  progressContainer: {
    alignItems: 'center',
  },
  progressBar: {
    width: '100%',
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
    marginBottom: SIZES.md,
  },
  progressFill: {
    height: '100%',
    width: '100%',
    borderRadius: 2,
  },
  progressSteps: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
  },
  uploadBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.sm,
    padding: SIZES.md,
    borderRadius: SIZES.radiusMd,
    backgroundColor: 'rgba(0, 212, 170, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(0, 212, 170, 0.2)',
    marginBottom: SIZES.md,
  },
  uploadTitle: {
    color: COLORS.primary,
    fontWeight: '800',
  },
  uploadSubtitle: {
    color: COLORS.darkGray,
    marginTop: 2,
  },
  progressStep: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: SIZES.lg,
    paddingBottom: 100,
  },
  categoryHeader: {
    alignItems: 'center',
    marginBottom: SIZES.xl,
  },
  categoryIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SIZES.md,
  },
  categoryTitle: {
    fontSize: SIZES.xlarge,
    fontWeight: '800',
    color: COLORS.primary,
    marginBottom: SIZES.xs,
  },
  categoryDescription: {
    fontSize: SIZES.regular,
    color: COLORS.gray,
    textAlign: 'center',
    paddingHorizontal: SIZES.lg,
  },
  optionalNote: {
    marginTop: SIZES.xs,
    color: COLORS.gray,
    fontSize: SIZES.small,
    textAlign: 'center',
  },
  formContainer: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusLg,
    padding: SIZES.lg,
    ...SHADOWS.medium,
  },
  fieldContainer: {
    marginBottom: SIZES.lg,
  },
  fieldLabel: {
    fontSize: SIZES.regular,
    fontWeight: '600',
    color: COLORS.primary,
    marginBottom: SIZES.sm,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    height: 52,
    backgroundColor: COLORS.offWhite,
    borderRadius: SIZES.radiusMd,
    paddingHorizontal: SIZES.md,
    fontSize: SIZES.medium,
    color: COLORS.primary,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  unitContainer: {
    position: 'absolute',
    right: SIZES.md,
    backgroundColor: COLORS.lightGray,
    paddingHorizontal: SIZES.sm,
    paddingVertical: SIZES.xs,
    borderRadius: SIZES.radiusSm,
  },
  unitText: {
    fontSize: SIZES.small,
    color: COLORS.darkGray,
    fontWeight: '500',
  },
  selectContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -SIZES.xs,
  },
  selectOption: {
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.sm,
    borderRadius: SIZES.radiusMd,
    borderWidth: 2,
    borderColor: COLORS.lightGray,
    margin: SIZES.xs,
    backgroundColor: COLORS.white,
  },
  selectOptionActive: {
    backgroundColor: 'rgba(0, 212, 170, 0.1)',
  },
  selectOptionText: {
    fontSize: SIZES.regular,
    fontWeight: '600',
    color: COLORS.darkGray,
  },
  quickFillButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SIZES.lg,
    padding: SIZES.md,
  },
  quickFillText: {
    fontSize: SIZES.regular,
    color: COLORS.accent,
    fontWeight: '600',
    marginLeft: SIZES.sm,
  },
  bottomAction: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: SIZES.lg,
    backgroundColor: COLORS.offWhite,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
  },
  nextButton: {
    borderRadius: SIZES.radiusMd,
    overflow: 'hidden',
    ...SHADOWS.medium,
  },
  nextButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SIZES.md,
    paddingHorizontal: SIZES.xl,
  },
  nextButtonText: {
    fontSize: SIZES.medium,
    fontWeight: '700',
    color: COLORS.white,
    marginRight: SIZES.sm,
  },
});

