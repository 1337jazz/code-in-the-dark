# Code in the Dark | Editor

Fork of [codeinthedark/editor](https://github.com/codeinthedark/editor) by Tictail Inc, used under its BSD license ([LICENSE](LICENSE)).

## What is [Code in the Dark](http://codeinthedark.com)?

From the [original Github repository](https://github.com/codeinthedark/codeinthedark.github.io):

> [Code in the Dark](http://codeinthedark.com) is a front-end (HTML, CSS) competition, originating from [Tictail](https://tictail.com), 
> where each contestant compete to implement a website design given only a screenshot. The catch is that no previews of the results are 
> allowed during the implementation, and no measuring tools can be used. The winner is decided by the audience.

## Premise
This is a rewrite (or refactor, perhaps) of the original editor, using JavaScript instead of the original CoffeeScript,
which was achieved with the great [decaffeinate](https://decaffeinate-project.org) project. The main new feature is the viewer - see below. 

A lot of effort was put into making the code base clearer (at least for me) with liberal use of comments and some code splitting;
however, a deliberate attempt was made not to change too much in order to keep the original spirit of the code base. It's not
perfect, but it should be stable enough to use for live contests.

## New features

- An _optional_ feature for audience previews - at a configurable interval the audience can see the contestant's progress
- Dockerised into an Nginx-hosted webapp for portability/CI compatibility
- Convenience features like resetting, going back from the result
- `src/config.js` added to centralise customisations/configuration
- Contestant's code is now saved on each keystroke instead of debounced

## Requirements

To run a contest, you need either:

- [Docker](https://docs.docker.com/get-started/get-docker/) (recommended), or
- [Node.js](https://nodejs.org/en/) and [pnpm](https://pnpm.io/), to run the development server instead

For development you need Node.js and pnpm.

A Makefile is also provided to alias the pnpm and docker commands, so you may also want `make` (install it with your package manager).

## Run a contest

> [!IMPORTANT]
> For the best experience, use a Chromium-based browser, especially for the viewer feature to function as intended.

### Setup
The standard way to run this contest is to have a main screen for each of contestants and another monitor facing outwards, towards an audience. If
you want to use the preview feature, the viewer window should be on this other monitor.

Though you can just run the development server above to run a contest, the Docker image is more portable. Either way, the instructions are mostly the same:

0. Close all other browser windows
1. Replace `public/assets/page.png` with the reference screenshot (whatever you want the contestants to build)
2. Put any assets the contestants need (images etc.) in `public/assets/`
3. Edit `public/instructions.html`: list those assets with their dimensions etc and adjust the rules
4. Edit `/src/config.js` to make any changes and customisations
5. Build and run (see below), then open the editor and enter the contestant's name

### Build and run

With Docker:

```bash
make build
make run
```
or if you don't have `make`:

```bash
docker build -t code-in-the-dark .
docker run --rm -p 8080:80 code-in-the-dark
```

Then go to `http://localhost:8080` to view the app.

### During a round

If you don't want live previews for the audience, you're done. Otherwise:

6. Click "Viewer" to open the viewer in a new tab, click "Share editor window" and pick the editor tab
7. Put the viewer on the audience screen, keep the editor on the contestant's screen
8. After the round, the contestant presses "Finish", and the viewer switches to their result

### End of the round

You can click the arrow on the right of the result screen to go back, then press "Reset" and enter the name of the next contestant.

## Development

You can then run the below commands to run the development server and get started:

```bash
make dev
```
or if you don't have `make`:

```bash
pnpm install
pnpm dev
```

Then go to `http://localhost:5173` to view the app.

`example.html` is a small sample page (navbar, hero and cards). Copy and paste it into the editor to have something to test with.

#### Stopping the container

When you're done, clean up by running `make stop` or `docker rm -f code-in-the-dark`

## Contributing

Contributions are welcome! Open an issue first for anything bigger than a small fix.

This project follows the spirit of [Codeberg's stance on generative AI](https://blog.codeberg.org/protecting-our-floss-commons-from-llms.html):

- Contributions must be mostly written by you. Pull requests that mostly consist of AI-generated code will be closed, even if you reviewed it afterwards.
- Small AI-assisted changes are fine, but say so in the pull request and make sure you understand and can explain every line.
- No contributions made by autonomous AI agents.


## License

BSD license, see [LICENSE](LICENSE). Based on [codeinthedark/editor](https://github.com/codeinthedark/editor), copyright (c) 2015 Tictail Inc.

This project is not affiliated with or endorsed by Tictail or Code in the Dark.

The [Press Start 2P](https://fonts.google.com/specimen/Press+Start+2P) font by CodeMan38 is licensed under the SIL Open Font License.
