import React, { useState } from 'react';

const RegistrationForm = () => {
  const [formData, setFormData] = useState({
    nationalId: '',
    altIdType: '',
    surname: '',
    firstName: '',
    title: '',
    dob: '',
    homeAddress: '',
    homePostalCode: '',
    homePhone: '',
    postalAddress: '',
    postalCode: '',
    cellPhone: '',
    employer: '',
    workAddress: '',
    workPhone: '',
    fax: '',
    email: '',
    maidenSurname: '',
    kinName: '',
    kinCell: '',
    skillsProgramme: '',
    disability: '',
    signature: '',
    regDate: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Registration submitted successfully!');
  };

  return (
    <form className="max-w-5xl mx-auto p-8 bg-white rounded shadow" onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <input type="text" name="nationalId" value={formData.nationalId} onChange={handleChange} placeholder="National ID No" className="border rounded px-3 py-2" />
        <input type="text" name="altIdType" value={formData.altIdType} onChange={handleChange} placeholder="Alternative ID type" className="border rounded px-3 py-2" />
        <input type="text" name="surname" value={formData.surname} onChange={handleChange} placeholder="Surname" className="border rounded px-3 py-2" />
        <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} placeholder="First name" className="border rounded px-3 py-2" />
        <input type="text" name="title" value={formData.title} onChange={handleChange} placeholder="Title" className="border rounded px-3 py-2" />
        <input type="date" name="dob" value={formData.dob} onChange={handleChange} placeholder="yyyy/mm/dd" className="border rounded px-3 py-2" />
        <input type="text" name="homeAddress" value={formData.homeAddress} onChange={handleChange} placeholder="Home address" className="border rounded px-3 py-2" />
        <input type="text" name="homePostalCode" value={formData.homePostalCode} onChange={handleChange} placeholder="Home postal code" className="border rounded px-3 py-2" />
        <input type="text" name="homePhone" value={formData.homePhone} onChange={handleChange} placeholder="Home phone number" className="border rounded px-3 py-2" />
        <input type="text" name="postalAddress" value={formData.postalAddress} onChange={handleChange} placeholder="Postal address" className="border rounded px-3 py-2" />
        <input type="text" name="postalCode" value={formData.postalCode} onChange={handleChange} placeholder="Postal code" className="border rounded px-3 py-2" />
        <input type="text" name="cellPhone" value={formData.cellPhone} onChange={handleChange} placeholder="Cell phone number" className="border rounded px-3 py-2" />
        <input type="text" name="employer" value={formData.employer} onChange={handleChange} placeholder="Name of employer" className="border rounded px-3 py-2" />
        <input type="text" name="workAddress" value={formData.workAddress} onChange={handleChange} placeholder="Work address" className="border rounded px-3 py-2" />
        <input type="text" name="workPhone" value={formData.workPhone} onChange={handleChange} placeholder="Work phone number" className="border rounded px-3 py-2" />
        <input type="text" name="fax" value={formData.fax} onChange={handleChange} placeholder="Fax number" className="border rounded px-3 py-2" />
        <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Email address" className="border rounded px-3 py-2" />
        <input type="text" name="maidenSurname" value={formData.maidenSurname} onChange={handleChange} placeholder="Maiden surname" className="border rounded px-3 py-2" />
        <input type="text" name="kinName" value={formData.kinName} onChange={handleChange} placeholder="Next of kin name" className="border rounded px-3 py-2" />
        <input type="text" name="kinCell" value={formData.kinCell} onChange={handleChange} placeholder="Next of kin cell number" className="border rounded px-3 py-2" />
        <input type="text" name="skillsProgramme" value={formData.skillsProgramme} onChange={handleChange} placeholder="Skills Programme" className="border rounded px-3 py-2" />
      </div>
      <textarea name="disability" value={formData.disability} onChange={handleChange} placeholder="Specify disability if applicable" className="border rounded px-3 py-2 w-full mb-4" rows={2} />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end mb-4">
        <div className="flex flex-col">
          <label className="font-semibold mb-1">Signature:</label>
          <input type="text" name="signature" value={formData.signature} onChange={handleChange} className="border rounded px-3 py-2" />
        </div>
        <div className="flex flex-col">
          <label className="font-semibold mb-1">Date:</label>
          <input type="date" name="regDate" value={formData.regDate} onChange={handleChange} className="border rounded px-3 py-2" />
        </div>
      </div>
      <button type="submit" className="bg-blue-600 text-white font-bold py-2 px-6 rounded hover:bg-blue-700 transition">Submit</button>
    </form>
  );
};

export default RegistrationForm;
