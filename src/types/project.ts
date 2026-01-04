export interface Project {
  id: number;
  userId: number;
  projectName: string;
  image: string | null;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateProjectDto {
  userId: number;
  projectName: string;
  image?: string | null;
  description?: string | null;
}

export interface UpdateProjectDto {
  projectName?: string;
  image?: string | null;
  description?: string | null;
}

