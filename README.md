# Money Management Angular App

## Build and development server

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

Run `ng serve --open` for a dev server.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Command history

Some commands used during development were:

    ng generate component header-select

## Deploy

Since GitHub pages are deployed from *main* branch, there is no need to use any other tool, just `ng build`:

```
ng build --configuration production --base-href "/money-management/"
```

## TODO

1. Validate the first row (headers row) contains only string values
3. Hide *Ignore* columns
6. Sort rows by amount
7. Block (make read-only) amount column
