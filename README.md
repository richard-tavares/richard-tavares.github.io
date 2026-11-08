# richard-tavares.github.io

Portfolio pessoal desenvolvido com HTML, CSS e JavaScript puro — sem frameworks, sem dependências de build.

Clique [aqui](https://richard-tavares.github.io/) para acessar.

<img width="1920" height="1080" alt="portfolio-banner" src="https://github.com/user-attachments/assets/5858213c-f4ef-4efc-a729-0f307dddf8af" />

## Funcionalidades

- Tema claro/escuro com persistência via `localStorage`
- Suporte a dois idiomas (PT-BR e EN-US) com troca dinâmica
- Animação de matriz glitch no fundo via Canvas API
- Efeito typewriter no subtítulo da hero
- Lightbox para visualização das imagens de projeto
- Faixa de aviso animada nos projetos em manutenção
- Barra de progresso de carregamento da página
- Layout responsivo com menu hamburger no mobile
- Acessibilidade: skip link, aria-labels, aria-labelledby, trap de foco no lightbox
- SEO: Open Graph, Twitter Card, JSON-LD schema, sitemap e robots.txt

## Tecnologias

- HTML5 semântico
- CSS3 com custom properties (sem pré-processador)
- JavaScript ES2022+ (sem bundler)
- [Geist](https://vercel.com/font) — fonte sans-serif
- [JetBrains Mono](https://www.jetbrains.com/lp/mono/) — fonte monospace
- [Devicon](https://devicon.dev/) — ícones de tecnologias

## Estrutura

```
├── assets/
│   ├── css/
│   │   └── styles.css
│   ├── data/
│   │   ├── experience.js    # experiências (PT/EN)
│   │   └── projects.js      # projetos (PT/EN)
│   ├── img/
│   └── js/
│       ├── core.js          # utilitários compartilhados
│       ├── translations.js  # textos da interface
│       ├── content.js       # renderização de projetos e experiência
│       ├── ui.js            # menu, marquee, faixa de manutenção, animação de entrada
│       ├── i18n.js          # troca de idioma e typewriter
│       ├── glitch.js        # canvas de fundo
│       ├── theme.js         # tema claro/escuro
│       ├── lightbox.js      # ampliação das imagens
│       └── main.js          # ordem de inicialização
├── index.html
├── robots.txt
└── sitemap.xml
```

## Autor

[@richard-tavares](https://github.com/richard-tavares)
