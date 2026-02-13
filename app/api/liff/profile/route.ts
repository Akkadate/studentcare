import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
    const lineUserId = request.nextUrl.searchParams.get('lineUserId');

    if (!lineUserId) {
        return NextResponse.json({ error: 'lineUserId is required' }, { status: 400 });
    }

    try {
        // Look up student code from LINE UUID
        const { data: mapping, error: mappingError } = await supabase
            .from('line_students')
            .select('student_code, display_name, picture_url, registered_at, updated_at')
            .eq('line_user_id', lineUserId)
            .single();

        if (mappingError || !mapping) {
            return NextResponse.json({ registered: false });
        }

        // Get student analytics
        const { data: student } = await supabase
            .from('student_analytics')
            .select('*')
            .eq('student_code', mapping.student_code)
            .single();

        // Get all courses with attendance data
        const { data: courses } = await supabase
            .from('attendance_records')
            .select('course_code, course_name, revision_code, section, study_code, instructor, attendance_rate, absence_rate, present_count, absent_count, late_count, leave_count, total_sessions, class_check_raw')
            .eq('student_code', mapping.student_code)
            .order('absence_rate', { ascending: false });

        return NextResponse.json({
            registered: true,
            student: student || null,
            courses: courses || [],
            lineProfile: {
                displayName: mapping.display_name,
                pictureUrl: mapping.picture_url,
                registeredAt: mapping.registered_at,
                updatedAt: mapping.updated_at,
            },
        });
    } catch (error) {
        console.error('Error fetching LIFF profile:', error);
        return NextResponse.json(
            { error: 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง' },
            { status: 500 }
        );
    }
}
