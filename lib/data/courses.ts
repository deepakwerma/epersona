export type Course = {
  id: string;
  title: string;
  description: string;
  price: string;
  url: string;
  topics: string[];
};

export const COURSES: Record<"hitesh" | "piyush", Course[]> = {
  hitesh: [
    // TODO: fill in real courses from hitesh.ai
  ],
  piyush: [
    // TODO: fill in real courses from piyushgarg.dev
  ],
};