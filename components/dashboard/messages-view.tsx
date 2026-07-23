"use client"

import { useState, useEffect, useRef } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  MessageSquare, 
  Search,
  Send,
  Paperclip,
  MoreVertical,
  Check,
  CheckCheck,
  GraduationCap,
  Users as UsersIcon,
  Heart,
  Shield,
  Loader2,
  ArrowLeft
} from "lucide-react"
import { getConversation, sendMessage } from "@/lib/message-actions"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

interface MessagesViewProps {
  currentUserId: number
  currentUserRole: string
  initialContacts: {
    profs: any[]
    camarades: any[]
    famille: any[]
    administration: any[]
  }
}

export function MessagesView({ currentUserId, currentUserRole, initialContacts }: MessagesViewProps) {
  const allContactsList = [
    ...(initialContacts.profs || []),
    ...(initialContacts.camarades || []),
    ...(initialContacts.famille || []),
    ...(initialContacts.administration || [])
  ]

  const [selectedContact, setSelectedContact] = useState<any>(allContactsList[0] || null)
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [showChat, setShowChat] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (selectedContact) {
      loadConversation(selectedContact.id)
    }
  }, [selectedContact])

  // Polling every 5s for live conversation updates
  useEffect(() => {
    if (!selectedContact) return
    const interval = setInterval(() => {
      loadConversation(selectedContact.id, true)
    }, 5000)
    return () => clearInterval(interval)
  }, [selectedContact])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  async function loadConversation(contactId: number, silent: boolean = false) {
    if (!silent) setLoading(true)
    const res = await getConversation(currentUserId, contactId)
    if (res.success) {
      setMessages(res.data)
    }
    if (!silent) setLoading(false)
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    if (!newMessage.trim() || !selectedContact || sending) return

    const content = newMessage.trim()
    setNewMessage("")
    setSending(true)

    // Optimistic update
    const tempId = Date.now()
    setMessages(prev => [...prev, {
      id: tempId,
      sender: 'me',
      content,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      read: false
    }])

    const res = await sendMessage(currentUserId, selectedContact.id, content)
    if (res.success) {
      loadConversation(selectedContact.id, true)
    } else {
      toast.error(res.error || "Échec de l'envoi")
    }
    setSending(false)
  }

  const handleSelectContact = (contact: any) => {
    setSelectedContact(contact)
    setShowChat(true)
  }

  const renderContactButton = (contact: any) => (
    <button
      key={`${contact.role}-${contact.id}`}
      className={cn(
        "w-full p-3.5 flex items-center gap-3 hover:bg-slate-100/80 transition-all border-b border-slate-100 text-left rounded-xl my-1",
        selectedContact?.id === contact.id ? "bg-primary/10 border-l-4 border-l-primary font-bold" : ""
      )}
      onClick={() => handleSelectContact(contact)}
    >
      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20">
        <span className="text-xs font-black text-primary">{contact.avatar}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-slate-900 text-sm truncate">{contact.name}</p>
        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">
          {contact.role === 'teacher' ? 'Professeur' : 
           contact.role === 'student' ? 'Élève' :
           contact.role === 'parent' ? 'Parent' : 'Administration'}
        </p>
      </div>
    </button>
  )

  const filterBySearch = (list: any[]) => {
    if (!searchTerm.trim()) return list
    return list.filter(c => 
      (c.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.email || "").toLowerCase().includes(searchTerm.toLowerCase())
    )
  }

  return (
    <div className="flex flex-col lg:grid lg:grid-cols-3 gap-4 md:gap-6 h-[calc(100vh-160px)] md:h-[calc(100vh-200px)] max-w-7xl mx-auto">
      {/* Sidebar Contacts */}
      <Card className={cn(
        "lg:col-span-1 flex flex-col shadow-xl border-slate-200 rounded-3xl overflow-hidden bg-white",
        showChat ? "hidden lg:flex" : "flex"
      )}>
        <div className="p-4 border-b bg-slate-50/50">
           <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Rechercher un contact..."
                className="pl-9 h-10 text-xs rounded-2xl border-slate-200"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
           </div>
           
           <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid grid-cols-5 h-9 bg-slate-200/60 p-1 rounded-xl">
                 <TabsTrigger value="all" className="text-[9px] font-bold uppercase p-0">Tous</TabsTrigger>
                 <TabsTrigger value="profs" className="text-[9px] font-bold uppercase p-0">Profs</TabsTrigger>
                 <TabsTrigger value="class" className="text-[9px] font-bold uppercase p-0">Élèves</TabsTrigger>
                 <TabsTrigger value="family" className="text-[9px] font-bold uppercase p-0">Parents</TabsTrigger>
                 <TabsTrigger value="admin" className="text-[9px] font-bold uppercase p-0">Admin</TabsTrigger>
              </TabsList>

              <div className="mt-3 overflow-y-auto max-h-[calc(100vh-320px)] custom-scrollbar pr-1">
                 <TabsContent value="all" className="m-0">
                    {filterBySearch(allContactsList).map(renderContactButton)}
                    {filterBySearch(allContactsList).length === 0 && (
                      <p className="p-8 text-center text-xs text-slate-400 italic">Aucun contact trouvé.</p>
                    )}
                 </TabsContent>
                 <TabsContent value="profs" className="m-0">
                    {filterBySearch(initialContacts.profs || []).map(renderContactButton)}
                 </TabsContent>
                 <TabsContent value="class" className="m-0">
                    {filterBySearch(initialContacts.camarades || []).map(renderContactButton)}
                 </TabsContent>
                 <TabsContent value="family" className="m-0">
                    {filterBySearch(initialContacts.famille || []).map(renderContactButton)}
                 </TabsContent>
                 <TabsContent value="admin" className="m-0">
                    {filterBySearch(initialContacts.administration || []).map(renderContactButton)}
                 </TabsContent>
              </div>
           </Tabs>
        </div>
      </Card>

      {/* Chat Area */}
      <Card className={cn(
        "lg:col-span-2 flex flex-col shadow-xl border-slate-200 rounded-3xl overflow-hidden bg-white",
        showChat ? "flex" : "hidden lg:flex"
      )}>
        {selectedContact ? (
          <>
            {/* Header */}
            <div className="p-4 border-b bg-slate-50/50 flex items-center justify-between gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden shrink-0 -ml-2 rounded-full"
                onClick={() => setShowChat(false)}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20">
                  <span className="text-xs font-black text-primary">{selectedContact.avatar}</span>
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-slate-900 truncate text-sm">{selectedContact.name}</p>
                  <div className="flex items-center gap-1.5">
                     <div className="h-2 w-2 rounded-full bg-emerald-500" />
                     <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                      {selectedContact.role === 'teacher' ? 'Enseignant' : 
                       selectedContact.role === 'student' ? 'Élève' : 
                       selectedContact.role === 'parent' ? 'Parent' : 'Administration'}
                     </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Messages body */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 bg-slate-50/40"
            >
              {loading && messages.length === 0 ? (
                <div className="h-full flex items-center justify-center">
                   <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-3 opacity-60">
                   <div className="h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center">
                      <MessageSquare className="h-8 w-8 text-slate-400" />
                   </div>
                   <div>
                      <p className="font-bold text-slate-800 text-sm">Début de la conversation</p>
                      <p className="text-xs text-slate-500">Envoyez un message direct à {selectedContact.name}.</p>
                   </div>
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      "flex group",
                      message.sender === "me" ? "justify-end" : "justify-start"
                    )}
                  >
                    <div className={cn(
                      "max-w-[85%] sm:max-w-[75%] space-y-1",
                      message.sender === "me" ? "items-end" : "items-start"
                    )}>
                       <div
                        className={cn(
                          "rounded-2xl px-4 py-2.5 shadow-sm text-sm border font-medium",
                          message.sender === "me"
                            ? "bg-primary text-white border-primary rounded-br-none"
                            : "bg-white text-slate-900 border-slate-200 rounded-bl-none"
                        )}
                      >
                        {message.content}
                      </div>
                      <div className={cn(
                        "flex items-center gap-1.5 px-1",
                        message.sender === "me" ? "flex-row-reverse" : "flex-row"
                      )}>
                        <span className="text-[10px] text-slate-400 font-semibold">
                          {message.time}
                        </span>
                        {message.sender === "me" && (
                          message.read ? (
                            <CheckCheck className="h-3.5 w-3.5 text-emerald-500" />
                          ) : (
                            <Check className="h-3.5 w-3.5 text-slate-400" />
                          )
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Input area */}
            <div className="p-3 md:p-4 border-t bg-white">
              <form className="flex items-center gap-2" onSubmit={handleSend}>
                <Input
                  placeholder="Écrivez votre message..."
                  className="flex-1 h-12 bg-slate-50 border-slate-200 rounded-2xl text-sm"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                />
                <Button type="submit" size="icon" className="h-12 w-12 rounded-2xl shadow-lg bg-primary text-white border-none shrink-0" disabled={!newMessage.trim() || sending}>
                  {sending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                </Button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-4">
             <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
                <MessageSquare className="h-10 w-10 text-primary" />
             </div>
             <div>
                <h3 className="text-lg font-bold text-slate-800">Sélectionnez une conversation</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm">
                   Choisissez un contact dans la liste à gauche pour commencer à discuter en direct.
                </p>
             </div>
          </div>
        )}
      </Card>
    </div>
  )
}
