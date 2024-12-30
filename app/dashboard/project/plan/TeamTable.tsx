import React from 'react';

interface TeamMember {
  designation: string;
  count: number;
}

const teamData: TeamMember[] = [
  { designation: 'PM', count: 1 },
  { designation: 'SA', count: 1 },
  { designation: 'FC', count: 2 },
  { designation: 'TC', count: 4 },
  { designation: 'SE', count: 2 },
];

const TeamTable = () => {
  return (
    <div className="p-4 border border-gray-300 rounded-lg shadow-lg">
      <h2 className="text-lg font-semibold mb-3">Team Info</h2>
      <table className="min-w-full table-auto text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-2 py-1 text-left font-medium text-gray-700">Role</th>
            <th className="px-2 py-1 text-left font-medium text-gray-700">Count</th>
          </tr>
        </thead>
        <tbody>
          {teamData.map((member, index) => (
            <tr key={index} className="hover:bg-gray-50">
              <td className="px-2 py-1 border-b text-gray-800">{member.designation}</td>
              <td className="px-2 py-1 border-b text-gray-800">{member.count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TeamTable;
