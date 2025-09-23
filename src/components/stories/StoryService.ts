import { Story, CreateStoryData, StoryLike, StoryComment } from './StoryTypes';

// Mock data for demo mode
const DEMO_STORIES: Story[] = [
  {
    id: 1,
    userId: 101,
    user: {
      name: "Sofía García",
      avatar: "/src/assets/people/profile-1.jpg"
    },
    content: {
      type: 'image',
      url: "/src/assets/people/profile-1.jpg"
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
        user: { id: "102", name: "Miguel López", avatar: "/src/assets/people/profile-2.jpg" }
      }
    ],
    comments: [
      {
        id: "comment1",
        storyId: "1",
        userId: "103",
        comment: "¡Qué hermosa foto!",
        createdAt: new Date(),
        user: { id: "103", name: "Ana Martínez", avatar: "/src/assets/people/profile-2.jpg" }
      }
    ]
  },
  {
    id: 2,
    userId: 102,
    user: {
      name: "Miguel & Carmen",
      avatar: "/src/assets/people/profile-2.jpg"
    },
    content: {
      type: 'image',
      url: "/src/assets/people/profile-2.jpg"
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

class StoryService {
  private isDemoMode(): boolean {
    return localStorage.getItem('demo_authenticated') === 'true';
  }

  private getDemoStories(): Story[] {
    const stored = localStorage.getItem('demo_stories');
    return stored ? JSON.parse(stored) : DEMO_STORIES;
  }

  private saveDemoStories(stories: Story[]): void {
    localStorage.setItem('demo_stories', JSON.stringify(stories));
  }

  async getStories(userId?: number): Promise<Story[]> {
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
          avatar: "/src/assets/people/profile-1.jpg"
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
            user: { id: "1", name: "Usuario Demo", avatar: "/src/assets/people/profile-1.jpg" }
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
          user: { id: "1", name: "Usuario Demo", avatar: "/src/assets/people/profile-1.jpg" }
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

    // TODO: Implementar lógica de compartir para producción
    try {
      // const response = await fetch(`/api/stories/${storyId}/share`, { method: 'POST' });
      // const data = await response.json();
      // return data.shareUrl;
      return null;
    } catch (error) {
      console.error('Error sharing story:', error);
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
