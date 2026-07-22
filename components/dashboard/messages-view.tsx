"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardTitle, CardDescription } from "@/components/ui/card"
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
  User,
  GraduationCap,
  Users as UsersIcon,
  Heart,
  ShieldAlert,
  Loader2,
  ArrowLeft
} from "lucide-react"
import { getConversation, sendMessage } from "@/lib/message-actions"
import { cn } from "@/lib/utils"

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
  const [selectedContact, setSelectedContact] = useState<any>(
    initialContacts.profs[0] || initialContacts.administration[0] || initialContacts.camarades[0] || null
  )
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [showChat, setShowChat] = useState(false) // Mobile: toggle between list and chat
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (selectedContact) {
      loadConversation(selectedContact.id)
    }
  }, [selectedContact])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  async function loadConversation(contactId: number) {
    setLoading(true)
    const res = await getConversation(currentUserId, contactId)
    if (res.success) {
      setMessages(res.data)
    }
    setLoading(false)
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    if (!newMessage.trim() || !selectedContact || sending) return

    const content = newMessage
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
    if (!res.success) {
        // Rollback or show error
    }
    setSending(false)
  }

  const handleSelectContact = (contact: any) => {
    setSelectedContact(contact)
    setShowChat(true) // On mobile, switch to chat view after selecting
  }

  const renderContactButton = (contact: any) => (
    <button
      key={contact.id}
      className={cn(
        "w-full p-4 flex items-center gap-3 hover:bg-muted/50 transition-all border-b border-border last:border-0 text-left",
        selectedContact?.id === contact.id ? "bg-primary/5 border-l-4 border-l-primary" : ""
      )}
      onClick={() => handleSelectContact(contact)}
    >
      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
        <span className="text-sm font-bold text-primary">{contact.avatar}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-foreground text-sm truncate">{contact.name}</p>
        <p className="text-[10px] text-muted-foreground uppercase font-black tracking-tighter">
          {contact.role === 'teacher' ? 'Professeur' : 
           contact.role === 'student' ? (currentUserRole === 'teacher' ? 'Élève' : 'Camarade') :
           contact.role === 'parent' ? 'Parent' : 'Administration'}
        </p>
      </div>
    </button>
  )

  return (
    <div className="flex flex-col lg:grid lg:grid-cols-3 gap-4 md:gap-6 h-[calc(100vh-160px)] md:h-[calc(100vh-220px)] animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Sidebar Contacts — hidden on mobile when chat is shown */}
      <Card className={cn(
        "lg:col-span-1 flex flex-col shadow-xl border-primary/10 overflow-hidden",
        showChat ? "hidden lg:flex" : "flex"
      )}>
        <div className="p-4 border-b bg-muted/20">
           <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un contact..."
                className="pl-9 h-10 text-xs"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
           </div>
           
           <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid grid-cols-4 h-9 bg-muted/50 p-1">
                 <TabsTrigger value="all" className="text-[10px] font-bold uppercase"><MessageSquare className="h-3 w-3 mr-1" /> Tous</TabsTrigger>
                 <TabsTrigger value="profs" className="text-[10px] font-bold uppercase">
                   <GraduationCap className="h-3 w-3 mr-1" />
                   {currentUserRole === 'teacher' ? 'Coll.' : 'Profs'}
                 </TabsTrigger>
                 <TabsTrigger value="class" className="text-[10px] font-bold uppercase">
                    <UsersIcon className="h-3 w-3 mr-1" />
                    {currentUserRole === 'admin' ? 'Élèves' : currentUserRole === 'parent' ? 'Enfants' : currentUserRole === 'teacher' ? 'Élèves' : 'Classe'}
                 </TabsTrigger>
                 <TabsTrigger value="family" className="text-[10px] font-bold uppercase">
                    <Heart className="h-3 w-3 mr-1" />
                    {currentUserRole === 'admin' ? 'Parents' : currentUserRole === 'parent' ? 'École' : currentUserRole === 'teacher' ? 'Parents' : 'Famille'}
                 </TabsTrigger>
              </TabsList>

              <div className="mt-4 overflow-y-auto max-h-[400px] -mx-4 px-4 custom-scrollbar">
                 <TabsContent value="all" className="m-0">
                    {[...initialContacts.profs, ...initialContacts.camarades, ...initialContacts.famille, ...initialContacts.administration]
                      .filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()))
                      .map(renderContactButton)}
                 </TabsContent>
                 <TabsContent value="profs" className="m-0">
                    {initialContacts.profs.map(renderContactButton)}
                 </TabsContent>
                 <TabsContent value="class" className="m-0">
                    {(currentUserRole === 'parent')
                       ? initialContacts.famille.map(renderContactButton)
                       : initialContacts.camarades.map(renderContactButton)}
                 </TabsContent>
                 <TabsContent value="family" className="m-0">
                    {currentUserRole === 'parent'
                       ? initialContacts.administration.map(renderContactButton)
                       : initialContacts.famille.map(renderContactButton)}
                 </TabsContent>
              </div>
           </Tabs>
        </div>
      </Card>

      {/* Chat Area — hidden on mobile when list is shown */}
      <Card className={cn(
        "lg:col-span-2 flex flex-col shadow-2xl border-primary/5 overflow-hidden",
        showChat ? "flex" : "hidden lg:flex"
      )}>
        {selectedContact ? (
          <>
            {/* Header */}
            <div className="p-4 border-b bg-white flex items-center justify-between gap-2">
              {/* Back button — mobile only */}
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden shrink-0 -ml-2"
                onClick={() => setShowChat(false)}
              >
                <ArrowLeft className="h-5 w-5" />
                <span className="sr-only">Retour aux contacts</span>
              </Button>
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="text-sm font-black text-primary">{selectedContact.avatar}</span>
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-foreground truncate">{selectedContact.name}</p>
                  <div className="flex items-center gap-1.5">
                     <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                     <p className="text-[10px] text-muted-foreground uppercase font-bold">En ligne</p>
                  </div>
                </div>
              </div>
              <Button variant="ghost" size="icon" className="text-muted-foreground shrink-0">
                <MoreVertical className="h-5 w-5" />
              </Button>
            </div>

            {/* Messages body */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 bg-slate-50/50"
            >
              {loading ? (
                <div className="h-full flex items-center justify-center">
                   <Loader2 className="h-8 w-8 animate-spin text-primary/30" />
                </div>
              ) : messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-40">
                   <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center">
                      <MessageSquare className="h-10 w-10" />
                   </div>
                   <div>
                      <p className="font-bold">Début de la conversation</p>
                      <p className="text-xs">Dites bonjour à {selectedContact.name} !</p>
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
                      "max-w-[85%] sm:max-w-[80%] space-y-1 animate-in slide-in-from-bottom-2 duration-300",
                      message.sender === "me" ? "items-end" : "items-start"
                    )}>
                       <div
                        className={cn(
                          "rounded-2xl px-4 py-2.5 shadow-sm text-sm border",
                          message.sender === "me"
                            ? "bg-primary text-white border-primary"
                            : "bg-white text-foreground border-border"
                        )}
                      >
                        {message.content}
                      </div>
                      <div className={cn(
                        "flex items-center gap-1.5 px-1",
                        message.sender === "me" ? "flex-row-reverse" : "flex-row"
                      )}>
                        <span className="text-[10px] text-muted-foreground font-medium">
                          {message.time}
                        </span>
                        {message.sender === "me" && (
                          message.read ? (
                            <CheckCheck className="h-3 w-3 text-primary" />
                          ) : (
                            <Check className="h-3 w-3 text-muted-foreground" />
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
              <form className="flex items-center gap-2 md:gap-3" onSubmit={handleSend}>
                <Button type="button" variant="ghost" size="icon" className="shrink-0 text-muted-foreground">
                  <Paperclip className="h-5 w-5" />
                </Button>
                <Input
                  placeholder="Écrivez votre message..."
                  className="flex-1 h-11 md:h-12 bg-muted/50 border-transparent focus-visible:ring-primary"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                />
                <Button type="submit" size="icon" className="h-11 w-11 md:h-12 md:w-12 rounded-xl shadow-lg shadow-primary/20 shrink-0" disabled={!newMessage.trim() || sending}>
                  {sending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                </Button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 md:p-12 space-y-4">
             <div className="h-20 w-20 rounded-full bg-primary/5 flex items-center justify-center">
                <MessageSquare className="h-10 w-10 text-primary/20" />
             </div>
             <div>
                <CardTitle>Sélectionnez un membre</CardTitle>
                <CardDescription>
                   {currentUserRole === 'admin' 
                    ? "Choisissez un professeur, un élève ou un parent pour discuter." 
                    : currentUserRole === 'parent'
                    ? "Choisissez un enseignant de vos enfants ou l'administration pour discuter."
                    : currentUserRole === 'teacher'
                    ? "Choisissez un élève, un collègue ou un parent pour discuter."
                    : "Choisissez un professeur, un camarade ou un parent pour discuter."}
                </CardDescription>
             </div>
          </div>
        )}
      </Card>
    </div>
  )
}
