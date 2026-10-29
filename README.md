# Vlink — vlink.github.io

Личная платформа «все ссылки в одном месте»: главная с героем и возможностями, блог и пример страницы ссылок.
React 19 + Vite + TypeScript + GSAP + lucide-react.

## Структура

```
public/          постоянные файлы (статьи-картинки, .nojekyll)
src/             исходники
  components/    Navigation, Footer, AuthModal, BootScreen, RainCanvas…
  sections/      Hero, Features, FAQ, CTA
  pages/         HomePage, ArticlesPage, LinksPage, NotFoundPage
  lib/           useReveal (GSAP-хуки, prefers-reduced-motion)
docs/            собранный сайт для GitHub Pages (checkout только здесь)
```

## Команды

| Команда           | Что делает                                    |
| ----------------- | --------------------------------------------- |
| `npm install`     | установка зависимостей                        |
| `npm run dev`     | локальная разработка (http://localhost:5173)  |
| `npm run build`   | проверка типов + сборка в `docs/`             |
| `npm run preview` | локальный просмотр собранного сайта           |

## Публикация на GitHub Pages

1. Соберите сайт: `npm run build` (папка `docs/` обновится).
2. Commit и push: `src/`, `public/`, `docs/`, конфиги (`node_modules/` игнорируется).
3. Settings → Pages → «Deploy from a branch» → ветка `main`, папка **`/docs`**.

Роутинг использует `HashRouter` и относительный base (`./`), поэтому сайт работает и
из-под вложенного пути `/vlink.github.io/`, и при заливке в корень домена — без 404.
