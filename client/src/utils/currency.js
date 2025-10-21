// Remove USD conversion and formatting, use PKR (Rs) only

// Format a number as PKR with Rs prefix
export const formatPKR = (amount) => {
  if (amount === undefined || amount === null || isNaN(amount)) return '';
  return `Rs ${Number(amount).toLocaleString('en-PK', { maximumFractionDigits: 0 })}`;
};

// Format price in PKR (alias)
export const formatPrice = formatPKR;

// Calculate discount percentage
export const calculateDiscount = (originalPrice, currentPrice) => {
  if (!originalPrice || originalPrice <= currentPrice) return 0;
  return Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
};

// Format price range in PKR
export const formatPriceRange = (min, max) => {
  if (!min && !max) return '';
  if (!min) return `Up to ${formatPKR(max)}`;
  if (!max) return `From ${formatPKR(min)}`;
  return `${formatPKR(min)} - ${formatPKR(max)}`;
};

// Format large numbers with K/M/B suffix
export const formatLargeNumber = (num) => {
  if (num >= 1000000000) {
    return (num / 1000000000).toFixed(1) + 'B';
  }
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}; 