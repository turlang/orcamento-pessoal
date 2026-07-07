# Case Técnico — FinançasPro BI

## Problema

Muitas pessoas controlam receitas e despesas de forma desorganizada, usando anotações soltas, aplicativos genéricos ou planilhas pouco visuais. Isso dificulta entender fluxo de caixa, categorias de gasto, previsão mensal e progresso financeiro.

## Solução

O FinançasPro BI é um dashboard financeiro/PWA para registrar receitas, despesas, metas, previsão mensal e visualizar indicadores do orçamento familiar.

## Público-alvo

- Pessoas que desejam controlar orçamento pessoal.
- Famílias que acompanham despesas mensais.
- Usuários que preferem dashboard visual.
- Estudantes e profissionais que querem organizar fluxo financeiro simples.

## Principais funcionalidades

- Cadastro de receitas.
- Cadastro de despesas.
- Seleção de período mensal.
- Categorias financeiras.
- Previsão de receita.
- Indicadores financeiros.
- Barra de progresso.
- Importação CSV.
- Layout responsivo.
- Manifest PWA.
- Service Worker.
- Ícone local em SVG.

## Arquitetura

```text
HTML/CSS/JavaScript
        |
        v
Formulários e estado local
        |
        v
Indicadores e visualização
        |
        v
Manifest + Service Worker
```

## Decisões técnicas

### JavaScript puro

A escolha por JavaScript sem framework facilita compreensão do fluxo, reduz dependências e destaca domínio dos fundamentos de front-end.

### Interface em dashboard

Dashboards ajudam o usuário a entender rapidamente indicadores, progresso e situação financeira do mês.

### PWA

O uso de manifest e service worker aproxima a aplicação da experiência de app instalável, melhorando percepção de produto.

### Responsividade mobile

Como finanças pessoais são consultadas frequentemente pelo celular, a interface precisa se adaptar bem a telas pequenas.

## Diferenciais para empregabilidade

- Demonstra manipulação de formulários.
- Demonstra lógica de negócio financeira.
- Mostra construção de dashboard.
- Usa PWA e Service Worker.
- Demonstra responsividade e cuidado visual.
- Pode ser evoluído para aplicação full stack.

## Riscos e pontos de melhoria

- Melhorar persistência local.
- Adicionar autenticação.
- Criar backend para salvar dados em nuvem.
- Adicionar gráficos mais avançados.
- Adicionar exportação em PDF.
- Adicionar testes automatizados.
- Adicionar screenshots ao README.

## Evolução recomendada

1. Implementar armazenamento local mais organizado.
2. Criar gráficos por categoria.
3. Adicionar exportação de relatório.
4. Criar backend Node.js.
5. Implementar autenticação.
6. Permitir múltiplos usuários.
7. Criar metas por categoria.
8. Adicionar deploy estável e documentação visual.

## Como apresentar em entrevista

Este projeto deve ser apresentado como um dashboard financeiro/PWA que demonstra fundamentos de front-end, organização de dados, lógica de negócio, responsividade e preocupação com experiência do usuário.
