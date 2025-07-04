// Save checkbox state to localStorage
function saveCheckboxState() {
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    const state = {};
    checkboxes.forEach(cb => {
        state[cb.id] = cb.checked;
    });
    localStorage.setItem('plab2_checklist_state', JSON.stringify(state));
}

// Load checkbox state from localStorage
function loadCheckboxState() {
    const state = JSON.parse(localStorage.getItem('plab2_checklist_state') || '{}');
    Object.keys(state).forEach(id => {
        const cb = document.getElementById(id);
        if (cb) cb.checked = state[id];
    });
}

// Add event listeners to all checkboxes
document.addEventListener('DOMContentLoaded', function() {
    loadCheckboxState();
    document.querySelectorAll('input[type="checkbox"]').forEach(cb => {
        cb.addEventListener('change', saveCheckboxState);
    });
});

// Function to send height to parent
function sendHeightToParent() {
    requestAnimationFrame(() => {
        const height = document.body.scrollHeight;
        window.parent.postMessage({ type: 'setIframeHeight', height: height }, '*');
    });
}

// Listen for height request messages from parent
window.addEventListener('message', function(event) {
    if (event.data && event.data.type === 'requestHeight') {
        sendHeightToParent();
    }
});

// Send height when content loads
window.addEventListener('load', sendHeightToParent);

// Send height when content changes (optional, for dynamic content)
const observer = new MutationObserver(sendHeightToParent);
observer.observe(document.body, { 
    childList: true, 
    subtree: true,
    attributes: true
});