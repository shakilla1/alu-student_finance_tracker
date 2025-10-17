// Input validation functions
const Validators = {
    // Validate description
    validateDescription(description) {
        const errors = [];
        
        if (!description.trim()) {
            errors.push('Description is required');
        }
        
        if (/^\s|\s$/.test(description)) {
            errors.push('Description cannot have leading or trailing spaces');
        }
        
        if (/\b(\w+)\s+\1\b/i.test(description)) {
            errors.push('Description cannot contain duplicate consecutive words');
        }
        
        return {
            isValid: errors.length === 0,
            errors
        };
    },

    // Validate amount
    validateAmount(amount) {
        const amountPattern = /^(0|[1-9]\d*)(\.\d{1,2})?$/;
        const isValid = amountPattern.test(amount);
        
        return {
            isValid,
            errors: isValid ? [] : ['Enter a valid amount (e.g., 12.50)']
        };
    },

    // Validate category
    validateCategory(category) {
        const isValid = !!category;
        
        return {
            isValid,
            errors: isValid ? [] : ['Please select a category']
        };
    },

    // Validate date
    validateDate(date) {
        const datePattern = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;
        const isValid = datePattern.test(date);
        
        return {
            isValid,
            errors: isValid ? [] : ['Enter a valid date (YYYY-MM-DD)']
        };
    },

    // Validate monthly cap
    validateMonthlyCap(cap) {
        const capPattern = /^(0|[1-9]\d*)(\.\d{1,2})?$/;
        const isValid = capPattern.test(cap);
        
        return {
            isValid,
            errors: isValid ? [] : ['Enter a valid monthly cap amount']
        };
    },

    // Validate exchange rate
    validateExchangeRate(rate) {
        const ratePattern = /^(0|[1-9]\d*)(\.\d{1,4})?$/;
        const isValid = ratePattern.test(rate);
        
        return {
            isValid,
            errors: isValid ? [] : ['Enter a valid exchange rate']
        };
    },

    // Validate imported data
    validateImportedData(data) {
        try {
            const importedRecords = JSON.parse(data);
            
            if (!Array.isArray(importedRecords)) {
                throw new Error('Invalid data format');
            }
            
            for (const record of importedRecords) {
                if (!record.id || !record.description || typeof record.amount !== 'number' || 
                    !record.category || !record.date) {
                    throw new Error('Invalid record structure');
                }
            }
            
            return {
                isValid: true,
                data: importedRecords
            };
        } catch (error) {
            return {
                isValid: false,
                error: error.message
            };
        }
    }
};
