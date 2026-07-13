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
    if (!url) {
      throw new Error('URL do WordPress não configurada');
    }

    const baseUrl = url.replace(/\/$/, '');
    const useAuth = Boolean(user && appPass);
    const auth = useAuth ? btoa(`${user}:${appPass}`) : '';

    try {
      const fetchWithAuth = (endpoint: string) =>
        fetch(`${baseUrl}/wp-json/${endpoint}`, {
          headers: useAuth ? { 'Authorization': `Basic ${auth}` } : {},
          signal: AbortSignal.timeout(10000)
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