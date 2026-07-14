import React from 'react';
import { Link } from 'react-router-dom';
import { Globe } from 'lucide-react';
import { FaTwitter, FaLinkedin } from 'react-icons/fa';

export default function AuthorCard({ author, className = '' }) {
  if (!author) return null;

  return (
    <div className={`bg-white rounded-2xl border border-gray-100 p-6 ${className}`}>
      <div className="flex items-start gap-4">
        {author.avatar ? (
          <img
            src={author.avatar}
            alt={author.name}
            className="w-16 h-16 rounded-full object-cover flex-shrink-0"
          />
        ) : (
          <div className="w-16 h-16 bg-gradient-to-br from-[#E63946] to-[#1D3557] rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xl font-bold">
              {author.name?.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2) || '?'}
            </span>
          </div>
        )}
        <div className="flex-1">
          <h3 className="text-lg font-bold text-[#1D3557]">Written by {author.name}</h3>
          {author.role && <p className="text-sm text-gray-500">{author.role}</p>}
          {author.bio && <p className="text-sm text-gray-600 mt-2 leading-relaxed">{author.bio}</p>}
          <div className="flex items-center gap-3 mt-3">
            {author.social?.twitter && (
              <a href={author.social.twitter} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-sky-500 transition-colors">
                <FaTwitter size={16} />
              </a>
            )}
            {author.social?.linkedin && (
              <a href={author.social.linkedin} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-700 transition-colors">
                <FaLinkedin size={16} />
              </a>
            )}
            {author.social?.website && (
              <a href={author.social.website} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#1D3557] transition-colors">
                <Globe size={16} />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
