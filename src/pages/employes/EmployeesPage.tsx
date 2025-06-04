/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState } from 'react';
import { Users, UserPlus, Store as StoreIcon } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { PageHeader } from '@/components/common/PageHeader';
import { FilterBar } from '@/components/common/FilterBar';
import { EmptyState } from '@/components/common/EmptyState';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import { User, UserRole, Store } from '@/types';
import { createEmployee, getEmployeesByCompany, updateEmployee, deleteEmployee } from '@/services/api/employees';
import { getStoresByCompany } from '@/services/api/stores';
import { toast } from 'sonner';

const employeeSchema = z.object({
  email: z.string().email('Invalid email address'),
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  role: z.nativeEnum(UserRole),
  storeId: z.string().optional(),
});

type EmployeeFormValues = z.infer<typeof employeeSchema>;

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<User[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [storeFilter, setStoreFilter] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<User | null>(null);

  const form = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      email: '',
      firstName: '',
      lastName: '',
      role: UserRole.EMPLOYEE,
    },
  });

  const onSubmit = async (data: EmployeeFormValues) => {
    try {
      setIsLoading(true);
      if (selectedEmployee) {
        const updated = await updateEmployee({
          id: selectedEmployee.id,
          ...data,
        });
        setEmployees(prev => prev.map(emp => emp.id === updated.id ? updated : emp));
        toast.success('Employee updated successfully');
      } else {
        const created = await createEmployee(data);
        setEmployees(prev => [...prev, created]);
        toast.success('Employee created successfully');
      }
      setIsCreateDialogOpen(false);
      setSelectedEmployee(null);
      form.reset();
    } catch (error) {
      console.error('Error saving employee:', error);
      toast.error(selectedEmployee ? 'Failed to update employee' : 'Failed to create employee');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditEmployee = (employee: User) => {
    setSelectedEmployee(employee);
    form.reset({
      email: employee.email,
      firstName: employee.firstName,
      lastName: employee.lastName,
      role: employee.role,
      storeId: employee.storeId,
    });
    setIsCreateDialogOpen(true);
  };

  const handleDeleteEmployee = async (id: string) => {
    try {
      await deleteEmployee(id);
      setEmployees(prev => prev.filter(emp => emp.id !== id));
      toast.success('Employee deleted successfully');
    } catch (error) {
      console.error('Error deleting employee:', error);
      toast.error('Failed to delete employee');
    }
  };

  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = (
      employee.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
    const matchesRole = !roleFilter || employee.role === roleFilter;
    const matchesStore = !storeFilter || employee.storeId === storeFilter;
    return matchesSearch && matchesRole && matchesStore;
  });

  return (
    <div>
      <PageHeader
        title="Employees"
        description="Manage your company's employees"
        icon={Users}
        action={{
          label: "Add Employee",
          onClick: () => {
            setSelectedEmployee(null);
            form.reset({
              email: '',
              firstName: '',
              lastName: '',
              role: UserRole.EMPLOYEE,
            });
            setIsCreateDialogOpen(true);
          },
        }}
      />

      <FilterBar
        searchPlaceholder="Search employees..."
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        filters={{
          role: {
            label: "Role",
            options: [
              { label: "Owner", value: UserRole.OWNER },
              { label: "Manager", value: UserRole.MANAGER },
              { label: "Employee", value: UserRole.EMPLOYEE },
            ],
            value: roleFilter,
            onChange: setRoleFilter,
          },
          store: {
            label: "Store",
            options: stores.map(store => ({
              label: store.name,
              value: store.id,
            })),
            value: storeFilter,
            onChange: setStoreFilter,
          },
        }}
        onReset={() => {
          setSearchQuery('');
          setRoleFilter('');
          setStoreFilter('');
        }}
      />

      {employees.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No employees found"
          description="Get started by adding your first employee"
          action={{
            label: "Add Employee",
            onClick: () => setIsCreateDialogOpen(true),
          }}
        />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Employees List</CardTitle>
            <CardDescription>
              View and manage your company's employees
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Store</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEmployees.map((employee) => (
                  <TableRow key={employee.id}>
                    <TableCell>
                      {employee.firstName} {employee.lastName}
                    </TableCell>
                    <TableCell>{employee.email}</TableCell>
                    <TableCell className="capitalize">
                      {employee.role.toLowerCase()}
                    </TableCell>
                    <TableCell>
                      {employee.storeId
                        ? stores.find(s => s.id === employee.storeId)?.name || 'Unknown'
                        : 'Not assigned'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditEmployee(employee)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteEmployee(employee.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedEmployee ? 'Edit Employee' : 'Add New Employee'}
            </DialogTitle>
            <DialogDescription>
              {selectedEmployee
                ? 'Update employee information'
                : 'Create a new employee account'}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="employee@example.com"
                        {...field}
                        disabled={!!selectedEmployee}
                      />
                    </FormControl>
                    <FormDescription>
                      The employee's email address will be used for login
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={UserRole.EMPLOYEE}>Employee</SelectItem>
                        <SelectItem value={UserRole.MANAGER}>Manager</SelectItem>
                        <SelectItem value={UserRole.OWNER}>Owner</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      The employee's role determines their permissions
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="storeId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assigned Store</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a store" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">Not assigned</SelectItem>
                        {stores.map((store) => (
                          <SelectItem key={store.id} value={store.id}>
                            {store.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      The store where this employee will work
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsCreateDialogOpen(false);
                    setSelectedEmployee(null);
                    form.reset();
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading
                    ? selectedEmployee
                      ? 'Updating...'
                      : 'Creating...'
                    : selectedEmployee
                      ? 'Update Employee'
                      : 'Create Employee'
                  }
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}