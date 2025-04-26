import { Helmet } from 'react-helmet-async'

interface SEOProps {
  title: string
  description?: string
  keywords?: string
  ogImage?: string
  isMainPage?: boolean
}

const SEO = ({ title, description, keywords, ogImage, isMainPage = false }: SEOProps) => {
  const siteTitle = 'Docu Talk'
  const fullTitle = `${title} | ${siteTitle}`
  const defaultOgImage = 'https://docu-talk.ai-apps.cloud/og-image.jpg'

  // For internal pages, we only set the title for browser tab
  if (!isMainPage) {
    return (
      <Helmet>
        <title>{fullTitle}</title>
      </Helmet>
    )
  }

  // For main page, we set all SEO meta tags
  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage || defaultOgImage} />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage || defaultOgImage} />
    </Helmet>
  )
}

export default SEO 