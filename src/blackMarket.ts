import { NS } from '@ns';

export async function main(ns: NS) {
  if (!ns.hasTorRouter()) ns.singularity.purchaseTor();
  for (const name of ns.singularity.getDarkwebPrograms()) {
    if (ns.singularity.getDarkwebProgramCost(name) < ns.getPlayer().money) {
      ns.singularity.purchaseProgram(name);
      ns.tprint('Purchased:    ' + name);
    } else [ns.tprint('Unaffordable: ' + name)];
  }
}
