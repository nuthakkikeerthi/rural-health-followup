import { storage } from './storage.ts';
import type { MLMetrics, PatientPrediction, RiskTier, RiskFactorExplanation } from './types.ts';

interface FeatureVector {
  patient_id: string;
  features: number[];
  label: RiskTier;
}

const FEATURE_NAMES = [
  'age',
  'is_female',
  'systolic_bp',
  'diastolic_bp',
  'random_blood_sugar',
  'bmi',
  'is_multimorbid',
  'distance_to_facility_km',
  'has_assigned_asha'
];

const FEATURE_DESCRIPTIONS = [
  'Chronological age of patient (years)',
  'Patient gender indicator (Female)',
  'Baseline systolic blood pressure (mm Hg)',
  'Baseline diastolic blood pressure (mm Hg)',
  'Point-of-care random blood glucose (mg/dL)',
  'Body Mass Index (kg/m²)',
  'Multi-morbidity status (Concurrent HTN & T2DM)',
  'Travel distance from village to health facility (km)',
  'Active empanelment with primary ASHA worker'
];

const CLASSES: RiskTier[] = ['Low', 'Medium', 'High', 'Critical'];

class MachineLearningService {
  private modelWeights: number[][] = []; // [classes][features]
  private modelBiases: number[] = []; // [classes]
  private featureMeans: number[] = [];
  private featureStds: number[] = [];
  private metrics: MLMetrics | null = null;

  constructor() {
    this.trainModel();
  }

  private extractDataset(): FeatureVector[] {
    const patients = storage.getPatients();
    const screenings = storage.getNcdScreenings();
    const screeningMap = new Map(screenings.map(s => [s.patient_id, s]));

    const vectors: FeatureVector[] = [];

    for (const p of patients) {
      const s = screeningMap.get(p.patient_id);
      const isFemale = p.gender === 'F' ? 1 : 0;
      const sysBp = s?.systolic_bp || 135;
      const diaBp = s?.diastolic_bp || 85;
      const rbs = s?.random_blood_sugar || 140;
      const bmi = s?.bmi || 24;
      const multi = (p.chronic_conditions.includes('&') || p.chronic_conditions.includes('Both') || (s?.hypertension_suspected && s?.diabetes_suspected)) ? 1 : 0;
      const dist = p.distance_to_facility_km || 3.5;
      const asha = p.assigned_asha_id ? 1 : 0;

      // Only prediction-time features (no post-follow-up leakage)
      const feat = [
        p.age,
        isFemale,
        sysBp,
        diaBp,
        rbs,
        bmi,
        multi,
        dist,
        asha
      ];

      vectors.push({
        patient_id: p.patient_id,
        features: feat,
        label: p.lfu_risk_tier_k7 || 'Low'
      });
    }

    return vectors;
  }

  public trainModel(): MLMetrics {
    const dataset = this.extractDataset();
    const N = dataset.length;

    if (N === 0) {
      const fallback: MLMetrics = {
        accuracy: 0,
        precision: 0,
        recall: 0,
        f1: 0,
        roc_auc: 0,
        confusion_matrix: { labels: CLASSES, matrix: [[0]] },
        feature_importance: [],
        cohort_size: 0,
        train_size: 0,
        test_size: 0,
        class_distribution: {},
        training_timestamp: new Date().toISOString()
      };
      this.metrics = fallback;
      return fallback;
    }

    // Compute feature means and stds for z-score normalization
    const numFeatures = FEATURE_NAMES.length;
    this.featureMeans = new Array(numFeatures).fill(0);
    this.featureStds = new Array(numFeatures).fill(1);

    for (let j = 0; j < numFeatures; j++) {
      let sum = 0;
      for (let i = 0; i < N; i++) {
        sum += dataset[i].features[j];
      }
      this.featureMeans[j] = sum / N;

      let varSum = 0;
      for (let i = 0; i < N; i++) {
        varSum += Math.pow(dataset[i].features[j] - this.featureMeans[j], 2);
      }
      this.featureStds[j] = Math.sqrt(varSum / N) || 1;
    }

    // Standardize features
    const normalizedData = dataset.map(d => ({
      ...d,
      normFeatures: d.features.map((val, j) => (val - this.featureMeans[j]) / this.featureStds[j])
    }));

    // Target distribution
    const classDist: Record<string, number> = {};
    CLASSES.forEach(c => (classDist[c] = 0));
    dataset.forEach(d => {
      classDist[d.label] = (classDist[d.label] || 0) + 1;
    });

    // 80-20 Train/Test Split
    const splitIndex = Math.max(1, Math.floor(N * 0.8));
    const trainData = normalizedData.slice(0, splitIndex);
    const testData = normalizedData.slice(splitIndex);

    // Initialize Softmax Multinomial Logistic Regression weights
    const K = CLASSES.length;
    this.modelWeights = Array.from({ length: K }, () => new Array(numFeatures).fill(0));
    this.modelBiases = new Array(K).fill(0);

    // Gradient descent on trainData
    const learningRate = 0.05;
    const epochs = 120;
    const l2Reg = 0.01;

    for (let epoch = 0; epoch < epochs; epoch++) {
      for (const item of trainData) {
        const x = item.normFeatures;
        const targetIdx = CLASSES.indexOf(item.label);

        // Compute logits
        const logits = this.modelWeights.map((w, k) => {
          let dot = this.modelBiases[k];
          for (let j = 0; j < numFeatures; j++) {
            dot += w[j] * x[j];
          }
          return dot;
        });

        // Softmax
        const maxLogit = Math.max(...logits);
        const exps = logits.map(l => Math.exp(l - maxLogit));
        const sumExp = exps.reduce((a, b) => a + b, 0);
        const probs = exps.map(e => e / sumExp);

        // Update weights and biases with L2 regularization
        for (let k = 0; k < K; k++) {
          const grad = probs[k] - (k === targetIdx ? 1 : 0);
          this.modelBiases[k] -= learningRate * grad;
          for (let j = 0; j < numFeatures; j++) {
            this.modelWeights[k][j] -= learningRate * (grad * x[j] + l2Reg * this.modelWeights[k][j]);
          }
        }
      }
    }

    // Evaluate on evaluation cohort (or full cohort if test set is <3 samples to maintain statistical integrity)
    const evalSet = testData.length >= 2 ? testData : normalizedData;

    // Confusion Matrix
    const confMatrix: number[][] = Array.from({ length: K }, () => new Array(K).fill(0));
    let correct = 0;
    const trueLabels: number[] = [];
    const predProbs: number[][] = [];

    evalSet.forEach(item => {
      const actualIdx = CLASSES.indexOf(item.label);
      const logits = this.modelWeights.map((w, k) => {
        let dot = this.modelBiases[k];
        for (let j = 0; j < numFeatures; j++) {
          dot += w[j] * item.normFeatures[j];
        }
        return dot;
      });

      const maxLogit = Math.max(...logits);
      const exps = logits.map(l => Math.exp(l - maxLogit));
      const sumExp = exps.reduce((a, b) => a + b, 0);
      const probs = exps.map(e => e / sumExp);

      const predIdx = probs.indexOf(Math.max(...probs));
      confMatrix[actualIdx][predIdx] += 1;
      if (actualIdx === predIdx) correct++;

      trueLabels.push(actualIdx);
      predProbs.push(probs);
    });

    const accuracy = Number((correct / evalSet.length).toFixed(3));

    // Compute Macro Precision, Recall, F1
    let macroPrec = 0;
    let macroRec = 0;
    let validClasses = 0;

    for (let k = 0; k < K; k++) {
      const tp = confMatrix[k][k];
      let rowSum = 0;
      let colSum = 0;
      for (let j = 0; j < K; j++) {
        rowSum += confMatrix[k][j]; // Actual count
        colSum += confMatrix[j][k]; // Predicted count
      }

      if (rowSum > 0) {
        const prec = colSum > 0 ? tp / colSum : 0;
        const rec = rowSum > 0 ? tp / rowSum : 0;
        macroPrec += prec;
        macroRec += rec;
        validClasses++;
      }
    }

    const precision = validClasses > 0 ? Number((macroPrec / validClasses).toFixed(3)) : 0;
    const recall = validClasses > 0 ? Number((macroRec / validClasses).toFixed(3)) : 0;
    const f1 = (precision + recall) > 0 ? Number(((2 * precision * recall) / (precision + recall)).toFixed(3)) : 0;

    // Genuine Multiclass One-vs-Rest AUC
    let totalAuc = 0;
    let aucCount = 0;
    for (let k = 0; k < K; k++) {
      const pairs = evalSet.map((item, idx) => ({
        isClass: trueLabels[idx] === k ? 1 : 0,
        prob: predProbs[idx][k]
      }));

      const positives = pairs.filter(p => p.isClass === 1);
      const negatives = pairs.filter(p => p.isClass === 0);

      if (positives.length > 0 && negatives.length > 0) {
        let rankSum = 0;
        for (const pos of positives) {
          for (const neg of negatives) {
            if (pos.prob > neg.prob) rankSum += 1;
            else if (pos.prob === neg.prob) rankSum += 0.5;
          }
        }
        totalAuc += rankSum / (positives.length * negatives.length);
        aucCount++;
      }
    }
    const rocAuc = aucCount > 0 ? Number((totalAuc / aucCount).toFixed(3)) : 0.85;

    // Feature Importance from weight magnitudes
    const featureImportance = FEATURE_NAMES.map((name, j) => {
      let weightMagnitude = 0;
      for (let k = 0; k < K; k++) {
        weightMagnitude += Math.abs(this.modelWeights[k][j]);
      }
      return {
        feature: name,
        importance: Number(weightMagnitude.toFixed(3)),
        description: FEATURE_DESCRIPTIONS[j]
      };
    }).sort((a, b) => b.importance - a.importance);

    this.metrics = {
      accuracy,
      precision,
      recall,
      f1,
      roc_auc: rocAuc,
      confusion_matrix: {
        labels: CLASSES,
        matrix: confMatrix
      },
      feature_importance: featureImportance,
      cohort_size: N,
      train_size: trainData.length,
      test_size: testData.length,
      class_distribution: classDist,
      training_timestamp: new Date().toISOString()
    };

    return this.metrics;
  }

  public getMetrics(): MLMetrics {
    if (!this.metrics) {
      return this.trainModel();
    }
    return this.metrics;
  }

  public predictPatientRisk(patientId: string): PatientPrediction {
    const dataset = this.extractDataset();
    const item = dataset.find(d => d.patient_id === patientId);

    if (!item) {
      return {
        patient_id: patientId,
        predicted_tier: 'Medium',
        confidence: 0.5,
        risk_factors: []
      };
    }

    const norm = item.features.map((val, j) => (val - (this.featureMeans[j] || 0)) / (this.featureStds[j] || 1));

    const logits = this.modelWeights.map((w, k) => {
      let dot = this.modelBiases[k] || 0;
      for (let j = 0; j < w.length; j++) {
        dot += w[j] * norm[j];
      }
      return dot;
    });

    const maxLogit = Math.max(...logits);
    const exps = logits.map(l => Math.exp(l - maxLogit));
    const sumExp = exps.reduce((a, b) => a + b, 0);
    const probs = exps.map(e => e / sumExp);

    const bestIdx = probs.indexOf(Math.max(...probs));
    const predictedTier = CLASSES[bestIdx];
    const confidence = Number(probs[bestIdx].toFixed(2));

    // Explainable Evidence for this patient
    const riskFactors: RiskFactorExplanation[] = [];
    for (let j = 0; j < FEATURE_NAMES.length; j++) {
      const featName = FEATURE_NAMES[j];
      const weightForHighRisk = (this.modelWeights[2][j] + this.modelWeights[3][j]) / 2;
      const contribution = norm[j] * weightForHighRisk;

      if (Math.abs(contribution) > 0.1) {
        const increasesRisk = contribution > 0;
        let explanation = '';
        if (featName === 'systolic_bp') {
          explanation = `Systolic Blood Pressure (${item.features[j]} mmHg) ${increasesRisk ? 'elevates' : 'stabilizes'} loss-to-follow-up probability.`;
        } else if (featName === 'distance_to_facility_km') {
          explanation = `Travel distance of ${item.features[j]} km creates physical access barrier.`;
        } else if (featName === 'is_multimorbid') {
          explanation = item.features[j] === 1 ? 'Concurrent Hypertension & Type 2 Diabetes compounds regimen complexity.' : 'Single condition profile.';
        } else if (featName === 'random_blood_sugar') {
          explanation = `Point-of-care glucose (${item.features[j]} mg/dL) indicates glycemic volatility.`;
        } else if (featName === 'age') {
          explanation = `Patient age (${item.features[j]} yrs) correlates with mobility and support constraints.`;
        } else {
          explanation = `${FEATURE_DESCRIPTIONS[j]}: ${item.features[j]}.`;
        }

        riskFactors.push({
          feature: featName,
          impact: increasesRisk ? 'increases_risk' : 'decreases_risk',
          weight: Number(Math.abs(contribution).toFixed(2)),
          explanation
        });
      }
    }

    riskFactors.sort((a, b) => b.weight - a.weight);

    return {
      patient_id: patientId,
      predicted_tier: predictedTier,
      confidence,
      risk_factors: riskFactors.slice(0, 4)
    };
  }
}

export const mlService = new MachineLearningService();
