// App state management
const AppState = {
    records: [],
    settings: {},

    // Initialize app state
    init() {
        this.settings = Storage.loadSettings();
        this.records = Storage.loadRecords();
    },

    // Add a new record
    addRecord(record) {
        const newRecord = {
            ...record,
            id: Storage.generateId(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        this.records.push(newRecord);
        Storage.saveRecords(this.records);
        return newRecord;
    },

    // Update an existing record
    updateRecord(id, updates) {
        const index = this.records.findIndex(r => r.id === id);
        if (index !== -1) {
            const originalRecord = this.records[index];
            const updatedRecord = {
                id: originalRecord.id,  // Keep original ID
                createdAt: originalRecord.createdAt,  // Keep creation time
                description: updates.description,
                amount: parseFloat(updates.amount),
                category: updates.category,
                date: updates.date,
                updatedAt: new Date().toISOString()
            };
            
            this.records[index] = updatedRecord;
            Storage.saveRecords(this.records);
            console.log('Record updated:', updatedRecord); // For debugging
            return updatedRecord;
        }
        console.log('Record not found for update:', id); // For debugging
        return null;
    },

    // Delete a record
    deleteRecord(id) {
        this.records = this.records.filter(r => r.id !== id);
        Storage.saveRecords(this.records);
    },

    // Get record by ID
    getRecord(id) {
        return this.records.find(r => r.id === id);
    },

    // Update settings
    updateSettings(newSettings) {
        this.settings = { ...this.settings, ...newSettings };
        Storage.saveSettings(this.settings);
    },

    // Get dashboard statistics
    getDashboardStats() {
        const totalRecords = this.records.length;
        const totalSpent = this.records.reduce((sum, record) => sum + record.amount, 0);
        
        // Top category
        const categoryCounts = {};
        this.records.forEach(record => {
            categoryCounts[record.category] = (categoryCounts[record.category] || 0) + 1;
        });
        
        let topCategory = '-';
        if (Object.keys(categoryCounts).length > 0) {
            topCategory = Object.entries(categoryCounts)
                .sort(([,a], [,b]) => b - a)[0][0];
        }

        // Cap status
        const cap = this.settings.monthlyCap;
        const remaining = cap - totalSpent;
        const isExceeded = remaining < 0;

        return {
            totalRecords,
            totalSpent,
            topCategory,
            remaining,
            isExceeded
        };
    },

    // Get spending data for chart
    getSpendingChartData() {
        // Get last 7 days
        const today = new Date();
        const dates = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            dates.push(date.toISOString().split('T')[0]);
        }

        // Calculate daily spending
        const dailySpending = {};
        dates.forEach(date => {
            dailySpending[date] = 0;
        });

        this.records.forEach(record => {
            if (dates.includes(record.date)) {
                dailySpending[record.date] += record.amount;
            }
        });

        return {
            dates,
            dailySpending
        };
    }
};
