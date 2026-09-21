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
  Mic,
  MoreVertical,
  Check,
  CheckCheck,
  GraduationCap,
  Users as UsersIcon,
  Heart,
  Shield,
  Loader2,
  ArrowLeft,
  Phone,
  Video,
  MapPin,
  Pin,
  Smile,
  Sparkles,
  Layers,
  PlusCircle,
  MicOff,
  VideoOff,
  X,
  Image as ImageIcon,
  FileText,
  Volume2,
  Radio,
  Share2
} from "lucide-react"
import { getConversation, sendMessage } from "@/lib/message-actions"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"

interface MessagesViewProps {
  currentUserId: number
  currentUserRole: string
  initialContacts: {
    profs: any[]
    camarades: any[]
    famille: any[]
    administration: any[]
  }
  initialTargetId?: number
}

// 24h Status Stories Data
const mockStatuses = [
  { id: 1, author: "M. Kouassi", role: "Prof. Mathématiques", avatar: "MK", text: "📚 Devoir de Mathématiques reporté à vendredi !", time: "Il y a 2h", isNew: true },
  { id: 2, author: "Direction", role: "Administration", avatar: "DIR", text: "📢 Réunion des délégués de classe aujourd'hui à 15h00 au Hall.", time: "Il y a 4h", isNew: true },
  { id: 3, author: "Bamba Judith", role: "Élève (Déléguée)", avatar: "BJ", text: "🎉 Bravo à toute la classe pour les résultats du BAC Blanc !", time: "Il y a 6h", isNew: false },
]

// Groups & Communities
const mockGroups = [
  { id: 901, name: "Groupe Délégués Terminale", type: "group", role: "group", avatar: "DT", count: 12, description: "Canal officiel des délégués de classe" },
  { id: 902, name: "Conseil des Enseignants", type: "group", role: "group", avatar: "CE", count: 24, description: "Échanges pédagogiques et réunions" },
  { id: 903, name: "Club Scientifique MonÉcole+", type: "group", role: "group", avatar: "CS", count: 45, description: "Projets scientifiques et robotique" }
]

const mockCommunities = [
  { id: 951, name: "Communauté Pédagogique MonÉcole+", type: "community", role: "community", avatar: "CP", groupsCount: 8, description: "Regroupe tous les départements et matières" },
  { id: 952, name: "Vie Scolaire & Activités", type: "community", role: "community", avatar: "VS", groupsCount: 5, description: "Clubs, événements sportifs et culturels" }
]

const stickersList = ["🎓", "📚", "🏆", "🔥", "💯", "🎉", "💡", "🚀", "👏", "⭐", "❤️", "👍", "😃", "🙌"]

export function MessagesView({ currentUserId, currentUserRole, initialContacts, initialTargetId }: MessagesViewProps) {
  const allContactsList = [
    ...(initialContacts.profs || []),
    ...(initialContacts.camarades || []),
    ...(initialContacts.famille || []),
    ...(initialContacts.administration || []),
    ...mockGroups,
    ...mockCommunities
  ]

  const [selectedContact, setSelectedContact] = useState<any>(() => {
    if (initialTargetId) {
      const match = allContactsList.find(c => c.id === initialTargetId)
      if (match) return match
    }
    return allContactsList[0] || null
  })

  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [inChatSearch, setInChatSearch] = useState("")
  const [showInChatSearch, setShowInChatSearch] = useState(false)
  const [showChat, setShowChat] = useState(!!initialTargetId)
  const [pinnedMessage, setPinnedMessage] = useState<any | null>(null)
  const [showStickers, setShowStickers] = useState(false)

  // Status Story modal
  const [activeStory, setActiveStory] = useState<any | null>(null)
  const [statusesList, setStatusesList] = useState(mockStatuses)
  const [newStatusText, setNewStatusText] = useState("")
  const [isAddStatusOpen, setIsAddStatusOpen] = useState(false)

  // Audio / Video Call Modals
  const [isAudioCallActive, setIsAudioCallActive] = useState(false)
  const [isVideoCallActive, setIsVideoCallActive] = useState(false)
  const [callDuration, setCallDuration] = useState(0)
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoOff, setIsVideoOff] = useState(false)
  const callTimerRef = useRef<any>(null)

  const scrollRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Voice Note states
  const [isRecordingVoice, setIsRecordingVoice] = useState(false)
  const [recordingSeconds, setRecordingSeconds] = useState(0)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const timerIntervalRef = useRef<any>(null)

  useEffect(() => {
    if (initialTargetId) {
      const match = allContactsList.find(c => c.id === initialTargetId)
      if (match) {
        setSelectedContact(match)
        setShowChat(true)
      }
    }
  }, [initialTargetId])

  useEffect(() => {
    if (selectedContact) {
      loadConversation(selectedContact.id)
    }
  }, [selectedContact])

  // Call timer handling
  useEffect(() => {
    if (isAudioCallActive || isVideoCallActive) {
      setCallDuration(0)
      callTimerRef.current = setInterval(() => {
        setCallDuration(prev => prev + 1)
      }, 1000)
    } else {
      if (callTimerRef.current) clearInterval(callTimerRef.current)
    }
    return () => {
      if (callTimerRef.current) clearInterval(callTimerRef.current)
    }
  }, [isAudioCallActive, isVideoCallActive])

  // Polling every 5s
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

  // 1. FILE ATTACHMENT HANDLER (Images, Videos, Documents)
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !selectedContact) return

    if (file.size > 15 * 1024 * 1024) {
      toast.error("Le fichier ne doit pas dépasser 15 Mo.")
      return
    }

    setSending(true)
    const reader = new FileReader()
    reader.onload = async () => {
      const base64Data = reader.result as string
      const payload = `[ATTACHMENT:${file.name}|${file.type}|${base64Data}]`
      
      const res = await sendMessage(currentUserId, selectedContact.id, payload)
      if (res.success) {
        toast.success("Document / Fichier partagé avec succès !")
        loadConversation(selectedContact.id, true)
      } else {
        toast.error(res.error || "Erreur d'envoi de fichier.")
      }
      setSending(false)
    }
    reader.readAsDataURL(file)
    e.target.value = ""
  }

  // 2. VOICE NOTE RECORDING HANDLER
  const startVoiceRecording = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      toast.error("Votre navigateur ne supporte pas l'enregistrement audio.")
      return
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach(track => track.stop())
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        if (audioBlob.size === 0) return

        const reader = new FileReader()
        reader.onloadend = async () => {
          const base64Audio = reader.result as string
          const payload = `[AUDIO:message_vocal.webm|${base64Audio}]`
          
          setSending(true)
          const res = await sendMessage(currentUserId, selectedContact.id, payload)
          if (res.success) {
            toast.success("Message vocal envoyé !")
            loadConversation(selectedContact.id, true)
          } else {
            toast.error(res.error || "Échec de l'envoi du message vocal.")
          }
          setSending(false)
        }
        reader.readAsDataURL(audioBlob)
      }

      mediaRecorder.start()
      setIsRecordingVoice(true)
      setRecordingSeconds(0)

      timerIntervalRef.current = setInterval(() => {
        setRecordingSeconds(prev => prev + 1)
      }, 1000)

      toast.info("Enregistrement vocal démarré...")
    } catch (err: any) {
      toast.error("Accès au microphone refusé ou indisponible.")
    }
  }

  const stopVoiceRecording = (cancel = false) => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current)
      timerIntervalRef.current = null
    }

    if (mediaRecorderRef.current && isRecordingVoice) {
      if (cancel) {
        audioChunksRef.current = []
        mediaRecorderRef.current.onstop = () => {
          const stream = mediaRecorderRef.current?.stream
          stream?.getTracks().forEach(track => track.stop())
        }
        toast.info("Enregistrement vocal annulé.")
      }
      try {
        mediaRecorderRef.current.stop()
      } catch (e) {}
    }
    setIsRecordingVoice(false)
    setRecordingSeconds(0)
  }

  // 3. LOCATION SHARING HANDLER
  const handleShareLocation = async () => {
    if (!selectedContact) return
    toast.info("Récupération de la position géographique...")
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude.toFixed(6)
          const lng = position.coords.longitude.toFixed(6)
          const payload = `[LOCATION:Position Actuelle|${lat}|${lng}]`
          
          setSending(true)
          const res = await sendMessage(currentUserId, selectedContact.id, payload)
          if (res.success) {
            toast.success("Localisation partagée en direct !")
            loadConversation(selectedContact.id, true)
          }
          setSending(false)
        },
        async () => {
          // Fallback to default school location
          const payload = `[LOCATION:Établissement MonÉcole+|5.359952|-4.008256]`
          setSending(true)
          const res = await sendMessage(currentUserId, selectedContact.id, payload)
          if (res.success) {
            toast.success("Localisation de l'école partagée !")
            loadConversation(selectedContact.id, true)
          }
          setSending(false)
        }
      )
    } else {
      toast.error("Géolocalisation non supportée par votre navigateur.")
    }
  }

  // 4. STICKER & EMOJI SENDER
  const sendSticker = async (stickerEmoji: string) => {
    if (!selectedContact) return
    setShowStickers(false)
    const payload = `[STICKER:${stickerEmoji}]`
    setSending(true)
    const res = await sendMessage(currentUserId, selectedContact.id, payload)
    if (res.success) {
      loadConversation(selectedContact.id, true)
    }
    setSending(false)
  }

  // 5. POST STATUS STORY
  const handleAddStatus = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newStatusText.trim()) return
    const newEntry = {
      id: Date.now(),
      author: "Moi (Enseignant/Admin)",
      role: currentUserRole,
      avatar: "MOI",
      text: newStatusText.trim(),
      time: "À l'instant",
      isNew: true
    }
    setStatusesList(prev => [newEntry, ...prev])
    setNewStatusText("")
    setIsAddStatusOpen(false)
    toast.success("Statut 24h publié avec succès à tous vos contacts !")
  }

  // 6. RENDER CONTENT HELPER
  const renderMessageContent = (content: string) => {
    if (content.startsWith('[AUDIO:')) {
      const parts = content.slice(7, -1).split('|')
      const name = parts[0] || "Message vocal"
      const dataUrl = parts.slice(1).join('|')

      return (
        <div className="space-y-1 py-1 min-w-[220px]">
          <div className="flex items-center gap-2 text-xs font-bold mb-1">
            <Mic className="h-4 w-4 animate-pulse text-rose-500" />
            <span>{name}</span>
          </div>
          <audio controls src={dataUrl} className="w-full h-9 rounded-xl" />
        </div>
      )
    }

    if (content.startsWith('[STICKER:')) {
      const emoji = content.slice(9, -1)
      return <span className="text-5xl animate-bounce leading-none inline-block p-1">{emoji}</span>
    }

    if (content.startsWith('[LOCATION:')) {
      const parts = content.slice(10, -1).split('|')
      const locName = parts[0] || "Position"
      const lat = parts[1] || "5.359952"
      const lng = parts[2] || "-4.008256"
      const mapsUrl = `https://maps.google.com/?q=${lat},${lng}`

      return (
        <div className="space-y-2 py-1 max-w-[260px]">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
            <MapPin className="h-5 w-5 text-rose-600 animate-bounce" />
            <span>{locName}</span>
          </div>
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl space-y-2">
            <p className="text-[11px] font-mono text-slate-600">Coordonnées GPS : {lat}, {lng}</p>
            <a 
              href={mapsUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-600 hover:underline"
            >
              <Share2 className="h-3.5 w-3.5" /> Ouvrir dans Google Maps
            </a>
          </div>
        </div>
      )
    }

    if (content.startsWith('[ATTACHMENT:')) {
      const parts = content.slice(12, -1).split('|')
      const filename = parts[0] || "Document"
      const mimeType = parts[1] || ""
      const dataUrl = parts.slice(2).join('|')

      const isImage = mimeType.startsWith('image/')
      const isVideo = mimeType.startsWith('video/')

      if (isImage) {
        return (
          <div className="space-y-2 py-1 max-w-[260px]">
            <img src={dataUrl} alt={filename} className="rounded-xl max-h-48 object-cover border w-full" />
            <div className="flex items-center justify-between text-xs">
              <span className="truncate max-w-[160px] font-medium">{filename}</span>
              <a href={dataUrl} download={filename} className="text-primary font-bold hover:underline">
                Télécharger
              </a>
            </div>
          </div>
        )
      }

      if (isVideo) {
        return (
          <div className="space-y-2 py-1 max-w-[280px]">
            <video controls src={dataUrl} className="rounded-xl max-h-48 w-full object-cover border" />
            <div className="flex items-center justify-between text-xs">
              <span className="truncate max-w-[160px] font-medium">{filename}</span>
              <a href={dataUrl} download={filename} className="text-primary font-bold hover:underline">
                Télécharger la vidéo
              </a>
            </div>
          </div>
        )
      }

      return (
        <div className="flex items-center gap-3 p-2 bg-slate-100/80 rounded-xl border text-slate-800">
          <Paperclip className="h-6 w-6 text-primary shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="font-bold text-xs truncate">{filename}</p>
            <a href={dataUrl} download={filename} className="text-[11px] text-primary font-bold hover:underline">
              Télécharger le document
            </a>
          </div>
        </div>
      )
    }

    return content
  }

  const handleSelectContact = (contact: any) => {
    setSelectedContact(contact)
    setShowChat(true)
    setPinnedMessage(null)
  }

  const formatCallTime = (secs: number) => {
    const mins = Math.floor(secs / 60)
    const remSecs = secs % 60
    return `${mins.toString().padStart(2, '0')}:${remSecs.toString().padStart(2, '0')}`
  }

  const renderContactButton = (contact: any) => (
    <button
      key={`${contact.role}-${contact.id}`}
      className={cn(
        "w-full p-3 flex items-center gap-3 hover:bg-slate-100/80 transition-all border-b border-slate-100 text-left rounded-xl my-1",
        selectedContact?.id === contact.id ? "bg-primary/10 border-l-4 border-l-primary font-bold" : ""
      )}
      onClick={() => handleSelectContact(contact)}
    >
      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20">
        <span className="text-xs font-black text-primary">{contact.avatar}</span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <p className="font-bold text-slate-900 text-sm truncate">{contact.name}</p>
          {contact.count && <Badge variant="secondary" className="text-[9px] font-extrabold">{contact.count} membres</Badge>}
        </div>
        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">
          {contact.role === 'teacher' ? 'Professeur' : 
           contact.role === 'student' ? 'Élève' :
           contact.role === 'parent' ? 'Parent' : 
           contact.role === 'group' ? 'Groupe de classe' : 
           contact.role === 'community' ? 'Communauté' : 'Administration'}
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

  const displayedMessages = messages.filter(m => {
    if (!inChatSearch.trim()) return true
    return (m.content || "").toLowerCase().includes(inChatSearch.toLowerCase())
  })

  return (
    <div className="flex flex-col lg:grid lg:grid-cols-3 gap-4 md:gap-6 h-[calc(100vh-160px)] md:h-[calc(100vh-200px)] max-w-7xl mx-auto">
      {/* Sidebar Contacts */}
      <Card className={cn(
        "lg:col-span-1 flex flex-col shadow-xl border-slate-200 rounded-3xl overflow-hidden bg-white",
        showChat ? "hidden lg:flex" : "flex"
      )}>
        {/* 11. STATUTS STORIES 24H BAR */}
        <div className="p-3 border-b bg-slate-100/60 flex items-center gap-3 overflow-x-auto custom-scrollbar">
          <button 
            onClick={() => setIsAddStatusOpen(true)}
            className="flex flex-col items-center shrink-0 group"
            title="Publier un statut 24h"
          >
            <div className="h-12 w-12 rounded-full border-2 border-dashed border-primary flex items-center justify-center bg-primary/10 group-hover:bg-primary/20 transition-all">
              <PlusCircle className="h-6 w-6 text-primary" />
            </div>
            <span className="text-[10px] font-bold text-slate-700 mt-1">Mon Statut</span>
          </button>

          {statusesList.map(st => (
            <button
              key={st.id}
              onClick={() => setActiveStory(st)}
              className="flex flex-col items-center shrink-0 group relative"
            >
              <div className={cn(
                "h-12 w-12 rounded-full border-2 p-0.5 flex items-center justify-center transition-transform group-hover:scale-105",
                st.isNew ? "border-emerald-500 bg-emerald-50" : "border-slate-300 bg-slate-50"
              )}>
                <div className="h-full w-full rounded-full bg-primary/20 flex items-center justify-center text-xs font-black text-primary">
                  {st.avatar}
                </div>
              </div>
              <span className="text-[10px] font-bold text-slate-700 mt-1 truncate max-w-[55px]">{st.author.split(' ')[0]}</span>
            </button>
          ))}
        </div>

        <div className="p-4 border-b bg-slate-50/50">
           <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Rechercher un contact ou groupe..."
                className="pl-9 h-10 text-xs rounded-2xl border-slate-200"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
           </div>
           
           <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid grid-cols-5 h-9 bg-slate-200/60 p-1 rounded-xl">
                 <TabsTrigger value="all" className="text-[9px] font-bold uppercase p-0">Tous</TabsTrigger>
                 <TabsTrigger value="groupes" className="text-[9px] font-bold uppercase p-0">Groupes</TabsTrigger>
                 <TabsTrigger value="profs" className="text-[9px] font-bold uppercase p-0">Profs</TabsTrigger>
                 <TabsTrigger value="class" className="text-[9px] font-bold uppercase p-0">Élèves</TabsTrigger>
                 <TabsTrigger value="family" className="text-[9px] font-bold uppercase p-0">Parents</TabsTrigger>
              </TabsList>

              <div className="mt-3 overflow-y-auto max-h-[calc(100vh-360px)] custom-scrollbar pr-1">
                 <TabsContent value="all" className="m-0">
                    {filterBySearch(allContactsList).map(renderContactButton)}
                    {filterBySearch(allContactsList).length === 0 && (
                      <p className="p-8 text-center text-xs text-slate-400 italic">Aucun contact trouvé.</p>
                    )}
                 </TabsContent>
                 <TabsContent value="groupes" className="m-0">
                    <p className="text-[11px] font-extrabold text-slate-400 px-3 py-1 uppercase">Groupes de classe & Clubs</p>
                    {filterBySearch(mockGroups).map(renderContactButton)}
                    <p className="text-[11px] font-extrabold text-slate-400 px-3 py-1 uppercase mt-3">Communautés</p>
                    {filterBySearch(mockCommunities).map(renderContactButton)}
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
            {/* Header with 3. Audio & 4. Video Call Buttons & 12. Search */}
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
                     <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                     <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                      {selectedContact.role === 'teacher' ? 'Enseignant' : 
                       selectedContact.role === 'student' ? 'Élève' : 
                       selectedContact.role === 'parent' ? 'Parent' : 
                       selectedContact.role === 'group' ? 'Groupe multi-membres' :
                       selectedContact.role === 'community' ? 'Communauté' : 'Administration'}
                     </p>
                  </div>
                </div>
              </div>

              {/* Call Controls & Search Toggle */}
              <div className="flex items-center gap-1 shrink-0">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="rounded-full h-9 w-9 text-slate-600 hover:bg-slate-200/60"
                  onClick={() => setShowInChatSearch(!showInChatSearch)}
                  title="Recherche dans la conversation"
                >
                  <Search className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="rounded-full h-9 w-9 text-emerald-600 hover:bg-emerald-50"
                  onClick={() => setIsAudioCallActive(true)}
                  title="Démarrer un appel audio"
                >
                  <Phone className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="rounded-full h-9 w-9 text-primary hover:bg-primary/10"
                  onClick={() => setIsVideoCallActive(true)}
                  title="Démarrer un appel vidéo"
                >
                  <Video className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* 12. IN-CHAT SEARCH BAR */}
            {showInChatSearch && (
              <div className="p-2.5 bg-slate-100 border-b flex items-center gap-2">
                <Search className="h-4 w-4 text-slate-400 shrink-0 ml-2" />
                <Input 
                  placeholder="Rechercher un mot dans cette conversation..."
                  className="h-8 text-xs bg-white rounded-xl border-slate-200"
                  value={inChatSearch}
                  onChange={(e) => setInChatSearch(e.target.value)}
                  autoFocus
                />
                <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full" onClick={() => { setInChatSearch(""); setShowInChatSearch(false); }}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}

            {/* 13. PINNED MESSAGE DISPLAY */}
            {pinnedMessage && (
              <div className="px-4 py-2 bg-amber-50 border-b border-amber-200 flex items-center justify-between text-xs text-amber-900">
                <div className="flex items-center gap-2 truncate">
                  <Pin className="h-4 w-4 text-amber-600 shrink-0" />
                  <span className="font-bold">Épinglé :</span>
                  <span className="truncate">{pinnedMessage.content}</span>
                </div>
                <Button variant="ghost" size="icon" className="h-6 w-6 text-amber-700" onClick={() => setPinnedMessage(null)}>
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            )}

            {/* Messages body */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 bg-slate-50/40"
            >
              {loading && messages.length === 0 ? (
                <div className="h-full flex items-center justify-center">
                   <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : displayedMessages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-3 opacity-60">
                   <div className="h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center">
                      <MessageSquare className="h-8 w-8 text-slate-400" />
                   </div>
                   <div>
                      <p className="font-bold text-slate-800 text-sm">Début de la conversation</p>
                      <p className="text-xs text-slate-500">Envoyez des messages, photos, vidéos, documents ou note vocale.</p>
                   </div>
                </div>
              ) : (
                displayedMessages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      "flex group",
                      message.sender === "me" ? "justify-end" : "justify-start"
                    )}
                  >
                    <div className={cn(
                      "max-w-[85%] sm:max-w-[75%] space-y-1 relative",
                      message.sender === "me" ? "items-end" : "items-start"
                    )}>
                       <div
                        className={cn(
                          "rounded-2xl px-4 py-2.5 shadow-sm text-sm border font-medium relative group",
                          message.sender === "me"
                            ? "bg-primary text-white border-primary rounded-br-none"
                            : "bg-white text-slate-900 border-slate-200 rounded-bl-none"
                        )}
                      >
                        {renderMessageContent(message.content)}
                        
                        {/* 7. EMOJI REACTION DISPLAY */}
                        {message.reaction && (
                          <span className="absolute -bottom-2 right-2 bg-white border rounded-full px-1.5 py-0.5 text-xs shadow-sm">
                            {message.reaction}
                          </span>
                        )}

                        {/* Interactive reaction emojis on hover & Pin action */}
                        <div className="absolute hidden group-hover:flex items-center gap-1 bg-white border shadow-lg rounded-full p-1 -top-8 right-0 z-10">
                          {["❤️", "👍", "😮", "😂", "🔥", "👏"].map(emoji => (
                            <button
                              key={emoji}
                              type="button"
                              onClick={() => {
                                setMessages(prev => prev.map(m => m.id === message.id ? { ...m, reaction: emoji } : m))
                              }}
                              className="hover:scale-125 transition-transform text-xs"
                            >
                              {emoji}
                            </button>
                          ))}
                          <button
                            type="button"
                            onClick={() => {
                              setPinnedMessage(message)
                              toast.success("Message épinglé en haut de la discussion !")
                            }}
                            className="p-1 hover:text-amber-600 transition-colors border-l ml-1 pl-1"
                            title="Épingler le message"
                          >
                            <Pin className="h-3.5 w-3.5 text-slate-600" />
                          </button>
                        </div>
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
            <div className="p-3 md:p-4 border-t bg-white relative">
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileSelect} 
                className="hidden" 
                accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.zip"
              />

              {/* 8. STICKERS & GIF PICKER POPOVER */}
              {showStickers && (
                <div className="absolute bottom-16 left-4 bg-white border border-slate-200 shadow-2xl rounded-2xl p-3 z-20 w-64 space-y-2">
                  <p className="text-xs font-bold text-slate-700 border-b pb-1">Stickers & Émojis</p>
                  <div className="grid grid-cols-5 gap-2">
                    {stickersList.map(st => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => sendSticker(st)}
                        className="text-2xl hover:scale-125 transition-transform p-1 rounded-lg hover:bg-slate-100"
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {isRecordingVoice ? (
                <div className="flex items-center justify-between p-2.5 bg-rose-50 border border-rose-200 rounded-2xl animate-pulse">
                  <div className="flex items-center gap-3">
                    <div className="h-3 w-3 rounded-full bg-rose-600 animate-ping" />
                    <span className="text-sm font-bold text-rose-700">Enregistrement vocal en cours...</span>
                    <span className="text-xs font-mono font-bold text-rose-600">
                      0:{recordingSeconds < 10 ? '0' : ''}{recordingSeconds}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="sm" 
                      className="text-slate-600 font-bold hover:bg-rose-100 rounded-xl"
                      onClick={() => stopVoiceRecording(true)}
                    >
                      Annuler
                    </Button>
                    <Button 
                      type="button" 
                      size="sm" 
                      className="bg-rose-600 text-white font-bold rounded-xl hover:bg-rose-700"
                      onClick={() => stopVoiceRecording(false)}
                    >
                      <Send className="h-4 w-4 mr-1" /> Envoyer
                    </Button>
                  </div>
                </div>
              ) : (
                <form className="flex items-center gap-2" onSubmit={handleSend}>
                  {/* 5 & 6. FILE ATTACHMENT BUTTON */}
                  <Button 
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="rounded-xl hover:bg-slate-50 shrink-0 text-slate-500"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={sending}
                    title="Partager photos, vidéos ou documents"
                  >
                    <Paperclip className="h-5 w-5" />
                  </Button>

                  {/* 8. STICKER BUTTON */}
                  <Button 
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="rounded-xl hover:bg-slate-50 shrink-0 text-slate-500"
                    onClick={() => setShowStickers(!showStickers)}
                    disabled={sending}
                    title="Stickers & GIF"
                  >
                    <Smile className="h-5 w-5" />
                  </Button>

                  {/* 14. LOCATION SHARING BUTTON */}
                  <Button 
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="rounded-xl hover:bg-slate-50 shrink-0 text-slate-500 hover:text-rose-600"
                    onClick={handleShareLocation}
                    disabled={sending}
                    title="Partager ma position en direct"
                  >
                    <MapPin className="h-5 w-5" />
                  </Button>

                  {/* 2. VOICE NOTE BUTTON */}
                  <Button 
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="rounded-xl hover:bg-slate-50 shrink-0 text-slate-500 hover:text-rose-600"
                    onClick={startVoiceRecording}
                    disabled={sending}
                    title="Enregistrer un message vocal"
                  >
                    <Mic className="h-5 w-5" />
                  </Button>

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
              )}
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
                   Choisissez un contact ou groupe à gauche pour échanger en direct.
                </p>
             </div>
          </div>
        )}
      </Card>

      {/* 3. AUDIO CALL MODAL */}
      <Dialog open={isAudioCallActive} onOpenChange={setIsAudioCallActive}>
        <DialogContent className="sm:max-w-md rounded-3xl p-8 bg-slate-900 text-white border-slate-800 text-center space-y-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-300">Appel Audio MonÉcole+</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="relative mx-auto w-24 h-24 rounded-full bg-primary/20 border-4 border-primary flex items-center justify-center animate-pulse">
              <span className="text-2xl font-black text-white">{selectedContact?.avatar || "A"}</span>
            </div>
            <div>
              <h3 className="text-xl font-black text-white">{selectedContact?.name}</h3>
              <p className="text-xs text-emerald-400 font-mono mt-1">En cours... ({formatCallTime(callDuration)})</p>
            </div>
          </div>

          <div className="flex items-center justify-center gap-6 pt-4">
            <Button 
              variant="outline" 
              size="icon" 
              className={cn("h-12 w-12 rounded-full border-slate-700 bg-slate-800 text-white hover:bg-slate-700", isMuted && "bg-rose-600 border-rose-600")}
              onClick={() => setIsMuted(!isMuted)}
            >
              <MicOff className="h-5 w-5" />
            </Button>

            <Button 
              size="icon" 
              className="h-14 w-14 rounded-full bg-rose-600 hover:bg-rose-700 text-white shadow-xl shadow-rose-900/50"
              onClick={() => { setIsAudioCallActive(false); toast.info("Appel audio terminé."); }}
            >
              <Phone className="h-6 w-6 rotate-[135deg]" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* 4. VIDEO CALL MODAL */}
      <Dialog open={isVideoCallActive} onOpenChange={setIsVideoCallActive}>
        <DialogContent className="sm:max-w-lg rounded-3xl p-6 bg-slate-950 text-white border-slate-800 text-center space-y-4">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold text-slate-400 flex items-center justify-center gap-2">
              <Video className="h-4 w-4 text-primary" /> Appel Vidéo HD MonÉcole+ ({formatCallTime(callDuration)})
            </DialogTitle>
          </DialogHeader>

          <div className="relative h-64 w-full bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 flex items-center justify-center">
            {isVideoOff ? (
              <div className="text-center space-y-2">
                <VideoOff className="h-10 w-10 text-slate-500 mx-auto" />
                <p className="text-xs text-slate-400">Caméra désactivée</p>
              </div>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-slate-900 to-slate-950">
                <div className="h-20 w-20 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center font-black text-2xl">
                  {selectedContact?.avatar || "V"}
                </div>
                <Badge className="absolute top-3 left-3 bg-rose-600 text-white font-bold text-[10px] animate-pulse">EN DIRECT</Badge>
              </div>
            )}

            {/* Self picture-in-picture preview */}
            <div className="absolute bottom-3 right-3 h-20 w-28 bg-slate-800 rounded-xl border border-white/20 flex items-center justify-center overflow-hidden">
              <span className="text-[10px] font-bold text-slate-300">Ma Caméra</span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-4 pt-2">
            <Button 
              variant="outline" 
              size="icon" 
              className={cn("h-11 w-11 rounded-full border-slate-800 bg-slate-900 text-white hover:bg-slate-800", isMuted && "bg-rose-600 border-rose-600")}
              onClick={() => setIsMuted(!isMuted)}
            >
              <MicOff className="h-5 w-5" />
            </Button>

            <Button 
              variant="outline" 
              size="icon" 
              className={cn("h-11 w-11 rounded-full border-slate-800 bg-slate-900 text-white hover:bg-slate-800", isVideoOff && "bg-rose-600 border-rose-600")}
              onClick={() => setIsVideoOff(!isVideoOff)}
            >
              <VideoOff className="h-5 w-5" />
            </Button>

            <Button 
              size="icon" 
              className="h-12 w-12 rounded-full bg-rose-600 hover:bg-rose-700 text-white shadow-xl shadow-rose-900/50"
              onClick={() => { setIsVideoCallActive(false); toast.info("Appel vidéo terminé."); }}
            >
              <Phone className="h-5 w-5 rotate-[135deg]" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* 11. VIEW STATUS STORY MODAL */}
      <Dialog open={!!activeStory} onOpenChange={(open) => !open && setActiveStory(null)}>
        <DialogContent className="sm:max-w-md rounded-3xl p-6 bg-slate-900 text-white border-slate-800 space-y-4">
          {activeStory && (
            <div>
              <div className="h-1 bg-emerald-500 rounded-full w-full mb-4 animate-pulse" />
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary">
                    {activeStory.avatar}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-white">{activeStory.author}</h4>
                    <p className="text-[10px] text-slate-400">{activeStory.role} • {activeStory.time}</p>
                  </div>
                </div>
                <Badge className="bg-emerald-500 text-white font-bold text-[10px]">Statut 24h</Badge>
              </div>

              <div className="py-8 px-4 text-center min-h-[140px] flex items-center justify-center bg-slate-950/60 rounded-2xl my-4 border border-slate-800">
                <p className="text-base font-medium text-slate-100 leading-relaxed">{activeStory.text}</p>
              </div>

              <Button className="w-full rounded-xl bg-slate-800 text-white font-bold hover:bg-slate-700 border border-slate-700" onClick={() => setActiveStory(null)}>
                Fermer
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* PUBLISH STATUS MODAL */}
      <Dialog open={isAddStatusOpen} onOpenChange={setIsAddStatusOpen}>
        <DialogContent className="sm:max-w-md rounded-3xl p-6">
          <form onSubmit={handleAddStatus} className="space-y-4">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold">Publier un Statut 24h</DialogTitle>
            </DialogHeader>
            <div className="space-y-2">
              <Label>Message ou annonce visible 24 heures</Label>
              <Input
                placeholder="Ex: Devoir de Physique déplacé, pensez à réviser !"
                value={newStatusText}
                onChange={(e) => setNewStatusText(e.target.value)}
                required
                className="rounded-xl"
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAddStatusOpen(false)} className="rounded-xl">Annuler</Button>
              <Button type="submit" className="rounded-xl bg-primary text-white font-bold border-none">Publier aux contacts</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

