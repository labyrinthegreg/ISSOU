import hre, { ethers } from "hardhat";
import dotenv from 'dotenv'
import { Ownable, RIZToken, RisitasSale } from "../typechain-types";

dotenv.config()

async function main() {
  console.log('Deploying contracts with the account: ' + process.env.PUBLIC_KEY);
  
  console.log('Deploying Token');
  // Deploy Token
  const RIZToken = await ethers.getContractFactory("RIZToken");
  const rizToken = await RIZToken.deploy();

  console.log("Deploying Vesting");
  // Deploy Vesting
  const RisitasVesting = await ethers.getContractFactory("RisitasVesting");
  const risitasVesting = await RisitasVesting.deploy(rizToken);
  
  console.log('Deploying Sale');
  // Deploy Sale
  const RisitasSale = await ethers.getContractFactory("RisitasSale");
  const risitasSale = await RisitasSale.deploy(rizToken, await risitasVesting.getAddress(), risitasVesting);

  await rizToken.waitForDeployment();
  await risitasVesting.waitForDeployment();
  await risitasSale.waitForDeployment();

  console.log("PolygonScan verification in progress...");
  await verify(rizToken, [])
  await verify(risitasVesting, [await rizToken.getAddress()])
  await verify(risitasSale, [await rizToken.getAddress(), await risitasVesting.getAddress(), await risitasVesting.getAddress()])
  console.log("PolygonScan verification done. ✅");
  
  console.log("RIZToken: " + await rizToken.getAddress());
  console.log( "RisitasVesting: " + await risitasVesting.getAddress() );
  console.log( "RisitasSale: " + await risitasSale.getAddress() );

}

const verify = async (contract: Ownable, args: Array<any> ) => {
  console.log("Verifying contract...");
  await contract.deploymentTransaction()!.wait(6)
  try {
    await hre.run("verify:verify", {
      address: await contract.getAddress(),
      network: "mumbai",
      constructorArguments: args
    });
  } catch (e: any) {
    if (e.message.toLowerCase().includes("already verified")) {
      console.log("Already verified!");
    } else {
      console.log(e);
    }
  }
};
// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
