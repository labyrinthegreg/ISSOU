import {
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("RIZToken", function () { 
    async function RIZTokenFixture() { 
        const [ owner, otherAddr, otherAddr2 ] = await ethers.getSigners();
        const RIZToken = await ethers.getContractFactory("RIZToken");
        const rizToken = await RIZToken.deploy();
        return { rizToken, owner, otherAddr, otherAddr2 };
    }

    describe("Deployment", function () { 
        it("Should set the right owner", async function () {
            const { rizToken, owner } = await loadFixture(RIZTokenFixture)
            expect(await rizToken.owner()).to.equal(owner.address)
        })
        it("Should set the right initial amount", async function () {
            const { rizToken } = await loadFixture(RIZTokenFixture)
            const totalSupply = await rizToken.totalSupply()
            expect(totalSupply).equal(ethers.parseEther("10000"))
        }) 
        it("Should assign the total supply of tokens to the owner", async function () {
            const { rizToken, owner } = await loadFixture(RIZTokenFixture)
            const ownerBalance = await rizToken.balanceOf(owner.address);
            expect(await rizToken.totalSupply()).to.equal(ownerBalance);
        });
    });
    describe("Transactions", function () {
        it("Should transfer tokens between accounts", async function () {
            const { rizToken, owner, otherAddr, otherAddr2 } = await loadFixture(RIZTokenFixture)

            // Transfer 50 tokens from owner to otherAddr
            await rizToken.transfer(otherAddr.address, 50);
            const addr1Balance = await rizToken.balanceOf(otherAddr.address);
            expect(addr1Balance).to.equal(50);

            // Transfer 50 tokens from otherAddr to addr2
            // We use .connect(signer) to send a transaction from another account
            await rizToken.connect(otherAddr).transfer(otherAddr2.address, 50);
            const addr2Balance = await rizToken.balanceOf(otherAddr2.address);
            const addr1Balance2 = await rizToken.balanceOf(otherAddr.address)
            const ownerBalance = await rizToken.balanceOf(owner.address)
            expect(addr2Balance).to.equal(50);
            expect(addr1Balance2).to.equal(0)
            expect(ownerBalance).to.equal(ethers.parseEther("10000") - BigInt(50))
        });
    })

});
