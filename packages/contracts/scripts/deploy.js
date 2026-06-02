import hre from "hardhat";

async function main() {
  const BaseSeasons = await hre.ethers.getContractFactory("BaseSeasons");
  const baseSeasons = await BaseSeasons.deploy();

  await baseSeasons.waitForDeployment();

  console.log("BaseSeasons deployed to:", await baseSeasons.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
