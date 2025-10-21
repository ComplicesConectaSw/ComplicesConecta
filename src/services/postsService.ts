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
   * Obtener feed de posts del usuario
   */
  async getFeed(page = 0, limit = 20): Promise<Post[]> {
    try {
      logger.info('Fetching feed posts', { page, limit });
      
      // Obtener el usuario actual
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        logger.warn('No authenticated user found');
        return [];
      }

      // Usar consulta RPC para obtener posts con perfiles
      const { data, error } = await (supabase as any).rpc('get_user_feed', {
        user_id_param: user.id,
        limit_param: limit,
        offset_param: page * limit
      });

      if (error) {
        logger.error('Error fetching feed:', error);
        throw error;
      }

      // Los datos ya vienen en el formato correcto desde la función RPC
      const posts: Post[] = (data as any) || [];

      return posts;
    } catch (error) {
      logger.error('Error in getFeed:', error as any);
      return [];
    }
  }

  /**
   * Crear nuevo post
   */
  async createPost(postData: Omit<Post, 'id' | 'created_at' | 'updated_at' | 'likes_count' | 'comments_count' | 'shares_count' | 'profile'>): Promise<Post | null> {
    try {
      logger.info('Creating new post', { postData });
      
      // Usar consulta SQL directa para insertar post
      const { data, error } = await supabase
        .rpc('create_post', {
          p_user_id: postData.user_id,
          p_profile_id: postData.profile_id,
          p_content: postData.content,
          p_post_type: postData.post_type,
          p_image_url: postData.image_url,
          p_video_url: postData.video_url,
          p_location: postData.location
        });

      if (error) {
        logger.error('Error creating post:', error);
        throw error;
      }

      return data as Post | null;
    } catch (error) {
      logger.error('Error in createPost:', error as any);
      return null;
    }
  }

  /**
   * Dar like a un post
   */
  async toggleLike(postId: string): Promise<boolean> {
    try {
      logger.info('Toggling like for post:', { postId });
      
      const { data, error } = await (supabase as any).rpc('toggle_post_like', {
        p_post_id: postId,
        p_user_id: this.getCurrentUserId()
      });

      if (error) {
        logger.error('Error toggling like:', { error: error.message });
        throw new Error(`Error al dar like: ${error.message}`);
      }

      logger.info('Like toggled successfully:', { postId, liked: data });
      return data as boolean;  
    } catch (error) {
      logger.error('Error in toggleLike:', { error: (error as any).message });
      throw error;
    }
  }

  /**
   * Quitar like de un post
   */
  async unlikePost(postId: string): Promise<void> {
    try {
      logger.info('💔 Quitando like de post', { postId });

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      const { error } = await supabase
        .rpc('remove_post_like', {
          p_post_id: postId,
          p_user_id: user.id
        });

      if (error) {
        logger.error('❌ Error al quitar like', { error });
        throw error;
      }

      logger.info('✅ Like removido exitosamente', { postId });
    } catch (error) {
      logger.error('❌ Error en unlikePost', error as any);
      throw error;
    }
  }

  /**
   * Obtener comentarios de un post
   */
  async getComments(postId: string, page = 0, limit = 10): Promise<Comment[]> {
    try {
      logger.info('💬 Obteniendo comentarios', { postId, page, limit });

      const { data, error } = await (supabase as any).rpc('get_post_comments', {
        post_uuid: postId,
        page_limit: limit,
        page_offset: page * limit
      });

      if (error) {
        logger.error('❌ Error al obtener comentarios', { error });
        throw error;
      }

      logger.info('✅ Comentarios obtenidos exitosamente', { count: data?.length || 0 });
      return data || [];
    } catch (error) {
      logger.error('❌ Error en getComments', { error });
      throw error;
    }
  }

  /**
   * Crear comentario en un post
   */
  async createComment(commentData: CreateCommentData): Promise<Comment> {
    try {
      logger.info('💬 Creando comentario', { commentData });

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      const { data, error } = await (supabase as any)
        .from('post_comments')
        .insert({
          post_id: commentData.post_id,
          user_id: user.id,
          profile_id: profile?.id,
          content: commentData.content,
          parent_comment_id: commentData.parent_comment_id
        })
        .select(`
          id,
          user_id,
          profile_id,
          parent_comment_id,
          content,
          likes_count,
          created_at,
          profiles!inner(
            first_name,
            avatar_url
          )
        `)
        .single();

      if (error) {
        logger.error('❌ Error al crear comentario', { error });
        throw error;
      }

      const comment: Comment = {
        id: data.id,
        user_id: data.user_id,
        profile_id: data.profile_id,
        parent_comment_id: data.parent_comment_id,
        content: data.content,
        likes_count: data.likes_count,
        created_at: data.created_at,
        user_liked: false,
        profile_name: data.profiles.first_name || 'Usuario',
        profile_avatar: data.profiles.avatar_url
      };

      logger.info('✅ Comentario creado exitosamente', { commentId: comment.id });
      return comment;
    } catch (error) {
      logger.error('❌ Error en createComment', { error });
      throw error;
    }
  }

  /**
   * Dar like a un comentario
   */
  async likeComment(commentId: string): Promise<void> {
    try {
      logger.info('❤️ Dando like a comentario', { commentId });

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      const { error } = await supabase
        .from('comment_likes')
        .insert({
          comment_id: commentId,
          user_id: user.id,
          profile_id: profile?.id
        });

      if (error) {
        logger.error('❌ Error al dar like a comentario', { error });
        throw error;
      }

      logger.info('✅ Like a comentario agregado exitosamente', { commentId });
    } catch (error) {
      logger.error('❌ Error en likeComment', { error });
      throw error;
    }
  }

  /**
   * Compartir un post
   */
  async sharePost(postId: string, shareType: 'share' | 'repost' = 'share'): Promise<void> {
    try {
      logger.info('🔄 Compartiendo post', { postId, shareType });

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      const { error } = await supabase
        .from('post_shares')
        .insert({
          post_id: postId,
          user_id: user.id,
          profile_id: profile?.id,
          share_type: shareType
        });

      if (error) {
        logger.error('❌ Error al compartir post', { error });
        throw error;
      }

      logger.info('✅ Post compartido exitosamente', { postId, shareType });
    } catch (error) {
      logger.error('❌ Error en sharePost', { error });
      throw error;
    }
  }

  /**
   * Eliminar post propio
   */
  async deletePost(postId: string): Promise<void> {
    try {
      logger.info('🗑️ Eliminando post', { postId });

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      const { error } = await supabase
        .from('posts')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', postId)
        .eq('user_id', user.id);

      if (error) {
        logger.error('❌ Error al eliminar post', { error });
        throw error;
      }

      logger.info('✅ Post eliminado exitosamente', { postId });
    } catch (error) {
      logger.error('❌ Error en deletePost', { error });
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
      logger.info('📱 Obteniendo feed con paginación inteligente', { page, limit, filters });
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        logger.warn('No authenticated user found');
        return { posts: [], hasMore: false, nextPage: 0, totalCount: 0 };
      }

      // Construir consulta con filtros
      let query = supabase
        .from('posts')
        .select(`
          *,
          profiles!inner(
            id,
            first_name,
            avatar_url,
            is_verified
          )
        `)
        .eq('is_active', true)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
        .range(page * limit, (page + 1) * limit - 1);

      // Aplicar filtros si existen
      if (filters?.postType) {
        query = query.eq('post_type', filters.postType);
      }
      
      if (filters?.dateRange) {
        query = query
          .gte('created_at', filters.dateRange.start)
          .lte('created_at', filters.dateRange.end);
      }
      
      if (filters?.location) {
        query = query.ilike('location', `%${filters.location}%`);
      }

      const { data: posts, error, count } = await query;

      if (error) {
        logger.error('Error fetching paginated feed:', error);
        throw error;
      }

      const hasMore = posts && posts.length === limit;
      const nextPage = hasMore ? page + 1 : page;
      const totalCount = count || 0;

      logger.info('✅ Feed paginado obtenido exitosamente', { 
        postsCount: posts?.length || 0, 
        hasMore, 
        nextPage 
      });

      return {
        posts: posts || [],
        hasMore,
        nextPage,
        totalCount
      };
    } catch (error) {
      logger.error('Error in getFeedWithPagination:', error);
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
      logger.info('🔍 Buscando posts', { searchQuery, page, limit });

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        logger.warn('No authenticated user found');
        return [];
      }

      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          profiles!inner(
            id,
            first_name,
            avatar_url,
            is_verified
          )
        `)
        .eq('is_active', true)
        .is('deleted_at', null)
        .textSearch('content', searchQuery)
        .order('created_at', { ascending: false })
        .range(page * limit, (page + 1) * limit - 1);

      if (error) {
        logger.error('Error searching posts:', error);
        throw error;
      }

      logger.info('✅ Búsqueda completada', { resultsCount: data?.length || 0 });
      return data || [];
    } catch (error) {
      logger.error('Error in searchPosts:', error);
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
      logger.info('🔥 Obteniendo posts populares', { timeframe, limit });

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        logger.warn('No authenticated user found');
        return [];
      }

      // Calcular fecha de inicio según timeframe
      const now = new Date();
      const startDate = new Date();
      
      switch (timeframe) {
        case 'day':
          startDate.setDate(now.getDate() - 1);
          break;
        case 'week':
          startDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(now.getMonth() - 1);
          break;
      }

      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          profiles!inner(
            id,
            first_name,
            avatar_url,
            is_verified
          )
        `)
        .eq('is_active', true)
        .is('deleted_at', null)
        .gte('created_at', startDate.toISOString())
        .order('likes_count', { ascending: false })
        .limit(limit);

      if (error) {
        logger.error('Error fetching popular posts:', error);
        throw error;
      }

      logger.info('✅ Posts populares obtenidos', { count: data?.length || 0 });
      return data || [];
    } catch (error) {
      logger.error('Error in getPopularPosts:', error);
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
      logger.info('👥 Obteniendo posts de usuarios seguidos', { page, limit });

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        logger.warn('No authenticated user found');
        return [];
      }

      // Obtener IDs de usuarios seguidos
      const { data: following, error: followingError } = await supabase
        .from('follows')
        .select('following_id')
        .eq('follower_id', user.id)
        .eq('is_active', true);

      if (followingError) {
        logger.error('Error fetching following users:', followingError);
        return [];
      }

      if (!following || following.length === 0) {
        logger.info('No following users found');
        return [];
      }

      const followingIds = following.map(f => f.following_id);

      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          profiles!inner(
            id,
            first_name,
            avatar_url,
            is_verified
          )
        `)
        .in('user_id', followingIds)
        .eq('is_active', true)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
        .range(page * limit, (page + 1) * limit - 1);

      if (error) {
        logger.error('Error fetching following posts:', error);
        throw error;
      }

      logger.info('✅ Posts de seguidos obtenidos', { count: data?.length || 0 });
      return data || [];
    } catch (error) {
      logger.error('Error in getFollowingPosts:', error);
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
      logger.info('📊 Obteniendo estadísticas de posts', { userId });

      const { data: posts, error } = await supabase
        .from('posts')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .is('deleted_at', null);

      if (error) {
        logger.error('Error fetching user posts:', error);
        throw error;
      }

      if (!posts || posts.length === 0) {
        return {
          totalPosts: 0,
          totalLikes: 0,
          totalComments: 0,
          totalShares: 0,
          averageEngagement: 0,
          topPost: null
        };
      }

      const totalLikes = posts.reduce((sum, post) => sum + (post.likes_count || 0), 0);
      const totalComments = posts.reduce((sum, post) => sum + (post.comments_count || 0), 0);
      const totalShares = posts.reduce((sum, post) => sum + (post.shares_count || 0), 0);
      
      const totalEngagement = totalLikes + totalComments + totalShares;
      const averageEngagement = posts.length > 0 ? totalEngagement / posts.length : 0;

      const topPost = posts.reduce((top, current) => {
        const currentEngagement = (current.likes_count || 0) + (current.comments_count || 0) + (current.shares_count || 0);
        const topEngagement = (top.likes_count || 0) + (top.comments_count || 0) + (top.shares_count || 0);
        return currentEngagement > topEngagement ? current : top;
      });

      logger.info('✅ Estadísticas calculadas', { 
        totalPosts: posts.length,
        totalEngagement,
        averageEngagement: Math.round(averageEngagement * 100) / 100
      });

      return {
        totalPosts: posts.length,
        totalLikes,
        totalComments,
        totalShares,
        averageEngagement: Math.round(averageEngagement * 100) / 100,
        topPost
      };
    } catch (error) {
      logger.error('Error in getUserPostStats:', error);
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
      logger.info('🚨 Reportando post', { postId, reason });

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      const { error } = await supabase
        .from('post_reports')
        .insert({
          post_id: postId,
          reporter_id: user.id,
          reason,
          description,
          status: 'pending'
        });

      if (error) {
        logger.error('Error reporting post:', error);
        throw error;
      }

      logger.info('✅ Post reportado exitosamente', { postId });
    } catch (error) {
      logger.error('Error in reportPost:', error);
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
      logger.info('🏷️ Obteniendo hashtags populares', { limit });

      // Esta sería una consulta más compleja en producción
      // Por ahora retornamos datos mock
      const mockHashtags = [
        { hashtag: '#swinger', count: 150, posts: 45 },
        { hashtag: '#lifestyle', count: 120, posts: 38 },
        { hashtag: '#parejas', count: 95, posts: 32 },
        { hashtag: '#liberal', count: 80, posts: 28 },
        { hashtag: '#aventura', count: 65, posts: 22 },
        { hashtag: '#diversion', count: 55, posts: 18 },
        { hashtag: '#respeto', count: 45, posts: 15 },
        { hashtag: '#discrecion', count: 40, posts: 12 }
      ];

      logger.info('✅ Hashtags populares obtenidos', { count: mockHashtags.length });
      return mockHashtags.slice(0, limit);
    } catch (error) {
      logger.error('Error in getPopularHashtags:', error);
      return [];
    }
  }
}

export const advancedPostsService = new AdvancedPostsService();