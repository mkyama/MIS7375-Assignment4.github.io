// Oasis Health Care - Patient Registration Form JavaScript - Homework 4
// Enhanced with: Fetch API, Cookies, Local Storage, Session Timer

// ============================================================================
// COOKIE MANAGEMENT
// ============================================================================

// Set cookie with 48-hour expiration
function setCookie(name, value, hours = 48) {
    const d = new Date();
    d.setTime(d.getTime() + (hours * 60 * 60 * 1000));
    const expires = "expires=" + d.toUTCString();
    document.cookie = name + "=" + value + ";" + expires + ";path=/";
}

// Get cookie by name
function getCookie(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

// Delete/expire cookie
function deleteCookie(name) {
    document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
}

// ============================================================================
// LOCAL STORAGE MANAGEMENT
// ============================================================================

// Save individual field to localStorage
function saveToLocalStorage(fieldId) {
    const rememberMe = document.getElementById('rememberMe');
    if (!rememberMe || !rememberMe.checked) return;
    
    const field = document.getElementById(fieldId);
    if (!field) return;
    
// ============================================================================
// AUTO-SAVE TO LOCAL STORAGE
// ============================================================================

// Setup auto-save event listeners for all fields
function setupAutoSave() {
    console.log('🔧 Setting up auto-save for all fields...');
    
    // Text input fields to auto-save
    const textFields = [
        'firstName', 'middleInitial', 'lastName', 'dob', 'userId',
        'email', 'phone', 'address1', 'address2', 'city', 'state', 'zipCode',
        'symptoms', 'healthScore'
    ];
    
    // Add blur event listeners to text fields (saves when user leaves field)
    textFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) {
            // Save on blur (when user leaves the field)
            field.addEventListener('blur', function() {
                if (this.value) {
                    localStorage.setItem('oasis_' + fieldId, this.value);
                    console.log('💾 Auto-saved:', fieldId, '=', this.value);
                }
            });
            
            // Also save on change for dropdowns
            if (field.tagName === 'SELECT') {
                field.addEventListener('change', function() {
                    if (this.value) {
                        localStorage.setItem('oasis_' + fieldId, this.value);
                        console.log('💾 Auto-saved:', fieldId, '=', this.value);
                    }
                });
            }
        }
    });
    
    // Add change event listeners to radio buttons
    ['gender', 'vaccinated', 'insurance'].forEach(name => {
        const radios = document.querySelectorAll(`input[name="${name}"]`);
        radios.forEach(radio => {
            radio.addEventListener('change', function() {
                if (this.checked) {
                    localStorage.setItem('oasis_' + name, this.value);
                    console.log('💾 Auto-saved:', name, '=', this.value);
                }
            });
        });
    });
    
    // Add change event listeners to medical history checkboxes
    const medicalCheckboxes = document.querySelectorAll('input[name="medicalHistory"]');
    medicalCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            saveMedicalHistory();
        });
    });
    
    console.log('✅ Auto-save setup complete - data will save automatically as you fill the form');
}

// Save medical history checkboxes
function saveMedicalHistory() {
    const checkedConditions = Array.from(
        document.querySelectorAll('input[name="medicalHistory"]:checked')
    ).map(cb => cb.value);
    
    localStorage.setItem('oasis_medicalHistory', JSON.stringify(checkedConditions));
    console.log('💾 Auto-saved medical history:', checkedConditions);
}

// Load data from localStorage
function loadFromLocalStorage() {
    const cookieFirstName = getCookie('oasisUserFirstName');
    const storedFirstName = localStorage.getItem('oasis_firstName');
    
    console.log('🔍 Checking for saved data...');
    console.log('   Cookie firstName:', cookieFirstName);
    console.log('   Stored firstName:', storedFirstName);
    
    // If there's no data in localStorage, nothing to load
    if (!storedFirstName) {
        console.log('ℹ️ No saved data found');
        return;
    }
    
    // If cookie exists and matches, load everything
    if (cookieFirstName && cookieFirstName === storedFirstName) {
        console.log('✅ Cookie matches - loading all saved data');
        loadAllFieldsFromStorage();
    } else if (storedFirstName) {
        // Data exists but no cookie or mismatch - still load it (user may have cleared cookies)
        console.log('⚠️ Data exists but no cookie match - loading anyway');
        loadAllFieldsFromStorage();
    }
}

function loadAllFieldsFromStorage() {
    // Load all non-secure fields
    const fieldsToLoad = [
        'firstName', 'middleInitial', 'lastName', 'dob', 'userId',
        'email', 'phone', 'address1', 'address2', 'city', 'state', 'zipCode',
        'symptoms', 'healthScore'
    ];
    
    let fieldsRestored = 0;
    
    fieldsToLoad.forEach(fieldId => {
        const value = localStorage.getItem('oasis_' + fieldId);
        if (value) {
            const field = document.getElementById(fieldId);
            if (field) {
                field.value = value;
                fieldsRestored++;
                console.log('✅ Restored:', fieldId, '=', value);
            }
        }
    });
    
    // Load radio buttons
    ['gender', 'vaccinated', 'insurance'].forEach(name => {
        const value = localStorage.getItem('oasis_' + name);
        if (value) {
            const radio = document.querySelector(`input[name="${name}"][value="${value}"]`);
            if (radio) {
                radio.checked = true;
                fieldsRestored++;
                console.log('✅ Restored:', name, '=', value);
            }
        }
    });
    
    // Load medical history checkboxes
    const medicalHistory = localStorage.getItem('oasis_medicalHistory');
    if (medicalHistory) {
        try {
            const conditions = JSON.parse(medicalHistory);
            conditions.forEach(condition => {
                const checkbox = document.querySelector(`input[name="medicalHistory"][value="${condition}"]`);
                if (checkbox) {
                    checkbox.checked = true;
                }
            });
            fieldsRestored++;
            console.log('✅ Restored medical history:', conditions);
        } catch (e) {
            console.error('❌ Error loading medical history:', e);
        }
    }
    
    // Update health score display
    const healthScore = document.getElementById('healthScore');
    if (healthScore && healthScore.value) {
        const valueDisplay = document.getElementById('healthScoreValue');
        if (valueDisplay) {
            valueDisplay.textContent = healthScore.value;
        }
    }
    
    console.log(`✅ Restored ${fieldsRestored} fields from localStorage`);
    alert(`Welcome back! We've restored your form data (${fieldsRestored} fields). You can continue where you left off.`);
}

// Clear all local storage data
function clearLocalStorage() {
    const keys = Object.keys(localStorage);
    let cleared = 0;
    keys.forEach(key => {
        if (key.startsWith('oasis_')) {
            localStorage.removeItem(key);
            cleared++;
        }
    });
    console.log(`🗑️ Cleared ${cleared} items from localStorage`);
}

// Clear all data (cookie + localStorage)
function clearAllData() {
    deleteCookie('oasisUserFirstName');
    clearLocalStorage();
    document.getElementById('welcomeMessage').textContent = 'Welcome, New User! 🌟';
    document.getElementById('newUserCheckbox').style.display = 'none';
    console.log('✅ All data cleared - starting fresh');
}

// ============================================================================
// REMEMBER ME FUNCTIONALITY
// ============================================================================

function handleRememberMe() {
    const rememberMe = document.getElementById('rememberMe');
    const firstName = document.getElementById('firstName').value;
    
    if (!rememberMe.checked) {
        // User unchecked - clear everything
        clearAllData();
    } else if (firstName) {
        // User re-checked - save firstName to cookie
        setCookie('oasisUserFirstName', firstName, 48);
    }
}

// ============================================================================
// NEW USER FUNCTIONALITY
// ============================================================================

function startAsNewUser() {
    const checkbox = document.getElementById('notMeCheckbox');
    if (checkbox.checked) {
        if (confirm('This will clear all saved data and start fresh. Continue?')) {
            clearAllData();
            // Reset the form
            document.getElementById('patient-form').reset();
            document.getElementById('rememberMe').checked = true;
            checkbox.checked = false;
        } else {
            checkbox.checked = false;
        }
    }
}

// ============================================================================
// WELCOME MESSAGE & USER RECOGNITION
// ============================================================================

function setupWelcomeMessage() {
    const firstName = getCookie('oasisUserFirstName');
    const welcomeMsg = document.getElementById('welcomeMessage');
    const newUserCheckbox = document.getElementById('newUserCheckbox');
    const notMeLabel = document.getElementById('notMeLabel');
    
    if (firstName) {
        // Returning user
        welcomeMsg.textContent = `Welcome back, ${firstName}! 👋`;
        welcomeMsg.style.color = '#6a0dad';
        
        // Show "Not me?" checkbox
        newUserCheckbox.style.display = 'block';
        notMeLabel.textContent = `Not ${firstName}? Click here to start as a new user.`;
        
        // Pre-fill firstName field
        document.getElementById('firstName').value = firstName;
        
        // Load other data from localStorage
        loadFromLocalStorage();
    } else {
        // New user
        welcomeMsg.textContent = 'Welcome, New User! 🌟';
        welcomeMsg.style.color = '#7b2cbf';
        newUserCheckbox.style.display = 'none';
    }
}

// ============================================================================
// 10-MINUTE COUNTDOWN TIMER
// ============================================================================

let sessionTimeRemaining = 600; // 10 minutes in seconds
let timerInterval;
let warningShown = false;

function startSessionTimer() {
    const timerDisplay = document.getElementById('timerDisplay');
    const sessionTimeLeft = document.getElementById('sessionTimeLeft');
    const timerBox = document.getElementById('sessionTimer');
    
    if (!timerDisplay) return;
    
    timerInterval = setInterval(() => {
        sessionTimeRemaining--;
        
        // Update timer displays
        const minutes = Math.floor(sessionTimeRemaining / 60);
        const seconds = sessionTimeRemaining % 60;
        const timeString = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        
        timerDisplay.textContent = timeString;
        if (sessionTimeLeft) {
            sessionTimeLeft.textContent = timeString;
        }
        
        // Warning at 2 minutes
        if (sessionTimeRemaining === 120 && !warningShown) {
            if (timerBox) timerBox.classList.add('warning');
            warningShown = true;
            
            const continueSession = confirm(
                '⚠️ SESSION TIMEOUT WARNING\n\n' +
                'You have 2 minutes remaining to complete the form.\n\n' +
                'Click OK to add 5 more minutes, or Cancel to continue.'
            );
            
            if (continueSession) {
                sessionTimeRemaining += 300; // Add 5 minutes
                if (timerBox) timerBox.classList.remove('warning');
                warningShown = false;
            }
        }
        
        // Time expired
        if (sessionTimeRemaining <= 0) {
            clearInterval(timerInterval);
            alert('⏰ Session expired! The form will reset.');
            resetForm();
            sessionTimeRemaining = 600;
            warningShown = false;
            if (timerBox) timerBox.classList.remove('warning');
            startSessionTimer();
        }
    }, 1000);
}

function resetForm() {
    const form = document.getElementById('patient-form');
    if (form) form.reset();
    clearAllData();
    sessionTimeRemaining = 600;
    updateTimerDisplay();
}

function updateTimerDisplay() {
    const minutes = Math.floor(sessionTimeRemaining / 60);
    const seconds = sessionTimeRemaining % 60;
    const timeString = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    
    const timerDisplay = document.getElementById('timerDisplay');
    const sessionTimeLeft = document.getElementById('sessionTimeLeft');
    
    if (timerDisplay) timerDisplay.textContent = timeString;
    if (sessionTimeLeft) sessionTimeLeft.textContent = timeString;
}

// ============================================================================
// TIME-BASED DYNAMIC CONTENT (Ads/Promotions)
// ============================================================================

let promoShown = false;

// Rotating health tips
const healthTips = [
    { icon: '💧', text: 'Drink at least 8 glasses of water daily to stay hydrated and maintain optimal body function.' },
    { icon: '🏃', text: 'Aim for 150 minutes of moderate exercise per week to improve cardiovascular health and boost energy.' },
    { icon: '😴', text: 'Get 7-9 hours of quality sleep each night to support immune function and mental clarity.' },
    { icon: '🥗', text: 'Eat a rainbow of fruits and vegetables daily to get essential vitamins and antioxidants.' },
    { icon: '🧘', text: 'Practice stress management through meditation, deep breathing, or yoga to improve overall wellbeing.' },
    { icon: '🦷', text: 'Don\'t forget dental health! Brush twice daily and floss to prevent cavities and gum disease.' },
    { icon: '🌞', text: 'Spend time outdoors daily for vitamin D, but always use sunscreen to protect your skin.' },
    { icon: '👨‍⚕️', text: 'Schedule annual check-ups even when you feel healthy - prevention is the best medicine!' }
];

let currentTipIndex = 0;

function rotateHealthTip() {
    const tipElement = document.getElementById('rotatingTipText');
    const iconElement = document.getElementById('tipIcon');
    
    if (tipElement && iconElement) {
        currentTipIndex = (currentTipIndex + 1) % healthTips.length;
        const tip = healthTips[currentTipIndex];
        
        // Fade out
        tipElement.style.opacity = '0';
        iconElement.style.opacity = '0';
        
        setTimeout(() => {
            tipElement.textContent = tip.text;
            iconElement.textContent = tip.icon;
            // Fade in
            tipElement.style.opacity = '1';
            iconElement.style.opacity = '1';
        }, 500);
    }
}

function startRotatingTips() {
    // Set initial tip
    const tipElement = document.getElementById('rotatingTipText');
    const iconElement = document.getElementById('tipIcon');
    if (tipElement && iconElement) {
        tipElement.style.transition = 'opacity 0.5s ease';
        iconElement.style.transition = 'opacity 0.5s ease';
        tipElement.textContent = healthTips[0].text;
        iconElement.textContent = healthTips[0].icon;
    }
    
    // Rotate every 8 seconds
    setInterval(rotateHealthTip, 8000);
}

function showAppointmentReminder() {
    // Show appointment reminder randomly (50% chance) after 10 seconds
    setTimeout(() => {
        if (Math.random() > 0.5) {
            const reminder = document.getElementById('appointmentReminder');
            if (reminder) {
                reminder.style.display = 'block';
                // Slide in animation
                reminder.style.opacity = '0';
                reminder.style.transform = 'translateY(-20px)';
                setTimeout(() => {
                    reminder.style.transition = 'all 0.5s ease';
                    reminder.style.opacity = '1';
                    reminder.style.transform = 'translateY(0)';
                }, 100);
            }
        }
    }, 10000);
}

function showTimeBasedContent() {
    const now = new Date();
    const hours = now.getHours();
    const day = now.getDay(); // 0 = Sunday, 6 = Saturday
    
    // Show promotional modal based on time of day
    if (!promoShown) {
        setTimeout(() => {
            showPromoModal(hours);
            promoShown = true;
        }, 5000); // Show after 5 seconds on page
    }
    
    // Show sidebar ads based on time
    showSidebarAds(hours);
    
    // Show bottom banner on weekends or after 5 PM
    if (day === 0 || day === 6 || hours >= 17) {
        showBottomBanner(hours, day);
    }
    
    // Start rotating health tips
    startRotatingTips();
    
    // Show appointment reminder
    showAppointmentReminder();
}

function showPromoModal(hours) {
    const modal = document.getElementById('promoModal');
    const overlay = document.getElementById('promoOverlay');
    const title = document.getElementById('promoTitle');
    const message = document.getElementById('promoMessage');
    
    let promoContent = {};
    
    if (hours >= 6 && hours < 12) {
        // Morning promotion
        promoContent = {
            title: '🌅 Good Morning! Vaccination Special',
            message: 'Start your day healthy! Get your flu shot this morning and receive $15 OFF. Protection for you and your family. Walk-ins welcome until noon!'
        };
    } else if (hours >= 12 && hours < 17) {
        // Afternoon promotion
        promoContent = {
            title: '☀️ Afternoon Health Screening Special',
            message: 'Complete your annual physical this afternoon and save 20%! Comprehensive health check including blood work, vital signs, and consultation.'
        };
    } else if (hours >= 17 && hours < 22) {
        // Evening promotion
        promoContent = {
            title: '🌙 Evening Wellness Check',
            message: 'Extended hours this evening! Schedule your appointment after work. We\'re open until 8 PM for your convenience.'
        };
    } else {
        // Night/Early morning
        promoContent = {
            title: '🌃 24/7 Nurse Hotline Available',
            message: 'Need medical advice right now? Our registered nurses are available 24/7 at 1-800-OASIS-24. Free for registered patients!'
        };
    }
    
    title.textContent = promoContent.title;
    message.textContent = promoContent.message;
    
    overlay.style.display = 'block';
    modal.style.display = 'block';
}

function closePromoModal() {
    document.getElementById('promoModal').style.display = 'none';
    document.getElementById('promoOverlay').style.display = 'none';
}

function handlePromoAction() {
    const hours = new Date().getHours();
    let actionMessage = '';
    
    if (hours >= 6 && hours < 12) {
        actionMessage = '💉 Great choice! Call (512) 555-CARE to schedule your vaccination. Mention code "MORNING15" for your discount!';
    } else if (hours >= 12 && hours < 17) {
        actionMessage = '🩺 Excellent! Call (512) 555-CARE to book your health screening. Use code "SCREEN20" for 20% off!';
    } else if (hours >= 17 && hours < 22) {
        actionMessage = '📅 Perfect timing! Call (512) 555-CARE to schedule your evening appointment. Extended hours available!';
    } else {
        actionMessage = '📞 Our 24/7 Nurse Hotline: 1-800-OASIS-24. Save this number for any medical questions!';
    }
    
    alert(actionMessage);
    closePromoModal();
}

function showSidebarAds(hours) {
    const leftAd = document.getElementById('leftAd');
    const rightAd = document.getElementById('rightAd');
    
    // Show left ad in morning/afternoon (business hours)
    if (hours >= 8 && hours < 18) {
        leftAd.style.display = 'block';
    }
    
    // Show right ad in afternoon/evening
    if (hours >= 12 && hours < 20) {
        rightAd.style.display = 'block';
    }
}

function showBottomBanner(hours, day) {
    const bottomAd = document.getElementById('bottomAd');
    const title = document.getElementById('bottomAdTitle');
    const message = document.getElementById('bottomAdMessage');
    
    if (day === 0 || day === 6) {
        // Weekend special
        title.textContent = '🎉 Weekend Walk-In Special!';
        message.textContent = 'No appointment needed! Saturday hours: 9 AM - 2 PM. First-come, first-served.';
    } else if (hours >= 17) {
        // Evening special
        title.textContent = '⚡ Evening Extended Hours!';
        message.textContent = 'We\'re open late! Schedule your appointment after work. Available until 8 PM tonight.';
    }
    
    bottomAd.style.display = 'block';
    
    // Auto-hide after 15 seconds
    setTimeout(() => {
        bottomAd.style.display = 'none';
    }, 15000);
}

// Update dynamic content every 5 minutes to reflect time changes
function startDynamicContentUpdates() {
    setInterval(() => {
        const hours = new Date().getHours();
        const day = new Date().getDay();
        showSidebarAds(hours);
    }, 300000); // Update every 5 minutes
}

// ============================================================================
// DYNAMIC DATE/TIME UPDATE
// ============================================================================

function updateDateTime() {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    
    const now = new Date();
    const dayName = days[now.getDay()];
    const monthName = months[now.getMonth()];
    const date = now.getDate();
    const year = now.getFullYear();
    
    // Update date display - Format: "Saturday, Dec 6, 2025"
    const dateString = `${dayName}, ${monthName.substring(0, 3)} ${date}, ${year}`;
    const dateElement = document.getElementById('currentDateTime');
    if (dateElement) {
        dateElement.textContent = dateString;
        console.log('✅ Date updated:', dateString);
    } else {
        console.error('❌ Element currentDateTime not found!');
    }
    
    // Update live time display - Format: "18:59:35"
    let hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    
    const timeString = `${hours}:${minutes}:${seconds}`;
    const timeElement = document.getElementById('liveTime');
    if (timeElement) {
        timeElement.textContent = timeString;
        console.log('✅ Time updated:', timeString);
    } else {
        console.error('❌ Element liveTime not found!');
    }
}

// ============================================================================
// FETCH API - LOAD STATES AND CONDITIONS
// ============================================================================

async function loadStates() {
    try {
        const response = await fetch('states.json');
        if (!response.ok) throw new Error('Failed to load states');
        
        const data = await response.json();
        const stateSelect = document.getElementById('state');
        
        data.states.forEach(state => {
            const option = document.createElement('option');
            option.value = state.code;
            option.textContent = state.name;
            stateSelect.appendChild(option);
        });
        
        // Restore saved state if available
        const savedState = localStorage.getItem('oasis_state');
        if (savedState) {
            stateSelect.value = savedState;
        }
    } catch (error) {
        console.error('Error loading states:', error);
        // Fallback to hardcoded states if fetch fails
        addFallbackStates();
    }
}

function addFallbackStates() {
    const stateSelect = document.getElementById('state');
    const states = [
        { code: 'TX', name: 'Texas' },
        { code: 'CA', name: 'California' },
        { code: 'NY', name: 'New York' },
        { code: 'FL', name: 'Florida' }
    ];
    
    states.forEach(state => {
        const option = document.createElement('option');
        option.value = state.code;
        option.textContent = state.name;
        stateSelect.appendChild(option);
    });
}

async function loadMedicalConditions() {
    try {
        const response = await fetch('conditions.json');
        if (!response.ok) throw new Error('Failed to load conditions');
        
        const data = await response.json();
        const container = document.getElementById('conditionsCheckboxes');
        
        data.conditions.forEach(condition => {
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = condition.id;
            checkbox.name = 'medicalHistory';
            checkbox.value = condition.value;
            checkbox.title = `Check if you have had ${condition.label}`;
            checkbox.onchange = saveMedicalHistory;
            
            const label = document.createElement('label');
            label.htmlFor = condition.id;
            label.textContent = condition.label;
            
            container.appendChild(checkbox);
            container.appendChild(label);
            container.appendChild(document.createTextNode(' '));
        });
        
        // Restore saved conditions if available
        const savedConditions = localStorage.getItem('oasis_medicalHistory');
        if (savedConditions) {
            try {
                const conditions = JSON.parse(savedConditions);
                conditions.forEach(conditionValue => {
                    const checkbox = document.querySelector(`input[name="medicalHistory"][value="${conditionValue}"]`);
                    if (checkbox) checkbox.checked = true;
                });
            } catch (e) {
                console.error('Error loading saved conditions:', e);
            }
        }
    } catch (error) {
        console.error('Error loading conditions:', error);
        // Fallback to hardcoded conditions
        addFallbackConditions();
    }
}

function addFallbackConditions() {
    const container = document.getElementById('conditionsCheckboxes');
    const conditions = [
        { id: 'chickenPox', value: 'ChickenPox', label: 'Chicken Pox' },
        { id: 'measles', value: 'Measles', label: 'Measles' },
        { id: 'covid19', value: 'Covid19', label: 'Covid-19' },
        { id: 'smallPox', value: 'SmallPox', label: 'Small Pox' },
        { id: 'tetanus', value: 'Tetanus', label: 'Tetanus' }
    ];
    
    conditions.forEach(condition => {
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = condition.id;
        checkbox.name = 'medicalHistory';
        checkbox.value = condition.value;
        checkbox.onchange = saveMedicalHistory;
        
        const label = document.createElement('label');
        label.htmlFor = condition.id;
        label.textContent = condition.label;
        
        container.appendChild(checkbox);
        container.appendChild(label);
        container.appendChild(document.createTextNode(' '));
    });
}

// ============================================================================
// FORM VALIDATION & HELPER FUNCTIONS
// ============================================================================

// Calculate min and max dates for validation
const today = new Date();
const minDate = new Date(today.getFullYear() - 120, today.getMonth(), today.getDate());
const maxDate = today;

function setDateConstraints() {
    const dobField = document.getElementById('dob');
    if (dobField) {
        dobField.min = minDate.toISOString().split('T')[0];
        dobField.max = maxDate.toISOString().split('T')[0];
    }
}

function updateHealthScore() {
    const slider = document.getElementById('healthScore');
    const display = document.getElementById('healthScoreValue');
    if (slider && display) {
        display.textContent = slider.value;
    }
}

// Error and success display functions
function showError(field, message) {
    clearError(field);
    field.style.borderColor = '#dc2626';
    field.style.backgroundColor = '#fee2e2';
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.style.color = '#dc2626';
    errorDiv.style.fontSize = '14px';
    errorDiv.style.marginTop = '5px';
    errorDiv.textContent = message;
    
    field.parentElement.appendChild(errorDiv);
}

function showSuccess(field) {
    clearError(field);
    field.style.borderColor = '#22c55e';
    field.style.backgroundColor = '#f0fdf4';
}

function clearError(field) {
    field.style.borderColor = '#c8a2c8';
    field.style.backgroundColor = 'white';
    
    const parent = field.parentElement;
    const existingError = parent.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }
}

// ============================================================================
// PHONE NUMBER FORMATTING
// ============================================================================

function setupPhoneFormatting() {
    const phoneField = document.getElementById('phone');
    if (!phoneField) return;
    
    let phoneDigits = '';
    
    phoneField.addEventListener('keydown', function(e) {
        const key = e.key;
        const keyCode = e.keyCode || e.which;
        
        if ([8, 46, 9, 27, 13].includes(keyCode)) {
            if ((keyCode === 8 || keyCode === 46) && phoneDigits.length > 0) {
                e.preventDefault();
                phoneDigits = phoneDigits.slice(0, -1);
                updatePhoneDisplay();
            }
            return;
        }
        
        if ((key >= '0' && key <= '9') && phoneDigits.length < 10) {
            e.preventDefault();
            phoneDigits += key;
            updatePhoneDisplay();
        } else {
            e.preventDefault();
        }
    });
    
    function updatePhoneDisplay() {
        let display = '';
        if (phoneDigits.length >= 6) {
            display = phoneDigits.slice(0, 3) + '-' + phoneDigits.slice(3, 6) + '-' + phoneDigits.slice(6);
        } else if (phoneDigits.length >= 3) {
            display = phoneDigits.slice(0, 3) + '-' + phoneDigits.slice(3);
        } else {
            display = phoneDigits;
        }
        phoneField.value = display;
        
        if (phoneDigits.length === 10) {
            showSuccess(phoneField);
        } else if (phoneDigits.length > 0) {
            showError(phoneField, `Phone incomplete (${phoneDigits.length}/10 digits)`);
        }
    }
}

// ============================================================================
// ZIP CODE FORMATTING
// ============================================================================

function setupZIPFormatting() {
    const zipField = document.getElementById('zipCode');
    if (!zipField) return;
    
    let zipDigits = '';
    
    zipField.addEventListener('keydown', function(e) {
        const key = e.key;
        const keyCode = e.keyCode || e.which;
        
        if ([8, 46, 9, 27, 13].includes(keyCode)) {
            if ((keyCode === 8 || keyCode === 46) && zipDigits.length > 0) {
                e.preventDefault();
                zipDigits = zipDigits.slice(0, -1);
                updateZIPDisplay();
            }
            return;
        }
        
        if ((key >= '0' && key <= '9') && zipDigits.length < 9) {
            e.preventDefault();
            zipDigits += key;
            updateZIPDisplay();
        } else {
            e.preventDefault();
        }
    });
    
    function updateZIPDisplay() {
        let display = '';
        if (zipDigits.length > 5) {
            display = zipDigits.slice(0, 5) + '-' + zipDigits.slice(5);
        } else {
            display = zipDigits;
        }
        zipField.value = display;
        
        if (zipDigits.length === 5 || zipDigits.length === 9) {
            showSuccess(zipField);
        } else if (zipDigits.length > 0) {
            showError(zipField, `ZIP incomplete (${zipDigits.length} digits)`);
        }
    }
}

// ============================================================================
// SSN FORMATTING
// ============================================================================

function setupSSNFormatting() {
    const ssnDisplayField = document.getElementById('ssnDisplay');
    const ssnField = document.getElementById('ssn');
    if (!ssnDisplayField || !ssnField) return;
    
    let ssnDigits = '';
    
    ssnDisplayField.addEventListener('keydown', function(e) {
        const key = e.key;
        const keyCode = e.keyCode || e.which;
        
        if ([8, 46, 9, 27, 13].includes(keyCode)) {
            if ((keyCode === 8 || keyCode === 46) && ssnDigits.length > 0) {
                e.preventDefault();
                ssnDigits = ssnDigits.slice(0, -1);
                updateSSNDisplay();
            }
            return;
        }
        
        if ((key >= '0' && key <= '9') && ssnDigits.length < 9) {
            e.preventDefault();
            ssnDigits += key;
            updateSSNDisplay();
        } else {
            e.preventDefault();
        }
    });
    
    function updateSSNDisplay() {
        ssnField.value = ssnDigits;
        
        let display = '';
        const numEntered = ssnDigits.length;
        
        if (numEntered >= 5) {
            display = '***-' + 
                     (numEntered > 5 ? '**' : '*'.repeat(numEntered - 3)) + 
                     '-' + 
                     (numEntered > 5 ? '*'.repeat(numEntered - 5) : '');
        } else if (numEntered >= 3) {
            display = '***-' + '*'.repeat(numEntered - 3);
        } else if (numEntered > 0) {
            display = '*'.repeat(numEntered);
        } else {
            display = '***-**-****';
        }
        
        ssnDisplayField.value = display;
        
        if (ssnDigits.length === 9) {
            showSuccess(ssnDisplayField);
        } else if (ssnDigits.length > 0) {
            showError(ssnDisplayField, `SSN incomplete (${ssnDigits.length}/9 digits)`);
        }
    }
}

// ============================================================================
// PASSWORD VALIDATION
// ============================================================================

function setupPasswordValidation() {
    const passwordField = document.getElementById('password');
    const confirmPasswordField = document.getElementById('confirmPassword');
    
    if (passwordField) {
        passwordField.addEventListener('blur', validatePassword);
    }
    
    if (confirmPasswordField) {
        confirmPasswordField.addEventListener('blur', function() {
            const password = document.getElementById('password').value;
            const confirmPassword = this.value;
            
            if (confirmPassword && password !== confirmPassword) {
                showError(this, 'Passwords do not match');
            } else if (confirmPassword && password === confirmPassword) {
                showSuccess(this);
            }
        });
    }
}

function validatePassword() {
    const password = this.value;
    if (!password) return;
    
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecial = /[!@#$%^&*()\-_+=\\\/<>.,`~]/.test(password);
    const validLength = password.length >= 8 && password.length <= 30;
    
    if (!validLength) {
        showError(this, 'Password must be 8-30 characters');
    } else if (!hasUpper) {
        showError(this, 'Password must contain at least one uppercase letter');
    } else if (!hasLower) {
        showError(this, 'Password must contain at least one lowercase letter');
    } else if (!hasNumber) {
        showError(this, 'Password must contain at least one number');
    } else if (!hasSpecial) {
        showError(this, 'Password must contain at least one special character');
    } else {
        showSuccess(this);
    }
}

// ============================================================================
// FORM REVIEW FUNCTION
// ============================================================================

function reviewForm() {
    const formData = {
        firstName: document.getElementById('firstName').value,
        middleInitial: document.getElementById('middleInitial').value,
        lastName: document.getElementById('lastName').value,
        dob: document.getElementById('dob').value,
        userId: document.getElementById('userId').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        address1: document.getElementById('address1').value,
        address2: document.getElementById('address2').value,
        city: document.getElementById('city').value,
        state: document.getElementById('state').value,
        zipCode: document.getElementById('zipCode').value,
        symptoms: document.getElementById('symptoms').value,
        gender: document.querySelector('input[name="gender"]:checked')?.value || '',
        vaccinated: document.querySelector('input[name="vaccinated"]:checked')?.value || '',
        insurance: document.querySelector('input[name="insurance"]:checked')?.value || '',
        healthScore: document.getElementById('healthScore').value
    };
    
    const medicalHistory = Array.from(
        document.querySelectorAll('input[name="medicalHistory"]:checked')
    ).map(cb => cb.value);
    
    const reviewHTML = `
        <h3 style="color: #6a0dad; margin-top: 0;">Personal Information</h3>
        <table style="width: 100%; border-collapse: collapse;">
            <tr>
                <td style="padding: 10px; width: 30%; font-weight: bold;">Name</td>
                <td style="padding: 10px;">${formData.firstName} ${formData.middleInitial ? formData.middleInitial + '.' : ''} ${formData.lastName}</td>
            </tr>
            <tr>
                <td style="padding: 10px; font-weight: bold;">Date of Birth</td>
                <td style="padding: 10px;">${formatDateDisplay(formData.dob)}</td>
            </tr>
            <tr>
                <td style="padding: 10px; font-weight: bold;">Social Security</td>
                <td style="padding: 10px;">***-**-****</td>
            </tr>
        </table>
        
        <h3 style="color: #6a0dad; margin-top: 30px;">Contact Information</h3>
        <table style="width: 100%; border-collapse: collapse;">
            <tr>
                <td style="padding: 10px; width: 30%; font-weight: bold;">Email</td>
                <td style="padding: 10px;">${formData.email}</td>
            </tr>
            <tr>
                <td style="padding: 10px; font-weight: bold;">Phone</td>
                <td style="padding: 10px;">${formData.phone}</td>
            </tr>
            <tr>
                <td style="padding: 10px; font-weight: bold;">Address</td>
                <td style="padding: 10px;">
                    ${formData.address1}<br>
                    ${formData.address2 ? formData.address2 + '<br>' : ''}
                    ${formData.city}, ${formData.state} ${formData.zipCode}
                </td>
            </tr>
        </table>
        
        <h3 style="color: #6a0dad; margin-top: 30px;">Medical History & Health Information</h3>
        <table style="width: 100%; border-collapse: collapse;">
            <tr>
                <td style="padding: 10px; width: 30%; font-weight: bold; vertical-align: top;">Medical History</td>
                <td style="padding: 10px;">${medicalHistory.length > 0 ? medicalHistory.join(', ') : 'None selected'}</td>
            </tr>
            ${formData.symptoms ? `
            <tr>
                <td style="padding: 10px; font-weight: bold; vertical-align: top;">Symptoms</td>
                <td style="padding: 10px;">${formData.symptoms}</td>
            </tr>
            ` : ''}
            <tr>
                <td style="padding: 10px; font-weight: bold;">Gender</td>
                <td style="padding: 10px;">${formData.gender}</td>
            </tr>
            <tr>
                <td style="padding: 10px; font-weight: bold;">Vaccinated</td>
                <td style="padding: 10px;">${formData.vaccinated}</td>
            </tr>
            <tr>
                <td style="padding: 10px; font-weight: bold;">Insurance</td>
                <td style="padding: 10px;">${formData.insurance}</td>
            </tr>
            <tr>
                <td style="padding: 10px; font-weight: bold;">Health Score</td>
                <td style="padding: 10px;">${formData.healthScore}/10</td>
            </tr>
        </table>
        
        <h3 style="color: #6a0dad; margin-top: 30px;">Account Information</h3>
        <table style="width: 100%; border-collapse: collapse;">
            <tr>
                <td style="padding: 10px; width: 30%; font-weight: bold;">User ID</td>
                <td style="padding: 10px;">${formData.userId}</td>
            </tr>
            <tr>
                <td style="padding: 10px; font-weight: bold;">Password</td>
                <td style="padding: 10px;">••••••••</td>
            </tr>
        </table>
    `;
    
    document.getElementById('reviewContent').innerHTML = reviewHTML;
    document.getElementById('reviewSection').style.display = 'block';
    document.getElementById('reviewSection').scrollIntoView({ behavior: 'smooth' });
}

// ============================================================================
// FORM SUBMISSION
// ============================================================================

function submitForm() {
    document.querySelectorAll('.error-message').forEach(err => err.remove());
    
    let allValid = true;
    let errors = [];
    
    const requiredFields = [
        { id: 'firstName', name: 'First Name' },
        { id: 'lastName', name: 'Last Name' },
        { id: 'dob', name: 'Date of Birth' },
        { id: 'userId', name: 'User ID' },
        { id: 'password', name: 'Password' },
        { id: 'confirmPassword', name: 'Confirm Password' },
        { id: 'email', name: 'Email Address' },
        { id: 'phone', name: 'Phone Number' },
        { id: 'address1', name: 'Address Line 1' },
        { id: 'city', name: 'City' },
        { id: 'state', name: 'State' },
        { id: 'zipCode', name: 'ZIP Code' }
    ];
    
    requiredFields.forEach(fieldInfo => {
        const element = document.getElementById(fieldInfo.id);
        if (!element || !element.value || !element.checkValidity()) {
            errors.push(fieldInfo.name);
            if (element) showError(element, 'Required field');
            allValid = false;
        }
    });
    
    const ssnValue = document.getElementById('ssn').value;
    if (!ssnValue || ssnValue.length !== 9) {
        errors.push('Social Security Number');
        showError(document.getElementById('ssnDisplay'), 'SSN required');
        allValid = false;
    }
    
    if (!document.querySelector('input[name="gender"]:checked')) {
        errors.push('Gender');
        allValid = false;
    }
    if (!document.querySelector('input[name="vaccinated"]:checked')) {
        errors.push('Vaccination Status');
        allValid = false;
    }
    if (!document.querySelector('input[name="insurance"]:checked')) {
        errors.push('Insurance Status');
        allValid = false;
    }
    
    if (document.querySelectorAll('input[name="medicalHistory"]:checked').length === 0) {
        errors.push('Medical History');
        allValid = false;
    }
    
    if (!allValid) {
        alert('❌ CANNOT SUBMIT\n\nPlease complete all required fields:\n\n• ' + errors.join('\n• '));
        return false;
    }
    
    // Save firstName to cookie if Remember Me is checked
    const rememberMe = document.getElementById('rememberMe');
    const firstName = document.getElementById('firstName').value;
    
    if (rememberMe && rememberMe.checked && firstName) {
        setCookie('oasisUserFirstName', firstName, 48);
        console.log('✅ Cookie saved: oasisUserFirstName =', firstName);
        
        // Also ensure all form data is saved to localStorage
        const fieldsToSave = [
            'firstName', 'middleInitial', 'lastName', 'dob', 'userId',
            'email', 'phone', 'address1', 'address2', 'city', 'state', 'zipCode',
            'symptoms', 'healthScore'
        ];
        
        fieldsToSave.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field && field.value) {
                localStorage.setItem('oasis_' + fieldId, field.value);
            }
        });
        
        // Save radio buttons
        ['gender', 'vaccinated', 'insurance'].forEach(name => {
            const checked = document.querySelector(`input[name="${name}"]:checked`);
            if (checked) {
                localStorage.setItem('oasis_' + name, checked.value);
            }
        });
        
        // Save medical history
        saveMedicalHistory();
        
        console.log('✅ All data saved to localStorage');
    } else if (rememberMe && !rememberMe.checked) {
        deleteCookie('oasisUserFirstName');
        clearLocalStorage();
        console.log('⚠️ Remember me not checked - data not saved');
    }
    
    alert('✅ Form submitted successfully!\n\nYour information has been ' + 
          (rememberMe && rememberMe.checked ? 'saved for your next visit.\n' : '') +
          'Redirecting to confirmation page...');
    window.location.href = 'thankyou.html';
    return true;
}

// ============================================================================
// CLEAR REVIEW
// ============================================================================

function clearReview() {
    document.getElementById('reviewSection').style.display = 'none';
    document.getElementById('reviewContent').innerHTML = '';
    document.querySelectorAll('.error-message').forEach(err => err.remove());
    document.querySelectorAll('input, select, textarea').forEach(field => {
        field.style.borderColor = '#c8a2c8';
        field.style.backgroundColor = 'white';
    });
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function formatDateDisplay(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
}

// ============================================================================
// INITIALIZATION - WAIT FOR DOM
// ============================================================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ Page loaded - initializing...');
    
    // Try to update date/time immediately
    updateDateTime();
    console.log('✅ Initial date/time update attempted');
    
    // Try again after a short delay to ensure DOM is ready
    setTimeout(function() {
        updateDateTime();
        console.log('✅ Second date/time update (100ms delay)');
    }, 100);
    
    // And one more time to be sure
    setTimeout(function() {
        updateDateTime();
        console.log('✅ Third date/time update (500ms delay)');
    }, 500);
    
    // Set date constraints
    setDateConstraints();
    
    // Load external data via Fetch API
    loadStates();
    loadMedicalConditions();
    
    // Setup welcome message and cookie handling
    setupWelcomeMessage();
    
    // Setup auto-save functionality (saves data as user fills form)
    setupAutoSave();
    console.log('✅ Auto-save enabled - form data will save automatically');
    
    // Setup formatting
    setupPhoneFormatting();
    setupZIPFormatting();
    setupSSNFormatting();
    setupPasswordValidation();
    
    // Start session timer (10-minute countdown)
    startSessionTimer();
    
    // Start live time updates (every second)
    setInterval(updateDateTime, 1000);
    console.log('✅ Time interval started - will update every second');
    
    // Start time-based dynamic content
    showTimeBasedContent();
    startDynamicContentUpdates();
    
    // Update health score display
    const healthScoreSlider = document.getElementById('healthScore');
    if (healthScoreSlider) {
        healthScoreSlider.addEventListener('input', updateHealthScore);
    }
});
