import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
//import 'bootstrap/dist/css/bootstrap.min.css'; // Import Bootstrap CSS


import artifacts from './contracts/RisitasSale.json';

function App() {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [network, setNetwork] = useState('');
  const [contract, setContract] = useState(null);
  const [etherRaised, setEtherRaised] = useState(0);
  const [tokenRate, setTokenRate] = useState(0);
  const [etherAmount, setEtherAmount] = useState('0.000000000001'); // Default value, you can set this to any initial value

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
        const contractAddress = "0xF357573561E19E5c525F92eEdc0D83fd0f97A81D";
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
        setSigner(await provider.getSigner());
      }
    };

    getNetwork();
    getContract();
    getSigner();
  }, [provider]);

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
  }, [contract]);

  const handleEtherAmountChange = (e) => {
    setEtherAmount(e.target.value);
  };

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
        // Prompt the user to confirm the transaction
        await contract.connect(signer).buyTokens({ from: signer, value: ethers.parseEther(etherAmount) });

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
    <div className='full-page'>
      <div className='container'>
        <h1>Welcome on Risitas</h1> 
        <div className='token-box'>
          <div className='token'>
            <img src={require('./risitas.png')} alt='risitas'></img>
          </div>
          <p> 1 $RIZ ≃ 0.02 $ETH</p>
        </div>
        <p className="lead">Connected Network: {network}</p>
        <p>Ether Raised: {etherRaised} ETH</p>
        <p>Token Rate: {tokenRate}</p>
        <div className="input-box">
          <label htmlFor="etherAmount" className="form-label">
            Ether Amount for Tokens:
          </label>
          <input
            type="text"
            className="etherInput"
            id="etherAmount"
            value={etherAmount}
            onChange={handleEtherAmountChange}
          />
        </div>
        <div className='btn-box'>
          <button className="btn status" onClick={isSaleOpen}>
            Check Sale Status
          </button>
          <button className="btn buy" onClick={buyTokens}>
            Buy Tokens
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;

/*
<div className="container mt-5">
      <h1>Welcome on Risitas</h1>
      <h1 className="mb-4">Risitas Sale</h1>
      <p className="lead">Connected Network: {network}</p>
      <p>Ether Raised: {etherRaised} ETH</p>
      <p>Token Rate: {tokenRate}</p>

      <div className="mb-3">
        <label htmlFor="etherAmount" className="form-label">
          Ether Amount for Tokens:
        </label>
        <input
          type="text"
          className="form-control"
          id="etherAmount"
          value={etherAmount}
          onChange={handleEtherAmountChange}
        />
      </div>

      <button className="btn btn-primary" onClick={isSaleOpen}>
        Check Sale Status
      </button>
      <button className="btn btn-success" onClick={buyTokens}>
        Buy Tokens
      </button>
    </div>
    */