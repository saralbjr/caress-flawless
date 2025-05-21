import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import SkinAnalysis from '@/models/SkinAnalysis';
import Product from '@/models/Product';
import { authenticateUser } from '@/utils/auth';
import { getRecommendations, saveRecommendations } from '@/lib/recommendation-engine';
import { z } from 'zod';

// Validation schema for skin analysis submission
const skinAnalysisSchema = z.object({
  skinType: z.enum(['dry', 'oily', 'combination', 'sensitive', 'normal']),
  skinConcerns: z.array(z.string()),
  routinePreferences: z.object({
    currentProducts: z.array(z.string()).optional(),
    preferredIngredients: z.array(z.string()).optional(),
    avoidIngredients: z.array(z.string()).optional(),
    budget: z.enum(['low', 'medium', 'high']).optional(),
    routineComplexity: z.enum(['simple', 'moderate', 'comprehensive']).optional(),
  }),
  quizResponses: z.array(
    z.object({
      questionId: z.string(),
      answer: z.union([z.string(), z.array(z.string())]),
    })
  ),
});

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    
    // Authenticate user
    const user = await authenticateUser(req);
    if (!user) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Authentication required' 
        }, 
        { status: 401 }
      );
    }
    
    // Parse and validate request body
    const body = await req.json();
    const validation = skinAnalysisSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: validation.error.errors 
        }, 
        { status: 400 }
      );
    }
    
    const validatedData = validation.data;
    
    // Create new skin analysis record
    const skinAnalysis = await SkinAnalysis.create({
      userId: user.userId,
      ...validatedData,
    });
    
    // Get product recommendations
    const products = await Product.find({ category: 'beauty' });
    const recommendations = await getRecommendations(skinAnalysis, products);
    
    // Save recommended product IDs to the skin analysis record
    const recommendedProductIds = recommendations.map(item => item.product._id);
    await saveRecommendations(skinAnalysis._id, recommendedProductIds);
    
    // Return the recommendations with the response
    return NextResponse.json({
      success: true,
      skinAnalysisId: skinAnalysis._id,
      recommendations: recommendations.map(item => ({
        product: {
          _id: item.product._id,
          name: item.product.name,
          description: item.product.description,
          price: item.product.price,
          image: item.product.image,
        },
        score: item.score,
        matchReasons: item.matchReasons,
      })),
    });
  } catch (error) {
    console.error('Skin analysis error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Something went wrong. Please try again.' 
      }, 
      { status: 500 }
    );
  }
}

// Get a specific skin analysis by ID
export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    
    // Authenticate user
    const user = await authenticateUser(req);
    if (!user) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Authentication required' 
        }, 
        { status: 401 }
      );
    }
    
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    
    if (!id) {
      // Get all analyses for the user if no ID is provided
      const analyses = await SkinAnalysis.find({ userId: user.userId })
        .sort({ createdAt: -1 })
        .select('_id skinType skinConcerns createdAt');
      
      return NextResponse.json({
        success: true,
        analyses,
      });
    }
    
    // Get specific analysis by ID
    const analysis = await SkinAnalysis.findById(id)
      .populate('recommendedProducts');
    
    if (!analysis) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Analysis not found' 
        }, 
        { status: 404 }
      );
    }
    
    // Check if the analysis belongs to the authenticated user
    if (analysis.userId.toString() !== user.userId) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Unauthorized access' 
        }, 
        { status: 403 }
      );
    }
    
    return NextResponse.json({
      success: true,
      analysis,
    });
  } catch (error) {
    console.error('Get skin analysis error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch skin analysis' 
      }, 
      { status: 500 }
    );
  }
}
