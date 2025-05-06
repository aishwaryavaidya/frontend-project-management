'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { toast } from 'sonner';
import { ROLES, type Role } from "@/lib/utils/roles";
import { fetchWithError } from "@/lib/utils/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Search, Save, AlertCircle } from 'lucide-react';
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
  const { theme } = useTheme();
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
      <div className="flex items-center justify-center min-h-screen animate-fade-in">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
          <p className="text-lg font-medium text-primary animate-pulse">Loading User Dashboard</p>
        </div>
      </div>
    );
  }


  return (
    <div className="p-8 min-h-screen bg-background text-foreground transition-colors duration-200">
      <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex-1">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
              User Management
            </h1>
            <p className="mt-2 text-muted-foreground">
              Manage organization members and their permissions
            </p>
          </div>
          
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                  <p className="text-2xl font-bold text-primary">{users.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search Section */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="relative">
            <Input
              type="text"
              placeholder="Search by name..."
              value={nameSearch}
              onChange={(e) => setNameSearch(e.target.value)}
              className="w-full transition-all"
            />
            {nameSearch && (
              <div className="absolute z-10 mt-2 w-full bg-popover border rounded-lg shadow-lg animate-scale-in">
                {getSuggestions('name').map(user => (
                  <div
                    key={user.id}
                    className="p-3 hover:bg-muted cursor-pointer transition-colors"
                    onClick={() => setNameSearch(`${user.firstName} ${user.lastName}`)}
                  >
                    {user.firstName} {user.lastName}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="relative">
            <Input
              type="text"
              placeholder="Search by employee ID..."
              value={empIdSearch}
              onChange={(e) => setEmpIdSearch(e.target.value)}
              className="w-full transition-all"
            />
            {empIdSearch && (
              <div className="absolute z-10 mt-2 w-full bg-popover border rounded-lg shadow-lg animate-scale-in">
                {getSuggestions('empId').map(user => (
                  <div
                    key={user.id}
                    className="p-3 hover:bg-muted cursor-pointer transition-colors"
                    onClick={() => setEmpIdSearch(user.employeeId)}
                  >
                    {user.employeeId}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Save Changes Button */}
        {Object.keys(changes).length > 0 && (
          <div className="flex justify-end animate-slide-in">
            <Button
              onClick={saveChanges}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Changes
              <span className="ml-2 bg-white/20 px-2 py-1 rounded-md text-sm">
                {Object.keys(changes).length}
              </span>
            </Button>
          </div>
        )}

        {/* Table Section */}
        <Card className="overflow-hidden border-border/50 backdrop-blur-sm">
          <CardContent className="p-0">
            {error ? (
              <div className="p-4 bg-destructive/10 border-l-4 border-destructive m-4 rounded-lg animate-shake">
                <div className="flex items-center gap-3 text-destructive">
                  <AlertCircle className="w-5 h-5" />
                  <span>{error}</span>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="py-5 px-4 text-left font-medium text-muted-foreground">User</th>
                      <th className="py-5 px-4 text-left font-medium text-muted-foreground">ID</th>
                      <th className="py-5 px-4 text-left font-medium text-muted-foreground">Employee ID</th>
                      <th className="py-5 px-4 text-left font-medium text-muted-foreground">Current Role</th>
                      <th className="py-5 px-4 text-left font-medium text-muted-foreground">New Role</th>
                    </tr>
                  </thead>
                  
                  <tbody>
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className="border-t border-border/50 hover:bg-muted/50 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                              <span className="text-sm font-medium">
                                {user.firstName[0]}{user.lastName[0]}
                              </span>
                            </div>
                            <div>
                              <div className="font-medium">
                                {user.firstName} {user.lastName}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {user.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 font-mono text-sm text-muted-foreground">{user.id}</td>
                        <td className="p-4">{user.employeeId}</td>
                        <td className="p-4">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            user.role === 'ADMIN' 
                              ? 'bg-blue-500/10 text-blue-500'
                              : 'bg-purple-500/10 text-purple-500'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <Select
                              value={changes[user.id] || user.role}
                              onValueChange={(value) => handleRoleChange(user.id, value as Role)}
                            >
                              <SelectTrigger className="w-40">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {Object.values(ROLES).map(role => (
                                  <SelectItem key={role} value={role}>
                                    {role}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {changes[user.id] && (
                              <span className="text-xs text-primary animate-pulse">* Pending</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}