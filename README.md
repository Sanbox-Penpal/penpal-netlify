# SanBox Penpal Community!

This is the codebase that powers the Telegram Bot that runs SanBox's Penpal Community

## Project setup ⚙

I've opted to use yarn here but you may use npm if you prefer. The following command installs the node_modules/dependencies required in this project.

```
yarn install
```

### Environment Variables

Copy the .sample.env file and rename it as .env. Add in the required variables and the dotenv-webpack dev-dependency will take care of the rest.

```
cp .sample.env .env
```

### Compiles and hot-reloads for development

Netlify lambda is used for local development.

```
yarn serve // Deploys the netlify-functions at localhost:9000
```

### Editor

I use eslint/prettier so please also use it.

## Technologies/Frameworks/Services 👨‍💻

The project is currently deployed on **Netlify**, with **Typescript** as the main programming language.

For database/data storage, we've used **Firestore** as it was free but also because it allows non-coders to easily modify most of the static content present and manage the data whenever necessary.

**Google Sheet API** is also used to record purchases when they occur.
