# Card Type × Valid Size × Representative State Matrix

Stand: 29. August 2026, Sprint 25.6

Diese Matrix wird aus der tatsächlichen Dashboard-Konfiguration, den vier
Wall-Display-Renderern und den serverseitigen Layoutgrenzen abgeleitet. Sie
führt keine nur geplanten Home-Assistant-Domains als unterstützt auf.

## Tatsächlich unterstützte Card-Typen

| Konfigurationstyp | Entity-Domain im typischen Einsatz | Renderer | Primärer Inhalt | Controls |
| --- | --- | --- | --- | --- |
| `sensor` | `sensor` | `SensorWidget` | Wert, Unit, Identität, Sekundärtext | keine |
| `binary` | `binary_sensor` | `BinaryWidget` | Offen/Geschlossen/Nicht verfügbar, Identität | keine |
| `light` | `light` | `LightWidget` | An/Aus/Nicht verfügbar, Identität | genau ein Power-Control |
| `climate` | `climate` | `ClimateWidget` | Identität, Current, Target, HVAC/Action, Sekundärtext | Minus, Plus, Power |

`switch`, `cover`, `fan`, `lock`, `media_player` und `vacuum` besitzen im
aktuellen Wall-Display weder einen Renderer noch einen erlaubten
Konfigurationstyp. Sie gehören deshalb nicht zur Abnahmematrix.

## Gültige Größen

Der Editor bietet die Presets `compact`, `normal`, `wide`, `tall` und `large`
als Startgrößen an. Nach dem Einfügen kann eine Card jedoch innerhalb der
validierten Grenzen um einzelne Rasterzellen vergrößert oder verkleinert
werden. Die vollständige gültige Matrix ist daher größer als die fünf Presets.

Für alle Typen gelten:

- Höhe `h = 1, 2, 3, 4`
- Portrait: 6 Spalten
- Landscape: 12 Spalten
- nur ganzzahlige `w`/`h`
- Position und Kollision ändern die zulässigen Dimensionen nicht

| Typ | Portrait-Breiten | Portrait-Kombinationen | Landscape-Breiten | Landscape-Kombinationen |
| --- | --- | ---: | --- | ---: |
| `sensor` | `w = 2…6` | 20 | `w = 2…12` | 44 |
| `binary` | `w = 2…6` | 20 | `w = 2…12` | 44 |
| `light` | `w = 2…6` | 20 | `w = 2…12` | 44 |
| `climate` | `w = 2…6` | 20 | `w = 3…12` | 40 |

Damit werden 252 profilabhängige Typ-/Größenkombinationen geprüft.

## Repräsentative Zustände

Jede gültige Größe wird mit jedem Zustand ihres Typs kombiniert:

| Typ | Zustände/Inhalte | Fälle über alle Größen |
| --- | --- | ---: |
| `sensor` | kurzer Wert; negativer langer Dezimalwert mit langer Unit und langem Namen; `unknown`; `unavailable` | 256 |
| `binary` | `on`; `off` mit langem Namen/Sekundärtext; `unknown`; `unavailable` | 256 |
| `light` | `on` steuerbar; `off` steuerbar und langer Name; `on` read-only; `unavailable` | 256 |
| `climate` | Heating; Cooling mit langem Namen und Viertelgrad; negativer Dezimalwert; Off mit Power-on und °F; `unknown`; `unavailable` | 360 |

Gesamtumfang des automatisierten Matrix-Harness: 1.128 Renderfälle.

## Presentation-Tiers

Grid-Geometrie und Widget-Presentation bleiben getrennt. Das Raster legt nur
Position und `w × h` fest. `LegacyPresentation` entscheidet anschließend aus
Typ, Grid-Dimension, effektiver Pixelbreite/-höhe, Control-Capabilities,
Identitäts-/Wertdichte und Sekundärinhalt über genau eine Darstellung:

| Tier | Zweck |
| --- | --- |
| `compact` | schmale/kurze Cards; Kernwert und Identität, Controls bleiben im DOM und Focus erreichbar |
| `standard` | mittlere Card mit normaler Informationshierarchie |
| `wide` | breite, kurze Card mit bewusster horizontaler Anordnung |
| `tall` | schmalere, hohe Card mit verteilter vertikaler Fläche |
| `large` | breite und hohe Card mit vergrößerten Werten und eigener großflächiger Anordnung |

Climate Large trennt Current und Target/Controls proportional. Die Control-
Zone verwendet nicht mehr `width: 100%` neben einem zweiten Flex-Kind. Minus,
Plus und Power bleiben je mindestens ungefähr 44 × 44 Pixel; im Large-Tier
sind sie 52 × 52 Pixel.

## Automatisierte Prüfungen

`test/sprint-25-6.test.js` prüft Inventory, jede gültige Servergröße, alle
1.128 Zustandsfälle, Tier-Vollständigkeit, Identität, Primärinhalt, genaue
Control-Anzahl, ES5, CSS-Grid-Freiheit und unveränderte Write-Grenzen.

`test/card-matrix-harness.html` rendert dieselben Fälle mit dem echten CSS und
den echten Wall-Renderern. Der Browser-Harness misst:

- horizontales und vertikales Overflow,
- semantische Inhalte außerhalb der Card-Grenze,
- fehlende oder doppelte Controls,
- fehlende/mehrfache Identität,
- ungültige oder mehrere Tier-Klassen,
- sichtbare Control-Touchziele unter ungefähr 44 × 44 Pixel.

Optionale Filter für gezielte visuelle Prüfung:

```text
?type=climate
?type=climate&profile=portrait
?type=climate&profile=landscape&state=heating
```

## Verbindliche Realgerät-Abnahme

Automatisierte Browsermessungen ersetzen nicht Mobile Safari. Auf dem iPad
mini/iOS 9 bleiben mindestens zu prüfen:

- Climate `compact`, `standard`, `wide`, `tall`, `large`,
- Large Climate in Portrait und Landscape,
- lange Climate-Identität und Cooling-Zustand,
- Off, Unknown und Unavailable,
- Minus/Plus/Power-Zentrierung und Touch,
- Light Power in Compact/Wide/Large,
- lange Sensorwerte/Units sowie Binary-Namen,
- Rotation ohne alte Tier-Klasse,
- Focus für alle vier Typen,
- Light/Dark, Background-Lesbarkeit, HomeScreen und Footer.
