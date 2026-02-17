# Overview

This file contains relevant context for upcomming migrations to be performed before the end of June.
The deal with the following services:

daf: forwarded services from api.dataforsyningen to services.datafordeler will be shut down
ser: authentication using username and password attributes in URL/Header will be deprecated
dawa: the danish adress web api will be shut down along with all services dependent on it.

### Migration 1: Session-Based Authentication for Datafordeler

#### Current State
Datafordeler services currently use username/password authentication passed as URL query parameters.

#### Target State
Migrate to session-based authentication for `services.datafordeler.dk`.
Currently, the authentication approach to be used in undefined, but it is assumed to be session-bases.

#### Overall Component logic

In `src/Map.js`, each layer has an auth-attribute, which is set to one of the following:

```js
  const kfAuth = {
    source: 'kf',
    token: this._token
  }
  const dfAuth = {
    source: 'df',
    username: this._username,
    password: this._password
  }
```

The authentication method is currently added using the `createURL`method from `src/CreateLayer.js`,
and is the following:
```js
const createUrl = function (service, auth) {
  if (auth.source === 'kf') {
    const baseUrl = 'https://api.dataforsyningen.dk/'
    return baseUrl + service
  } else if (auth.source === 'df') {
    const baseUrl = 'https://services.datafordeler.dk/'
    return baseUrl + service + '?username=' + auth.username + '&password=' + auth.password
  }
  console.error('Unknown source: "' + auth.source + '"')
  return null
}
```

Furthermore, a custom tileload function differenciates between the two authentication approaches:
```js
const getTileLoadFunction = (auth) => {
  return (tile, src) => {
    const options = {}
    if (auth.source === 'kf') {
      options.headers = { token: auth.token }
    }
    // ... fetch logic
  }
} 
```
#### Initializing application with correct arguments

The attributes `this._username`and `this._password` are fetched
from data attributes on html elements of the type `div.geomap`.
Here, an `Initialize` class fetches the data attributes as a opts object and uses it to initialize some of it's fields.
For this refactor, the data attributes set, the fields set and any use/mention of those fields should be updated to new configuration.

Essentially, the callstack is `Initialize{}`
```js
class Initialize {
  
  /* ... */

  constructor(options) {
    // options is currently empty
    this.init(options)
  }

  // Methods
  init(options) {
    //init each map using options for that map
    this.maps = initMaps(options, scrapeMarkers())
  }

  /* ... */

}
```

The `initMaps` function then initializes itself with the attributes from the matching geomap element:
```js
function initMaps(options, markers) {
  // Target all map dom elements with the geomap class set
  const mapElements = document.querySelectorAll('div.geomap')
  let maps = []

  /* some mapping logic */

  return maps
}
```

In this way, Okapi creates a tree of nested maps and markers each containing their own data-attributes as well as the data-attributes from their ancestors. 

#### Procedure
- [ ] restructure `dfAuth`to match new authentication method for datafordeler
- [ ] refactor `createUrl` and `getTileLoadFunction` to correctly use this authentication approach (i.e first generate session token if session based)
- [ ] Replace all uses of this._username and this._password with new data-attributes 
- [ ] Update documentation in /config
- [ ] Run local development server (check that datafordeler layers load)
- [ ] Execute full test suite (all tests must pass)

### Migration 2: Move DAF Services from api.dataforsyningen.dk to services.datafordeler.dk

#### Current State

Some services are duplicated, i.e they are available from both Dataforsyningen (with `_DAF` suffix) and Datafordeler (through `servides.datafordeler`). Selection logic in `src/Map.js` chooses based on whether `this._username && this._password` or `this._token` is defined.

#### Target State

Single source of truth.
There should only be one service (either `api.dataforsyningen`or `services.datafordeler`) per map layer

#### Overall Component logic

Currently, `src/Map.js` loads a lot of layers to the map using the `createLayer` function.
There are guards checking that the instance of `Initialize`has the correct attributes to call the service, such as
```js

if (this._username && this._password) { // Datafordeleren bruger
      layers.push(createLayer({
      /* some attributes*/
        service: 'DKskaermkort/topo_skaermkort_wmts/1.0.0/Wmts',
        /* some attributes*/
        auth: dfAuth,
        /* some attributes*/
      })),
      /* other maplayers with datafordeler auth */
} else if (this._token) { // Dataforsyningen bruger
      layers.push(createLayer({
        /* some attributes */
        service: 'topo_skaermkort_wmts_DAF',
         /* some attributes */
        auth: kfAuth,
        /* some attributes */
      }))
      /* other maplayers with dataforsyning auth */
}
```

To refactor this, remove all `_DAF` services and make sure that the guards fit the new authentication approach  (i.e somethins this this._session_token instead of username and password) 


##### Procedure

- [ ] Remove Map services with `_DAF`
- [ ] Refactor guards and calls to `createLayer`to provide new authentication method for datafordeler
- [ ] Test with only token defined (should show only Dataforsyningen layers)
- [ ] Test with only Datafordeler auth defined (should show only Datafordeler layers)
- [ ] Test with both defined (should show all layers)
- [ ] Run full test suite


### Migration 3: Replace DAWA with Gsearch

#### Current State

`src/CreateMarkers.js` uses DAWA (Danmarks Adressers Web API) for address search and geocoding.

#### Target State

Migrate to Gsearch.

#### Overall Component logic

`src/CreateMarkers.js`  contains a `createFeature` function, that uses the `data-adress="some_address"`attribute from a span to query dawa and generate on the coordinates matching the address on the map.

Refactoring the `createFeatures` function to use Gsearch suffices for this.


##### 4. Testing

**Critical**:
- [ ] Refactor `createFeature`function
- [ ] Test locally with various address inputs
- [ ] Run E2E tests specifically for marker/address search functionality

---

## General Testing Checklist for All Migrations

Before any release:

- [ ] Run local development server (`npm run dev`)
- [ ] Execute full test suite (`npm test`)
- [ ] Perform manual testing of affected features
- [ ] Run E2E tests
- [ ] Test with different authentication configurations
- [ ] Verify all example HTML files work correctly
- [ ] Check browser console for errors
- [ ] Test on multiple browsers (Chrome, Firefox, Safari, Edge)
- [ ] Review all changed files for console.log statements or debug code

---

## Deployment Process

1. **Version Bump**: Update version in `package.json`
2. **Build**: Run build command (e.g., `npm run build`)
3. **Changelog**: Update `CHANGELOG.md` with detailed changes
4. **Documentation**: Update `README.md` and any other docs
5. **PR**: Create Pull Request to main branch
6. **Review**: Have another developer review the changes
7. **Tag**: After merge, create git tag for the version
8. **Publish**: Publish to npm (there is a github actions script for this)

---

## Important Files Reference

| File | Purpose | Key Migrations |
|------|---------|----------------|
| `src/CreateLayer.js` | Layer creation, URL construction, tile loading | Migration 1, 2 |
| `src/Map.js` | Map initialization, authentication objects | Migration 1, 2 |
| `src/services.js` | Service definitions catalog | Migration 2 |
| `src/CreateMarkers.js` | Address search and marker creation | Migration 3 |
| `src/Initialize.js` | HTML attribute parsing and initialization | Migration 1 (examples) |
| `src/examples/html/*.html` | Example implementations | All migrations |

---

## Contact Information

- **Dataforsyningen Docs**: https://docs.dataforsyningen.dk/ 
- **Datafordeler Docs**: https://confluence.sdfi.dk/display/DML/Datafordelerens+dokumentation 
- **Gsearch Repo**: https://github.com/SDFIdk/gsearch

---