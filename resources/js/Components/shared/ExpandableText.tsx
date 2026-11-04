import { useState } from 'react';

export default function ExpandableText({ text, limit = 180, className = '' }: { text: string; limit?: number; className?: string }) {
    const [expanded, setExpanded] = useState(false);
    if (text.length <= limit) return <p className={className}>{text}</p>;

    return (
        <div className={className}>
            <p>{expanded ? text : `${text.slice(0, limit).trim()}...`}</p>
            <button type="button" onClick={() => setExpanded((value) => !value)} className="mt-1 text-xs font-bold text-cyan-700 hover:text-cyan-900 dark:text-cyan-300">
                {expanded ? 'Read less' : 'Read more'}
            </button>
        </div>
    );
}