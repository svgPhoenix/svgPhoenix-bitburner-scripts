import { NS } from '@ns';
import { factionNames } from './phoenixLib';
// IDEA augPurchaseWorker

export async function main(ns: NS) {
  let factionsHaveRemainingAugs: boolean[] = new Array(factionNames.length);
  factionsHaveRemainingAugs.fill(true);
  while (true) {
    const ownedAugs = ns.singularity.getOwnedAugmentations(true);
    for (let index in factionNames) {
      const name = factionNames[index],
        factionAugs = ns.singularity.getAugmentationsFromFaction(name),
        unOwnedAugs = factionAugs.filter((x) => !ownedAugs.includes(x));
      if (unOwnedAugs.length == 0) {
        factionsHaveRemainingAugs[index] = false;
        continue;
      }
    }
    await ns.sleep(10e3); // 5 seconds
  }

  /**
   *
   * @param {string[]} augNames
   * @returns {[string, boolean]} [nameOfMostExpensiveAug, canAfford]
   */
  function getMostExpensiveAugment(augNames: string[]): [string, boolean] {
    for (let augName of augNames) {
    }
  }
}
