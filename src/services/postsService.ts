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
   * Obtener feed de posts del usuario
   */
  async getFeed(page = 0, limit = 20): Promise<Post[]> {
    try {
      logger.info('Fetching feed posts (mock)', { page, limit });
      
      // Simular delay de red
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const allPosts = this.generateMockPosts(100);
      const startIndex = page * limit;
      const endIndex = startIndex + limit;
      const posts = allPosts.slice(startIndex, endIndex);

      logger.info('✅ Feed posts loaded successfully (mock)', { count: posts.length });
      return posts;
    } catch (error) {
      logger.error('Error in getFeed:', { error: String(error) });
      return [];
    }
  }

  /**
   * Crear nuevo post
   */
  async createPost(postData: CreatePostData): Promise<Post | null> {
    try {
      logger.info('Creating new post (mock)', { postData });
      
      // Simular delay de red
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const newPost: Post = {
        id: `post-${Date.now()}`,
        user_id: this.getCurrentUserId(),
        profile_id: `profile-${this.getCurrentUserId()}`,
        content: postData.content,
        post_type: postData.post_type,
        image_url: postData.image_url,
        video_url: postData.video_url,
        location: postData.location,
        likes_count: 0,
        comments_count: 0,
        shares_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        profile: {
          id: `profile-${this.getCurrentUserId()}`,
          name: 'Usuario Actual',
          avatar_url: '/mock-avatars/current-user.jpg',
          is_verified: false
        }
      };

      logger.info('✅ Post created successfully (mock)', { postId: newPost.id });
      return newPost;
    } catch (error) {
      logger.error('Error in createPost:', { error: String(error) });
      return null;
    }
  }

  /**
   * Dar like a un post
   */
  async toggleLike(postId: string): Promise<boolean> {
    try {
      logger.info('Toggling like for post (mock):', { postId });
      
      // Simular delay de red
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Simular éxito aleatorio
      const success = Math.random() > 0.1; // 90% éxito
      
      if (success) {
        logger.info('✅ Like toggled successfully (mock)', { postId });
        return true;
      } else {
        logger.warn('❌ Like toggle failed (mock)', { postId });
        return false;
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
   * Obtener comentarios de un post
   */
  async getComments(postId: string, page = 0, limit = 10): Promise<Comment[]> {
    try {
      logger.info('💬 Getting comments (mock)', { postId, page, limit });

      // Simular delay de red
      await new Promise(resolve => setTimeout(resolve, 300));

      const comments = this.generateMockComments(postId, limit);

      logger.info('✅ Comments loaded successfully (mock)', { count: comments.length });
      return comments;
    } catch (error) {
      logger.error('❌ Error in getComments', { error: String(error) });
      return [];
    }
  }

  /**
   * Crear comentario en un post
   */
  async createComment(commentData: CreateCommentData): Promise<Comment> {
    try {
      logger.info('💬 Creating comment (mock)', { commentData });

      // Simular delay de red
      await new Promise(resolve => setTimeout(resolve, 300));

      const comment: Comment = {
        id: `comment-${Date.now()}`,
        user_id: this.getCurrentUserId(),
        profile_id: `profile-${this.getCurrentUserId()}`,
        parent_comment_id: commentData.parent_comment_id,
        content: commentData.content,
        likes_count: 0,
        created_at: new Date().toISOString(),
        user_liked: false,
        profile_name: 'Usuario Actual',
        profile_avatar: '/mock-avatars/current-user.jpg'
      };

      logger.info('✅ Comment created successfully (mock)', { commentId: comment.id });
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
    description?: string
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