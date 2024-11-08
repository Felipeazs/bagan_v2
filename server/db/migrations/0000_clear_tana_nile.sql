CREATE TABLE IF NOT EXISTS "codigos" (
	"id" serial PRIMARY KEY NOT NULL,
	"codigo" text NOT NULL,
	"descripcion" text NOT NULL,
	"createdAt" timestamp DEFAULT '2024-10-31 17:16:07.032'
);
