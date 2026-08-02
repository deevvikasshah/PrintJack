export function formatPrice(amount) {
  if (amount == null || isNaN(amount)) return '₹0.00';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(date) {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-IN', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatDateLong(date) {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-IN', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatDistanceToNow(date) {
  if (!date) return '';
  const input = new Date(date);
  if (isNaN(input.getTime())) return '';
  const seconds = Math.max(0, Math.floor((Date.now() - input.getTime()) / 1000));

  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} day${days > 1 ? 's' : ''} ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} month${months > 1 ? 's' : ''} ago`;
  const years = Math.floor(months / 12);
  return `${years} year${years > 1 ? 's' : ''} ago`;
}

export function getStatusColor(status) {
  const colors = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    processing: 'bg-indigo-100 text-indigo-800',
    in_production: 'bg-indigo-100 text-indigo-800',
    printing: 'bg-purple-100 text-purple-800',
    quality_check: 'bg-cyan-100 text-cyan-800',
    shipped: 'bg-blue-100 text-blue-800',
    out_for_delivery: 'bg-orange-100 text-orange-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
    returned: 'bg-gray-100 text-gray-800',
    refunded: 'bg-emerald-100 text-emerald-800',
    processing_payment: 'bg-yellow-100 text-yellow-800',
    completed: 'bg-green-100 text-green-800',
    failed: 'bg-red-100 text-red-800',
    partially_refunded: 'bg-orange-100 text-orange-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
}

export function getStatusLabel(status) {
  const labels = {
    pending: 'Pending',
    confirmed: 'Confirmed',
    processing: 'Processing',
    in_production: 'In Production',
    printing: 'Printing',
    quality_check: 'Quality Check',
    shipped: 'Shipped',
    out_for_delivery: 'Out for Delivery',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
    returned: 'Returned',
    refunded: 'Refunded',
    completed: 'Completed',
    failed: 'Failed',
    processing_payment: 'Processing Payment',
    partially_refunded: 'Partially Refunded',
  };
  return labels[status] || status?.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) || '';
}

export function truncate(text, length = 100) {
  if (!text || text.length <= length) return text || '';
  return text.slice(0, length).trimEnd() + '...';
}

export function slugify(text) {
  if (!text) return '';
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

export function getInitials(name) {
  if (!name) return '?';
  return name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function pluralize(count, singular, plural) {
  return count === 1 ? singular : (plural || singular + 's');
}
