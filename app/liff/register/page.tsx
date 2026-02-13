'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function RegisterForm() {
    const searchParams = useSearchParams();
    const lineUserId = searchParams.get('lineUserId') || '';
    const displayName = searchParams.get('displayName') || '';
    const pictureUrl = searchParams.get('pictureUrl') || '';

    const [studentCode, setStudentCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [studentName, setStudentName] = useState('');

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!studentCode.trim() || !lineUserId) return;

        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/liff/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    lineUserId,
                    studentCode: studentCode.trim(),
                    displayName,
                    pictureUrl,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || 'เกิดข้อผิดพลาด');
                return;
            }

            setStudentName(data.student?.student_name || studentCode);
            setSuccess(true);

            // Redirect to attendance page after 1.5s
            setTimeout(() => {
                window.location.href = `/liff/attendance?lineUserId=${lineUserId}`;
            }, 1500);
        } catch (err) {
            setError('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้');
        } finally {
            setLoading(false);
        }
    }

    if (success) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-green-400 via-green-500 to-emerald-600 flex items-center justify-center p-4">
                <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full text-center">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">ลงทะเบียนสำเร็จ! ✅</h2>
                    <p className="text-gray-600 mb-1">{studentName}</p>
                    <p className="text-sm text-gray-400">กำลังเปิดหน้าตรวจสอบการเข้าเรียน...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-400 via-green-500 to-emerald-600 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full">
                {/* Profile */}
                <div className="text-center mb-6">
                    {pictureUrl ? (
                        <img
                            src={pictureUrl}
                            alt="profile"
                            className="w-20 h-20 rounded-full mx-auto mb-3 border-4 border-green-200 shadow-lg"
                        />
                    ) : (
                        <div className="w-20 h-20 rounded-full bg-green-100 mx-auto mb-3 flex items-center justify-center">
                            <svg className="w-10 h-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                        </div>
                    )}
                    <h1 className="text-xl font-bold text-gray-900">ลงทะเบียนเข้าใช้งาน</h1>
                    {displayName && (
                        <p className="text-sm text-gray-500 mt-1">สวัสดี, {displayName} 👋</p>
                    )}
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            รหัสนักศึกษา
                        </label>
                        <input
                            type="text"
                            value={studentCode}
                            onChange={(e) => {
                                setStudentCode(e.target.value);
                                setError('');
                            }}
                            placeholder="เช่น 6501234567890"
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-center text-lg font-mono tracking-wider focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                            maxLength={20}
                            autoFocus
                        />
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-center">
                            <p className="text-red-600 text-sm font-medium">{error}</p>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={!studentCode.trim() || loading}
                        className="w-full py-3.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-bold text-lg shadow-lg shadow-green-200 hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <span className="flex items-center justify-center gap-2">
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                กำลังตรวจสอบ...
                            </span>
                        ) : (
                            'ยืนยันลงทะเบียน'
                        )}
                    </button>
                </form>

                <p className="text-[11px] text-gray-400 text-center mt-4 leading-relaxed">
                    ระบบจะผูกบัญชี LINE ของคุณกับรหัสนักศึกษา<br />
                    เพื่อเข้าดูสถิติการเข้าเรียนได้สะดวก
                </p>
            </div>
        </div>
    );
}

export default function LiffRegisterPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-gradient-to-br from-green-400 via-green-500 to-emerald-600 flex items-center justify-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-white"></div>
            </div>
        }>
            <RegisterForm />
        </Suspense>
    );
}
