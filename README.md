# Code in the Dark | Editor

> [!TIP]
> **TL;DR:** organising a contest? Go straight to [Run a contest](#run-a-contest).

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
- _optional_ heats - each heat has its own reference image, assets and instructions
- Dockerised into an Nginx-hosted webapp for portability/CI compatibility
- Convenience features like resetting, going back from the result
- `src/config.js` added to centralise customisations/configuration
- Contestant's code is now saved on each keystroke instead of debounced

## Requirements

To run a contest, you need either:

- [Docker](https://docs.docker.com/get-started/get-docker/) (recommended), or
- [Node.js](https://nodejs.org/en/) and [pnpm](https://pnpm.io/), to run the development server instead

For development you need Node.js and pnpm.

A Makefile is also provided to alias the pnpm and docker commands, so you may also want `make` (install it with your package manager of choice).

## Run a contest

> [!IMPORTANT]
> For the best experience, use a Chromium-based browser, especially for the viewer feature to function as intended.

> [!NOTE]
> No push access? [Fork the repository](https://github.com/1337jazz/code-in-the-dark/fork) on GitHub and use your fork's address in the `git clone` command(s) instead!

### How it works

Every contest machine runs its own copy of the editor. Each machine needs two screens - one for the contestant and one facing the audience for the viewer. The viewer shows the audience the contestant's screen and, if previews are turned on, a short preview of their result every few minutes (configurable).

In this fork, a contest is split into heats. Each heat has its own reference image (the design contestants have to build), its own assets (images etc. contestants can use) and its own instructions. You set up all heats once before the event, and pick the heat on each machine at the start of every round.

### 1. Prepare the heats (once, on any machine)

You only need the reference images and assets for each heat, and a name for each heat. You can have any number of heats, but you need at least one. Not running heats? Set up just one heat, delete the other examples and leave a single entry in `HEATS`.

1. Clone the repository:

   ```bash
   git clone git@github.com:1337jazz/code-in-the-dark.git
   cd code-in-the-dark
   ```

2. For each heat, create a folder in `public/heats/`. Five example heats (`1` to `5`) are already there, so you can overwrite them, copy them or delete them. The folder name is the heat's id, e.g. `1`, `my_heat` or `A`. The easiest way is to copy an example heat:

   ```bash
   cp -r public/heats/1 public/heats/my_heat
   ```

   Each heat folder must look like this:

   ```
   public/heats/my_heat/
     reference.png        // the design contestants have to build
     instructions.html    // the rules and the list of assets, shown in the editor
     assets/              // the images, fonts etc. contestants can use
   ```

3. In each heat folder:
   - Replace `reference.png` with the heat's reference image - NOTE!! keep the name `reference.png`
   - Delete the example assets in `assets/` and put the heat's assets there
   - Edit `instructions.html`: under "Assets", list every asset with its full path and size, e.g. `/heats/my_heat/assets/logo.png (300x120)`. Contestants should copy these paths into their code when needed, so check them carefully!

4. Delete the example heats you don't need, e.g. `rm -r public/heats/5`

5. Open `src/config.js` and edit `HEATS` so it has one entry per heat folder, in the order you want them in the menu. `id` must match the folder name exactly, `name` is what organisers see in the menu:

   ```js
   export const HEATS = [
     { id: "1", name: "Heat 1" },
     { id: "my_heat", name: "My heat" },
   ];
   ```

6. Check the other settings in `src/config.js`. Each one has a comment explaining it. The ones you're most likely to change:
   - `ENABLE_PREVIEW`: `false` turns off the audience previews. The viewer still shows the contestant's screen
   - `PREVIEW_TICK`: seconds between previews, e.g. `300` for one every 5 minutes
   - `PREVIEW_SECONDS`: how long each preview shows, e.g. `15`
   - `MAX_PREVIEWS`: how many previews per heat, e.g. `4`, or `Infinity` for no limit
   - `EDITOR_FONT_SIZE`: the editor's text size, e.g. `24` for bigger text
   - `EXCLAMATIONS`: the messages that pop up while contestants type

7. Commit and push:

   ```bash
   git add -A
   git commit -m "add contest heats"
   git push
   ```

### 2. Set up each contest machine

Each machine needs [Docker](https://docs.docker.com/get-started/get-docker/), [git](https://git-scm.com/downloads) and, ideally, `make`.

> [!NOTE]
> If Docker doesn't work on a machine, use the development server instead. Install [Node.js](https://nodejs.org/) and [pnpm](https://pnpm.io/), do step 1 (clone) below, then run `pnpm install` and `pnpm dev` (or `make dev`) and open `http://localhost:5173`. Later changes then only need a `git pull`, no rebuild.

1. Clone the repository:

   ```bash
   git clone git@github.com:1337jazz/code-in-the-dark.git
   cd code-in-the-dark
   ```

   If the repository is already on the machine, update it instead in case the heats dir has updated:

   ```bash
   cd code-in-the-dark
   git pull
   ```

2. Build and start the app. Run `make stop` first in case the app is still running from an earlier run (an error saying there is no such container is fine):

   ```bash
   make stop
   make build
   make run
   ```

   Without `make`:

   ```bash
   docker rm -f code-in-the-dark
   docker build -t code-in-the-dark .
   docker run -d --rm --name code-in-the-dark -p 8080:80 code-in-the-dark
   ```

3. Close all other browser windows, then open `http://localhost:8080` in Chrome or Edge.

> [!WARNING]
> The app is copied into the Docker image when you build it. If you change anything later (a heat, an image, `src/config.js`), commit and push it, then on **every** machine run `git pull`, `make stop`, `make build` and `make run` again.

### 3. Start a heat (on each machine)

1. Enter the contestant's name when asked
2. On the start page, pick the heat from the menu
3. Close any viewer tab left over from the last heat, then click "Viewer" on the start page. In the new tab, click "Share editor window" and pick the editor tab. Move the viewer to the audience screen
4. Click "START" when the round begins

During the round, the viewer shows the contestant's screen and, if previews are turned on, a short preview of their result at the times set in `src/config.js`.

### 4. End a heat

1. When time is up, the contestant clicks "Finish" and types "yes". Their result is shown, and the viewer switches to it as well
2. To get ready for the next contestant, click the arrow on the bottom right of the result screen to go back, then click "Reset" and confirm. This clears the code, the name and the heat
3. Go back to [3. Start a heat](#3-start-a-heat-on-each-machine)

### Troubleshooting

- **Reference image or instructions are blank**: the heat's `id` in `src/config.js` doesn't match its folder name, or the image isn't called `reference.png`
- **An asset doesn't show in the result**: the path in the contestant's code is wrong. It must start with `/heats/<id>/assets/`, exactly as listed in the instructions
- **Changes don't show up**: you didn't rebuild. Run `make stop`, `make build` and `make run`
- **Stop the app**: run `make stop` (or `docker rm -f code-in-the-dark`)

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
