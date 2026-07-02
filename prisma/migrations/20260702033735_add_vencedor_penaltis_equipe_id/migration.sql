-- AlterTable
ALTER TABLE "partidas" ADD COLUMN     "vencedor_penaltis_equipe_id" INTEGER;

-- AddForeignKey
ALTER TABLE "partidas" ADD CONSTRAINT "partidas_vencedor_penaltis_equipe_id_fkey" FOREIGN KEY ("vencedor_penaltis_equipe_id") REFERENCES "equipes"("id") ON DELETE SET NULL ON UPDATE CASCADE;
