// DOMAIN_RULES.md §9 — mercados estáticos do bolão (não confundir terceiroLugarTorneio com terceiroColocadoGrupo)
export const MERCADOS_ESTATICOS = ['campeao', 'vice', 'terceiro_lugar', 'artilheiro'] as const
export type MercadoEstatico = (typeof MERCADOS_ESTATICOS)[number]

export const MERCADOS_EQUIPE = ['campeao', 'vice', 'terceiro_lugar'] as const satisfies readonly MercadoEstatico[]
export type MercadoEquipe = (typeof MERCADOS_EQUIPE)[number]
