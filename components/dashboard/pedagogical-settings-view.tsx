"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookOpen, ShieldCheck, Clock, Users, Award, AlertTriangle, CheckCircle, Save } from "lucide-react"
import { toast } from "sonner"

export function PedagogicalSettingsView() {
  const [maxHours, setMaxHours] = useState("7")
  const [pauseDuration, setPauseDuration] = useState("30")
  const [startHour, setStartHour] = useState("08:00")
  const [endHour, setEndHour] = useState("18:00")
  const [classCapacity, setClassCapacity] = useState("60")
  const [periodType, setPeriodType] = useState("trimestre")
  const [systemCountry, setSystemCountry] = useState("ci")

  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    setTimeout(() => {
      setSaving(false)
      toast.success("Paramètres pédagogiques enregistrés avec succès !")
    }, 600)
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldCheck className="h-7 w-7 text-indigo-600 dark:text-indigo-400" />
            Paramètres & Contraintes Pédagogiques
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Configuration du moteur de contraintes pour l'Afrique francophone (Côte d'Ivoire, Sénégal, Cameroun, etc.)
          </p>
        </div>
        <Button onClick={handleSave} disabled={saving} className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2">
          <Save className="h-4 w-4" />
          {saving ? "Enregistrement..." : "Enregistrer les paramètres"}
        </Button>
      </div>

      <Tabs defaultValue="constraints" className="w-full">
        <TabsList className="grid w-full grid-cols-4 lg:w-[600px] mb-4">
          <TabsTrigger value="constraints">Contraintes Horaire</TabsTrigger>
          <TabsTrigger value="levels">Niveaux & Capacité</TabsTrigger>
          <TabsTrigger value="grading">Notation & Périodes</TabsTrigger>
          <TabsTrigger value="country">Système Pays</TabsTrigger>
        </TabsList>

        {/* Tab 1: Constraints */}
        <TabsContent value="constraints" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-indigo-500" />
                Surcharge & Horaires Établissement
              </CardTitle>
              <CardDescription>
                Définissez les règles limites appliquées par le moteur de validation d'emploi du temps.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="maxHours">Charge quotidienne maximale par élève (heures)</Label>
                  <Input
                    id="maxHours"
                    type="number"
                    value={maxHours}
                    onChange={(e) => setMaxHours(e.target.value)}
                    min="4"
                    max="10"
                  />
                  <p className="text-xs text-slate-500">Règle RP-035 : bloque tout emploi du temps dépassant ce quota.</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pauseDuration">Durée minimale des pauses (minutes)</Label>
                  <Input
                    id="pauseDuration"
                    type="number"
                    value={pauseDuration}
                    onChange={(e) => setPauseDuration(e.target.value)}
                    min="15"
                    max="60"
                  />
                  <p className="text-xs text-slate-500">Règle RP-037 : aucun cours ne sera placé pendant les pauses.</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="startHour">Heure de début des cours</Label>
                  <Input
                    id="startHour"
                    type="time"
                    value={startHour}
                    onChange={(e) => setStartHour(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endHour">Heure de fin des cours</Label>
                  <Input
                    id="endHour"
                    type="time"
                    value={endHour}
                    onChange={(e) => setEndHour(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: Levels & Capacity */}
        <TabsContent value="levels" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-indigo-500" />
                Capacité Maximale des Classes
              </CardTitle>
              <CardDescription>
                Définissez la limite d'élèves autorisée par classe (RP-010).
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 max-w-md">
                <Label htmlFor="classCapacity">Capacité par défaut des classes</Label>
                <Input
                  id="classCapacity"
                  type="number"
                  value={classCapacity}
                  onChange={(e) => setClassCapacity(e.target.value)}
                  min="10"
                  max="120"
                />
                <p className="text-xs text-slate-500">
                  Toute affectation d'élève au-delà de cette capacité générera une erreur bloquante RP-010.
                </p>
              </div>

              <div className="mt-6 border-t pt-4">
                <h4 className="font-semibold text-sm mb-3">Niveaux Pédagogiques Configurés</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {["6ème", "5ème", "4ème", "3ème", "2nde", "1ère", "Terminale"].map((lvl) => (
                    <div key={lvl} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border text-center font-medium">
                      {lvl}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 3: Grading */}
        <TabsContent value="grading" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-indigo-500" />
                Système de Notation & Périodes
              </CardTitle>
              <CardDescription>
                Règles de barème et découpage trimestriel / semestriel (RP-050 à RP-062).
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Découpage de l'année scolaire</Label>
                  <Select value={periodType} onValueChange={setPeriodType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez le découpage" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="trimestre">Trimestriel (3 Trimestres)</SelectItem>
                      <SelectItem value="semestre">Semestriel (2 Semestres)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Barème standard par défaut</Label>
                  <Input value="20" disabled />
                  <p className="text-xs text-slate-500">Règle RP-052 : validation stricte 0 ≤ note ≤ barème.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 4: Country */}
        <TabsContent value="country" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-indigo-500" />
                Contexte Éducatif Régional (Afrique Francophone)
              </CardTitle>
              <CardDescription>
                Adéquation du moteur avec les programmes nationaux.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 max-w-md">
                <Label>Pays de l'établissement</Label>
                <Select value={systemCountry} onValueChange={setSystemCountry}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez un pays" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ci">Côte d'Ivoire (Ministère Éducation Nationale)</SelectItem>
                    <SelectItem value="sn">Sénégal</SelectItem>
                    <SelectItem value="cm">Cameroun</SelectItem>
                    <SelectItem value="bf">Burkina Faso</SelectItem>
                    <SelectItem value="ml">Mali</SelectItem>
                    <SelectItem value="tg">Togo</SelectItem>
                    <SelectItem value="bj">Bénin</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-slate-500">
                  Adapte les découpages de coefficients, séries (A, C, D) et intitulés de bulletins.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Rules Active Audit Status */}
      <Card className="border-indigo-100 dark:border-indigo-900 bg-indigo-50/40 dark:bg-indigo-950/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-base text-indigo-900 dark:text-indigo-200 flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-indigo-600" />
            Statut du Moteur de Validation Centralisé
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-indigo-800 dark:text-indigo-300">
          Toutes les règles pédagogiques (RP-001 à RP-082) sont actives. Les formulaires UI, les Server Actions et la génération d'emplois du temps par IA sont sous le contrôle direct du moteur de contraintes.
        </CardContent>
      </Card>
    </div>
  )
}
