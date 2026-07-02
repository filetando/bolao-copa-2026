export interface SnapshotWriter {
  // Salva o conteúdo em disco e retorna o caminho completo do arquivo gravado.
  save(filename: string, content: string): Promise<string>
}
