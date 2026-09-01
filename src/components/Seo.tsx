import { Helmet } from "react-helmet-async";
import { useBrand } from "@/hooks/use-brand";
import { SITE } from "@/lib/site";

interface SeoProps {
  title: string;
  description: string;
  path?: string;
  type?: string;
  jsonLd?: Record<string, unknown>;
  noIndex?: boolean;
}

const Seo = ({ title, description, path = "/", type = "website", jsonLd, noIndex }: SeoProps) => {
  const { profile } = useBrand();
  const brandName = profile.brandName || SITE.name;
  const fullTitle = title.includes(brandName) ? title : `${title} | ${brandName}`;
  const url = `${SITE.domain}${path}`;
  const icon = profile.logoUrl;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      {icon && !icon.startsWith("data:") ? <link rel="icon" href={icon} /> : null}
      {noIndex ? <meta name="robots" content="noindex" /> : null}

      <meta property="og:site_name" content={brandName} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />

      {jsonLd ? (
        <script type="application/ld+json">
          {JSON.stringify({ "@context": "https://schema.org", ...jsonLd })}
        </script>
      ) : null}
    </Helmet>
  );
};

export default Seo;
