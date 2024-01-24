import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import 'bootstrap/dist/css/bootstrap.min.css'; // Import Bootstrap CSS

import artifacts from './contracts/RisitasSale.json';

function App() {
  const [ provider, setProvider ] = useState(null);
  const [ signer , setSigner ] = useState(null)
  const [network, setNetwork] = useState('');
  const [contract, setContract] = useState(null);
  const [etherRaised, setEtherRaised] = useState(0);
  const [tokenRate, setTokenRate] = useState(0);

  useEffect(() => {
    const initializeProvider = async () => {
      if (window.ethereum == null) {
        // If MetaMask is not installed, use the default provider
        console.log("MetaMask not installed; using read-only defaults");
        setProvider(ethers.getDefaultProvider());
      } else {
        // Connect to the MetaMask EIP-1193 object
        setProvider(new ethers.BrowserProvider(window.ethereum));
      }
    };

    initializeProvider();
  }, []);

  useEffect(() => {
    const getNetwork = async () => {
      if (provider) {
        const network = await provider.getNetwork();
        setNetwork(network.name);
      }
    };

    const getContract = async () => {
      if (provider) {
        const contractAddress = "0x3D49409d34D215414E92f580e0244fCd8E406524";
        const contractInstance = new ethers.Contract(
          contractAddress,
          artifacts.abi,
          provider
        );
        setContract(contractInstance);
      }
    };

    const getSigner = async () => {
      if (provider) {
        setSigner(await provider.getSigner())
      }
    }
    

    getNetwork();
    getContract();
    getSigner();
  }, [ provider ]);

  useEffect(() => {
    const getDefaultData = async () => {
      if (contract) {
        // Fetch contract details
        const etherRaised = await contract.etherRaised();
        const tokenRate = await contract.rate();

        setEtherRaised(ethers.formatEther(etherRaised));
        setTokenRate(tokenRate.toString());
      }
    };

    getDefaultData();
  }, [contract])

  const isSaleOpen = async () => {
    try {
      if (contract) {
        const result = await contract.getIsSaleClosed();
        console.log(result);
      }
    } catch (error) {
      console.error('Error interacting with contract', error);
    }
  };

  const buyTokens = async () => {
    try {
      if (contract) {
        
        console.log(signer);

        // Prompt the user to confirm the transaction
        await contract.buyTokens({ from: signer, value: ethers.parseEther('1') });

        // Update contract details after the transaction
        const etherRaised = await contract.etherRaised();
        const tokenRate = await contract.rate();

        setEtherRaised(ethers.formatEther(etherRaised));
        setTokenRate(tokenRate.toString());
      }
    } catch (error) {
      console.error('Error buying tokens', error);
    }
  };

  return (
    <div className="container mt-5">
      <h1 className="mb-4">Risitas Sale</h1>
      <p className="lead">Connected Network: {network}</p>
      <p>Ether Raised: {etherRaised} ETH</p>
      <p>Token Rate: {tokenRate}</p>
      <button className="btn btn-primary" onClick={isSaleOpen}>
        Check Sale Status
      </button>
    <button className="btn btn-success" onClick={buyTokens}>
        Buy Tokens
      </button>
    </div>
  );
}

export default App;
