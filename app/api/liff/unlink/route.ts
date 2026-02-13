import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { lineUserId } = body;

        if (!lineUserId) {
            return NextResponse.json(
                { error: 'lineUserId is required' },
                { status: 400 }
            );
        }

        const { error } = await supabase
            .from('line_students')
            .delete()
            .eq('line_user_id', lineUserId);

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error unlinking LINE student:', error);
        return NextResponse.json(
            { error: 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง' },
            { status: 500 }
        );
    }
}
