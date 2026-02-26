// Enhanced Theme Toggle - Parent Controls All Iframes (No Browser Interference)
document.addEventListener('DOMContentLoaded', function() {
    const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
    const storedTheme = localStorage.getItem('theme');
    const currentTheme = storedTheme || (prefersDarkScheme.matches ? 'dark' : 'light');
    
    // Apply the saved theme
    setTheme(currentTheme);
    
    // Only set up toggle button in parent window (not in iframes)
    if (window.self === window.top) {
        // This is the parent window
        setupParentThemeToggle(currentTheme);
    } else {
        // This is an iframe - hide any existing toggle buttons and set up listener
        hideIframeToggleButtons();
        setupIframeThemeListener();
    }
    
    // Sync with system preference if the user hasn't chosen a theme yet
    if (!storedTheme) {
        prefersDarkScheme.addEventListener('change', (event) => {
            const autoTheme = event.matches ? 'dark' : 'light';
            setTheme(autoTheme);
            if (window.self === window.top) {
                const themeToggle = document.getElementById('theme-toggle');
                if (themeToggle) updateButtonText(themeToggle, autoTheme);
            }
        });
    }

    // Enhanced iframe observer for parent window only
    if (window.self === window.top) {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.addedNodes) {
                    mutation.addedNodes.forEach(node => {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            const iframes = node.tagName === 'IFRAME' ? [node] : node.querySelectorAll('iframe');
                            if (iframes.length > 0) {
                                const theme = document.documentElement.getAttribute('data-theme') || 'light';
                                setTimeout(() => {
                                    updateIframeThemes(theme);
                                    hideToggleButtonsInNewIframes(iframes);
                                }, 100);
                            }
                        }
                    });
                }
            });
        });
        observer.observe(document.body, { childList: true, subtree: true });
    }
});

function setupParentThemeToggle(currentTheme) {
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        updateButtonText(themeToggle, currentTheme);
        
        themeToggle.addEventListener('click', function() {
            const newTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
            console.log('Parent toggling theme to:', newTheme);
            
            // Set theme for parent and all iframes
            setTheme(newTheme);
            updateButtonText(themeToggle, newTheme);
            localStorage.setItem('theme', newTheme);
            
            // Force update all iframes
            updateAllIframes(newTheme);
        });
    }
}

function hideIframeToggleButtons() {
    // Hide toggle button in iframes to prevent confusion
    const toggleButton = document.getElementById('theme-toggle');
    if (toggleButton) {
        toggleButton.style.display = 'none';
        console.log('Hidden toggle button in iframe');
    }
    
    // Also hide any toggle buttons that might be added later
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.addedNodes) {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        if (node.id === 'theme-toggle') {
                            node.style.display = 'none';
                        }
                        const toggles = node.querySelectorAll('#theme-toggle');
                        toggles.forEach(toggle => toggle.style.display = 'none');
                    }
                });
            }
        });
    });
    observer.observe(document.body, { childList: true, subtree: true });
}

function hideToggleButtonsInNewIframes(iframes) {
    iframes.forEach(iframe => {
        try {
            if (iframe.contentDocument) {
                const toggleButton = iframe.contentDocument.getElementById('theme-toggle');
                if (toggleButton) {
                    toggleButton.style.display = 'none';
                }
            }
        } catch (e) {
            // Cross-origin iframe - send message to hide button
            try {
                iframe.contentWindow.postMessage({
                    type: 'HIDE_TOGGLE_BUTTON'
                }, '*');
            } catch (postMessageError) {
                // Silently handle
            }
        }
    });
}

// Function to set the theme using CSS switching (no browser interference)
function setDocumentTheme(doc, theme) {
    const html = doc.documentElement;
    const body = doc.body;
    
    // Force override any browser dark mode by setting explicit styles
    if (theme === 'dark') {
        html.setAttribute('data-theme', 'dark');
        html.classList.remove('light-theme');
        html.classList.add('dark-theme');
        if (body) {
            body.classList.remove('light-theme');
            body.classList.add('dark-theme');
        }
        
        // Override browser dark mode detection
        html.style.colorScheme = 'dark';
    } else {
        html.setAttribute('data-theme', 'light');
        html.classList.remove('dark-theme');
        html.classList.add('light-theme');
        if (body) {
            body.classList.remove('dark-theme');
            body.classList.add('light-theme');
        }
        
        // Override browser dark mode detection
        html.style.colorScheme = 'light';
    }
    
    // Handle stylesheet switching if using separate stylesheets
    const lightStylesheet = doc.getElementById('light-styles') || doc.querySelector('link[href*="Case_sheet_styles.css"]');
    const darkStylesheet = doc.getElementById('dark-styles') || doc.querySelector('link[href*="Case_sheet_styles_dark.css"]');
    
    if (theme === 'dark') {
        if (darkStylesheet) {
            darkStylesheet.disabled = false;
            if (lightStylesheet) {
                if (darkStylesheet.sheet) {
                    lightStylesheet.disabled = true;
                } else {
                    darkStylesheet.addEventListener('load', () => {
                        lightStylesheet.disabled = true;
                    }, { once: true });
                }
            }
        } else if (lightStylesheet) {
            // Fallback: keep light styles if no dark stylesheet exists
            lightStylesheet.disabled = false;
        }
    } else {
        if (lightStylesheet) lightStylesheet.disabled = false;
        if (darkStylesheet) darkStylesheet.disabled = true;
    }

    // Safety: never leave the document without any stylesheet enabled
    const enabledStyles = Array.from(doc.querySelectorAll('link[rel*="stylesheet"]'))
        .filter(link => !link.disabled);
    if (enabledStyles.length === 0 && lightStylesheet) {
        lightStylesheet.disabled = false;
    }
}

// Enhanced iframe theme handling
function updateIframeThemes(theme) {
    const iframes = document.querySelectorAll('iframe');
    
    console.log(`Updating ${iframes.length} iframes to ${theme} theme`);
    
    iframes.forEach((iframe, index) => {
        console.log(`Processing iframe ${index + 1}:`, iframe.src || 'no src');
        
        // Remove any unwanted filters
        iframe.style.filter = 'none';
        iframe.style.opacity = '1';
        
        try {
            // Method 1: Direct access (same-origin)
            if (iframe.contentDocument) {
                setDocumentTheme(iframe.contentDocument, theme);
                // Hide toggle button in this iframe
                const toggleButton = iframe.contentDocument.getElementById('theme-toggle');
                if (toggleButton) {
                    toggleButton.style.display = 'none';
                }
                console.log(`Applied ${theme} theme to iframe ${index + 1} via direct access`);
            } else {
                throw new Error('No contentDocument');
            }
        } catch (e) {
            console.log(`Direct access failed for iframe ${index + 1}, using postMessage`);
            
            // Method 2: PostMessage for cross-origin iframes
            try {
                iframe.contentWindow.postMessage({
                    type: 'THEME_CHANGE',
                    theme: theme,
                    method: 'css-switching',
                    hideToggle: true
                }, '*');
                console.log(`Sent theme message to iframe ${index + 1}`);
            } catch (postMessageError) {
                console.warn('Could not send theme message to iframe:', postMessageError);
            }
        }
        
        // Set up load event listener
        iframe.addEventListener('load', function() {
            try {
                if (iframe.contentDocument) {
                    setDocumentTheme(iframe.contentDocument, theme);
                    const toggleButton = iframe.contentDocument.getElementById('theme-toggle');
                    if (toggleButton) toggleButton.style.display = 'none';
                } else {
                    throw new Error('No contentDocument');
                }
            } catch (e) {
                try {
                    iframe.contentWindow.postMessage({
                        type: 'THEME_CHANGE',
                        theme: theme,
                        method: 'css-switching',
                        hideToggle: true
                    }, '*');
                } catch (postMessageError) {
                    // Silently handle
                }
            }
        });
    });
    
    setGlobalThemeVariables(theme);
}

function updateAllIframes(theme) {
    // Force update all iframes immediately
    updateIframeThemes(theme);
    
    // Also send global message to all possible iframes
    try {
        window.postMessage({
            type: 'GLOBAL_THEME_CHANGE',
            theme: theme,
            hideToggle: true
        }, '*');
    } catch (e) {
        // Handle error
    }
    
    // Use setTimeout to catch any delayed iframes
    setTimeout(() => updateIframeThemes(theme), 100);
    setTimeout(() => updateIframeThemes(theme), 500);
}

// Set global CSS custom properties
function setGlobalThemeVariables(theme) {
    const root = document.documentElement;
    
    if (theme === 'dark') {
        root.style.setProperty('--bg-color', '#1a1a1a');
        root.style.setProperty('--text-color', '#e0e0e0');
        root.style.setProperty('--border-color', '#555');
        root.style.setProperty('--accent-color', '#66b3ff');
    } else {
        root.style.setProperty('--bg-color', '#f8f8f8');
        root.style.setProperty('--text-color', '#000000');
        root.style.setProperty('--border-color', '#ccc');
        root.style.setProperty('--accent-color', '#0066cc');
    }
}

// Function to set theme in main document and all iframes
function setTheme(theme) {
    // Set theme for main document with browser override
    setDocumentTheme(document, theme);
    
    // Set global CSS variables
    setGlobalThemeVariables(theme);
    
    // Only update iframes if this is the parent window
    if (window.self === window.top) {
        updateIframeThemes(theme);
    }
}

// Enhanced iframe message listener
function setupIframeThemeListener() {
    window.addEventListener('message', function(event) {
        if (event.data && event.data.type === 'THEME_CHANGE') {
            const theme = event.data.theme;
            console.log('Iframe received theme change message:', theme);
            
            // Apply theme to this iframe's document
            setDocumentTheme(document, theme);
            setGlobalThemeVariables(theme);
            
            // Hide toggle button if requested
            if (event.data.hideToggle) {
                const toggleButton = document.getElementById('theme-toggle');
                if (toggleButton) {
                    toggleButton.style.display = 'none';
                }
            }
        }
        
        if (event.data && event.data.type === 'HIDE_TOGGLE_BUTTON') {
            const toggleButton = document.getElementById('theme-toggle');
            if (toggleButton) {
                toggleButton.style.display = 'none';
            }
        }
        
        if (event.data && event.data.type === 'GLOBAL_THEME_CHANGE') {
            const theme = event.data.theme;
            setDocumentTheme(document, theme);
            setGlobalThemeVariables(theme);
            
            if (event.data.hideToggle) {
                const toggleButton = document.getElementById('theme-toggle');
                if (toggleButton) toggleButton.style.display = 'none';
            }
        }
    });
    
    // Request current theme from parent
    try {
        window.parent.postMessage({
            type: 'REQUEST_CURRENT_THEME'
        }, '*');
    } catch (e) {
        // Silently handle
    }
}

// Handle theme requests from iframes (parent window only)
if (window.self === window.top) {
    window.addEventListener('message', function(event) {
        if (event.data && event.data.type === 'REQUEST_CURRENT_THEME') {
            const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
            try {
                event.source.postMessage({
                    type: 'THEME_CHANGE',
                    theme: currentTheme,
                    method: 'css-switching',
                    hideToggle: true
                }, '*');
            } catch (e) {
                // Silently handle
            }
        }
    });
}

function updateButtonText(button, theme) {
    if (theme === 'dark') {
        button.innerHTML = '☀️ Light Mode';
        button.title = 'Switch to light mode';
    } else {
        button.innerHTML = '🌙 Dark Mode';
        button.title = 'Switch to dark mode';
    }
}

// Prevent browser dark mode interference
(function() {
    // Override media query if needed
    if (window.matchMedia) {
        const originalMatchMedia = window.matchMedia;
        window.matchMedia = function(query) {
            const result = originalMatchMedia.call(this, query);
            // Don't let browser dark mode override our theme
            if (query.includes('prefers-color-scheme')) {
                const savedTheme = localStorage.getItem('theme');
                if (savedTheme) {
                    return {
                        ...result,
                        matches: savedTheme === 'dark'
                    };
                }
            }
            return result;
        };
    }
})();
