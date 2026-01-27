import { 
  Code, Target, Briefcase, Palette, Settings 
} from 'lucide-react';

export const dummyData = {
  stats: {
    totalClasses: 4,
    activeStudents: 320,
    completedAssignments: 180,
    avgAttendance: 94
  },
  categories: [
    { id: 1, name: 'Computer Science', icon: Code, color: 'bg-blue-500', courses: 120 },
    { id: 2, name: 'Mathematics', icon: Target, color: 'bg-purple-500', courses: 85 },
    { id: 3, name: 'Business', icon: Briefcase, color: 'bg-green-500', courses: 95 },
    { id: 4, name: 'Design', icon: Palette, color: 'bg-orange-500', courses: 70 },
    { id: 5, name: 'Engineering', icon: Settings, color: 'bg-red-500', courses: 110 },
  ],
  featuredCourses: [
    { 
      id: 1, 
      title: 'Advanced Data Structures', 
      instructor: 'Dr. Sarah Miller',
      students: 45,
      rating: 4.8,
      price: 'Free',
      duration: '12 weeks',
      level: 'Advanced',
      image: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    },
    { 
      id: 2, 
      title: 'Machine Learning Fundamentals', 
      instructor: 'Prof. John Davis',
      students: 38,
      rating: 4.9,
      price: 'Free',
      duration: '10 weeks',
      level: 'Intermediate',
      image: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
    },
    { 
      id: 3, 
      title: 'Web Development Bootcamp', 
      instructor: 'Ms. Emily Chen',
      students: 62,
      rating: 4.7,
      price: 'Free',
      duration: '16 weeks',
      level: 'Beginner',
      image: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
    },
  ],
  universities: [
    { name: 'Stanford', logo: '🎓' },
    { name: 'MIT', logo: '🏛️' },
    { name: 'Harvard', logo: '📚' },
    { name: 'Duke', logo: '👨‍🎓' },
    { name: 'Penn', logo: '🎯' },
  ]
};