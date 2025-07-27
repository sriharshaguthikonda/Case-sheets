document.addEventListener('DOMContentLoaded', function() {
    const detailsElements = document.querySelectorAll('details');
    
    detailsElements.forEach(details => {
        details.addEventListener('dblclick', function(e) {
            // Don't handle double-clicks on the summary element itself
            if (e.target.tagName === 'SUMMARY') {
                return;
            }
            
            e.preventDefault();
            e.stopPropagation();
            
            // Only collapse if it's currently open
            if (this.open) {
                this.open = false;
            }
        });
    });
    
    // For iframes, use a simple approach - listen to focus events
    const iframes = document.querySelectorAll('details iframe');
    iframes.forEach(iframe => {
        // Add double-click listener directly to iframe
        iframe.addEventListener('dblclick', function(e) {
            e.preventDefault();
            const details = this.closest('details');
            if (details && details.open) {
                details.open = false;
            }
        });
        
        // Also handle when iframe gets focus and receives double-click
        iframe.addEventListener('load', function() {
            try {
                // Try to add event listener to iframe content if same-origin
                this.contentWindow.document.addEventListener('dblclick', function(e) {
                    e.preventDefault();
                    const details = iframe.closest('details');
                    if (details && details.open) {
                        details.open = false;
                    }
                });
            } catch (error) {
                // Cross-origin iframe - can't access content
                console.log('Cross-origin iframe detected');
            }
        });
    });
});