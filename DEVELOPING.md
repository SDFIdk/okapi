# Udvikling

## Indsæt API-key

Kopier filen .env.example og kald den .env.
Indsæt i den token til Kortforsyningen og brugernavn og password til Datafordeleren.

## Installer npm

Åben folderen i konsolen og kør:

```
npm i
```

## Byg og kør test

I konsolen: 
```
npm run dev
```
Så længe det kører vil den automatisk bygge med nye ændringer du laver.

den vil også bygge exemplerne i /test

## Byg til prod

For at bygge til prod kør:
```
npm run build
```

README.md bliver **IKKE** automatisk opdateret.
I den skal versions nummer og srihash manuelt opdateres efter et build.
