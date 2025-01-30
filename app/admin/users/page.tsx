'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ROLES, type Role } from "@/lib/utils/roles";
import { fetchWithError } from "@/lib/utils/api";

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  employeeId: string;
  role: Role;
  phoneNumber?: string;
  updatedAt: Date
  createdAt: Date
}

export default function AdminUsersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nameSearch, setNameSearch] = useState('');
  const [empIdSearch, setEmpIdSearch] = useState('');
  const [changes, setChanges] = useState<Record<string, Role>>({});

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session || session.user.role !== ROLES.ADMIN) {
      router.push('/unauthorized');
      return;
    }

    fetchUsers();
  }, [session, status, router]);

  useEffect(() => {
    const filtered = users.filter(user => {
      const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
      const matchesName = fullName.includes(nameSearch.toLowerCase());
      const matchesEmpId = user.employeeId.includes(empIdSearch);
      return matchesName && matchesEmpId;
    });
    setFilteredUsers(filtered);
  }, [nameSearch, empIdSearch, users]);

  const fetchUsers = async () => {
    try {
      setError(null);
      const data = await fetchWithError('/api/admin/users');
      setUsers(data);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch users';
      setError(errorMessage);
      toast.error('Error Fetching Users', { description: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = (userId: string, newRole: Role) => {
    setChanges(prev => ({ ...prev, [userId]: newRole }));
  };

  const saveChanges = async () => {
    try {
      if (Object.keys(changes).length === 0) {
        toast.info('No changes to save');
        return;
      }

      const response = await fetchWithError('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ changes }),
      });

      if (response.updatedCount > 0) {
        toast.success('Changes Saved', {
          description: `${response.updatedCount} roles updated successfully. Affected users will be logged out.`
        });
        setChanges({});
        fetchUsers();
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save changes';
      toast.error('Save Failed', { description: errorMessage });
    }
  };

  const getSuggestions = (type: 'name' | 'empId') => {
    const searchTerm = type === 'name' ? nameSearch : empIdSearch;
    if (!searchTerm) return [];

    return users
      .filter(user => {
        if (type === 'name') {
          const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
          return fullName.includes(searchTerm.toLowerCase());
        }
        return user.employeeId.includes(searchTerm);
      })
      .slice(0, 5);
  };

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-base-100">
        <div className="flex flex-col items-center gap-4">
          <span className="loading loading-infinity loading-lg text-primary"></span>
          <p className="text-lg font-medium text-primary">Loading User Dashboard</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-slate-100 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div className="flex-1">
            <h1 className="text-4xl font-bold text-primary">User Management</h1>
            <p className="mt-2 text-blue-500">Manage organization members and their permissions</p>
          </div>
          
          <div className="stats shadow bg-neutral-300">
            <div className="stat">
              <div className="stat-title text-primary">Total Users</div>
              <div className="stat-value text-blue-600">{users.length}</div>
            </div>
          </div>
        </div>

        {/* Search Section */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Search by name..."
              className="input input-bordered w-full text-primary"
              value={nameSearch}
              onChange={(e) => setNameSearch(e.target.value)}
            />
            {nameSearch && (
              <div className="absolute z-10 mt-2 w-full bg-base-200 shadow-lg rounded-box max-h-60 overflow-auto">
                {getSuggestions('name').map(user => (
                  <div
                    key={user.id}
                    className="p-2 hover:bg-base-300 cursor-pointer text-black"
                    onClick={() => {
                      setNameSearch(`${user.firstName} ${user.lastName}`);
                    }}
                  >
                    {user.firstName} {user.lastName}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Search by employee ID..."
              className="input input-bordered w-full text-primary"
              value={empIdSearch}
              onChange={(e) => setEmpIdSearch(e.target.value)}
            />
            {empIdSearch && (
              <div className="absolute z-10 mt-2 w-full bg-base-200 shadow-lg rounded-box max-h-60 overflow-auto">
                {getSuggestions('empId').map(user => (
                  <div
                    key={user.id}
                    className="p-2 hover:bg-base-300 cursor-pointer text-black"
                    onClick={() => setEmpIdSearch(user.employeeId)}
                  >
                    {user.employeeId}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Save Button */}
        {Object.keys(changes).length > 0 && (
          <div className="flex justify-end mb-4">
            <button 
              onClick={saveChanges}
              className="btn btn-primary gap-2"
            >
              Save Changes
              <span className="badge badge-secondary">{Object.keys(changes).length}</span>
            </button>
          </div>
        )}

        {/* Table Section */}
        <div className="card bg-base-200 shadow-xl">
          <div className="card-body p-0">
            {error ? (
              <div className="alert alert-error rounded-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-primary-content">{error}</span>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="table">
                  <thead className="bg-base-300">
                    <tr>
                      <th className="text-lg text-primary">Name</th>
                      <th className="text-lg text-primary">Id</th>
                      <th className="text-lg text-primary">Employee ID</th>
                      <th className="text-lg text-primary">Current Role</th>
                      <th className="text-lg text-primary">New Role</th>
                    </tr>
                  </thead>
                  
                  <tbody>
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-base-300 transition-colors group">
                        <td>
                          <div className="flex items-center space-x-3">
                            <div className="avatar placeholder">
                              <div className="bg-neutral text-neutral-content rounded-full w-12">
                                <span className="text-xl">
                                  {user.firstName[0]}{user.lastName[0]}
                                </span>
                              </div>
                            </div>
                            <div>
                              <div className="font-bold text-black">
                                {user.firstName} {user.lastName}
                              </div>
                              <div className="text-sm text-primary-focus">
                                {user.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="text-black">{user.id}</td>
                        <td className="text-black">{user.employeeId}</td>
                        <td>
                          <span className={`badge badge-lg ${user.role === 'ADMIN' ? 'badge-primary' : 'badge-secondary'}`}>
                            {user.role}
                          </span>
                        </td>
                        <td>
                          <select 
                            value={changes[user.id] || user.role}
                            onChange={(e) => handleRoleChange(user.id, e.target.value as Role)}
                            className="select select-bordered select-sm w-full max-w-xs bg-base-100 text-primary"
                          >
                            {Object.values(ROLES).map(role => (
                              <option key={role} value={role}>{role}</option>
                            ))}
                          </select>
                          {changes[user.id] && (
                            <span className="text-xs text-accent ml-2">* Unsaved</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}