const { ethers,run,network} = require("hardhat")

async function main() {
  const SimpleStorageFactory = await ethers.getContractFactory("SimpleStorage")
  console.log('waiting Deploy...')
  const simpleStorage = await SimpleStorageFactory.deploy()
  await simpleStorage.deploymentTransaction()
  console.log('simpleStorage::', await simpleStorage.getAddress());
  if (network.config.chainId === 11155111 && process.env.ETHERSCAN_API_KEY) {
    console.log('waiting...')
    await simpleStorage.deploymentTransaction().wait(6)
    await verify(await simpleStorage.getAddress(), [])
  }

  const currentValue = await simpleStorage.retrieve()
  console.log(`Current Value is: ${currentValue}`)

  // update Current Value
  const transactionResponse = await simpleStorage.store(7)
  await transactionResponse.wait(1)
  const updatedValue = await simpleStorage.retrieve()
  console.log(`Updated Value is: ${updatedValue}`)

}

async function verify(contractAddress, args) {
  console.log('contractAddress:', contractAddress)
  try {
    await run('verify:verify', {
      address: contractAddress,
      constructorArguments: args
    })
  } catch (error) {
    if (error.message.toLowerCase().includes('already verified')) {
      console.log('Already verified')
    } else {
      console.log(error);
    }
  }
}

main().then(() => process.exit(0)).catch((error) => {
  process.exit(1)
})