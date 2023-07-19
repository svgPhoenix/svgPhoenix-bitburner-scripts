import { NS } from '@ns';

export async function main(ns: NS) {
  if (ns.singularity.exportGameBonus()) ns.singularity.exportGame();
  ns.singularity.installAugmentations('startup.js');
}
