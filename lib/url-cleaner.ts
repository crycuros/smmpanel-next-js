// URL Cleaner - removes tracking parameters from social media URLs

const TRACKING_PARAMS = [
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_term',
  'utm_content',
  'igsh',
  'fbclid',
  'gclid',
  'ref',
  'ref_url',
  'source',
  '_ga',
  '_gl',
  'mc_cid',
  'mc_eid',
  'ml_subscriber',
  'ml_subscriber_hash',
  'trk',
  'trkCampaign',
  's_kwcid',
  'soc_src',
  'soc_trk',
]

export function cleanUrl(url: string): string {
  try {
    const urlObj = new URL(url)
    
    // Remove tracking parameters
    TRACKING_PARAMS.forEach(param => {
      urlObj.searchParams.delete(param)
    })
    
    // Also remove any parameter that starts with utm_ or igsh
    const paramsToDelete: string[] = []
    urlObj.searchParams.forEach((_, key) => {
      if (key.startsWith('utm_') || key.startsWith('igsh')) {
        paramsToDelete.push(key)
      }
    })
    
    paramsToDelete.forEach(param => {
      urlObj.searchParams.delete(param)
    })
    
    return urlObj.toString()
  } catch (error) {
    console.error('Error cleaning URL:', error)
    return url
  }
}

export function needsCleaning(url: string): boolean {
  try {
    const urlObj = new URL(url)
    let hasTracking = false
    
    urlObj.searchParams.forEach((_, key) => {
      if (TRACKING_PARAMS.includes(key) || key.startsWith('utm_') || key.startsWith('igsh')) {
        hasTracking = true
      }
    })
    
    return hasTracking
  } catch {
    return false
  }
}
