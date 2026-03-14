import { NextRequest, NextResponse } from 'next/server'
import { cleanUrl } from '@/lib/url-cleaner'

interface PreviewData {
  title?: string
  description?: string
  thumbnail?: string
  author?: string
  authorImage?: string
  platform?: string
  platformIcon?: string
  embedHtml?: string
}

function getYouTubeEmbed(videoId: string): string {
  return `<iframe width="100%" height="100%" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="position:absolute;top:0;left:0;width:100%;height:100%"></iframe>`
}

async function getFacebookEmbed(url: string): Promise<string | null> {
  try {
    // Try using Facebook oEmbed API
    const oembedUrl = `https://www.facebook.com/plugins/post/oembed.json/?url=${encodeURIComponent(url)}`
    const response = await fetch(oembedUrl)
    if (response.ok) {
      const data = await response.json()
      return data.html
    }
  } catch (e) {
    console.error('Facebook oEmbed error:', e)
  }
  return null
}

async function getInstagramEmbed(url: string): Promise<string | null> {
  try {
    // Try using Instagram oEmbed API
    const oembedUrl = `https://api.instagram.com/oembed/?url=${encodeURIComponent(url)}`
    const response = await fetch(oembedUrl)
    if (response.ok) {
      const data = await response.json()
      return data.html
    }
  } catch (e) {
    console.error('Instagram oEmbed error:', e)
  }
  return null
}

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json()

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 })
    }

    const cleanUrlStr = cleanUrl(url)
    let preview: PreviewData = {}
    let platform = 'unknown'

    // Check for YouTube
    if (cleanUrlStr.includes('youtube.com/watch') || cleanUrlStr.includes('youtu.be')) {
      const videoId = cleanUrlStr.match(/(?:v=|youtu\.be\/)([^&\?]+)/)?.[1]
      if (videoId) {
        platform = 'youtube'
        preview = {
          thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
          title: 'YouTube Video',
          platform: 'YouTube',
          embedHtml: getYouTubeEmbed(videoId),
        }
        return NextResponse.json({
          url: cleanUrlStr,
          platform,
          ...preview,
        })
      }
    }

    // Check for TikTok
    if (cleanUrlStr.includes('tiktok.com/')) {
      platform = 'tiktok'
      const tiktokId = cleanUrlStr.match(/tiktok\.com\/@[\w-]+\/video\/(\d+)/)?.[1]
      preview = { 
        platform: 'TikTok',
        title: 'TikTok Video',
        thumbnail: 'https://upload.wikimedia.org/wikipedia/commons/3/34/Icon_hulusTiktok.png',
      }
      // Try to get TikTok embed
      if (tiktokId) {
        preview.embedHtml = `<iframe src="https://www.tiktok.com/embed/v2/${tiktokId}" width="100%" height="100%" frameborder="0" allowfullscreen style="position:absolute;top:0;left:0;width:100%;height:100%"></iframe>`
      }
      return NextResponse.json({
        url: cleanUrlStr,
        platform,
        ...preview,
      })
    }

    // Check for Facebook
    if (cleanUrlStr.includes('facebook.com/') || cleanUrlStr.includes('fb.watch')) {
      platform = 'facebook'
      preview = { 
        platform: 'Facebook',
        title: 'Facebook Post',
      }
      
      // Try to get Facebook embed
      const fbEmbed = await getFacebookEmbed(cleanUrlStr)
      if (fbEmbed) {
        preview.embedHtml = fbEmbed
        preview.thumbnail = 'https://upload.wikimedia.org/wikipedia/commons/5/51/Facebook_f_logo_%282019%29.svg'
      } else {
        preview.thumbnail = 'https://upload.wikimedia.org/wikipedia/commons/5/51/Facebook_f_logo_%282019%29.svg'
      }
      
      return NextResponse.json({
        url: cleanUrlStr,
        platform,
        ...preview,
      })
    }

    // Check for Instagram
    if (cleanUrlStr.includes('instagram.com/')) {
      platform = 'instagram'
      preview = { 
        platform: 'Instagram',
        title: 'Instagram Post',
      }
      
      // Try to get Instagram embed
      const igEmbed = await getInstagramEmbed(cleanUrlStr)
      if (igEmbed) {
        preview.embedHtml = igEmbed
        preview.thumbnail = 'https://upload.wikimedia.org/wikipedia/commons/a/a5/Instagram_icon.png'
      } else {
        preview.thumbnail = 'https://upload.wikimedia.org/wikipedia/commons/a/a5/Instagram_icon.png'
      }
      
      return NextResponse.json({
        url: cleanUrlStr,
        platform,
        ...preview,
      })
    }

    // Try to fetch OpenGraph for other URLs
    try {
      const response = await fetch(cleanUrlStr, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        }
      })
      const html = await response.text()
      
      const getMeta = (name: string): string | undefined => {
        const regex = new RegExp(`<meta[^>]*${name}[^>]*content="([^"]*)"`, 'i')
        const match = html.match(regex)
        return match?.[1]
      }
      
      const title = getMeta('og:title') || getMeta('twitter:title')
      const description = getMeta('og:description') || getMeta('twitter:description')
      const image = getMeta('og:image') || getMeta('twitter:image')
      
      if (title || image) {
        preview = { 
          title,
          description,
          thumbnail: image,
        }
      }
    } catch {
      // Ignore fetch errors
    }

    return NextResponse.json({
      url: cleanUrlStr,
      platform,
      ...preview,
    })

  } catch (error) {
    console.error('Preview error:', error)
    return NextResponse.json({ error: 'Failed to get preview' }, { status: 500 })
  }
}
