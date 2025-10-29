export interface Classes {
  title: string;
  duration: {
    hours: number;
    minutes: number;
  };
}

export interface ContentCourse {
  sectionTitle: string;
  classes: Classes[];
}

export interface UserReviews {
  name: string;
  rating: number;
  comment: string;
}

export interface FullCourseData {
  title: string;
  description: string;
  longDescription: string;
  image: string;
  price: string;
  topics: string[];
  category: string;
  isSubtitled: boolean;
  language: string;
  isNew: boolean;
  includes: string[];
  requirements: string[];
  whatYouWillLearn: string[];
  content: ContentCourse[];
  userReviews: UserReviews[];
}
