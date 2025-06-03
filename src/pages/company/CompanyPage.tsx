import { useEffect, useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Building, Edit, Save } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Button } from '@/components/ui/button';
import { Company } from '@/types';
import { getCurrentCompany, updateCompany, createCompany } from '@/services/api/company';
import { toast } from 'sonner';

const companySchema = z.object({
  name: z.string().min(2, { message: 'Company name must be at least 2 characters' }),
  cui: z.string().min(5, { message: 'CUI must be at least 5 characters' }),
});

type CompanyFormValues = z.infer<typeof companySchema>;

export default function CompanyPage() {
  const [company, setCompany] = useState<Company | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const form = useForm<CompanyFormValues>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      name: '',
      cui: '',
    },
  });

  useEffect(() => {
    const fetchCompany = async () => {
      setIsLoading(true);
      try {
        const data = await getCurrentCompany();
        setCompany(data);
        form.reset({
          name: data.name,
          cui: data.cui,
        });
      } catch (error) {
        console.error('Error fetching company:', error);
        // If no company exists, we'll let the user create one
        setCompany(null);
        setIsEditing(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCompany();
  }, [form]);

  const onSubmit = async (data: CompanyFormValues) => {
    try {
      if (company) {
        // Update existing company
        const updated = await updateCompany(data.name, data.cui);
        setCompany(updated);
        toast.success('Company updated successfully');
      } else {
        // Create new company
        const created = await createCompany(data.name, data.cui);
        setCompany(created);
        toast.success('Company created successfully');
      }
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving company:', error);
      toast.error('Failed to save company details');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>Loading company information...</p>
      </div>
    );
  }

  return (
    <div>
      <PageHeader 
        title="Company Information" 
        description="View and manage your company details" 
        icon={Building}
        action={
          company && !isEditing 
            ? { 
                label: "Edit Details", 
                onClick: () => setIsEditing(true),
                variant: "outline" 
              } 
            : undefined
        }
      />

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>{company ? 'Company Details' : 'Create Company'}</CardTitle>
          <CardDescription>
            {company
              ? 'Your company information is displayed below'
              : 'Enter your company details to get started'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Name</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter company name" 
                        {...field} 
                        disabled={!isEditing}
                      />
                    </FormControl>
                    <FormDescription>
                      The official registered name of your company
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="cui"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CUI / Tax ID</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter tax identification number" 
                        {...field} 
                        disabled={!isEditing}
                      />
                    </FormControl>
                    <FormDescription>
                      Your company's unique tax identification number
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {isEditing && (
                <div className="flex justify-end gap-2">
                  {company && (
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => {
                        setIsEditing(false);
                        form.reset({
                          name: company.name,
                          cui: company.cui,
                        });
                      }}
                    >
                      Cancel
                    </Button>
                  )}
                  <Button type="submit">
                    <Save className="mr-2 h-4 w-4" />
                    {company ? 'Save Changes' : 'Create Company'}
                  </Button>
                </div>
              )}
            </form>
          </Form>

          {!isEditing && company && (
            <div className="mt-6 pt-6 border-t">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Company ID</h3>
                  <p className="mt-1">{company.id}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Created</h3>
                  <p className="mt-1">01/01/2025</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}