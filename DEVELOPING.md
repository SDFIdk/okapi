# Udvikling

## Indsæt API-key

Kopier filen .env.example og kald den .env.
Indsæt i den token til Dataforsyningen og brugernavn og password til Datafordeleren.

## Installer npm

Åben folderen i konsolen og kør:
```
npm i
```

## Start udviklingsserver

I konsolen: 
```
npm run dev
```
Det starter en udviklingsserver, så du kan åbne eksempel-sider i en browser; f.eks. på [localhost:8000/examples/simple.html].

Så længe den kører, vil den automatisk bygge med nye ændringer du laver i `/src`.
HTML-eksemplerne i `/examples` bliver dog ikke opdateret, med mindre du kører `npm run build`

## Byg til prod

For at bygge til prod, kør:
```
npm run build
```
Dette opdaterer også versionsnumre og SRI-hashes i `REAME.md`.

## Kør tests

Første gang du kører test lokalt, skal du installere Playwright med
````
npx playwright install
````
Derefter kan du køre tests med:
```
npm run test
```
