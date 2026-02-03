import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { User } from '../types/User';
import { getUser, updateUser } from '../api/users';
import { Alert } from '../components/Alert';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Select } from '../components/Select';

const userSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least 1 uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least 1 number'),
  role: z.enum(['admin', 'user'])
});

type UserFormData = z.infer<typeof userSchema>;

export const UserEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState<UserFormData>({
    id: '',
    email: '',
    password: '',
    role: 'user'
  });
  
  const [originalData, setOriginalData] = useState<UserFormData | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      setIsLoading(true);
      try {
        const userData = await getUser(id!);
        setFormData(userData);
        setOriginalData(userData);
        setIsLoading(false);
      } catch (err) {
        setApiError('User not found');
        setIsLoading(false);
      }
    };
    loadUser();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear field error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);
    
    try {
      const validated = userSchema.parse(formData);
      setIsSaving(true);
      
      await updateUser(id!, validated);
      navigate(`/users/${id}`);
    } catch (err) {
      if (err instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        err.errors.forEach(error => {
          if (error.path) {
            fieldErrors[error.path[0]] = error.message;
          }
        });
        setErrors(fieldErrors);
      } else {
        setApiError('Failed to update user');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    if (originalData) {
      setFormData(originalData);
      setErrors({});
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (apiError) {
    return <Alert type="error" message={apiError} />;
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Edit User</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <Input
            label="Email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
            required
          />
        </div>

        <div>
          <Input
            label="Password"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
            required
          />
        </div>

        <div>
          <Select
            label="Role"
            name="role"
            value={formData.role}
            onChange={handleChange}
            error={errors.role}
            required
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </Select>
        </div>

        <div className="flex space-x-4">
          <Button
            type="submit"
            disabled={isSaving}
            className="bg-blue-500 hover:bg-blue-600"
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>

          <Button
            type="button"
            onClick={handleReset}
            className="bg-gray-500 hover:bg-gray-600"
          >
            Reset
          </Button>

          <Button
            type="button"
            onClick={() => navigate('/users')}
            className="bg-gray-300 hover:bg-gray-400"
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
};