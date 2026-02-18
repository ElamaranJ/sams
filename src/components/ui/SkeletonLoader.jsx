import React from 'react';

// Skeleton Card Component
export const SkeletonCard = ({ className = '' }) => {
    return (
        <div className={`premium-card p-6 ${className}`}>
            <div className="skeleton skeleton-avatar mb-4"></div>
            <div className="skeleton skeleton-title mb-3"></div>
            <div className="skeleton skeleton-text w-full"></div>
            <div className="skeleton skeleton-text w-4/5"></div>
            <div className="skeleton skeleton-text w-3/5"></div>
        </div>
    );
};

// Skeleton List Component
export const SkeletonList = ({ count = 3, className = '' }) => {
    return (
        <div className={`space-y-4 ${className}`}>
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 p-4 bg-white rounded-2xl">
                    <div className="skeleton skeleton-avatar flex-shrink-0"></div>
                    <div className="flex-1">
                        <div className="skeleton skeleton-text w-1/3 mb-2"></div>
                        <div className="skeleton skeleton-text w-2/3"></div>
                    </div>
                </div>
            ))}
        </div>
    );
};

// Skeleton Table Component
export const SkeletonTable = ({ rows = 5, columns = 4, className = '' }) => {
    return (
        <div className={`premium-card overflow-hidden ${className}`}>
            <div className="p-6 border-b border-slate-100">
                <div className="skeleton skeleton-title w-1/4"></div>
            </div>
            <div className="p-6">
                <table className="w-full">
                    <thead>
                        <tr>
                            {Array.from({ length: columns }).map((_, i) => (
                                <th key={i} className="text-left pb-4">
                                    <div className="skeleton skeleton-text w-24"></div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {Array.from({ length: rows }).map((_, rowIndex) => (
                            <tr key={rowIndex} className="border-t border-slate-100">
                                {Array.from({ length: columns }).map((_, colIndex) => (
                                    <td key={colIndex} className="py-4">
                                        <div className="skeleton skeleton-text w-32"></div>
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// Skeleton Dashboard Grid
export const SkeletonDashboard = ({ className = '' }) => {
    return (
        <div className={className}>
            <div className="mb-8">
                <div className="skeleton skeleton-title w-1/3 mb-2"></div>
                <div className="skeleton skeleton-text w-1/2"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="premium-card p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="skeleton skeleton-text w-24"></div>
                            <div className="skeleton w-12 h-12 rounded-xl"></div>
                        </div>
                        <div className="skeleton skeleton-title w-1/2 mb-2"></div>
                        <div className="skeleton skeleton-text w-1/3"></div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <SkeletonCard />
                <SkeletonCard />
            </div>
        </div>
    );
};

// Generic Skeleton Component
export const Skeleton = ({
    variant = 'text',
    width,
    height,
    className = '',
    count = 1
}) => {
    const getVariantClass = () => {
        switch (variant) {
            case 'title':
                return 'skeleton-title';
            case 'avatar':
                return 'skeleton-avatar';
            case 'text':
            default:
                return 'skeleton-text';
        }
    };

    const style = {
        ...(width && { width }),
        ...(height && { height })
    };

    if (count > 1) {
        return (
            <div className="space-y-2">
                {Array.from({ length: count }).map((_, i) => (
                    <div
                        key={i}
                        className={`skeleton ${getVariantClass()} ${className}`}
                        style={style}
                    />
                ))}
            </div>
        );
    }

    return (
        <div
            className={`skeleton ${getVariantClass()} ${className}`}
            style={style}
        />
    );
};

export default Skeleton;
