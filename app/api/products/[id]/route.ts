import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Product from '@/models/Product';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    
    const product = await Product.findById(params.id);
    
    if (!product) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Product not found' 
        }, 
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      product,
    });
  } catch (error) {
    console.error('Get product error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch product details' 
      }, 
      { status: 500 }
    );
  }
}