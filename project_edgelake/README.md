# Supabase Edge Function

## Environment Variables

There are two main environment segment. The `client environment` and the `server environment`.

### Client Environment

The client environment is prefix with `VITE_` this is required for vite to safely expose this variable on the client side without posing security risk to the application. You must define the `VITE_APP_ENV="dev"` for example to point to the development environment. All corresponding environment variable must also have the suffix e.g `VITE_SUPABASE_URL_DEV` that matches with the value of `VITE_APP_ENV`.

Application will throw runtime error if this is not defined.

Required client environment variables:

```bash
VITE_APP_ENV=dev  # current environment for client application

# client supabase Configuration
VITE_SUPABASE_URL_DEV=supabase-app-url
VITE_SUPABASE_ANON_KEY_DEV=supabase-anon-key
```

### Server Environment

This refers to the supabase environment. You must set the `APP_ENV` variable to define the deployment environment. All other variables must have the targeted environment suffixes.

```bash
APP_ENV=dev  # Current environment: dev, staging, or prod for server application

# Project references for each environment
APP_ID_DEV=wubnxmzqxlwktuhbmrdo # the supabase ID of the deployment environment
APP_ID_STAGING=""
APP_ID_PROD=""
```


## Deployment Supabase Project

We can now deploy project by running various commands based on the different types of operation to perform.
Deploy to project supabase: this will link to the project specified in the `APP_ID_DEV` or `APP_ID_STAGING` variable depending on the value set in `APP_ENV` and deploy all or specified function.

### Deploying project and functions

To deploy all the functions pass the `all` param to the command:

```bash
npm  run supabase:deploy-project all
```

To deploy a specific function by name, run:

```bash
npm  run supabase:deploy-project chatlifeatlas
```

### Running Migrations

Each update to the database must be accompanied by corresponding migration. Migration is defined in the `supabase/migrations` folder.

```bash
npm  run supabase:migrate
```
