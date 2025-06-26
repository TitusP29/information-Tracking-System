import React, { useState } from "react";

const courses = [
  "Project Manager",
  "Renewable Energy Workshop Assistance",
  "New Venture Creation",
  "Energy Efficiency Technician",
  "Solar Technician",
];

const CourseGrades = () => {
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [studentName, setStudentName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [grade, setGrade] = useState("");
  const [comment, setComment] = useState("");
  const [courseData, setCourseData] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [gradeFilter, setGradeFilter] = useState("All");
  const [isEditing, setIsEditing] = useState(false);
  const [editIndex, setEditIndex] = useState(null);

  const handleCourseClick = (course) => {
    setSelectedCourse(course);
    clearForm();
  };

  const clearForm = () => {
    setStudentName("");
    setStudentId("");
    setGrade("");
    setComment("");
    setIsEditing(false);
    setEditIndex(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newEntry = {
      name: studentName.trim(),
      studentId: studentId.trim(),
      grade: parseInt(grade, 10),
      comment: comment.trim(),
    };

    setCourseData((prevData) => {
      const list = prevData[selectedCourse] || [];

      if (isEditing) {
        list[editIndex] = newEntry;
      } else {
        list.push(newEntry);
      }

      return { ...prevData, [selectedCourse]: [...list] };
    });

    clearForm();
  };

  const handleEdit = (index, student) => {
    setIsEditing(true);
    setEditIndex(index);
    setStudentName(student.name);
    setStudentId(student.studentId);
    setGrade(student.grade);
    setComment(student.comment);
  };

  const handleDelete = (index) => {
    setCourseData((prevData) => {
      const list = prevData[selectedCourse] || [];
      list.splice(index, 1);
      return { ...prevData, [selectedCourse]: [...list] };
    });
    clearForm();
  };

  const getStatus = (grade) => (grade >= 50 ? "Pass" : "Fail");

  const getStatusClass = (grade) =>
    grade >= 50 ? "text-green-600 font-semibold" : "text-red-600 font-semibold";

  const calculateCourseAverage = (grades) => {
    if (grades.length === 0) return 0;
    const sum = grades.reduce((acc, curr) => acc + curr.grade, 0);
    return (sum / grades.length).toFixed(2);
  };

  const calculateStudentOverallAverage = (studentId) => {
    let total = 0;
    let count = 0;
    Object.values(courseData).forEach((students) => {
      students.forEach((s) => {
        if (s.studentId.toLowerCase() === studentId.toLowerCase()) {
          total += s.grade;
          count++;
        }
      });
    });
    return count > 0 ? (total / count).toFixed(2) : "-";
  };

  const applyFilters = (students) => {
    return students.filter((student) => {
      const matchesName = student.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter =
        gradeFilter === "All"
          ? true
          : gradeFilter === "Pass"
          ? student.grade >= 50
          : student.grade < 50;
      return matchesName && matchesFilter;
    });
  };

  return (
    <div className="p-8 min-h-screen bg-gray-100">
      <h1 className="text-3xl font-bold mb-6">Course Grades</h1>

      {/* Course Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        {courses.map((course) => (
          <div
            key={course}
            className={`cursor-pointer bg-white rounded-lg p-6 shadow hover:bg-purple-50 border ${
              selectedCourse === course ? "border-purple-500" : ""
            }`}
            onClick={() => handleCourseClick(course)}
          >
            <h2 className="text-xl font-semibold text-purple-700">{course}</h2>
            <p className="text-gray-500 mt-1">Click to enter student grades</p>
          </div>
        ))}
      </div>

      {/* Grade Form */}
      {selectedCourse && (
        <div className="bg-white p-6 rounded shadow mb-8 max-w-xl">
          <h2 className="text-xl font-bold text-purple-700 mb-4">
            {isEditing ? "Edit Grade" : "Add Grade"} for {selectedCourse}
          </h2>
          <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
            <input
              type="text"
              placeholder="Student Name"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              required
              className="border rounded px-4 py-2"
            />
            <input
              type="text"
              placeholder="Student Number"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              required
              className="border rounded px-4 py-2"
            />
            <input
              type="number"
              placeholder="Grade (0-100)"
              min={0}
              max={100}
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              required
              className="border rounded px-4 py-2"
            />
            <textarea
              placeholder="Comment / Feedback"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="border rounded px-4 py-2"
            />
            <div className="flex gap-4">
              <button
                type="submit"
                className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
              >
                {isEditing ? "Update" : "Save Grade"}
              </button>
              {isEditing && (
                <button
                  type="button"
                  onClick={clearForm}
                  className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      {/* Filters */}
      {Object.keys(courseData).length > 0 && (
        <div className="bg-white p-4 rounded shadow mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <input
            type="text"
            placeholder="Search by name..."
            className="border px-3 py-2 rounded w-full sm:w-1/3"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            className="border px-3 py-2 rounded"
            value={gradeFilter}
            onChange={(e) => setGradeFilter(e.target.value)}
          >
            <option value="All">All Grades</option>
            <option value="Pass">Pass Only</option>
            <option value="Fail">Fail Only</option>
          </select>
        </div>
      )}

      {/* Grade Tables */}
      {Object.entries(courseData).map(([course, students]) => {
        const filteredStudents = applyFilters(students);
        if (filteredStudents.length === 0) return null;

        return (
          <div key={course} className="bg-white p-6 rounded shadow mb-6">
            <h3 className="text-lg font-semibold text-purple-700 mb-2">{course}</h3>
            <table className="w-full border text-sm mb-2">
              <thead className="bg-gray-200">
                <tr>
                  <th className="px-4 py-2 text-left">Name</th>
                  <th className="px-4 py-2 text-left">Student #</th>
                  <th className="px-4 py-2 text-left">Grade</th>
                  <th className="px-4 py-2 text-left">Status</th>
                  <th className="px-4 py-2 text-left">Comment</th>
                  <th className="px-4 py-2 text-left">Overall Avg</th>
                  <th className="px-4 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student, index) => (
                  <tr key={index} className="border-t">
                    <td className="px-4 py-2">{student.name}</td>
                    <td className="px-4 py-2">{student.studentId}</td>
                    <td className="px-4 py-2">{student.grade}</td>
                    <td className="px-4 py-2">
                      <span className={getStatusClass(student.grade)}>
                        {getStatus(student.grade)}
                      </span>
                    </td>
                    <td className="px-4 py-2">{student.comment || "-"}</td>
                    <td className="px-4 py-2 text-purple-600 font-medium">
                      {calculateStudentOverallAverage(student.studentId)}
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setSelectedCourse(course);
                            handleEdit(index, student);
                          }}
                          className="text-blue-600 hover:underline"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            setSelectedCourse(course);
                            handleDelete(index);
                          }}
                          className="text-red-600 hover:underline"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="text-sm text-gray-700 font-medium">
              📊 Course Average:{" "}
              <span className="text-purple-700 font-semibold">
                {calculateCourseAverage(filteredStudents)}
              </span>
            </p>
          </div>
        );
      })}
    </div>
  );
};

export default CourseGrades;
