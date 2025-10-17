// UI management and DOM updates
const UI = {
    // DOM Elements
    elements: {},

    // Initialize UI
    init() {
        this.cacheElements();
        this.setupEventListeners();
        this.setCurrentDate();
        this.renderRecords();
        this.updateDashboard();
    },

    // Cache DOM elements
    cacheElements() {
        this.elements = {
            navLinks: document.querySelectorAll('.nav-link'),
            pages: document.querySelectorAll('.page'),
            recordsBody: document.getElementById('records-body'),
            totalRecordsEl: document.getElementById('total-records'),
            totalSpentEl: document.getElementById('total-spent'),
            topCategoryEl: document.getElementById('top-category'),
            monthlyCapEl: document.getElementById('monthly-cap'),
            capStatusEl: document.getElementById('cap-status'),
            spendingChartEl: document.getElementById('spending-chart'),
            searchInput: document.getElementById('search-input'),
            clearSearchBtn: document.getElementById('clear-search'),
            sortBySelect: document.getElementById('sort-by'),
            recordForm: document.getElementById('record-form'),
            formTitle: document.getElementById('form-title'),
            recordIdInput: document.getElementById('record-id'),
            descriptionInput: document.getElementById('description'),
            amountInput: document.getElementById('amount'),
            categorySelect: document.getElementById('category'),
            dateInput: document.getElementById('date'),
            cancelFormBtn: document.getElementById('cancel-form'),
            budgetCapInput: document.getElementById('budget-cap'),
            baseCurrencySelect: document.getElementById('base-currency'),
            exchangeRateInput: document.getElementById('exchange-rate'),
            saveSettingsBtn: document.getElementById('save-settings'),
            resetSettingsBtn: document.getElementById('reset-settings'),
            exportDataBtn: document.getElementById('export-data'),
            importDataBtn: document.getElementById('import-data'),
            importFileInput: document.getElementById('import-file'),
            ariaLiveRegion: document.getElementById('aria-live-region')
        };
    },

    // Setup event listeners
    setupEventListeners() {
        const { elements } = this;

        // Navigation
        elements.navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetPage = link.dataset.page;
                this.showPage(targetPage);
                
                // Update active nav link
                elements.navLinks.forEach(l => {
                    l.classList.toggle('active', l === link);
                });
            });
        });

        // Search and sort
        elements.searchInput.addEventListener('input', 
            Search.debounce(() => this.renderRecords(), 300)
        );
        elements.clearSearchBtn.addEventListener('click', () => {
            elements.searchInput.value = '';
            this.renderRecords();
        });
        elements.sortBySelect.addEventListener('change', () => this.renderRecords());

        // Form handling
        elements.recordForm.addEventListener('submit', (e) => this.handleFormSubmit(e));
        elements.cancelFormBtn.addEventListener('click', () => this.showPage('records'));

        // Settings
        elements.saveSettingsBtn.addEventListener('click', () => this.handleSaveSettings());
        elements.resetSettingsBtn.addEventListener('click', () => this.resetSettings());

        // Data management
        elements.exportDataBtn.addEventListener('click', () => this.exportData());
        elements.importDataBtn.addEventListener('click', () => elements.importFileInput.click());
        elements.importFileInput.addEventListener('change', (e) => this.handleImport(e));
    },

    // Show a specific page
    showPage(pageId) {
        this.elements.pages.forEach(page => {
            page.classList.toggle('active', page.id === pageId);
        });

        // Reset form when showing add-record page
        if (pageId === 'add-record') {
            this.resetForm();
        }
    },

    // Reset form to add new record state
    resetForm() {
        const { recordForm, formTitle, recordIdInput, descriptionInput, amountInput, categorySelect, dateInput } = this.elements;
        
        // Clear all form fields
        recordForm.reset();
        
        // Reset hidden fields and title
        formTitle.textContent = 'Add New Transaction';
        recordIdInput.value = '';
        
        // Clear all input values explicitly
        descriptionInput.value = '';
        amountInput.value = '';
        categorySelect.value = '';
        
        // Set current date
        this.setCurrentDate();
        
        // Clear any error states
        this.clearFormErrors();
        
        // Remove any error classes from inputs
        [descriptionInput, amountInput, categorySelect, dateInput].forEach(input => {
            input.classList.remove('input-error');
        });
    },

    // Set current date as default
    setCurrentDate() {
        const today = new Date().toISOString().split('T')[0];
        this.elements.dateInput.value = today;
    },

    // Clear form error states
    clearFormErrors() {
        const errorElements = document.querySelectorAll('.error-message');
        const inputElements = document.querySelectorAll('input, select');
        
        errorElements.forEach(el => el.style.display = 'none');
        inputElements.forEach(el => el.classList.remove('input-error'));
    },

    // Handle form submission
    handleFormSubmit(e) {
        e.preventDefault();
        console.log('Form submitted'); // For debugging
        this.clearFormErrors();

        const { descriptionInput, amountInput, categorySelect, dateInput, recordIdInput } = this.elements;
        
        // Validate inputs
        const descriptionValidation = Validators.validateDescription(descriptionInput.value);
        const amountValidation = Validators.validateAmount(amountInput.value);
        const categoryValidation = Validators.validateCategory(categorySelect.value);
        const dateValidation = Validators.validateDate(dateInput.value);

        let isValid = true;

        if (!descriptionValidation.isValid) {
            this.showFieldError('description', descriptionValidation.errors[0]);
            isValid = false;
        }

        if (!amountValidation.isValid) {
            this.showFieldError('amount', amountValidation.errors[0]);
            isValid = false;
        }

        if (!categoryValidation.isValid) {
            this.showFieldError('category', categoryValidation.errors[0]);
            isValid = false;
        }

        if (!dateValidation.isValid) {
            this.showFieldError('date', dateValidation.errors[0]);
            isValid = false;
        }

        if (!isValid) {
            this.announceToScreenReader('Please fix the form errors');
            return;
        }

        // Prepare record data
        const recordData = {
            description: descriptionInput.value.trim(),
            amount: parseFloat(amountInput.value),
            category: categorySelect.value,
            date: dateInput.value
        };

        // Save record
        const recordId = recordIdInput.value;
        let success = false;
        
        if (recordId) {
            // Update existing record
            const updatedRecord = AppState.updateRecord(recordId, recordData);
            if (updatedRecord) {
                this.announceToScreenReader('Transaction updated successfully');
                success = true;
            } else {
                this.announceToScreenReader('Error: Could not find record to update');
                return;
            }
        } else {
            // Add new record
            const newRecord = AppState.addRecord(recordData);
            if (newRecord) {
                this.announceToScreenReader('Transaction added successfully');
                success = true;
            }
        }

        if (success) {
            // Update UI and redirect only on success
            this.renderRecords();
            this.updateDashboard();
            this.showPage('records');
            
            // Reset form
            this.resetForm();
        }
    },

    // Show field error
    showFieldError(fieldName, message) {
        const errorElement = document.getElementById(`${fieldName}-error`);
        const inputElement = document.getElementById(fieldName);
        
        if (errorElement && inputElement) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
            inputElement.classList.add('input-error');
        }
    },

    // Render records table
    renderRecords() {
        const { recordsBody, searchInput, sortBySelect } = this.elements;
        const searchTerm = searchInput.value;
        const sortValue = sortBySelect.value;

        // Filter and sort records
        let filteredRecords = Search.filterRecords(AppState.records, searchTerm);
        filteredRecords = Search.sortRecords(filteredRecords, sortValue);

        // Update table
        if (filteredRecords.length === 0) {
            recordsBody.innerHTML = '';
            document.getElementById('no-records').style.display = 'block';
            return;
        }

        document.getElementById('no-records').style.display = 'none';

        const rows = filteredRecords.map(record => this.createRecordRow(record, searchTerm));
        recordsBody.innerHTML = rows.join('');

        // Add event listeners to action buttons
        this.attachRecordActionListeners();
    },

    // Create record row HTML
    createRecordRow(record, searchTerm) {
        if (!record || !record.id) {
            console.error('Invalid record:', record);
            return '';
        }
        
        const highlightedDescription = Search.highlightMatches(record.description || '', searchTerm);
        const highlightedCategory = Search.highlightMatches(record.category || '', searchTerm);
        
        return `
            <tr data-record-id="${record.id}">
                <td>${this.formatDate(record.date)}</td>
                <td>${highlightedDescription}</td>
                <td>${highlightedCategory}</td>
                <td>${this.formatCurrency(record.amount)}</td>
                <td class="actions-cell">
                    <button class="btn btn-secondary edit-record" aria-label="Edit transaction: ${record.description}"
                            onclick="UI.editRecord('${record.id}')">
                        Edit
                    </button>
                    <button class="btn btn-danger delete-record" aria-label="Delete transaction: ${record.description}"
                            onclick="UI.deleteRecord('${record.id}')">
                        Delete
                    </button>
                </td>
            </tr>
        `;
    },

    // Attach event listeners to record action buttons
    attachRecordActionListeners() {
        document.querySelectorAll('.edit-record').forEach(btn => {
            btn.removeEventListener('click', this._handleEdit);
            this._handleEdit = (e) => {
                e.preventDefault();
                e.stopPropagation();
                const recordId = e.target.closest('tr').dataset.recordId;
                if (recordId) {
                    this.editRecord(recordId);
                }
            };
            btn.addEventListener('click', this._handleEdit);
        });

        document.querySelectorAll('.delete-record').forEach(btn => {
            btn.removeEventListener('click', this._handleDelete);
            this._handleDelete = (e) => {
                e.preventDefault();
                e.stopPropagation();
                const recordId = e.target.closest('tr').dataset.recordId;
                if (recordId) {
                    this.deleteRecord(recordId);
                }
            };
            btn.addEventListener('click', this._handleDelete);
        });
    },

    // Edit record
    editRecord(recordId) {
        const record = AppState.getRecord(recordId);
        if (!record) {
            this.announceToScreenReader('Error: Record not found');
            return;
        }

        const { descriptionInput, amountInput, categorySelect, dateInput, recordIdInput, formTitle } = this.elements;

        // Clear any existing errors before populating form
        this.clearFormErrors();

        // Populate form
        descriptionInput.value = record.description;
        amountInput.value = record.amount.toFixed(2); // Ensure proper decimal format
        categorySelect.value = record.category;
        dateInput.value = record.date;
        recordIdInput.value = record.id;
        formTitle.textContent = 'Edit Transaction';

        this.showPage('add-record');
        this.announceToScreenReader(`Editing transaction: ${record.description}`);
    },

    // Delete record
    deleteRecord(recordId) {
        const record = AppState.getRecord(recordId);
        if (!record) return;

        if (confirm(`Are you sure you want to delete the transaction "${record.description}"?`)) {
            AppState.deleteRecord(recordId);
            this.renderRecords();
            this.updateDashboard();
            this.announceToScreenReader('Transaction deleted successfully');
        }
    },

    // Update dashboard
    updateDashboard() {
        const stats = AppState.getDashboardStats();
        const { totalRecordsEl, totalSpentEl, topCategoryEl, monthlyCapEl, capStatusEl } = this.elements;

        totalRecordsEl.textContent = stats.totalRecords;
        totalSpentEl.textContent = this.formatCurrency(stats.totalSpent);
        topCategoryEl.textContent = stats.topCategory;
        monthlyCapEl.textContent = this.formatCurrency(AppState.settings.monthlyCap);

        // Update cap status
        capStatusEl.textContent = stats.isExceeded ? 'Over budget!' : 'Under budget';
        capStatusEl.className = `cap-status ${stats.isExceeded ? 'cap-exceeded' : 'cap-ok'}`;

        // Update chart
        this.updateSpendingChart();
    },

    // Update spending chart
    updateSpendingChart() {
        const chartData = AppState.getSpendingChartData();
        const { spendingChartEl } = this.elements;

        if (chartData.dates.length === 0) {
            spendingChartEl.innerHTML = '<p>No data available for chart</p>';
            return;
        }

        const maxAmount = Math.max(...Object.values(chartData.dailySpending));
        const chartBars = chartData.dates.map(date => {
            const amount = chartData.dailySpending[date];
            const height = maxAmount > 0 ? (amount / maxAmount) * 100 : 0;
            const displayDate = this.formatDate(date, 'short');
            
            return `
                <div class="bar" style="height: ${height}%" title="${displayDate}: ${this.formatCurrency(amount)}">
                    <div class="bar-label">${displayDate}</div>
                </div>
            `;
        });

        spendingChartEl.innerHTML = chartBars.join('');
    },

    // Handle save settings
    handleSaveSettings() {
        const { budgetCapInput, baseCurrencySelect, exchangeRateInput } = this.elements;

        // Validate inputs
        const capValidation = Validators.validateMonthlyCap(budgetCapInput.value);
        const rateValidation = Validators.validateExchangeRate(exchangeRateInput.value);

        let isValid = true;

        if (!capValidation.isValid) {
            this.showFieldError('cap', capValidation.errors[0]);
            isValid = false;
        }

        if (!rateValidation.isValid) {
            this.showFieldError('rate', rateValidation.errors[0]);
            isValid = false;
        }

        if (!isValid) return;

        // Save settings
        const newSettings = {
            monthlyCap: parseFloat(budgetCapInput.value),
            baseCurrency: baseCurrencySelect.value,
            exchangeRate: parseFloat(exchangeRateInput.value)
        };

        AppState.updateSettings(newSettings);
        this.updateDashboard();
        this.announceToScreenReader('Settings saved successfully');
    },

    // Reset settings to defaults
    resetSettings() {
        if (confirm('Reset all settings to default values?')) {
            const defaultSettings = {
                monthlyCap: 500.00,
                baseCurrency: 'USD',
                exchangeRate: 1.00
            };

            AppState.updateSettings(defaultSettings);
            this.loadSettingsIntoForm();
            this.updateDashboard();
            this.announceToScreenReader('Settings reset to defaults');
        }
    },

    // Load settings into form
    loadSettingsIntoForm() {
        const { budgetCapInput, baseCurrencySelect, exchangeRateInput } = this.elements;
        const { settings } = AppState;

        budgetCapInput.value = settings.monthlyCap.toFixed(2);
        baseCurrencySelect.value = settings.baseCurrency;
        exchangeRateInput.value = settings.exchangeRate.toFixed(4);
    },

    // Export data
    exportData() {
        const dataStr = JSON.stringify(AppState.records, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `student-finance-data-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        this.announceToScreenReader('Data exported successfully');
    },

    // Handle import
    handleImport(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const validation = Validators.validateImportedData(e.target.result);
            
            if (validation.isValid) {
                if (confirm(`Import ${validation.data.length} records? This will replace your current data.`)) {
                    AppState.records = validation.data;
                    Storage.saveRecords(AppState.records);
                    this.renderRecords();
                    this.updateDashboard();
                    this.announceToScreenReader(`Successfully imported ${validation.data.length} records`);
                }
            } else {
                alert(`Invalid data format: ${validation.error}`);
            }
        };
        
        reader.readAsText(file);
        event.target.value = ''; // Reset file input
    },

    // Format currency
    formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    },

    // Format date
    formatDate(dateString, format = 'medium') {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: format === 'short' ? 'short' : 'long',
            day: 'numeric'
        });
    },

    // Announce to screen reader
    announceToScreenReader(message) {
        this.elements.ariaLiveRegion.textContent = message;
        setTimeout(() => {
            this.elements.ariaLiveRegion.textContent = '';
        }, 3000);
    }
};

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    AppState.init();
    UI.init();
});
