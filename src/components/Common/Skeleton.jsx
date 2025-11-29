import React from 'react';
import './Skeleton.css';

export const SkeletonCard = () => (
    <div className="skeleton-card animate-pulse">
        <div className="skeleton-header"></div>
        <div className="skeleton-line"></div>
        <div className="skeleton-line short"></div>
    </div>
);

export const SkeletonList = ({ count = 3 }) => (
    <>
        {[...Array(count)].map((_, i) => (
            <div key={i} className="skeleton-list-item animate-pulse mb-3">
                <div className="skeleton-avatar"></div>
                <div className="flex-grow-1">
                    <div className="skeleton-line"></div>
                    <div className="skeleton-line short"></div>
                </div>
            </div>
        ))}
    </>
);

export const SkeletonTable = ({ rows = 5 }) => (
    <div className="skeleton-table">
        {[...Array(rows)].map((_, i) => (
            <div key={i} className="skeleton-table-row animate-pulse">
                <div className="skeleton-line"></div>
                <div className="skeleton-line short"></div>
                <div className="skeleton-line"></div>
            </div>
        ))}
    </div>
);
