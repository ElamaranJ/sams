import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  where,
  addDoc,
  updateDoc,
  deleteDoc,
  orderBy,
  onSnapshot
} from 'firebase/firestore';
import { db } from '../firebase';

// ============================================
// AUTO-ENROLLMENT
// ============================================
export const autoEnrollNewStudent = async (studentId) => {
  try {
    const classesSnapshot = await getDocs(collection(db, 'classes'));
    if (classesSnapshot.empty) return { success: true, enrolledCount: 0 };
    let enrolledCount = 0;
    for (const classDoc of classesSnapshot.docs) {
      const enrollmentQuery = query(
        collection(db, 'enrollments'),
        where('studentId', '==', studentId),
        where('classId', '==', classDoc.id)
      );
      const existingEnrollment = await getDocs(enrollmentQuery);
      if (existingEnrollment.empty) {
        await addDoc(collection(db, 'enrollments'), {
          studentId,
          classId: classDoc.id,
          enrolledAt: new Date().toISOString(),
          status: 'active'
        });
        enrolledCount++;
      }
    }
    return { success: true, enrolledCount };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const autoEnrollAllStudentsInNewClass = async (classId) => {
  try {
    const studentsQuery = query(collection(db, 'users'), where('role', '==', 'student'));
    const studentsSnapshot = await getDocs(studentsQuery);
    if (studentsSnapshot.empty) return { success: true, enrolledCount: 0 };
    let enrolledCount = 0;
    for (const studentDoc of studentsSnapshot.docs) {
      const enrollmentQuery = query(
        collection(db, 'enrollments'),
        where('studentId', '==', studentDoc.id),
        where('classId', '==', classId)
      );
      const existingEnrollment = await getDocs(enrollmentQuery);
      if (existingEnrollment.empty) {
        await addDoc(collection(db, 'enrollments'), {
          studentId: studentDoc.id,
          classId: classId,
          enrolledAt: new Date().toISOString(),
          status: 'active'
        });
        enrolledCount++;
      }
    }
    return { success: true, enrolledCount };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// ============================================
// CLASSES
// ============================================
export const getStudentClasses = async (studentId) => {
  try {
    // Auto-enroll in any missing classes
    await autoEnrollNewStudent(studentId);

    const q = query(collection(db, 'enrollments'), where('studentId', '==', studentId));
    const enrollmentSnapshot = await getDocs(q);
    const classIds = enrollmentSnapshot.docs.map(d => d.data().classId);
    if (classIds.length === 0) return { success: true, classes: [] };

    const classPromises = classIds.map(classId => getDoc(doc(db, 'classes', classId)));
    const classDocs = await Promise.all(classPromises);
    const classes = classDocs
      .filter(d => d.exists())
      .map(d => ({ id: d.id, ...d.data() }));
    return { success: true, classes };
  } catch (error) {
    console.error('getStudentClasses error:', error);
    return { success: false, error: error.message };
  }
};

export const getFacultyClasses = async (facultyId) => {
  try {
    const q = query(collection(db, 'classes'), where('facultyId', '==', facultyId));
    const snapshot = await getDocs(q);
    const classes = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    return { success: true, classes };
  } catch (error) {
    console.error('getFacultyClasses error:', error);
    return { success: false, error: error.message };
  }
};

export const createClass = async (classData) => {
  try {
    const docRef = await addDoc(collection(db, 'classes'), {
      ...classData,
      createdAt: new Date().toISOString(),
      status: 'active'
    });
    await autoEnrollAllStudentsInNewClass(docRef.id);
    return { success: true, classId: docRef.id };
  } catch (error) {
    console.error('createClass error:', error);
    return { success: false, error: error.message };
  }
};

export const deleteClass = async (classId) => {
  try {
    await deleteDoc(doc(db, 'classes', classId));
    const enrollQ = query(collection(db, 'enrollments'), where('classId', '==', classId));
    const enrollSnap = await getDocs(enrollQ);
    for (const d of enrollSnap.docs) await deleteDoc(d.ref);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const getAllClasses = async () => {
  try {
    const snapshot = await getDocs(collection(db, 'classes'));
    const classes = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    return { success: true, classes };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const getClassStudents = async (classId) => {
  try {
    const q = query(collection(db, 'enrollments'), where('classId', '==', classId));
    const enrollmentSnapshot = await getDocs(q);
    const studentIds = enrollmentSnapshot.docs.map(d => d.data().studentId);
    if (studentIds.length === 0) return { success: true, students: [] };
    const studentPromises = studentIds.map(sid => getDoc(doc(db, 'users', sid)));
    const studentDocs = await Promise.all(studentPromises);
    const students = studentDocs
      .filter(d => d.exists())
      .map(d => ({ id: d.id, ...d.data() }));
    return { success: true, students };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// ============================================
// ASSIGNMENTS
// ============================================

// FIX: Removed orderBy to avoid Firestore composite index requirement.
// We sort by createdAt in JavaScript instead.
export const getClassAssignments = async (classId) => {
  try {
    // Simple query with only ONE filter — no index needed
    const q = query(
      collection(db, 'assignments'),
      where('classId', '==', classId)
    );
    const snapshot = await getDocs(q);
    const assignments = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    // Sort by createdAt descending in JS (no index required)
    assignments.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    return { success: true, assignments };
  } catch (error) {
    console.error('getClassAssignments error:', error.code, error.message);
    return { success: false, error: error.message };
  }
};

export const createAssignment = async (assignmentData) => {
  try {
    const docRef = await addDoc(collection(db, 'assignments'), {
      ...assignmentData,
      createdAt: new Date().toISOString(),
      status: 'active'
    });
    console.log('Assignment created:', docRef.id);
    return { success: true, assignmentId: docRef.id };
  } catch (error) {
    console.error('createAssignment error:', error);
    return { success: false, error: error.message };
  }
};

export const getFacultyAssignments = async (facultyId) => {
  try {
    const q = query(
      collection(db, 'assignments'),
      where('facultyId', '==', facultyId)
    );
    const snapshot = await getDocs(q);
    const assignments = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    assignments.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    return { success: true, assignments };
  } catch (error) {
    console.error('getFacultyAssignments error:', error);
    return { success: false, error: error.message };
  }
};

// FIX: Directly query assignments by enrolled classIds.
// Does NOT call getStudentClasses (which triggers slow auto-enrollment).
export const getStudentAssignments = async (studentId) => {
  try {
    // Step 1: Get student's enrolled class IDs from enrollments collection
    const enrollQ = query(
      collection(db, 'enrollments'),
      where('studentId', '==', studentId)
    );
    const enrollSnap = await getDocs(enrollQ);
    
    if (enrollSnap.empty) {
      console.log('Student has no enrollments yet');
      return { success: true, assignments: [] };
    }

    const classIds = enrollSnap.docs.map(d => d.data().classId);
    console.log('Student enrolled in classIds:', classIds);

    // Step 2: For each class, get assignments
    const assignmentPromises = classIds.map(classId => getClassAssignments(classId));
    const results = await Promise.all(assignmentPromises);
    
    // Step 3: Flatten and log
    const allAssignments = results
      .filter(r => r.success)
      .flatMap(r => r.assignments);

    console.log('Total assignments found for student:', allAssignments.length);
    return { success: true, assignments: allAssignments };
  } catch (error) {
    console.error('getStudentAssignments error:', error);
    return { success: false, error: error.message };
  }
};

export const deleteAssignment = async (assignmentId) => {
  try {
    await deleteDoc(doc(db, 'assignments', assignmentId));
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// ============================================
// SUBMISSIONS
// ============================================
export const submitAssignment = async (submissionData) => {
  try {
    const docRef = await addDoc(collection(db, 'submissions'), {
      ...submissionData,
      submittedAt: new Date().toISOString(),
      status: 'submitted',
      grade: null,
      feedback: null
    });
    return { success: true, submissionId: docRef.id };
  } catch (error) {
    console.error('submitAssignment error:', error);
    return { success: false, error: error.message };
  }
};

export const getAssignmentSubmissions = async (assignmentId) => {
  try {
    const q = query(collection(db, 'submissions'), where('assignmentId', '==', assignmentId));
    const snapshot = await getDocs(q);
    const submissions = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    return { success: true, submissions };
  } catch (error) {
    console.error('getAssignmentSubmissions error:', error);
    return { success: false, error: error.message };
  }
};

export const gradeSubmission = async (submissionId, grade, feedback) => {
  try {
    await updateDoc(doc(db, 'submissions', submissionId), {
      grade,
      feedback,
      gradedAt: new Date().toISOString(),
      status: 'graded'
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const getStudentSubmissions = async (studentId) => {
  try {
    const q = query(
      collection(db, 'submissions'),
      where('studentId', '==', studentId)
    );
    const snapshot = await getDocs(q);
    const submissions = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    submissions.sort((a, b) => new Date(b.submittedAt || 0) - new Date(a.submittedAt || 0));
    return { success: true, submissions };
  } catch (error) {
    console.error('getStudentSubmissions error:', error);
    return { success: false, error: error.message };
  }
};

export const getStudentGrades = async (studentId) => {
  try {
    const q = query(
      collection(db, 'submissions'),
      where('studentId', '==', studentId),
      where('status', '==', 'graded')
    );
    const snapshot = await getDocs(q);
    const grades = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    return { success: true, grades };
  } catch (error) {
    console.error('getStudentGrades error:', error);
    return { success: false, error: error.message };
  }
};

// ============================================
// ATTENDANCE
// ============================================
export const createAttendanceSession = async (attendanceData) => {
  try {
    const docRef = await addDoc(collection(db, 'attendance_sessions'), {
      ...attendanceData,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + (attendanceData.duration || 15) * 60 * 1000).toISOString(),
      isActive: true
    });
    return { success: true, sessionId: docRef.id };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const markAttendance = async (sessionId, studentId) => {
  try {
    const sessionDoc = await getDoc(doc(db, 'attendance_sessions', sessionId));
    if (!sessionDoc.exists()) return { success: false, error: 'Session not found' };
    const session = sessionDoc.data();
    const now = new Date();
    const expiresAt = new Date(session.expiresAt);
    if (now > expiresAt) return { success: false, error: 'Session expired' };

    // Check already marked
    const existingQ = query(
      collection(db, 'attendance'),
      where('sessionId', '==', sessionId),
      where('studentId', '==', studentId)
    );
    const existing = await getDocs(existingQ);
    if (!existing.empty) return { success: false, error: 'Attendance already marked for this session' };

    // Fetch student profile for name, email, rollNo
    const studentDoc = await getDoc(doc(db, 'users', studentId));
    const studentData = studentDoc.exists() ? studentDoc.data() : {};

    await addDoc(collection(db, 'attendance'), {
      sessionId,
      studentId,
      studentName: studentData.name || '',
      studentEmail: studentData.email || '',
      studentRollNo: studentData.studentId || studentData.rollNo || '',
      classId: session.classId,
      date: session.date || new Date().toISOString().split('T')[0],
      markedAt: new Date().toISOString(),
      status: 'present',
      method: 'otp' // will be overridden to 'qr' if scanned
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Mark attendance via QR scan — same as above but marks method as 'qr'
export const markAttendanceViaQR = async (sessionId, studentId) => {
  try {
    const sessionDoc = await getDoc(doc(db, 'attendance_sessions', sessionId));
    if (!sessionDoc.exists()) return { success: false, error: 'Session not found' };
    const session = sessionDoc.data();
    const now = new Date();
    const expiresAt = new Date(session.expiresAt);
    if (now > expiresAt) return { success: false, error: 'Session has expired. Ask faculty to generate a new QR.' };

    const existingQ = query(
      collection(db, 'attendance'),
      where('sessionId', '==', sessionId),
      where('studentId', '==', studentId)
    );
    const existing = await getDocs(existingQ);
    if (!existing.empty) return { success: false, error: 'Your attendance is already marked for this session.' };

    const studentDoc = await getDoc(doc(db, 'users', studentId));
    const studentData = studentDoc.exists() ? studentDoc.data() : {};

    await addDoc(collection(db, 'attendance'), {
      sessionId,
      studentId,
      studentName: studentData.name || '',
      studentEmail: studentData.email || '',
      studentRollNo: studentData.studentId || studentData.rollNo || '',
      classId: session.classId,
      date: session.date || new Date().toISOString().split('T')[0],
      markedAt: new Date().toISOString(),
      status: 'present',
      method: 'qr'
    });
    return { success: true, studentName: studentData.name || 'Student', className: session.className || session.classCode };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Get all students who attended a specific session (for faculty view)
export const getSessionAttendees = async (sessionId) => {
  try {
    const q = query(collection(db, 'attendance'), where('sessionId', '==', sessionId));
    const snapshot = await getDocs(q);
    const attendees = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    attendees.sort((a, b) => new Date(a.markedAt || 0) - new Date(b.markedAt || 0));
    return { success: true, attendees };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const getStudentAttendance = async (studentId) => {
  try {
    const q = query(collection(db, 'attendance'), where('studentId', '==', studentId));
    const snapshot = await getDocs(q);
    const attendance = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    attendance.sort((a, b) => new Date(b.markedAt || 0) - new Date(a.markedAt || 0));
    return { success: true, attendance };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const getClassAttendanceSessions = async (classId) => {
  try {
    const q = query(collection(db, 'attendance_sessions'), where('classId', '==', classId));
    const snapshot = await getDocs(q);
    const sessions = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    sessions.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    return { success: true, sessions };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// ============================================
// USER MANAGEMENT
// ============================================
export const getAllUsers = async () => {
  try {
    const snapshot = await getDocs(collection(db, 'users'));
    const users = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    return { success: true, users };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const getUsersByRole = async (role) => {
  try {
    const q = query(collection(db, 'users'), where('role', '==', role));
    const snapshot = await getDocs(q);
    const users = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    return { success: true, users };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const updateUser = async (userId, updates) => {
  try {
    await updateDoc(doc(db, 'users', userId), updates);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const deleteUser = async (userId) => {
  try {
    await deleteDoc(doc(db, 'users', userId));
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const getDashboardStats = async () => {
  try {
    const [usersSnap, classesSnap, assignmentsSnap, submissionsSnap] = await Promise.all([
      getDocs(collection(db, 'users')),
      getDocs(collection(db, 'classes')),
      getDocs(collection(db, 'assignments')),
      getDocs(collection(db, 'submissions'))
    ]);
    const users = usersSnap.docs.map(d => d.data());
    const students = users.filter(u => u.role === 'student');
    const faculty = users.filter(u => u.role === 'faculty');
    const pendingSubmissions = submissionsSnap.docs.filter(d => d.data().status === 'submitted');
    return {
      success: true,
      stats: {
        totalUsers: usersSnap.size,
        totalStudents: students.length,
        totalFaculty: faculty.length,
        totalClasses: classesSnap.size,
        totalAssignments: assignmentsSnap.size,
        pendingGrading: pendingSubmissions.length
      }
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
};