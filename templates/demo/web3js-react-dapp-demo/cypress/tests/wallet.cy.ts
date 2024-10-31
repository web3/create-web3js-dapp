import { getNetwork } from "../fixtures/contractsData";
import { accountsSection } from "../support/page-objects/accountsSection";
import { connectProviderSection } from "../support/page-objects/connectProviderSection";
import { networkSection } from "../support/page-objects/networkSection";
import { CustomBridge } from "../support/utils/CustomBridge";

describe("Wallet", () => {
  context("desktop", () => {
    const network = getNetwork("11155111");
    beforeEach(() => {
      cy.loginWithWallet(network);
    });

    it("connect a wallet", () => {
      connectProviderSection.connectProviderButton().click();
      networkSection.chainIdLabel().should("have.text", network.chainId);
      networkSection.networkIdLabel().should("have.text", network.chainId);

      cy.window()
        .its("ethereum")
        .then(async (customBridge: CustomBridge) => {
          accountsSection
            .addressLabel()
            .should("have.text", customBridge.wallet.address);

          const balance = await customBridge.getBalance();
          let actualBalance: string;
          if (balance === "0.") {
            actualBalance = "0";
          } else {
            actualBalance = parseFloat(balance).toFixed(14);
          }
          accountsSection.balanceLabel().should("contain.text", actualBalance);
        });
    });
  });
});
