-- CreateTable
CREATE TABLE "usuarios" (
    "id" UUID NOT NULL,
    "nome" VARCHAR(120) NOT NULL,
    "username" VARCHAR(60) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "role" VARCHAR(20) NOT NULL DEFAULT 'user',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "grupos" (
    "id" CHAR(1) NOT NULL,

    CONSTRAINT "grupos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "equipes" (
    "id" SERIAL NOT NULL,
    "nome" VARCHAR(80) NOT NULL,
    "sigla" VARCHAR(10),
    "bandeira_codigo" VARCHAR(10),
    "grupo_id" CHAR(1) NOT NULL,

    CONSTRAINT "equipes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fases" (
    "id" VARCHAR(20) NOT NULL,
    "nome_exibicao" VARCHAR(40) NOT NULL,
    "multiplicador" DECIMAL(3,1) NOT NULL,
    "ordem" SMALLINT NOT NULL,

    CONSTRAINT "fases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "partidas" (
    "id" SMALLINT NOT NULL,
    "fase_id" VARCHAR(20) NOT NULL,
    "grupo_id" CHAR(1),
    "equipe_casa_id" INTEGER,
    "equipe_fora_id" INTEGER,
    "placeholder_casa" VARCHAR(60),
    "placeholder_fora" VARCHAR(60),
    "gols_casa" SMALLINT,
    "gols_fora" SMALLINT,
    "status" VARCHAR(20) NOT NULL DEFAULT 'agendada',
    "data_hora_utc" TIMESTAMPTZ(6) NOT NULL,
    "estadio" VARCHAR(80),
    "cidade" VARCHAR(60),
    "grupo_simultaneo_id" SMALLINT,

    CONSTRAINT "partidas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "palpites" (
    "id" UUID NOT NULL,
    "usuario_id" UUID NOT NULL,
    "partida_id" SMALLINT NOT NULL,
    "gols_casa_palpite" SMALLINT NOT NULL,
    "gols_fora_palpite" SMALLINT NOT NULL,
    "pontos_obtidos" SMALLINT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "palpites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "palpites_estaticos" (
    "id" UUID NOT NULL,
    "usuario_id" UUID NOT NULL,
    "mercado" VARCHAR(20) NOT NULL,
    "valor_equipe_id" INTEGER,
    "valor_texto" VARCHAR(80),
    "pontos_obtidos" SMALLINT,
    "travado_em" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "palpites_estaticos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "confrontos_terceiros" (
    "id" SERIAL NOT NULL,
    "combinacao" CHAR(8) NOT NULL,
    "vs_1a" CHAR(1) NOT NULL,
    "vs_1b" CHAR(1) NOT NULL,
    "vs_1d" CHAR(1) NOT NULL,
    "vs_1e" CHAR(1) NOT NULL,
    "vs_1g" CHAR(1) NOT NULL,
    "vs_1i" CHAR(1) NOT NULL,
    "vs_1k" CHAR(1) NOT NULL,
    "vs_1l" CHAR(1) NOT NULL,

    CONSTRAINT "confrontos_terceiros_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_username_key" ON "usuarios"("username");

-- CreateIndex
CREATE INDEX "idx_partidas_data_hora" ON "partidas"("data_hora_utc");

-- CreateIndex
CREATE INDEX "idx_partidas_fase" ON "partidas"("fase_id");

-- CreateIndex
CREATE INDEX "idx_partidas_status" ON "partidas"("status");

-- CreateIndex
CREATE INDEX "idx_palpites_partida" ON "palpites"("partida_id");

-- CreateIndex
CREATE INDEX "idx_palpites_usuario" ON "palpites"("usuario_id");

-- CreateIndex
CREATE UNIQUE INDEX "palpites_usuario_id_partida_id_key" ON "palpites"("usuario_id", "partida_id");

-- CreateIndex
CREATE UNIQUE INDEX "palpites_estaticos_usuario_id_mercado_key" ON "palpites_estaticos"("usuario_id", "mercado");

-- CreateIndex
CREATE UNIQUE INDEX "confrontos_terceiros_combinacao_key" ON "confrontos_terceiros"("combinacao");

-- CreateIndex
CREATE INDEX "idx_confrontos_terceiros_combinacao" ON "confrontos_terceiros"("combinacao");

-- AddForeignKey
ALTER TABLE "equipes" ADD CONSTRAINT "equipes_grupo_id_fkey" FOREIGN KEY ("grupo_id") REFERENCES "grupos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "partidas" ADD CONSTRAINT "partidas_fase_id_fkey" FOREIGN KEY ("fase_id") REFERENCES "fases"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "partidas" ADD CONSTRAINT "partidas_grupo_id_fkey" FOREIGN KEY ("grupo_id") REFERENCES "grupos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "partidas" ADD CONSTRAINT "partidas_equipe_casa_id_fkey" FOREIGN KEY ("equipe_casa_id") REFERENCES "equipes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "partidas" ADD CONSTRAINT "partidas_equipe_fora_id_fkey" FOREIGN KEY ("equipe_fora_id") REFERENCES "equipes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "palpites" ADD CONSTRAINT "palpites_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "palpites" ADD CONSTRAINT "palpites_partida_id_fkey" FOREIGN KEY ("partida_id") REFERENCES "partidas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "palpites_estaticos" ADD CONSTRAINT "palpites_estaticos_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "palpites_estaticos" ADD CONSTRAINT "palpites_estaticos_valor_equipe_id_fkey" FOREIGN KEY ("valor_equipe_id") REFERENCES "equipes"("id") ON DELETE SET NULL ON UPDATE CASCADE;
