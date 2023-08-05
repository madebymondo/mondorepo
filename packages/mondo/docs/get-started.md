# Get Started

## Contents

-   [System Requirements](#system-requirements)
-   [Installation](#installation)
-   [Folder Structure](#folder-structure)

## System Requirements

-   At least [NodeJS](https://nodejs.org/en) v18.16.0

## Installation

1.Install the `@madebymondo/mondo` package

```sh
npm i @madebymondo/mondo
```

2. Add the following scripts to the `package.json`

```json
{
    "start": "mondo start",
    "build": "mondo build",
    "dev": "mondo dev"
}
```

## Folder Structure

A Mondo site requires the following site structure

-   **`mondo.config.js` file in the project root**

    This is the configuration file. The following directories and files can be overridden here.

-   **`pages` directory (defaults to `src/pages`)**

    The directory that will be used for file-based routing. For more info see [Building Pages](./building-pages.md)

-   **`views` directory (default to `src/views`)**

    Contains all template and markup code

-   **`data` directory (default to `src/data`)**

    Contains global data files that can be used in the tempalates. See [Data Files](./data-files.md)

### Example folder structure

```
src/
├─ pages/
│ ├─ index.js
│ ├─ [slug].js
│ ├─ posts/
│ │ ├─ [post].js
├─ views/
│ ├─ base.njk
│ ├─ partials/
│ │ ├─ header.njk
├─ data/
│ ├─ currentYear.js
mondo.config.js
package.json
```
