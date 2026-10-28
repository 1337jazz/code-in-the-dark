# Code in the Dark editor

Fork of [codeinthedark/editor](https://github.com/codeinthedark/editor) by Tictail Inc, used under its BSD license ([LICENSE](LICENSE)).

This is a re-write of the original editor, to use JavaScript instead of CoffeeScript, along with a few new features:

- Preview page - now the audience can optionally see the result of the competitors' code as they go along
- Can be served from Nginx via Docker


## Development

You need to have [Node.js](https://nodejs.org/en/) and [pnpm](https://pnpm.io/) installed. You can then run the below commands to get started.


```bash
pnpm install
pnpm dev
```

Editor: `http://localhost:5173`. Viewer: `http://localhost:5173/viewer.html`.

## Run a contest

If you want, you could use the dev mode above to run a contest, but using the Docker image is recommended, plus you get a get a few extras:

- A real web server, no need to to reference `*.html` files in the browser

Replace `public/assets/page.png` with the reference screenshot, add extra files to `public/assets/` and list them in `public/instructions.html`.

With Docker:

```bash
docker build -t code-in-the-dark .
docker run --rm -p 8080:80 code-in-the-dark
```

Editor: `http://localhost:8080`. Viewer: `http://localhost:8080/viewer`.

Note: Without Docker, run `pnpm dev` as above. The viewer needs the `.html`.
