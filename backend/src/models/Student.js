import mongoose from 'mongoose';

const CourseSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, uppercase: true, trim: true },
    name: { type: String, required: true, trim: true },
    credits: { type: Number, required: true, min: 1, max: 8 },
    grade: { type: String, trim: true, default: 'In Progress' },
    attendance: { type: Number, min: 0, max: 100, default: 100 },
  },
  { _id: false }
);

const StudentSchema = new mongoose.Schema(
  {
    rollNumber: {
      type: String,
      required: [true, 'Student roll / enrolment number is required'],
      unique: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    fullName: {
      type: String,
      required: [true, 'Full legal name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Institutional email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        'Please provide a valid email address',
      ],
      index: true,
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    dateOfBirth: {
      type: String,
      trim: true,
      default: '',
    },
    gender: {
      type: String,
      enum: {
        values: ['Male', 'Female', 'Other'],
        message: '{VALUE} is not a supported gender option',
      },
      default: 'Male',
    },
    bloodGroup: {
      type: String,
      trim: true,
      default: 'B+ (Positive)',
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
      trim: true,
      lowercase: true,
      index: true,
    },
    departmentLabel: {
      type: String,
      trim: true,
      default: 'Computer Science & Engineering',
    },
    degree: {
      type: String,
      trim: true,
      default: 'btech',
    },
    branch: {
      type: String,
      trim: true,
      default: 'B.Tech - Core CS',
    },
    academicYear: {
      type: String,
      required: [true, 'Academic year is required'],
      trim: true,
      index: true,
    },
    semester: {
      type: String,
      trim: true,
      default: 'I',
    },
    cgpa: {
      type: Number,
      min: [0, 'CGPA cannot be negative'],
      max: [10, 'CGPA cannot exceed 10.0'],
      default: 0.0,
    },
    attendance: {
      type: Number,
      min: [0, 'Attendance cannot be negative'],
      max: [100, 'Attendance cannot exceed 100%'],
      default: 100.0,
    },
    status: {
      type: String,
      enum: {
        values: ['active', 'on_leave', 'suspended', 'graduated', 'probation'],
        message: '{VALUE} is not a recognized student status',
      },
      default: 'active',
      index: true,
    },
    facultyAdvisor: {
      type: String,
      trim: true,
      default: 'Dr. K. S. Ramanujam',
    },
    guardianName: {
      type: String,
      trim: true,
      default: 'N/A',
    },
    guardianRelation: {
      type: String,
      trim: true,
      default: 'Parent/Guardian',
    },
    guardianPhone: {
      type: String,
      trim: true,
      default: '',
    },
    address: {
      type: String,
      trim: true,
      default: '',
    },
    hostel: {
      type: String,
      trim: true,
      default: 'Day Scholar',
    },
    enrollmentDate: {
      type: String,
      trim: true,
      default: () => new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    },
    avatarInitials: {
      type: String,
      trim: true,
      default: '',
    },
    avatarColor: {
      type: String,
      default: '#dbe1ff',
    },
    avatarTextColor: {
      type: String,
      default: '#004ac6',
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    division: {
      type: String,
      trim: true,
      default: 'Division A (Section CSE-01)',
    },
    batch: {
      type: String,
      trim: true,
      default: 'Batch 2021-2025',
    },
    totalCredits: {
      type: Number,
      min: 0,
      default: 132,
    },
    maxCredits: {
      type: Number,
      min: 1,
      default: 160,
    },
    semesterStanding: {
      type: String,
      trim: true,
      default: 'Good Standing',
    },
    activeBacklogs: {
      type: Number,
      min: 0,
      default: 0,
    },
    kycStatus: {
      type: String,
      trim: true,
      default: 'KYC VERIFIED',
    },
    courses: [CourseSchema],
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Pre-save hook to compute initials if missing
StudentSchema.pre('save', function (next) {
  if (this.isModified('fullName') || !this.avatarInitials) {
    const parts = (this.fullName || '').trim().split(' ').filter(Boolean);
    this.avatarInitials = parts.length > 1
      ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
      : (parts[0]?.slice(0, 2) || 'ST').toUpperCase();
  }
  next();
});

// Compound/Text index for search queries
StudentSchema.index({ fullName: 'text', rollNumber: 'text', email: 'text' });

export const Student = mongoose.model('Student', StudentSchema);
