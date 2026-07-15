"use client"

import { 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  Globe,
  Users,
  GraduationCap,
  BookOpen,
  Calendar,
  Clock,
  Save,
  Upload
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function AdminSchoolPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Configuration de l&apos;établissement</h1>
          <p className="text-muted-foreground">Gérez les informations de votre établissement</p>
        </div>
        <Button className="gap-2">
          <Save className="h-4 w-4" />
          Enregistrer
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Informations générales */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" />
                Informations générales
              </CardTitle>
              <CardDescription>Détails principaux de l&apos;établissement</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="schoolName">Nom de l&apos;établissement</Label>
                  <Input id="schoolName" defaultValue="Lycée Victor Hugo" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="schoolType">Type d&apos;établissement</Label>
                  <Select defaultValue="lycee">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="maternelle">École maternelle</SelectItem>
                      <SelectItem value="primaire">École primaire</SelectItem>
                      <SelectItem value="college">Collège</SelectItem>
                      <SelectItem value="lycee">Lycée</SelectItem>
                      <SelectItem value="universite">Université</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="uai">Code UAI</Label>
                  <Input id="uai" defaultValue="0750001A" className="font-mono" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="academie">Académie</Label>
                  <Select defaultValue="paris">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="paris">Paris</SelectItem>
                      <SelectItem value="versailles">Versailles</SelectItem>
                      <SelectItem value="creteil">Créteil</SelectItem>
                      <SelectItem value="lyon">Lyon</SelectItem>
                      <SelectItem value="marseille">Aix-Marseille</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description" 
                  rows={3}
                  defaultValue="Établissement d'enseignement général et technologique, le Lycée Victor Hugo accueille plus de 1200 élèves de la seconde à la terminale."
                />
              </div>
            </CardContent>
          </Card>

          {/* Coordonnées */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                Coordonnées
              </CardTitle>
              <CardDescription>Adresse et informations de contact</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="address">Adresse</Label>
                <Input id="address" defaultValue="27 Rue de la Réunion" />
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="postalCode">Code postal</Label>
                  <Input id="postalCode" defaultValue="75020" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="city">Ville</Label>
                  <Input id="city" defaultValue="Paris" />
                </div>
              </div>

              <Separator />

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="phone">Téléphone</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input id="phone" defaultValue="01 43 70 12 34" className="pl-9" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input id="email" type="email" defaultValue="contact@lycee-vhugo.fr" className="pl-9" />
                  </div>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="website">Site web</Label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input id="website" defaultValue="https://lycee-vhugo.fr" className="pl-9" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Horaires */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Horaires d&apos;ouverture
              </CardTitle>
              <CardDescription>Plages horaires de l&apos;établissement</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Ouverture</Label>
                  <Input type="time" defaultValue="07:30" />
                </div>
                <div className="space-y-2">
                  <Label>Fermeture</Label>
                  <Input type="time" defaultValue="18:00" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Jours d&apos;ouverture</Label>
                <div className="flex flex-wrap gap-2">
                  {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((day, i) => (
                    <Badge 
                      key={day}
                      variant={i < 5 ? "default" : "outline"}
                      className={`cursor-pointer ${i < 5 ? 'bg-primary' : ''}`}
                    >
                      {day}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {/* Logo */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle>Logo de l&apos;établissement</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex aspect-square items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/30">
                <div className="text-center">
                  <Building2 className="mx-auto h-12 w-12 text-muted-foreground" />
                  <p className="mt-2 text-sm text-muted-foreground">Logo non défini</p>
                </div>
              </div>
              <Button variant="outline" className="w-full gap-2">
                <Upload className="h-4 w-4" />
                Téléverser un logo
              </Button>
            </CardContent>
          </Card>

          {/* Statistiques */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle>Statistiques</CardTitle>
              <CardDescription>Aperçu de l&apos;établissement</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-lg bg-primary/5 p-3">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-primary/10 p-2">
                    <GraduationCap className="h-5 w-5 text-primary" />
                  </div>
                  <span className="font-medium">Élèves</span>
                </div>
                <span className="text-2xl font-bold text-primary">1,247</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-accent/5 p-3">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-accent/10 p-2">
                    <BookOpen className="h-5 w-5 text-accent" />
                  </div>
                  <span className="font-medium">Enseignants</span>
                </div>
                <span className="text-2xl font-bold text-accent">89</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-green-500/5 p-3">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-green-500/10 p-2">
                    <Users className="h-5 w-5 text-green-500" />
                  </div>
                  <span className="font-medium">Parents</span>
                </div>
                <span className="text-2xl font-bold text-green-500">2,341</span>
              </div>
            </CardContent>
          </Card>

          {/* Année scolaire */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Année scolaire
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Année en cours</Label>
                <Select defaultValue="2025-2026">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2024-2025">2024-2025</SelectItem>
                    <SelectItem value="2025-2026">2025-2026</SelectItem>
                    <SelectItem value="2026-2027">2026-2027</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Début de l&apos;année</Label>
                <Input type="date" defaultValue="2025-09-01" />
              </div>
              <div className="space-y-2">
                <Label>Fin de l&apos;année</Label>
                <Input type="date" defaultValue="2026-07-04" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
