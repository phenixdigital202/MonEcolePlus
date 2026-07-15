"use client"

import { useState, useEffect } from "react"
import { Search, School, ArrowRight, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { getAvailableSchools } from "@/lib/school-actions"

export function TenantSelector() {
  const [schools, setSchools] = useState<any[]>([])
  const [filteredSchools, setFilteredSchools] = useState<any[]>([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const result = await getAvailableSchools()
      if (result.success) {
        setSchools(result.schools || [])
        setFilteredSchools(result.schools || [])
      }
      setLoading(false)
    }
    load()
  }, [])

  useEffect(() => {
    const term = search.toLowerCase()
    setFilteredSchools(
      schools.filter(s => s.nom.toLowerCase().includes(term))
    )
  }, [search, schools])

  const handleGo = (subdomain: string) => {
    // Determine the environment to construct the URL
    const host = window.location.host
    let newUrl = ""
    
    if (host.includes('localhost')) {
      newUrl = `http://${subdomain}.localhost:3000/login`
    } else {
      // Production domain logic
      const baseDomain = host.replace('www.', '')
      newUrl = `https://${subdomain}.${baseDomain}/login`
    }
    
    window.location.href = newUrl
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="w-full max-w-xl mx-auto bg-card border border-border rounded-2xl p-6 shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center gap-3 mb-6">
        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <School className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground">Accéder à mon établissement</h3>
          <p className="text-sm text-muted-foreground">Trouvez votre école pour vous connecter</p>
        </div>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Rechercher mon école..." 
          className="pl-10 h-12 text-base"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
        {filteredSchools.length > 0 ? (
          filteredSchools.map((school) => (
            <button
              key={school.id}
              onClick={() => handleGo(school.subdomain)}
              className="w-full flex items-center justify-between p-4 rounded-xl border border-transparent bg-muted/30 hover:bg-primary/5 hover:border-primary/20 transition-all group"
            >
              <div className="flex flex-col items-start px-2">
                <span className="font-medium text-foreground group-hover:text-primary transition-colors">
                  {school.nom}
                </span>
                <span className="text-xs text-muted-foreground">
                  {school.subdomain}.localhost:3000
                </span>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
            </button>
          ))
        ) : (
          <div className="py-8 text-center text-muted-foreground">
            Aucun établissement trouvé pour &quot;{search}&quot;
          </div>
        )}
      </div>
      
      <div className="mt-6 pt-6 border-t border-border flex items-center justify-center">
        <p className="text-xs text-muted-foreground">
          Vous ne trouvez pas votre école ? <a href="/signup" className="text-primary hover:underline">Créez-en une ici</a>.
        </p>
      </div>
    </div>
  )
}
