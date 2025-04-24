import "dotenv/config";

import { createPublicClient, http } from "viem";
import { optimism } from "viem/chains";

import {
  abi,
  address,
} from "@exactly/protocol/deployments/optimism/RatePreviewer.json";
import { floatingDepositRates } from "@exactly/lib";

const client = createPublicClient({
  chain: optimism,
  transport: http(process.env.OPTIMISM_RPC_URL),
});

async function main() {
  try {
    const snapshot = await client.readContract({
      address: address as `0x${string}`,
      abi: abi,
      functionName: "snapshot",
      args: [],
    });

    console.log("floating deposit rates");
    console.log(floatingDepositRates(snapshot as any));
    console.log("--------------------------------");
  } catch (error) {
    console.error(error);
  }
}

main();
