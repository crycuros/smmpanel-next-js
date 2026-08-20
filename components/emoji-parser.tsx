"use client"

import { useEffect } from "react"

// Use Twemoji CDN - converts emojis to images automatically
export function EmojiParser() {
  useEffect(() => {
    // Load Twemoji script
    const script = document.createElement('script')
    script.src = 'https://cdn.jsdelivr.net/npm/twemoji@14.0.2/dist/twemoji.min.js'
    script.async = true
    
    script.onload = () => {
      // Initialize Twemoji to parse all emojis in the document
      if ((window as any).twemoji) {
        (window as any).twemoji.parse(document.body, {
          base: 'https://cdn.jsdelivr.net/npm/twemoji@14.0.2/',
          ext: '.svg',
          size: '72x72',
          className: 'twemoji-emoji',
        })
      }
    }
    
    document.body.appendChild(script)
    
    // Also handle dynamic content
    const observer = new MutationObserver((mutations) => {
      if ((window as any).twemoji) {
        mutations.forEach((mutation) => {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === 1) {
              (window as any).twemoji.parse(node, {
                base: 'https://cdn.jsdelivr.net/npm/twemoji@14.0.2/',
                ext: '.svg',
                size: '72x72',
                className: 'twemoji-emoji',
              })
            }
          })
        })
      }
    })
    
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    })
    
    return () => {
      observer.disconnect()
    }
  }, [])

  return null
}
