 export interface WordPressPost {
   id: number;
   title: { rendered: string };
   date: string;
   link: string;
   excerpt: { rendered: string };
 }

 export interface WordPressStats {
   postCount: number;
   siteName: string;
   latestPosts: WordPressPost[];
 }

  export const fetchWordPressData = async (url?: string, user?: string, appPass?: string): Promise<WordPressStats> => {
    // Fallback for simulation or missing config
    if (!url || !user || !appPass) {
      return {
        postCount: 15,
        siteName: 'Blog Growth Suite (Simulado)',
        latestPosts: [
          { id: 1, title: { rendered: 'Como Crescer seu Tráfego em 2024' }, date: new Date().toISOString(), link: '#', excerpt: { rendered: '' } },
          { id: 2, title: { rendered: 'Guia Completo de SEO para WordPress' }, date: new Date().toISOString(), link: '#', excerpt: { rendered: '' } },
          { id: 3, title: { rendered: 'As Melhores Estratégias de Monetização' }, date: new Date().toISOString(), link: '#', excerpt: { rendered: '' } }
        ]
      };
    }

    const baseUrl = url.replace(/\/$/, '');
    const auth = btoa(`${user}:${appPass}`);

   try {
     const [siteInfoRes, postsRes] = await Promise.all([
       fetch(`${baseUrl}/wp-json/`, {
         headers: { 'Authorization': `Basic ${auth}` }
       }),
       fetch(`${baseUrl}/wp-json/wp/v2/posts?per_page=5`, {
         headers: { 'Authorization': `Basic ${auth}` }
       })
     ]);

     if (!siteInfoRes.ok || !postsRes.ok) {
       throw new Error('Falha ao conectar ao WordPress. Verifique as credenciais.');
     }

     const siteInfo = await siteInfoRes.json();
     const posts = await postsRes.json();
     
     // Get total posts from headers if available
     const totalPosts = postsRes.headers.get('X-WP-Total') || posts.length;

     return {
       postCount: parseInt(totalPosts.toString()),
       siteName: siteInfo.name || 'Meu Blog',
       latestPosts: posts
     };
   } catch (error) {
     console.error('WordPress Fetch Error:', error);
     throw error;
   }
 };