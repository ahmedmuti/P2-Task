export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other'
}

export interface Rating {
  id: string;
  raterId: string;
  raterName: string;
  value: number;
  comment?: string;
  createdAt: Date;
}

export interface Beneficiary {
  id: string;
  name: string;
  age: number;
  gender: Gender;
  email: string;
  phone: string;
  budget: number;
  power: number;
  isApproved: boolean;
  ratings: Rating[];
  averageRating: number;
  createdAt: Date;
  updatedAt: Date;
}
