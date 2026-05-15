import React from 'react';

export default function SkeletonLoader() {
    return (
        <div className="py-8 bg-[#444654]">
            <div className="max-w-3xl mx-auto px-4 flex gap-6">
                <div className="w-8 h-8 rounded bg-emerald-600 shrink-0 flex items-center justify-center text-white font-bold">
                    IA
                </div>
                <div className="flex-1 space-y-4 py-1">
                    <div className="h-4 bg-gray-500/30 rounded w-3/4 animate-pulse"></div>
                    <div className="h-4 bg-gray-500/30 rounded w-full animate-pulse"></div>
                    <div className="h-4 bg-gray-500/30 rounded w-5/6 animate-pulse"></div>
                </div>
            </div>
        </div>
    );
}