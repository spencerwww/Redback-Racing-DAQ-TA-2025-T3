# Redback Racing DAQ – Codebase Diagram

High-level structure and data flow of the technical assessment repo.

---

## 1. Project overview (three themes)

```mermaid
flowchart TB
  subgraph repo["Redback-Racing-DAQ-TA-2025-T3"]
    FW["Firmware"]
    SPY["Spyder"]
    CL["Cloud"]
  end

  FW --> FW_DESC["C++ / CMake · CAN/DBC parsing · Docker"]
  SPY --> SPY_DESC["Telemetry: Emulator → Streaming → UI"]
  CL --> CL_DESC["AWS · Weather station · IaC/Terraform"]
```

---

## 2. Spyder telemetry system (data flow)

```mermaid
flowchart LR
  subgraph docker["Docker Compose (spyder/)"]
    subgraph DE["data-emulator"]
      DE_TS["battery_emulator.ts"]
      DE_GEN["Generates battery temp\n(number or binary)"]
      DE_TS --> DE_GEN
    end

    subgraph SS["streaming-service"]
      SS_TCP["TCP server :12000"]
      SS_WS["WebSocket server :8080"]
      SS_DEC["decodeBatteryTemperature()"]
      SS_TCP --> SS_DEC --> SS_WS
    end

    subgraph UI["ui (Next.js)"]
      UI_PAGE["page.tsx"]
      UI_WS["WebSocket client\nws://localhost:8080"]
      UI_NUM["Numeric (temp display)"]
      UI_CHART["ChartLineLinear"]
      UI_PAGE --> UI_WS
      UI_PAGE --> UI_NUM
      UI_PAGE --> UI_CHART
    end
  end

  DE_GEN -->|"JSON over TCP"| SS_TCP
  SS_WS -->|"JSON (battery_temperature, timestamp)"| UI_WS
  UI_WS --> UI_PAGE
```

---

## 3. Spyder – UI component tree

```mermaid
flowchart TB
  subgraph app["Next.js App"]
    LAYOUT["layout.tsx\n(Roboto, ThemeProvider)"]
    PAGE["page.tsx\n(WebSocket, state, header, main)"]
    LAYOUT --> PAGE
  end

  subgraph page_children["page.tsx children"]
    HEADER["Header\n(Logo, title, Connection Badge)"]
    CARD["Card\n(Live Battery Temperature)"]
    NUMERIC["Numeric\n(temp, 3 decimals, green/yellow/red)"]
    CHART["ChartLineLinear\n(Recharts line chart)"]
  end

  PAGE --> HEADER
  PAGE --> CARD
  PAGE --> CHART
  CARD --> NUMERIC

  subgraph ui_components["Shared UI (shadcn)"]
    CARD_UI["card.tsx"]
    BADGE_UI["badge.tsx"]
    CHART_UI["chart.tsx"]
  end

  CARD -.-> CARD_UI
  HEADER -.-> BADGE_UI
  CHART -.-> CHART_UI
```

---

## 4. Firmware layout

```mermaid
flowchart TB
  subgraph firmware["firmware/"]
    CM["CMakeLists.txt"]
    DOCKER["Dockerfile"]
    DBC["dbc-files/"]
    SOL["solution/"]
  end

  DBC --> C0["ControlBus.dbc"]
  DBC --> S0["SensorBus.dbc"]
  DBC --> T0["TractiveBus.dbc"]

  SOL --> MAIN["main.cpp (entry)"]
  SOL --> CMAKE_SOL["solution/CMakeLists.txt"]

  subgraph purpose["Purpose"]
    PARSE["Parse dump.log"]
    DBCPP["Use dbcppp for DBC"]
    OUT["output.txt (timestamp:sensor:value)"]
  end

  MAIN --> PARSE
  PARSE --> DBCPP
  DBCPP --> OUT
```

---

## 5. File / folder map

| Area        | Path | Main pieces |
|------------|------|-------------|
| **Root**   | `/` | `README.md`, `brainstorming.md` |
| **Spyder** | `spyder/` | `docker-compose.yml`, `docs/README.md` |
| **Data emulator** | `spyder/data-emulator/` | `src/battery_emulator.ts` (TCP client → streaming-service:12000) |
| **Streaming** | `spyder/streaming-service/` | `src/server.ts` (TCP :12000, WebSocket :8080) |
| **UI**     | `spyder/ui/` | Next.js, `src/app/page.tsx`, `layout.tsx`, `components/custom/` (numeric, chart-line-linear, theme-provider), `components/ui/` (card, badge, chart) |
| **Firmware** | `firmware/` | `solution/main.cpp`, `CMakeLists.txt`, `dbc-files/*.dbc`, `Dockerfile` |
| **Cloud**  | `cloud/` | `docs/README.md`, `cloud_diagram.drawio` |

---

*To view Mermaid diagrams: use a Markdown preview with Mermaid support (e.g. VS Code extension, GitHub), or paste the code blocks into [mermaid.live](https://mermaid.live).*
