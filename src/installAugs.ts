import { NS } from '@ns';

export async function main(ns: NS) {
  // IDEA upgrade home server and install Neuroflux Governer first
  if (ns.singularity.exportGameBonus()) ns.singularity.exportGame();
  ns.singularity.installAugmentations('startup.js');
}
