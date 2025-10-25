import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';

export interface Post {
  id: string;
  user_id: string;
  profile_id: string;
  content: string;
  post_type: 'text' | 'photo' | 'video';
  image_url?: string;
  video_url?: string;
  location?: string;
  likes_count: number;
  comments_count: number;
  shares_count: number;
  created_at: string;
  updated_at: string;
  // Datos del perfil para mostrar en el feed
  profile?: {
    id: string;
    name: string;
    avatar_url?: string;
    is_verified?: boolean;
  };
}

export interface Comment {
  id: string;
  user_id: string;
  profile_id: string;
  parent_comment_id?: string;
  content: string;
  likes_count: number;
  created_at: string;
  user_liked: boolean;
  profile_name: string;
  profile_avatar?: string;
}

export interface CreatePostData {
  content: string;
  post_type: 'text' | 'photo' | 'video';
  image_url?: string;
  video_url?: string;
  location?: string;
  is_premium?: boolean;
}

export interface CreateCommentData {
  post_id: string;
  content: string;
  parent_comment_id?: string;
}

class PostsService {
  constructor() {
    logger.info('PostsService initialized');
  }

  /**
   * Obtener ID del usuario actual
   */
  private getCurrentUserId(): string {
    // En un entorno real, esto vendría de la sesión de autenticación
    // Por ahora, usar un ID demo o lanzar error si no hay usuario
    const demoUser = localStorage.getItem('demo_user');
    if (demoUser) {
      try {
        const user = JSON.parse(demoUser);
        return user.id || 'demo-user-id';
      } catch {
        return 'demo-user-id';
      }
    }
    throw new Error('No authenticated user found');
  }

  /**
   * Generar datos mock para posts
   */
  generateMockPosts(count: number = 20): Post[] {
    const mockPosts: Post[] = [];
    const postTypes: ('text' | 'photo' | 'video')[] = ['text', 'photo', 'video'];
    const locations = ['CDMX, México', 'Guadalajara, México', 'Monterrey, México', 'Puebla, México'];
    const contents = [
      '¡Explorando nuevas conexiones en la comunidad! 🌟',
      'Una noche increíble con parejas increíbles 💫',
      'Respeto y comunicación son la clave 🔑',
      'Nuevas aventuras esperando ser descubiertas ✨',
      'La discreción es fundamental en nuestro estilo de vida 🤐',
      'Conectando con personas de mente abierta 🧠',
      'Celebrando la diversidad en nuestras relaciones 💕',
      'La confianza es la base de todo 🏗️'
    ];

    for (let i = 0; i < count; i++) {
      const postType = postTypes[Math.floor(Math.random() * postTypes.length)];
      const content = contents[Math.floor(Math.random() * contents.length)];
      
      mockPosts.push({
        id: `post-${i + 1}`,
        user_id: `user-${Math.floor(Math.random() * 10) + 1}`,
        profile_id: `profile-${Math.floor(Math.random() * 10) + 1}`,
        content,
        post_type: postType,
        image_url: postType === 'photo' ? `/mock-images/post-${i + 1}.jpg` : undefined,
        video_url: postType === 'video' ? `/mock-videos/post-${i + 1}.mp4` : undefined,
        location: locations[Math.floor(Math.random() * locations.length)],
        likes_count: Math.floor(Math.random() * 50) + 1,
        comments_count: Math.floor(Math.random() * 20) + 1,
        shares_count: Math.floor(Math.random() * 10) + 1,
        created_at: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date().toISOString(),
        profile: {
          id: `profile-${Math.floor(Math.random() * 10) + 1}`,
          name: `Usuario ${i + 1}`,
          avatar_url: `/mock-avatars/user-${i + 1}.jpg`,
          is_verified: Math.random() > 0.7
        }
      });
    }

    return mockPosts.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  /**
   * Generar comentarios mock
   */
  generateMockComments(postId: string, count: number = 5): Comment[] {
    const mockComments: Comment[] = [];
    const commentContents = [
      '¡Excelente post! 👏',
      'Totalmente de acuerdo contigo',
      'Gracias por compartir tu experiencia',
      'Muy interesante punto de vista',
      'Me encanta esta comunidad',
      'Respeto y comunicación siempre',
      '¡Qué gran noche!',
      'La discreción es clave'
    ];

    for (let i = 0; i < count; i++) {
      mockComments.push({
        id: `comment-${postId}-${i + 1}`,
        user_id: `user-${Math.floor(Math.random() * 10) + 1}`,
        profile_id: `profile-${Math.floor(Math.random() * 10) + 1}`,
        content: commentContents[Math.floor(Math.random() * commentContents.length)],
        likes_count: Math.floor(Math.random() * 10) + 1,
        created_at: new Date(Date.now() - Math.random() * 3 * 24 * 60 * 60 * 1000).toISOString(),
        user_liked: Math.random() > 0.5,
        profile_name: `Usuario ${i + 1}`,
        profile_avatar: `/mock-avatars/user-${i + 1}.jpg`
      });
    }

    return mockComments;
  }

  /**
   * Obtener feed de posts del usuario usando datos reales de Supabase
   */
  async getFeed(page = 0, limit = 20): Promise<Post[]> {
    try {
      logger.info('Fetching feed posts from Supabase', { page, limit });
      
      const { data, error } = await supabase
        .from('stories')
        .select(`
          id,
          user_id,
          description as content,
          content_type as post_type,
          media_urls,
          location,
          views_count,
          created_at,
          updated_at
        `)
        .eq('is_public', true)
        .order('created_at', { ascending: false })
        .range(page * limit, (page + 1) * limit - 1);

      if (error) {
        logger.error('Error fetching feed from Supabase:', error);
        return [];
      }

      // Mapear datos de Supabase al formato esperado
      const posts: Post[] = (data || []).map((story: Tables<'posts'>) => ({
        id: story.id,
        user_id: story.user_id,
        profile_id: story.user_id,
        content: story.content || '',
        post_type: story.post_type as 'text' | 'photo' | 'video',
        image_url: story.media_urls?.[0] || undefined,
        video_url: story.post_type === 'video' ? story.media_urls?.[0] : undefined,
        location: story.location || undefined,
        likes_count: 0, // Se calculará desde story_likes
        comments_count: 0, // Se calculará desde story_comments
        shares_count: 0, // Se calculará desde story_shares
        created_at: story.created_at,
        updated_at: story.updated_at,
        profile: {
          id: story.user_id,
          name: 'Usuario',
          avatar_url: undefined,
          is_verified: false
        }
      }));

      // Optimización: Obtener conteos en una sola consulta agregada
      if (posts.length > 0) {
        const postIds = posts.map(post => post.id);
        
        const [likesResult, commentsResult, sharesResult] = await Promise.allSettled([
          supabase
            .from('story_likes')
            .select('story_id', { count: 'exact' })
            .in('story_id', postIds),
          supabase
            .from('story_comments')
            .select('story_id', { count: 'exact' })
            .in('story_id', postIds),
          supabase
            .from('story_shares')
            .select('story_id', { count: 'exact' })
            .in('story_id', postIds)
        ]);

        // Crear mapas de conteos por post_id
        const likesMap = new Map<string, number>();
        const commentsMap = new Map<string, number>();
        const sharesMap = new Map<string, number>();

        if (likesResult.status === 'fulfilled' && likesResult.value.data) {
          likesResult.value.data.forEach((item: any) => {
            likesMap.set(item.story_id, item.count || 0);
          });
        }

        if (commentsResult.status === 'fulfilled' && commentsResult.value.data) {
          commentsResult.value.data.forEach((item: any) => {
            commentsMap.set(item.story_id, item.count || 0);
          });
        }

        if (sharesResult.status === 'fulfilled' && sharesResult.value.data) {
          sharesResult.value.data.forEach((item: any) => {
            sharesMap.set(item.story_id, item.count || 0);
          });
        }

        // Asignar conteos a cada post
        posts.forEach(post => {
          post.likes_count = likesMap.get(post.id) || 0;
          post.comments_count = commentsMap.get(post.id) || 0;
          post.shares_count = sharesMap.get(post.id) || 0;
        });
      }

      logger.info('✅ Feed posts loaded successfully from Supabase', { count: posts.length });
      return posts;
    } catch (error) {
      logger.error('Error in getFeed:', { error: String(error) });
      return [];
    }
  }

  /**
   * Crear nuevo post usando datos reales de Supabase
   */
  async createPost(postData: CreatePostData): Promise<Post | null> {
    try {
      logger.info('Creating new post in Supabase', { postData });
      
      const userId = this.getCurrentUserId();
      
      // Crear el story en Supabase
      const { data: storyData, error: storyError } = await supabase
        .from('stories')
        .insert({
          user_id: userId,
          description: postData.content,
          content_type: postData.post_type,
          content_url: postData.image_url || postData.video_url || '',
          location: postData.location || null,
          is_public: true,
          views_count: 0
        })
        .select(`
          id,
          user_id,
          description as content,
          content_type as post_type,
          content_url,
          location,
          views_count,
          created_at,
          updated_at
        `)
        .single();

      if (storyError) {
        logger.error('Error creating story in Supabase:', storyError);
        return null;
      }

      // Mapear datos de Supabase al formato esperado
      const newPost: Post = {
        id: storyData.id,
        user_id: storyData.user_id,
        profile_id: storyData.user_id,
        content: storyData.content || '',
        post_type: storyData.post_type as 'text' | 'photo' | 'video',
        image_url: storyData.content_url || undefined,
        video_url: storyData.post_type === 'video' ? storyData.content_url : undefined,
        location: storyData.location || undefined,
        likes_count: 0,
        comments_count: 0,
        shares_count: 0,
        created_at: storyData.created_at,
        updated_at: storyData.updated_at,
        profile: {
          id: storyData.user_id,
          name: 'Usuario',
          avatar_url: undefined,
          is_verified: false
        }
      };

      logger.info('✅ Post created successfully in Supabase', { postId: newPost.id });
      return newPost;
    } catch (error) {
      logger.error('Error in createPost:', { error: String(error) });
      return null;
    }
  }

  /**
   * Dar like a un post usando datos reales de Supabase
   */
  async toggleLike(postId: string): Promise<boolean> {
    try {
      logger.info('Toggling like for post in Supabase:', { postId });
      
      const userId = this.getCurrentUserId();
      
      // Verificar si ya existe un like
      const { data: existingLike, error: checkError } = await supabase
        .from('story_likes')
        .select('id')
        .eq('story_id', postId)
        .eq('user_id', userId)
        .single();

      if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows found
        logger.error('Error checking existing like:', checkError);
        return false;
      }

      if (existingLike) {
        // Quitar like
        const { error: deleteError } = await supabase
          .from('story_likes')
          .delete()
          .eq('story_id', postId)
          .eq('user_id', userId);

        if (deleteError) {
          logger.error('Error removing like:', deleteError);
          return false;
        }

        logger.info('✅ Like removed successfully', { postId });
        return true;
      } else {
        // Agregar like
        const { error: insertError } = await supabase
          .from('story_likes')
          .insert({
            story_id: postId,
            user_id: userId
          });

        if (insertError) {
          logger.error('Error adding like:', insertError);
          return false;
        }

        logger.info('✅ Like added successfully', { postId });
        return true;
      }
    } catch (error) {
      logger.error('Error in toggleLike:', { error: String(error) });
      return false;
    }
  }

  /**
   * Quitar like de un post
   */
  async unlikePost(postId: string): Promise<void> {
    try {
      logger.info('💔 Removing like from post (mock)', { postId });

      // Simular delay de red
      await new Promise(resolve => setTimeout(resolve, 200));

      logger.info('✅ Like removed successfully (mock)', { postId });
    } catch (error) {
      logger.error('❌ Error in unlikePost', { error: String(error) });
      throw error;
    }
  }

  /**
   * Obtener comentarios de un post usando datos reales de Supabase
   */
  async getComments(postId: string, page = 0, limit = 10): Promise<Comment[]> {
    try {
      logger.info('💬 Getting comments from Supabase', { postId, page, limit });

      const { data, error } = await supabase
        .from('story_comments')
        .select(`
          id,
          user_id,
          story_id,
          comment,
          created_at
        `)
        .eq('story_id', postId)
        .order('created_at', { ascending: false })
        .range(page * limit, (page + 1) * limit - 1);

      if (error) {
        logger.error('❌ Error getting comments from Supabase:', error);
        return [];
      }

      // Obtener conteos de likes para cada comentario
      const comments: Comment[] = [];
      for (const comment of data || []) {
        const { count: likesCount } = await supabase
          .from('comment_likes')
          .select('id', { count: 'exact' })
          .eq('comment_id', comment.id);

        // Verificar si el usuario actual dio like
        const userId = this.getCurrentUserId();
        const { data: userLike } = await supabase
          .from('comment_likes')
          .select('id')
          .eq('comment_id', comment.id)
          .eq('user_id', userId)
          .single();

        comments.push({
          id: comment.id,
          user_id: comment.user_id,
          profile_id: comment.user_id,
          parent_comment_id: undefined,
          content: comment.comment || '',
          likes_count: likesCount || 0,
          created_at: comment.created_at || '',
          user_liked: !!userLike,
          profile_name: 'Usuario',
          profile_avatar: undefined
        });
      }

      logger.info('✅ Comments loaded successfully from Supabase', { count: comments.length });
      return comments;
    } catch (error) {
      logger.error('❌ Error in getComments', { error: String(error) });
      return [];
    }
  }

  /**
   * Crear comentario en un post usando datos reales de Supabase
   */
  async createComment(commentData: CreateCommentData): Promise<Comment> {
    try {
      logger.info('💬 Creating comment in Supabase', { commentData });

      const userId = this.getCurrentUserId();

      const { data: commentDataResult, error } = await supabase
        .from('story_comments')
        .insert({
          user_id: userId,
          story_id: commentData.post_id,
          comment: commentData.content
        })
        .select(`
          id,
          user_id,
          story_id,
          comment,
          created_at
        `)
        .single();

      if (error) {
        logger.error('❌ Error creating comment in Supabase:', error);
        throw new Error(error.message);
      }

      const comment: Comment = {
        id: commentDataResult.id,
        user_id: commentDataResult.user_id,
        profile_id: commentDataResult.user_id,
        parent_comment_id: undefined,
        content: commentDataResult.comment || '',
        likes_count: 0,
        created_at: commentDataResult.created_at || '',
        user_liked: false,
        profile_name: 'Usuario',
        profile_avatar: undefined
      };

      logger.info('✅ Comment created successfully in Supabase', { commentId: comment.id });
      return comment;
    } catch (error) {
      logger.error('❌ Error in createComment', { error: String(error) });
      throw error;
    }
  }

  /**
   * Dar like a un comentario
   */
  async likeComment(commentId: string): Promise<void> {
    try {
      logger.info('❤️ Liking comment (mock)', { commentId });

      // Simular delay de red
      await new Promise(resolve => setTimeout(resolve, 200));

      logger.info('✅ Comment liked successfully (mock)', { commentId });
    } catch (error) {
      logger.error('❌ Error in likeComment', { error: String(error) });
      throw error;
    }
  }

  /**
   * Compartir un post
   */
  async sharePost(postId: string, shareType: 'share' | 'repost' = 'share'): Promise<void> {
    try {
      logger.info('🔄 Sharing post (mock)', { postId, shareType });

      // Simular delay de red
      await new Promise(resolve => setTimeout(resolve, 300));

      logger.info('✅ Post shared successfully (mock)', { postId, shareType });
    } catch (error) {
      logger.error('❌ Error in sharePost', { error: String(error) });
      throw error;
    }
  }

  /**
   * Eliminar post propio
   */
  async deletePost(postId: string): Promise<void> {
    try {
      logger.info('🗑️ Deleting post (mock)', { postId });

      // Simular delay de red
      await new Promise(resolve => setTimeout(resolve, 300));

      logger.info('✅ Post deleted successfully (mock)', { postId });
    } catch (error) {
      logger.error('❌ Error in deletePost', { error: String(error) });
      throw error;
    }
  }
}

export const postsService = new PostsService();

/**
 * Servicio avanzado de posts con funcionalidades adicionales
 */
class AdvancedPostsService extends PostsService {
  
  /**
   * Obtener posts con paginación inteligente
   */
  async getFeedWithPagination(
    page = 0, 
    limit = 20, 
    filters?: {
      postType?: 'text' | 'photo' | 'video';
      dateRange?: { start: string; end: string };
      location?: string;
      hashtags?: string[];
    }
  ): Promise<{
    posts: Post[];
    hasMore: boolean;
    nextPage: number;
    totalCount: number;
  }> {
    try {
      logger.info('📱 Getting feed with intelligent pagination (mock)', { page, limit, filters });
      
      // Simular delay de red
      await new Promise(resolve => setTimeout(resolve, 400));

      let allPosts = this.generateMockPosts(200);
      
      // Aplicar filtros si existen
      if (filters?.postType) {
        allPosts = allPosts.filter(post => post.post_type === filters.postType);
      }
      
      if (filters?.location) {
        allPosts = allPosts.filter(post => 
          post.location?.toLowerCase().includes(filters.location!.toLowerCase())
        );
      }

      const startIndex = page * limit;
      const endIndex = startIndex + limit;
      const posts = allPosts.slice(startIndex, endIndex);
      const hasMore = endIndex < allPosts.length;
      const nextPage = hasMore ? page + 1 : page;

      logger.info('✅ Paginated feed loaded successfully (mock)', { 
        postsCount: posts.length, 
        hasMore, 
        nextPage,
        totalCount: allPosts.length
      });

      return {
        posts,
        hasMore,
        nextPage,
        totalCount: allPosts.length
      };
    } catch (error) {
      logger.error('Error in getFeedWithPagination:', { error: String(error) });
      return { posts: [], hasMore: false, nextPage: 0, totalCount: 0 };
    }
  }

  /**
   * Buscar posts por contenido
   */
  async searchPosts(
    searchQuery: string,
    page = 0,
    limit = 20
  ): Promise<Post[]> {
    try {
      logger.info('🔍 Searching posts (mock)', { searchQuery, page, limit });

      // Simular delay de red
      await new Promise(resolve => setTimeout(resolve, 500));

      const allPosts = this.generateMockPosts(100);
      const filteredPosts = allPosts.filter(post => 
        post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.location?.toLowerCase().includes(searchQuery.toLowerCase())
      );

      const startIndex = page * limit;
      const endIndex = startIndex + limit;
      const posts = filteredPosts.slice(startIndex, endIndex);

      logger.info('✅ Search completed (mock)', { resultsCount: posts.length });
      return posts;
    } catch (error) {
      logger.error('Error in searchPosts:', { error: String(error) });
      return [];
    }
  }

  /**
   * Obtener posts populares
   */
  async getPopularPosts(
    timeframe: 'day' | 'week' | 'month' = 'week',
    limit = 20
  ): Promise<Post[]> {
    try {
      logger.info('🔥 Getting popular posts (mock)', { timeframe, limit });

      // Simular delay de red
      await new Promise(resolve => setTimeout(resolve, 400));

      const allPosts = this.generateMockPosts(100);
      const popularPosts = allPosts
        .sort((a, b) => (b.likes_count + b.comments_count + b.shares_count) - (a.likes_count + a.comments_count + a.shares_count))
        .slice(0, limit);

      logger.info('✅ Popular posts loaded (mock)', { count: popularPosts.length });
      return popularPosts;
    } catch (error) {
      logger.error('Error in getPopularPosts:', { error: String(error) });
      return [];
    }
  }

  /**
   * Obtener posts de usuarios seguidos
   */
  async getFollowingPosts(
    page = 0,
    limit = 20
  ): Promise<Post[]> {
    try {
      logger.info('👥 Getting following posts (mock)', { page, limit });

      // Simular delay de red
      await new Promise(resolve => setTimeout(resolve, 400));

      const allPosts = this.generateMockPosts(50);
      const startIndex = page * limit;
      const endIndex = startIndex + limit;
      const posts = allPosts.slice(startIndex, endIndex);

      logger.info('✅ Following posts loaded (mock)', { count: posts.length });
      return posts;
    } catch (error) {
      logger.error('Error in getFollowingPosts:', { error: String(error) });
      return [];
    }
  }

  /**
   * Obtener estadísticas de posts del usuario
   */
  async getUserPostStats(userId: string): Promise<{
    totalPosts: number;
    totalLikes: number;
    totalComments: number;
    totalShares: number;
    averageEngagement: number;
    topPost: Post | null;
  }> {
    try {
      logger.info('📊 Getting user post stats (mock)', { userId });

      // Simular delay de red
      await new Promise(resolve => setTimeout(resolve, 300));

      const userPosts = this.generateMockPosts(15);
      
      const totalLikes = userPosts.reduce((sum, post) => sum + post.likes_count, 0);
      const totalComments = userPosts.reduce((sum, post) => sum + post.comments_count, 0);
      const totalShares = userPosts.reduce((sum, post) => sum + post.shares_count, 0);
      
      const totalEngagement = totalLikes + totalComments + totalShares;
      const averageEngagement = userPosts.length > 0 ? totalEngagement / userPosts.length : 0;

      const topPost = userPosts.reduce((top, current) => {
        const currentEngagement = current.likes_count + current.comments_count + current.shares_count;
        const topEngagement = top.likes_count + top.comments_count + top.shares_count;
        return currentEngagement > topEngagement ? current : top;
      });

      logger.info('✅ User stats calculated (mock)', { 
        totalPosts: userPosts.length,
        totalEngagement,
        averageEngagement: Math.round(averageEngagement * 100) / 100
      });

      return {
        totalPosts: userPosts.length,
        totalLikes,
        totalComments,
        totalShares,
        averageEngagement: Math.round(averageEngagement * 100) / 100,
        topPost
      };
    } catch (error) {
      logger.error('Error in getUserPostStats:', { error: String(error) });
      throw error;
    }
  }

  /**
   * Reportar post inapropiado
   */
  async reportPost(
    postId: string,
    reason: 'spam' | 'inappropriate' | 'harassment' | 'fake' | 'other',
    _description?: string
  ): Promise<void> {
    try {
      logger.info('🚨 Reporting post (mock)', { postId, reason });

      // Simular delay de red
      await new Promise(resolve => setTimeout(resolve, 300));

      logger.info('✅ Post reported successfully (mock)', { postId });
    } catch (error) {
      logger.error('Error in reportPost:', { error: String(error) });
      throw error;
    }
  }

  /**
   * Obtener hashtags populares
   */
  async getPopularHashtags(limit = 20): Promise<Array<{
    hashtag: string;
    count: number;
    posts: number;
  }>> {
    try {
      logger.info('🏷️ Getting popular hashtags (mock)', { limit });

      // Simular delay de red
      await new Promise(resolve => setTimeout(resolve, 200));

      const mockHashtags = [
        { hashtag: '#swinger', count: 150, posts: 45 },
        { hashtag: '#lifestyle', count: 120, posts: 38 },
        { hashtag: '#parejas', count: 95, posts: 32 },
        { hashtag: '#liberal', count: 80, posts: 28 },
        { hashtag: '#aventura', count: 65, posts: 22 },
        { hashtag: '#diversion', count: 55, posts: 18 },
        { hashtag: '#respeto', count: 45, posts: 15 },
        { hashtag: '#discrecion', count: 40, posts: 12 },
        { hashtag: '#comunidad', count: 35, posts: 10 },
        { hashtag: '#confianza', count: 30, posts: 8 }
      ];

      logger.info('✅ Popular hashtags loaded (mock)', { count: mockHashtags.length });
      return mockHashtags.slice(0, limit);
    } catch (error) {
      logger.error('Error in getPopularHashtags:', { error: String(error) });
      return [];
    }
  }
}

export const advancedPostsService = new AdvancedPostsService();