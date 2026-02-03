import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import * as Dialog from '@radix-ui/react-dialog';
import { useRouter } from 'next/router';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowUpDown,
  Search,
  Plus,
  Edit2,
  Trash2,
  Eye
} from 'lucide-react';

// Types
interface User {
  id: string;
  email: string;
  role: 'admin' | 'user';
}

interface UserListResponse {
  users: User[];
  total: number;
  page: number;
  pageSize: number;
}

// API client import (assumed)
import { api } from '@/lib/api';

const PAGE_SIZES = [10, 25, 50, 100];

export default function UserList() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<keyof User>('email');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);

  const { data, isLoading, isError, error, refetch } = useQuery<UserListResponse>({
    queryKey: ['users', page, pageSize, searchTerm, sortField, sortDirection],
    queryFn: () => api.users.list({
      page,
      pageSize,
      search: searchTerm,
      sort: sortField,
      order: sortDirection
    })
  });

  const handleSort = (field: keyof User) => {
    if (field === sortField) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.users.delete(id);
      refetch();
    } catch (error) {
      console.error('Failed to delete user:', error);
    }
    setDeleteUserId(null);
  };

  if (isLoading) {
    return (
      <div className="w-full h-96 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="w-full h-96 flex flex-col items-center justify-center">
        <p className="text-red-500 mb-4">Error loading users: {(error as Error).message}</p>
        <button
          onClick={() => refetch()}
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!data?.users.length) {
    return (
      <div className="w-full h-96 flex flex-col items-center justify-center">
        <p className="text-gray-500 mb-4">No users found</p>
        <button
          onClick={() => router.push('/users/new')}
          className="flex items-center px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create New User
        </button>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border rounded-md"
          />
        </div>
        <button
          onClick={() => router.push('/users/new')}
          className="flex items-center px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create New User
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-4 py-2 text-left">
                <button
                  onClick={() => handleSort('email')}
                  className="flex items-center"
                >
                  Email
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </button>
              </th>
              <th className="px-4 py-2 text-left">
                <button
                  onClick={() => handleSort('role')}
                  className="flex items-center"
                >
                  Role
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </button>
              </th>
              <th className="px-4 py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.users.map((user) => (
              <tr key={user.id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-2">{user.email}</td>
                <td className="px-4 py-2">
                  <span className={`capitalize ${user.role === 'admin' ? 'text-primary' : ''}`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-4 py-2 text-right space-x-2">
                  <button
                    onClick={() => router.push(`/users/${user.id}`)}
                    className="p-1 text-gray-500 hover:text-gray-700"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => router.push(`/users/${user.id}/edit`)}
                    className="p-1 text-gray-500 hover:text-gray-700"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteUserId(user.id)}
                    className="p-1 text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <select
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
            className="border rounded-md px-2 py-1"
          >
            {PAGE_SIZES.map(size => (
              <option key={size} value={size}>
                {size} per page
              </option>
            ))}
          </select>
          <span className="text-gray-500">
            Showing {((page - 1) * pageSize) + 1} to {Math.min(page * pageSize, data.total)} of {data.total}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-2 rounded-md border disabled:opacity-50"
          >
            <ChevronLeftIcon className="w-4 h-4" />
          </button>
          <span className="text-gray-500">
            Page {page} of {Math.ceil(data.total / pageSize)}
          </span>
          <button
            onClick={() => setPage(p => p + 1)}
            disabled={page >= Math.ceil(data.total / pageSize)}
            className="p-2 rounded-md border disabled:opacity-50"
          >
            <ChevronRightIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      <Dialog.Root open={!!deleteUserId} onOpenChange={() => setDeleteUserId(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50" />
          <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-lg shadow-lg">
            <Dialog.Title className="text-lg font-semibold mb-4">
              Confirm Deletion
            </Dialog.Title>
            <Dialog.Description className="text-gray-500 mb-4">
              Are you sure you want to delete this user? This action cannot be undone.
            </Dialog.Description>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setDeleteUserId(null)}
                className="px-4 py-2 border rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteUserId && handleDelete(deleteUserId)}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}