// Theme Toggle Functionality with Enhanced Iframe Support
document.addEventListener('DOMContentLoaded', function() {
    // Check for saved theme preference or use system preference
    const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
    const currentTheme = localStorage.getItem('theme') || 
                        (prefersDarkScheme.matches ? 'dark' : 'light');
    
    // Apply the saved theme
    setTheme(currentTheme);
    
    // Set up the theme toggle button if it exists
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        updateButtonText(themeToggle, currentTheme);
        
        themeToggle.addEventListener('click', function() {
            const newTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
            setTheme(newTheme);
            updateButtonText(themeToggle, newTheme);
            localStorage.setItem('theme', newTheme);
        });
    }
    
    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event => {
        const newTheme = event.matches ? 'dark' : 'light';
        setTheme(newTheme);
        if (themeToggle) {
            updateButtonText(themeToggle, newTheme);
        }
        localStorage.setItem('theme', newTheme);
    });

    // Enhanced iframe observer
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.addedNodes) {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        // Check if the node is an iframe or contains iframes
                        const iframes = node.tagName === 'IFRAME' ? [node] : node.querySelectorAll('iframe');
                        if (iframes.length > 0) {
                            const theme = document.documentElement.getAttribute('data-theme') || 'light';
                            setTimeout(() => updateIframeThemes(theme), 100); // Small delay to ensure iframe loads
                        }
                    }
                });
            }
        });
    });

    observer.observe(document.body, { childList: true, subtree: true });
});

// Function to set the theme in the current document
function setDocumentTheme(doc, theme) {
    const html = doc.documentElement;
    const lightStylesheet = doc.getElementById('light-styles');
    const darkStylesheet = doc.getElementById('dark-styles');
    
    if (theme === 'dark') {
        html.setAttribute('data-theme', 'dark');
        if (lightStylesheet) lightStylesheet.disabled = true;
        if (darkStylesheet) darkStylesheet.disabled = false;
    } else {
        html.setAttribute('data-theme', 'light');
        if (lightStylesheet) lightStylesheet.disabled = false;
        if (darkStylesheet) darkStylesheet.disabled = true;
    }
}

// Enhanced iframe theme handling - ensures ALL iframes are processed
function updateIframeThemes(theme) {
    // Get ALL iframes in the document, including nested ones
    const iframes = document.querySelectorAll('iframe');
    
    console.log(`Found ${iframes.length} iframes to process`); // Debug log
    
    iframes.forEach((iframe, index) => {
        console.log(`Processing iframe ${index + 1}:`, iframe.src || 'no src'); // Debug log
        
        // Apply filter immediately, regardless of load state
        applyConsistentIframeFilter(iframe, theme);
        
        try {
            // Method 1: Direct access (works for same-origin)
            if (iframe.contentDocument) {
                setDocumentTheme(iframe.contentDocument, theme);
            }
        } catch (e) {
            // Method 2: PostMessage for cross-origin iframes
            try {
                iframe.contentWindow.postMessage({
                    type: 'THEME_CHANGE',
                    theme: theme
                }, '*');
            } catch (postMessageError) {
                console.warn('Could not send theme message to iframe:', postMessageError);
            }
        }
        
        // Method 3: Force re-apply on load/focus events
        iframe.addEventListener('load', function() {
            applyConsistentIframeFilter(iframe, theme);
            try {
                if (iframe.contentDocument) {
                    setDocumentTheme(iframe.contentDocument, theme);
                }
            } catch (e) {
                // Still apply the filter even if we can't access content
                applyConsistentIframeFilter(iframe, theme);
            }
        });
        
        // Method 4: Handle focus events to re-apply theme
        iframe.addEventListener('focus', function() {
            applyConsistentIframeFilter(iframe, theme);
        });
        
        // Method 5: Handle when iframe comes into view
        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        applyConsistentIframeFilter(entry.target, theme);
                    }
                });
            });
            observer.observe(iframe);
        }
    });
    
    // Force a global style update for any iframes that might be missed
    forceGlobalIframeUpdate(theme);
}

// CSS filter approach for iframes - COMPLETE color inversion
function applyIframeFilter(iframe, theme) {
    if (theme === 'dark') {
        // When main document is dark (inverted), iframe should also be completely inverted
        // Use only invert(1) without hue-rotate to ensure ALL colors are inverted
        iframe.style.filter = 'invert(1)';
        iframe.style.opacity = '0.95';
    } else {
        // When main document is light (normal), iframe should be normal
        iframe.style.filter = 'none';
        iframe.style.opacity = '1';
    }
}

// Apply complete inversion to all iframes
function applyConsistentIframeFilter(iframe, theme) {
    if (theme === 'dark') {
        // Dark theme = completely inverted colors everywhere, including iframes
        // Remove hue-rotate to ensure green becomes magenta, blue becomes orange, etc.
        iframe.style.filter = 'invert(1)';
        iframe.style.opacity = '0.95';
        iframe.style.transition = 'filter 0.3s ease, opacity 0.3s ease';
    } else {
        // Light theme = normal colors everywhere, including iframes
        iframe.style.filter = 'none';
        iframe.style.opacity = '1';
        iframe.style.transition = 'filter 0.3s ease, opacity 0.3s ease';
    }
}

// Force global iframe update using CSS injection
function forceGlobalIframeUpdate(theme) {
    // Remove any existing global iframe style
    const existingStyle = document.getElementById('global-iframe-theme');
    if (existingStyle) {
        existingStyle.remove();
    }
    
    // Create a global CSS rule for ALL iframes
    const style = document.createElement('style');
    style.id = 'global-iframe-theme';
    
    if (theme === 'dark') {
        style.textContent = `
            iframe {
                filter: invert(1) !important;
                opacity: 0.95 !important;
                transition: filter 0.3s ease, opacity 0.3s ease !important;
            }
        `;
    } else {
        style.textContent = `
            iframe {
                filter: none !important;
                opacity: 1 !important;
                transition: filter 0.3s ease, opacity 0.3s ease !important;
            }
        `;
    }
    
    document.head.appendChild(style);
    
    // Also use MutationObserver to catch any new iframes
    ensureAllIframesProcessed(theme);
}

// Comprehensive iframe processing with multiple strategies
function ensureAllIframesProcessed(theme) {
    // Strategy 1: Process all existing iframes immediately
    const processAllIframes = () => {
        const allIframes = document.querySelectorAll('iframe');
        allIframes.forEach(iframe => {
            applyConsistentIframeFilter(iframe, theme);
        });
    };
    
    // Process immediately
    processAllIframes();
    
    // Strategy 2: Process again after a short delay (for lazy-loaded content)
    setTimeout(processAllIframes, 100);
    setTimeout(processAllIframes, 500);
    setTimeout(processAllIframes, 1000);
    
    // Strategy 3: Set up continuous monitoring
    const intervalId = setInterval(() => {
        const iframes = document.querySelectorAll('iframe');
        iframes.forEach(iframe => {
            // Check if iframe has the correct filter applied
            const currentFilter = iframe.style.filter;
            const expectedFilter = theme === 'dark' ? 'invert(1)' : 'none';
            
            if (currentFilter !== expectedFilter) {
                applyConsistentIframeFilter(iframe, theme);
            }
        });
    }, 2000); // Check every 2 seconds
    
    // Clean up the interval after 30 seconds
    setTimeout(() => clearInterval(intervalId), 30000);
}

// Function to set the theme in the main document and all iframes
function setTheme(theme) {
    // Set theme for main document
    setDocumentTheme(document, theme);
    
    // Set theme for all iframes using multiple strategies
    updateIframeThemes(theme);
}

// Auto-setup for iframes
if (window.self !== window.top) {
    // This is an iframe
    setupIframeThemeListener();
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