import type { ExtractedTweet } from "../shared/types";

export class TweetExtractor {
  /**
   * Extracts a tweet from an article element
   * @param element - The article element containing the tweet
   * @returns The extracted tweet or null if it cannot be extracted
   */
  extractTweet(element: Element): ExtractedTweet | null {
    try {
      const article = element as HTMLElement;
      const tweetId = this.extractTweetId(article);
      if (!tweetId) {
        console.warn("Could not extract tweet ID");
        return null;
      }

      const author = this.extractAuthor(article);
      const text = this.extractText(article);
      const hasImages = this.hasImages(article);
      const hasVideo = this.hasVideo(article);
      const isQuoteTweet = this.isQuoteTweet(article);
      const quotedText = isQuoteTweet
        ? this.extractQuotedText(article)
        : undefined;
      const hasLinkPreview = this.hasLinkPreview(article);
      const linkPreviewText = hasLinkPreview
        ? this.extractLinkPreviewText(article)
        : undefined;

      return {
        id: tweetId,
        author: author || "unknown",
        text,
        hasImages,
        hasVideo,
        isQuoteTweet,
        quotedText: quotedText || "",
        hasLinkPreview,
        linkPreviewText: linkPreviewText || "",
        timestamp: Date.now(),
        element: article,
      };
    } catch (error) {
      console.error("Error extracting tweet:", error);
      return null;
    }
  }

  /**
   * Extracts the tweet ID from the article element
   * @param article - The article element containing the tweet
   * @returns The tweet ID or null if it cannot be extracted
   */
  private extractTweetId(article: HTMLElement): string | null {
    // Find any link with /status/ in it
    const statusLink = article.querySelector('a[href*="status/"]');
    if (!statusLink) return null;

    // Extract the ID from the href (e.g. /status/1234567890)
    const href = statusLink.getAttribute("href");
    if (!href) return null;

    const matches = href.match(/status\/(\d+)/);
    return matches ? matches[1] : null;
  }

  /**
   * Extracts the author from the article element
   * @param article - The article element containing the tweet
   * @returns The author or null if it cannot be extracted
   */
  private extractAuthor(article: HTMLElement): string | null {
    // Find the username section (e.g. <span data-testid="User-Name">username</span>)
    const userNameSection = article.querySelector('[data-testid="User-Name"]');
    if (!userNameSection) return null;

    // Find all links with hrefs that start with / (e.g. /username)
    const links = userNameSection.querySelectorAll('a[href^="/"]');
    for (const link of links) {
      const href = link.getAttribute("href");
      if (href && !href.includes("/status/") && !href.includes("/photo/")) {
        // Extract the username from the href (e.g. /username)
        return href.replace(/^\/|\/$/g, "");
      }
    }

    return null;
  }

  /**
   * Extracts the text from the article element
   * @param article - The article element containing the tweet
   * @returns The text or an empty string if it cannot be extracted
   */
  private extractText(article: HTMLElement): string {
    // Find the text element (e.g. <div data-testid="tweetText">text</div>)
    const textElement = article.querySelector('[data-testid="tweetText"]');
    if (!textElement) return "";

    // Normalize the text (remove extra spaces, newlines, etc.)
    return textElement.textContent?.trim() || "";
  }

  /**
   * Extracts the quoted text from the article element
   * @param article - The article element containing the tweet
   * @returns The quoted text or null if it cannot be extracted
   */
  private extractQuotedText(article: HTMLElement): string | null {
    // Find all text elements (e.g. <div data-testid="tweetText">text</div>)
    const allTextElements = article.querySelectorAll(
      '[data-testid="tweetText"]',
    );
    // If there are more than one text element, return the second one (the quoted text)
    if (allTextElements.length > 1) {
      return this.normalizeText(allTextElements[1].textContent || "");
    }

    return null;
  }
  /**
   * Checks if the article element has images
   * @param article - The article element containing the tweet
   * @returns True if the article element has images, false otherwise
   */
  private hasImages(article: HTMLElement): boolean {
    // Check if the article element has a tweet photo (e.g. <div data-testid="tweetPhoto">photo</div>)
    return article.querySelector('[data-testid="tweetPhoto"]') !== null;
  }
  /**
   * Checks if the article element has a video
   * @param article - The article element containing the tweet
   * @returns True if the article element has a video, false otherwise
   */
  private hasVideo(article: HTMLElement): boolean {
    return (
      // Check if the article element has a video player (e.g. <div data-testid="videoPlayer">video</div>)
      // or if the article element has a video element (e.g. <video src="video.mp4">video</video>)
      article.querySelector('[data-testid="videoPlayer"]') !== null ||
      article.querySelector("video") !== null
    );
  }

  /**
   * Checks if the article element is a quote tweet
   * @param article - The article element containing the tweet
   * @returns True if the article element is a quote tweet, false otherwise
   * @returns
   */
  private isQuoteTweet(article: HTMLElement): boolean {
    // Check if the article element has a quote (e.g. <blockquote>quote</blockquote>)
    const textElements = article.querySelectorAll('[data-testid="tweetText"]');
    return textElements.length > 1;
  }

  /**
   * Checks if the article element has a link preview
   * @param article - The article element containing the tweet
   * @returns True if the article element has a link preview, false otherwise
   */
  private hasLinkPreview(article: HTMLElement): boolean {
    return article.querySelector('[data-testid="card.wrapper"]') !== null;
  }

  /**
   * Extracts the link preview text from the article element
   * @param article - The article element containing the tweet
   * @returns The link preview text or null if it cannot be extracted
   */
  private extractLinkPreviewText(article: HTMLElement): string | null {
    const cardWrapper = article.querySelector('[data-testid="card.wrapper"]');
    if (!cardWrapper) return null;

    // Get the title from the aria-label on the link
    const cardLink = cardWrapper.querySelector("a[aria-label]");
    if (cardLink) {
      const ariaLabel = cardLink.getAttribute("aria-label");
      if (ariaLabel) {
        // Split the aria-label into parts and return the title
        // The first part is the domain, so we remove it and return the rest
        const parts = ariaLabel.split(" ");
        if (parts.length > 1) {
          parts.shift();
          return this.normalizeText(parts.join(" "));
        }
      }
    }
    // If no aria-label, try to get text content of the card wrapper
    const cardText = cardWrapper.textContent;
    return cardText ? this.normalizeText(cardText) : null;
  }

  /**
   * Normalizes the text (removes extra spaces, newlines, etc.)
   * @param text - The text to normalize
   * @returns The normalized text
   */
  private normalizeText(text: string): string {
    // Normalize the text (remove extra spaces, newlines, etc.)
    return text.replace(/\s+/g, " ").trim();
  }

  /**
   * Gets the full text of the tweet
   * @param tweet - The tweet to get the full text of
   * @returns The full text of the tweet
   */
  getFullText(tweet: ExtractedTweet): string {
    let fullText = tweet.text;
    // If the tweet is a quote tweet, add the quoted text to the full text
    if (tweet.quotedText) {
      fullText += " " + tweet.quotedText;
    }

    // If the tweet has a link preview, add the link preview text to the full text
    if (tweet.linkPreviewText) {
      fullText += " " + tweet.linkPreviewText;
    }
    
    return fullText;
  }
}
