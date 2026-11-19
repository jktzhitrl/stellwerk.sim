# Stellwerk.sim als kostenlose Android-App

**Status: Entwicklergerüst / Testphase. Noch nicht im Play Store veröffentlicht.**

Das Android-Projekt verwendet **Capacitor 8** und packt den vorhandenen Stellwerk-Simulator, den Bahnhofseditor und die selbst gebauten Bahnhöfe als lokale Dateien in eine Android-WebView. Die Webversion auf GitHub Pages bleibt unberührt. Das Tycoon-Spiel ist **nicht** Bestandteil des Android-Bundles.

## Voraussetzungen

- Node.js 22 oder höher, npm
- Android Studio und Android SDK für API 36, JDK 21
- Ein Android-Gerät oder Emulator für Tests

Siehe [Capacitor Android](https://capacitorjs.com/docs/android) und [Environment Setup](https://capacitorjs.com/docs/getting-started/environment-setup).

## Entwicklungsstart

Vom Repository aus:

```bash
cd android-app
npm install
npm run prepare:web
npx cap add android
npx cap sync android
npx cap open android
```

`npx cap add android` wird **nur beim ersten Mal** ausgeführt. Nach jeder Änderung an den HTML-Dateien aus dem Repository:

```bash
cd android-app
npm run android:sync
```

Für einen Debug-Build:

```bash
cd android-app
npm run android:debug
```

Debug-APK: `android-app/android/app/build/outputs/apk/debug/app-debug.apk`. Ein **signiertes** Android App Bundle (AAB) für Google Play ist damit **noch nicht** erstellt.

Der GitHub-Actions-Workflow `.github/workflows/android-debug.yml` versucht bei Änderungen einen Android-Debug-Build und stellt die APK als **Workflow-Artefakt** bereit. Ob der Build erfolgreich läuft, muss nach der ersten Ausführung geprüft werden.

## Projektstruktur

- `package.json` – Capacitor 8 / npm-Befehle.
- `capacitor.config.json` – App-Konfiguration.
- `scripts/prepare-web.mjs` – kopiert die vorhandenen Spielseiten und Icons aus der Repository-Wurzel in das lokale `www/`-Verzeichnis.
- `www/` – generiert, nicht committen.
- `android/` – wird beim ersten `npx cap add android` erzeugt. Nach dem Generieren können native Anpassungen im Repository versioniert werden; **niemals** private Signing-Dateien committen.

**Wichtig:** Die Android-App registriert den Browser-Service-Worker nicht, da alle benötigten Spielseiten im APK enthalten sind. Änderungen am Spiel erfordern einen neuen App-Build. Der Spielstand des Editors liegt momentan lokal in `localStorage` und wird nicht zwischen verschiedenen Installationen oder Geräten synchronisiert.

## Google-Play-Vorbereitung

- [ ] Paketnamen/`appId` festlegen: derzeit **vorläufig** `de.stellwerksim.app`. **Vor der ersten Play-Store-Veröffentlichung bestätigen**, da die Kennung später nicht ohne Weiteres geändert werden kann.
- [ ] Auf mehreren Android-Smartphones und Tablets prüfen: Uhr, Züge, Fahrstraßen, Lok kuppeln, Editor, Fahrplan, Speichern/Laden.
- [ ] App-Icon und adaptive Icons, Startbildschirm, Bedienung im Querformat, Zugänglichkeit und Zurück-Navigation finalisieren.
- [ ] Datenschutzrichtlinie, Daten-Sicherheitsangaben, Altersfreigabe, App-Beschreibung und Screenshots für die Play Console vorbereiten.
- [ ] Release-Signierung und **Android App Bundle (.aab)** sicher erstellen; Keystore und Passwörter niemals ins Repository legen.
- [ ] Ziel-API-Level prüfen: **API 36** wird von Capacitor 8 unterstützt und ist für neue Apps gemäß Stand November 2026 von Google Play gefordert.
- [ ] Ggf. erforderlichen geschlossenen Play-Store-Test durchführen, bevor der öffentliche Release beantragt wird.
- [ ] Prüfen, ob Browser-Speicher bei Aktualisierung und Deinstallation wie erwartet behandelt wird. Deinstallation kann lokal gespeicherte Bahnhöfe entfernen.

## Für den Play-Store-Release

Diese erste Umsetzung liefert ein **Android-Projektgerüst und einen Debug-Build-Prozess**. Die Play-Store-Veröffentlichung, die Signierung und Änderungen im Google-Entwicklerkonto erfolgen erst in einem separaten, ausdrücklich freigegebenen Schritt. Für das Spiel ist ein kostenloser Vertrieb vorgesehen; es sind keine Anzeigen, In-App-Käufe oder Bezahlfunktionen integriert.
