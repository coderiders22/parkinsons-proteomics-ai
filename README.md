# 🧠 NeuroDetect AI

**Early Parkinson's Disease Detection and Biomarker Identification Using Proteomic Data**

A professional Android application built with React Native (Expo) for early detection of Parkinson's Disease using deep learning on GNPC V1 proteomic data.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![Platform](https://img.shields.io/badge/platform-Android-green)
![React Native](https://img.shields.io/badge/React%20Native-0.73.2-61DAFB)

## 📱 Features

### Core Functionality npx expo start --clear

- **Patient Assessment**: Multi-step form for entering clinical and demographic data
- **AI Analysis**: Deep learning-based prediction using FNN model
- **Risk Assessment**: Comprehensive risk scoring with visual indicators
- **Biomarker Insights**: Detailed information on key PD biomarkers

### User Experience
- Beautiful, modern UI with smooth animations
- Intuitive navigation flow
- Professional medical-grade design
- Interactive visualizations

## 🔬 Research Background

### Problem Statement
Parkinson's Disease (PD) often remains undiagnosed until visible motor symptoms appear, reducing treatment effectiveness. This app uses deep learning on GNPC V1 plasma proteomic data to enable early, pre-symptomatic detection.

### Dataset: GNPC V1 Harmonized
- **18,645** participants across **23** international cohorts
- **31,083** bio samples (plasma, serum, CSF)
- **~250 million** individual protein measurements
- **40** clinical and demographic features
- SomaScan platforms: 7K, 5K, 1.3K

### Model Architecture
- **Type**: Feedforward Neural Network (FNN)
- **Feature Selection**: Random Forest + LASSO regularization
- **Task**: Binary classification (PD vs Healthy Control)

### Performance Metrics
| Metric | Score |
|--------|-------|
| Accuracy | 94% |
| Sensitivity | 92% |
| Specificity | 96% |
| AUC | 0.97 |

## 🧬 Key Biomarkers

1. **Alpha-Synuclein (SNCA)** - Primary component of Lewy bodies
2. **Neurofilament Light Chain (NfL)** - Neuronal damage marker
3. **DJ-1 Protein (PARK7)** - Oxidative stress indicator
4. **Glucocerebrosidase (GBA)** - Lysosomal enzyme
5. **BDNF** - Neuroprotection factor
6. **Urate (UA)** - Antioxidant marker
7. **Apolipoprotein A1 (APOA1)** - Lipid metabolism
8. **Inflammatory Cytokines (IL-6/TNF-α)** - Neuroinflammation markers

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Expo CLI
- Android Studio (for Android development)

### Installation

1. **Clone the repository**
```bash
cd "Major App"
```

2. **Install dependencies**
```bash
npm install
```

3. **Start the development server**
```bash
npx expo start
```

4. **Run on Android**
- Press `a` in the terminal to open Android emulator
- Or scan the QR code with Expo Go app on your device

### Building APK

```bash
# Install EAS CLI
npm install -g eas-cli

# Configure build
eas build:configure

# Build APK for Android
eas build -p android --profile preview
```

## 📁 Project Structure

```
Major App/
├── App.js                     # Main app entry point
├── app.json                   # Expo configuration
├── package.json               # Dependencies
├── babel.config.js            # Babel configuration
├── assets/                    # App icons and splash images
└── src/
    ├── constants/
    │   ├── theme.js           # Colors, fonts, sizes
    │   └── data.js            # Clinical features, biomarkers
    └── screens/
        ├── SplashScreen.js    # App loading screen
        ├── HomeScreen.js      # Main dashboard
        ├── InputScreen.js     # Patient data input
        ├── AnalysisScreen.js  # AI analysis animation
        ├── ResultScreen.js    # Prediction results
        ├── BiomarkersScreen.js # Biomarker details
        └── AboutScreen.js     # Project information
```

## 🎨 Design System

### Color Palette
- **Primary**: Deep Medical Blue (#0A1628)
- **Accent**: Neural Teal (#00D4AA)
- **Success**: #00E5A0
- **Warning**: #FFB800
- **Danger**: #FF4D6A

### Typography
- Bold headings with tight letter spacing
- Clean, readable body text
- Medical-professional aesthetic

## ⚠️ Disclaimer

This application is for **research and educational purposes only**. It is not intended to replace professional medical diagnosis or advice. Always consult healthcare professionals for clinical decisions.

## 📚 Research Workflow

1. **Literature Review** - Analysis of existing PD detection research
2. **Dataset Understanding** - GNPC V1 Harmonized data exploration
3. **Data Preprocessing** - Integration and quality control
4. **Feature Selection** - RF + LASSO methods
5. **FNN Model Building** - Deep learning classifier
6. **Model Evaluation** - Performance metrics
7. **Biomarker Identification** - Biological validation

## 🛠️ Technologies Used

- **React Native** - Cross-platform mobile framework
- **Expo** - Development toolchain
- **React Navigation** - Screen navigation
- **Expo Linear Gradient** - UI gradients
- **React Native Reanimated** - Smooth animations

## 📄 License

This project is for academic/educational purposes.

---

**Built with ❤️ for Early Parkinson's Disease Detection**

