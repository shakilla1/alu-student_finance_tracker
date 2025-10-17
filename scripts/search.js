// Search and filtering functionality
const Search = {
    // Filter records based on search term
    filterRecords(records, searchTerm) {
        if (!searchTerm.trim()) {
            return [...records];
        }
        
        try {
            const regex = new RegExp(searchTerm, 'i');
            return records.filter(record => 
                regex.test(record.description) || 
                regex.test(record.category) || 
                regex.test(record.amount.toString()) ||
                regex.test(record.date)
            );
        } catch (e) {
            // Invalid regex, show no results
            return [];
        }
    },

    // Sort records
    sortRecords(records, sortValue) {
        const sorted = [...records];
        
        sorted.sort((a, b) => {
            switch (sortValue) {
                case 'date-asc':
                    return new Date(a.date) - new Date(b.date);
                case 'date-desc':
                    return new Date(b.date) - new Date(a.date);
                case 'amount-asc':
                    return a.amount - b.amount;
                case 'amount-desc':
                    return b.amount - a.amount;
                case 'description-asc':
                    return a.description.localeCompare(b.description);
                case 'description-desc':
                    return b.description.localeCompare(a.description);
                case 'category-asc':
                    return a.category.localeCompare(b.category);
                default:
                    return 0;
            }
        });
        
        return sorted;
    },

    // Highlight search matches in text
    highlightMatches(text, searchTerm) {
        if (!searchTerm) return text;
        
        try {
            const regex = new RegExp(`(${searchTerm})`, 'gi');
            return text.replace(regex, '<mark>$1</mark>');
        } catch (e) {
            // Ignore invalid regex for highlighting
            return text;
        }
    },

    // Debounce function for search input
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
};
