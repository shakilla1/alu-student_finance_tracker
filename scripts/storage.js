const STORAGE_KEY = 'student_finance_data';

// Storage operations
const Storage = {
    // Load records from localStorage
    loadRecords() {
        const savedRecords = localStorage.getItem(STORAGE_KEY);
        if (savedRecords) {
            try {
                let records = JSON.parse(savedRecords);
                // Ensure all records have required fields
                records = records.map(record => ({
                    ...record,
                    id: record.id || this.generateId(),
                    createdAt: record.createdAt || new Date().toISOString(),
                    updatedAt: record.updatedAt || new Date().toISOString()
                }));
                return records;
            } catch (e) {
                console.error('Error loading records:', e);
                return [];
            }
        }
        return [];
    },

    // Save records to localStorage
    saveRecords(records) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    },

    // Load settings from localStorage
    loadSettings() {
        const savedSettings = localStorage.getItem('finance_settings');
        if (savedSettings) {
            try {
                return JSON.parse(savedSettings);
            } catch (e) {
                console.error('Error loading settings:', e);
            }
        }
        return {
            monthlyCap: 500.00,
            baseCurrency: 'USD',
            exchangeRate: 1.00
        };
    },

    // Save settings to localStorage
    saveSettings(settings) {
        localStorage.setItem('finance_settings', JSON.stringify(settings));
    },

    // Generate unique ID
    generateId() {
        return 'txn_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
    }
};
