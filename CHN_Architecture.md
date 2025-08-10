# CHN Stack Architecture Diagram

## Complete CHN Modernization Architecture

```mermaid
graph TB
    subgraph "Honeypot Layer"
        HP1[Cowrie SSH/Telnet<br/>Raspberry Pi]
        HP2[Dionaea Multi-Protocol<br/>Cloud VM]
        HP3[Conpot Industrial<br/>Local VM]
        HP4[Additional Honeypots<br/>Various Platforms]
    end

    subgraph "Core CHN Stack"
        subgraph "Message Broker"
            HPFEEDS[hpfeeds3:2.2.0<br/>Message Broker<br/>Port 10000]
        end
        
        subgraph "Data Processing"
            MNEMOSYNE[mnemosyne:2.2.0<br/>Data Normalization<br/>Event Processing]
        end
        
        subgraph "Web Interface"
            CHNSERVER[chn-server:2.2.1<br/>Flask Web App<br/>REST API<br/>Port 80/443]
        end
        
        subgraph "Storage Layer"
            MONGODB[(MongoDB 8.0<br/>Attack Data<br/>Sensor Config)]
            REDIS[(Redis 7.4<br/>Sessions<br/>Cache)]
        end
        
        subgraph "Optional Services"
            LOGGER[hpfeeds-logger:2.2.0<br/>Log Export<br/>SIEM Integration]
            CIF[hpfeeds-cif:2.2.0<br/>Threat Intelligence<br/>CIF Integration]
        end
    end

    subgraph "Visualization Layer"
        subgraph "WebGL Dashboard"
            BOARDROOM[seckc-encom-boardroom<br/>TRON Legacy WebGL<br/>3D Globe Visualization]
            DASHAPI[seckc-mhn-dashboard-api<br/>Dashboard API<br/>Data Middleware]
        end
    end

    subgraph "External Integrations"
        SIEM[SIEM Platforms<br/>ArcSight, Splunk]
        CIFSERVER[CIF Server<br/>Threat Intel Feeds]
        SOCIAL[Social Media<br/>Visual Content]
    end

    subgraph "Deployment Infrastructure"
        QUICKSTART[chn-quickstart<br/>Guided Setup<br/>Docker Compose]
        DOCKER[Docker Engine<br/>Container Runtime]
        REGISTRY[DockerHub Registry<br/>ax0n/* Images]
    end

    %% Data Flow - Attack Events
    HP1 -->|HPFeeds Protocol| HPFEEDS
    HP2 -->|HPFeeds Protocol| HPFEEDS
    HP3 -->|HPFeeds Protocol| HPFEEDS
    HP4 -->|HPFeeds Protocol| HPFEEDS
    
    HPFEEDS -->|Raw Events| MNEMOSYNE
    HPFEEDS -->|Raw Events| LOGGER
    HPFEEDS -->|Raw Events| CIF
    
    MNEMOSYNE -->|Normalized Data| MONGODB
    CHNSERVER -->|Web Sessions| REDIS
    CHNSERVER -->|Attack Data Query| MONGODB
    
    %% Visualization Data Flow
    CHNSERVER -->|REST API| DASHAPI
    DASHAPI -->|JSON Data| BOARDROOM
    BOARDROOM -->|Visual Content| SOCIAL
    
    %% External Integrations
    LOGGER -->|Formatted Logs| SIEM
    CIF -->|Threat Intel| CIFSERVER
    
    %% Deployment Flow
    QUICKSTART -->|Orchestrates| DOCKER
    DOCKER -->|Pulls Images| REGISTRY
    DOCKER -->|Deploys| CHNSERVER
    DOCKER -->|Deploys| HPFEEDS
    DOCKER -->|Deploys| MNEMOSYNE
    
    %% Sensor Management
    CHNSERVER -->|Deploy Scripts| HP1
    CHNSERVER -->|Deploy Scripts| HP2
    CHNSERVER -->|Deploy Scripts| HP3
    CHNSERVER -->|Deploy Scripts| HP4

    %% Styling
    classDef honeypot fill:#ff6b6b,stroke:#c92a2a,stroke-width:2px,color:#fff
    classDef core fill:#4ecdc4,stroke:#26a69a,stroke-width:2px,color:#fff
    classDef storage fill:#45b7d1,stroke:#1976d2,stroke-width:2px,color:#fff
    classDef visual fill:#9c88ff,stroke:#673ab7,stroke-width:2px,color:#fff
    classDef optional fill:#feca57,stroke:#ff6b00,stroke-width:2px,color:#333
    classDef external fill:#a4b0be,stroke:#57606f,stroke-width:2px,color:#fff
    classDef deploy fill:#2ed573,stroke:#00a854,stroke-width:2px,color:#fff

    class HP1,HP2,HP3,HP4 honeypot
    class HPFEEDS,MNEMOSYNE,CHNSERVER core
    class MONGODB,REDIS storage
    class BOARDROOM,DASHAPI visual
    class LOGGER,CIF optional
    class SIEM,CIFSERVER,SOCIAL external
    class QUICKSTART,DOCKER,REGISTRY deploy
```

## Component Details

### **Honeypot Layer**
- **Multi-Platform Deployment**: Raspberry Pi, Cloud VMs, Local Infrastructure
- **Protocol Diversity**: SSH/Telnet (Cowrie), Multi-Protocol (Dionaea), Industrial (Conpot)
- **Real-Time Data**: Live attack capture and HPFeeds transmission

### **Core CHN Stack**
- **hpfeeds3**: Modern Python 3 message broker with asyncio support
- **mnemosyne**: Data normalization and MongoDB integration
- **chn-server**: Flask web interface with REST API and sensor management
- **Storage**: MongoDB 8.0 for persistence, Redis 7.4 for caching

### **Visualization Layer**
- **seckc-encom-boardroom**: TRON Legacy-inspired WebGL 3D visualization
- **seckc-mhn-dashboard-api**: Middleware API for dashboard data integration
- **Real-Time Rendering**: Live attack visualization on 3D globe

### **Optional Services**
- **hpfeeds-logger**: Multi-format log export (ArcSight, Splunk, JSON)
- **hpfeeds-cif**: Collective Intelligence Framework integration

### **Deployment Infrastructure**
- **chn-quickstart**: Guided Docker Compose setup with interactive configuration
- **Container Registry**: Production images available on DockerHub (ax0n/*)
- **One-Command Deployment**: Complete stack deployment via docker-compose

## Key Architectural Benefits

🚀 **Modern Stack**: Ubuntu 24.04, Python 3.12, MongoDB 8.0  
⚡ **High Performance**: 330MB memory footprint, <2ms response times  
🔄 **Real-Time Pipeline**: Attack → HPFeeds → Normalization → Visualization (seconds)  
🎨 **Visual Impact**: Movie-quality 3D visualization for threat intelligence  
📦 **Easy Deployment**: One-command setup with guided configuration  
🌐 **Multi-Platform**: Cloud, on-premises, and edge deployment support  

## Data Flow Summary

1. **Attack Capture**: Honeypots detect and log malicious activity
2. **Message Transmission**: HPFeeds protocol sends events to broker
3. **Data Normalization**: Mnemosyne processes and standardizes event data
4. **Storage & API**: MongoDB persistence with REST API access
5. **Visualization**: WebGL dashboard renders real-time 3D attack visualization
6. **Integration**: Optional SIEM and threat intelligence platform integration