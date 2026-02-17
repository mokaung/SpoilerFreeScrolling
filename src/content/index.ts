import { TweetExtractor } from './tweetExtractor';
import type { ExtractedTweet } from '../shared/types';

console.log('🔍 Spoiler Blocker content script loaded on:', window.location.href);

const extractor = new TweetExtractor();
const processedTweets = new Set<string>();
const pendingTweets = new Map<Element, number>();

function scanTweets() {
  const tweetElements = document.querySelectorAll('article[data-testid="tweet"]');
  
  tweetElements.forEach((element) => {
    // Quick check if already processed
    const statusLink = element.querySelector('a[href*="/status/"]');
    const href = statusLink?.getAttribute('href');
    const match = href?.match(/status\/(\d+)/);
    const quickId = match ? match[1] : null;
    
    if (quickId && processedTweets.has(quickId)) {
      return;
    }

    // Cancel any pending timeout for this tweet
    if (pendingTweets.has(element)) {
      clearTimeout(pendingTweets.get(element)!);
    }

    // Wait 300ms for media to load before extracting
    // because media asynchronously loads after tweet is loaded, so
    // without a timeout, the media may not be loaded when the tweet is extracted
    // thus hasVideo and hasImages may be false
    const timeout = window.setTimeout(() => {
      processTweetElement(element);
      pendingTweets.delete(element);
    }, 300);

    pendingTweets.set(element, timeout);
  });
}

function processTweetElement(element: Element) {
  const tweet = extractor.extractTweet(element);
  
  if (tweet && !processedTweets.has(tweet.id)) {
    processedTweets.add(tweet.id);
    
    console.log('📧 Extracted tweet:', {
      id: tweet.id,
      author: tweet.author,
      text: tweet.text.substring(0, 100) + (tweet.text.length > 100 ? '...' : ''),
      hasImages: tweet.hasImages,
      hasVideo: tweet.hasVideo,
      isQuoteTweet: tweet.isQuoteTweet,
      hasLinkPreview: tweet.hasLinkPreview,
      linkPreviewText: tweet.linkPreviewText?.substring(0, 50),
    });
    
    processTweet(tweet);
  }
}

function processTweet(tweet: ExtractedTweet) {
  // TODO: Risk scoring logic
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', scanTweets);
} else {
  scanTweets();
}

const observer = new MutationObserver(() => {
  scanTweets();
});

observer.observe(document.body, {
  childList: true,
  subtree: true,
});

console.log('👀 Watching for new tweets...');