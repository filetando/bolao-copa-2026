import { readFileSync } from 'node:fs'
import { describe, it, expect } from 'vitest'
import { AnexoCLookup, type ConfrontoTerceiro } from '../AnexoCLookup.js'
import { InvalidCombinacaoError } from '../errors.js'

interface ConfrontoRowSnakeCase {
  vs_1a: string
  vs_1b: string
  vs_1d: string
  vs_1e: string
  vs_1g: string
  vs_1i: string
  vs_1k: string
  vs_1l: string
}

function toCamelCase(row: ConfrontoRowSnakeCase): ConfrontoTerceiro {
  return {
    vs1a: row.vs_1a,
    vs1b: row.vs_1b,
    vs1d: row.vs_1d,
    vs1e: row.vs_1e,
    vs1g: row.vs_1g,
    vs1i: row.vs_1i,
    vs1k: row.vs_1k,
    vs1l: row.vs_1l,
  }
}

const rawPath = new URL('../../../../docs/architecture/confrontos_terceiros.json', import.meta.url)
const raw = JSON.parse(readFileSync(rawPath, 'utf-8')) as Record<string, ConfrontoRowSnakeCase>
const tabela: Record<string, ConfrontoTerceiro> = Object.fromEntries(
  Object.entries(raw).map(([combinacao, row]) => [combinacao, toCamelCase(row)]),
)

describe('AnexoCLookup', () => {
  it('carrega e resolve todas as 495 combinações do arquivo oficial (data-driven, não hardcoded)', () => {
    const lookup = new AnexoCLookup(tabela)
    const combinacoes = Object.keys(raw)
    expect(combinacoes).toHaveLength(495)
    for (const combinacao of combinacoes) {
      expect(lookup.lookup(combinacao)).toEqual(tabela[combinacao])
    }
  })

  it('lança InvalidCombinacaoError para combinação com número errado de letras', () => {
    const lookup = new AnexoCLookup(tabela)
    expect(() => lookup.lookup('BDEFIJK')).toThrow(InvalidCombinacaoError) // 7 letras
    expect(() => lookup.lookup('BDEFIJKLM')).toThrow(InvalidCombinacaoError) // 9 letras
  })

  it('lança InvalidCombinacaoError para combinação inexistente na tabela', () => {
    const lookup = new AnexoCLookup(tabela)
    expect(() => lookup.lookup('ZZZZZZZZ')).toThrow(InvalidCombinacaoError)
  })

  it('resolve a combinação real dos 8 classificados da Copa 2026 (BDEFIJKL)', () => {
    const lookup = new AnexoCLookup(tabela)
    const confronto = lookup.lookup('BDEFIJKL')
    expect(confronto).toEqual({
      vs1a: 'E',
      vs1b: 'J',
      vs1d: 'B',
      vs1e: 'D',
      vs1g: 'I',
      vs1i: 'F',
      vs1k: 'L',
      vs1l: 'K',
    })
  })
})
