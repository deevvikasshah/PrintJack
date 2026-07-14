import React, { useState } from 'react';
import { Share2, Copy, Check } from 'lucide-react';
import { FaWhatsapp, FaFacebookF, FaTwitter, FaLinkedinIn } from 'react-icons/fa';
import toast from 'react-hot-toast';

export default function ShareButtons({ title, url, className = '' }) {
  const [copied, setCopied] = useState(false);
  const shareUrl = url || window.location.href;
  const shareTitle = encodeURIComponent(title || '');

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success('Link copied!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy');
    }
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <a
        href={`https://api.whatsapp.com/send?text=${shareTitle}%20${encodeURIComponent(shareUrl)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="w-9 h-9 rounded-full bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366] hover:text-white flex items-center justify-center transition-colors"
        title="Share on WhatsApp"
      >
        <FaWhatsapp size={16} />
      </a>
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="w-9 h-9 rounded-full bg-blue-600/10 text-blue-600 hover:bg-blue-600 hover:text-white flex items-center justify-center transition-colors"
        title="Share on Facebook"
      >
        <FaFacebookF size={14} />
      </a>
      <a
        href={`https://twitter.com/intent/tweet?title=${shareTitle}&url=${encodeURIComponent(shareUrl)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="w-9 h-9 rounded-full bg-sky-500/10 text-sky-500 hover:bg-sky-500 hover:text-white flex items-center justify-center transition-colors"
        title="Share on Twitter"
      >
        <FaTwitter size={14} />
      </a>
      <a
        href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(shareUrl)}&title=${shareTitle}`}
        target="_blank"
        rel="noopener noreferrer"
        className="w-9 h-9 rounded-full bg-blue-700/10 text-blue-700 hover:bg-blue-700 hover:text-white flex items-center justify-center transition-colors"
        title="Share on LinkedIn"
      >
        <FaLinkedinIn size={14} />
      </a>
      <button
        onClick={handleCopy}
        className="w-9 h-9 rounded-full bg-gray-100 text-gray-500 hover:bg-[#1D3557] hover:text-white flex items-center justify-center transition-colors"
        title="Copy Link"
      >
        {copied ? <Check size={14} /> : <Copy size={14} />}
      </button>
    </div>
  );
}
