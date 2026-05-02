import React, { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Search, UserPlus, Users, Loader2, Check, X, MessageSquare, LineChart, Star, TrendingUp, ShieldCheck } from "lucide-react"
import { TutorService, UsersService } from "@/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { toast } from "sonner"
import StudentTracker from "./StudentTracker"

export default function TutorManagement() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null)
  const queryClient = useQueryClient()

  // Queries
  const { data: myStudents, isLoading: loadingStudents } = useQuery({
    queryKey: ["my-students"],
    queryFn: () => TutorService.getMyStudentsApiV1TutorMyStudentsGet(),
  })

  const { data: searchResults, isLoading: searching } = useQuery({
    queryKey: ["search-students", searchQuery],
    queryFn: () => TutorService.searchStudentsApiV1TutorSearchStudentsGet({ query: searchQuery }),
    enabled: searchQuery.length > 2,
  })

  // Mutations
  const sendRequestMutation = useMutation({
    mutationFn: (studentId: string) => 
      TutorService.sendTutorshipRequestApiV1TutorRequestPost({ studentId }),
    onSuccess: (data) => {
      toast.success(data.message)
      queryClient.invalidateQueries({ queryKey: ["search-students"] })
    },
    onError: () => toast.error("Failed to send request"),
  })

  const rankMutation = useMutation({
    mutationFn: ({ studentId, rank }: { studentId: string, rank: number }) =>
      TutorService.updateStudentRankApiV1TutorStudentStudentIdRankPatch({ studentId, rank }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-students"] })
    },
    onError: () => toast.error("Failed to update rank"),
  })

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
  }

  if (selectedStudentId) {
    const student = myStudents?.find((s: any) => s.id === selectedStudentId)
    return (
      <div className="space-y-6">
        <Button 
          variant="ghost" 
          onClick={() => setSelectedStudentId(null)}
          className="mb-4 text-zinc-500 hover:text-foreground"
        >
          ← Back to List
        </Button>
        <StudentTracker studentId={selectedStudentId} studentName={student?.full_name ?? "Student"} />
      </div>
    )
  }

  return (
    <Tabs defaultValue="my-students" className="w-full">
      <TabsList className="bg-zinc-100 dark:bg-zinc-900 p-1 rounded-xl mb-8">
        <TabsTrigger value="my-students" className="rounded-lg px-6 py-2 data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-800 shadow-sm">
          My Students
        </TabsTrigger>
        <TabsTrigger value="search" className="rounded-lg px-6 py-2 data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-800 shadow-sm">
          Find Students
        </TabsTrigger>
      </TabsList>

      <TabsContent value="my-students" className="mt-0">
        {loadingStudents ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-primary h-8 w-8" />
          </div>
        ) : myStudents && myStudents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myStudents.map((student: any) => (
              <Card key={student.id} className="border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-all rounded-2xl overflow-hidden group">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12 border-2 border-primary/10">
                        <AvatarFallback className="bg-primary/5 text-primary font-bold">
                          {student.full_name?.split(" ").map((n: string) => n[0]).join("").toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-lg font-bold">{student.full_name}</CardTitle>
                        <CardDescription className="text-xs truncate max-w-[150px]">{student.email}</CardDescription>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            onClick={() => rankMutation.mutate({ studentId: student.id, rank: star })}
                            className="focus:outline-none transition-transform hover:scale-125"
                          >
                            <Star 
                              size={14} 
                              className={star <= (student.favorite_rank || 0) ? "fill-yellow-400 text-yellow-400" : "text-zinc-300"} 
                            />
                          </button>
                        ))}
                      </div>
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">RANK</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pb-6 space-y-4">
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary" className="bg-zinc-100 dark:bg-zinc-900 text-[10px] font-bold uppercase tracking-tight">
                      {student.specialty || "General"}
                    </Badge>
                    <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-tight">
                      {student.level || "L3"}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-zinc-500">
                        <TrendingUp size={14} />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Presence</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 flex-1 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-emerald-500 rounded-full" 
                            style={{ width: `${Math.min((student.logs_count || 0) * 10, 100)}%` }}
                          />
                        </div>
                        <span className="text-xs font-black">{student.logs_count || 0}</span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-zinc-500">
                        <ShieldCheck size={14} />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Behavior</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star size={12} className="fill-blue-500 text-blue-500" />
                        <span className="text-xs font-black">{student.behavior_rating || 0}</span>
                        <span className="text-[10px] text-zinc-400">/5</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="bg-zinc-50 dark:bg-zinc-900/50 border-t border-zinc-100 dark:border-zinc-800 p-4 flex gap-2">
                  <Button 
                    className="flex-1 rounded-xl h-10 text-xs font-bold gap-2"
                    onClick={() => setSelectedStudentId(student.id)}
                  >
                    <LineChart size={14} /> Tracker
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl">
            <Users className="h-12 w-12 text-zinc-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">No students yet</h3>
            <p className="text-zinc-500 mb-6 max-w-xs mx-auto">Start by searching for students to send tutorship requests.</p>
            <Button variant="outline" onClick={() => document.querySelector('[value="search"]')?.dispatchEvent(new MouseEvent('click', {bubbles: true}))}>
              Search Students
            </Button>
          </div>
        )}
      </TabsContent>

      <TabsContent value="search" className="mt-0">
        <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm rounded-3xl mb-10 overflow-hidden">
          <CardContent className="p-6">
            <form onSubmit={handleSearch} className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 h-5 w-5" />
                <Input 
                  placeholder="Search students by name or email..." 
                  className="pl-12 h-14 bg-zinc-50 dark:bg-zinc-900 border-none rounded-2xl text-base focus-visible:ring-primary/20"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </form>
          </CardContent>
        </Card>

        {searching ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-primary h-8 w-8" />
          </div>
        ) : searchResults && searchResults.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {searchResults.map((student) => (
              <Card key={student.id} className="border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-all rounded-2xl group">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-zinc-100 dark:bg-zinc-800 text-zinc-500 text-xs font-bold">
                        {student.full_name?.split(" ").map(n => n[0]).join("").toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      className="rounded-full hover:bg-primary/10 hover:text-primary transition-colors"
                      onClick={() => sendRequestMutation.mutate(student.id)}
                      disabled={sendRequestMutation.isPending}
                    >
                      {sendRequestMutation.isPending ? <Loader2 className="animate-spin h-4 w-4" /> : <UserPlus size={18} />}
                    </Button>
                  </div>
                  <div className="mt-4">
                    <CardTitle className="text-base font-bold">{student.full_name}</CardTitle>
                    <CardDescription className="text-[10px] font-mono">{student.email}</CardDescription>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        ) : searchQuery.length > 2 ? (
          <div className="text-center py-20 bg-zinc-50 dark:bg-zinc-900/50 rounded-3xl">
            <p className="text-zinc-500">No students found matching "{searchQuery}"</p>
          </div>
        ) : (
          <div className="text-center py-20 bg-zinc-50 dark:bg-zinc-900/50 rounded-3xl">
            <p className="text-zinc-500">Enter at least 3 characters to start searching.</p>
          </div>
        )}
      </TabsContent>
    </Tabs>
  )
}
