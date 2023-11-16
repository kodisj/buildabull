// import { StatusBar } from 'expo-status-bar';
// import { StyleSheet } from 'react-native';

// filename: App.tsx

/// shims
// import '@sinonjs/text-encoding'
// import 'react-native-get-random-values'
// import '@ethersproject/shims'

// filename: App.tsx
// shims
import 'cross-fetch/polyfill';
// import { DIDResolutionResult } from '@veramo/core'

// filename: App.tsx

// ... shims

import React, { useEffect, useState } from 'react';
import { Button } from 'reactstrap';

// Import the agent from our earlier setup
// import { agent } from '../veramo/setup'
// import some data types:
// import { IIdentifier } from '@veramo/core'
// import { VerifiableCredential } from '@veramo/core'
// import { IVerifyResult } from '@veramo/core'

const Credentials = () => {
  // const [identifiers, setIdentifiers] = useState<IIdentifier[]>([])
  // const [resolutionResult, setResolutionResult] = useState<DIDResolutionResult | undefined>()
  // const [credential, setCredential] = useState<VerifiableCredential | undefined>()
  // const [verificationResult, setVerificationResult] = useState<IVerifyResult | undefined>()
  // const [addKeyResult, setAddKeyResult] = useState<string>('')

  // Resolve a DID
  const resolveDID = async (did: string) => {
    // const result = await agent.resolveDid({ didUrl: did })
    // console.log(JSON.stringify(result, null, 2))
    // setResolutionResult(result)
  };

  // Add the new identifier to state
  const createIdentifier = async () => {
    // const _id = await agent.didManagerCreate({
    //   provider: 'did:ethr:goerli',
    // })
    // setIdentifiers((s) => s.concat([_id]))
  };

  const createCredential = async () => {
    // if (identifiers[0].did) {
    //   const verifiableCredential = await agent.createVerifiableCredential({
    //     credential: {
    //       issuer: { id: identifiers[0].did },
    //       issuanceDate: new Date().toISOString(),
    //       credentialSubject: {
    //         id: 'did:web:community.veramo.io',
    //         you: 'Rock',
    //       },
    //     },
    //     save: false,
    //     proofFormat: 'jwt',
    //   })
    //   setCredential(verifiableCredential)
    // }
  };

  const verifyCredential = async () => {
    // if (credential) {
    //   const result = await agent.verifyCredential({ credential })
    //   setVerificationResult(result)
    // }
  };

  const addKey = async () => {
    // if (identifiers[0].did) {
    //   try {
    //     setAddKeyResult('Adding new key...')
    //     const key = await agent.keyManagerCreate({
    //       kms: 'local',
    //       type: 'Secp256k1',
    //     })
    //     const result = await agent.didManagerAddKey({
    //       did: identifiers[0].did,
    //       key,
    //     })
    //     const str = JSON.stringify(result, null, 2)
    //     console.log(str)
    //     setAddKeyResult(str)
    //   } catch (e:any) {
    //     console.log(e)
    //     setAddKeyResult(e.message)
    //   }
    // }
  };

  // Check for existing identifers on load and set them to state
  useEffect(() => {
    // const getIdentifiers = async () => {
    //   const _ids = await agent.didManagerFind()
    //   setIdentifiers(_ids)
    //   // Inspect the id object in your debug tool
    //   console.log('_ids:', _ids)
    // }
    // getIdentifiers()
  }, []);

  return (
    // <SafeAreaView>
    // <ScrollView>
    <div>Credentials</div>
    //   </ScrollView>
    // </SafeAreaView>
  );
};

export default Credentials;
