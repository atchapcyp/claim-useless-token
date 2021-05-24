import React, { useState, useEffect } from 'react';
import logo from './logo.svg';
import './App.css';

import Web3 from 'web3';
import { Contract } from 'web3-eth-contract';
import ERC20Abi from './config/abi/ERC20.json';
import DistributorAbi from './config/abi/Distributor.json';
import { TOKEN_ADDRESS, DISTRIBUTOR_ADDRESS } from './config/constants/contract-address';
import { Header } from './components/Header';
import { ClaimSection } from './components/ClaimSection';
import { useWeb3React } from '@web3-react/core';
import { InjectedConnector } from '@web3-react/injected-connector';

function App() {
  const [tokenContract, setTokenContract] = useState<Contract | null>(null);
  const [distributorContract, setDistributorContract] = useState<Contract | null>(null);
  const [currWeb3, setWeb3] = useState<Web3>();
  const [currAddress, setCurrAccount] = useState('');

  const connectToWeb3 = () => {
    const web3 = new Web3(Web3.givenProvider);
    const tokenContract = new web3.eth.Contract(ERC20Abi as any, TOKEN_ADDRESS);
    setTokenContract(tokenContract);
    const distributorContract = new web3.eth.Contract(DistributorAbi as any, DISTRIBUTOR_ADDRESS);
    setDistributorContract(distributorContract);
    setWeb3(web3);
  };

  useEffect(() => {
    connectToWeb3();
  }, []);

  useEffect(() => {
    if (!!currWeb3) {
      const fetchAccount = async () => {
        const accounts = await currWeb3.eth.getAccounts();
        console.table({ accounts });
        setCurrAccount(accounts[0]);
      };
      fetchAccount();
    }
  }, [currAddress, tokenContract, distributorContract]);

  return (
    <div className='App'>
      <Header address={currAddress}></Header>
      <ClaimSection></ClaimSection>
    </div>
  );
}

export default App;
