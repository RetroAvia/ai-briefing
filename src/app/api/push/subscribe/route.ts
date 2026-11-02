import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';

interface SubscribeBody {
  endpoint: string;
  p256dh: string;
  auth: string;
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json() as SubscribeBody;
    const { endpoint, p256dh, auth } = body;

    if (!endpoint || !p256dh || !auth) {
      return NextResponse.json({ error: 'Missing subscription fields' }, { status: 400 });
    }

    const supabase = createServiceClient();
    const { error } = await supabase
      .from('push_subscriptions')
      .upsert({ endpoint, p256dh, auth }, { onConflict: 'endpoint' });

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error('[PUSH] Subscribe error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal error' },
      { status: 500 }
    );
  }
}
