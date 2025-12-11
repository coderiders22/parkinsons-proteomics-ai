# """
# Flask API for Parkinson's Disease Prediction
# Uses saved LightGBM model + saved StandardScaler to predict from uploaded CSV files
# """

# from flask import Flask, request, jsonify, render_template
# import pandas as pd
# import numpy as np
# import joblib
# import os

# app = Flask(__name__)

# # -----------------------
# # CONFIG: update these
# # -----------------------
# MODEL_PATH = "lgb_model_20251211_093754.pkl"   # <-- your model file
# SCALER_PATH = "scaler_20251211_093754.pkl"     # <-- your scaler file

# # If you want to enforce a fixed feature order, set EXPECTED_FEATURES to that list.
# # Otherwise leave None and the app will infer seq_ columns or numeric columns.
# EXPECTED_FEATURES = None
# # EXPECTED_FEATURES = [
# #    "seq_6941_11", "seq_2585_2", ..., "seq_4891_50"
# # ]

# # -----------------------
# # Load model and scaler
# # -----------------------
# model = None
# scaler = None

# try:
#     model = joblib.load(MODEL_PATH)
#     print(f"Model loaded successfully from {MODEL_PATH}")
# except Exception as e:
#     print(f"Error loading model from {MODEL_PATH}: {e}")
#     model = None

# try:
#     scaler = joblib.load(SCALER_PATH)
#     print(f"Scaler loaded successfully from {SCALER_PATH}")
# except Exception as e:
#     print(f"Error loading scaler from {SCALER_PATH}: {e}")
#     scaler = None

# # -----------------------
# # Helper
# # -----------------------
# def _prepare_features(df):
#     """
#     Returns (X_df, feature_cols, error_message)
#     X_df -> DataFrame containing selected features in correct order.
#     """
#     # Ensure DataFrame
#     if isinstance(df, pd.Series):
#         df = df.to_frame().T

#     # If user provided EXPECTED_FEATURES, use them (and check existence)
#     if EXPECTED_FEATURES:
#         missing = [c for c in EXPECTED_FEATURES if c not in df.columns]
#         if missing:
#             return None, None, f"Missing expected feature columns: {missing}"
#         feature_cols = EXPECTED_FEATURES.copy()
#     else:
#         # Try seq_ columns first (your naming pattern)
#         seq_cols = [c for c in df.columns if str(c).startswith("seq_")]
#         if len(seq_cols) > 0:
#             feature_cols = seq_cols
#         else:
#             # fallback: use numeric columns
#             num_cols = df.select_dtypes(include=[np.number]).columns.tolist()
#             if len(num_cols) == 0:
#                 return None, None, "No numeric feature columns found and no EXPECTED_FEATURES set."
#             feature_cols = num_cols

#     # Select in that order, coerce to numeric (safe)
#     X = df[feature_cols].copy()
#     coerced = {}
#     for c in feature_cols:
#         # coerce strings that look numeric to numeric, keep original if already numeric
#         X[c] = pd.to_numeric(X[c], errors="coerce")
#         coerced[c] = X[c].isna().sum()

#     # If any column has NaNs after coercion, inform user which columns and how many NaNs
#     cols_with_na = {c: int(n) for c, n in coerced.items() if n > 0}
#     if len(cols_with_na) > 0:
#         return None, None, f"Found non-numeric or missing values in columns (rows with NaN): {cols_with_na}. Please clean or convert these columns."

#     return X, feature_cols, None


# # -----------------------
# # Routes
# # -----------------------
# @app.route('/')
# def home():
#     return render_template('index.html')


# @app.route('/predict', methods=['POST'])
# def predict():
#     # Basic checks
#     if model is None:
#         return jsonify({'success': False, 'error': f'Model not loaded. Check {MODEL_PATH}'}), 500
#     if scaler is None:
#         return jsonify({'success': False, 'error': f'Scaler not loaded. Check {SCALER_PATH}'}), 500

#     if 'file' not in request.files:
#         return jsonify({'success': False, 'error': 'No file uploaded. Please upload a CSV file.'}), 400

#     file = request.files['file']
#     if file.filename == '':
#         return jsonify({'success': False, 'error': 'No file selected. Please select a CSV file.'}), 400
#     if not file.filename.lower().endswith('.csv'):
#         return jsonify({'success': False, 'error': 'Invalid file format. Please upload a CSV file.'}), 400

#     try:
#         df = pd.read_csv(file)

#         # Prepare features (select, order, coerce)
#         X_df, feature_cols, prep_err = _prepare_features(df)
#         if prep_err:
#             return jsonify({'success': False, 'error': prep_err}), 400

#         # Ensure 2D shape and consistent dtype
#         if isinstance(X_df, pd.Series):
#             X_df = X_df.to_frame().T

#         # Validate number of features against scaler expectation if available
#         if hasattr(scaler, "n_features_in_"):
#             expected_n = int(getattr(scaler, "n_features_in_"))
#             if X_df.shape[1] != expected_n:
#                 return jsonify({
#                     'success': False,
#                     'error': f"Number of features in upload ({X_df.shape[1]}) does not match scaler's expected ({expected_n}). Ensure you provided the correct columns and order."
#                 }), 400

#         # Convert to numpy and apply saved scaler (use transform, NOT fit_transform)
#         X_np = X_df.to_numpy()
#         try:
#             X_scaled = scaler.transform(X_np)
#         except Exception as e:
#             return jsonify({'success': False, 'error': f"Scaler.transform failed: {str(e)}"}), 500

#         # Predictions
#         try:
#             probabilities = model.predict_proba(X_scaled)[:, 1]
#         except Exception as e:
#             # try using model.booster_ predict for raw LightGBM models
#             try:
#                 probabilities = model.predict(X_scaled)
#                 # If model.predict returns class labels or raw scores, coerce to probability-like values
#                 probabilities = np.asarray(probabilities, dtype=float)
#                 # If probabilities are 0/1, still fine; user will see them
#             except Exception as e2:
#                 return jsonify({'success': False, 'error': f"Model prediction failed: {e}; fallback failed: {e2}"}), 500

#         predictions = (probabilities >= 0.5).astype(int)

#         # Prepare results
#         results = []
#         for i in range(len(df)):
#             prob = float(probabilities[i])
#             conf_delta = abs(prob - 0.5)
#             confidence = 'High' if conf_delta > 0.3 else 'Medium' if conf_delta > 0.15 else 'Low'
#             results.append({
#                 'sample_index': i + 1,
#                 'prediction': "Parkinson's Disease" if int(predictions[i]) == 1 else "Healthy",
#                 'probability': round(prob * 100, 2),
#                 'confidence': confidence
#             })

#         pd_count = int(np.sum(predictions))
#         healthy_count = len(predictions) - pd_count
#         avg_probability = round(float(np.mean(probabilities)) * 100, 2)

#         return jsonify({
#             'success': True,
#             'total_samples': len(df),
#             'pd_positive': pd_count,
#             'healthy': healthy_count,
#             'average_probability': avg_probability,
#             'predictions': results,
#             'used_features': feature_cols
#         })

#     except Exception as e:
#         return jsonify({'success': False, 'error': f'Error processing file: {str(e)}'}), 500


# @app.route('/health')
# def health():
#     return jsonify({'status': 'healthy', 'model_loaded': model is not None, 'scaler_loaded': scaler is not None})


# if __name__ == '__main__':
#     app.run(debug=True, port=5000)

"""
Flask API for Parkinson's Disease Prediction + Evaluation Graphs
Uses saved LightGBM model + saved StandardScaler to predict from uploaded CSV files
Provides endpoints:
- /predict  (existing)
- /evaluate (new: returns metrics + base64 images for ROC/PR/CM/hist/fi)
- /shap/<idx> (new: returns PNG SHAP waterfall for a sample)
- /download_predictions (new: download latest predictions)
"""

from flask import Flask, request, jsonify, render_template, send_file
import pandas as pd
import numpy as np
import joblib
import os
import io
import base64
import matplotlib.pyplot as plt
from sklearn.metrics import roc_curve, auc, precision_recall_curve, average_precision_score, confusion_matrix, accuracy_score, precision_score, recall_score, f1_score
import seaborn as sns

# Optional: SHAP (may be heavy). We'll import lazily in the endpoint.
try:
    import shap
    SHAP_AVAILABLE = True
except Exception:
    SHAP_AVAILABLE = False

app = Flask(__name__)

# -----------------------
# CONFIG: update these
# -----------------------
MODEL_PATH = "lgb_model_20251211_093754.pkl"   # <-- your model file
SCALER_PATH = "scaler_20251211_093754.pkl"     # <-- your scaler file
EXPECTED_FEATURES = None  # optional: list of expected features in exact order

# -----------------------
# Load model and scaler
# -----------------------
model = None
scaler = None
last_predictions_df = None     # store last predictions (for download)
last_used_X_df = None          # store last used features dataframe (for SHAP)
last_feature_cols = None       # store last used feature list

try:
    model = joblib.load(MODEL_PATH)
    print(f"Model loaded successfully from {MODEL_PATH}")
except Exception as e:
    print(f"Error loading model from {MODEL_PATH}: {e}")
    model = None

try:
    scaler = joblib.load(SCALER_PATH)
    print(f"Scaler loaded successfully from {SCALER_PATH}")
except Exception as e:
    print(f"Error loading scaler from {SCALER_PATH}: {e}")
    scaler = None


# -----------------------
# Helper functions
# -----------------------
def _prepare_features(df):
    """Return (X_df, feature_cols, error_message) same as before."""
    if isinstance(df, pd.Series):
        df = df.to_frame().T

    if EXPECTED_FEATURES:
        missing = [c for c in EXPECTED_FEATURES if c not in df.columns]
        if missing:
            return None, None, f"Missing expected feature columns: {missing}"
        feature_cols = EXPECTED_FEATURES.copy()
    else:
        seq_cols = [c for c in df.columns if str(c).startswith("seq_")]
        if len(seq_cols) > 0:
            feature_cols = seq_cols
        else:
            num_cols = df.select_dtypes(include=[np.number]).columns.tolist()
            if len(num_cols) == 0:
                return None, None, "No numeric feature columns found and no EXPECTED_FEATURES set."
            feature_cols = num_cols

    X = df[feature_cols].copy()
    coerced = {}
    for c in feature_cols:
        X[c] = pd.to_numeric(X[c], errors="coerce")
        coerced[c] = X[c].isna().sum()

    cols_with_na = {c: int(n) for c, n in coerced.items() if n > 0}
    if len(cols_with_na) > 0:
        return None, None, f"Found non-numeric or missing values in columns (rows with NaN): {cols_with_na}. Please clean or convert these columns."

    return X, feature_cols, None


def _to_base64_png(fig):
    """
    Convert current matplotlib figure to base64 PNG string.
    Caller should plt.close(fig) after use or fig.clear()
    """
    buf = io.BytesIO()
    fig.savefig(buf, format='png', bbox_inches='tight')
    buf.seek(0)
    img_b64 = base64.b64encode(buf.read()).decode('utf-8')
    buf.close()
    return img_b64


def _plot_roc(y_true, probs, feature_cols=None):
    fig = plt.figure()
    fpr, tpr, _ = roc_curve(y_true, probs)
    roc_auc = auc(fpr, tpr)
    plt.plot(fpr, tpr, label=f"AUC = {roc_auc:.3f}")
    plt.plot([0,1], [0,1], linestyle='--', color='gray')
    plt.xlabel("False Positive Rate")
    plt.ylabel("True Positive Rate")
    plt.title("ROC Curve")
    plt.legend(loc='lower right')
    b64 = _to_base64_png(fig)
    plt.close(fig)
    return b64, float(roc_auc)


def _plot_pr(y_true, probs):
    fig = plt.figure()
    precision, recall, _ = precision_recall_curve(y_true, probs)
    ap = average_precision_score(y_true, probs)
    plt.plot(recall, precision, label=f"AP = {ap:.3f}")
    plt.xlabel("Recall")
    plt.ylabel("Precision")
    plt.title("Precision-Recall Curve")
    plt.legend(loc='upper right')
    b64 = _to_base64_png(fig)
    plt.close(fig)
    return b64, float(ap)


def _plot_confusion(y_true, preds):
    cm = confusion_matrix(y_true, preds)
    fig = plt.figure(figsize=(4,3))
    sns.heatmap(cm, annot=True, fmt="d", cmap="Blues")
    plt.xlabel("Predicted")
    plt.ylabel("Actual")
    plt.title("Confusion Matrix")
    b64 = _to_base64_png(fig)
    plt.close(fig)
    return b64, cm.tolist()


def _plot_prob_hist(probs):
    fig = plt.figure()
    plt.hist(probs * 100, bins=20, edgecolor='k')
    plt.xlabel("Predicted probability (%)")
    plt.ylabel("Count")
    plt.title("Probability Distribution")
    b64 = _to_base64_png(fig)
    plt.close(fig)
    return b64


def _plot_feature_importance(feature_cols):
    # Try obtaining feature importances from model
    try:
        importances = model.feature_importances_
        # If model has more features than selected (rare), align by length
        names = feature_cols
        # If lengths mismatch, truncate/pad accordingly
        length = min(len(names), len(importances))
        indices = np.argsort(importances)[::-1][:length]
        fig = plt.figure(figsize=(8, max(3, length*0.2)))
        plt.bar(range(length), importances[indices])
        plt.xticks(range(length), np.array(names)[indices], rotation=90)
        plt.title("Feature Importances")
        plt.tight_layout()
        b64 = _to_base64_png(fig)
        plt.close(fig)
        return b64
    except Exception as e:
        return None


# -----------------------
# Routes
# -----------------------
@app.route('/')
def home():
    return render_template('index.html')


@app.route('/predict', methods=['POST'])
def predict():
    global last_predictions_df, last_used_X_df, last_feature_cols

    if model is None:
        return jsonify({'success': False, 'error': f'Model not loaded. Check {MODEL_PATH}'}), 500
    if scaler is None:
        return jsonify({'success': False, 'error': f'Scaler not loaded. Check {SCALER_PATH}'}), 500

    if 'file' not in request.files:
        return jsonify({'success': False, 'error': 'No file uploaded. Please upload a CSV file.'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'success': False, 'error': 'No file selected. Please select a CSV file.'}), 400
    if not file.filename.lower().endswith('.csv'):
        return jsonify({'success': False, 'error': 'Invalid file format. Please upload a CSV file.'}), 400

    try:
        df = pd.read_csv(file)
        X_df, feature_cols, prep_err = _prepare_features(df)
        if prep_err:
            return jsonify({'success': False, 'error': prep_err}), 400

        # store last used for shap / download
        last_used_X_df = X_df.copy()
        last_feature_cols = feature_cols.copy()

        # Validate scaler feature count if possible
        if hasattr(scaler, "n_features_in_"):
            expected_n = int(getattr(scaler, "n_features_in_"))
            if X_df.shape[1] != expected_n:
                return jsonify({'success': False, 'error': f"Number of features in upload ({X_df.shape[1]}) does not match scaler's expected ({expected_n}). Ensure you provided the correct columns and order."}), 400

        X_np = X_df.to_numpy()
        X_scaled = scaler.transform(X_np)

        # predictions
        probabilities = None
        try:
            probabilities = model.predict_proba(X_scaled)[:, 1]
        except Exception:
            # fallback to raw predict
            probabilities = np.asarray(model.predict(X_scaled), dtype=float)

        preds = (probabilities >= 0.5).astype(int)

        # Prepare results
        results = []
        for i in range(len(df)):
            prob = float(probabilities[i])
            conf_delta = abs(prob - 0.5)
            confidence = 'High' if conf_delta > 0.3 else 'Medium' if conf_delta > 0.15 else 'Low'
            results.append({
                'sample_index': i + 1,
                'prediction': "Parkinson's Disease" if int(preds[i]) == 1 else "Healthy",
                'probability': round(prob * 100, 2),
                'confidence': confidence
            })

        pd_count = int(np.sum(preds))
        healthy_count = len(preds) - pd_count
        avg_probability = round(float(np.mean(probabilities)) * 100, 2)

        # Save last predictions (for download endpoint)
        last_predictions_df = df.copy()
        last_predictions_df["Prediction"] = preds
        last_predictions_df["Probability"] = probabilities

        return jsonify({
            'success': True,
            'total_samples': len(df),
            'pd_positive': pd_count,
            'healthy': healthy_count,
            'average_probability': avg_probability,
            'predictions': results,
            'used_features': feature_cols
        })

    except Exception as e:
        return jsonify({'success': False, 'error': f'Error processing file: {str(e)}'}), 500


@app.route('/evaluate', methods=['POST'])
def evaluate():
    """
    Upload a CSV (same columns as predict). If CSV includes 'true_label' column, ROC/PR/CM will be generated.
    Returns JSON containing metrics + base64 images for plots.
    """
    if model is None or scaler is None:
        return jsonify({'success': False, 'error': 'Model or scaler not loaded on server.'}), 500

    if 'file' not in request.files:
        return jsonify({'success': False, 'error': 'No file uploaded. Please upload a CSV file.'}), 400

    file = request.files['file']
    if file.filename == '' or not file.filename.lower().endswith('.csv'):
        return jsonify({'success': False, 'error': 'Please upload a valid CSV file.'}), 400

    try:
        df = pd.read_csv(file)
        X_df, feature_cols, prep_err = _prepare_features(df)
        if prep_err:
            return jsonify({'success': False, 'error': prep_err}), 400

        X_np = X_df.to_numpy()
        # validate scaler features if available
        if hasattr(scaler, "n_features_in_"):
            expected_n = int(getattr(scaler, "n_features_in_"))
            if X_df.shape[1] != expected_n:
                return jsonify({'success': False, 'error': f"Number of features in upload ({X_df.shape[1]}) does not match scaler's expected ({expected_n})."}), 400

        X_scaled = scaler.transform(X_np)

        # Get probabilities
        try:
            probs = model.predict_proba(X_scaled)[:, 1]
        except Exception:
            probs = np.asarray(model.predict(X_scaled), dtype=float)

        preds = (probs >= 0.5).astype(int)

        response = {
            "success": True,
            "total_samples": len(df),
            "used_features": feature_cols
        }

        # Probability histogram
        response["probability_histogram"] = _plot_prob_hist(probs)

        # Feature importance (base64)
        fi_img = _plot_feature_importance(feature_cols)
        response["feature_importance"] = fi_img

        # If true labels available, compute ROC/PR/CM and metrics
        if 'true_label' in df.columns:
            y_true = df['true_label'].to_numpy()
            # Basic metrics
            response["metrics"] = {
                "accuracy": float(accuracy_score(y_true, preds)),
                "precision": float(precision_score(y_true, preds, zero_division=0)),
                "recall": float(recall_score(y_true, preds, zero_division=0)),
                "f1": float(f1_score(y_true, preds, zero_division=0))
            }
            # ROC
            try:
                roc_img, roc_auc = _plot_roc(y_true, probs)
                response["roc_curve"] = roc_img
                response["roc_auc"] = roc_auc
            except Exception as e:
                response["roc_error"] = str(e)

            # PR
            try:
                pr_img, ap = _plot_pr(y_true, probs)
                response["pr_curve"] = pr_img
                response["average_precision"] = ap
            except Exception as e:
                response["pr_error"] = str(e)

            # Confusion matrix
            try:
                cm_img, cm = _plot_confusion(y_true, preds)
                response["confusion_matrix_img"] = cm_img
                response["confusion_matrix"] = cm
            except Exception as e:
                response["cm_error"] = str(e)
        else:
            response["note"] = "No 'true_label' column found — only probability histogram and feature importance are returned."

        return jsonify(response)

    except Exception as e:
        return jsonify({'success': False, 'error': f'Error during evaluation: {str(e)}'}), 500


@app.route('/shap/<int:idx>', methods=['GET'])
def shap_waterfall(idx):
    """
    Return a PNG waterfall SHAP plot for sample index idx (0-based).
    Uses last_used_X_df if available. Optionally pass a CSV via form-data 'file' to use that dataset.
    """
    if not SHAP_AVAILABLE:
        return jsonify({'success': False, 'error': 'shap library not available on server.'}), 500
    if model is None or scaler is None:
        return jsonify({'success': False, 'error': 'Model or scaler not loaded.'}), 500

    # If user uploaded a file in request, use that; otherwise use last_used_X_df
    if 'file' in request.files:
        file = request.files['file']
        df = pd.read_csv(file)
        X_df, feature_cols, prep_err = _prepare_features(df)
        if prep_err:
            return jsonify({'success': False, 'error': prep_err}), 400
    else:
        if last_used_X_df is None:
            return jsonify({'success': False, 'error': 'No recent dataset available. Upload a CSV in this request or call /predict first.'}), 400
        X_df = last_used_X_df.copy()
        feature_cols = last_feature_cols

    if idx < 0 or idx >= len(X_df):
        return jsonify({'success': False, 'error': f'Index {idx} out of range (0..{len(X_df)-1}).'}), 400

    # Prepare scaled data
    X_np = X_df.to_numpy()
    X_scaled = scaler.transform(X_np)

    # SHAP computation
    try:
        explainer = shap.TreeExplainer(model)
        shap_vals = explainer.shap_values(X_scaled)
        # shap_vals may be list for multiclass — handle binary
        if isinstance(shap_vals, list):
            shap_vals = shap_vals[1] if len(shap_vals) > 1 else shap_vals[0]

        # create waterfall/force plot for sample idx
        # Using shap.plots.waterfall (modern) or waterfall_legacy
        fig = plt.figure(figsize=(8,4))
        shap.plots._waterfall.waterfall_legacy(explainer.expected_value, shap_vals[idx], X_df.iloc[idx], show=False)
        buf = io.BytesIO()
        plt.savefig(buf, format='png', bbox_inches='tight')
        buf.seek(0)
        plt.close(fig)
        return send_file(buf, mimetype='image/png', as_attachment=False, download_name=f'shap_{idx}.png')
    except Exception as e:
        return jsonify({'success': False, 'error': f'Failed to compute SHAP: {str(e)}'}), 500


@app.route('/download_predictions', methods=['GET'])
def download_predictions():
    """
    Download the last prediction results CSV (if any).
    """
    global last_predictions_df
    if last_predictions_df is None:
        return jsonify({'success': False, 'error': 'No predictions available for download. Call /predict first.'}), 400
    buf = io.BytesIO()
    last_predictions_df.to_csv(buf, index=False)
    buf.seek(0)
    return send_file(buf, mimetype='text/csv', as_attachment=True, download_name='predictions_output.csv')


@app.route('/health')
def health():
    return jsonify({'status': 'healthy', 'model_loaded': model is not None, 'scaler_loaded': scaler is not None, 'shap_available': SHAP_AVAILABLE})


if __name__ == '__main__':
    # optional: set host to 0.0.0.0 for external access
    app.run(debug=True, port=5000)
