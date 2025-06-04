/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState } from 'react';
import { FileText, Upload, Trash2, Download } from 'lucide-react';
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
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import { FileEntity } from '@/types';
import { uploadFile, getFilesByEntity, deleteFile } from '@/services/api/files';
import { toast } from 'sonner';

const uploadSchema = z.object({
  file: z.instanceof(File),
  entityType: z.enum(['COMPANY', 'STORE', 'PRODUCT', 'USER', 'TIMEOFF']),
  entityId: z.string().min(1, 'Entity ID is required'),
});

type UploadFormValues = z.infer<typeof uploadSchema>;

export default function FilesPage() {
  const [files, setFiles] = useState<FileEntity[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);

  const form = useForm<UploadFormValues>({
    resolver: zodResolver(uploadSchema),
  });

  const onSubmit = async (data: UploadFormValues) => {
    try {
      setIsLoading(true);
      const uploadedFile = await uploadFile(data.file, data.entityType, data.entityId);
      setFiles((prev) => [...prev, uploadedFile]);
      setIsUploadDialogOpen(false);
      form.reset();
      toast.success('File uploaded successfully');
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('Failed to upload file');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (fileId: string, entityType: string, entityId: string) => {
    try {
      await deleteFile(fileId, entityType, entityId);
      setFiles((prev) => prev.filter((file) => file.id !== fileId));
      toast.success('File deleted successfully');
    } catch (error) {
      console.error('Error deleting file:', error);
      toast.error('Failed to delete file');
    }
  };

  const filteredFiles = files.filter((file) => {
    const matchesSearch = file.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = !typeFilter || file.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div>
      <PageHeader
        title="Files"
        description="Manage your company's files and documents"
        icon={FileText}
        action={{
          label: "Upload File",
          onClick: () => setIsUploadDialogOpen(true),
        }}
      />

      <FilterBar
        searchPlaceholder="Search files..."
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        filters={{
          type: {
            label: "File Type",
            options: [
              { label: "Documents", value: "document" },
              { label: "Images", value: "image" },
              { label: "Other", value: "other" },
            ],
            value: typeFilter,
            onChange: setTypeFilter,
          },
        }}
        onReset={() => {
          setSearchQuery('');
          setTypeFilter('');
        }}
      />

      {files.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No files found"
          description="Upload your first file to get started"
          action={{
            label: "Upload File",
            onClick: () => setIsUploadDialogOpen(true),
          }}
        />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Files List</CardTitle>
            <CardDescription>
              View and manage your uploaded files
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Uploaded By</TableHead>
                  <TableHead>Upload Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFiles.map((file) => (
                  <TableRow key={file.id}>
                    <TableCell>{file.name}</TableCell>
                    <TableCell className="capitalize">{file.type}</TableCell>
                    <TableCell>{formatFileSize(file.size)}</TableCell>
                    <TableCell>{file.uploadedBy}</TableCell>
                    <TableCell>
                      {new Date(file.uploadedAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(file.url, '_blank')}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(file.id, file.entityType, file.entityId)}
                        >
                          <Trash2 className="h-4 w-4" />
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

      <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload File</DialogTitle>
            <DialogDescription>
              Upload a new file to your company's storage
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="file"
                render={({ field: { onChange, value, ...field } }) => (
                  <FormItem>
                    <FormLabel>File</FormLabel>
                    <FormControl>
                      <Input
                        type="file"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            onChange(file);
                          }
                        }}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Select a file to upload
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="entityType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Entity Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select entity type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="COMPANY">Company</SelectItem>
                        <SelectItem value="STORE">Store</SelectItem>
                        <SelectItem value="PRODUCT">Product</SelectItem>
                        <SelectItem value="USER">User</SelectItem>
                        <SelectItem value="TIMEOFF">Time Off</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      The type of entity this file belongs to
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="entityId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Entity ID</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter entity ID" {...field} />
                    </FormControl>
                    <FormDescription>
                      The ID of the entity this file belongs to
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsUploadDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Uploading...' : 'Upload'}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}