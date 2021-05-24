import React, { useEffect, useState } from 'react';
import ERC20Abi from '../config/abi/ERC20.json';
import { TOKEN_ADDRESS, DISTRIBUTOR_ADDRESS } from '../config/constants/contract-address';
import Web3 from 'web3';
import { Contract } from 'web3-eth-contract';
import DistributorAbi from '../config/abi/Distributor.json';
import BigNumber from 'bignumber.js';

export function ClaimSection() {
  const [tokenContract, setTokenContract] = useState<Contract | null>(null);
  const [distributorContract, setDistributorContract] = useState<Contract | null>(null);
  const [currWeb3, setWeb3] = useState<Web3>();
  const [currAddress, setCurrAccount] = useState('');
  const [tokenSymbol, setTokenSymbol] = useState('-');
  const [tokenName, setTokenName] = useState('-');
  const [tokenBalance, setTokenBalance] = useState('');
  const [tokenSupply, setTokenSupply] = useState(0);
  const [isAccept, setAccept] = useState(false);
  const [supplyerAddress, setSupplyer] = useState('');

  const getBalanceNumber = (balance: string, decimals = 18) => {
    const displayBalance = new BigNumber(balance).dividedBy(new BigNumber(10).pow(decimals));
    return displayBalance.toNumber();
  };

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
    if (!!tokenContract && !!distributorContract && !!currWeb3) {
      const fetchAccount = async () => {
        const accounts = await currWeb3.eth.getAccounts();
        setCurrAccount(accounts[0]);
      };
      fetchAccount();

      if (currAddress !== '') {
        const fetchBalance = async () => {
          const balance = await tokenContract.methods.balanceOf(currAddress).call();
          setTokenBalance(balance);
        };
        fetchBalance();

        const fetchTokenDetail = async () => {
          console.log(tokenContract.methods);
          const symbol = await tokenContract.methods.symbol().call();
          setTokenSymbol(symbol);
          const name = await tokenContract.methods.name().call();
          setTokenName(name);
          const totalSupply = await tokenContract.methods.totalSupply().call();
          setTokenSupply(totalSupply);
        };
        fetchTokenDetail();
      }

      const fetchSupplyer = async () => {
        const supplyer = await distributorContract.methods.getSupplyerAddress().call();
        setSupplyer(supplyer);
      };
      fetchSupplyer();
    }
  }, [currAddress, tokenContract, distributorContract]);

  //   this.state.contract.methods.game(bet, randomSeed).send({from: this.state.account, value: amount}).on('transactionHash', (hash) => {
  //     this.setState({ loading: true })
  //     this.state.contract.events.Result({}, async (error, event) => {
  //       const verdict = event.returnValues.winAmount
  //       if(verdict === '0') {
  //         window.alert('lose :(')
  //       } else {
  //         window.alert('WIN!')
  //       }

  //       //Prevent error when user logout, while waiting for the verdict
  //       if(this.state.account!==null && typeof this.state.account!=='undefined'){
  //         const balance = await this.state.web3.eth.getBalance(this.state.account)
  //         const maxBet = await this.state.web3.eth.getBalance(this.state.contractAddress)
  //         this.setState({ balance: balance, maxBet: maxBet })
  //       }
  //       this.setState({ loading: false })
  //     })
  //   }).on('error', (error) => {
  //     window.alert('Error')
  //   })

  //   const claim = () => {
  //     distributorContract.methods.claim().send();
  //   };

  const approve = () => {
    if (!tokenContract) {
      return;
    }
    const call = async () => {
      const approveResult = await tokenContract.methods.approve(DISTRIBUTOR_ADDRESS, 50000000000000).send({ from: currAddress });
      console.log(approveResult);
    };
    call();
  };

  const claim = () => {
    if (!distributorContract || !tokenContract) {
      window.alert('please wait and refresh');
      return;
    }

    const call = async () => {
      const claimResult = await distributorContract.methods.claim(500000000000000).send({ from: currAddress });
      console.table(claimResult);
      const balance = await tokenContract.methods.balanceOf(currAddress).call();
      setTokenBalance(balance);
    };
    call();
  };

  const handleCheckboxChange = (event) => {
    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    setAccept(value);
  };

  return (
    <section className='text-gray-600 body-font'>
      <div className='container px-5 py-24 mx-auto'>
        <div className='flex flex-wrap -m-4'>
          <div className='p-4 lg:w-1/5'></div>
          <div className='p-4 lg:w-3/5'>
            <div className='h-full bg-gray-100 bg-opacity-75 px-8 pt-16 pb-24 rounded-lg overflow-hidden text-center relative'>
              <h2 className='tracking-widest text-xs title-font font-medium text-gray-400 mb-1'>
                Claim {tokenName} ({tokenSymbol}) token
              </h2>
              <h1 className='title-font sm:text-2xl text-xl font-medium text-gray-900 mb-3'>
                {tokenSymbol} Total Supply : {getBalanceNumber(String(tokenSupply)).toLocaleString()} {tokenSymbol}
              </h1>
              <p className='leading-relaxed mb-3'>Remaining Claim : 10 {tokenSymbol}</p>
              <h1 className='title-font sm:text-xl text-xl font-medium text-gray-900 mb-3'>
                Your Token Balance : {getBalanceNumber(tokenBalance).toLocaleString()} {tokenSymbol}
              </h1>{' '}
            </div>
          </div>
          <div className='p-4 lg:w-1/5'></div>

          <div className='p-4 lg:w-1/5'></div>
          <div className='p-4 lg:w-3/5'>
            <div className='flex mt-6'>
              <label className='flex items-center'>
                <form>
                  <input type='checkbox' className='form-checkbox' checked={isAccept} onChange={handleCheckboxChange} />
                </form>
                <span className='ml-2'>
                  คุณเข้าใจและยอมรับ ที่จะ Claim เหรียญ {tokenSymbol} <span className='underline'>ซึ่งไม่มีคุณประโยชน์ใด ๆ</span>{' '}
                  และต้องจ่ายค่า Gas ด้วยตนเอง{' '}
                </span>
              </label>
            </div>
          </div>
          <div className='p-4 lg:w-1/5'></div>
        </div>
        {currAddress === supplyerAddress && (
          <button
            disabled={!isAccept}
            className='flex mx-auto mt-16 text-white bg-indigo-500 border-0 py-2 px-8 focus:outline-none hover:bg-indigo-600 rounded text-lg disabled:opacity-50'
            onClick={approve}
          >
            Approve {tokenSymbol}
          </button>
        )}
        <button
          disabled={!isAccept}
          className='flex mx-auto mt-16 text-white bg-indigo-500 border-0 py-2 px-8 focus:outline-none hover:bg-indigo-600 rounded text-lg disabled:opacity-50'
          onClick={claim}
        >
          Claim 10 {tokenSymbol}
        </button>
        <button
          type='button'
          className='flex mx-auto mt-16 text-white bg-indigo-500 border-0 py-2 px-8 focus:outline-none hover:bg-indigo-600 rounded text-lg disabled:opacity-50'
        >
          Processing
          {/* <span className='flex h-3 w-3'>
            <span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75'></span>
            <span className='relative inline-flex rounded-full h-3 w-3 bg-purple-500'></span>
          </span> */}
          {/* <svg
            fill='none'
            stroke='currentColor'
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth='2'
            className='w-4 h-4 ml-1 animate-spin text-purple-600'
            viewBox='0 0 24 24'
          >
            <path d='M5 12h14M12 5l7 7-7 7'></path>
          </svg> */}
        </button>
        <svg
          fill='none'
          stroke='currentColor'
          strokeLinecap='round'
          strokeLinejoin='round'
          strokeWidth='2'
          className='w-4 h-4 ml-1 animate-spin text-purple-600'
          viewBox='0 0 24 24'
        >
          <path d='M5 12h14M12 5l7 7-7 7'></path>
        </svg>
      </div>
    </section>
  );
}
