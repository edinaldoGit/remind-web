# 🧠 ReMind - Web Client

![Vue.js](https://img.shields.io/badge/vuejs-%2335495e.svg?style=for-the-badge&logo=vuedotjs&logoColor=%234FC08D)
![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)
![CSS3](https://img.shields.io/badge/css3-%231572B6.svg?style=for-the-badge&logo=css3&logoColor=white)

> Interface Web do Sistema de Gerenciamento de Estudos e Revisões Espaçadas.

## Sobre o Projeto

O **ReMind** é uma aplicação desenvolvida para auxiliar estudantes universitários a organizar suas rotinas de estudo e, principalmente, automatizar o processo de revisão de conteúdo.

O sistema utiliza o método de **Repetição Espaçada** (Spaced Repetition), gerando automaticamente agendamentos de revisão para **D+1 (dia seguinte), D+7 (uma semana) e D+14 (duas semanas)** após o estudo inicial, garantindo a retenção do conhecimento a longo prazo.

Este projeto compõe a camada de **Front-end** do Trabalho Final da disciplina de **Linguagens de Programação**, do curso de Ciência da Computação da **Universidade Federal do Ceará (UFC) - Campus Quixadá**.

## Destaques Visuais (UI/UX)

O design foi concebido com foco em imersão, inspirado em interfaces de aplicativos mobile ("App-like Interface"):

* **Layout Centralizado:** Estrutura otimizada para leitura, com largura controlada e margens confortáveis.
* **Barra de Navegação Flutuante:** Menu de acesso rápido que acompanha o usuário sem poluir a visão.
* **Modo Imersivo:** Scroll restrito apenas ao cartão de conteúdo, mantendo a estrutura da página estática (sem scroll na janela principal).
* **Identidade Visual:** Fundo animado com elementos abstratos (sinapses) e paleta de cores "Cold Tech" (Azul Profundo, Roxo Elétrico e Ciano Neon).

## Tecnologias Utilizadas

* **[Vue.js 3](https://vuejs.org/)**: Framework JavaScript progressivo (Composition API).
* **[Vite](https://vitejs.dev/)**: Ferramenta de build e servidor de desenvolvimento ultra-rápido.
* **CSS Variables**: Estilização nativa e performática, sem dependência de frameworks CSS pesados.
* **Axios** (Planejado): Para comunicação com a API REST.

## Como Rodar o Projeto

Pré-requisitos: Você precisa ter o [Node.js](https://nodejs.org/) instalado.

1.  **Clone o repositório**
    ```bash
    git clone [https://github.com/SEU_USUARIO/remind-web.git](https://github.com/SEU_USUARIO/remind-web.git)
    cd remind-web
    ```

2.  **Instale as dependências**
    ```bash
    npm install
    ```

3.  **Rode o servidor de desenvolvimento**
    ```bash
    npm run dev
    ```

4.  **Acesse no navegador**
    O projeto estará rodando em `http://localhost:5173` (ou a porta indicada no seu terminal).

## Estrutura de Pastas

A organização do projeto segue as melhores práticas do Vue.js:

```text
src/
├── assets/          # Recursos estáticos (CSS Global, Imagens)
│   ├── css/variables.css  # Paleta de cores e variáveis do tema
│   └── img/
├── components/      # Componentes reutilizáveis
│   ├── layout/      # Navbar, Containers estruturais
│   └── ui/          # Botões, Inputs, Cards (Design System)
├── router/          # Configuração de rotas (Vue Router)
├── views/           # Páginas completas (Login, Dashboard, Cronograma)
└── App.vue          # Componente Raiz (Layout Base)
```

## Autores
### Trabalho desenvolvido pela equipe:
- Edinaldo - Front-end & UI/UX Design

- Thiago Oliveira - Front-end Logic & Integration

- Marcos Vinicius - Back-end API & Database

**Desenvolvido para a disciplina de Linguagens de Programação - Prof. Lucas Ismaily.**
