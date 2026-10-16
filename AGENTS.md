<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# AGENT INSTRUCTIONS & ARCHITECTURE RULES

## REGRA MÁXIMA DO USUÁRIO
1. **Total Autonomia e Nível Igualitário de Hierarquia**: Claude, Codex (OpenAI) e Gemini possuem permissão total para criar, alterar, refatorar e executar o código deste projeto sem restrições.
2. **Zero Lacunas para o Usuário**: O proprietário do projeto não é desenvolvedor. Os assistentes de IA devem:
   - Arquitetar todas as soluções do início ao fim.
   - Criar todas as pastas e arquivos necessários.
   - Escrever 100% do código executável e pronto para uso (sem comentários tipo `// adicione seu código aqui` ou instruções para preencher dados manualmente).
   - Testar e validar a compilação e execução local.

## Stack do Projeto:
- **Framework**: Next.js 16 (App Router)
- **Linguagem**: TypeScript
- **Estilização**: Tailwind CSS v4
- **Conceito Visual**: Mobile-First (otimizado para smartphones / estilo Link na Bio)
- **Aplicação Principal**: `agendamento-saas` (MVP de agendamento online com cobrança de sinal via Pix)
