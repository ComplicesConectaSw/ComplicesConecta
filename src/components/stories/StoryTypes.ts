// Extendemos la interfaz Story existente de data.ts para compatibilidad
export interface Story {
  id: number;
  userId: number;
  user: {
    name: string;
    avatar: string;
  };
  content: {
    type: 'image' | 'video' | 'text';
    url?: string;
    text?: string;
  };
  createdAt: string;
  expiresAt: string;
  views: number;
  isViewed: boolean;
  // Nuevas propiedades para el sistema extendido
  description?: string;
  visibility?: 'public' | 'private';
  location?: string;
  likes?: StoryLike[];
  comments?: StoryComment[];
}

export interface StoryLike {
  id: string;
  storyId: string;
  userId: string;
  createdAt: Date;
  user: {
    id: string;
    name: string;
    avatar?: string;
  };
}

export interface StoryComment {
  id: string;
  storyId: string;
  userId: string;
  comment: string;
  createdAt: Date;
  user: {
    id: string;
    name: string;
    avatar?: string;
  };
}

export interface CreateStoryData {
  contentUrl: string;
  description?: string;
  visibility: 'public' | 'private';
  location?: string;
}

export interface StoryInteraction {
  type: 'like' | 'comment' | 'share';
  storyId: string;
  data?: any;
}
