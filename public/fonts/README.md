# Fontes

Auto-hospedadas, nunca CDN. Os `@font-face` ficam em `src/app.css`.

| Arquivo                   | Cobre                            | Tamanho |
| ------------------------- | -------------------------------- | ------- |
| `Inter-Variable.woff2`    | pesos 100–900, eixo óptico 14–32 | 202 KB  |
| `JetBrainsMono-400.woff2` | 400 regular                      | 22 KB   |
| `JetBrainsMono-500.woff2` | 500 medium                       | 23 KB   |

Total 247 KB. `app.html` faz preload só do Inter; o mono entra sob demanda.

## Como chegaram aqui

O Inter veio da release oficial (`web/InterVariable.woff2`, 343 KB) e o JetBrains Mono
de `D:\Nestcloud\nestcloud-front` como TTF estático.

As três foram reduzidas com `pyftsubset` para `latin` + `latin-ext`, removendo Cyrillic
e Greek, que este produto não usa (pt-BR e en-US). O Inter caiu de 343 KB para 202 KB e
cada JetBrains Mono de 38 KB para ~22 KB.

O subset preservou os dois eixos variáveis do Inter: `wght` 100–900 e `opsz` 14–32. O
`font-optical-sizing: auto` no `body` faz o navegador escolher o desenho certo por
tamanho de texto sozinho — é o que evita usar letra de display em texto de 14px.

## Se precisar refazer

Trocar de versão do Inter ou adicionar idioma com outro alfabeto exige repetir o
subset. Nesse caso, instale `fonttools[woff]` e `brotli` e rode `pyftsubset` com
`--flavor=woff2 --layout-features='*' --no-hinting` e os ranges de `latin` + `latin-ext`.
Sem `--layout-features='*'` você perde kerning e ligaduras.

Adicionar russo, grego ou japonês significa refazer sem esses limites, ou servir um
segundo arquivo com `unicode-range` próprio.
