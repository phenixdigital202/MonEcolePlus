"use client"

import { useState, useRef } from "react"
import { useTheme } from "next-themes"
import { 
  User, 
  Bell, 
  Shield, 
  Palette, 
  Key, 
  Mail, 
  Save, 
  Camera, 
  CheckCircle2, 
  School,
  Loader2,
  AlertCircle
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { updateUserProfilePhotoAction, updateUserProfileInfoAction, changeUserPasswordAction } from "@/lib/user-actions"

interface SettingsViewProps {
  user: {
    id: number
    nom: string
    email: string
    role: string
    avatar_url?: string | null
    inscriptions?: any[]
  }
}

export function SettingsView({ user }: SettingsViewProps) {
  const { theme, setTheme } = useTheme()
  const fileInputRef = useRef<HTMLInputElement>(null)

  // User details state
  const nameParts = (user.nom || "").trim().split(' ')
  const initialFirstName = nameParts[0] || ""
  const initialLastName = nameParts.slice(1).join(' ') || ""

  const [firstName, setFirstName] = useState(initialFirstName)
  const [lastName, setLastName] = useState(initialLastName)
  const [email, setEmail] = useState(user.email || "")
  const [avatarUrl, setAvatarUrl] = useState<string | null>(user.avatar_url || null)

  // Status & Feedback states
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false)
  const [photoMessage, setPhotoMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const [isSavingProfile, setIsSavingProfile] = useState(false)
  const [profileMessage, setProfileMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  // Password states
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [passwordMessage, setPasswordMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    sms: false,
    grades: true,
    absences: true,
    messages: true,
    reports: false
  })

  const isStudent = user.role === 'student'
  const currentClass = user.inscriptions?.[0]?.classe?.nom || "N/A"

  // 1. PHOTO CHANGE HANDLER
  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      setPhotoMessage({ type: "error", text: "La photo de profil ne doit pas dépasser 5 Mo." })
      return
    }

    setIsUploadingPhoto(true)
    setPhotoMessage(null)

    const reader = new FileReader()
    reader.onload = async () => {
      const base64Data = reader.result as string
      const result = await updateUserProfilePhotoAction(base64Data)

      if (result.success && result.avatar_url) {
        setAvatarUrl(result.avatar_url)
        setPhotoMessage({ type: "success", text: "Photo de profil mise à jour avec succès !" })
      } else {
        setPhotoMessage({ type: "error", text: result.error || "Échec de la mise à jour de la photo." })
      }
      setIsUploadingPhoto(false)
    }

    reader.onerror = () => {
      setPhotoMessage({ type: "error", text: "Erreur lors de la lecture du fichier." })
      setIsUploadingPhoto(false)
    }

    reader.readAsDataURL(file)
  }

  // 2. PROFILE EDIT HANDLER
  const handleSaveProfile = async () => {
    setIsSavingProfile(true)
    setProfileMessage(null)

    const result = await updateUserProfileInfoAction({
      firstName,
      lastName,
      email
    })

    if (result.success) {
      setProfileMessage({ type: "success", text: "Informations personnelles enregistrées avec succès !" })
    } else {
      setProfileMessage({ type: "error", text: result.error || "Erreur lors de l'enregistrement." })
    }
    setIsSavingProfile(false)
  }

  // 3. PASSWORD CHANGE HANDLER
  const handleChangePassword = async () => {
    setIsChangingPassword(true)
    setPasswordMessage(null)

    const result = await changeUserPasswordAction({
      currentPassword,
      newPassword,
      confirmPassword
    })

    if (result.success) {
      setPasswordMessage({ type: "success", text: "Mot de passe modifié avec succès !" })
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } else {
      setPasswordMessage({ type: "error", text: result.error || "Erreur lors du changement de mot de passe." })
    }
    setIsChangingPassword(false)
  }

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Paramètres</h1>
          <p className="text-muted-foreground">
            {isStudent 
              ? "Gérez vos préférences personnelles et votre compte élève" 
              : "Gérez vos préférences et vos outils administratifs"}
          </p>
        </div>
      </div>

      <Tabs defaultValue="profile" className="space-y-6 w-full">
        <div className="w-full overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-none">
          <TabsList className="bg-muted/50 w-full justify-start md:justify-center flex h-auto p-1 flex-wrap md:flex-nowrap gap-1">
            <TabsTrigger value="profile" className="gap-2 flex-1 md:flex-initial shrink-0">
              <User className="h-4 w-4" />
              Profil
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2 flex-1 md:flex-initial shrink-0">
              <Bell className="h-4 w-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="security" className="gap-2 flex-1 md:flex-initial shrink-0">
              <Shield className="h-4 w-4" />
              Sécurité
            </TabsTrigger>
            <TabsTrigger value="appearance" className="gap-2 flex-1 md:flex-initial shrink-0">
              <Palette className="h-4 w-4" />
              Apparence
            </TabsTrigger>
          </TabsList>
        </div>

        {/* TAB 1: MON PROFIL */}
        <TabsContent value="profile" className="space-y-6">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle>Informations personnelles</CardTitle>
              <CardDescription>Mettez à jour vos informations de profil</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 text-center sm:text-left">
                <Avatar className="h-20 w-20 border-2 border-primary/20">
                  {avatarUrl ? (
                    <AvatarImage src={avatarUrl} alt={user.nom} />
                  ) : (
                    <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">
                      {(user.nom || "U").substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  )}
                </Avatar>

                <div className="space-y-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    className="hidden"
                    onChange={handlePhotoSelect}
                  />
                  <Button 
                    variant="outline" 
                    className="w-full sm:w-auto gap-2"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingPhoto}
                  >
                    {isUploadingPhoto ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Camera className="h-4 w-4" />
                    )}
                    {isUploadingPhoto ? "Téléversement..." : "Changer la photo"}
                  </Button>

                  {photoMessage && (
                    <div className={`text-xs flex items-center gap-1.5 font-medium ${photoMessage.type === "success" ? "text-emerald-600" : "text-destructive"}`}>
                      {photoMessage.type === "success" ? <CheckCircle2 className="h-3.5 w-3.5" /> : <AlertCircle className="h-3.5 w-3.5" />}
                      {photoMessage.text}
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              {profileMessage && (
                <div className={`p-3 rounded-lg flex items-center gap-2 text-sm border ${profileMessage.type === "success" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-destructive/10 text-destructive border-destructive/20"}`}>
                  {profileMessage.type === "success" ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                  {profileMessage.text}
                </div>
              )}

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Prénom</Label>
                  <Input 
                    id="firstName" 
                    value={firstName} 
                    onChange={(e) => setFirstName(e.target.value)} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Nom</Label>
                  <Input 
                    id="lastName" 
                    value={lastName} 
                    onChange={(e) => setLastName(e.target.value)} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Statut</Label>
                  <Input 
                    id="role" 
                    value={user.role === 'student' ? 'Élève' : user.role === 'admin' ? 'Administrateur' : user.role === 'teacher' ? 'Enseignant' : 'Parent'} 
                    readOnly 
                    className="bg-muted font-medium" 
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button 
                  id="btn-save-profile"
                  type="button"
                  className="w-full sm:w-auto gap-2"
                  onClick={handleSaveProfile}
                  disabled={isSavingProfile}
                >
                  {isSavingProfile ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  {isSavingProfile ? "Enregistrement..." : "Enregistrer les modifications"}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader>
              <CardTitle>{isStudent ? "Informations Scolaires" : "Rôle et établissement"}</CardTitle>
              <CardDescription>Détails sur votre compte actuel</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>{isStudent ? "Ma Classe" : "Rôle"}</Label>
                  <div className="flex items-center gap-2 rounded-lg bg-primary/10 px-3 py-2 text-primary font-medium">
                    {isStudent ? <School className="h-4 w-4" /> : <User className="h-4 w-4" />}
                    {isStudent ? currentClass : user.role === "admin" ? "Administrateur" : "Enseignant"}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Établissement</Label>
                  <div className="rounded-lg bg-muted px-3 py-2 text-foreground font-medium">
                    Mon Établissement
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Identifiant ID</Label>
                  <div className="rounded-lg bg-muted px-3 py-2 font-mono text-sm text-muted-foreground">
                    #{user.id.toString().padStart(5, '0')}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 2: NOTIFICATIONS */}
        <TabsContent value="notifications" className="space-y-6">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle>Canaux de notification</CardTitle>
              <CardDescription>Choisissez comment vous souhaitez être notifié</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-primary/10 p-2">
                    <Mail className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Notifications par email</p>
                    <p className="text-sm text-muted-foreground">Recevoir les alertes par email</p>
                  </div>
                </div>
                <Switch 
                  checked={notifications.email}
                  onCheckedChange={(checked) => setNotifications({...notifications, email: checked})}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-accent/10 p-2">
                    <Bell className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <p className="font-medium">Notifications push</p>
                    <p className="text-sm text-muted-foreground">Notifications dans le navigateur</p>
                  </div>
                </div>
                <Switch 
                  checked={notifications.push}
                  onCheckedChange={(checked) => setNotifications({...notifications, push: checked})}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader>
              <CardTitle>Types de notifications</CardTitle>
              <CardDescription>Sélectionnez les événements pour lesquels vous souhaitez être alerté</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { key: 'grades', label: 'Nouvelles notes', desc: 'Quand une note est ajoutée' },
                { key: 'absences', label: 'Absences', desc: 'Signalement d\'absences' },
                { key: 'messages', label: 'Messages', desc: 'Nouveaux messages reçus' },
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between rounded-lg border border-border/50 p-4">
                  <div>
                    <p className="font-medium">{item.label}</p>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                  <Switch 
                    checked={notifications[item.key as keyof typeof notifications]}
                    onCheckedChange={(checked) => setNotifications({...notifications, [item.key]: checked})}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 3: SÉCURITÉ */}
        <TabsContent value="security" className="space-y-6">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle>Mot de passe</CardTitle>
              <CardDescription>Modifiez votre mot de passe de connexion</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {passwordMessage && (
                <div className={`p-3 rounded-lg flex items-center gap-2 text-sm border ${passwordMessage.type === "success" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-destructive/10 text-destructive border-destructive/20"}`}>
                  {passwordMessage.type === "success" ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                  {passwordMessage.text}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="currentPassword">Mot de passe actuel</Label>
                <Input 
                  id="currentPassword" 
                  type="password" 
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">Nouveau mot de passe</Label>
                <Input 
                  id="newPassword" 
                  type="password" 
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmer le nouveau mot de passe</Label>
                <Input 
                  id="confirmPassword" 
                  type="password" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
              <Button 
                id="btn-change-password"
                type="button"
                className="gap-2"
                onClick={handleChangePassword}
                disabled={isChangingPassword}
              >
                {isChangingPassword ? <Loader2 className="h-4 w-4 animate-spin" /> : <Key className="h-4 w-4" />}
                {isChangingPassword ? "Modification..." : "Modifier le mot de passe"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 4: APPARENCE */}
        <TabsContent value="appearance" className="space-y-6">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle>Thème</CardTitle>
              <CardDescription>Personnalisez l&apos;apparence de l&apos;application</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Mode d&apos;affichage</Label>
                <Select value={theme || "system"} onValueChange={(val) => setTheme(val)}>
                  <SelectTrigger className="w-full md:w-64">
                    <SelectValue placeholder="Choisir un thème" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Clair</SelectItem>
                    <SelectItem value="dark">Sombre</SelectItem>
                    <SelectItem value="system">Système</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
