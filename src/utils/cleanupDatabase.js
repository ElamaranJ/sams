// Utility to clean up duplicate classes and reset data
import { 
  collection, 
  getDocs, 
  deleteDoc, 
  doc,
  query,
  where
} from 'firebase/firestore';
import { db } from '../firebase';

// Delete all classes for a specific faculty
export const deleteAllFacultyClasses = async (facultyId) => {
  try {
    console.log('🗑️ Deleting all classes for faculty:', facultyId);
    
    const q = query(
      collection(db, 'classes'),
      where('facultyId', '==', facultyId)
    );
    
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      console.log('No classes found to delete');
      return { success: true, deletedCount: 0 };
    }
    
    // Delete all classes
    const deletePromises = snapshot.docs.map(docSnapshot => 
      deleteDoc(doc(db, 'classes', docSnapshot.id))
    );
    
    await Promise.all(deletePromises);
    
    console.log(`✅ Deleted ${snapshot.docs.length} classes`);
    return { success: true, deletedCount: snapshot.docs.length };
  } catch (error) {
    console.error('❌ Error deleting classes:', error);
    return { success: false, error: error.message };
  }
};

// Delete all enrollments (optional - if you want to reset student enrollments too)
export const deleteAllEnrollments = async () => {
  try {
    console.log('🗑️ Deleting all enrollments...');
    
    const snapshot = await getDocs(collection(db, 'enrollments'));
    
    if (snapshot.empty) {
      console.log('No enrollments found to delete');
      return { success: true, deletedCount: 0 };
    }
    
    const deletePromises = snapshot.docs.map(docSnapshot => 
      deleteDoc(doc(db, 'enrollments', docSnapshot.id))
    );
    
    await Promise.all(deletePromises);
    
    console.log(`✅ Deleted ${snapshot.docs.length} enrollments`);
    return { success: true, deletedCount: snapshot.docs.length };
  } catch (error) {
    console.error('❌ Error deleting enrollments:', error);
    return { success: false, error: error.message };
  }
};

// Delete all assignments
export const deleteAllAssignments = async () => {
  try {
    console.log('🗑️ Deleting all assignments...');
    
    const snapshot = await getDocs(collection(db, 'assignments'));
    
    if (snapshot.empty) {
      console.log('No assignments found to delete');
      return { success: true, deletedCount: 0 };
    }
    
    const deletePromises = snapshot.docs.map(docSnapshot => 
      deleteDoc(doc(db, 'assignments', docSnapshot.id))
    );
    
    await Promise.all(deletePromises);
    
    console.log(`✅ Deleted ${snapshot.docs.length} assignments`);
    return { success: true, deletedCount: snapshot.docs.length };
  } catch (error) {
    console.error('❌ Error deleting assignments:', error);
    return { success: false, error: error.message };
  }
};

// Complete reset - delete everything and start fresh
export const completeReset = async (facultyId) => {
  try {
    console.log('🔄 Starting complete reset...');
    
    // Delete all data
    const [classesResult, enrollmentsResult, assignmentsResult] = await Promise.all([
      deleteAllFacultyClasses(facultyId),
      deleteAllEnrollments(),
      deleteAllAssignments()
    ]);
    
    console.log('✅ Complete reset finished!');
    console.log(`Deleted: ${classesResult.deletedCount} classes, ${enrollmentsResult.deletedCount} enrollments, ${assignmentsResult.deletedCount} assignments`);
    
    return { 
      success: true, 
      deletedClasses: classesResult.deletedCount,
      deletedEnrollments: enrollmentsResult.deletedCount,
      deletedAssignments: assignmentsResult.deletedCount
    };
  } catch (error) {
    console.error('❌ Error in complete reset:', error);
    return { success: false, error: error.message };
  }
};