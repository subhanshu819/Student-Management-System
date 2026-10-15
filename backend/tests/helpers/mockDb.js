import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

/**
 * In-memory mock database store for isolated, deterministic unit & integration tests.
 * Never touches MongoDB Atlas or any remote production database.
 */
class MockDb {
  constructor() {
    this.users = new Map();
    this.students = new Map();
    this.defaultUsers = new Map();
    this.origMethods = {};
    this.active = false;

    // Seed default test users
    const adminId = '507f1f77bcf86cd799439011';
    this.defaultUsers.set(adminId, {
      _id: new mongoose.Types.ObjectId(adminId),
      id: adminId,
      fullName: 'Head Administrator',
      email: 'admin@apex.edu.in',
      role: 'admin',
      isActive: true,
    });

    const stud1Id = 'user_student_1';
    this.defaultUsers.set(stud1Id, {
      _id: new mongoose.Types.ObjectId('507f1f77bcf86cd799439021'),
      id: stud1Id,
      fullName: 'Student One',
      email: 'student1@apex.edu.in',
      role: 'student',
      studentProfile: new mongoose.Types.ObjectId('507f1f77bcf86cd799439022'),
      rollNumber: '21CS001',
      isActive: true,
    });

    const stud2Id = 'user_student_2';
    this.defaultUsers.set(stud2Id, {
      _id: new mongoose.Types.ObjectId('507f1f77bcf86cd799439031'),
      id: stud2Id,
      fullName: 'Student Two',
      email: 'student2@apex.edu.in',
      role: 'student',
      studentProfile: new mongoose.Types.ObjectId('507f1f77bcf86cd799439033'),
      rollNumber: '21CS002',
      isActive: true,
    });
  }

  install() {
    if (this.active) return;
    this.active = true;

    // Simulate connected state without real network
    mongoose.connection._readyState = 1;

    // Save original Model methods
    const { User } = mongoose.models;
    const { Student } = mongoose.models;

    this.origMethods = {
      User: {
        findOne: User.findOne,
        findById: User.findById,
        create: User.create,
        deleteMany: User.deleteMany,
      },
      Student: {
        find: Student.find,
        findById: Student.findById,
        findByIdAndUpdate: Student.findByIdAndUpdate,
        findByIdAndDelete: Student.findByIdAndDelete,
        create: Student.create,
        countDocuments: Student.countDocuments,
        aggregate: Student.aggregate,
        deleteMany: Student.deleteMany,
      },
    };

    const self = this;

    // ==========================================
    // MOCK USER MODEL
    // ==========================================
    User.findOne = function (filter) {
      const exec = async () => {
        for (const u of self.users.values()) {
          if (filter.email && u.email === filter.email.toLowerCase()) {
            return self._wrapUser(u);
          }
          if (filter._id && u._id.toString() === filter._id.toString()) {
            return self._wrapUser(u);
          }
        }
        return null;
      };
      return {
        select: function () {
          return { exec, then: (resolve, reject) => exec().then(resolve, reject) };
        },
        exec,
        then: (resolve, reject) => exec().then(resolve, reject),
      };
    };

    User.findById = function (id) {
      const idStr = id ? id.toString() : '';
      const exec = async () => {
        let u = self.users.get(idStr);
        if (!u && self.defaultUsers.has(idStr)) {
          u = self.defaultUsers.get(idStr);
        }
        return u ? self._wrapUser(u) : null;
      };
      return {
        select: function () {
          return { exec, then: (resolve, reject) => exec().then(resolve, reject) };
        },
        exec,
        then: (resolve, reject) => exec().then(resolve, reject),
      };
    };

    User.create = async function (doc) {
      const _id = new mongoose.Types.ObjectId();
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(doc.password, salt);
      const userObj = {
        ...doc,
        _id,
        id: _id.toString(),
        password: hashedPassword,
        isActive: doc.isActive !== undefined ? doc.isActive : true,
        role: doc.role || 'student',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      self.users.set(_id.toString(), userObj);
      return self._wrapUser(userObj);
    };

    User.deleteMany = async function () {
      self.users.clear();
      return { acknowledged: true, deletedCount: self.users.size };
    };

    // ==========================================
    // MOCK STUDENT MODEL
    // ==========================================
    Student.create = async function (doc) {
      const _id = new mongoose.Types.ObjectId();
      const parts = (doc.fullName || '').trim().split(' ').filter(Boolean);
      const avatarInitials = parts.length > 1
        ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
        : (parts[0]?.slice(0, 2) || 'ST').toUpperCase();

      const studentObj = {
        ...doc,
        _id,
        id: _id.toString(),
        rollNumber: (doc.rollNumber || '').toUpperCase(),
        email: (doc.email || '').toLowerCase(),
        avatarInitials: doc.avatarInitials || avatarInitials,
        avatarColor: doc.avatarColor || '#dbe1ff',
        avatarTextColor: doc.avatarTextColor || '#004ac6',
        cgpa: doc.cgpa !== undefined ? Number(doc.cgpa) : 0.0,
        attendance: doc.attendance !== undefined ? Number(doc.attendance) : 100.0,
        status: doc.status || 'active',
        department: (doc.department || '').toLowerCase(),
        departmentLabel: doc.departmentLabel || 'Computer Science & Engineering',
        academicYear: String(doc.academicYear || '1'),
        semester: doc.semester || 'I',
        branch: doc.branch || 'B.Tech - Core CS',
        courses: doc.courses || [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      self.students.set(_id.toString(), studentObj);
      return self._wrapStudent(studentObj);
    };

    Student.findById = async function (id) {
      const idStr = id ? id.toString() : '';
      const s = self.students.get(idStr);
      return s ? self._wrapStudent(s) : null;
    };

    Student.findByIdAndUpdate = async function (id, updates, options = {}) {
      const idStr = id ? id.toString() : '';
      const s = self.students.get(idStr);
      if (!s) return null;
      const updated = { ...s, ...updates, updatedAt: new Date() };
      self.students.set(idStr, updated);
      return self._wrapStudent(updated);
    };

    Student.findByIdAndDelete = async function (id) {
      const idStr = id ? id.toString() : '';
      const s = self.students.get(idStr);
      if (!s) return null;
      self.students.delete(idStr);
      return self._wrapStudent(s);
    };

    Student.countDocuments = async function (query = {}) {
      let list = Array.from(self.students.values());
      if (query.status) {
        list = list.filter(s => s.status === query.status);
      }
      if (query.department) {
        list = list.filter(s => s.department === query.department.toLowerCase());
      }
      return list.length;
    };

    Student.find = function (query = {}) {
      let list = Array.from(self.students.values());

      if (query.department) {
        list = list.filter(s => s.department === query.department.toLowerCase());
      }
      if (query.academicYear) {
        list = list.filter(s => s.academicYear === String(query.academicYear));
      }
      if (query.status) {
        list = list.filter(s => s.status === query.status);
      }
      if (query.$or) {
        list = list.filter(s => {
          return query.$or.some(cond => {
            if (cond.fullName?.$regex) {
              return new RegExp(cond.fullName.$regex, 'i').test(s.fullName || '');
            }
            if (cond.rollNumber?.$regex) {
              return new RegExp(cond.rollNumber.$regex, 'i').test(s.rollNumber || '');
            }
            if (cond.email?.$regex) {
              return new RegExp(cond.email.$regex, 'i').test(s.email || '');
            }
            return false;
          });
        });
      }

      const chain = {
        _skip: 0,
        _limit: 50,
        sort: function () { return chain; },
        skip: function (n) { chain._skip = n; return chain; },
        limit: function (n) { chain._limit = n; return chain; },
        lean: function () {
          return {
            exec: async () => {
              const paged = list.slice(chain._skip, chain._skip + chain._limit);
              return paged.map(item => ({ ...item, id: item._id.toString() }));
            },
            then: (resolve, reject) => chain.exec().then(resolve, reject),
          };
        },
        exec: async () => {
          const paged = list.slice(chain._skip, chain._skip + chain._limit);
          return paged.map(s => self._wrapStudent(s));
        },
        then: (resolve, reject) => chain.exec().then(resolve, reject),
      };
      return chain;
    };

    Student.aggregate = async function (pipeline) {
      const list = Array.from(self.students.values());
      // Check pipeline type
      const firstStage = pipeline[0] || {};
      if (firstStage.$group && firstStage.$group._id === '$department') {
        const counts = {};
        list.forEach(s => {
          counts[s.department] = (counts[s.department] || 0) + 1;
        });
        return Object.entries(counts).map(([dept, count]) => ({
          _id: dept,
          count,
          deptLabel: dept.toUpperCase(),
        }));
      }

      if (firstStage.$group && firstStage.$group._id === null) {
        if (list.length === 0) return [];
        const avgCgpa = list.reduce((acc, s) => acc + (s.cgpa || 0), 0) / list.length;
        const avgAtt = list.reduce((acc, s) => acc + (s.attendance || 0), 0) / list.length;
        return [{ _id: null, avgCgpa, avgAttendance: avgAtt }];
      }

      return [];
    };

    Student.deleteMany = async function () {
      self.students.clear();
      return { acknowledged: true, deletedCount: self.students.size };
    };
  }

  _wrapUser(userObj) {
    return {
      ...userObj,
      _id: userObj._id,
      id: userObj._id.toString(),
      comparePassword: async function (candidatePassword) {
        return bcrypt.compare(candidatePassword, userObj.password);
      },
    };
  }

  _wrapStudent(studentObj) {
    return {
      ...studentObj,
      _id: studentObj._id,
      id: studentObj._id.toString(),
      toObject: function () {
        return { ...studentObj, id: studentObj._id.toString() };
      },
      toJSON: function () {
        return { ...studentObj, id: studentObj._id.toString() };
      },
    };
  }

  reset() {
    this.users.clear();
    this.students.clear();
  }

  uninstall() {
    if (!this.active) return;
    this.active = false;
    mongoose.connection._readyState = 0;

    const { User, Student } = mongoose.models;
    if (this.origMethods.User) {
      Object.assign(User, this.origMethods.User);
    }
    if (this.origMethods.Student) {
      Object.assign(Student, this.origMethods.Student);
    }
    this.reset();
  }
}

export const mockDb = new MockDb();
