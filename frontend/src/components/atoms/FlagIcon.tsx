interface FlagIconProps {
  codigo: string | null
  nome: string
}

export function FlagIcon({ codigo, nome }: FlagIconProps) {
  if (!codigo) return <span className="inline-block w-6 h-4 bg-surface-2 rounded-sm" aria-label={nome} />
  return (
    <img
      src={`https://flagcdn.com/24x18/${codigo.toLowerCase()}.png`}
      alt={nome}
      title={nome}
      className="w-6 h-4 object-cover rounded-sm inline-block"
      onError={(e) => {
        ;(e.target as HTMLImageElement).style.display = 'none'
      }}
    />
  )
}
