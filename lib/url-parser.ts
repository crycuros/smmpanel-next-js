// URL Parser for different social media platforms

export interface ParsedUrl {
  platform: 'facebook' | 'instagram' | 'twitter' | 'youtube' | 'tiktok' | 'linkedin' | 'unknown'
  postId?: string
  username?: string
  videoId?: string
  isValid: boolean
  needsExpansion?: boolean
  error?: string
}

// Facebook URL patterns - check share links FIRST
const facebookPatterns = [
  // Share links - these need expansion
  /facebook\.com\/share\/p\/([^/?]+)/i,
  /fb\.watch\/([^/?]+)/i,
  // Regular posts
  /facebook\.com\/([^/]+)\/posts\/([^/?]+)/i,
  /facebook\.com\/([^/]+)\/photos\/([^/?]+)/i,
  /facebook\.com\/photo\.php\?fbid=([^\/&]+)/i,
  /facebook\.com\/story\.php\?story_fbid=([^\/&]+)/i,
  // Profile links
  /facebook\.com\/([^/?]+)/i,
]

// Instagram URL patterns
const instagramPatterns = [
  /instagram\.com\/p\/([^\/?]+)/i,
  /instagram\.com\/reel\/([^\/?]+)/i,
  /instagram\.com\/stories\/([^\/]+)\/([^\/?]+)/i,
  /instagram\.com\/([^\/?]+)/i,
]

// Twitter/X URL patterns
const twitterPatterns = [
  /twitter\.com\/([^\/]+)\/status\/([^\/?]+)/i,
  /x\.com\/([^\/]+)\/status\/([^\/?]+)/i,
  /x\.com\/([^\/?]+)/i,
]

// YouTube URL patterns
const youtubePatterns = [
  /youtube\.com\/watch\?v=([^\/?&]+)/i,
  /youtu\.be\/([^\/?]+)/i,
  /youtube\.com\/shorts\/([^\/?]+)/i,
  /youtube\.com\/channel\/([^\/?]+)/i,
  /youtube\.com\/@([^\/?]+)/i,
]

// TikTok URL patterns
const tiktokPatterns = [
  /tiktok\.com\/@([^\/]+)\/video\/([^\/?]+)/i,
  /tiktok\.com\/v\/([^\/?]+)/i,
  /vm\.tiktok\.com\/([^\/?]+)/i,
]

// LinkedIn URL patterns
const linkedinPatterns = [
  /linkedin\.com\/posts\/([^\/?]+)/i,
  /linkedin\.com\/company\/([^\/?]+)/i,
  /linkedin\.com\/in\/([^\/?]+)/i,
]

export function parseSocialUrl(url: string): ParsedUrl {
  if (!url) {
    return { platform: 'unknown', isValid: false, error: 'Empty URL' }
  }

  try {
    // Normalize URL
    let normalizedUrl = url.trim()
    if (!normalizedUrl.startsWith('http')) {
      normalizedUrl = 'https://' + normalizedUrl
    }

    // Check Facebook - handle share links specially
    for (const pattern of facebookPatterns) {
      const match = normalizedUrl.match(pattern)
      if (match) {
        // Check if it's a share link that needs expansion
        if (normalizedUrl.includes('/share/p/') || normalizedUrl.includes('/share/r/')) {
          return {
            platform: 'facebook',
            postId: match[1],
            isValid: false,
            needsExpansion: true,
            error: 'Share link - needs expansion to original URL',
          }
        }
        // Check if it's fb.watch link
        if (normalizedUrl.includes('fb.watch/')) {
          return {
            platform: 'facebook',
            postId: match[1],
            isValid: false,
            needsExpansion: true,
            error: 'Watch link - needs expansion to original URL',
          }
        }
        return {
          platform: 'facebook',
          postId: match[2] || match[1],
          username: match[1],
          isValid: true,
        }
      }
    }

    // Check Instagram
    for (const pattern of instagramPatterns) {
      const match = normalizedUrl.match(pattern)
      if (match) {
        return {
          platform: 'instagram',
          postId: match[2] || match[1],
          username: match[1],
          isValid: true,
        }
      }
    }

    // Check Twitter/X
    for (const pattern of twitterPatterns) {
      const match = normalizedUrl.match(pattern)
      if (match) {
        return {
          platform: 'twitter',
          postId: match[2],
          username: match[1],
          isValid: true,
        }
      }
    }

    // Check YouTube - handle short URLs that need expansion
    for (const pattern of youtubePatterns) {
      const match = normalizedUrl.match(pattern)
      if (match) {
        // Check if it's a youtu.be short URL that needs expansion
        if (normalizedUrl.includes('youtu.be/')) {
          return {
            platform: 'youtube',
            videoId: match[1],
            isValid: false,
            needsExpansion: true,
            error: 'YouTube short URL - will convert to watch URL',
          }
        }
        return {
          platform: 'youtube',
          videoId: match[1],
          isValid: true,
        }
      }
    }

    // Check TikTok
    for (const pattern of tiktokPatterns) {
      const match = normalizedUrl.match(pattern)
      if (match) {
        return {
          platform: 'tiktok',
          postId: match[2] || match[1],
          username: match[1],
          isValid: true,
        }
      }
    }

    // Check LinkedIn
    for (const pattern of linkedinPatterns) {
      const match = normalizedUrl.match(pattern)
      if (match) {
        return {
          platform: 'linkedin',
          postId: match[1],
          isValid: true,
        }
      }
    }

    return {
      platform: 'unknown',
      isValid: false,
      error: 'Unrecognized URL format',
    }

  } catch (error) {
    return {
      platform: 'unknown',
      isValid: false,
      error: 'Invalid URL',
    }
  }
}

export function getPlatformInfo(platform: string) {
  const platforms: Record<string, { name: string; color: string; examples: string }> = {
    facebook: {
      name: 'Facebook',
      color: 'bg-blue-600',
      examples: 'facebook.com/username/posts/123 or fb.watch/abc',
    },
    instagram: {
      name: 'Instagram',
      color: 'bg-pink-600',
      examples: 'instagram.com/p/abc or instagram.com/reel/abc',
    },
    twitter: {
      name: 'Twitter/X',
      color: 'bg-black',
      examples: 'twitter.com/username/status/123 or x.com/username/status/123',
    },
    youtube: {
      name: 'YouTube',
      color: 'bg-red-600',
      examples: 'youtube.com/watch?v=abc or youtu.be/abc',
    },
    tiktok: {
      name: 'TikTok',
      color: 'bg-black',
      examples: 'tiktok.com/@username/video/123',
    },
    linkedin: {
      name: 'LinkedIn',
      color: 'bg-blue-700',
      examples: 'linkedin.com/posts/username/123',
    },
    unknown: {
      name: 'Unknown',
      color: 'bg-gray-500',
      examples: 'Enter a valid social media URL',
    },
  }

  return platforms[platform] || platforms.unknown
}
