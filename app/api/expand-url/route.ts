import { NextRequest, NextResponse } from 'next/server'
import { expandUrl } from '@/lib/url-expander'
import { cleanUrl, needsCleaning } from '@/lib/url-cleaner'

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json()

    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      )
    }

    // Check if URL needs cleaning (has tracking params)
    const needsUrlCleaning = needsCleaning(url)
    let urlToProcess = url
    
    // Clean tracking parameters first if needed
    if (needsUrlCleaning) {
      urlToProcess = cleanUrl(url)
    }

    // Check if it's a URL that needs expansion
    const isFacebookShare = 
      urlToProcess.includes('facebook.com/share/') || 
      urlToProcess.includes('fb.watch/') ||
      urlToProcess.includes('facebook.com/watch/')
    
    const isYouTubeShort = 
      urlToProcess.includes('youtu.be/')
    
    const needsExpansion = isFacebookShare || isYouTubeShort

    // If no expansion needed but has cleaning, return cleaned URL
    if (!needsExpansion && needsUrlCleaning) {
      return NextResponse.json({
        originalUrl: urlToProcess,
        cleaned: true,
        expanded: false,
        message: 'Removed tracking parameters'
      })
    }

    if (!needsExpansion && !needsUrlCleaning) {
      return NextResponse.json(
        { originalUrl: urlToProcess, expanded: false, cleaned: false },
        { status: 200 }
      )
    }

    // Try to expand using Playwright (real browser)
    try {
      const expandedUrl = await expandUrl(urlToProcess)
      
      if (expandedUrl && expandedUrl !== urlToProcess) {
        // Clean the expanded URL as well
        const finalUrl = needsCleaning(expandedUrl) ? cleanUrl(expandedUrl) : expandedUrl
        
        return NextResponse.json({
          originalUrl: finalUrl,
          expanded: true,
          cleaned: needsUrlCleaning,
          message: 'Successfully expanded and cleaned URL'
        })
      }
    } catch (expandError) {
      console.error('Expansion failed:', expandError)
    }

    // If expansion failed but had cleaning, return cleaned URL
    if (needsUrlCleaning) {
      return NextResponse.json({
        originalUrl: urlToProcess,
        cleaned: true,
        expanded: false,
        message: 'Removed tracking parameters (expansion failed)'
      })
    }

    // If we got here, everything failed
    return NextResponse.json({
      originalUrl: urlToProcess,
      expanded: false,
      error: 'Could not expand URL'
    })

  } catch (error) {
    console.error('Expand URL error:', error)
    return NextResponse.json(
      { error: 'Failed to process URL' },
      { status: 500 }
    )
  }
}
