import {
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("RisitasSale", function () {
    async function RisitasSaleFixture() {
        const [owner, otherAddr, otherAddr2] = await ethers.getSigners();
        const RIZToken = await ethers.getContractFactory("RIZToken");
        const rizToken = await RIZToken.deploy();
        const RisitasSale = await ethers.getContractFactory("RisitasSale");
        const risitasSale = await RisitasSale.deploy(10, rizToken);
        return { risitasSale, owner, otherAddr, otherAddr2, rizToken };
    }

    describe("Deployment", function () {
        it("Should get right owner and token", async function () {
            const { risitasSale, owner, rizToken} = await loadFixture(RisitasSaleFixture)
            expect(await risitasSale.wallet()).to.equal(owner)
            expect(await risitasSale.token()).equal(rizToken)            
        })
        it("Should get the right rate with ether", async function () {
            const { risitasSale } = await loadFixture(RisitasSaleFixture)
            expect(await risitasSale.rate()).equal(10)            
        })
        it("Should have 0 etherRaised and sale isn't closed", async function () {
            const { risitasSale } = await loadFixture(RisitasSaleFixture)
            expect(await risitasSale.etherRaised()).equal(0)            
            expect(await risitasSale.getIsSaleClosed()).false            
        })
    })

    describe("Buy Token", function () {
        it("Should add ethers and emit TokenPurchase", async function () {
            const { risitasSale, otherAddr, rizToken } = await loadFixture(RisitasSaleFixture)


            await rizToken.transfer(
                await risitasSale.getAddress(),
                ethers.parseEther('100')
            )

            await expect(await risitasSale.connect(otherAddr).buyTokens({ value: ethers.parseEther("5") })).to.emit(risitasSale ,"TokenPurchase")
            
            expect(ethers.formatEther(await risitasSale.etherRaised())).equal('5.0')
        })
        it("Only owner can close the sale", async function () {
            const { risitasSale, owner, otherAddr } = await loadFixture(RisitasSaleFixture)

            risitasSale.connect(otherAddr)

            expect(await risitasSale.closeSale()).to.be.revertedWithCustomError(risitasSale, "OwnableUnauthorizedAccount")

            await expect(await risitasSale.connect(owner).closeSale()).to.emit(risitasSale, "SaleUpdated")
            expect(await risitasSale.getIsSaleClosed()).true
        })
        it("Can't buy tokens with 0 ethers", async function () {
            const { risitasSale, otherAddr, rizToken } = await loadFixture(RisitasSaleFixture)

            await rizToken.transfer(
                await risitasSale.getAddress(),
                ethers.parseEther('100')
            )

            risitasSale.connect(otherAddr)

            await expect(risitasSale.buyTokens({ value: ethers.parseEther('0') })).to.be.revertedWithCustomError(risitasSale ,"NoEtherError")
        })
        it("Can't buy tokens if sale is closed", async function () {
            const { risitasSale, otherAddr, rizToken } = await loadFixture(RisitasSaleFixture)

            await risitasSale.closeSale()

            await rizToken.transfer(
                await risitasSale.getAddress(),
                ethers.parseEther('100')
            )

            risitasSale.connect(otherAddr)

            await expect(risitasSale.buyTokens({ value: ethers.parseEther('5') })).to.be.revertedWithCustomError(risitasSale ,"SaleNotActive")
        })
    })
})