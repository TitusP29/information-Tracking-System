// FeesManagement.jsx
import React, { useState } from "react";
import { Dialog } from "@headlessui/react";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";

const defaultFees = {
  registration: { label: "Registration Fee", amount: 2799.84 },
  skills: { label: "Skills Program", amount: 5598.72 },
  assessment: { label: "PoEs Assessment", amount: 300.00 },
  internal: { label: "Internal Moderation", amount: 300.00 },
  external: { label: "External Moderation", amount: 300.00 },
  certification: { label: "Certification", amount: 124.80 },
  results: { label: "Statement of Results", amount: 124.80 },
  final: { label: "Final Assessment", amount: 936.00 },
};

const FeesManagement = () => {
  const [fees, setFees] = useState(defaultFees);
  const [students, setStudents] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [filter, setFilter] = useState("");
  const [newStudent, setNewStudent] = useState({ name: "", id: "", paid: "" });

  const calculateTotal = () =>
    Object.values(fees).reduce((total, fee) => total + fee.amount, 0);

  const handleAddStudent = () => {
    const total = calculateTotal();
    const paid = parseFloat(newStudent.paid);
    const owed = total - paid;
    setStudents([...students, { ...newStudent, paid, owed }]);
    setNewStudent({ name: "", id: "", paid: "" });
  };

  const generatePDF = (student) => {
    const doc = new jsPDF();
    doc.text("Student Fee Invoice", 20, 20);
    doc.text(`Name: ${student.name}`, 20, 30);
    doc.text(`Student ID: ${student.id}`, 20, 40);
    doc.text(`Total Fee: R${calculateTotal().toFixed(2)}`, 20, 50);
    doc.text(`Amount Paid: R${student.paid.toFixed(2)}`, 20, 60);
    doc.text(`Amount Owed: R${student.owed.toFixed(2)}`, 20, 70);
    doc.save(`${student.name.replace(/\s/g, "_")}_invoice.pdf`);
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Fees Management</h1>
        <button onClick={() => setModalOpen(true)} className="bg-purple-600 text-white px-4 py-2 rounded">Update Fees</button>
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by name or ID"
          className="border px-4 py-2 w-full max-w-md rounded"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
      </div>

      <div className="bg-white rounded p-4 shadow mb-6">
        <h2 className="text-lg font-semibold mb-4">Add Student Payment</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <input value={newStudent.name} onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })} placeholder="Name" className="border px-3 py-2 rounded" />
          <input value={newStudent.id} onChange={(e) => setNewStudent({ ...newStudent, id: e.target.value })} placeholder="Student ID" className="border px-3 py-2 rounded" />
          <input type="number" value={newStudent.paid} onChange={(e) => setNewStudent({ ...newStudent, paid: e.target.value })} placeholder="Amount Paid" className="border px-3 py-2 rounded" />
        </div>
        <button onClick={handleAddStudent} className="mt-4 bg-green-600 text-white px-4 py-2 rounded">Add Student</button>
      </div>

      <div className="bg-white rounded p-4 shadow">
        <h2 className="text-lg font-semibold mb-4">Student Balances</h2>
        <table className="w-full text-sm">
          <thead className="bg-gray-200">
            <tr>
              <th className="text-left p-2">Name</th>
              <th className="text-left p-2">ID</th>
              <th className="text-left p-2">Paid</th>
              <th className="text-left p-2">Owed</th>
              <th className="text-left p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {students
              .filter((s) => s.name.toLowerCase().includes(filter.toLowerCase()) || s.id.toLowerCase().includes(filter.toLowerCase()))
              .map((student, index) => (
                <tr key={index} className="border-t">
                  <td className="p-2">{student.name}</td>
                  <td className="p-2">{student.id}</td>
                  <td className="p-2 text-green-600">R{student.paid.toFixed(2)}</td>
                  <td className="p-2 text-red-600">R{student.owed.toFixed(2)}</td>
                  <td className="p-2">
                    <button onClick={() => generatePDF(student)} className="text-blue-600 hover:underline">Download PDF</button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* Modal for updating fee structure */}
      <Dialog open={modalOpen} onClose={() => setModalOpen(false)} className="fixed z-10 inset-0 overflow-y-auto">
        <div className="fixed inset-0 bg-black bg-opacity-25" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="bg-white p-6 rounded shadow-lg max-w-xl w-full relative">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
              aria-label="Close modal"
            >
              ✕
            </button>
            <Dialog.Title className="text-xl font-bold mb-4">Update Fee Structure</Dialog.Title>
            <div className="max-h-[70vh] overflow-y-auto">
              <div className="space-y-4">
                {Object.entries(fees).map(([key, fee]) => (
                  <div key={key}>
                    <label className="block font-medium mb-1">{fee.label}</label>
                    <input
                      type="number"
                      value={fee.amount}
                      onChange={(e) =>
                        setFees({
                          ...fees,
                          [key]: { ...fee, amount: parseFloat(e.target.value) },
                        })
                      }
                      className="border px-3 py-2 rounded w-full"
                    />
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-4">
              <button onClick={() => setModalOpen(false)} className="px-4 py-2 bg-gray-300 rounded">Cancel</button>
              <button onClick={() => setModalOpen(false)} className="px-4 py-2 bg-purple-600 text-white rounded">Save</button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
};

export default FeesManagement;