// Theme Toggle Functionality with Enhanced Iframe Support (Excluding Video iframes)
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

// Function to check if an iframe contains video content
function isVideoIframe(iframe) {
    // Check if iframe is in a video container
    if (iframe.closest('.video-container')) {
        return true;
    }
    
    // Check src for common video platforms
    const src = iframe.src || iframe.getAttribute('data-src') || '';
    const videoPatterns = [
        'youtube.com',
        'youtu.be',
        'vimeo.com',
        'dailymotion.com',
        'twitch.tv',
        'facebook.com/plugins/video',
        'instagram.com/p/',
        'tiktok.com',
        'video',
        'embed/video',
        '.mp4',
        '.webm',
        '.ogg',
        'player',
        'watch'
    ];
    
    const isVideo = videoPatterns.some(pattern => 
        src.toLowerCase().includes(pattern.toLowerCase())
    );
    
    // Check for video-related attributes or classes
    const videoClasses = ['video', 'player', 'youtube', 'vimeo', 'media'];
    const hasVideoClass = videoClasses.some(cls => 
        iframe.className.toLowerCase().includes(cls) ||
        iframe.id.toLowerCase().includes(cls)
    );
    
    // Check parent elements for video-related classes
    let parent = iframe.parentElement;
    let hasVideoParent = false;
    while (parent && parent !== document.body) {
        if (videoClasses.some(cls => 
            parent.className.toLowerCase().includes(cls) ||
            parent.id.toLowerCase().includes(cls)
        )) {
            hasVideoParent = true;
            break;
        }
        parent = parent.parentElement;
    }
    
    return isVideo || hasVideoClass || hasVideoParent;
}

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

// Enhanced iframe theme handling - ensures ALL non-video iframes are processed
function updateIframeThemes(theme) {
    // Get ALL iframes in the document, including nested ones
    const iframes = document.querySelectorAll('iframe');
    
    console.log(`Found ${iframes.length} iframes to process`); // Debug log
    
    iframes.forEach((iframe, index) => {
        // Check if this is a video iframe
        if (isVideoIframe(iframe)) {
            console.log(`Skipping video iframe ${index + 1}:`, iframe.src || 'no src'); // Debug log
            // Remove any existing filters from video iframes
            iframe.style.filter = 'none';
            iframe.style.opacity = '1';
            return; // Skip video iframes
        }
        
        console.log(`Processing non-video iframe ${index + 1}:`, iframe.src || 'no src'); // Debug log
        
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
            if (!isVideoIframe(iframe)) {
                applyConsistentIframeFilter(iframe, theme);
                try {
                    if (iframe.contentDocument) {
                        setDocumentTheme(iframe.contentDocument, theme);
                    }
                } catch (e) {
                    // Still apply the filter even if we can't access content
                    applyConsistentIframeFilter(iframe, theme);
                }
            }
        });
        
        // Method 4: Handle focus events to re-apply theme
        iframe.addEventListener('focus', function() {
            if (!isVideoIframe(iframe)) {
                applyConsistentIframeFilter(iframe, theme);
            }
        });
        
        // Method 5: Handle when iframe comes into view
        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting && !isVideoIframe(entry.target)) {
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

// Apply complete inversion to non-video iframes only
function applyConsistentIframeFilter(iframe, theme) {
    // Skip video iframes
    if (isVideoIframe(iframe)) {
        iframe.style.filter = 'none';
        iframe.style.opacity = '1';
        return;
    }
    
    if (theme === 'dark') {
        // Dark theme = completely inverted colors for non-video iframes
        iframe.style.filter = 'invert(1)';
        iframe.style.opacity = '0.95';
        iframe.style.transition = 'filter 0.3s ease, opacity 0.3s ease';
    } else {
        // Light theme = normal colors for all iframes
        iframe.style.filter = 'none';
        iframe.style.opacity = '1';
        iframe.style.transition = 'filter 0.3s ease, opacity 0.3s ease';
    }
}

// Force global iframe update using CSS injection (excluding video iframes)
function forceGlobalIframeUpdate(theme) {
    // Remove any existing global iframe style
    const existingStyle = document.getElementById('global-iframe-theme');
    if (existingStyle) {
        existingStyle.remove();
    }
    
    // Create a global CSS rule for non-video iframes only
    const style = document.createElement('style');
    style.id = 'global-iframe-theme';
    
    if (theme === 'dark') {
        style.textContent = `
            /* Apply inversion to all iframes except video iframes */
            iframe:not(.video):not([src*="youtube"]):not([src*="vimeo"]):not([src*="dailymotion"]):not([src*="twitch"]):not([src*="video"]) {
                filter: invert(1) !important;
                opacity: 0.95 !important;
                transition: filter 0.3s ease, opacity 0.3s ease !important;
            }
            
            /* Explicitly keep video iframes normal */
            .video-container iframe,
            iframe[src*="youtube"],
            iframe[src*="vimeo"],
            iframe[src*="dailymotion"],
            iframe[src*="twitch"],
            iframe[src*="video"],
            iframe.video,
            iframe.player {
                filter: none !important;
                opacity: 1 !important;
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

// Comprehensive iframe processing with multiple strategies (excluding video iframes)
function ensureAllIframesProcessed(theme) {
    // Strategy 1: Process all existing non-video iframes immediately
    const processAllIframes = () => {
        const allIframes = document.querySelectorAll('iframe');
        allIframes.forEach(iframe => {
            if (!isVideoIframe(iframe)) {
                applyConsistentIframeFilter(iframe, theme);
            } else {
                // Ensure video iframes stay normal
                iframe.style.filter = 'none';
                iframe.style.opacity = '1';
            }
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
            if (isVideoIframe(iframe)) {
                // Ensure video iframes always stay normal
                if (iframe.style.filter !== 'none') {
                    iframe.style.filter = 'none';
                    iframe.style.opacity = '1';
                }
            } else {
                // Check if non-video iframe has the correct filter applied
                const currentFilter = iframe.style.filter;
                const expectedFilter = theme === 'dark' ? 'invert(1)' : 'none';
                
                if (currentFilter !== expectedFilter) {
                    applyConsistentIframeFilter(iframe, theme);
                }
            }
        });
    }, 2000); // Check every 2 seconds
    
    // Clean up the interval after 30 seconds
    setTimeout(() => clearInterval(intervalId), 30000);
}

// Function to set the theme in the main document and all non-video iframes
function setTheme(theme) {
    // Set theme for main document
    setDocumentTheme(document, theme);
    
    // Set theme for all non-video iframes using multiple strategies
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