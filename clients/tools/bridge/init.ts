import { EthConfig } from "delphinus-deployment/src/config";
import { L1Client, withL1Client } from "../../client";
import { encodeL1address } from "web3subscriber/src/addresses";

const Tokens = require("./tokenlist");
const Secrets = require("../../.secrets");
const fs = require("fs");
const path = require("path");

function crunchTokens() {
  return Tokens.tokenInfo
    .filter((x: any) => x.address)
    .map((x: any) =>
    encodeL1address(x.address, parseInt(x.chainId).toString(16))
    );
}

async function main(config_name: string) {
  console.log("start calling");
  let config = EthConfig[config_name](Secrets);
  try {
    withL1Client(config, false, async (l1client: L1Client) => {
      let bridge = l1client.getBridgeContract();
      let output: any = {};
      let index = 4;

      console.log("Testing bridge [id=%s]", l1client.getChainIdHex());
      for (let tokenUid of crunchTokens()) {
        console.log("Adding token uid: 0x", tokenUid.toString(16));
        let tx = await bridge.addToken(tokenUid);
        console.log(tx);

        output[tokenUid] = index++;
      }

      fs.writeFileSync(
        path.resolve(__dirname, "..", "token-index.json"),
        JSON.stringify(output, undefined, 2)
      );

      let info = await bridge.getBridgeInfo();
      console.log("bridge info is", info);
      let tokens = await bridge.allTokens();
      console.log("token list is", tokens);
    });
  } catch (err) {
    console.log("%s", err);
  }
}

main(process.argv[2]);
