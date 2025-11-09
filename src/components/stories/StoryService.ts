import { Story, CreateStoryData, StoryLike, StoryComment } from './StoryTypes';
import { getRandomProfileImage } from '@/lib/imageService';
import { logger } from '@/lib/logger';

// Mock data for demo mode - adapts to user profile type
const getDemoStories = (): Story[] => {
  const demoUser = localStorage.getItem('demo_user');
  const userType = localStorage.getItem('userType') || 'single';
  
  let userName = "Usuario Demo";
  let userAvatar = getRandomProfileImage('female', { width: 150, height: 150 });
  
  if (demoUser) {
    try {
      const parsedUser = JSON.parse(demoUser);
      userName = userType === 'couple' 
        ? `${parsedUser.first_name} & Pareja`
        : parsedUser.first_name || "Usuario Demo";
      
      // Use dynamic image based on user gender
      const userGender = parsedUser.gender || 'female';
      userAvatar = getRandomProfileImage(userGender, { width: 150, height: 150 });
    } catch {
      // Fallback to default
    }
  }

  return [
    {
      id: 1,
      userId: 101,
      user: {
        name: userName,
        avatar: userAvatar
      },
    content: {
      type: 'image',
      url: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=600&fit=crop"
    },
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 horas atrás
    expiresAt: new Date(Date.now() + 22 * 60 * 60 * 1000).toISOString(), // 22 horas restantes
    views: 12,
    isViewed: false,
    description: "Disfrutando un día soleado en la ciudad",
    visibility: 'public',
    location: "CDMX",
    likes: [
      {
        id: "like1",
        storyId: "1",
        userId: "102",
        createdAt: new Date(),
        user: { id: "102", name: "Miguel López", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face" }
      }
    ],
    comments: [
      {
        id: "comment1",
        storyId: "1",
        userId: "103",
        comment: "¡Qué hermosa foto!",
        createdAt: new Date(),
        user: { id: "103", name: "Ana Martínez", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face" }
      }
    ]
  },
  {
    id: 2,
    userId: 102,
    user: {
      name: "Miguel & Carmen",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"
    },
    content: {
      type: 'image',
      url: "https://images.unsplash.com/photo-1511593358241-7eea1f3c84e5?w=400&h=600&fit=crop"
    },
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 horas atrás
    expiresAt: new Date(Date.now() + 19 * 60 * 60 * 1000).toISOString(), // 19 horas restantes
    views: 8,
    isViewed: true,
    description: "Noche romántica en pareja",
    visibility: 'private',
    location: "Guadalajara",
    likes: [],
    comments: []
  }
  ];
};

class StoryService {
  private isDemoMode(): boolean {
    return localStorage.getItem('demo_authenticated') === 'true';
  }

  private getDemoStories(): Story[] {
    const stored = localStorage.getItem('demo_stories');
    return stored ? JSON.parse(stored) : getDemoStories();
  }

  private saveDemoStories(stories: Story[]): void {
    localStorage.setItem('demo_stories', JSON.stringify(stories));
  }

  async getStories(_userId?: number): Promise<Story[]> {
    if (this.isDemoMode()) {
      const stories = this.getDemoStories();
      // Filtrar historias expiradas
      const activeStories = stories.filter(story => new Date(story.expiresAt) > new Date());
      return activeStories;
    }

    // TODO: Implementar llamada a API real para producción
    try {
      // const response = await fetch('/api/stories');
      // return await response.json();
      return [];
    } catch (error) {
      console.error('Error fetching stories:', error);
      return [];
    }
  }

  async createStory(data: CreateStoryData): Promise<Story | null> {
    if (this.isDemoMode()) {
      const stories = this.getDemoStories();
      const newStory: Story = {
        id: Date.now(),
        userId: 1, // Usuario demo
        user: {
          name: "Usuario Demo",
          avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"
        },
        content: {
          type: 'image',
          url: data.contentUrl
        },
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 horas
        views: 0,
        isViewed: false,
        description: data.description,
        visibility: data.visibility || 'public',
        location: data.location,
        likes: [],
        comments: []
      };

      stories.push(newStory);
      this.saveDemoStories(stories);
      return newStory;
    }

    // TODO: Implementar llamada a API real para producción
    try {
      // const response = await fetch('/api/stories', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(data)
      // });
      // return await response.json();
      return null;
    } catch (error) {
      console.error('Error creating story:', error);
      return null;
    }
  }

  async likeStory(storyId: number): Promise<boolean> {
    if (this.isDemoMode()) {
      const stories = this.getDemoStories();
      const story = stories.find(s => s.id === storyId);
      
      if (story) {
        const existingLike = story.likes?.find(like => like.userId === "1");
        
        if (existingLike) {
          // Quitar like
          story.likes = story.likes?.filter(like => like.userId !== "1") || [];
        } else {
          // Agregar like
          const newLike: StoryLike = {
            id: `like_${Date.now()}`,
            storyId: storyId.toString(),
            userId: "1",
            createdAt: new Date(),
            user: { id: "1", name: "Usuario Demo", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face" }
          };
          story.likes = story.likes || [];
          story.likes.push(newLike);
        }
        
        this.saveDemoStories(stories);
        return true;
      }
      return false;
    }

    // TODO: Implementar llamada a API real para producción
    try {
      // const response = await fetch(`/api/stories/${storyId}/like`, { method: 'POST' });
      // return response.ok;
      return false;
    } catch (error) {
      console.error('Error liking story:', error);
      return false;
    }
  }

  async commentStory(storyId: number, comment: string): Promise<boolean> {
    if (this.isDemoMode()) {
      const stories = this.getDemoStories();
      const story = stories.find(s => s.id === storyId);
      
      if (story) {
        const newComment: StoryComment = {
          id: `comment_${Date.now()}`,
          storyId: storyId.toString(),
          userId: "1",
          comment,
          createdAt: new Date(),
          user: { id: "1", name: "Usuario Demo", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face" }
        };
        
        story.comments = story.comments || [];
        story.comments.push(newComment);
        this.saveDemoStories(stories);
        return true;
      }
      return false;
    }

    // TODO: Implementar llamada a API real para producción
    try {
      // const response = await fetch(`/api/stories/${storyId}/comment`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ comment })
      // });
      // return response.ok;
      return false;
    } catch (error) {
      console.error('Error commenting story:', error);
      return false;
    }
  }

  async deleteStory(storyId: number): Promise<boolean> {
    if (this.isDemoMode()) {
      const stories = this.getDemoStories();
      const filteredStories = stories.filter(s => s.id !== storyId);
      this.saveDemoStories(filteredStories);
      return true;
    }

    // TODO: Implementar llamada a API real para producción
    try {
      // const response = await fetch(`/api/stories/${storyId}`, { method: 'DELETE' });
      // return response.ok;
      return false;
    } catch (error) {
      console.error('Error deleting story:', error);
      return false;
    }
  }

  async deleteComment(storyId: number, commentId: string): Promise<boolean> {
    if (this.isDemoMode()) {
      const stories = this.getDemoStories();
      const story = stories.find(s => s.id === storyId);
      
      if (story && story.comments) {
        story.comments = story.comments.filter(c => c.id !== commentId);
        this.saveDemoStories(stories);
        return true;
      }
      return false;
    }

    // TODO: Implementar llamada a API real para producción
    try {
      // const response = await fetch(`/api/stories/${storyId}/comments/${commentId}`, { method: 'DELETE' });
      // return response.ok;
      return false;
    } catch (error) {
      console.error('Error deleting comment:', error);
      return false;
    }
  }

  async shareStory(storyId: number): Promise<string | null> {
    if (this.isDemoMode()) {
      // Generar URL de compartir demo
      return `${window.location.origin}/stories/${storyId}?demo=true`;
    }

    try {
      const { supabase } = await import('@/integrations/supabase/client');
      
      if (!supabase) {
        logger.warn('Supabase no disponible para compartir story');
        return null;
      }

      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        logger.warn('Usuario no disponible para compartir story');
        return null;
      }

      // Registrar share en story_shares
      const { error } = await supabase
        .from('story_shares')
        .insert({
          story_id: storyId.toString(),
          user_id: user.id,
          share_type: 'share',
          created_at: new Date().toISOString(),
        });

      if (error) {
        logger.error('Error sharing story:', { error: error.message });
        return null;
      }

      // Generar URL de compartir
      const shareUrl = `${window.location.origin}/stories/${storyId}`;
      logger.info('✅ Story shared successfully', { storyId, shareUrl });
      return shareUrl;
    } catch (error) {
      logger.error('Error sharing story:', { error: String(error) });
      return null;
    }
  }

  async markAsViewed(storyId: number): Promise<boolean> {
    if (this.isDemoMode()) {
      const stories = this.getDemoStories();
      const story = stories.find(s => s.id === storyId);
      
      if (story) {
        story.isViewed = true;
        story.views += 1;
        this.saveDemoStories(stories);
        return true;
      }
      return false;
    }

    // TODO: Implementar llamada a API real para producción
    try {
      // const response = await fetch(`/api/stories/${storyId}/view`, { method: 'POST' });
      // return response.ok;
      return false;
    } catch (error) {
      console.error('Error marking story as viewed:', error);
      return false;
    }
  }
}

export const storyService = new StoryService();
export default StoryService;
