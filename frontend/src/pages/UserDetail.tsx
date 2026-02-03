import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import * as AlertDialog from '@radix-ui/react-alert-dialog';
import { ChevronRightIcon, PencilIcon, TrashIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { User } from '../types/User';
import { getUser, deleteUser } from '../api/users';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';

const UserDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    fetchUser();
  }, [id]);

  const fetchUser = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getUser(id!);
      setUser(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load user');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteUser(id!);
      navigate('/users');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete user');
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <ErrorMessage 
        message={error}
        onRetry={fetchUser}
      />
    );
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold text-gray-900">User not found</h2>
        <button
          onClick={() => navigate('/users')}
          className="mt-4 text-indigo-600 hover:text-indigo-500"
        >
          Back to Users List
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumbs */}
      <nav className="flex mb-8" aria-label="Breadcrumb">
        <ol className="flex items-center space-x-2">
          <li>
            <button
              onClick={() => navigate('/users')}
              className="text-gray-500 hover:text-gray-700"
            >
              Users
            </button>
          </li>
          <ChevronRightIcon className="h-4 w-4 text-gray-400" />
          <li className="text-gray-900 font-medium">{user.email}</li>
        </ol>
      </nav>

      {/* Header */}
      <div className="mb-8 sm:flex sm:items-center sm:justify-between">
        <h1 className="text-3xl font-bold text-gray-900">User Details</h1>
        <div className="mt-4 sm:mt-0 space-x-3">
          <button
            onClick={() => navigate(`/users/${id}/edit`)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <PencilIcon className="h-4 w-4 mr-2" />
            Edit
          </button>
          <button
            onClick={() => setShowDeleteDialog(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            <TrashIcon className="h-4 w-4 mr-2" />
            Delete
          </button>
        </div>
      </div>

      {/* User Details */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Account Information
          </h3>
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
          <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">ID</dt>
              <dd className="mt-1 text-sm text-gray-900">{user.id}</dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Email</dt>
              <dd className="mt-1 text-sm text-gray-900">{user.email}</dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Role</dt>
              <dd className="mt-1">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'
                }`}>
                  {user.role}
                </span>
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog.Root open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialog.Portal>
          <AlertDialog.Overlay className="fixed inset-0 bg-black/50" />
          <AlertDialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg p-6 max-w-md w-full">
            <AlertDialog.Title className="text-lg font-medium text-gray-900">
              Delete User
            </AlertDialog.Title>
            <AlertDialog.Description className="mt-2 text-sm text-gray-500">
              Are you sure you want to delete this user? This action cannot be undone.
            </AlertDialog.Description>
            <div className="mt-6 flex justify-end space-x-3">
              <AlertDialog.Cancel asChild>
                <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
                  Cancel
                </button>
              </AlertDialog.Cancel>
              <AlertDialog.Action asChild>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700"
                >
                  Delete
                </button>
              </AlertDialog.Action>
            </div>
          </AlertDialog.Content>
        </AlertDialog.Portal>
      </AlertDialog.Root>
    </div>
  );
};

export default UserDetail;