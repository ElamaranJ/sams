// Helper script to add sample classes for FACULTY
import { createClass } from '../firebase/database';

// Sample classes for faculty to teach
const facultyClasses = [
  {
    code: 'CS 101',
    name: 'Introduction to Programming',
    instructor: 'Faculty Name', // Will be replaced with actual faculty name
    facultyId: '', // Will be set when called
    color: 'from-blue-500 to-blue-600',
    image: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    schedule: 'Mon, Wed, Fri - 10:00 AM',
    room: 'Lecture Hall A',
    semester: 'Spring 2026',
    credits: 3
  },
  {
    code: 'MATH 201',
    name: 'Discrete Mathematics',
    instructor: 'Faculty Name',
    facultyId: '',
    color: 'from-purple-500 to-purple-600',
    image: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    schedule: 'Tue, Thu - 2:00 PM',
    room: 'Room 204',
    semester: 'Spring 2026',
    credits: 4
  },
  {
    code: 'CS 202',
    name: 'Data Structures',
    instructor: 'Faculty Name',
    facultyId: '',
    color: 'from-green-500 to-emerald-600',
    image: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    schedule: 'Mon, Wed - 1:00 PM',
    room: 'Lab 3',
    semester: 'Spring 2026',
    credits: 4
  }
];

// Function to add faculty classes
export const addFacultyClasses = async (facultyId, facultyName) => {
  console.log('🚀 Adding faculty classes...');
  
  try {
    for (const classData of facultyClasses) {
      const result = await createClass({
        ...classData,
        facultyId: facultyId,
        instructor: facultyName
      });
      
      if (result.success) {
        console.log(`✅ Created class: ${classData.name}`);
      } else {
        console.error(`❌ Failed to create ${classData.name}:`, result.error);
      }
    }
    
    console.log('🎉 Faculty classes added successfully!');
    return { success: true };
  } catch (error) {
    console.error('❌ Error adding faculty classes:', error);
    return { success: false, error: error.message };
  }
};