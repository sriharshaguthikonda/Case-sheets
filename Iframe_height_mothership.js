// Listen for height messages from iframes
window.addEventListener('message', function(event) {
    if (event.data && event.data.type === 'setIframeHeight') {
        // Find the iframe that sent this message
        const iframes = document.querySelectorAll('iframe');
        for (let iframe of iframes) {
            if (iframe.contentWindow === event.source) {
                const maxHeight = window.innerHeight * 0.7; // 70% of viewport height
                const desiredHeight = event.data.height + 20; // Content height + padding
                iframe.style.height = Math.min(desiredHeight, maxHeight) + 'px';
                break;
            }
        }
    }
});

// Fallback resize function
function resizeIframe(iframe) {
    iframe.onload = function() {
        try {
            const body = iframe.contentDocument.body;
            const html = iframe.contentDocument.documentElement;
            const height = Math.max(
                body.scrollHeight,
                body.offsetHeight,
                html.clientHeight,
                html.scrollHeight,
                html.offsetHeight
            );
            const maxHeight = window.innerHeight * 0.7; // 70% of viewport height
            iframe.style.height = Math.min(height + 20, maxHeight) + 'px';
        } catch(e) {
            // Cross-origin restriction - iframe will send message instead
            console.log('Waiting for iframe height message...');
        }
    };
}

// Handle details toggle to request iframe height
document.addEventListener('DOMContentLoaded', function() {
    const iframes = document.querySelectorAll('iframe');
    iframes.forEach(resizeIframe);

    const detailsElements = document.querySelectorAll('details');
    detailsElements.forEach(details => {
        details.addEventListener('toggle', function() {
            if (this.open) {
                const iframe = this.querySelector('iframe');
                if (iframe) {
                    iframe.contentWindow.postMessage({ type: 'requestHeight' }, '*');
                }
            }
        });
    });
});