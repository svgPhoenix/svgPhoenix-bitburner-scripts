import { NS } from '@ns';

export async function main(ns: NS) {
  if (!ns.hasTorRouter()) if (!ns.singularity.purchaseTor()) return;
  for (const name of ns.singularity.getDarkwebPrograms()) {
    const cost = ns.singularity.getDarkwebProgramCost(name);
    if (cost == 0 || cost == -1) {
      continue;
    } else if (cost < ns.getPlayer().money) {
      ns.singularity.purchaseProgram(name);
      ns.tprint('Purchased:    ' + name);
    } else [ns.tprint('Unaffordable: ' + name)];
  }
}
