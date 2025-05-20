# Sistema de Tickets para o NekoBot

Este módulo implementa um sistema completo de tickets para suporte, atendimento e gerenciamento de solicitações no Discord.

## Funcionalidades

- **Painel de Tickets**: Interface interativa para os usuários abrirem tickets
- **Categorização Automática**: Tickets são categorizados automaticamente com base nas palavras-chave da mensagem inicial
- **Transcrição em PDF**: Geração automática de transcrições em PDF ao fechar tickets
- **Fechamento Automático**: Tickets inativos são fechados automaticamente após um período definido
- **Reabertura de Tickets**: Possibilidade de reabrir tickets fechados

## Categorias Disponíveis

- **Suporte**: Para problemas, dúvidas e ajuda geral
- **Sugestão**: Para ideias e melhorias
- **Denúncia**: Para reportar comportamentos inadequados
- **Parceria**: Para solicitações de parceria e divulgação
- **Outro**: Para assuntos que não se encaixam nas categorias anteriores

## Comandos Disponíveis

### Comando `/ticket`

- `/ticket painel [canal]`: Cria um painel de tickets no canal especificado (apenas administradores)
- `/ticket fechar`: Fecha o ticket atual
- `/ticket transcrição`: Gera uma transcrição do ticket atual
- `/ticket verificar`: Verifica tickets inativos e aplica fechamento automático (apenas administradores)

## Botões Interativos

- **Abrir Ticket**: Abre um modal para criar um novo ticket
- **Fechar Ticket**: Fecha o ticket atual
- **Gerar Transcrição**: Gera uma transcrição do ticket
- **Reabrir Ticket**: Reabre um ticket fechado
- **Excluir Canal**: Exclui o canal do ticket (apenas para tickets fechados)

## Configurações

As configurações do sistema de tickets estão definidas no arquivo `tickets.js`:

- **Categorias e Palavras-chave**: Definem como os tickets são categorizados automaticamente
- **Tempo de Inatividade**: Define quanto tempo um ticket pode ficar inativo antes de ser fechado (padrão: 3 dias)
- **Tempo de Aviso**: Define quando um aviso de inatividade será enviado (padrão: 2 dias)

## Integração com o Banco de Dados

O sistema utiliza o MongoDB para armazenar todas as informações dos tickets, incluindo:

- Informações básicas (criador, assunto, categoria)
- Histórico de mensagens
- URLs de transcrições
- Status e timestamps

## Como Usar

1. Use o comando `/ticket painel #canal` para criar um painel de tickets em um canal específico
2. Os usuários podem clicar no botão "Abrir Ticket" para criar um novo ticket
3. O sistema categoriza automaticamente o ticket com base na mensagem inicial
4. Tickets inativos por mais de 2 dias receberão um aviso
5. Tickets inativos por mais de 3 dias serão fechados automaticamente
6. Tickets fechados podem ser reabertos ou excluídos

## Requisitos

- Node.js v16 ou superior
- Discord.js v13 ou superior
- MongoDB
- PDFKit (para geração de transcrições)

## Dependências

Certifique-se de instalar as dependências necessárias:

```bash
npm install pdfkit
```

---

Desenvolvido para o NekoBot (v4) - Sistema de Tickets com categorização automática, transcrição em PDF e fechamento automático.