import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { 
  FileText, 
  Upload, 
  Trash2, 
  Loader2, 
  FileCheck, 
  Plus, 
  ExternalLink,
  GraduationCap,
  Award,
  BookOpen
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { UserDocumentsService, DocumentType } from "@/client"
import useCustomToast from "@/hooks/useCustomToast"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

export default function UserDocuments() {
  const queryClient = useQueryClient()
  const { showSuccessToast, showErrorToast } = useCustomToast()
  const [isUploading, setIsUploading] = useState(false)
  const [selectedType, setSelectedType] = useState<DocumentType>(DocumentType.OTHER)

  const { data: documents, isLoading } = useQuery({
    queryKey: ["user-documents"],
    queryFn: () => UserDocumentsService.readUserDocuments({}),
  })

  const uploadMutation = useMutation({
    mutationFn: (formData: { file: File; type: DocumentType }) => 
      UserDocumentsService.uploadUserDocument({ 
        formData: {
          file: formData.file,
          type: formData.type
        } 
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-documents"] })
      showSuccessToast("Document uploaded successfully")
      setIsUploading(false)
    },
    onError: () => {
      showErrorToast("Failed to upload document")
      setIsUploading(false)
    }
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => UserDocumentsService.deleteUserDocument({ id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-documents"] })
      showSuccessToast("Document deleted successfully")
    },
    onError: () => {
      showErrorToast("Failed to delete document")
    }
  })

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setIsUploading(true)
      uploadMutation.mutate({ file, type: selectedType })
    }
  }

  const getIcon = (type: string) => {
    switch (type) {
      case DocumentType.CV: return <FileText className="text-blue-500" />
      case DocumentType.PHD_DOC: return <GraduationCap className="text-indigo-500" />
      case DocumentType.CERTIFICATE: return <Award className="text-emerald-500" />
      default: return <BookOpen className="text-zinc-500" />
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Academic Documents</h2>
          <p className="text-sm text-muted-foreground">Manage your PhD documents, certificates, and CV</p>
        </div>
        
        <div className="flex items-center gap-2">
          <select 
            className="h-9 w-32 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value as DocumentType)}
          >
            <option value={DocumentType.CV}>CV</option>
            <option value={DocumentType.PHD_DOC}>PhD Doc</option>
            <option value={DocumentType.CERTIFICATE}>Certificate</option>
            <option value={DocumentType.OTHER}>Other</option>
          </select>
          
          <Button variant="outline" className="relative group overflow-hidden" disabled={isUploading}>
            {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
            Upload Document
            <input 
              type="file" 
              className="absolute inset-0 opacity-0 cursor-pointer" 
              onChange={handleFileUpload}
              disabled={isUploading}
            />
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary/50" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {documents?.data.length === 0 && (
            <div className="md:col-span-2 p-12 text-center border-2 border-dashed rounded-3xl border-zinc-100 dark:border-zinc-900">
              <Upload className="mx-auto h-12 w-12 text-zinc-300 mb-4" />
              <p className="text-zinc-500 font-medium">No documents uploaded yet</p>
            </div>
          )}
          
          {documents?.data.map((doc: any) => (
            <Card key={doc.id} className="overflow-hidden border-zinc-100 dark:border-zinc-900 hover:border-primary/20 transition-all group">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="size-12 rounded-2xl bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center group-hover:bg-primary/5 transition-colors">
                    {getIcon(doc.type)}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold truncate max-w-[150px]">{doc.name}</h4>
                    <div className="flex items-center gap-2">
                       <Badge variant="secondary" className="text-[9px] uppercase tracking-widest font-bold">
                         {doc.type}
                       </Badge>
                       <span className="text-[10px] text-zinc-400 font-mono">
                         {new Date(doc.created_at).toLocaleDateString()}
                       </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" asChild>
                    <a href={doc.url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 rounded-full text-destructive hover:bg-destructive/10"
                    onClick={() => deleteMutation.mutate(doc.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
