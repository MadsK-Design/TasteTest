# Sådan får I smagslisten online

Det tager cirka 20 minutter. Du skal bruge en Google-konto (til Firebase) og en GitHub-konto. Din kæreste skal ikke bruge nogen konto, hun skal bare have linket.

## Del 1: Databasen i Firebase

1. Gå til https://console.firebase.google.com og log ind med en Google-konto.
2. Klik **Opret projekt** (Create a project), giv det et navn, f.eks. `smagsproever`. Google Analytics kan du slå fra.
3. Når projektet er oprettet, klik på web-ikonet **</>** ("Tilføj app" / Add app) på forsiden. Giv den et navn og klik **Registrer app**. Du skal ikke slå Firebase Hosting til.
4. Firebase viser nu en kodestump med `const firebaseConfig = { ... }`. Kopiér værdierne (apiKey, authDomain osv.).
5. Åbn `app.js` i VS Code. Øverst står `firebaseConfig` med `"INDSÆT-HER"`. Erstat dem med dine værdier.
6. Tilbage i Firebase: i menuen til venstre vælger du **Build → Firestore Database** og klikker **Opret database**. Vælg en placering i Europa (f.eks. `eur3` eller `europe-west`) og start i **production mode**.
7. Gå til fanen **Regler** (Rules) i Firestore, slet det der står, og indsæt dette. Skift `DIN-HEMMELIGE-KODE` ud med et langt ord, som kun I kender, f.eks. `julebobler-grantraer-4821-hyldeblomst`:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /lister/{kode} {
      allow get: if kode == "DIN-HEMMELIGE-KODE";
      allow create, update: if kode == "DIN-HEMMELIGE-KODE"
        && request.resource.data.keys().hasOnly(['entries', 'custom', 'kategorier', 'navne']);
    }
  }
}
```

8. Klik **Udgiv** (Publish).

Koden fungerer som en nøgle: kun den, der har det fulde link med koden, kan se og ændre jeres liste. Den står ikke i filen på GitHub, kun i linket og i Firebase-reglerne.

## Del 2: Siden på GitHub Pages

1. Gå til https://github.com og opret et nyt repository (**New**), f.eks. `smagsproever`. Sæt det til **Public** (det kræves for gratis GitHub Pages).
2. Upload `index.html`, `style.css` og `app.js`: klik **Add file → Upload files**, træk alle tre filer ind og klik **Commit changes**. (Bruger du VS Code med Git, kan du i stedet committe og pushe derfra.)
3. Gå til **Settings → Pages**. Under "Branch" vælger du `main` og mappen `/ (root)`, og klikker **Save**.
4. Efter et minut eller to står adressen øverst på samme side, f.eks. `https://ditbrugernavn.github.io/smagsproever/`.

## Del 3: Jeres kode

Åbn adressen, f.eks. `https://ditbrugernavn.github.io/smagsproever/`, på begge telefoner. Første gang beder siden om jeres kode. Skriv den, så husker telefonen den.

Vil du slippe for at skrive den, kan du sende linket med koden til sidst én gang (`…/smagsproever/?kode=DIN-HEMMELIGE-KODE`). Siden gemmer koden og fjerner den fra adresselinjen.

Vælg **Føj til hjemmeskærm** i browserens menu (Del-knappen i Safari, de tre prikker i Chrome). Så ligger den som en app.

Står der "Synkroniseret mellem jeres telefoner" under overskriften, virker det.

## Hvis noget driller

- **"Firebase er ikke sat op endnu"**: værdierne i `firebaseConfig` er ikke udfyldt, eller den nye fil er ikke uploadet til GitHub.
- **"Forkert kode. Prøv igen."**: koden er ikke præcis den samme som i reglerne. Store og små bogstaver tæller.
- **Ændringer på GitHub vises ikke**: GitHub Pages er nogle minutter om at opdatere. Genindlæs siden.

Firebase er gratis i det omfang, I bruger det her. I kommer ikke i nærheden af grænserne.
