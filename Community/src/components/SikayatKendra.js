import React, { useState } from 'react';

const SikayatKendra = () => {
  const [supportMessage, setSupportMessage] = useState('');
  const [contactDetails, setContactDetails] = useState({ name: '', location: '', mobile: '', email: '' });

  const [requestsList, setRequestsList] = useState([
    {
      id: 1,
      name: 'Anita Sharma',
      location: 'Pune',
      complaint: 'Need help booking an appointment with a cardiologist.',
      status: 'Pending'
    },
    {
      id: 2,
      name: 'Rajeev Menon',
      location: 'Chennai',
      complaint: 'Unable to access lab results on the portal.',
      status: 'Resolved'
    },
    {
      id: 3,
      name: 'Sneha Verma',
      location: 'Delhi',
      complaint: 'Issue with vaccine certificate not updating.',
      status: 'Pending'
    }
  ]);

  const handleSupportMessageChange = (e) => setSupportMessage(e.target.value);

  const handleContactChange = (e) => {
    const { name, value } = e.target;
    setContactDetails((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmitRequest = (e) => {
    e.preventDefault();
    const { name, location, mobile, email } = contactDetails;

    if (supportMessage && name && location && mobile && email) {
      const newRequest = {
        id: requestsList.length + 1,
        name,
        location,
        complaint: supportMessage,
        status: 'Pending'
      };
      setRequestsList([newRequest, ...requestsList]);
      setSupportMessage('');
      setContactDetails({ name: '', location: '', mobile: '', email: '' });
      alert('Your support request has been recorded and will be solved ASAP!');
    } else {
      alert('Please fill in all fields.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:py-24">
      <h1 className="text-4xl font-bold text-center text-blue-700 mb-8">
        Health Community Support Centre
      </h1>
      <div className="flex flex-col lg:flex-row gap-8 max-w-6xl mx-auto">
        {/* Left: Support Form */}
        <div className="flex-1 bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-2xl font-semibold text-blue-600 mb-4">Submit Your Request</h2>
          <form onSubmit={handleSubmitRequest} className="space-y-4">
            <textarea
              value={supportMessage}
              onChange={handleSupportMessageChange}
              placeholder="Describe your issue..."
              className="w-full border border-gray-300 rounded-lg p-4"
              rows={4}
              required
            />
            <input
              type="text"
              name="name"
              value={contactDetails.name}
              onChange={handleContactChange}
              placeholder="Your Name"
              className="w-full border border-gray-300 rounded-lg p-3"
              required
            />
            <input
              type="text"
              name="location"
              value={contactDetails.location}
              onChange={handleContactChange}
              placeholder="Your Location"
              className="w-full border border-gray-300 rounded-lg p-3"
              required
            />
            <input
              type="text"
              name="mobile"
              value={contactDetails.mobile}
              onChange={handleContactChange}
              placeholder="Your Mobile Number"
              className="w-full border border-gray-300 rounded-lg p-3"
              required
            />
            <input
              type="email"
              name="email"
              value={contactDetails.email}
              onChange={handleContactChange}
              placeholder="Your Email"
              className="w-full border border-gray-300 rounded-lg p-3"
              required
            />
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition"
            >
              Submit Request
            </button>
          </form>
        </div>

        {/* Right: Support Requests List */}
        <div className="flex-1 bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-2xl font-semibold text-blue-600 mb-4">Existing Requests</h2>
          <ul className="space-y-4 max-h-[600px] overflow-auto">
            {requestsList.map((req) => (
              <li key={req.id} className="border p-4 rounded-lg shadow-sm">
                <p className="font-semibold text-lg text-gray-800">{req.name} ({req.location})</p>
                <p className="text-gray-600">{req.complaint}</p>
                <p
                  className={`text-sm font-medium mt-2 ${
                    req.status === 'Resolved' ? 'text-green-600' : 'text-yellow-600'
                  }`}
                >
                  Status: {req.status}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SikayatKendra;
