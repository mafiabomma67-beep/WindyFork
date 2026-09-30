import random
import sys
from dataclasses import dataclass, field
from datetime import datetime
from typing import List, Dict

# ==========================================
# CONFIGURATION & CONSTANTS
# ==========================================
MIN_ATTENDANCE_RATE = 0.70  # Japan law: students must attend at least 70% of classes
JAPAN_SUBJECTS = ["Mathematics (数学)", "English (英語)", "Japanese (国語)", "Science (理科)", "Social Studies (社会)"]

# ==========================================
# DATA MODELS
# ==========================================
@dataclass
class Student:
    student_id: str
    name: str
    attendance_count: int
    total_classes: int
    grades: Dict[str, int] = field(default_factory=dict)
    
    @property
    def attendance_rate(self) -> float:
        if self.total_classes == 0:
            return 0.0
        return self.attendance_count / self.total_classes

    def calculate_japanese_grade(self, subject: str) -> str:
        """Converts raw scores into the standard Japanese 5-scale (評定)."""
        score = self.grades.get(subject, 0)
        if score >= 90: return "5 (Excellent / 秀)"
        elif score >= 80: return "4 (Good / 優)"
        elif score >= 70: return "3 (Average / 良)"
        elif score >= 60: return "2 (Passing / 可)"
        else: return "1 (Failing / 不可)"

# ==========================================
# SYSTEM CORE LOGIC
# ==========================================
class SchoolManagementSystem:
    def __init__(self, school_name: str):
        self.school_name = school_name
        self.students: List[Student] = []
        self.total_term_classes = 45 # Standard classes per semester

    def generate_random_mock_data(self, count: int = 10):
        """Generates random data for testing."""
        first_names = ["Hiroshi", "Takashi", "Kenji", "Yuki", "Sakura", "Ren", "Mei", "Aoi", "Yuto", "Haruki"]
        last_names = ["Sato", "Suzuki", "Takahashi", "Tanaka", "Watanabe", "Ito", "Nakamura", "Kobayashi", "Kato"]
        
        for i in range(1, count + 1):
            student_id = f"2026-JP{i:03d}"
            name = f"{random.choice(last_names)} {random.choice(first_names)}"
            
            # Generate random attendance (some students might skip too many classes)
            attendance = random.randint(28, 45) 
            
            # Generate random grades for Japanese subjects
            grades = {subject: random.randint(45, 100) for subject in JAPAN_SUBJECTS}
            
            student = Student(
                student_id=student_id,
                name=name,
                attendance_count=attendance,
                total_classes=self.total_term_classes,
                grades=grades
            )
            self.students.append(student)

    def run_academic_audit(self):
        """Processes and prints the student performance report."""
        print("=" * 70)
        print(f" OFFICIAL REPORT: {self.school_name.upper()} ")
        print(f" Generated on: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')} ")
        print("=" * 70)
        
        failed_attendance_count = 0
        
        for student in self.students:
            print(f"\n[Student ID: {student.student_id}] Name: {student.name}")
            print(f"-> Attendance: {student.attendance_count}/{student.total_classes} ({student.attendance_rate:.1%})")
            
            # Check legal attendance requirement
            if student.attendance_rate < MIN_ATTENDANCE_RATE:
                print("  ⚠️ ALERT: Repeat Year Risk! Attendance below 70% threshold.")
                failed_attendance_count += 1
            
            print("  Subject Grades:")
            for subject in JAPAN_SUBJECTS:
                score = student.grades[subject]
                jp_scale = student.calculate_japanese_grade(subject)
                print(f"    - {subject:<20}: {score:>3}/100 -> Scale: {jp_scale}")
            print("-" * 50)

        # Summary statistics
        print("\n" + "=" * 70)
        print(" EXECUTIVE SUMMARY")
        print("=" * 70)
        print(f" Total Audited Students     : {len(self.students)}")
        print(f" Red-Flagged for Attendance : {failed_attendance_count} student(s)")
        print(f" System Status              : Processing Complete.")
        print("=" * 70)

# ==========================================
# EXECUTION ENTRY POINT
# ==========================================
if __name__ == "__main__":
    # Initialize the school system
    system = SchoolManagementSystem("Tokyo International Academy")
    
    # 1. Populate the system with random data
    print("Generating randomized data for Japanese registry...")
    system.generate_random_mock_data(count=5)
    
    # 2. Run system reports
    system.run_academic_audit()
