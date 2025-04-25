import "dotenv/config";

import { createPublicClient, http, zeroAddress } from "viem";
import { optimism } from "viem/chains";

import {
  abi as previewerAbi,
  address as previewerAddress,
} from "@exactly/protocol/deployments/optimism/Previewer.json";
import {
  abi as ratePreviewerAbi,
  address as ratePreviewerAddress,
} from "@exactly/protocol/deployments/optimism/RatePreviewer.json";
import { floatingDepositRates } from "@exactly/lib";

const client = createPublicClient({
  chain: optimism,
  transport: http(process.env.OPTIMISM_RPC_URL),
});

async function main() {
  try {
    const exactly = (await client.readContract({
      address: previewerAddress as `0x${string}`,
      abi: previewerAbi,
      functionName: "exactly",
      args: [zeroAddress],
    })) as any;

    const markets = Object.fromEntries(
      exactly.map(({ market, symbol }: any) => [market, symbol])
    );

    console.log("markets", markets);

    const snapshot = (await client.readContract({
      address: ratePreviewerAddress as `0x${string}`,
      abi: ratePreviewerAbi,
      functionName: "snapshot",
      args: [],
    })) as any;

    console.log("floating deposit rates");
    console.log(
      floatingDepositRates(snapshot).map(({ market, rate }: any) => ({
        market: markets[market],
        rate: Number(rate) / 1e16,
      }))
    );
    console.log("--------------------------------");

    console.log("floating borrow rates");
    console.log(
      snapshot.map(({ market, floatingRate }: any) => ({
        market: markets[market],
        rate: Number(floatingRate) / 1e16,
      }))
    );

    console.log("fixed borrow rates");
    for (const { market, fixedPools } of exactly) {
      console.log("--------------------------------");
      console.log(markets[market]);
      console.log(
        fixedPools.map(({ maturity, minBorrowRate, depositRate }: any) => ({
          maturity: new Date(Number(maturity) * 1000).toISOString(),
          minBorrowRate: Number(minBorrowRate) / 1e16,
          depositRate: Number(depositRate) / 1e16,
        }))
      );
    }
  } catch (error) {
    console.error(error);
  }
}

main();
