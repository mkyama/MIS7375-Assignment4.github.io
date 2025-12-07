// Oasis Health Care - Patient Registration Form JavaScript
// Enhanced with comprehensive real-time validation
// Assignment 4 Features: Fetch API, Cookies, Local Storage, Time-based Events

// ==========================================
// ASSIGNMENT 4 FEATURES
// ==========================================

// 1. COOKIE FUNCTIONS
function setCookie(name, value, days) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    const expires = "expires=" + date.toUTCString();
    document.cookie = name + "=" + value + ";" + expires + ";path=/";
}

function getCookie(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for(let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

function deleteCookie(name) {
    document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
}

// 2. LOCAL STORAGE FUNCTIONS
function initializeSessionData() {
    // ASSIGNMENT 4 REQUIREMENT: Check for firstName cookie
    const savedFirstName = getCookie('userFirstName');
    
    if (savedFirstName) {
        // RETURNING USER - show personalized welcome
        document.getElementById('welcomeTitle').textContent = `Welcome back, ${savedFirstName}!`;
        document.getElementById('welcomeMessage').textContent = 'Your information has been saved. Continue where you left off.';
        
        // Show "Not [Name]?" option
        const notYouSection = document.getElementById('notYouSection');
        notYouSection.style.display = 'block';
        document.getElementById('notMeLabel').innerHTML = `Not ${savedFirstName}? Click HERE to start as a NEW USER`;
        
        // Pre-fill first name field
        document.getElementById('firstName').value = savedFirstName;
        
        // Load all other data from localStorage
        loadFormDataFromLocalStorage();
        
    } else {
        // NEW USER - show welcome message
        document.getElementById('welcomeTitle').textContent = 'Welcome New User!';
        document.getElementById('welcomeMessage').textContent = 'Thank you for choosing Oasis Health Care. Please fill out the registration form below.';
        
        // Hide "Not [Name]?" section
        document.getElementById('notYouSection').style.display = 'none';
    }
    
    // Get or initialize visit count (Local Storage)
    let visitCount = localStorage.getItem('visitCount');
    if (visitCount) {
        visitCount = parseInt(visitCount) + 1;
    } else {
        visitCount = 1;
    }
    localStorage.setItem('visitCount', visitCount);
    document.getElementById('visitCount').textContent = visitCount;
    
    // Get last visit from cookie
    const lastVisit = getCookie('lastVisit');
    if (lastVisit) {
        document.getElementById('lastVisit').textContent = new Date(lastVisit).toLocaleString();
    }
    
    // Set current visit time in cookie (48 hours expiry as per instructions)
    setCookie('lastVisit', new Date().toISOString(), 2); // 2 days = 48 hours
    
    // Store session start time in sessionStorage
    if (!sessionStorage.getItem('sessionStart')) {
        sessionStorage.setItem('sessionStart', new Date().toISOString());
    }
    
    const sessionStart = new Date(sessionStorage.getItem('sessionStart'));
    document.getElementById('sessionStart').textContent = sessionStart.toLocaleTimeString();
}

// Handle "Not Me" checkbox
function handleNotMe() {
    const checkbox = document.getElementById('notMeCheckbox');
    if (checkbox.checked) {
        if (confirm('This will clear all saved data and start fresh. Are you sure?')) {
            // Expire the cookie and clear local storage
            deleteCookie('userFirstName');
            deleteCookie('lastVisit');
            localStorage.clear();
            sessionStorage.clear();
            
            alert('All data cleared. Starting as a new user...');
            window.location.reload();
        } else {
            checkbox.checked = false;
        }
    }
}

// Load form data from localStorage
function loadFormDataFromLocalStorage() {
    // Load all non-secure items from localStorage
    const fields = [
        'middleInitial', 'lastName', 'dob', 'userId', 
        'email', 'phone', 'address1', 'address2', 
        'city', 'state', 'zipCode', 'symptoms', 'healthScore'
    ];
    
    fields.forEach(fieldId => {
        const savedValue = localStorage.getItem(fieldId);
        if (savedValue) {
            const element = document.getElementById(fieldId);
            if (element) {
                element.value = savedValue;
                // Trigger any change events for proper display
                if (fieldId === 'healthScore') {
                    document.getElementById('healthScoreValue').textContent = savedValue;
                }
            }
        }
    });
    
    // Load radio button selections
    const gender = localStorage.getItem('gender');
    if (gender) {
        const genderRadio = document.querySelector(`input[name="gender"][value="${gender}"]`);
        if (genderRadio) genderRadio.checked = true;
    }
    
    const vaccinated = localStorage.getItem('vaccinated');
    if (vaccinated) {
        const vaccinatedRadio = document.querySelector(`input[name="vaccinated"][value="${vaccinated}"]`);
        if (vaccinatedRadio) vaccinatedRadio.checked = true;
    }
    
    const insurance = localStorage.getItem('insurance');
    if (insurance) {
        const insuranceRadio = document.querySelector(`input[name="insurance"][value="${insurance}"]`);
        if (insuranceRadio) insuranceRadio.checked = true;
    }
    
    // Load checkbox selections
    const medicalHistory = localStorage.getItem('medicalHistory');
    if (medicalHistory) {
        const conditions = JSON.parse(medicalHistory);
        conditions.forEach(condition => {
            const checkbox = document.querySelector(`input[name="medicalHistory"][value="${condition}"]`);
            if (checkbox) checkbox.checked = true;
        });
    }
}

// Save field to localStorage when user leaves the field
function saveFieldToLocalStorage(fieldId) {
    const element = document.getElementById(fieldId);
    if (element && element.value) {
        localStorage.setItem(fieldId, element.value);
    }
}

function displayWelcomeMessage(visitCount, lastVisit) {
    // This function is now handled in initializeSessionData()
    // Keeping for backwards compatibility
}

// 3. TIME-BASED EVENT
function checkTimeBasedEvent() {
    const now = new Date();
    const hour = now.getHours();
    const day = now.getDay(); // 0 = Sunday, 6 = Saturday
    
    const timeBanner = document.getElementById('timeBanner');
    const timeMessage = document.getElementById('timeMessage');
    
    // Show special messages based on time
    if (hour >= 0 && hour < 6) {
        timeBanner.classList.add('active');
        timeMessage.textContent = "Our office is currently closed. Online registration is available 24/7. We'll contact you during business hours!";
    } else if (hour >= 6 && hour < 9) {
        timeBanner.classList.add('active');
        timeMessage.textContent = "Early bird! Our office opens at 8 AM. Complete your registration now for priority scheduling!";
    } else if (hour >= 17 && hour < 20) {
        timeBanner.classList.add('active');
        timeMessage.textContent = "Evening registration available! We'll process your information first thing tomorrow morning.";
    } else if (day === 0 || day === 6) {
        timeBanner.classList.add('active');
        timeMessage.textContent = "Weekend registration! Our team will review your information on Monday morning.";
    }
}

// 4. PAGE TIME TRACKER (Time-based Event)
let pageLoadTime = Date.now();
let sessionTimeoutWarning = null;
let sessionTimeout = null;

// SESSION TIMEOUT: Warn user after 10 minutes, timeout after 15 minutes
function initializeSessionTimeout() {
    // Clear any existing timeouts
    if (sessionTimeoutWarning) clearTimeout(sessionTimeoutWarning);
    if (sessionTimeout) clearTimeout(sessionTimeout);
    
    // Warning after 10 minutes (600000 ms)
    sessionTimeoutWarning = setTimeout(() => {
        const continueSession = confirm(
            '⏰ SESSION TIMEOUT WARNING\n\n' +
            'Your session will expire in 5 minutes due to inactivity.\n\n' +
            'Click OK to continue working, or Cancel to save and exit.'
        );
        
        if (continueSession) {
            // Reset timers
            initializeSessionTimeout();
            alert('✅ Session extended! You have another 15 minutes.');
        } else {
            // User wants to exit - save data if Remember Me is checked
            const rememberMe = document.getElementById('rememberMe');
            if (rememberMe && rememberMe.checked) {
                alert('💾 Your data has been saved. You can return anytime to continue.');
            }
            window.location.href = 'thankyou.html';
        }
    }, 600000); // 10 minutes
    
    // Auto-save and redirect after 15 minutes total
    sessionTimeout = setTimeout(() => {
        alert(
            '⏰ SESSION EXPIRED\n\n' +
            'Your session has expired due to inactivity.\n' +
            'Your data has been auto-saved if "Remember Me" was checked.\n\n' +
            'Redirecting to home page...'
        );
        window.location.href = 'thankyou.html';
    }, 900000); // 15 minutes
}

function updateTimeOnPage() {
    const secondsOnPage = Math.floor((Date.now() - pageLoadTime) / 1000);
    const minutes = Math.floor(secondsOnPage / 60);
    const seconds = secondsOnPage % 60;
    
    document.getElementById('timeOnPage').textContent = 
        minutes > 0 ? `${minutes} minute${minutes !== 1 ? 's' : ''} ${seconds} second${seconds !== 1 ? 's' : ''}` 
                    : `${seconds} second${seconds !== 1 ? 's' : ''}`;
    
    // Save time to localStorage every 5 seconds
    if (secondsOnPage % 5 === 0) {
        localStorage.setItem('lastSessionDuration', secondsOnPage);
    }
}

// Reset session timeout on user activity
function resetSessionTimeout() {
    initializeSessionTimeout();
}

// Add event listeners for user activity to reset timeout
document.addEventListener('DOMContentLoaded', function() {
    // Initialize session timeout
    initializeSessionTimeout();
    
    // Reset timeout on any user interaction
    ['mousedown', 'keypress', 'scroll', 'touchstart', 'click'].forEach(event => {
        document.addEventListener(event, resetSessionTimeout, { passive: true, once: false });
    });
});

// Update time on page every second
setInterval(updateTimeOnPage, 1000);

// 5. FETCH API - Weather Data
async function fetchWeatherData() {
    const weatherDiv = document.getElementById('weatherInfo');
    
    try {
        // Using Open-Meteo API (no API key required) for Austin, TX coordinates
        const response = await fetch('https://api.open-meteo.com/v1/forecast?latitude=30.2672&longitude=-97.7431&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&temperature_unit=fahrenheit&wind_speed_unit=mph&timezone=America%2FChicago');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Weather code descriptions
        const weatherDescriptions = {
            0: '☀️ Clear sky',
            1: '🌤️ Mainly clear',
            2: '⛅ Partly cloudy',
            3: '☁️ Overcast',
            45: '🌫️ Foggy',
            48: '🌫️ Foggy',
            51: '🌧️ Light drizzle',
            53: '🌧️ Moderate drizzle',
            55: '🌧️ Dense drizzle',
            61: '🌧️ Slight rain',
            63: '🌧️ Moderate rain',
            65: '🌧️ Heavy rain',
            71: '🌨️ Slight snow',
            73: '🌨️ Moderate snow',
            75: '🌨️ Heavy snow',
            77: '❄️ Snow grains',
            80: '🌦️ Slight rain showers',
            81: '🌧️ Moderate rain showers',
            82: '⛈️ Violent rain showers',
            85: '🌨️ Slight snow showers',
            86: '🌨️ Heavy snow showers',
            95: '⛈️ Thunderstorm',
            96: '⛈️ Thunderstorm with hail',
            99: '⛈️ Thunderstorm with heavy hail'
        };
        
        const weatherCode = data.current.weather_code;
        const weatherDesc = weatherDescriptions[weatherCode] || '🌤️ Unknown conditions';
        
        weatherDiv.innerHTML = `
            <div style="display: flex; justify-content: space-around; flex-wrap: wrap; gap: 20px;">
                <div style="text-align: center;">
                    <div style="font-size: 48px; font-weight: bold; color: #6a0dad;">
                        ${Math.round(data.current.temperature_2m)}°F
                    </div>
                    <div style="margin-top: 5px; color: #7b2cbf;">
                        ${weatherDesc}
                    </div>
                </div>
                <div style="text-align: center;">
                    <div style="font-size: 24px; color: #6a0dad;">
                        💧 ${data.current.relative_humidity_2m}%
                    </div>
                    <div style="margin-top: 5px; color: #7b2cbf;">
                        Humidity
                    </div>
                </div>
                <div style="text-align: center;">
                    <div style="font-size: 24px; color: #6a0dad;">
                        💨 ${Math.round(data.current.wind_speed_10m)} mph
                    </div>
                    <div style="margin-top: 5px; color: #7b2cbf;">
                        Wind Speed
                    </div>
                </div>
            </div>
            <p style="text-align: center; margin-top: 15px; color: #666; font-size: 12px;">
                Data provided by Open-Meteo API • Updated: ${new Date().toLocaleTimeString()}
            </p>
        `;
        
        // Store weather data in localStorage
        localStorage.setItem('lastWeatherUpdate', JSON.stringify({
            temperature: data.current.temperature_2m,
            humidity: data.current.relative_humidity_2m,
            timestamp: new Date().toISOString()
        }));
        
    } catch (error) {
        console.error('Error fetching weather:', error);
        weatherDiv.innerHTML = `
            <p style="color: #d63384;">
                ⚠️ Unable to fetch weather data at this time. Please try again later.
            </p>
            <p style="font-size: 12px; color: #666;">
                Error: ${error.message}
            </p>
        `;
    }
}

// Clear session data function
function clearSessionData() {
    if (confirm('Are you sure you want to clear all session data? This will reset your visit count and session information.')) {
        // Clear localStorage
        localStorage.clear();
        
        // Clear cookies
        deleteCookie('lastVisit');
        
        // Clear sessionStorage
        sessionStorage.clear();
        
        alert('Session data cleared! The page will reload.');
        window.location.reload();
    }
}

// ==========================================
// ORIGINAL ASSIGNMENT 3 FUNCTIONALITY
// ==========================================

// Calculate min and max dates for validation
const today = new Date();
const minDate = new Date(today.getFullYear() - 120, today.getMonth(), today.getDate());
const maxDate = today;

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    
    // Initialize Assignment 4 features
    initializeSessionData();
    checkTimeBasedEvent();
    fetchWeatherData();
    
    // Refresh weather data every 5 minutes
    setInterval(fetchWeatherData, 300000);
    
    // Load external state list
    loadStates();
    
    // Set date constraints dynamically
    setDateConstraints();
    
    // Get form elements
    const form = document.getElementById('patient-form');
    const passwordField = document.getElementById('password');
    const confirmPasswordField = document.getElementById('confirmPassword');
    const userIdField = document.getElementById('userId');
    const phoneField = document.getElementById('phone');
    const zipField = document.getElementById('zipCode');
    const ssnDisplayField = document.getElementById('ssnDisplay');
    const ssnField = document.getElementById('ssn');

    // Add real-time validation to all fields
    addRealtimeValidation();

    // Phone Number Formatting with real-time validation
    if (phoneField) {
        let phoneDigits = '';
        
        phoneField.addEventListener('keydown', function(e) {
            const key = e.key;
            const keyCode = e.keyCode || e.which;
            
            // Allow: backspace, delete, tab, escape, enter
            if ([8, 46, 9, 27, 13].includes(keyCode)) {
                if (keyCode === 8 && phoneDigits.length > 0) {
                    e.preventDefault();
                    phoneDigits = phoneDigits.slice(0, -1);
                    updatePhoneDisplay();
                } else if (keyCode === 46 && phoneDigits.length > 0) {
                    e.preventDefault();
                    phoneDigits = phoneDigits.slice(0, -1);
                    updatePhoneDisplay();
                }
                return;
            }
            
            // Check if it's a number key (0-9)
            if ((key >= '0' && key <= '9') && phoneDigits.length < 10) {
                e.preventDefault();
                phoneDigits += key;
                updatePhoneDisplay();
            } else {
                e.preventDefault();
            }
        });
        
        // Validate on blur
        phoneField.addEventListener('blur', function() {
            if (phoneDigits.length > 0 && phoneDigits.length < 10) {
                showError(phoneField, 'Phone number must be exactly 10 digits (format: 000-000-0000)');
            } else if (phoneDigits.length === 0) {
                showError(phoneField, 'Phone number is required');
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
            
            // Real-time validation
            if (phoneDigits.length === 0) {
                clearError(phoneField);
            } else if (phoneDigits.length < 10) {
                showError(phoneField, `Phone number incomplete (${phoneDigits.length}/10 digits)`);
            } else if (phoneDigits.length === 10) {
                showSuccess(phoneField);
            }
        }
    }

    // ZIP Code Formatting with real-time validation
    if (zipField) {
        let zipDigits = '';
        
        zipField.addEventListener('keydown', function(e) {
            const key = e.key;
            const keyCode = e.keyCode || e.which;
            
            // Allow: backspace, delete, tab, escape, enter
            if ([8, 46, 9, 27, 13].includes(keyCode)) {
                if (keyCode === 8 && zipDigits.length > 0) {
                    e.preventDefault();
                    zipDigits = zipDigits.slice(0, -1);
                    updateZIPDisplay();
                } else if (keyCode === 46 && zipDigits.length > 0) {
                    e.preventDefault();
                    zipDigits = zipDigits.slice(0, -1);
                    updateZIPDisplay();
                }
                return;
            }
            
            // Check if it's a number key (0-9)
            if ((key >= '0' && key <= '9') && zipDigits.length < 9) {
                e.preventDefault();
                zipDigits += key;
                updateZIPDisplay();
            } else {
                e.preventDefault();
            }
        });
        
        // Validate on blur
        zipField.addEventListener('blur', function() {
            if (zipDigits.length > 0 && zipDigits.length < 5) {
                showError(zipField, 'ZIP code must be at least 5 digits');
            } else if (zipDigits.length === 0) {
                showError(zipField, 'ZIP code is required');
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
            
            // Real-time validation
            if (zipDigits.length === 0) {
                clearError(zipField);
            } else if (zipDigits.length < 5) {
                showError(zipField, `ZIP code incomplete (${zipDigits.length}/5 digits minimum)`);
            } else if (zipDigits.length === 5 || zipDigits.length === 9) {
                showSuccess(zipField);
            } else if (zipDigits.length > 5 && zipDigits.length < 9) {
                showError(zipField, `ZIP+4 incomplete (${zipDigits.length - 5}/4 extension digits)`);
            }
        }
    }

    // SSN Input Handling - Password-style with visible dashes and real-time validation
    if (ssnDisplayField && ssnField) {
        let ssnDigits = '';
        
        ssnDisplayField.addEventListener('keydown', function(e) {
            const key = e.key;
            const keyCode = e.keyCode || e.which;
            
            // Allow: backspace, delete, tab, escape, enter
            if ([8, 46, 9, 27, 13].includes(keyCode)) {
                if (keyCode === 8 && ssnDigits.length > 0) {
                    e.preventDefault();
                    ssnDigits = ssnDigits.slice(0, -1);
                    updateSSNDisplay();
                } else if (keyCode === 46 && ssnDigits.length > 0) {
                    e.preventDefault();
                    ssnDigits = ssnDigits.slice(0, -1);
                    updateSSNDisplay();
                }
                return;
            }
            
            // Check if it's a number key (0-9)
            if ((key >= '0' && key <= '9') && ssnDigits.length < 9) {
                e.preventDefault();
                ssnDigits += key;
                updateSSNDisplay();
            } else {
                e.preventDefault();
            }
        });
        
        // Validate on blur
        ssnDisplayField.addEventListener('blur', function() {
            if (ssnDigits.length > 0 && ssnDigits.length < 9) {
                showError(ssnDisplayField, 'Social Security Number must be exactly 9 digits');
            } else if (ssnDigits.length === 0) {
                showError(ssnDisplayField, 'Social Security Number is required');
            }
        });
        
        function updateSSNDisplay() {
            let display = '';
            const asterisks = '*'.repeat(ssnDigits.length);
            
            if (ssnDigits.length >= 5) {
                display = asterisks.slice(0, 3) + '-' + asterisks.slice(3, 5) + '-' + asterisks.slice(5);
            } else if (ssnDigits.length >= 3) {
                display = asterisks.slice(0, 3) + '-' + asterisks.slice(3);
            } else {
                display = asterisks;
            }
            
            ssnDisplayField.value = display;
            ssnField.value = ssnDigits;
            
            // Real-time validation
            if (ssnDigits.length === 0) {
                clearError(ssnDisplayField);
            } else if (ssnDigits.length < 9) {
                showError(ssnDisplayField, `SSN incomplete (${ssnDigits.length}/9 digits)`);
            } else if (ssnDigits.length === 9) {
                showSuccess(ssnDisplayField);
            }
        }
    }

    // Password Match Validation
    if (passwordField && confirmPasswordField) {
        confirmPasswordField.addEventListener('input', function() {
            if (this.value === '') {
                clearError(this);
            } else if (this.value !== passwordField.value) {
                showError(this, 'Passwords do not match');
            } else {
                showSuccess(this);
            }
        });
        
        passwordField.addEventListener('input', function() {
            if (confirmPasswordField.value !== '' && confirmPasswordField.value !== this.value) {
                showError(confirmPasswordField, 'Passwords do not match');
            } else if (confirmPasswordField.value !== '' && confirmPasswordField.value === this.value) {
                showSuccess(confirmPasswordField);
            }
        });
    }
});

// Load states from external JSON file using Fetch API with try/catch
async function loadStates() {
    try {
        // Fetch states from external file - ASSIGNMENT 4 REQUIREMENT
        const response = await fetch('https://gist.githubusercontent.com/mshafrir/2646763/raw/8b0dbb93521f5d6889502305335104218454c2bf/states_hash.json');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const states = await response.json();
        
        const stateSelect = document.getElementById('state');
        Object.entries(states).forEach(([abbr, name]) => {
            const option = document.createElement('option');
            option.value = abbr;
            option.textContent = name;
            stateSelect.appendChild(option);
        });
        
        console.log('States loaded successfully via Fetch API');
    } catch (error) {
        console.error('Error loading states:', error);
        // Fallback to manual state list
        const stateSelect = document.getElementById('state');
        const fallbackStates = ['AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'];
        fallbackStates.forEach(state => {
            const option = document.createElement('option');
            option.value = state;
            option.textContent = state;
            stateSelect.appendChild(option);
        });
    }
}

// Set date constraints dynamically
function setDateConstraints() {
    const dobField = document.getElementById('dob');
    if (dobField) {
        const minDateStr = minDate.toISOString().split('T')[0];
        const maxDateStr = maxDate.toISOString().split('T')[0];
        dobField.setAttribute('min', minDateStr);
        dobField.setAttribute('max', maxDateStr);
    }
}

// Add real-time validation to all fields
function addRealtimeValidation() {
    const textInputs = document.querySelectorAll('input[type="text"]:not(#ssnDisplay):not(#phone):not(#zipCode), input[type="email"], input[type="date"]');
    
    textInputs.forEach(input => {
        input.addEventListener('blur', function() {
            if (this.value === '' && this.required) {
                showError(this, 'This field is required');
            } else if (this.value !== '' && !this.checkValidity()) {
                const message = this.title || 'Invalid input format';
                showError(this, message);
            } else if (this.value !== '') {
                showSuccess(this);
                // ASSIGNMENT 4: Save to localStorage when leaving field
                if (this.id && this.id !== 'password' && this.id !== 'confirmPassword' && this.id !== 'ssn') {
                    saveFieldToLocalStorage(this.id);
                }
            }
        });
        
        input.addEventListener('input', function() {
            if (this.value === '') {
                clearError(this);
            } else if (this.checkValidity()) {
                showSuccess(this);
            }
        });
    });
    
    // Special validation for select
    const stateSelect = document.getElementById('state');
    if (stateSelect) {
        stateSelect.addEventListener('change', function() {
            if (this.value === '') {
                showError(this, 'Please select a state');
            } else {
                showSuccess(this);
                saveFieldToLocalStorage('state');
            }
        });
    }
    
    // Save radio button selections
    document.querySelectorAll('input[type="radio"]').forEach(radio => {
        radio.addEventListener('change', function() {
            localStorage.setItem(this.name, this.value);
        });
    });
    
    // Save checkbox selections
    document.querySelectorAll('input[name="medicalHistory"]').forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const checked = Array.from(document.querySelectorAll('input[name="medicalHistory"]:checked'))
                .map(cb => cb.value);
            localStorage.setItem('medicalHistory', JSON.stringify(checked));
        });
    });
    
    // Save textarea on blur
    const textarea = document.getElementById('symptoms');
    if (textarea) {
        textarea.addEventListener('blur', function() {
            saveFieldToLocalStorage('symptoms');
        });
    }
    
    // Save health score on change
    const healthScore = document.getElementById('healthScore');
    if (healthScore) {
        healthScore.addEventListener('change', function() {
            saveFieldToLocalStorage('healthScore');
        });
    }
}

// Error and success display functions
function showError(element, message) {
    clearError(element);
    element.style.borderColor = '#dc2626';
    element.style.backgroundColor = '#fee';
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.style.color = '#dc2626';
    errorDiv.style.fontSize = '12px';
    errorDiv.style.marginTop = '2px';
    errorDiv.textContent = '⚠ ' + message;
    
    element.parentNode.appendChild(errorDiv);
}

function showSuccess(element) {
    clearError(element);
    element.style.borderColor = '#16a34a';
    element.style.backgroundColor = '#f0fdf4';
}

function clearError(element) {
    element.style.borderColor = '#c8a2c8';
    element.style.backgroundColor = 'white';
    
    const existingError = element.parentNode.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }
}

// Review Form Function
function reviewForm() {
    // Check if at least one checkbox is checked
    const checkboxes = document.querySelectorAll('input[name="medicalHistory"]:checked');
    if (checkboxes.length === 0) {
        alert('⚠️ Please check at least one medical history condition before reviewing.');
        return false;
    }
    
    // Clear any existing errors
    document.querySelectorAll('.error-message').forEach(err => err.remove());
    
    // Collect form data
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
        gender: document.querySelector('input[name="gender"]:checked').value,
        vaccinated: document.querySelector('input[name="vaccinated"]:checked').value,
        insurance: document.querySelector('input[name="insurance"]:checked').value,
        healthScore: document.getElementById('healthScore').value
    };
    
    const medicalHistory = Array.from(document.querySelectorAll('input[name="medicalHistory"]:checked')).map(cb => cb.value);
    
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
                <td style="padding: 10px;">${medicalHistory.map(c => formatConditionName(c)).join(', ')}</td>
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
    
    // Save form data to localStorage (auto-save feature)
    localStorage.setItem('formDraft', JSON.stringify(formData));
}

// Submit Form Function - Final validation before submission
function submitForm() {
    // Clear any existing errors
    document.querySelectorAll('.error-message').forEach(err => err.remove());
    
    let allValid = true;
    let errors = [];
    
    // Quick final validation of all required fields
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
    
    // Validate SSN
    const ssnValue = document.getElementById('ssn').value;
    if (!ssnValue || ssnValue.length !== 9) {
        errors.push('Social Security Number');
        showError(document.getElementById('ssnDisplay'), 'SSN required');
        allValid = false;
    }
    
    // Validate radio buttons
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
    
    // Validate medical history
    if (document.querySelectorAll('input[name="medicalHistory"]:checked').length === 0) {
        errors.push('Medical History');
        allValid = false;
    }
    
    if (!allValid) {
        alert('❌ CANNOT SUBMIT\n\nPlease complete all required fields:\n\n• ' + errors.join('\n• '));
        return false;
    }
    
    // ASSIGNMENT 4: Handle Remember Me checkbox
    const rememberMe = document.getElementById('rememberMe').checked;
    
    if (rememberMe) {
        // Save first name to cookie (48 hours expiry)
        const firstName = document.getElementById('firstName').value;
        setCookie('userFirstName', firstName, 2); // 2 days = 48 hours
        
        // All other non-secure data already saved to localStorage via blur events
        alert('✅ Form submitted successfully!\n\n🔒 Your information has been saved for your next visit.\n\nRedirecting to confirmation page...');
    } else {
        // User unchecked Remember Me - clear all data
        deleteCookie('userFirstName');
        deleteCookie('lastVisit');
        localStorage.clear();
        sessionStorage.clear();
        
        alert('✅ Form submitted successfully!\n\n🗑️ Your information will NOT be saved.\n\nRedirecting to confirmation page...');
    }
    
    // Redirect to thank you page
    window.location.href = 'thankyou.html';
    return true;
}

// Clear review section
function clearReview() {
    document.getElementById('reviewSection').style.display = 'none';
    document.getElementById('reviewContent').innerHTML = '';
    document.querySelectorAll('.error-message').forEach(err => err.remove());
    document.querySelectorAll('input, select, textarea').forEach(field => {
        field.style.borderColor = '#c8a2c8';
        field.style.backgroundColor = 'white';
    });
    
    // Clear form draft from localStorage
    localStorage.removeItem('formDraft');
}

// Helper function to format date for display
function formatDateDisplay(dateString) {
    const date = new Date(dateString);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
}

// Helper function to format condition names
function formatConditionName(condition) {
    const names = {
        'ChickenPox': 'Chicken Pox',
        'Measles': 'Measles',
        'Covid19': 'Covid-19',
        'SmallPox': 'Small Pox',
        'Tetanus': 'Tetanus'
    };
    return names[condition] || condition;
}
