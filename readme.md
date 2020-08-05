# [maronato.dev](maronato.dev)' Blog

Blog powered by [Ghost](https://ghost.io/)

Requires [Buildkit](https://docs.docker.com/develop/develop-images/build_enhancements/) to build

Environment vars:

- `APP_ENV`: Build environment (`dev` or `prod`) defaults to `dev`
- `NODE_ENV`: Regular old Node env
- `DOMAIN`: The apps domain
- `PRERENDER_URL`: Prerender service URL (e.g. `http://<internal-prerender-domain>:3000`)
- `GHOST_API_KEY`: Content API key provided by Ghost
- `FIREBASE_PROJECT_ID`: Firebase project ID to use as like's storage
