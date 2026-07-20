export interface Review {
  /** Fiverr buyer username */
  name: string;
  country: string;
  /** ISO 3166-1 alpha-2, used to render the flag emoji */
  countryCode: string;
  rating: number;
  text: string;
  /** gig category shown on the review */
  project: string;
  /** e.g. "1 year ago" */
  when: string;
}

/**
 * Real client reviews quoted verbatim from the Fiverr profile
 * (fiverr.com/cgrawr). Extracted with scripts/extract-reviews.mjs; only the
 * detailed, informative ones are shown.
 */
export const reviews: Review[] = [
  {
    name: "jetlock",
    country: "Germany",
    countryCode: "DE",
    rating: 5,
    text: "Awesome, high-quality work delivered by Muhtasim! Muhtasim created an amazing piece while hitting every design requirement provided without any issues. Highly recommended!",
    project: "3D Modeling",
    when: "1 year ago",
  },
  {
    name: "aitnesse",
    country: "United States",
    countryCode: "US",
    rating: 5,
    text: "Absolutely outstanding work! Communication was on point, to make sure there was an understanding of what I wanted. And the delivery was timely and accurate to my requests.",
    project: "3D Modeling",
    when: "2 years ago",
  },
  {
    name: "dominusaureate",
    country: "United States",
    countryCode: "US",
    rating: 5,
    text: "Great work, seller was happy to work with me on a couple iterations to really nail the technical aspect of job.",
    project: "Character Modeling",
    when: "2 years ago",
  },
  {
    name: "axthxr",
    country: "Qatar",
    countryCode: "QA",
    rating: 4,
    text: "Amazing 3D design delivered in a very short time. Highly recommend!",
    project: "Character Modeling",
    when: "1 year ago",
  },
];
