console.log('🔍 Spoiler Blocker content script loaded on:', window.location.href);

// Test: Find all tweets on page
function scanTweets() {
  const tweets = document.querySelectorAll('article[data-testid="tweet"]');
  console.log(`Found ${tweets.length} tweets`);
  return tweets;
}

// Run scan when page loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', scanTweets);
} else {
  scanTweets();
}

// Watch for new tweets (infinite scroll)
const observer = new MutationObserver(() => {
  scanTweets();
});

observer.observe(document.body, {
  childList: true,
  subtree: true,
});