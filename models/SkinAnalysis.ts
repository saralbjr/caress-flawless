import mongoose from 'mongoose';

export interface ISkinAnalysis extends mongoose.Document {
  userId: mongoose.Types.ObjectId;
  skinType: 'dry' | 'oily' | 'combination' | 'sensitive' | 'normal';
  skinConcerns: string[];
  routinePreferences: {
    currentProducts: string[];
    preferredIngredients: string[];
    avoidIngredients: string[];
    budget: 'low' | 'medium' | 'high';
    routineComplexity: 'simple' | 'moderate' | 'comprehensive';
  };
  quizResponses: {
    questionId: string;
    answer: string | string[];
  }[];
  recommendedProducts: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const SkinAnalysisSchema = new mongoose.Schema<ISkinAnalysis>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    skinType: {
      type: String,
      enum: ['dry', 'oily', 'combination', 'sensitive', 'normal'],
      required: [true, 'Skin type is required'],
    },
    skinConcerns: {
      type: [String],
      enum: ['acne', 'aging', 'hyperpigmentation', 'redness', 'dryness', 'oiliness', 'sensitivity', 'dullness', 'uneven texture', 'large pores', 'blackheads', 'other'],
      default: [],
    },
    routinePreferences: {
      currentProducts: {
        type: [String],
        default: [],
      },
      preferredIngredients: {
        type: [String],
        default: [],
      },
      avoidIngredients: {
        type: [String],
        default: [],
      },
      budget: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium',
      },
      routineComplexity: {
        type: String,
        enum: ['simple', 'moderate', 'comprehensive'],
        default: 'moderate',
      },
    },
    quizResponses: [
      {
        questionId: {
          type: String,
          required: true,
        },
        answer: {
          type: mongoose.Schema.Types.Mixed,
          required: true,
        },
      },
    ],
    recommendedProducts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
      },
    ],
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export default mongoose.models.SkinAnalysis || mongoose.model<ISkinAnalysis>('SkinAnalysis', SkinAnalysisSchema);
