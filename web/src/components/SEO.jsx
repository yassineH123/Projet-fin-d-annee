import { Helmet } from 'react-helmet-async';

const SITE_NAME = 'AtlasWay';
const DEFAULT_DESC = 'Covoiturage au Maroc — trouvez ou proposez un trajet entre les villes marocaines.';
const DEFAULT_IMG = '/og-image.png';

export default function SEO({ title, description, image, path, noIndex }) {
  const fullTitle = title ? `${title} — ${SITE_NAME}` : `${SITE_NAME} — Covoiturage Maroc`;
  const desc = description || DEFAULT_DESC;
  const url = `https://atlasway.ma${path || ''}`;
  const img = image || DEFAULT_IMG;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={desc} />
      {noIndex && <meta name="robots" content="noindex,nofollow" />}

      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={desc} />
      <meta property="og:image" content={img} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={SITE_NAME} />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={desc} />
      <meta name="twitter:image" content={img} />

      {/* Canonique */}
      <link rel="canonical" href={url} />
    </Helmet>
  );
}
