import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title: string;
  description: string;
  image?: string;
  url?: string;
  type?: string;
}

const SEO: React.FC<SEOProps> = ({ 
  title, 
  description, 
  image = 'https://lh3.googleusercontent.com/d/1u6X_oVTZvmMVfiITy0Felr6yukTDkW9y', // Use mentor image as default OG if nothing else
  url = typeof window !== 'undefined' ? window.location.href : '',
  type = 'website'
}) => {
  const siteName = 'Mentorino';
  const fullTitle = `${title} | ${siteName}`;

  return (
    <Helmet>
      {/* Standard metadata tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />

      {/* OpenGraph tags */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={siteName} />

      {/* Twitter Card tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
    </Helmet>
  );
};

export default SEO;
