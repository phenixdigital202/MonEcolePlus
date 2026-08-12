"use client"

import { useState, useEffect } from "react"
import { Send, Mail, MessageSquare, Bell, Users, CheckCircle, AlertCircle, BarChart3, Clock, ChevronRight } from "lucide-react"

interface Campaign {
  id: number
  title: string
  channels: string[]
  target: string
  sentAt: string
  status: "success" | "processing" | "failed"
  stats: {
    sent: number
    delivered: number
    opened: number
    failed: number
  }
}

interface CommunicationCenterProps {
  audienceStats: {
    students: number
    teachers: number
    parents: number
    total: number
  }
}

export default function CommunicationCenterPage({ audienceStats }: CommunicationCenterProps) {
  const [title, setTitle] = useState("")
  const [message, setMessage] = useState("")
  const [channels, setChannels] = useState({ email: true, whatsapp: false, push: false })
  const [target, setTarget] = useState("all")
  const [sending, setSending] = useState(false)
  const [successMsg, setSuccessMsg] = useState("")

  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [totalSent, setTotalSent] = useState(0)

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || !message) return
    setSending(true)

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1500))

    const activeChannels = Object.entries(channels)
      .filter(([_, active]) => active)
      .map(([name]) => name)

    const targetAudience = target === "all" 
      ? audienceStats.total 
      : target === "teachers" 
      ? audienceStats.teachers 
      : target === "parents" 
      ? audienceStats.parents 
      : Math.round(audienceStats.students * 0.3)

    const newCampaign: Campaign = {
      id: Date.now(),
      title,
      channels: activeChannels,
      target: target === "all" ? "Toute l'école" : target === "teachers" ? "Enseignants" : target === "parents" ? "Parents" : `Cible: ${target}`,
      sentAt: new Date().toLocaleString("fr-FR", { hour12: false }).replace(",", ""),
      status: "success",
      stats: {
        sent: targetAudience,
        delivered: Math.max(targetAudience - Math.floor(Math.random() * 3), 0),
        opened: 0,
        failed: Math.floor(Math.random() * 3)
      }
    }

    setCampaigns([newCampaign, ...campaigns])
    setTotalSent(prev => prev + targetAudience)
    setTitle("")
    setMessage("")
    setSending(false)
    setSuccessMsg("Campagne de communication envoyée avec succès !")
    setTimeout(() => setSuccessMsg(""), 4000)
  }

  const deliveryRate = totalSent > 0 
    ? Math.round((campaigns.reduce((s, c) => s + c.stats.delivered, 0) / totalSent) * 100) 
    : 100

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Centre de Communication</h1>
        <p className="text-slate-500 mt-1">Diffusez vos messages instantanément sur tous vos canaux : E-mail, WhatsApp et notifications push.</p>
        <div className="mt-3 flex gap-3 text-xs">
          <span className="px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 font-bold border border-blue-100">
            👨‍🎓 {audienceStats.students} élèves
          </span>
          <span className="px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-100">
            👨‍🏫 {audienceStats.teachers} enseignants
          </span>
          <span className="px-3 py-1.5 rounded-full bg-purple-50 text-purple-700 font-bold border border-purple-100">
            👪 {audienceStats.parents} parents
          </span>
          <span className="px-3 py-1.5 rounded-full bg-slate-100 text-slate-700 font-bold border border-slate-200">
            📊 Audience totale: {audienceStats.total}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Send Campaign Form */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-100/40 p-8 space-y-6">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Send className="h-5 w-5 text-blue-600" /> Nouvel Envoi de Campagne
          </h2>

          {successMsg && (
            <div className="bg-emerald-50 text-emerald-700 p-4 rounded-2xl border border-emerald-100 flex items-center gap-3 text-sm font-bold animate-fade-in">
              <CheckCircle className="h-5 w-5 shrink-0" /> {successMsg}
            </div>
          )}

          <form onSubmit={handleSend} className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Titre de la communication</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Convocation de fin d'année scolaire"
                required
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 font-medium text-slate-800"
              />
            </div>

            {/* Channels Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Canaux de diffusion</label>
              <div className="grid grid-cols-3 gap-4">
                <button
                  type="button"
                  onClick={() => setChannels({ ...channels, email: !channels.email })}
                  className={`p-4 rounded-2xl border flex flex-col items-center gap-2 transition-all ${
                    channels.email
                      ? "border-blue-600 bg-blue-50/50 text-blue-600 font-bold shadow-md shadow-blue-600/5"
                      : "border-slate-200 text-slate-500 hover:bg-slate-50"
                  }`}
                >
                  <Mail className="h-6 w-6" />
                  <span className="text-xs">E-mail</span>
                </button>

                <button
                  type="button"
                  onClick={() => setChannels({ ...channels, whatsapp: !channels.whatsapp })}
                  className={`p-4 rounded-2xl border flex flex-col items-center gap-2 transition-all ${
                    channels.whatsapp
                      ? "border-emerald-600 bg-emerald-50/50 text-emerald-600 font-bold shadow-md shadow-emerald-600/5"
                      : "border-slate-200 text-slate-500 hover:bg-slate-50"
                  }`}
                >
                  <MessageSquare className="h-6 w-6" />
                  <span className="text-xs">WhatsApp</span>
                </button>

                <button
                  type="button"
                  onClick={() => setChannels({ ...channels, push: !channels.push })}
                  className={`p-4 rounded-2xl border flex flex-col items-center gap-2 transition-all ${
                    channels.push
                      ? "border-indigo-600 bg-indigo-50/50 text-indigo-600 font-bold shadow-md shadow-indigo-600/5"
                      : "border-slate-200 text-slate-500 hover:bg-slate-50"
                  }`}
                >
                  <Bell className="h-6 w-6" />
                  <span className="text-xs">Push Mobile</span>
                </button>
              </div>
            </div>

            {/* Target Selectors */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Destinataires cibles</label>
              <div className="flex gap-4">
                <select
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 font-semibold text-slate-800 bg-transparent"
                >
                  <option value="all">Tous les Élèves, Parents &amp; Profs ({audienceStats.total})</option>
                  <option value="teachers">Enseignants uniquement ({audienceStats.teachers})</option>
                  <option value="parents">Parents uniquement ({audienceStats.parents})</option>
                  <option value="students">Élèves uniquement ({audienceStats.students})</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Message</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={5}
                placeholder="Rédigez votre message ici..."
                required
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 font-medium text-slate-800"
              />
            </div>

            <button
              type="submit"
              disabled={sending}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-600/10 hover:shadow-blue-700/20 transition-all flex items-center justify-center gap-2"
            >
              {sending ? (
                <>Envoi en cours...</>
              ) : (
                <>
                  <Send className="h-5 w-5" /> Lancer la Campagne
                </>
              )}
            </button>
          </form>
        </div>

        {/* Stats & History sidebar */}
        <div className="space-y-6">
          <div className="bg-slate-900 rounded-3xl p-6 text-white space-y-4">
            <h3 className="font-bold text-sm uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <BarChart3 className="h-4 w-4" /> Statistiques de diffusion
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                <span className="text-xs text-slate-400">Total Envoyés</span>
                <p className="text-2xl font-black mt-1">{totalSent}</p>
              </div>
              <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                <span className="text-xs text-slate-400">Taux de délivrance</span>
                <p className="text-2xl font-black mt-1 text-blue-400">{deliveryRate}%</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-100/40 p-6 space-y-6">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <Clock className="h-5 w-5 text-slate-400" /> Historique récent
            </h3>

            <div className="space-y-4">
              {campaigns.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-8">Aucune campagne envoyée pour le moment.</p>
              ) : (
                campaigns.map((camp) => (
                  <div key={camp.id} className="p-4 rounded-2xl border border-slate-50 hover:bg-slate-50/50 transition-all space-y-2">
                    <div className="flex justify-between items-start">
                      <h4 className="font-bold text-sm text-slate-800 line-clamp-1">{camp.title}</h4>
                      <span className="text-[10px] text-slate-400 font-semibold">{camp.sentAt}</span>
                    </div>
                    <div className="flex gap-2 items-center">
                      {camp.channels.map((chan) => (
                        <span
                          key={chan}
                          className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${
                            chan === "email"
                              ? "bg-blue-50 text-blue-600 border-blue-100"
                              : chan === "whatsapp"
                              ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                              : "bg-indigo-50 text-indigo-600 border-indigo-100"
                          }`}
                        >
                          {chan}
                        </span>
                      ))}
                      <span className="text-slate-300 text-xs">|</span>
                      <span className="text-[11px] text-slate-500 font-medium">{camp.target}</span>
                    </div>
                    <div className="flex gap-3 text-[10px] font-semibold text-slate-400">
                      <span>📤 {camp.stats.sent}</span>
                      <span>✅ {camp.stats.delivered}</span>
                      {camp.stats.failed > 0 && <span className="text-rose-400">❌ {camp.stats.failed}</span>}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
