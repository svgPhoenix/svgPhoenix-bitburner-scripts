import { NS } from '@ns';
import { factionNames, factionNamesAutofill } from './phoenixLib';

export async function main(ns: NS) {
  if (typeof ns.args[0] != 'string') {
    ns.tprint('ERROR: arg not a string');
    return;
  }
  if (!factionNames.includes(ns.args[0])) {
    ns.tprint('ERROR: not a faction');
    return;
  }
  const hostname = ns.args[0],
    factionAugs = ns.singularity.getAugmentationsFromFaction(hostname),
    ownedAugs = ns.singularity.getOwnedAugmentations(true),
    unOwnedAugs = factionAugs.filter((x) => !ownedAugs.includes(x));
  let toPrint =
    '\n\nOwned Augs:\n' + ownedAugs.join('\n') + '\n\nFaction Augs:\n' + factionAugs.join('\n') + '\n\nUnowned Augs:\n';
  for (const aug of unOwnedAugs) {
    toPrint += aug + ':\n';
    const stats = ns.singularity.getAugmentationStats(aug);
    for (const property in stats) {
      const stat = (stats as any)[property];
      if (stat == 1) continue;
      toPrint += '  ' + property + ' * ' + stat + '\n';
    }
  }
  toPrint += '\n\n';
  ns.tprint(toPrint);
}

export function autocomplete(data: any, args: any) {
  return factionNamesAutofill;
}
