feel free to copy my scripts but don't create your repo from this template. 
create from the original: https://github.com/Tanimodori/viteburner-template.git






## API

See [viteburner](https://github.com/Tanimodori/viteburner/blob/main/README.md).

## How to update my clone to the latest version of the template

Usually you only need to upgrade viteburner using npm (or any other package manager you use).

```bash
npm i -D viteburner@latest
```

Or if you want to update all configs:

```bash
# add "upstream" to git remote in case you've overwritten the "origin"
git remote add upstream https://github.com/Tanimodori/viteburner-template.git
# fetch the updates from "upstream"
git fetch upstream
# perform the merge
git merge upstream/main
# NOTE: resolve git conflicts manually now.
# install packages if any gets updated.
npm i
```

## License

[MIT License](LICENSE) © 2022-present Tanimodori
