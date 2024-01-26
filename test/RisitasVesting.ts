// RisitasVesting.test.js
import {
    loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("RisitasVesting", function () {
    async function RisitasVestingFixture() {
        const [owner, otherAddr, otherAddr2] = await ethers.getSigners();
        const RIZToken = await ethers.getContractFactory("RIZToken");
        const rizToken = await RIZToken.deploy();
        const risitasVesting = await ethers.getContractFactory("RisitasVesting");
        const risVesting = await risitasVesting.deploy(rizToken);
        const RisitasSale = await ethers.getContractFactory("RisitasSale");
        const risitasSale = await RisitasSale.deploy(rizToken, await risVesting.getAddress(), risVesting);
        await rizToken.transfer(
            await risitasSale.getAddress(),
            ethers.parseEther('10000')
        )
        return { risitasSale, owner, otherAddr, otherAddr2, rizToken, risVesting };
    }


    it("should add beneficiary with tokens", async function () {
        const { risVesting, otherAddr } = await loadFixture(RisitasVestingFixture);
        await risVesting.addBeneficiary(otherAddr.address, ethers.parseEther("100"));
        const beneficiaryAmount = await risVesting.beneficiaryAmount(otherAddr.address);
        expect(beneficiaryAmount).to.equal(ethers.parseEther("100"));
    });

    it("should not add beneficiary with zero tokens", async function () {
        const { risVesting, otherAddr } = await loadFixture(RisitasVestingFixture);
        await risVesting.updateStartVesting();
        await expect(risVesting.addBeneficiary(otherAddr.address, 0)).to.be.revertedWithCustomError(risVesting,"NoTokensToVest");
    });

    it("should not add beneficiary when vesting started", async function () {
        const { risVesting, otherAddr } = await loadFixture(RisitasVestingFixture);
        await risVesting.updateStartVesting();
        expect(await risVesting.addBeneficiary(otherAddr.address, ethers.parseEther("100"))).to.be.revertedWithCustomError(risVesting,"VestingActive");
    });

    it("should release vested tokens", async function () {
        const { risVesting, otherAddr, rizToken} = await loadFixture(RisitasVestingFixture);
        await risVesting.addBeneficiary(otherAddr.address, ethers.parseEther("100"));
        await risVesting.updateStartVesting();

        setTimeout(async () => { 
            await risVesting.release(otherAddr.address);
            
            const beneficiaryAmount = await risVesting.beneficiaryAmount(otherAddr.address);
            expect(beneficiaryAmount).to.equal(0);
            
            const beneficiaryBalance = await rizToken.balanceOf(otherAddr.address);
            expect(beneficiaryBalance).to.equal(ethers.parseEther("100"));
        }, 1);
    });

    it("should not release tokens before vesting starts", async function () {
        const { risVesting, otherAddr } = await loadFixture(RisitasVestingFixture);
        
        await risVesting.addBeneficiary(otherAddr.address, ethers.parseEther("100"));
        await expect(risVesting.release(otherAddr.address)).to.be.revertedWithCustomError(risVesting, "VestingNotActive");
    });

    it("should not release tokens if no tokens to release", async function () {
        const { risVesting, otherAddr } = await loadFixture(RisitasVestingFixture);
        
        await risVesting.updateStartVesting();

        setTimeout(async () => { 
            await expect(risVesting.release(otherAddr.address)).to.be.revertedWithCustomError(risVesting, "NoTokensToRelease");
        }, 1);
    });
});
