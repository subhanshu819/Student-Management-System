import { connectDB, disconnectDB } from '../config/db.js';
import { Student } from '../models/Student.js';
import { User } from '../models/User.js';

const initialStudents = [
  {
    rollNumber: '21CS042',
    fullName: 'Aarav Sharma',
    email: 'aarav.sharma.21cs@apex.edu.in',
    phone: '+91 98765 43210',
    department: 'cs',
    departmentLabel: 'Computer Science & Engineering',
    branch: 'B.Tech - Core CS',
    academicYear: '3',
    semester: 'VI',
    cgpa: 8.92,
    attendance: 94.0,
    status: 'active',
    dateOfBirth: '14-08-2003',
    gender: 'Male',
    bloodGroup: 'B+ (Positive)',
    guardianName: 'Rajesh Sharma',
    guardianRelation: 'Father',
    guardianPhone: '+91 98110 54321',
    address: 'Flat 402, Royal Residency, Sector 62, Noida, Uttar Pradesh, 201309',
    hostel: 'Hostel Block H-4 · Room 218',
    facultyAdvisor: 'Dr. K. S. Ramanujam',
    courses: [
      { code: 'CS301', name: 'Data Structures & Algorithms', credits: 4, grade: 'A+', attendance: 94 },
      { code: 'CS302', name: 'Database Management Systems', credits: 4, grade: 'A', attendance: 91 },
      { code: 'CS303', name: 'Computer Networks', credits: 3.5, grade: 'A', attendance: 93 },
      { code: 'CS304', name: 'Operating Systems', credits: 4, grade: 'B+', attendance: 88 },
      { code: 'CS305', name: 'Algorithms Analysis', credits: 4, grade: 'A', attendance: 95 },
    ],
  },
  {
    rollNumber: '21CS089',
    fullName: 'Priya Nair',
    email: 'priya.nair@apex.edu.in',
    phone: '+91 97654 32109',
    department: 'cs',
    departmentLabel: 'Computer Science & Engineering',
    branch: 'B.Tech - AI Track',
    academicYear: '3',
    semester: 'VI',
    cgpa: 9.42,
    attendance: 96.0,
    status: 'active',
    dateOfBirth: '22-03-2003',
    gender: 'Female',
    bloodGroup: 'O+ (Positive)',
    guardianName: 'Suresh Nair',
    guardianRelation: 'Father',
    guardianPhone: '+91 94432 10987',
    address: '12, MG Road, Kochi, Kerala, 682035',
    hostel: 'Hostel Block G-2 · Room 108',
    facultyAdvisor: 'Prof. Anita Roy',
  },
  {
    rollNumber: '22EC014',
    fullName: 'Rohan Mehta',
    email: 'rohan.mehta@apex.edu.in',
    phone: '+91 96543 21098',
    department: 'ece',
    departmentLabel: 'Electronics & Communication',
    branch: 'B.Tech - Embedded Systems',
    academicYear: '2',
    semester: 'IV',
    cgpa: 7.85,
    attendance: 88.0,
    status: 'active',
    dateOfBirth: '05-11-2004',
    gender: 'Male',
    bloodGroup: 'A+ (Positive)',
    guardianName: 'Anil Mehta',
    guardianRelation: 'Father',
    guardianPhone: '+91 98221 65432',
    address: '88, Park Street, Kolkata, West Bengal, 700016',
    hostel: 'Hostel Block H-1 · Room 304',
    facultyAdvisor: 'Dr. M. S. Venkatesh',
  },
  {
    rollNumber: '22AI031',
    fullName: 'Sneha Patel',
    email: 'sneha.patel@apex.edu.in',
    phone: '+91 95432 10987',
    department: 'aids',
    departmentLabel: 'AI & Data Science',
    branch: 'B.Tech - Data Science',
    academicYear: '2',
    semester: 'IV',
    cgpa: 9.1,
    attendance: 98.0,
    status: 'active',
    dateOfBirth: '18-01-2004',
    gender: 'Female',
    bloodGroup: 'AB+ (Positive)',
    guardianName: 'Kishore Patel',
    guardianRelation: 'Father',
    guardianPhone: '+91 99090 12345',
    address: '45, Satellite Road, Ahmedabad, Gujarat, 380015',
    hostel: 'Hostel Block G-1 · Room 215',
    facultyAdvisor: 'Dr. Shalini Gupta',
  },
  {
    rollNumber: '20ME007',
    fullName: 'Vikram Singh',
    email: 'vikram.singh@apex.edu.in',
    phone: '+91 94321 09876',
    department: 'mech',
    departmentLabel: 'Mechanical Engineering',
    branch: 'B.Tech - Robotics & Automation',
    academicYear: '4',
    semester: 'VIII',
    cgpa: 6.95,
    attendance: 71.0,
    status: 'on_leave',
    dateOfBirth: '30-07-2002',
    gender: 'Male',
    bloodGroup: 'B- (Negative)',
    guardianName: 'Hardeep Singh',
    guardianRelation: 'Father',
    guardianPhone: '+91 98140 98765',
    address: '104, Model Town, Jalandhar, Punjab, 144003',
    hostel: 'Hostel Block H-3 · Room 412',
    facultyAdvisor: 'Prof. David Thorne',
  },
  {
    rollNumber: '20CV022',
    fullName: 'Ananya Iyer',
    email: 'ananya.iyer@apex.edu.in',
    phone: '+91 93210 98765',
    department: 'civil',
    departmentLabel: 'Civil Engineering',
    branch: 'B.Tech - Structural Engg',
    academicYear: '4',
    semester: 'VIII',
    cgpa: 8.35,
    attendance: 91.0,
    status: 'active',
    dateOfBirth: '09-09-2002',
    gender: 'Female',
    bloodGroup: 'O- (Negative)',
    guardianName: 'S. Iyer',
    guardianRelation: 'Father',
    guardianPhone: '+91 94440 11223',
    address: '23, Anna Nagar, Chennai, Tamil Nadu, 600040',
    hostel: 'Day Scholar',
    facultyAdvisor: 'Dr. Rajeshwari Menon',
  },
];

async function seed() {
  console.log('[Seed] Connecting to MongoDB Atlas...');
  const connected = await connectDB();
  if (!connected) {
    console.error('[Seed] Could not connect to database. Please check backend/.env');
    process.exit(1);
  }

  try {
    console.log('[Seed] Clearing existing students and users...');
    await Student.deleteMany({});
    await User.deleteMany({});

    console.log('[Seed] Inserting initial student records...');
    const created = await Student.insertMany(initialStudents);
    console.log(`[Seed] Successfully seeded ${created.length} students into MongoDB Atlas!`);

    console.log('[Seed] Creating initial administrator and student accounts...');
    // Create admin user
    const adminUser = await User.create({
      fullName: 'Dr. Rajesh Sharma',
      email: 'admin@apex.edu.in',
      password: 'AdminPassword123!',
      role: 'admin',
    });

    // Create student user linked to Aarav Sharma
    const studentUser = await User.create({
      fullName: 'Aarav Sharma',
      email: 'aarav.sharma.21cs@apex.edu.in',
      password: 'StudentPassword123!',
      role: 'student',
      rollNumber: '21CS042',
      studentProfile: created[0]._id,
    });

    await Student.findByIdAndUpdate(created[0]._id, { userId: studentUser._id });

    console.log(`[Seed] Successfully created Admin (${adminUser.email}) and Student (${studentUser.email}) accounts!`);
  } catch (error) {
    console.error('[Seed Error]:', error.message);
  } finally {
    await disconnectDB();
    process.exit(0);
  }
}

seed();
