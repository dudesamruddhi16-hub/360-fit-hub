/**
 * Helper utility functions
 */

// Escape special regex characters
const escapeRegex = (s) => {
    return String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

module.exports = {
    escapeRegex
};
