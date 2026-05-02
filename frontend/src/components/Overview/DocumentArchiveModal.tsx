import { useState, useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { motion, AnimatePresence } from "motion/react"
import { 
  FileText, 
  X, 
  Search,
  User as UserIcon,
  Calendar,
  CheckCircle2,
  AlertCircle
} from "lucide-react"
import { useTranslation } from "react-i18next"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"

interface PDFExtraction {
  id: string
  filename: string
  status: string
  created_at: string
  owner_id: string
  owner: {
    id: string
    email: string
    full_name?: string
  }
  extracted_data: any
}

interface DocumentArchiveModalProps {
  isOpen: boolean
  onClose: () => void
}

export function DocumentArchiveModal({ isOpen, onClose }: DocumentArchiveModalProps) {
  const { t } = useTranslation()
  const [selectedDoc, setSelectedDoc] = useState<PDFExtraction | null>(null)

  // Fetch PDFs
  const { data, isLoading, error } = useQuery({
    queryKey: ["pdfExtractions"],
    queryFn: async () => {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000"
      const token = localStorage.getItem("access_token")
      const res = await fetch(`${apiUrl}/api/v1/pdf/`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (!res.ok) throw new Error("Failed to fetch documents")
      return res.json()
    },
    enabled: isOpen
  })

  // Handle closing when internal modal is closed
  useEffect(() => {
    if (!isOpen) {
      setSelectedDoc(null)
    }
  }, [isOpen])

  const docs: PDFExtraction[] = data?.data || []

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl h-[85vh] p-0 overflow-hidden flex flex-col bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800">
        <DialogHeader className="p-6 pb-4 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold flex items-center gap-2">
              <FileText className="text-primary" />
              Document Archive
            </DialogTitle>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Browse and inspect data extracted from submitted PDFs (CVs, Transcripts).
          </p>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex relative">
          {/* List Sidebar */}
          <div className={`w-full md:w-1/3 h-full border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col transition-all duration-300 ${selectedDoc ? 'hidden md:flex' : 'flex'}`}>
            <div className="p-4 border-b border-zinc-200 dark:border-zinc-800">
               <div className="relative">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                 <input 
                   placeholder="Search documents..." 
                   className="w-full pl-9 pr-4 py-2 text-sm bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                 />
               </div>
            </div>
            
            <ScrollArea className="flex-1">
              {isLoading ? (
                <div className="p-8 text-center text-muted-foreground">Loading documents...</div>
              ) : docs.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-3 opacity-20" />
                  No documents found in archive.
                </div>
              ) : (
                <div className="p-2 space-y-1">
                  {docs.map(doc => (
                    <div 
                      key={doc.id}
                      onClick={() => setSelectedDoc(doc)}
                      className={`p-3 rounded-xl cursor-pointer transition-all duration-200 ${selectedDoc?.id === doc.id ? 'bg-primary/10 border-primary/20' : 'hover:bg-zinc-100 dark:hover:bg-zinc-800 border-transparent'} border`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${selectedDoc?.id === doc.id ? 'bg-primary text-primary-foreground' : 'bg-zinc-100 dark:bg-zinc-800 text-muted-foreground'}`}>
                          <FileText size={18} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium truncate ${selectedDoc?.id === doc.id ? 'text-primary' : ''}`}>
                            {doc.filename}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5 truncate">
                            {doc.owner?.full_name || doc.owner?.email || "Unknown User"}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                             <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4">
                               {new Date(doc.created_at).toLocaleDateString()}
                             </Badge>
                             {doc.status === 'success' ? (
                               <CheckCircle2 size={12} className="text-emerald-500" />
                             ) : (
                               <AlertCircle size={12} className="text-amber-500" />
                             )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>

          {/* Details Pane */}
          <div className={`flex-1 h-full bg-zinc-50 dark:bg-zinc-950 flex flex-col relative ${!selectedDoc ? 'hidden md:flex' : 'flex'}`}>
            {selectedDoc ? (
              <>
                <div className="p-4 md:p-6 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center gap-4">
                  <Button variant="ghost" size="icon" className="md:hidden shrink-0" onClick={() => setSelectedDoc(null)}>
                    <X size={18} />
                  </Button>
                  <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <FileText size={24} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold truncate">{selectedDoc.filename}</h3>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                      <span className="flex items-center gap-1"><UserIcon size={14} /> {selectedDoc.owner?.full_name || selectedDoc.owner?.email}</span>
                      <span className="flex items-center gap-1"><Calendar size={14} /> {new Date(selectedDoc.created_at).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                
                <ScrollArea className="flex-1 p-4 md:p-6">
                  <div className="max-w-3xl mx-auto space-y-6 pb-10">
                     <div className="flex items-center justify-between">
                       <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Extracted Profile Data</h4>
                       <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20 border-0">Data Mapped</Badge>
                     </div>
                     
                     {Object.keys(selectedDoc.extracted_data || {}).length === 0 ? (
                       <div className="text-center py-12 text-muted-foreground">
                         No structured data was extracted from this document.
                       </div>
                     ) : (
                       <div className="grid gap-4">
                         {Object.entries(selectedDoc.extracted_data).map(([key, value]) => {
                           if (!value || (Array.isArray(value) && value.length === 0)) return null;
                           
                           return (
                             <Card key={key} className="overflow-hidden shadow-sm">
                               <CardContent className="p-0 flex flex-col sm:flex-row">
                                 <div className="bg-zinc-100 dark:bg-zinc-900 w-full sm:w-1/3 p-4 border-b sm:border-b-0 sm:border-r border-zinc-200 dark:border-zinc-800 font-medium text-sm flex items-center text-zinc-600 dark:text-zinc-400 capitalize">
                                   {key.replace(/_/g, ' ')}
                                 </div>
                                 <div className="p-4 flex-1">
                                   {Array.isArray(value) ? (
                                     <div className="flex flex-wrap gap-2">
                                       {value.map((v, i) => (
                                         <Badge key={i} variant="outline" className="bg-white dark:bg-zinc-950 font-normal">
                                           {String(v)}
                                         </Badge>
                                       ))}
                                     </div>
                                   ) : (
                                     <p className="text-sm font-medium whitespace-pre-wrap">
                                       {String(value)}
                                     </p>
                                   )}
                                 </div>
                               </CardContent>
                             </Card>
                           )
                         })}
                       </div>
                     )}
                  </div>
                </ScrollArea>
              </>
            ) : (
              <div className="h-full w-full flex flex-col items-center justify-center text-muted-foreground p-6">
                <FileText className="h-16 w-16 mb-4 opacity-20" />
                <p className="text-lg font-medium text-zinc-400">Select a document</p>
                <p className="text-sm text-center max-w-sm mt-2 opacity-60">
                  Choose a document from the archive list to view its extracted contents.
                </p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
