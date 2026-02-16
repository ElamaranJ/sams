// This is a helper script to add sample data to your Firestore database
// You can run this once to populate your database with test data

import { 
  createClass, 
  enrollStudent 
} from '../firebase/database';

// Sample classes data
const sampleClasses = [
  {
    code: 'CS 101',
    name: 'Introduction to Programming',
    instructor: 'Dr. Sarah Miller',
    facultyId: 'faculty_123', // Replace with actual faculty ID
    color: 'from-blue-500 to-blue-600',
    image: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    enrolled: 45,
    schedule: 'Mon, Wed, Fri - 10:00 AM',
    room: 'Lecture Hall A',
    progress: 75,
    nextClass: 'Today, 10:00 AM',
    materials: 12,
    assignments: 8,
    grade: 'A-',
    attendance: 94
  },
  {
    code: 'MATH 201',
    name: 'Discrete Mathematics',
    instructor: 'Prof. John Davis',
    facultyId: 'faculty_456',
    color: 'from-purple-500 to-purple-600',
    image: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    enrolled: 38,
    schedule: 'Tue, Thu - 2:00 PM',
    room: 'Room 204',
    progress: 82,
    nextClass: 'Tomorrow, 2:00 PM',
    materials: 15,
    assignments: 6,
    grade: 'B+',
    attendance: 91
  },
  {
    code: 'CS 202',
    name: 'Data Structures',
    instructor: 'Dr. Emily Chen',
    facultyId: 'faculty_789',
    color: 'from-green-500 to-emerald-600',
    image: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    enrolled: 42,
    schedule: 'Mon, Wed - 1:00 PM',
    room: 'Lab 3',
    progress: 68,
    nextClass: 'Monday, 1:00 PM',
    materials: 10,
    assignments: 7,
    grade: 'A',
    attendance: 96
  }
];

// Function to add sample classes and enroll a student
export const addSampleData = async (studentId) => {
  console.log('🚀 Adding sample data to Firestore...');
  
  try {
    // Create each class
    for (const classData of sampleClasses) {
      const result = await createClass(classData);
      
      if (result.success) {
        console.log(`✅ Created class: ${classData.name}`);
        
        // Enroll the student in this class
        const enrollResult = await enrollStudent(studentId, result.classId);
        
        if (enrollResult.success) {
          console.log(`✅ Enrolled student in: ${classData.name}`);
        } else {
          console.error(`❌ Failed to enroll in ${classData.name}:`, enrollResult.error);
        }
      } else {
        console.error(`❌ Failed to create ${classData.name}:`, result.error);
      }
    }
    
    console.log('🎉 Sample data added successfully!');
    return { success: true };
  } catch (error) {
    console.error('❌ Error adding sample data:', error);
    return { success: false, error: error.message };
  }
};

