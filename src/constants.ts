import { Pet, Product, Post } from './types';

export const PETS: Pet[] = [
  {
    id: '1',
    name: 'Milo',
    breed: 'Golden Retriever',
    age: '2 tuổi',
    gender: 'Male',
    image: 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&q=80&w=800',
    rescuePartner: 'Hanoi Pet Rescue',
    description: 'Năng động, thân thiện và rất quấn người.',
    status: 'Ready',
    tags: ['Thân thiện', 'Đã tiêm phòng', 'Năng động'],
    aiMatching: 98,
    story: 'Milo được tìm thấy lạc bước ở khu vực công viên Thống Nhất. Sau 3 tháng tại trung tâm cứu hộ, chú đã sẵn sàng để về với gia đình mới. Milo rất thích chơi bóng và đi dạo vào sáng sớm.',
    healthInfo: {
      vaccinated: true,
      neutered: true,
      microchipped: true
    }
  },
  {
    id: '2',
    name: 'Luna',
    breed: 'Mèo Xiêm',
    age: '1.5 tuổi',
    gender: 'Female',
    image: 'https://images.unsplash.com/photo-1513245538231-152046ad2446?auto=format&fit=crop&q=80&w=800',
    rescuePartner: 'Saigon Cat Rescue',
    description: 'Trầm tính, thích ngủ và rất tình cảm.',
    status: 'Ready',
    tags: ['Điềm tĩnh', 'Tình cảm'],
    aiMatching: 85
  },
  {
    id: '3',
    name: 'Cooper',
    breed: 'Corgi',
    age: '3 tuổi',
    gender: 'Male',
    image: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&q=80&w=800',
    rescuePartner: 'Da Nang Pet Aid',
    description: 'Thông minh, ham học hỏi và thích chạy nhảy.',
    status: 'Treatment',
    tags: ['Thông minh', 'Đang điều trị'],
    aiMatching: 75
  }
];

export const PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Thức ăn hạt Royal Canin',
    category: 'Food',
    price: 450000,
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1589924691106-073b138d0b23?auto=format&fit=crop&q=80&w=400',
    isNew: true
  },
  {
    id: '2',
    name: 'Đồ chơi xương gặm Silicon',
    category: 'Toys',
    price: 85000,
    rating: 4.5,
    image: 'https://images.unsplash.com/photo-1576201836106-db1758fd1c97?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: '3',
    name: 'Dây dẫn cổ PawHome',
    category: 'Accessories',
    price: 120000,
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1544568100-847a948585b9?auto=format&fit=crop&q=80&w=400'
  }
];

export const POSTS: Post[] = [
  {
    id: '1',
    author: {
      name: 'Nguyễn Văn A',
      avatar: 'https://i.pravatar.cc/150?u=a'
    },
    content: 'Hôm nay dẫn bé Milo đi dạo ở công viên, bé rất thích!',
    image: 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&q=80&w=800',
    likes: 124,
    comments: 18,
    time: '2 giờ trước'
  },
  {
    id: '2',
    author: {
      name: 'BS. Lê Minh',
      avatar: 'https://i.pravatar.cc/150?u=b',
      isExpert: true
    },
    content: 'Lưu ý về chế độ dinh dưỡng cho chó con trong mùa hè này. Hãy đảm bảo các bé luôn được cung cấp đủ nước.',
    likes: 85,
    comments: 12,
    time: '4 giờ trước'
  }
];
