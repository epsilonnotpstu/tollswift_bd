# TollBD ER Diagram — Mermaid Code

Mermaid live editor-এ paste করো: https://mermaid.live

```mermaid
erDiagram
    USER {
        string id PK
        string email UK
        string phone UK
        string passwordHash
        string fullName
        string photoUrl
        string nidNumber
        string role "USER | ADMIN"
        string status "ACTIVE | BLOCKED | UNVERIFIED"
        string division
        string district
        string emergencyContact
        string googleId UK
        boolean emailVerified
        datetime createdAt
        datetime updatedAt
    }

    OTP {
        string id PK
        string userId FK
        string code
        string type "email | phone"
        int attempts
        datetime expiresAt
        boolean used
        datetime createdAt
    }

    WALLET {
        string id PK
        string userId FK UK
        int balance "in paisa"
        datetime updatedAt
    }

    WALLET_TRANSACTION {
        string id PK
        string walletId FK
        string type "CREDIT | DEBIT"
        int amount "in paisa"
        string description
        string reference
        datetime createdAt
    }

    VEHICLE {
        string id PK
        string ownerId FK
        string registrationNumber UK
        string vehicleType "MOTORBIKE|CAR|MICROBUS|BUS|TRUCK|HEAVY_TRUCK"
        string vehicleCategory "A|B|C|D|E|F"
        string ownerName
        string fuelType "PETROL|DIESEL|CNG|ELECTRIC|HYBRID"
        string brtaCertNumber
        string frontPhotoUrl
        string backPhotoUrl
        string status "PENDING | VERIFIED | REJECTED"
        string rejectionReason
        datetime verifiedAt
        string verifiedById
        boolean brtaVerified
        datetime createdAt
        datetime updatedAt
    }

    BRIDGE {
        string id PK
        string name
        string nameBn
        string location
        string district
        float latitude
        float longitude
        string category "EXPRESSWAY|NATIONAL|LOCAL"
        string status "ACTIVE|MAINTENANCE|CLOSED"
        string imageUrl
        string authorityName
        boolean hasFastpass
        datetime createdAt
        datetime updatedAt
    }

    TOLL_RATE {
        string id PK
        string bridgeId FK UK
        int rateA "Motorbike (paisa)"
        int rateB "Car (paisa)"
        int rateC "Microbus (paisa)"
        int rateD "Bus (paisa)"
        int rateE "Small Truck (paisa)"
        int rateF "Heavy Truck (paisa)"
        datetime effectiveFrom
        string updatedById
        datetime updatedAt
    }

    TRANSACTION {
        string id PK
        string userId FK
        string vehicleId FK
        string vehiclePlate
        string bridgeId FK
        string bridgeName
        int amount "in paisa"
        string paymentMethod "WALLET|SSLCOMMERZ|BKASH|NAGAD|CARD"
        string type "TOLL_PAYMENT|WALLET_DEPOSIT|REFUND"
        string status "PENDING|SUCCESS|FAILED|REFUNDED"
        string sslTransactionId
        string sslSessionKey
        string refundReason
        datetime refundedAt
        string receiptUrl
        json metadata
        datetime createdAt
        datetime updatedAt
    }

    QR_TOKEN {
        string id PK
        string userId FK
        string vehicleId FK
        string vehiclePlate
        string tokenData
        datetime expiresAt
        boolean used
        datetime usedAt
        string usedAtBridgeId
        datetime createdAt
    }

    ANNOUNCEMENT {
        string id PK
        string title
        string titleBn
        string body
        string bodyBn
        string type "INFO|WARNING|MAINTENANCE"
        string[] targetBridgeIds
        boolean isActive
        datetime expiresAt
        string createdById
        datetime createdAt
        datetime updatedAt
    }

    PUSH_SUBSCRIPTION {
        string id PK
        string userId FK
        string endpoint UK
        string p256dh
        string auth
        string userAgent
        string platform "web|android|ios"
        datetime createdAt
    }

    USER ||--o{ OTP : "has"
    USER ||--o| WALLET : "owns"
    USER ||--o{ VEHICLE : "registers"
    USER ||--o{ TRANSACTION : "makes"
    USER ||--o{ QR_TOKEN : "generates"
    USER ||--o{ PUSH_SUBSCRIPTION : "subscribes"

    WALLET ||--o{ WALLET_TRANSACTION : "records"

    VEHICLE ||--o{ TRANSACTION : "used in"
    VEHICLE ||--o{ QR_TOKEN : "linked to"

    BRIDGE ||--o| TOLL_RATE : "has"
    BRIDGE ||--o{ TRANSACTION : "collects"
```
