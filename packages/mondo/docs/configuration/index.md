[Back to home](../MONDO.md)

# Configuration

-   [Options](#configuration-options)
-   [Server Options](#server-options)

Having a `mondo.config.js` file in the project root is required.
It exports a configuration object that suits your project's needs.
Here's an example of a minimal configuration below.

`mondo.config.js`

```js
export default {
    root: 'src', // Default value
    viewsDirectory: 'views', // Relative to 'root' -> 'src/views'
    renderMode: 'server',
};
```

## Configuration Options

| Name                | Description                                                    | Default                                                                               |
| ------------------- | -------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| root                | Project root directory path                                    | src                                                                                   |
| renderMode          | Method to use when generating site output                      | ssg                                                                                   |
| buildDirectory      | Directory to write build output to                             | build                                                                                 |
| pagesDirectory      | Directory for file-based routing. Relative to root             | src/pages                                                                             |
| viewsDirectory      | Directory for template related files. Relative to root         | src/views                                                                             |
| globalDataDirectory | Directory where global data files are stored. Relative to root | src/data                                                                              |
| watchTargets        | Live-relad targets to watch for                                | ['**/*.js', '**/*.ts', '**/*.njk', '**/*.scss', '**/*.css', '**/*.yaml', '**/*.json'] |
| passthrough         | Paths to pass through to the build folder. Relative to root    | []                                                                                    |
| templateFilters     | Filters to be used by template engine                          |                                                                                       |
| server              | See (Server Options)[#server-options]                          |

## Server Options

Configuration options passed to server.

| Name               | Description                                                          | Default    |
| ------------------ | -------------------------------------------------------------------- | ---------- |
| templateEngine     | Template engine to use                                               | njk        |
| staticFilesPath    | Directory for static files and assets. Relative to root              | src/public |
| staticFileRoute    | Route for server to render static file from                          | /public    |
| port               | Port for development and production server                           | 3000       |
| serverWatchTargets | Watch targets for nodemon. Relative to root                          | ['src']    |
| serverHook         | Callback function that has access to server and template environment |            |


