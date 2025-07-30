/**
 * Resume Builder Application
 * Pure vanilla JavaScript implementation with real-time updates,
 * theme switching, and local storage persistence
 */

class ResumeBuilder {
    constructor() {
        // Define input-output field mappings
        this.fieldMappings = {
            'input-name': 'preview-name',
            'input-title': 'preview-title',
            'input-phone': 'preview-phone',
            'input-email': 'preview-email',
            'input-location': 'preview-location',
            'input-linkedin': 'preview-linkedin',
            'input-summary': 'preview-summary',
            'input-experience': 'preview-experience',
            'input-education': 'preview-education',
            'input-skills': 'preview-skills'
        };

        // Default placeholder values
        this.defaultValues = {
            'preview-name': 'Your Name',
            'preview-title': 'Professional Title',
            'preview-phone': 'Phone',
            'preview-email': 'Email',
            'preview-location': 'Location',
            'preview-linkedin': 'LinkedIn',
            'preview-summary': 'Your professional summary will appear here...',
            'preview-experience': 'Your work experience will appear here...',
            'preview-education': 'Your education details will appear here...',
            'preview-skills': 'Your skills will appear here...'
        };

        this.currentTheme = 'modern';
        this.init();
    }

    /**
     * Initialize the application
     */
    init() {
        this.setupEventListeners();
        this.loadFromStorage();
        this.initializeTheme();
    }

    /**
     * Set up event listeners for all interactive elements
     */
    setupEventListeners() {
        // Real-time data binding for input fields
        Object.keys(this.fieldMappings).forEach(inputId => {
            const inputElement = document.getElementById(inputId);
            if (inputElement) {
                // Use 'input' event for real-time updates
                inputElement.addEventListener('input', (e) => {
                    this.updatePreview(inputId, e.target.value);
                    this.saveToStorage();
                });

                // Also listen for 'paste' events
                inputElement.addEventListener('paste', (e) => {
                    // Small delay to ensure pasted content is processed
                    setTimeout(() => {
                        this.updatePreview(inputId, e.target.value);
                        this.saveToStorage();
                    }, 10);
                });
            }
        });

        // Theme switching buttons
        document.getElementById('theme-modern').addEventListener('click', () => {
            this.switchTheme('modern');
        });

        document.getElementById('theme-classic').addEventListener('click', () => {
            this.switchTheme('classic');
        });

        // Print functionality
        document.getElementById('print-btn').addEventListener('click', () => {
            this.printResume();
        });

        // Clear all data
        document.getElementById('clear-btn').addEventListener('click', () => {
            this.clearAllData();
        });
    }

    /**
     * Update preview pane with input data
     * @param {string} inputId - ID of the input field
     * @param {string} value - New value to display
     */
    updatePreview(inputId, value) {
        const previewId = this.fieldMappings[inputId];
        const previewElement = document.getElementById(previewId);
        
        if (previewElement) {
            // Use default placeholder if value is empty
            const displayValue = value.trim() || this.defaultValues[previewId];
            
            // Handle different content types
            if (previewId === 'preview-summary') {
                previewElement.textContent = displayValue;
            } else if (['preview-experience', 'preview-education', 'preview-skills'].includes(previewId)) {
                // Preserve line breaks for multi-line content
                previewElement.innerHTML = this.formatMultilineContent(displayValue);
            } else {
                previewElement.textContent = displayValue;
            }
        }
    }

    /**
     * Format multi-line content for better display
     * @param {string} content - Raw content with line breaks
     * @returns {string} - HTML formatted content
     */
    formatMultilineContent(content) {
        if (!content || content === this.defaultValues['preview-' + content]) {
            return content;
        }
        
        // Convert line breaks to HTML and preserve formatting
        return content
            .split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0)
            .map(line => {
                // Add some basic formatting for bullet points
                if (line.startsWith('•') || line.startsWith('-')) {
                    return `<div class="bullet-point">${line}</div>`;
                }
                return `<div>${line}</div>`;
            })
            .join('');
    }

    /**
     * Switch between themes
     * @param {string} themeName - Name of the theme ('modern' or 'classic')
     */
    switchTheme(themeName) {
        const themeStylesheet = document.getElementById('theme-stylesheet');
        const themeButtons = document.querySelectorAll('.theme-btn');
        
        if (themeStylesheet) {
            // Update stylesheet href
            themeStylesheet.href = `theme-${themeName}.css`;
            this.currentTheme = themeName;
            
            // Update button states
            themeButtons.forEach(btn => {
                btn.classList.remove('active');
            });
            
            document.getElementById(`theme-${themeName}`).classList.add('active');
            
            // Save theme preference
            localStorage.setItem('resumeTheme', themeName);
        }
    }

    /**
     * Initialize theme from storage or default
     */
    initializeTheme() {
        const savedTheme = localStorage.getItem('resumeTheme') || 'modern';
        this.switchTheme(savedTheme);
    }

    /**
     * Save all form data to localStorage
     */
    saveToStorage() {
        const formData = {};
        
        Object.keys(this.fieldMappings).forEach(inputId => {
            const inputElement = document.getElementById(inputId);
            if (inputElement) {
                formData[inputId] = inputElement.value;
            }
        });
        
        localStorage.setItem('resumeFormData', JSON.stringify(formData));
    }

    /**
     * Load form data from localStorage
     */
    loadFromStorage() {
        const savedData = localStorage.getItem('resumeFormData');
        
        if (savedData) {
            try {
                const formData = JSON.parse(savedData);
                
                Object.keys(formData).forEach(inputId => {
                    const inputElement = document.getElementById(inputId);
                    if (inputElement && formData[inputId]) {
                        inputElement.value = formData[inputId];
                        // Trigger update to preview
                        this.updatePreview(inputId, formData[inputId]);
                    }
                });
            } catch (error) {
                console.error('Error loading saved data:', error);
            }
        }
    }

    /**
     * Clear all form data and reset to defaults
     */
    clearAllData() {
        if (confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
            // Clear form inputs
            Object.keys(this.fieldMappings).forEach(inputId => {
                const inputElement = document.getElementById(inputId);
                if (inputElement) {
                    inputElement.value = '';
                }
            });

            // Reset preview to defaults
            Object.keys(this.fieldMappings).forEach(inputId => {
                const previewId = this.fieldMappings[inputId];
                const previewElement = document.getElementById(previewId);
                if (previewElement) {
                    const defaultValue = this.defaultValues[previewId];
                    if (['preview-experience', 'preview-education', 'preview-skills'].includes(previewId)) {
                        previewElement.innerHTML = defaultValue;
                    } else {
                        previewElement.textContent = defaultValue;
                    }
                }
            });

            // Clear localStorage
            localStorage.removeItem('resumeFormData');
        }
    }

    /**
     * Print the resume (opens browser print dialog)
     */
    printResume() {
        // Add a slight delay to ensure any recent changes are rendered
        setTimeout(() => {
            window.print();
        }, 100);
    }
}

/**
 * Initialize the application when DOM is loaded
 */
document.addEventListener('DOMContentLoaded', () => {
    new ResumeBuilder();
});

/**
 * Handle browser back/forward navigation
 */
window.addEventListener('beforeunload', () => {
    // Data is automatically saved on each input change,
    // but this ensures any final changes are captured
    const resumeBuilder = new ResumeBuilder();
    resumeBuilder.saveToStorage();
});
