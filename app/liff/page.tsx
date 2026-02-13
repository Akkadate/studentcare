'use client';

import { useEffect, useState } from 'react';
import { initLiff, getLiffProfile } from '@/lib/liff';

export default function LiffEntryPage() {
    const [status, setStatus] = useState<'loading' | 'checking' | 'redirecting' | 'error'>('loading');
    const [errorMsg, setErrorMsg] = useState('');

    useEffect(() => {
        async function init() {
            try {
                setStatus('loading');
                await initLiff();

                setStatus('checking');
                const profile = await getLiffProfile();

                if (!profile) {
                    // liff.login() was called, page will reload
                    return;
                }

                // Check if already registered
                const res = await fetch(`/api/liff/profile?lineUserId=${profile.userId}`);
                const data = await res.json();

                if (data.registered) {
                    setStatus('redirecting');
                    window.location.href = `/liff/attendance?lineUserId=${profile.userId}`;
                } else {
                    setStatus('redirecting');
                    window.location.href = `/liff/register?lineUserId=${profile.userId}&displayName=${encodeURIComponent(profile.displayName)}&pictureUrl=${encodeURIComponent(profile.pictureUrl || '')}`;
                }
            } catch (error) {
                console.error('LIFF init error:', error);
                setErrorMsg('ไม่สามารถเชื่อมต่อ LINE ได้ กรุณาลองใหม่อีกครั้ง');
                setStatus('error');
            }
        }

        init();
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-400 via-green-500 to-emerald-600 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full text-center">
                {status === 'error' ? (
                    <>
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                        </div>
                        <p className="text-red-600 font-medium mb-4">{errorMsg}</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="px-6 py-3 bg-green-500 text-white rounded-xl font-medium hover:bg-green-600 transition-colors"
                        >
                            ลองใหม่
                        </button>
                    </>
                ) : (
                    <>
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                        </div>
                        <h1 className="text-xl font-bold text-gray-900 mb-2">
                            ระบบตรวจสอบการเข้าเรียน
                        </h1>
                        <p className="text-sm text-gray-500">
                            {status === 'loading' && 'กำลังเชื่อมต่อ LINE...'}
                            {status === 'checking' && 'กำลังตรวจสอบข้อมูล...'}
                            {status === 'redirecting' && 'กำลังเปิดหน้า...'}
                        </p>
                    </>
                )}
            </div>
        </div>
    );
}
