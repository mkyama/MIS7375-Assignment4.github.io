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
    
    // Don't save secure fields (SSN, passwords)
    if (fieldId === 'ssn' || fieldId === 'ssnDisplay' || 
        fieldId === 'password' || fieldId === 'confirmPassword') {
        return;
    }
    
    let value;
    if (field.type === 'checkbox') {
        value = field.checked;
    } else if (field.type === 'radio') {
        const checked = document.querySelector(`input[name="${field.name}"]:checked`);
        value = checked ? checked.value : '';
    } else {
        value = field.value;
    }
    
    localStorage.setItem('oasis_' + fieldId, value);
}

// Save medical history checkboxes
function saveMedicalHistory() {
    const rememberMe = document.getElementById('rememberMe');
    if (!rememberMe || !rememberMe.checked) return;
    
    const checkedConditions = Array.from(
        document.querySelectorAll('input[name="medicalHistory"]:checked')
    ).map(cb => cb.value);
    
    localStorage.setItem('oasis_medicalHistory', JSON.stringify(checkedConditions));
}

// Load data from localStorage
function loadFromLocalStorage() {
    const firstName = localStorage.getItem('oasis_firstName');
    
    // Only load if firstName matches the cookie
    const cookieFirstName = getCookie('oasisUserFirstName');
    if (!firstName || firstName !== cookieFirstName) return;
    
    // Load all non-secure fields
    const fieldsToLoad = [
        'firstName', 'middleInitial', 'lastName', 'dob', 'userId',
        'email', 'phone', 'address1', 'address2', 'city', 'state', 'zipCode',
        'symptoms', 'healthScore'
    ];
    
    fieldsToLoad.forEach(fieldId => {
        const value = localStorage.getItem('oasis_' + fieldId);
        if (value) {
            const field = document.getElementById(fieldId);
            if (field) field.value = value;
        }
    });
    
    // Load radio buttons
    ['gender', 'vaccinated', 'insurance'].forEach(name => {
        const value = localStorage.getItem('oasis_' + name);
        if (value) {
            const radio = document.querySelector(`input[name="${name}"][value="${value}"]`);
            if (radio) radio.checked = true;
        }
    });
    
    // Load medical history checkboxes
    const medicalHistory = localStorage.getItem('oasis_medicalHistory');
    if (medicalHistory) {
        try {
            const conditions = JSON.parse(medicalHistory);
            conditions.forEach(condition => {
                const checkbox = document.querySelector(`input[name="medicalHistory"][value="${condition}"]`);
                if (checkbox) checkbox.checked = true;
            });
        } catch (e) {
            console.error('Error loading medical history:', e);
        }
    }
    
    // Update health score display
    const healthScore = document.getElementById('healthScore');
    if (healthScore) {
        document.getElementById('healthScoreValue').textContent = healthScore.value;
    }
}

// Clear all local storage data
function clearLocalStorage() {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
        if (key.startsWith('oasis_')) {
            localStorage.removeItem(key);
        }
    });
}

// Clear all data (cookie + localStorage)
function clearAllData() {
    deleteCookie('oasisUserFirstName');
    clearLocalStorage();
    document.getElementById('welcomeMessage').textContent = 'Welcome, New User!';
    document.getElementById('newUserCheckbox').style.display = 'none';
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
// SESSION TIMER (10 MINUTE WARNING)
// ============================================================================

let sessionTimeRemaining = 600; // 10 minutes in seconds
let timerInterval;
let warningShown = false;

function startSessionTimer() {
    const timerDisplay = document.getElementById('timerDisplay');
    const timerBox = document.getElementById('sessionTimer');
    
    timerInterval = setInterval(() => {
        sessionTimeRemaining--;
        
        // Update display
        const minutes = Math.floor(sessionTimeRemaining / 60);
        const seconds = sessionTimeRemaining % 60;
        timerDisplay.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        
        // Show warning at 2 minutes
        if (sessionTimeRemaining === 120 && !warningShown) {
            timerBox.classList.add('warning');
            warningShown = true;
            
            const continueSession = confirm(
                '⚠️ SESSION TIMEOUT WARNING\n\n' +
                'You have 2 minutes remaining to complete the form.\n\n' +
                'Click OK to continue working, or Cancel to submit now.'
            );
            
            if (continueSession) {
                // Add 5 more minutes
                sessionTimeRemaining += 300;
                timerBox.classList.remove('warning');
                warningShown = false;
            } else {
                // Try to submit
                submitForm();
            }
        }
        
        // Time's up
        if (sessionTimeRemaining <= 0) {
            clearInterval(timerInterval);
            alert('⏰ Session expired! The form will now reset.');
            document.getElementById('patient-form').reset();
            sessionTimeRemaining = 600;
            warningShown = false;
            timerBox.classList.remove('warning');
            startSessionTimer();
        }
    }, 1000);
}

// ============================================================================
// DYNAMIC DATE/TIME UPDATE
// ============================================================================

function updateDateTime() {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    const now = new Date();
    const dayName = days[now.getDay()];
    const monthName = months[now.getMonth()];
    const date = now.getDate();
    const year = now.getFullYear();
    
    let hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // Convert 0 to 12
    
    const dateTimeString = `Today is: ${dayName}, ${monthName} ${date}, ${year} - ${hours}:${minutes}:${seconds} ${ampm}`;
    document.getElementById('currentDateTime').textContent = dateTimeString;
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
    if (rememberMe && rememberMe.checked) {
        const firstName = document.getElementById('firstName').value;
        setCookie('oasisUserFirstName', firstName, 48);
    }
    
    alert('✅ Form submitted successfully! Redirecting to confirmation page...');
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
    // Set date constraints
    setDateConstraints();
    
    // Load external data via Fetch API
    loadStates();
    loadMedicalConditions();
    
    // Setup welcome message and cookie handling
    setupWelcomeMessage();
    
    // Setup formatting
    setupPhoneFormatting();
    setupZIPFormatting();
    setupSSNFormatting();
    setupPasswordValidation();
    
    // Start session timer
    startSessionTimer();
    
    // Start dynamic date/time update
    updateDateTime();
    setInterval(updateDateTime, 1000);
    
    // Update health score display
    const healthScoreSlider = document.getElementById('healthScore');
    if (healthScoreSlider) {
        healthScoreSlider.addEventListener('input', updateHealthScore);
    }
});
