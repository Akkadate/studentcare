import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { lineUserId, studentCode, displayName, pictureUrl } = body;

        if (!lineUserId || !studentCode) {
            return NextResponse.json(
                { error: 'lineUserId and studentCode are required' },
                { status: 400 }
            );
        }

        // Verify student exists in student_analytics
        const { data: student, error: studentError } = await supabase
            .from('student_analytics')
            .select('student_code, student_name, faculty, year_level')
            .eq('student_code', studentCode.trim())
            .single();

        if (studentError || !student) {
            return NextResponse.json(
                { error: 'ไม่พบรหัสนักศึกษานี้ในระบบ กรุณาตรวจสอบอีกครั้ง' },
                { status: 404 }
            );
        }

        // Check if LINE UUID already exists → update, else insert
        const { data: existing } = await supabase
            .from('line_students')
            .select('id')
            .eq('line_user_id', lineUserId)
            .single();

        if (existing) {
            // Update existing mapping
            const { error: updateError } = await supabase
                .from('line_students')
                .update({
                    student_code: studentCode.trim(),
                    display_name: displayName || null,
                    picture_url: pictureUrl || null,
                    updated_at: new Date().toISOString(),
                })
                .eq('line_user_id', lineUserId);

            if (updateError) throw updateError;
        } else {
            // Insert new mapping
            const { error: insertError } = await supabase
                .from('line_students')
                .insert({
                    line_user_id: lineUserId,
                    student_code: studentCode.trim(),
                    display_name: displayName || null,
                    picture_url: pictureUrl || null,
                });

            if (insertError) throw insertError;
        }

        return NextResponse.json({
            success: true,
            student: {
                student_code: student.student_code,
                student_name: student.student_name,
                faculty: student.faculty,
                year_level: student.year_level,
            },
            isUpdate: !!existing,
        });
    } catch (error) {
        console.error('Error registering LINE student:', error);
        return NextResponse.json(
            { error: 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง' },
            { status: 500 }
        );
    }
}
