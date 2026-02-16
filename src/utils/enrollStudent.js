// Utility to enroll students in faculty classes
import { 
  collection, 
  getDocs, 
  query, 
  where
} from 'firebase/firestore';
import { db } from '../firebase';
import { enrollStudent, getFacultyClasses } from '../firebase/database';

// Enroll a student in all available classes
export const enrollStudentInAllClasses = async (studentId) => {
  try {
    console.log('📚 Enrolling student in all available classes...');
    
    // Get all classes from database
    const snapshot = await getDocs(collection(db, 'classes'));
    
    if (snapshot.empty) {
      console.log('No classes found to enroll in');
      return { success: true, enrolledCount: 0 };
    }
    
    // Enroll student in each class
    let enrolledCount = 0;
    for (const classDoc of snapshot.docs) {
      const result = await enrollStudent(studentId, classDoc.id);
      if (result.success) {
        enrolledCount++;
        console.log(`✅ Enrolled in: ${classDoc.data().name}`);
      }
    }
    
    console.log(`🎉 Enrolled in ${enrolledCount} classes successfully!`);
    return { success: true, enrolledCount };
  } catch (error) {
    console.error('❌ Error enrolling student:', error);
    return { success: false, error: error.message };
  }
};

// Check if student is already enrolled in a class
export const checkEnrollment = async (studentId, classId) => {
  try {
    const q = query(
      collection(db, 'enrollments'),
      where('studentId', '==', studentId),
      where('classId', '==', classId)
    );
    
    const snapshot = await getDocs(q);
    return !snapshot.empty;
  } catch (error) {
    console.error('❌ Error checking enrollment:', error);
    return false;
  }
};

// Enroll student only in classes they're not already enrolled in
export const enrollStudentInNewClasses = async (studentId) => {
  try {
    console.log('📚 Checking for new classes to enroll in...');
    
    // Get all classes
    const snapshot = await getDocs(collection(db, 'classes'));
    
    if (snapshot.empty) {
      return { success: true, enrolledCount: 0 };
    }
    
    let enrolledCount = 0;
    
    for (const classDoc of snapshot.docs) {
      // Check if already enrolled
      const isEnrolled = await checkEnrollment(studentId, classDoc.id);
      
      if (!isEnrolled) {
        const result = await enrollStudent(studentId, classDoc.id);
        if (result.success) {
          enrolledCount++;
          console.log(`✅ Enrolled in: ${classDoc.data().name}`);
        }
      } else {
        console.log(`⏭️ Already enrolled in: ${classDoc.data().name}`);
      }
    }
    
    if (enrolledCount > 0) {
      console.log(`🎉 Enrolled in ${enrolledCount} new classes!`);
    } else {
      console.log('✅ Already enrolled in all available classes');
    }
    
    return { success: true, enrolledCount };
  } catch (error) {
    console.error('❌ Error enrolling student:', error);
    return { success: false, error: error.message };
  }
};