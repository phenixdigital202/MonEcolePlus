"use client"

import { useState } from "react"
import { 
  User, 
  Bell, 
  Shield, 
  Palette, 
  Key,
  Mail,
  Smartphone,
  Save,
  Camera,
  CheckCircle2,
  School
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

interface SettingsViewProps {
  user: {
    id: number
    nom: string
    email: string
    role: string
    inscriptions?: any[]
  }
}

export function SettingsView({ user }: SettingsViewProps) {
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    sms: false,
    grades: true,
    absences: true,
    messages: true,
    reports: false
  })

  const firstName = user.nom.split(' ')[0] || ""
  const lastName = user.nom.split(' ').slice(1).join(' ') || ""
  const isStudent = user.role === 'student'
  const currentClass = user.inscriptions?.[0]?.classe?.nom || "N/A"

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex justify-between items-start">
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

        <TabsContent value="profile" className="space-y-6">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle>Informations personnelles</CardTitle>
              <CardDescription>Mettez à jour vos informations de profil</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 text-center sm:text-left">
                <Avatar className="h-20 w-20">
                  <AvatarFallback className="bg-primary/10 text-primary text-xl">
                    {user.nom.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <Button variant="outline" className="w-full sm:w-auto gap-2">
                  <Camera className="h-4 w-4" />
                  Changer la photo
                </Button>
              </div>

              <Separator />

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Prénom</Label>
                  <Input id="firstName" defaultValue={firstName} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Nom</Label>
                  <Input id="lastName" defaultValue={lastName} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" defaultValue={user.email} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Statut</Label>
                  <Input id="role" defaultValue={user.role === 'student' ? 'Élève' : 'Enseignant'} readOnly className="bg-muted" />
                </div>
              </div>

              <div className="flex justify-end">
                <Button className="w-full sm:w-auto gap-2">
                  <Save className="h-4 w-4" />
                  Enregistrer les modifications
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader>
              <CardTitle>{isStudent ? "Informations Scolaires" : "Rôle et établissement"}</CardTitle>
              <CardDescription>Détails sur votre inscription actuelle</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>{isStudent ? "Ma Classe" : "Rôle"}</Label>
                  <div className="flex items-center gap-2 rounded-lg bg-primary/10 px-3 py-2 text-primary">
                    {isStudent ? <School className="h-4 w-4" /> : <User className="h-4 w-4" />}
                    {isStudent ? currentClass : "Enseignant"}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Établissement</Label>
                  <div className="rounded-lg bg-muted px-3 py-2 text-foreground font-medium">
                    Mon Établissement
                  </div>
                </div>
                {isStudent && (
                   <div className="space-y-2">
                    <Label>Année Scolaire</Label>
                    <div className="rounded-lg bg-muted px-3 py-2 text-foreground">
                      2025-2026
                    </div>
                  </div>
                )}
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

        <TabsContent value="security" className="space-y-6">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle>Mot de passe</CardTitle>
              <CardDescription>Modifiez votre mot de passe de connexion</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Mot de passe actuel</Label>
                <Input id="currentPassword" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">Nouveau mot de passe</Label>
                <Input id="newPassword" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmer le nouveau mot de passe</Label>
                <Input id="confirmPassword" type="password" />
              </div>
              <Button className="gap-2">
                <Key className="h-4 w-4" />
                Modifier le mot de passe
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-6">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle>Thème</CardTitle>
              <CardDescription>Personnalisez l&apos;apparence de l&apos;application</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Mode d&apos;affichage</Label>
                <Select defaultValue="system">
                  <SelectTrigger>
                    <SelectValue />
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
