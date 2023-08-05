[Back to home](./MONDO.md)

# Building Pages

## Contents

-   [Templating in the `views` directory](#templating)
-   [Creating a route in the `pages` directory](#create-a-route)
    -   [Basic Routes](#basic-routes)
    -   [Dynamic Routes](#dynamic-routes)
    -   [Route Functions](#route-functions)

## Templating

TODO

## Create A Route

### Basic Routes

To create a route add a JS file in the `pages` directory that matches the slug that you want the route to have.

**Input**
`pages/index.js`

**Output**
`index.html`

### Dynamic Routes

You can also create dynamic routes by wrapping the slug in `[]`

Slugs: `post-one`, `post-two`, `post-three`

**Input**
`pages/posts/[slug].js`

**Output**
`posts/post-one.html`
`posts/post-two.html`
`posts/post-three.html`

### Route Functions

Depending on the [renderMode](./configuration/render-modes.md), a route can have two functions:

-   `createPage` - Handles data sent to template for a specific route. This function is required for all routes.

-   `createPaths` - Specifies all the slugs that a certain route can have. This is only needed for the `SSG` build or if you are using the `prerender` option in the `server` mode.

#### Example Route

`pages/[page].js`

```js
const slugs = ['page-one', 'page-two', 'page-three'];

export function createPage(ctx) {
    /* The 'page' property is from the `pages/[page].js` route name */
    const slug = ctx.params.page;

    return {
        slug,
        title: `This is the ${slug} page`,
        /* This file is relative to the `views` directory */
        template: 'base.njk``
    };
}

/* Since the `renderMode` is using SSG the `createPaths` function is required. If your are using the `server` renderMode then this isn't required unless a route has a `prerender: true` property  */
export async function createPaths() {
	return slugs.map((slug) => ({
		// Return the [page] param for SSG
		page: slug,
	}));
}
```
