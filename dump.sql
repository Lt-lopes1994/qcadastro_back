 `CREATE TABLE "documentos_clicksign" ("id" SERIAL NOT NULL, "nome" character varying NOT NULL, "documentoKey" character varying NOT NULL, "status" character varying NOT NULL, "userId" integer NOT NULL, "portadorId" integer, "signUrl" character varying, "signatarios" json, "expiresAt" TIMESTAMP, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_d1bc66a3b752ae6b6368724fc3f" PRIMARY KEY ("id"))`,

  `ALTER TABLE "documentos_clicksign" ADD CONSTRAINT "FK_c7a91bd145a23b685f142a5669d" FOREIGN KEY ("userId") REFERENCES "registered_user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,

  `ALTER TABLE "documentos_clicksign" ADD CONSTRAINT "FK_54bf70ddd565c22a1d49bade1f1" FOREIGN KEY ("portadorId") REFERENCES "portador"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,

  `CREATE TABLE "endereco" ("id" SERIAL NOT NULL, "cep" character varying NOT NULL, "logradouro" character varying NOT NULL, "numero" character varying NOT NULL, "complemento" character varying, "bairro" character varying NOT NULL, "cidade" character varying NOT NULL, "estado" character varying NOT NULL, "enderecoCompleto" character varying NOT NULL, "latitude" numeric(10,6), "longitude" numeric(10,6), "userId" integer NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_2a6880f71a7f8d1c677bb2a32a8" PRIMARY KEY ("id"))`,

   `ALTER TABLE "endereco" ADD CONSTRAINT "FK_2d1b24022e991aad06ec533498c" FOREIGN KEY ("userId") REFERENCES "registered_user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,

    `ALTER TABLE "endereco" DROP CONSTRAINT "FK_2d1b24022e991aad06ec533498c"`,

    `ALTER TABLE "portador" ADD CONSTRAINT "UQ_378b075612cee9b4a74652bfbea" UNIQUE ("cnhNumero")`,

     `ALTER TABLE "portador" ADD CONSTRAINT "UQ_064eb5a5a37407cc61f4692f423" UNIQUE ("anttNumero")`

     `ALTER TABLE "portador" DROP CONSTRAINT "UQ_064eb5a5a37407cc61f4692f423"`,

     `ALTER TABLE "portador" DROP CONSTRAINT "UQ_378b075612cee9b4a74652bfbea"`,

      `CREATE TABLE "processo_judicial" ("id" SERIAL NOT NULL, "numero" character varying NOT NULL, "dataNotificacao" TIMESTAMP, "tipo" character varying, "assuntoPrincipal" character varying, "status" character varying, "varaJulgadora" character varying, "tribunal" character varying, "tribunalLevel" character varying, "tribunalTipo" character varying, "tribunalCidade" character varying, "estado" character varying, "partes" json, "userId" integer NOT NULL, CONSTRAINT "PK_a24168148183825be6ca353058c" PRIMARY KEY ("id"))`,

       `ALTER TABLE "processo_judicial" ADD CONSTRAINT "FK_3e2e7dddbe55dd10c8b8373ee2b" FOREIGN KEY ("userId") REFERENCES "registered_user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,

       `ALTER TABLE "processo_judicial" DROP CONSTRAINT "FK_3e2e7dddbe55dd10c8b8373ee2b"`,

        `CREATE TABLE "registered_user" ("id" SERIAL NOT NULL, "cpf" character varying NOT NULL, "firstName" character varying NOT NULL, "lastName" character varying NOT NULL, "cpfStatus" character varying NOT NULL, "cpfVerificationUrl" character varying NOT NULL, "email" character varying NOT NULL, "emailVerificationCode" character varying NOT NULL, "emailVerified" boolean NOT NULL, "phoneNumber" character varying NOT NULL, "phoneVerificationCode" character varying NOT NULL, "phoneVerified" boolean NOT NULL, "password" character varying NOT NULL, "passwordResetToken" character varying NOT NULL, "role" character varying NOT NULL, "isActive" boolean NOT NULL, "lgpdAcceptedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_4b0e897ab2ce84c66a4fd493a76" UNIQUE ("cpf"), CONSTRAINT "UQ_b8fe349107619fbebd68f548260" UNIQUE ("email"), CONSTRAINT "UQ_6620f0d0416c87d5bc86dfef8fc" UNIQUE ("phoneNumber"), CONSTRAINT "PK_50384ea99c4eb96710f89220b1c" PRIMARY KEY ("id"))`,

         `CREATE TABLE "blocked_ip" ("id" SERIAL NOT NULL, "ipAddress" character varying NOT NULL, "reason" character varying NOT NULL, "blockedAt" TIMESTAMP NOT NULL DEFAULT now(), "expiresAt" TIMESTAMP NOT NULL, CONSTRAINT "PK_a8bee7446f52e629a1c30f54dc6" PRIMARY KEY ("id"))`,

         `CREATE TABLE "login_attempt" ("id" SERIAL NOT NULL, "ipAddress" character varying NOT NULL, "username" character varying, "successful" boolean NOT NULL, "attemptedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_72829cd4f7424e3cdfd46c476c0" PRIMARY KEY ("id"))`,

         `CREATE TABLE "portador" ("id" SERIAL NOT NULL, "cnhNumero" character varying NOT NULL, "cnhCategoria" character varying NOT NULL, "cnhValidade" TIMESTAMP NOT NULL, "cnhImagemPath" character varying NOT NULL, "anttImagemPath" character varying, "anttNumero" character varying, "anttValidade" TIMESTAMP, "status" character varying NOT NULL DEFAULT 'PENDENTE', "motivoRejeicao" character varying, "userId" integer NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_d1909cccc467c24c2f758dce249" PRIMARY KEY ("id"))`,

          `ALTER TABLE "portador" ADD CONSTRAINT "FK_eee7a58148525630601000108ef" FOREIGN KEY ("userId") REFERENCES "registered_user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,

          `ALTER TABLE "portador" DROP CONSTRAINT "FK_eee7a58148525630601000108ef"`,