
  // Helper function to extract video ID from a URL
  function extractVideoId(url) {
    const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    return match ? match[1] : null;
  }

  // Global map to store player objects by video ID
  window.youtubePlayers = {};

  // Function to prepare iframes: add enablejsapi=1 and assign an ID if needed
  function prepareIframe(iframe, index) {
    let src = iframe.src;
    if (!src.includes('enablejsapi=1')) {
      src += (src.includes('?') ? '&' : '?') + 'enablejsapi=1';
      iframe.src = src; // This may cause a one-time reload
    }
    if (!iframe.id) {
      iframe.id = `youtube-iframe-${index}`;
    }
    return iframe.id;
  }

  // Prepare iframes when the page loads
  document.addEventListener('DOMContentLoaded', function() {
    const iframes = document.querySelectorAll('iframe[src*="youtube.com/embed"]');
    iframes.forEach((iframe, index) => {
      prepareIframe(iframe, index);
    });
  });

  // Initialize players when the YouTube IFrame API is ready
  function onYouTubeIframeAPIReady() {
    const iframes = document.querySelectorAll('iframe[src*="youtube.com/embed"]');
    iframes.forEach(iframe => {
      const videoId = extractVideoId(iframe.src);
      if (videoId) {
        const player = new YT.Player(iframe.id, {
          playerVars: {
            rel: 0 // Prevents related videos from other channels
          },
          events: {
            'onReady': function(event) {
              window.youtubePlayers[videoId] = event.target;
            }
          }
        });
      }
    });
  }

  // Handle timestamp link clicks
  document.addEventListener('DOMContentLoaded', function() {
    const timestampLinks = document.querySelectorAll('.timestamp');
    
    timestampLinks.forEach(link => {
      link.addEventListener('click', function(event) {
        event.preventDefault();
        const href = this.getAttribute('href');
        let seconds = null;
        let videoId = null;

        // Extract video ID
        const videoIdMatch = href.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
        if (videoIdMatch && videoIdMatch[1]) {
          videoId = videoIdMatch[1];
        }

        // Extract time from 't=XXs' or '?start=XX'
        const timeMatchSeconds = href.match(/t=(\d+)s?/);
        if (timeMatchSeconds && timeMatchSeconds[1]) {
          seconds = timeMatchSeconds[1];
        } else {
          const timeMatchStart = href.match(/[?&]start=(\d+)/);
          if (timeMatchStart && timeMatchStart[1]) {
            seconds = timeMatchStart[1];
          }
        }

        if (videoId && seconds !== null) {
          const player = window.youtubePlayers[videoId];
          if (player) {
            // Use the API to seek and play
            player.seekTo(seconds, true); // true allows seeking before playback
            player.playVideo();
          } else {
            // Fallback to original method if player isn’t ready
            console.warn(`Player not found for video ID: ${videoId}`);
            const allIframes = document.querySelectorAll('iframe[src*="youtube.com/embed"]');
            let targetIframe = null;
            allIframes.forEach(iframe => {
              if (iframe.src.includes(videoId)) {
                targetIframe = iframe;
              }
            });
            if (targetIframe) {
              const baseEmbedUrl = `https://www.youtube.com/embed/${videoId}`;
              targetIframe.src = `${baseEmbedUrl}?start=${seconds}&autoplay=1&rel=0`;
            }
          }
        } else {
          console.warn("Could not parse video ID or time from link: " + href);
        }
      });
    });
  });

