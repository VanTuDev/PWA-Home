export interface Pet {
  id: string;
  name: string;
  breed: string;
  age: string;
  gender: 'Male' | 'Female';
  image: string;
  rescuePartner: string;
  description: string;
  status: 'Ready' | 'Treatment' | 'Adopted';
  tags: string[];
  aiMatching?: number;
  story?: string;
  healthInfo?: {
    vaccinated: boolean;
    neutered: boolean;
    microchipped: boolean;
  };
}

export interface Product {
  id: string;
  name: string;
  category: 'Food' | 'Toys' | 'Accessories' | 'Hygiene';
  price: number;
  rating: number;
  image: string;
  isNew?: boolean;
}

export interface Post {
  id: string;
  author: {
    name: string;
    avatar: string;
    isExpert?: boolean;
  };
  content: string;
  image?: string;
  likes: number;
  comments: number;
  time: string;
}

export interface AdoptionApplication {
  id: string;
  petId: string;
  fullName: string;
  phone: string;
  facebookLink: string;
  job: 'Sinh viên' | 'Đi làm' | 'Khác';
  monthlyIncome: string;
  address: string;
  housingType: 'Căn hộ' | 'Nhà phố' | 'Sân vườn' | 'Phòng trọ';
  experience: string;
  reason: string;
  idCardFront: string; // URL or base64
  idCardBack: string; // URL or base64
  status: 'Pending' | 'Approved' | 'Rejected' | 'FollowUp';
  submittedAt: string;
}
