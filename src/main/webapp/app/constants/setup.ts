// filename: setup.ts

// imports:
// Core interfaces
// import { createAgent, IDataStore, IDataStoreORM, IDIDManager, IKeyManager, IResolver } from '@veramo/core'

// // Core identity manager plugin. This allows you to create and manage DIDs by orchestrating different DID provider packages.
// // This implements `IDIDManager`
// import { DIDManager } from '@veramo/did-manager'

// // Core key manager plugin. DIDs use keys and this key manager is required to know how to work with them.
// // This implements `IKeyManager`
// import { KeyManager } from '@veramo/key-manager'

// // This plugin allows us to create and manage `did:ethr` DIDs. (used by DIDManager)
// import { EthrDIDProvider } from '@veramo/did-provider-ethr'

// // A key management system that uses a local database to store keys (used by KeyManager)
// import { KeyManagementSystem, SecretBox } from '@veramo/kms-local'

// // Storage plugin using TypeORM to link to a database
// import { Entities, KeyStore, DIDStore, migrations, PrivateKeyStore } from '@veramo/data-store'

// // TypeORM is installed with '@veramo/data-store'
// import { DataSource } from 'typeorm'

// This will be the name for the local sqlite database for demo purposes
const DATABASE_FILE = 'database.sqlite';

// filename: setup.ts

// ... imports

// CONSTANTS
// You will need to get a project ID from infura https://www.infura.io
export const INFURA_PROJECT_ID = 'd4216390ca844c79a34a93749f735762';

// This is a raw X25519 private key, provided as an example.
// You can run `npx @veramo/cli config create-secret-key` in a terminal to generate a new key.
// In a production app, this MUST NOT be hardcoded in your source code.
export const DB_ENCRYPTION_KEY = '29739248cad1bd1a0fc4d9b75cd4d2990de535baf5caadfdf8d8f86664aa830c';

// filename: setup.ts

// ... imports & CONSTANTS

// DB setup:
// const dbConnection = new DataSource({
//   type: 'sqlite',
//   database: DATABASE_FILE,
//   synchronize: false,
//   migrations,
//   migrationsRun: true,
//   logging: ['error', 'info', 'warn'],
//   entities: Entities,
// }).initialize()
