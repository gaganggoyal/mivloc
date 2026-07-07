import type { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://mivloc.online'
  const now = new Date()
  return [
    { url: base, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: `${base}/once`, lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${base}/auth/login`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
  ]
}
