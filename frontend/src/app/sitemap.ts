import type { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://safechat.live'
  return [
    { url: base, changeFrequency: 'weekly', priority: 1 },
    { url: `${base}/auth/login`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/once`, changeFrequency: 'monthly', priority: 0.9 },
  ]
}
