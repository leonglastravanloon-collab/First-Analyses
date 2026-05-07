# AEX Market Intelligence Terminal - Local Deployment

Deze applicatie is ontworpen om live AEX koersen te visualiseren en is voorbereid op integratie met Interactive Brokers (IBKR) via de Trader Workstation (TWS) of IB Gateway.

## Snelle Start (Lokaal)

1. **Installatie**:
   Zorg dat je Node.js hebt geïnstalleerd. Pak het export-pakket uit en draai:
   ```bash
   npm install
   ```

2. **Server starten**:
   Draai de ontwikkelserver:
   ```bash
   npm run dev
   ```
   De applicatie is nu bereikbaar op `http://localhost:3000`.

## Verbinding maken met IBKR TWS

Omdat browsers directe verbindingen naar TWS (poort 7496/7497) blokkeren vanwege veiligheidsredenen (CORS), heb je een kleine "proxy" of bridge nodig.

### Optie A: Gebruik een bestaande Bridge
Er zijn diverse open-source bridges beschikbaar zoals `ibkr-client` of custom Python/Node wrappers die een REST API ontsluiten op poort 8080.

### Optie B: Lokale Proxy (Aanbevolen voor testen)
Als je TWS lokaal hebt draaien, vul je in de applicatie onder **Agent Protocol & Config** de URL in van je lokale API bridge.

## Project Structuur
- `src/services/stockService.ts`: Bevat de logica voor data-extractie. Hier kun je de mapping van de IBKR-velden aanpassen aan jouw specifieke gateway.
- `src/App.tsx`: De visuele terminal, gebouwd met React en Tailwind CSS.
- `src/types.ts`: Definities voor schaalbare uitbreidingen (Agents, Triggers).

## Toekomstige uitbreidingen
De architectuur is "Agent-Ready". In de `types.ts` vind je al de structuren voor `AgentTrigger`. Je kunt nieuwe agents toevoegen door de `simulateUpdate` of `fetchFromIBKR` functies uit te breiden met trigger-checks.
