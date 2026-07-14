import React, { useState, useEffect, useMemo } from 'react';
import { List } from 'lucide-react';

export default function TableOfContents({ content, className = '' }) {
  const [activeId, setActiveId] = useState('');

  const headings = useMemo(() => {
    if (!content) return [];
    const regex = /<h([2-4])[^>]*id="([^"]*)"[^>]*>(.*?)<\/h\1>/gi;
    const matches = [];
    let match;
    while ((match = regex.exec(content)) !== null) {
      matches.push({
        level: parseInt(match[1]),
        id: match[2],
        text: match[3].replace(/<[^>]+>/g, ''),
      });
    }
    if (matches.length === 0) {
      const fallback = /<h([2-4])[^>]*>(.*?)<\/h\1>/gi;
      let fm;
      while ((fm = fallback.exec(content)) !== null) {
        const text = fm[2].replace(/<[^>]+>/g, '');
        const id = text.toLowerCase().replace(/[^\w]+/g, '-').replace(/^-|-$/g, '');
        matches.push({ level: parseInt(fm[1]), id, text });
      }
    }
    return matches;
  }, [content]);

  useEffect(() => {
    if (headings.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: '-80px 0px -80% 0px', threshold: 0 }
    );
    headings.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [headings]);

  if (headings.length < 2) return null;

  return (
    <div className={`bg-white rounded-2xl border border-gray-100 p-6 ${className}`}>
      <h3 className="text-sm font-bold text-[#1D3557] uppercase tracking-wider mb-4 flex items-center gap-2">
        <List size={16} className="text-[#E63946]" />
        Table of Contents
      </h3>
      <nav className="space-y-1">
        {headings.map((heading) => (
          <a
            key={heading.id}
            href={`#${heading.id}`}
            className={`block text-sm py-1.5 px-3 rounded-lg transition-colors ${
              heading.level === 3 ? 'pl-6' : heading.level === 4 ? 'pl-9' : ''
            } ${
              activeId === heading.id
                ? 'text-[#E63946] font-medium bg-red-50'
                : 'text-gray-500 hover:text-[#1D3557] hover:bg-gray-50'
            }`}
          >
            {heading.text}
          </a>
        ))}
      </nav>
    </div>
  );
}
