interface UserReview {
    name: string;
    comment: string;
    rating: number;
}

export interface Course {
    id: string;
    title: string;
    description: string;
    longDescription: string;
    rating: number;
    reviews: number;
    userReviews: UserReview[];
    updated_at: string;
    created_at: string;
    language: string;
    isSubtitled: boolean;
    image: string;
    price: string;
    includes: string[];
    whatYouWillLearn: string[];
    requirements: string[];
}

