import { readFileSync } from 'node:fs'
import { describe, it, expect } from 'vitest'
import { BracketPropagationService, type DependenciaJogo } from '../BracketPropagationService.js'

const rawPath = new URL('../../../../docs/architecture/bracket_dependencias.json', import.meta.url)
const dependencias = JSON.parse(readFileSync(rawPath, 'utf-8')) as Record<string, DependenciaJogo>

describe('BracketPropagationService', () => {
  it('propaga vencedor do jogo 74 para o lado casa do jogo 90', () => {
    const service = new BracketPropagationService(dependencias)
    const resolucoes = service.resolverProximaRodada({
      id: 74,
      equipeCasaId: 10,
      equipeForaId: 20,
      vencedorEquipeId: 10,
    })
    expect(resolucoes).toEqual([{ partidaId: 90, lado: 'casa', equipeId: 10 }])
  })

  it('propaga vencedor do jogo 77 para o lado fora do jogo 90', () => {
    const service = new BracketPropagationService(dependencias)
    const resolucoes = service.resolverProximaRodada({
      id: 77,
      equipeCasaId: 30,
      equipeForaId: 40,
      vencedorEquipeId: 40,
    })
    expect(resolucoes).toEqual([{ partidaId: 90, lado: 'fora', equipeId: 40 }])
  })

  it('fan-out: semifinal (101) alimenta tanto o 3º lugar (103, perdedor) quanto a final (104, vencedor)', () => {
    const service = new BracketPropagationService(dependencias)
    const resolucoes = service.resolverProximaRodada({
      id: 101,
      equipeCasaId: 1,
      equipeForaId: 2,
      vencedorEquipeId: 1,
    })
    expect(resolucoes).toHaveLength(2)
    expect(resolucoes).toEqual(
      expect.arrayContaining([
        { partidaId: 104, lado: 'casa', equipeId: 1 },
        { partidaId: 103, lado: 'casa', equipeId: 2 },
      ]),
    )
  })

  it('fan-out: semifinal (102) alimenta o lado fora tanto do 3º lugar quanto da final', () => {
    const service = new BracketPropagationService(dependencias)
    const resolucoes = service.resolverProximaRodada({
      id: 102,
      equipeCasaId: 3,
      equipeForaId: 4,
      vencedorEquipeId: 3,
    })
    expect(resolucoes).toHaveLength(2)
    expect(resolucoes).toEqual(
      expect.arrayContaining([
        { partidaId: 104, lado: 'fora', equipeId: 3 },
        { partidaId: 103, lado: 'fora', equipeId: 4 },
      ]),
    )
  })

  it('jogo sem dependentes (a final, 104) retorna lista vazia', () => {
    const service = new BracketPropagationService(dependencias)
    const resolucoes = service.resolverProximaRodada({
      id: 104,
      equipeCasaId: 1,
      equipeForaId: 2,
      vencedorEquipeId: 1,
    })
    expect(resolucoes).toEqual([])
  })

  it('jogo de fase de grupos (ex: 1) nunca alimenta o mapa de dependências — retorna lista vazia', () => {
    const service = new BracketPropagationService(dependencias)
    const resolucoes = service.resolverProximaRodada({
      id: 1,
      equipeCasaId: 100,
      equipeForaId: 200,
      vencedorEquipeId: 100,
    })
    expect(resolucoes).toEqual([])
  })

  it('carrega as 16 entradas reais do bracket_dependencias.json (data-driven)', () => {
    expect(Object.keys(dependencias)).toHaveLength(16)
  })
})
