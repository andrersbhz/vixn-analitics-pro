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
    totalComments: number;
    categoriesCount: number;
    tagsCount: number;
    usersCount: number;
    topCategories: { name: string; count: number }[];
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
        ],
        totalComments: 124,
        categoriesCount: 8,
        tagsCount: 45,
        usersCount: 3,
        topCategories: [
          { name: 'Marketing', count: 12 },
          { name: 'SEO', count: 8 },
          { name: 'Vendas', count: 5 }
        ]
      };
    }

    const baseUrl = url.replace(/\/$/, '');
    const auth = btoa(`${user}:${appPass}`);

    try {
      const fetchWithAuth = (endpoint: string) => 
        fetch(`${baseUrl}/wp-json/${endpoint}`, {
          headers: { 'Authorization': `Basic ${auth}` },
          signal: AbortSignal.timeout(10000) // 10s timeout
        }).catch(err => {
          console.warn(`Failed to fetch ${endpoint}:`, err);
          return null;
        });

      const [siteInfoRes, postsRes, commentsRes, categoriesRes, tagsRes, usersRes] = await Promise.all([
        fetchWithAuth(''),
        fetchWithAuth('wp/v2/posts?per_page=5'),
        fetchWithAuth('wp/v2/comments?per_page=1'),
        fetchWithAuth('wp/v2/categories?per_page=10&orderby=count&order=desc'),
        fetchWithAuth('wp/v2/tags?per_page=1'),
        fetchWithAuth('wp/v2/users?per_page=1')
      ]);

      if (!siteInfoRes?.ok && !postsRes?.ok) {
        throw new Error('Não foi possível conectar ao WordPress. Verifique a URL e as credenciais.');
      }

      const siteInfo = siteInfoRes?.ok ? await siteInfoRes.json() : { name: 'Blog' };
      const posts = postsRes?.ok ? await postsRes.json() : [];
      const categories = categoriesRes?.ok ? await categoriesRes.json() : [];
     
     // Get total posts from headers if available
      const totalPosts = postsRes?.headers.get('X-WP-Total') || posts.length;
      const totalComments = commentsRes?.headers.get('X-WP-Total') || 0;
      const totalCategories = categoriesRes?.headers.get('X-WP-Total') || 0;
      const totalTags = tagsRes?.headers.get('X-WP-Total') || 0;
      const totalUsers = usersRes?.headers.get('X-WP-Total') || 0;

     return {
       postCount: parseInt(totalPosts.toString()),
       siteName: siteInfo.name || 'Meu Blog',
       latestPosts: posts,
       totalComments: parseInt(totalComments.toString()),
       categoriesCount: parseInt(totalCategories.toString()),
       tagsCount: parseInt(totalTags.toString()),
       usersCount: parseInt(totalUsers.toString()),
       topCategories: Array.isArray(categories) ? categories.map((cat: any) => ({
         name: cat.name,
         count: cat.count
       })) : []
     };
   } catch (error) {
     console.error('WordPress Fetch Error:', error);
     throw error;
   }
 };