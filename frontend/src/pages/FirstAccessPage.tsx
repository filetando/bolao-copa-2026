import { useEffect, useMemo, useState } from 'react'
import { api, type ApiError } from '../lib/api.ts'
import { isStaticMarketLocked } from '../lib/time.ts'
import { Button } from '../components/atoms/Button.tsx'
import { FlagIcon } from '../components/atoms/FlagIcon.tsx'
import type { Partida, PalpiteEstaticoData, Equipe, MercadoEstatico } from '../types/index.ts'

const MERCADOS: { id: MercadoEstatico; label: string; tipo: 'equipe' | 'texto' }[] = [
  { id: 'campeao', label: 'Campeão', tipo: 'equipe' },
  { id: 'vice', label: 'Vice-campeão', tipo: 'equipe' },
  { id: 'terceiro_lugar', label: 'Terceiro lugar', tipo: 'equipe' },
  { id: 'artilheiro', label: 'Artilheiro', tipo: 'texto' },
]

export function FirstAccessPage() {
  const locked = isStaticMarketLocked()

  const [partidas, setPartidas] = useState<Partida[]>([])
  const [meusPalpites, setMeusPalpites] = useState<PalpiteEstaticoData[]>([])
  const [loading, setLoading] = useState(true)

  // Form state: mercadoId → valorEquipeId ou valorTexto
  const [equipeSelects, setEquipeSelects] = useState<Record<string, string>>({
    campeao: '',
    vice: '',
    terceiro_lugar: '',
  })
  const [artilheiro, setArtilheiro] = useState('')

  const [saving, setSaving] = useState<string | null>(null)
  const [saved, setSaved] = useState<Set<string>>(new Set())
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    Promise.all([api.partidas.list(), api.palpitesEstaticos.me()])
      .then(([ps, mp]) => {
        setPartidas(ps)
        setMeusPalpites(mp)
        // Pré-preenche form com palpites existentes
        const equipes: Record<string, string> = { campeao: '', vice: '', terceiro_lugar: '' }
        let art = ''
        for (const p of mp) {
          if (p.mercado === 'artilheiro') art = p.valorTexto ?? ''
          else if (p.valorEquipeId != null) equipes[p.mercado] = String(p.valorEquipeId)
        }
        setEquipeSelects(equipes)
        setArtilheiro(art)
        setSaved(new Set(mp.map((p) => p.mercado)))
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  // Extrai equipes únicas das partidas (apenas fase de grupos tem times definidos)
  const equipes = useMemo(() => {
    const map = new Map<number, Equipe>()
    for (const p of partidas) {
      if (p.equipeCasa) map.set(p.equipeCasa.id, p.equipeCasa)
      if (p.equipeFora) map.set(p.equipeFora.id, p.equipeFora)
    }
    return Array.from(map.values()).sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))
  }, [partidas])

  async function handleSave(mercado: MercadoEstatico) {
    const m = MERCADOS.find((x) => x.id === mercado)!
    setSaving(mercado)
    setErrors((prev) => ({ ...prev, [mercado]: '' }))
    try {
      if (m.tipo === 'equipe') {
        const id = parseInt(equipeSelects[mercado] ?? '', 10)
        if (isNaN(id)) {
          setErrors((prev) => ({ ...prev, [mercado]: 'Selecione uma equipe.' }))
          return
        }
        await api.palpitesEstaticos.submit(mercado, id)
      } else {
        if (!artilheiro.trim()) {
          setErrors((prev) => ({ ...prev, [mercado]: 'Informe o nome do artilheiro.' }))
          return
        }
        await api.palpitesEstaticos.submit(mercado, undefined, artilheiro.trim())
      }
      setSaved((prev) => new Set(prev).add(mercado))
    } catch (err) {
      const e = err as ApiError
      setErrors((prev) => ({ ...prev, [mercado]: e.error?.message ?? 'Erro ao salvar.' }))
    } finally {
      setSaving(null)
    }
  }

  if (loading) return <p className="text-muted text-sm">Carregando…</p>

  return (
    <div className="max-w-lg mx-auto">
      <h2 className="text-2xl font-extrabold text-text mb-1">Palpites Estáticos</h2>
      <p className="text-sm text-muted mb-6">
        Campeão, vice, 3º lugar e artilheiro da Copa 2026.
        {locked && (
          <span className="ml-1 font-medium text-warning">
            (Período de palpites de longo prazo encerrado.)
          </span>
        )}
      </p>

      <div className="space-y-4">
        {MERCADOS.map(({ id, label, tipo }) => {
          const existente = meusPalpites.find((p) => p.mercado === id)
          const isSaved = saved.has(id)
          const isSaving = saving === id
          const err = errors[id]

          return (
            <div key={id} className="bg-surface rounded-lg border border-border shadow-sm p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="font-semibold text-text">{label}</span>
                {isSaved && <span className="text-xs text-success font-semibold">✓ Salvo</span>}
                {existente?.pontosObtidos != null && (
                  <span className="text-xs text-success font-semibold font-mono">+{existente.pontosObtidos} pts</span>
                )}
              </div>

              {tipo === 'equipe' ? (
                <div className="flex items-center gap-3">
                  <select
                    value={equipeSelects[id] ?? ''}
                    onChange={(e) => setEquipeSelects((prev) => ({ ...prev, [id]: e.target.value }))}
                    disabled={locked}
                    className="flex-1 bg-surface-2 border border-border rounded-md px-3 py-2 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary disabled:opacity-60 disabled:text-muted"
                    aria-label={label}
                  >
                    <option value="">Selecione uma seleção…</option>
                    {equipes.map((eq) => (
                      <option key={eq.id} value={eq.id}>
                        {eq.nome}
                      </option>
                    ))}
                  </select>
                  {equipeSelects[id] && (
                    <FlagIcon
                      codigo={equipes.find((e) => String(e.id) === equipeSelects[id])?.bandeiraCodigo ?? null}
                      nome=""
                    />
                  )}
                </div>
              ) : (
                <input
                  type="text"
                  value={artilheiro}
                  onChange={(e) => setArtilheiro(e.target.value)}
                  disabled={locked}
                  placeholder="Nome do artilheiro"
                  className="w-full bg-surface-2 border border-border rounded-md px-3 py-2 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary disabled:opacity-60 disabled:text-muted"
                  aria-label="Artilheiro"
                />
              )}

              {err && <p className="text-xs text-danger mt-1">{err}</p>}

              {!locked && (
                <div className="mt-3">
                  <Button
                    variant="accent"
                    size="sm"
                    loading={isSaving}
                    onClick={() => handleSave(id)}
                  >
                    {isSaved ? 'Atualizar' : 'Salvar'}
                  </Button>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
