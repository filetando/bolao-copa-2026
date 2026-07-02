import { mkdir, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import type { SnapshotWriter } from '../../application/bolao/ports/SnapshotWriter.js'

export class FileSnapshotWriter implements SnapshotWriter {
  constructor(private readonly diretorio: string = resolve(process.cwd(), 'snapshots')) {}

  async save(filename: string, content: string): Promise<string> {
    await mkdir(this.diretorio, { recursive: true })
    const path = resolve(this.diretorio, filename)
    await writeFile(path, content, 'utf-8')
    return path
  }
}
