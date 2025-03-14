import { NextRequest, NextResponse } from 'next/server';
import { RagService } from '../../../services/RAGService';

const ragService = new RagService();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query } = body;
    
    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Query parameter is required and must be a string' },
        { status: 400 }
      );
    }
    
    const result = await ragService.search(query);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in websearch endpoint:', error);
    return NextResponse.json(
      { error: 'Failed to process search request' },
      { status: 500 }
    );
  }
} 