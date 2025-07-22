import { useState } from 'react'
import { ethers } from 'ethers'
import './App.css'
import abi from "./abi.json";

const contractAddress = '0x53b8e7416f070ed2e6a412464a042415ec5c178e';

function App() {
  const [number, setNumber] = useState(0)
  const [newNumber, setNewNumber] = useState(0)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState('')

  const clearMessages = () => {
    setError('')
    setSuccess('')
  }

  const requestAccount = async () => {
    try {
      if (window.ethereum) {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        setSuccess('Wallet connected successfully!')
        setTimeout(() => setSuccess(''), 3000)
      } else {
        setError('Please install MetaMask to use this app!')
      }
    } catch {
      setError('Failed to connect wallet. Please try again.')
    }
  }

  const storeNumber = async (data) => {
    if (!data || data === '0') {
      setError('Please enter a valid number')
      return
    }

    clearMessages()
    setIsLoading(true)

    try {
      if (typeof window.ethereum !== 'undefined') {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const contract = new ethers.Contract(contractAddress, abi, signer);
        
        const tx = await contract.store(data);
        setSuccess('Transaction submitted! Waiting for confirmation...')
        await tx.wait();
        setSuccess('Number stored successfully!')
        setNewNumber(0)
        setTimeout(() => setSuccess(''), 3000)
      } else {
        setError('MetaMask not detected. Please install MetaMask.')
        await requestAccount();
      }
    } catch (error) {
      console.error('Error storing number:', error);
      if (error.code === 4001) {
        setError('Transaction rejected by user')
      } else if (error.code === -32603) {
        setError('Network error. Please check your connection.')
      } else if (error.message.includes('insufficient funds')) {
        setError('Insufficient funds for transaction')
      } else {
        setError('Failed to store number. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const getNumber = async () => {
    clearMessages()
    setIsLoading(true)

    try {
      if (typeof window.ethereum !== "undefined") {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const contract = new ethers.Contract(contractAddress, abi, provider);
        
        const data = await contract.retrieve();
        setNumber(data.toString());
        setSuccess('Number retrieved successfully!')
        setTimeout(() => setSuccess(''), 2000)
      } else {
        setError('MetaMask not detected. Please install MetaMask.')
        await requestAccount();
      }
    } catch (error) {
      console.error('Error retrieving number:', error);
      if (error.code === -32603) {
        setError('Network error. Please check your connection.')
      } else if (error.message.includes('call revert exception')) {
        setError('Contract call failed. Please check the contract address.')
      } else {
        setError('Failed to retrieve number. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main>
      <nav className='navbar'>
        <h3>Web3</h3>
        <button onClick={requestAccount} disabled={isLoading}>
          {isLoading ? 'Connecting...' : 'Connect Wallet'}
        </button>
      </nav>

      <section className='container'>
        {error && (
          <div className='message error'>
            <span>{error}</span>
            <button className='close-btn' onClick={() => setError('')}>×</button>
          </div>
        )}
        
        {success && (
          <div className='message success'>
            <span>{success}</span>
            <button className='close-btn' onClick={() => setSuccess('')}>×</button>
          </div>
        )}

        <div className='input-section'>
          <input 
            type="number" 
            value={newNumber} 
            onChange={(e) => setNewNumber(e.target.value)} 
            placeholder='Enter a number'
            disabled={isLoading}
          />
          <button 
            onClick={() => storeNumber(newNumber)} 
            disabled={isLoading || !newNumber}
            className={isLoading ? 'loading' : ''}
          >
            {isLoading ? 'Sending...' : 'Send'}
          </button>
        </div>

        <div className='result'>
          <button 
            onClick={getNumber} 
            disabled={isLoading}
            className={isLoading ? 'loading' : ''}
          >
            {isLoading ? 'Getting...' : 'Get'}
          </button>
          <h3>Current Number: {number}</h3>
        </div>
      </section>
    </main>
  )
}

export default App