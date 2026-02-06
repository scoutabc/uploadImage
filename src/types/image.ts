export interface ImageType {
    id: number;
    title: string;
    description: string | null;
    filename: string;
    mimeType: string;
    size: number;
    createdAt: Date;
};