# [maronato.dev](maronato.dev)' Blog

Blog powered by [Ghost](https://ghost.io/)

Requires [Buildkit](https://docs.docker.com/develop/develop-images/build_enhancements/) to build

Environment vars:

- `NODE_ENV`: Regular old Node env
- `DOMAIN`: The app's root domain
- `PRERENDER_URL`: Prerender service URL (e.g. `http://<internal-prerender-domain>:3000`)
- `GHOST_API_KEY`: Content API key provided by Ghost
- `FIREBASE_PROJECT_ID`: Firebase project ID to use as like's storage
- `GHOST_API_DOMAIN`: Ghost's API domain
- `COMMENTO_DOMAIN`: Commento's API domain
- `FATHOM_SITE_ID`: Fathom site id for tracking
- `FATHOM_DOMAIN`: Fathom domain


You'll also need to configure nginx to redirect some requests to your Ghost container.

Something like this is enough:
```
set $ghost_upstream http://<ghost-container>:2368;
location ~ ^/(ghost/|content/|members/|sitemap|robots.txt|([A-Za-z-]+/(rss|feed))) {
    proxy_pass $ghost_upstream;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```
