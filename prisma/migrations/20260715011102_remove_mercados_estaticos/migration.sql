/*
  Warnings:

  - You are about to drop the `palpites_estaticos` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "palpites_estaticos" DROP CONSTRAINT "palpites_estaticos_usuario_id_fkey";

-- DropForeignKey
ALTER TABLE "palpites_estaticos" DROP CONSTRAINT "palpites_estaticos_valor_equipe_id_fkey";

-- DropTable
DROP TABLE "palpites_estaticos";
