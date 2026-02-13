# 📘 แผนพัฒนา Phase 3 — ระบบดูแลการเรียนนักศึกษา (Enhanced Data)

> เอกสารนี้ใช้อ้างอิงเมื่อข้อมูล CSV เวอร์ชันใหม่ (15 คอลัมน์) พร้อมใช้งาน
> ให้ AI Agent อ่านเอกสารนี้ก่อนเริ่มทำงาน

---

## สถานะปัจจุบัน (Phase 1-2 เสร็จแล้ว)

### เทคโนโลยีที่ใช้
- **Frontend**: Next.js 16 + React + Tailwind CSS + Recharts
- **Backend**: Supabase (PostgreSQL)
- **Deployment**: Vercel (auto-deploy จาก GitHub `Akkadate/studentcare`)
- **PDF**: jsPDF + jspdf-autotable + ฟอนต์ Sarabun (embedded base64)
- **Project Path**: `d:\coding\Antigavity\AgentManager\student-monitoring`

### ตารางในฐานข้อมูลปัจจุบัน
1. **`attendance_records`** — ข้อมูลดิบ (per student × per course)
2. **`student_analytics`** — ข้อมูลสรุป (per student, คำนวณค่าเฉลี่ย + risk level)

### CSV เดิม (6 คอลัมน์)
```
COURSECODE, REVISIONCODE, SECTION, STUDYCODE, STUDENTCODE, CLASSCHECK
```

### หน้าที่มีอยู่แล้ว
- `/dashboard` — หน้าหลัก (สรุป + navigation)
- `/dashboard/students` — รายชื่อนักศึกษา + popup วิชาเสี่ยง
- `/dashboard/courses` — รายวิชาทั้งหมด
- `/dashboard/charts` — กราฟ Pie/Bar/Histogram (Recharts)
- `/dashboard/reports` — สร้าง PDF รายงาน (jsPDF + Sarabun)
- `/dashboard/manual` — คู่มือระบบ

### API Endpoints ที่มี
- `/api/stats` — สรุปภาพรวม
- `/api/students` — ข้อมูลนักศึกษา (filter by riskLevel, minAbsenceRate)
- `/api/courses` — ข้อมูลรายวิชา
- `/api/student-courses` — วิชาเสี่ยงของนักศึกษาเฉพาะราย
- `/api/charts` — ข้อมูลสำหรับกราฟ

### ไฟล์สำคัญ
- `scripts/import-csv.ts` — import CSV เข้า Supabase
- `lib/analytics.ts` — ฟังก์ชัน calculateStudentRisk()
- `lib/types.ts` — TypeScript types
- `lib/supabase.ts` — Supabase client
- `lib/sarabun-font.ts` — ฟอนต์ Sarabun base64

### เกณฑ์ Risk Level
| ระดับ | ค่า avg_absence_rate | สี |
|-------|---------------------|-----|
| วิกฤต (critical) | ≥ 40% | แดง |
| เฝ้าระวัง (monitor) | 20-39% | ส้ม |
| ติดตาม (follow_up) | 10-19% | น้ำเงิน |
| ปกติ (normal) | < 10% | เขียว |

---

## CSV เวอร์ชันใหม่ (15 คอลัมน์)

ดูรายละเอียดใน **DATA_SPECIFICATION.md**

```
STUDENTCODE,STUDENT_NAME,FACULTY,DEPARTMENT,YEAR_LEVEL,ADVISOR_NAME,
COURSECODE,COURSE_NAME,SECTION,INSTRUCTOR,SEMESTER,STUDYCODE,
CLASSCHECK,GPA,COURSE_GRADE
```

---

## สิ่งที่ต้องทำเมื่อข้อมูลพร้อม

### 1. อัปเดต Database Schema

#### ตาราง `attendance_records` — เพิ่มคอลัมน์
```sql
ALTER TABLE attendance_records ADD COLUMN student_name TEXT;
ALTER TABLE attendance_records ADD COLUMN faculty TEXT;
ALTER TABLE attendance_records ADD COLUMN department TEXT;
ALTER TABLE attendance_records ADD COLUMN year_level INTEGER;
ALTER TABLE attendance_records ADD COLUMN advisor_name TEXT;
ALTER TABLE attendance_records ADD COLUMN course_name TEXT;
ALTER TABLE attendance_records ADD COLUMN instructor TEXT;
ALTER TABLE attendance_records ADD COLUMN semester TEXT;
ALTER TABLE attendance_records ADD COLUMN gpa REAL;
ALTER TABLE attendance_records ADD COLUMN course_grade TEXT;
```

#### ตาราง `student_analytics` — เพิ่มคอลัมน์
```sql
ALTER TABLE student_analytics ADD COLUMN student_name TEXT;
ALTER TABLE student_analytics ADD COLUMN faculty TEXT;
ALTER TABLE student_analytics ADD COLUMN department TEXT;
ALTER TABLE student_analytics ADD COLUMN year_level INTEGER;
ALTER TABLE student_analytics ADD COLUMN advisor_name TEXT;
ALTER TABLE student_analytics ADD COLUMN gpa REAL;
```

### 2. อัปเดต Import Script (`scripts/import-csv.ts`)

#### แก้ไข CSV parsing ให้รองรับคอลัมน์ใหม่
- เปลี่ยน interface `CSVRow` เพิ่ม fields ใหม่
- อัปเดต `parseCSV()` ให้อ่านคอลัมน์ใหม่
- อัปเดต `insertAttendanceRecords()` ให้เขียนคอลัมน์ใหม่
- อัปเดต `generateStudentAnalytics()` ให้รวมข้อมูลนักศึกษา (name, faculty, etc.)

#### ข้อควรระวัง
- CLASSCHECK อยู่ใน double quotes เพราะมี comma → parser ต้องจัดการ (ตอนนี้จัดการอยู่แล้ว)
- ชื่อ-นามสกุล/วิชาที่มี comma ต้องครอบด้วย double quotes
- GPA อาจเป็นค่าว่าง → ใช้ null

### 3. อัปเดต TypeScript Types (`lib/types.ts`)

```typescript
// เพิ่มใน AttendanceRecord
student_name?: string;
faculty?: string;
department?: string;
year_level?: number;
advisor_name?: string;
course_name?: string;
instructor?: string;
semester?: string;
gpa?: number;
course_grade?: string;

// เพิ่มใน StudentAnalytics
student_name?: string;
faculty?: string;
department?: string;
year_level?: number;
advisor_name?: string;
gpa?: number;
```

### 4. อัปเดตหน้า Dashboard + API

#### `/dashboard/students` (หน้ารายชื่อ)
- แสดงชื่อจริงแทนแค่รหัส
- เพิ่มคอลัมน์: คณะ, สาขา, ชั้นปี
- เพิ่ม filter: กรองตามคณะ, ชั้นปี
- เพิ่ม GPA ในตาราง

#### `/dashboard/courses` (หน้ารายวิชา)
- แสดงชื่อวิชาเต็มแทนรหัส
- เพิ่มคอลัมน์: อาจารย์ผู้สอน
- เพิ่ม filter: กรองตามอาจารย์

#### `/dashboard` (หน้าหลัก)
- เพิ่มสรุปจำนวนตามคณะ
- เพิ่ม filter เทอม (ถ้ามีหลายเทอม)

#### `/api/students`
- เพิ่ม filter: faculty, department, year_level, advisor
- return ข้อมูล student_name, faculty ใน response

#### `/api/courses`
- เพิ่ม filter: instructor
- return ข้อมูล course_name, instructor

### 5. ฟีเจอร์ใหม่

#### 5.1 กราฟ/วิเคราะห์ใหม่ (`/dashboard/charts`)
- **Pie Chart ตามคณะ** — สัดส่วนนักศึกษาเสี่ยงแต่ละคณะ
- **Bar Chart ตามชั้นปี** — เปรียบเทียบ % ขาดเรียนปี 1-4
- **Scatter Plot GPA vs ขาดเรียน** — ความสัมพันธ์ GPA กับ absence rate
- **Trend ข้ามเทอม** — Line chart เปรียบเทียบหลายเทอม (ถ้ามีข้อมูล)

#### 5.2 รายงานตามอาจารย์ที่ปรึกษา (หน้าใหม่)
- กรองนักศึกษาตามอาจารย์ที่ปรึกษา
- PDF รายงานสำหรับอาจารย์แต่ละคน
- สรุป: จำนวนนักศึกษาทั้งหมด, จำนวนเสี่ยง, รายชื่อเสี่ยง

#### 5.3 PDF Reports อัปเดต
- เพิ่มชื่อจริง + คณะ + GPA ในตาราง PDF
- เพิ่ม PDF สรุปตามคณะ
- เพิ่ม PDF สรุปตามอาจารย์ที่ปรึกษา

### 6. อัปเดตหน้าคู่มือ (`/dashboard/manual`)
- เพิ่มอธิบายคอลัมน์ใหม่ทั้งหมด
- เพิ่มฟีเจอร์ใหม่ที่เพิ่มมา

---

## ขั้นตอนการ Deploy เมื่อพร้อม

```bash
# 1. วาง CSV ใหม่ที่ root ของ project
# ชื่อไฟล์: studentcheck02.csv (หรือชื่ออื่น)

# 2. อัปเดต import script + run
npx ts-node scripts/import-csv.ts studentcheck02.csv

# 3. Build + test locally
npm run dev

# 4. Push to GitHub (auto-deploy to Vercel)
git add .
git commit -m "Phase 3: Enhanced data with student info, faculty, GPA"
git push origin main
```

---

## Environment Variables (ไม่เปลี่ยนแปลง)
```
NEXT_PUBLIC_SUPABASE_URL=<Supabase URL>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<Supabase Anon Key>
```

---

## หมายเหตุสำหรับ AI Agent

1. **อ่าน DATA_SPECIFICATION.md ก่อน** เพื่อดูรายละเอียดคอลัมน์ CSV
2. **ตรวจสอบ CSV ที่ user ส่งมา** ว่ามีคอลัมน์ครบไหม (อาจไม่ครบ 15 — ปรับตามที่มี)
3. **Backward compatible** — ต้องรองรับ CSV เดิม (6 คอลัมน์) ด้วย ถ้า user ยังไม่มีข้อมูลใหม่
4. **ฟอนต์ Sarabun** — ฝัง base64 อยู่ใน `lib/sarabun-font.ts` แล้ว ใช้ได้เลย
5. **ทดสอบ build** ก่อน push เสมอ: `npx next build`
6. **autoTable import** — ต้องใช้ `import autoTable from 'jspdf-autotable'` แล้วเรียก `autoTable(doc, {...})` ห้ามใช้ `doc.autoTable()`
7. **Recharts types** — ใช้ `any` type สำหรับ Tooltip formatter เพื่อหลีกเลี่ยง TS errors
